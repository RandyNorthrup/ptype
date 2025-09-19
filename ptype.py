"""
P-Type - The Typing Game
Version: 1.0.0
A sleek, modern typing game for programmers and typing enthusiasts with fully responsive UI.

Features:
- Fully responsive UI that adapts to any window size while maintaining portrait aspect ratio
- Modern UI with smooth animations and 3D-style ship graphics
- Normal mode with standard English dictionary words
- Programming training mode with 7 languages (Python, JavaScript, Java, C#, C++, CSS, HTML)
- Boss battles with challenging words at the end of each level
- 20 difficulty levels with progressive speed (20-300 WPM)
- Ship collision mechanics with visual effects
- High scores and detailed statistics tracking
- Customizable audio settings
- Smart dropdown menus with scrolling support
- Full keyboard support including special characters
- Window resize support with automatic UI recalculation
- Consistent centering and spacing across all window sizes
"""

import pygame
import pygame
import random
import sys
import os
import json
import math
from enum import Enum
from typing import List, Dict, Tuple, Optional, Any
from dataclasses import dataclass

# Force proper Windows windowing
os.environ['SDL_VIDEO_WINDOW_POS'] = 'centered'
os.environ['SDL_VIDEO_CENTERED'] = '1'
os.environ['SDL_VIDEODRIVER'] = 'windows'  # Force Windows video driver
os.environ['SDL_VIDEO_ALLOW_SCREENSAVER'] = '1'

# Version Information
VERSION = "1.0.0"
VERSION_NAME = "Launch Edition"
RELEASE_DATE = "2025-01-19"

# Initialize Pygame
pygame.init()
pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)

# Modern Constants
SCREEN_WIDTH = 600  # Fixed width for typing game - never changes
SCREEN_HEIGHT = 800  # Default height
MIN_WINDOW_WIDTH = 600  # Same as SCREEN_WIDTH since width is fixed
MIN_WINDOW_HEIGHT = 800  # Minimum height for all UI elements to fit properly
FPS = 60
MAX_LEVELS = 20
MAX_WPM = 300
BASE_WPM = 20
MAX_MISSED_SHIPS = 3

# Modern Color Palette
DARK_BG = (8, 12, 20)
DARKER_BG = (4, 6, 12)
ACCENT_BLUE = (45, 156, 255)
ACCENT_CYAN = (0, 255, 255)
ACCENT_PURPLE = (138, 43, 226)
ACCENT_GREEN = (50, 255, 150)
ACCENT_ORANGE = (255, 165, 0)
ACCENT_RED = (255, 69, 69)
ACCENT_YELLOW = (255, 235, 59)

MODERN_WHITE = (240, 248, 255)
MODERN_GRAY = (160, 172, 190)
MODERN_DARK_GRAY = (64, 71, 86)
MODERN_LIGHT = (200, 210, 225)

# Gradients and effects
NEON_BLUE = (0, 191, 255)
NEON_PINK = (255, 20, 147)
NEON_GREEN = (57, 255, 20)

# Performance constants
TWINKLE_MULTIPLIER = 0.1
PARTICLE_DRAG = 0.98
PARTICLE_GRAVITY = 0.1

class GameMode(Enum):
    PROFILE_SELECT = "profile_select"
    MENU = "menu"
    NORMAL = "normal"
    PROGRAMMING = "programming"
    PAUSE = "pause"
    GAME_OVER = "game_over"
    STATS = "stats"
    SETTINGS = "settings"
    ABOUT = "about"

class ProgrammingLanguage(Enum):
    PYTHON = "Python"
    JAVA = "Java"
    JAVASCRIPT = "JavaScript"
    CSHARP = "C#"
    CPLUSPLUS = "C++"
    CSS = "CSS"
    HTML = "HTML"

class WordDictionary:
    """Comprehensive progressive word dictionaries with difficulty-based selection"""
    
    # Boss words for each level - extra challenging
    BOSS_WORDS = {
        'normal': {
            'beginner': [
                "wonderful", "beautiful", "important", "different", "together", "remember",
                "something", "everything", "anything", "someone", "everyone", "children"
            ],
            'intermediate': [
                "relationship", "environment", "opportunity", "information", "government", "organization",
                "investigation", "communication", "transportation", "administration", "understanding",
                "responsibility", "characteristics", "representative", "international", "professional"
            ],
            'advanced': [
                "entrepreneurship", "interdisciplinary", "characteristics", "administration", "representative",
                "internationalization", "professionalization", "institutionalization", "constitutionalization",
                "antidisestablishmentarianism", "pneumonoultramicroscopicsilicovolcanoconiosis",
                "supercalifragilisticexpialidocious", "pseudopseudohypoparathyroidism"
            ]
        },
        'programming': {
            ProgrammingLanguage.PYTHON: {
                'beginner': [
                    "print('hello world')", "for i in range(10):", "if x > 5:", "def my_function():",
                    "import sys", "list.append(item)", "str.split(',')", "len(my_list)"
                ],
                'intermediate': [
                    "async def fetch_data(session, url):", "[item for item in data if item.active]",
                    "try: result = process() except Exception as e: logger.error(f'Error: {e}')",
                    "from typing import List, Dict, Optional, Union, Callable"
                ],
                'advanced': [
                    "@dataclasses.dataclass(frozen=True, slots=True)",
                    "async with aiohttp.ClientSession() as session: response = await session.get(url)",
                    "lambda x: functools.reduce(operator.add, [item**2 for item in x if item > 0], 0)",
                    "class MetaClass(type): def __new__(cls, name, bases, attrs): return super().__new__(cls, name, bases, attrs)"
                ]
            },
            ProgrammingLanguage.JAVASCRIPT: {
                'beginner': [
                    "console.log('hello')", "function myFunction()", "if (x > 5)", "for (let i = 0; i < 10; i++)",
                    "const name = 'John'", "array.length", "document.getElementById('id')", "Math.random()"
                ],
                'intermediate': [
                    "const promise = new Promise((resolve, reject) => { /* async work */ })",
                    "fetch('/api/data').then(response => response.json()).catch(console.error)",
                    "const [state, setState] = React.useState(initialValue)",
                    "Object.keys(obj).reduce((acc, key) => ({ ...acc, [key]: transform(obj[key]) }), {})"
                ],
                'advanced': [
                    "const memoizedCallback = React.useCallback(() => { doSomething(a, b); }, [a, b])",
                    "class AsyncIterator { async *[Symbol.asyncIterator]() { yield* this.items; } }",
                    "const proxy = new Proxy(target, { get(obj, prop) { return prop in obj ? obj[prop] : 'default'; } })",
                    "export default React.memo(({ items, onSelect }) => items.map(item => <Item key={item.id} {...item} onClick={() => onSelect(item)} />))"
                ]
            },
            ProgrammingLanguage.JAVA: {
                'beginner': [
                    "System.out.println('Hello')", "public class MyClass", "if (x > 5)", "for (int i = 0; i < 10; i++)",
                    "String name = 'John'", "new ArrayList<>()", "list.size()", "Math.random()"
                ],
                'intermediate': [
                    "@Override public String toString() { return this.name; }",
                    "try (Scanner scanner = new Scanner(System.in)) { /* auto-close */ }",
                    "List<String> result = stream.filter(s -> s.length() > 5).collect(Collectors.toList())",
                    "@Autowired private UserService userService;"
                ],
                'advanced': [
                    "@RestController public class ApiController { @GetMapping('/api/users') public List<User> getUsers() { return userService.findAll(); } }",
                    "CompletableFuture.supplyAsync(() -> expensiveOperation()).thenCompose(result -> processResult(result))",
                    "Optional.ofNullable(getValue()).map(String::toUpperCase).filter(s -> s.startsWith('PREFIX')).orElse('default')",
                    "@Entity @Table(name = 'users') public class User { @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; }"
                ]
            },
            ProgrammingLanguage.CSHARP: {
                'beginner': [
                    "Console.WriteLine('Hello');", "public class MyClass", "if (x > 5)", "for (int i = 0; i < 10; i++)",
                    "string name = 'John';", "new List<string>()", "list.Count", "Math.Random()"
                ],
                'intermediate': [
                    "public async Task<string> GetDataAsync() { return await httpClient.GetStringAsync(url); }",
                    "public record Person(string Name, int Age);",
                    "var config = new ConfigurationBuilder().AddJsonFile('appsettings.json').Build();",
                    "services.AddScoped<IUserService, UserService>();"
                ],
                'advanced': [
                    "[HttpGet('api/users/{id:int}')] public async Task<ActionResult<User>> GetUser(int id) { return await userService.GetByIdAsync(id); }",
                    "await foreach (var item in GetAsyncEnumerable()) { await ProcessItemAsync(item); }",
                    "var result = list?.Where(x => x.IsActive)?.Select(x => new { x.Id, x.Name }).ToList() ?? new List<object>();",
                    "public class User { [Key] public int Id { get; init; } [Required] [MaxLength(100)] public string Name { get; init; } }"
                ]
            },
            ProgrammingLanguage.CPLUSPLUS: {
                'beginner': [
                    "std::cout << 'Hello';", "#include <iostream>", "if (x > 5)", "for (int i = 0; i < 10; i++)",
                    "std::string name;", "std::vector<int> numbers", "numbers.size()", "std::endl"
                ],
                'intermediate': [
                    "template<typename T> class SmartPointer { std::unique_ptr<T> ptr; };",
                    "auto lambda = [](const auto& x) -> decltype(x + 1) { return x + 1; };",
                    "std::async(std::launch::async, []() { return computeExpensive(); })",
                    "constexpr auto factorial(int n) -> int { return n <= 1 ? 1 : n * factorial(n-1); }"
                ],
                'advanced': [
                    "template<typename... Args> void variadic_print(Args&&... args) { ((std::cout << args << ' '), ...); }",
                    "concept Addable = requires(T a, T b) { { a + b } -> std::convertible_to<T>; };",
                    "class RAII_Resource { std::unique_ptr<Resource, CustomDeleter> resource; public: ~RAII_Resource() = default; };",
                    "std::vector<std::future<Result>> futures; std::transform(tasks.begin(), tasks.end(), std::back_inserter(futures), [](auto&& task) { return std::async(std::launch::async, std::forward<decltype(task)>(task)); });"
                ]
            },
            ProgrammingLanguage.CSS: {
                'beginner': [
                    "color: red;", "background-color: blue;", "font-size: 16px;", "margin: 10px;",
                    "padding: 5px;", "display: block;", "width: 100%;", "height: 50px;"
                ],
                'intermediate': [
                    "@media (max-width: 768px) { .container { flex-direction: column; } }",
                    "display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;",
                    ":root { --primary-color: #3498db; --secondary-color: #2ecc71; }",
                    "animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);"
                ],
                'advanced': [
                    "@supports (display: grid) { .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } }",
                    "filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1);",
                    "clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);",
                    "transform: perspective(1000px) rotateX(20deg) translateZ(100px);"
                ]
            },
            ProgrammingLanguage.HTML: {
                'beginner': [
                    "<h1>Hello World</h1>", "<p>This is a paragraph.</p>", "<div class='container'>", "<a href='#'>Link</a>",
                    "<img src='image.jpg'>", "<button>Click me</button>", "<input type='text'>", "<ul><li>Item</li></ul>"
                ],
                'intermediate': [
                    "<picture><source media='(min-width: 800px)' srcset='large.jpg'><img src='small.jpg' alt='Description'></picture>",
                    "<video controls preload='metadata' poster='thumbnail.jpg'><source src='video.mp4' type='video/mp4'></video>",
                    "<details><summary>Expandable section</summary><p>Hidden content revealed on click</p></details>",
                    "<template id='user-template'><div class='user'><h3 class='name'></h3><p class='email'></p></div></template>"
                ],
                'advanced': [
                    "<script type='module'>import { Component } from './component.js'; customElements.define('my-component', Component);</script>",
                    "<dialog id='modal' aria-labelledby='modal-title' aria-describedby='modal-desc'><form method='dialog'><button>Close</button></form></dialog>",
                    "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='grad'><stop offset='0%' stop-color='#ff0000'/></linearGradient></defs></svg>",
                    "<web-component slot='header' data-theme='dark' :props='{ user: currentUser, onUpdate: handleUserUpdate }'></web-component>"
                ]
            }
        }
    }
    
    # Normal mode words organized by difficulty - Expanded English dictionary with 500+ words
    NORMAL_WORDS = {
        'beginner': [
            # Simple everyday words (3-5 letters) - 200+ words
            "cat", "dog", "car", "sun", "moon", "tree", "book", "home", "love", "time",
            "hand", "face", "blue", "red", "good", "nice", "come", "word", "work", "life",
            "play", "help", "look", "find", "tell", "make", "take", "give", "said", "water",
            "house", "light", "right", "small", "great", "place", "world", "where", "after", "back",
            "star", "fish", "bird", "bear", "wolf", "lion", "tiger", "eagle", "shark", "whale",
            "fire", "wind", "rain", "snow", "storm", "cloud", "night", "day", "year", "month",
            "week", "hour", "food", "drink", "sleep", "walk", "run", "jump", "swim", "fly",
            "read", "write", "draw", "sing", "dance", "laugh", "cry", "smile", "think", "know",
            "want", "need", "have", "use", "see", "hear", "feel", "touch", "taste", "smell",
            # Additional simple words
            "able", "about", "above", "act", "add", "age", "ago", "air", "all", "also",
            "any", "area", "arm", "art", "ask", "away", "baby", "bad", "ball", "bank",
            "base", "be", "beat", "bed", "been", "bell", "best", "big", "bill", "bit",
            "black", "block", "blood", "blow", "boat", "body", "bone", "born", "both", "box",
            "boy", "brain", "bread", "break", "bring", "build", "burn", "bus", "buy", "call",
            "came", "can", "card", "care", "carry", "case", "catch", "cause", "cell", "chair",
            "check", "child", "city", "claim", "class", "clean", "clear", "climb", "clock", "close",
            "club", "coat", "cold", "color", "cook", "cool", "copy", "corn", "cost", "could",
            "count", "cover", "cross", "cut", "dark", "data", "deal", "dear", "death", "deep",
            "desk", "die", "dirt", "dish", "do", "dock", "does", "done", "door", "down",
            "drag", "dream", "dress", "drive", "drop", "dry", "duck", "dust", "each", "ear",
            "early", "earth", "east", "easy", "eat", "edge", "egg", "eight", "end", "enemy",
            "enjoy", "enter", "even", "ever", "every", "exact", "eye", "fact", "fail", "fall",
            "far", "farm", "fast", "fat", "fear", "feed", "feet", "fell", "felt", "few",
            "field", "fight", "fill", "film", "final", "fine", "first", "fit", "five", "fix",
            "flag", "flat", "floor", "flow", "foot", "force", "form", "found", "four", "free",
            "fresh", "from", "front", "fruit", "full", "fun", "game", "gas", "gate", "gave",
            "get", "gift", "girl", "glad", "glass", "go", "goal", "gold", "gone", "got",
            "grab", "grade", "grand", "grass", "gray", "green", "grew", "group", "grow", "guard",
            "guess", "guide", "gun", "guy", "had", "hair", "half", "hall", "hang", "happy",
            "hard", "has", "hat", "hate", "head", "health", "heard", "heart", "heat", "heavy",
            "held", "here", "hero", "hide", "high", "hill", "him", "hit", "hold", "hole",
            "hope", "horse", "hot", "huge", "human", "hunt", "hurt", "ice", "idea", "image"
        ],
        'intermediate': [
            # Common English words (6-8 letters) - 200+ words
            "people", "family", "friend", "school", "student", "teacher", "office", "business",
            "moment", "reason", "result", "change", "number", "letter", "mother", "father",
            "sister", "brother", "question", "problem", "service", "history", "picture", "country",
            "between", "important", "example", "community", "development", "education", "different",
            "national", "special", "possible", "research", "increase", "company", "program",
            "computer", "software", "hardware", "network", "database", "internet", "website",
            "password", "username", "download", "upload", "install", "update", "delete",
            "security", "privacy", "backup", "restore", "system", "process", "memory",
            "storage", "display", "keyboard", "monitor", "printer", "scanner", "speaker",
            "battery", "charger", "adapter", "wireless", "connect", "disconnect", "transfer",
            # Additional intermediate words
            "ability", "absence", "academy", "account", "achieve", "acquire", "address", "advance",
            "adventure", "advice", "afford", "against", "airport", "alcohol", "already", "although",
            "amazing", "ancient", "animal", "another", "answer", "anxiety", "anybody", "anymore",
            "anyone", "anyway", "appear", "approach", "approve", "arrange", "arrival", "article",
            "artist", "assault", "attempt", "attend", "attract", "author", "average", "balance",
            "barrier", "battery", "beauty", "because", "become", "bedroom", "before", "believe",
            "benefit", "beside", "better", "bicycle", "billion", "biology", "blanket", "borrow",
            "bottom", "boundary", "breakfast", "breathe", "bridge", "brilliant", "budget", "building",
            "cabinet", "calendar", "camera", "campaign", "campus", "cancel", "cancer", "capable",
            "capital", "captain", "capture", "carbon", "career", "careful", "carrier", "catalog",
            "ceiling", "celebrate", "center", "central", "century", "certain", "chairman", "chamber",
            "champion", "channel", "chapter", "charge", "charity", "chicken", "choice", "choose",
            "citizen", "classic", "climate", "closest", "clothes", "coffee", "collect", "college",
            "combine", "comfort", "command", "comment", "common", "compare", "compete", "complete",
            "complex", "concept", "concern", "concert", "conduct", "confirm", "conflict", "congress",
            "consider", "consist", "constant", "contact", "contain", "content", "contest", "context",
            "continue", "contract", "control", "convert", "cooking", "correct", "council", "counter",
            "courage", "course", "cousin", "create", "credit", "criminal", "critical", "culture",
            "curious", "current", "customer", "damage", "danger", "daughter", "dealing", "debate",
            "decade", "decide", "declare", "decline", "decorate", "decrease", "default", "defense",
            "deficit", "deliver", "demand", "density", "depend", "deposit", "describe", "desert",
            "design", "desktop", "despite", "destroy", "detail", "detect", "develop", "device",
            "diagram", "diamond", "digital", "dinner", "direct", "disable", "disagree", "disaster",
            "discover", "discuss", "disease", "dismiss", "dispute", "distance", "district", "disturb",
            "diverse", "divide", "doctor", "document", "dollar", "domain", "domestic", "dominant",
            "double", "downtown", "drawing", "dynamic", "eastern", "economy", "edition", "educate",
            "effect", "effort", "element", "elevator", "embrace", "emerge", "emotion", "emperor",
            "employ", "enable", "encourage", "enforce", "engage", "engine", "enhance", "enormous",
            "enough", "ensure", "entire", "entrance", "episode", "equation", "equipment", "escape"
        ],
        'advanced': [
            # Complex English words (9+ letters) - 150+ words
            "beautiful", "wonderful", "necessary", "important", "experience", "understand",
            "political", "newspaper", "character", "community", "television", "knowledge",
            "education", "government", "development", "management", "organization", "information",
            "relationship", "environment", "traditional", "international", "responsibility",
            "opportunity", "transportation", "communication", "investigation", "appreciation",
            "administration", "representative", "characteristics", "entrepreneurship", "interdisciplinary",
            "cryptocurrency", "blockchain", "artificial", "intelligence", "algorithm", "optimization",
            "authentication", "authorization", "implementation", "architecture", "infrastructure",
            "configuration", "documentation", "collaboration", "visualization", "virtualization",
            "synchronization", "asynchronous", "multithreading", "microservices", "containerization",
            "orchestration", "scalability", "availability", "reliability", "maintainability",
            # Additional advanced words
            "absolutely", "acceptance", "accessible", "accomplish", "accordance", "accountable",
            "achievement", "acknowledge", "acquisition", "adaptation", "additional", "adjustment",
            "admiration", "administrative", "adolescent", "advantage", "advertisement", "affordable",
            "aggressive", "agricultural", "alternative", "ambassador", "ammunition", "anniversary",
            "announcement", "anonymous", "anticipate", "apartment", "apologize", "appearance",
            "applicable", "application", "appointment", "appropriate", "approximately", "arbitrary",
            "archaeological", "arrangement", "assessment", "assignment", "assistance", "association",
            "assumption", "atmosphere", "attachment", "attendance", "attention", "attractive",
            "attribute", "authentic", "automobile", "autonomous", "availability", "background",
            "basketball", "battlefield", "beginning", "behavioral", "beneficial", "biography",
            "biological", "breathtaking", "broadcasting", "bureaucracy", "calculation", "calibration",
            "cancellation", "capability", "capitalism", "catastrophe", "celebration", "certificate",
            "championship", "characteristic", "circumstance", "citizenship", "civilization", "classification",
            "collaboration", "combination", "comfortable", "commitment", "commissioner", "commonwealth",
            "communicate", "comparison", "compassion", "compatible", "compensation", "competition",
            "competitive", "complement", "completely", "complexity", "compliance", "component",
            "comprehensive", "compromise", "concentration", "conceptual", "conclusion", "conditional",
            "conference", "confidence", "confidential", "confirmation", "confrontation", "congratulations",
            "connection", "conscience", "consciousness", "consequence", "conservation", "considerable",
            "consideration", "consistency", "constitution", "construction", "consultation", "consumption",
            "contemporary", "continental", "continuation", "contribution", "controversial", "conversation",
            "cooperation", "coordinate", "corporation", "correlation", "correspondence", "countryside",
            "creativity", "credential", "cultivation", "curiosity", "curriculum", "customization",
            "declaration", "decoration", "dedication", "definition", "delegation", "deliberate",
            "delightful", "democratic", "demographic", "demonstrate", "denomination", "department",
            "dependence", "deployment", "depression", "description", "destination", "destruction",
            "determination", "devastating", "developer", "dictionary", "difference", "difficulty",
            "dimension", "diplomatic", "directory", "disability", "disadvantage", "disagreement",
            "disappointment", "discipline", "disclosure", "discrimination", "discussion", "distribution"
        ]
    }
    
    PROGRAMMING_WORDS = {
        ProgrammingLanguage.PYTHON: {
            'beginner': [
                # Basic Python keywords and simple concepts (80+ items)
                "if", "else", "elif", "for", "in", "is", "and", "or", "not", "def",
                "try", "int", "str", "len", "sum", "max", "min", "abs", "pow", "bool",
                "list", "dict", "set", "tuple", "range", "print", "input", "open", "read", "write",
                "True", "False", "None", "pass", "break", "continue", "return", "import", "from", "as",
                "while", "del", "with", "class", "self", "type", "help", "dir", "id", "hex",
                "bin", "oct", "chr", "ord", "round", "float", "complex", "bytes", "bytearray", "memoryview",
                "file", "close()", "seek()", "tell()", "flush()", "next", "iter", "vars", "exec", "eval",
                "globals()", "locals()", "compile", "hash", "repr", "ascii", "format", "slice", "object", "super",
                "property", "staticmethod", "classmethod", "callable", "divmod", "isinstance", "issubclass", "hasattr", "getattr", "setattr"
            ],
            'intermediate': [
                # Common Python patterns and built-ins (80+ items)
                "__init__", "__str__", "__repr__", "__len__", "__getitem__", "__setitem__", "__delitem__", "__contains__",
                "__iter__", "__next__", "__enter__", "__exit__", "__call__", "__new__", "__del__", "__eq__",
                "@property", "@staticmethod", "@classmethod", "@functools.cache", "@contextmanager", "@dataclass",
                "lambda x: x", "yield", "yield from", "except Exception:", "finally:", "raise", "assert", "global",
                "nonlocal", "enumerate()", "zip()", "map()", "filter()", "sorted()", "reversed()", "any()", "all()",
                "split()", "join()", "replace()", "strip()", "lstrip()", "rstrip()", "upper()", "lower()", "capitalize()",
                "startswith()", "endswith()", "find()", "rfind()", "index()", "rindex()", "count()", "append()", "extend()",
                "insert()", "remove()", "pop()", "clear()", "copy()", "sort()", "reverse()", "keys()", "values()", "items()",
                "get()", "setdefault()", "update()", "fromkeys()", "add()", "discard()", "union()", "intersection()",
                "difference()", "symmetric_difference()", "issubset()", "issuperset()", "isdisjoint()"
            ],
            'advanced': [
                # Advanced Python concepts and libraries (80+ items)
                "async def", "await", "async for", "async with", "asyncio.run()", "asyncio.create_task()",
                "f'{variable}'", "f'{value:.2f}'", "r'raw string'", "b'bytes'", "u'unicode'",
                "[x for x in range(10)]", "[x**2 for x in data if x > 0]", "{k: v for k, v in items()}",
                "(x for x in range(1000))", "*args, **kwargs", "func(*args, **kwargs)",
                "if __name__ == '__main__':", "with open('file.txt') as f:", "with lock:",
                "try: except Exception as e: finally:", "try: except (ValueError, TypeError):",
                "from typing import List, Dict, Optional", "from typing import Union, Tuple, Any",
                "from collections import defaultdict, Counter", "from itertools import chain, cycle",
                "from functools import reduce, partial", "from pathlib import Path",
                "@functools.wraps", "@functools.lru_cache(maxsize=128)", "@functools.singledispatch",
                "collections.namedtuple()", "collections.deque()", "collections.OrderedDict()",
                "itertools.product()", "itertools.combinations()", "itertools.permutations()",
                "json.loads(data)", "json.dumps(obj, indent=2)", "pickle.dump()", "pickle.load()",
                "re.compile(r'pattern')", "re.search()", "re.findall()", "re.sub()",
                "datetime.now()", "datetime.strptime()", "timedelta(days=1)",
                "os.path.join()", "os.environ.get()", "sys.argv", "sys.exit()",
                "subprocess.run()", "threading.Thread()", "multiprocessing.Process()",
                "requests.get(url)", "requests.post(url, json=data)",
                "pandas.DataFrame(data)", "df.groupby()", "df.merge()", "df.pivot_table()",
                "numpy.array([1, 2, 3])", "np.zeros()", "np.ones()", "np.linspace()",
                "plt.plot()", "plt.scatter()", "plt.bar()", "plt.show()",
                "@pytest.fixture", "@pytest.mark.parametrize", "unittest.TestCase",
                "logging.info()", "logging.error()", "logging.basicConfig()"
            ]
        },
        
        ProgrammingLanguage.JAVASCRIPT: {
            'beginner': [
                # Basic JavaScript keywords and concepts (80+ items)
                "var", "let", "const", "if", "else", "else if", "for", "while", "do", "break",
                "continue", "return", "switch", "case", "default", "function", "class", "new",
                "this", "true", "false", "null", "undefined", "typeof", "instanceof", "delete",
                "in", "of", "void", "yield", "debugger", "with", "throw", "try", "catch", "finally",
                "string", "number", "boolean", "object", "array", "symbol", "bigint",
                "console.log()", "console.error()", "console.warn()", "console.info()",
                "alert()", "prompt()", "confirm()", "parseInt()", "parseFloat()", "isNaN()",
                "isFinite()", "Number()", "String()", "Boolean()", "Array()", "Object()",
                "length", "push()", "pop()", "shift()", "unshift()", "slice()", "splice()",
                "concat()", "join()", "reverse()", "sort()", "indexOf()", "lastIndexOf()",
                "includes()", "find()", "findIndex()", "charAt()", "charCodeAt()",
                "substring()", "substr()", "toLowerCase()", "toUpperCase()", "trim()",
                "replace()", "split()", "match()", "search()"
            ],
            'intermediate': [
                # Common JavaScript patterns and methods (80+ items)
                "function() {}", "() => {}", "async function", "async () => {}", "await",
                "promise", "then()", "catch()", "finally()", "Promise.resolve()", "Promise.reject()",
                "Promise.all()", "Promise.race()", "Promise.allSettled()", "callback",
                "forEach()", "map()", "filter()", "reduce()", "reduceRight()", "some()", "every()",
                "flat()", "flatMap()", "from()", "keys()", "values()", "entries()",
                "JSON.parse()", "JSON.stringify()", "localStorage", "sessionStorage",
                "localStorage.getItem()", "localStorage.setItem()", "localStorage.removeItem()",
                "setTimeout()", "setInterval()", "clearTimeout()", "clearInterval()",
                "Math.max()", "Math.min()", "Math.abs()", "Math.floor()", "Math.ceil()",
                "Math.round()", "Math.random()", "Math.pow()", "Math.sqrt()", "Math.PI", "Math.E",
                "Date.now()", "new Date()", "getTime()", "getFullYear()", "getMonth()", "getDate()",
                "getHours()", "getMinutes()", "getSeconds()", "toISOString()", "toLocaleDateString()",
                "RegExp", "test()", "exec()",
                "document", "window", "document.getElementById()", "document.querySelector()",
                "document.querySelectorAll()", "document.createElement()", "addEventListener()",
                "removeEventListener()", "preventDefault()", "stopPropagation()",
                "innerHTML", "innerText", "textContent", "value", "style", "classList",
                "classList.add()", "classList.remove()", "classList.toggle()", "classList.contains()"
            ],
            'advanced': [
                # Advanced JavaScript and modern features (80+ items)
                "const { name, age } = person", "const [first, ...rest] = array",
                "const { ...spread } = object", "[...array]", "{ ...object }",
                "import { Component } from 'react'", "export default", "export const",
                "import * as module from 'module'", "dynamic import()",
                "class MyClass extends BaseClass", "constructor() { super() }",
                "static method()", "get property()", "set property(value)",
                "#privateField", "#privateMethod()", "Symbol.iterator", "Symbol.asyncIterator",
                "async function* generator()", "yield*", "for await...of",
                "new Promise((resolve, reject) => {})", "Promise.withResolvers()",
                "async/await", "try...catch...finally", "throw new Error()",
                "Object.keys()", "Object.values()", "Object.entries()", "Object.fromEntries()",
                "Object.assign()", "Object.create()", "Object.freeze()", "Object.seal()",
                "Object.defineProperty()", "Object.getOwnPropertyDescriptor()",
                "Proxy", "Reflect", "WeakMap", "WeakSet", "Map", "Set",
                "array.map(x => x * 2)", "array.filter(x => x > 0)", "array.reduce((a, b) => a + b)",
                "array.find(x => x.id === id)", "array.findLast()", "array.toSorted()",
                "array.toReversed()", "array.with()", "array.at(-1)",
                "string.padStart()", "string.padEnd()", "string.repeat()", "string.startsWith()",
                "string.endsWith()", "string.includes()", "string.replaceAll()",
                "fetch('/api/data')", "fetch().then().catch()", "Response.json()",
                "FormData", "URLSearchParams", "Blob", "FileReader", "ArrayBuffer",
                "TypedArray", "DataView", "TextEncoder", "TextDecoder",
                "requestAnimationFrame()", "cancelAnimationFrame()", "IntersectionObserver",
                "MutationObserver", "ResizeObserver", "PerformanceObserver",
                "navigator.geolocation", "navigator.mediaDevices", "WebSocket",
                "Worker", "ServiceWorker", "SharedWorker", "BroadcastChannel",
                "const [state, setState] = useState()", "useEffect(() => {})",
                "useCallback(() => {})", "useMemo(() => {})", "useRef()",
                "useContext()", "useReducer()", "useLayoutEffect()"
            ]
        },
        
        ProgrammingLanguage.JAVA: {
            'beginner': [
                # Basic Java keywords and concepts (80+ items)
                "class", "public", "private", "protected", "static", "void", "int", "String", "boolean",
                "char", "byte", "short", "long", "float", "double", "if", "else", "else if",
                "for", "while", "do", "break", "continue", "return", "switch", "case", "default",
                "true", "false", "null", "new", "this", "super", "extends", "implements",
                "import", "package", "final", "abstract", "interface", "enum", "try", "catch",
                "finally", "throw", "throws", "assert", "synchronized", "volatile", "transient",
                "native", "strictfp", "const", "goto", "var", "instanceof",
                "System.out.println()", "System.out.print()", "System.err.println()",
                "main(String[] args)", "public static void", "length", "length()", "size()",
                "isEmpty()", "charAt()", "substring()", "indexOf()", "lastIndexOf()",
                "contains()", "startsWith()", "endsWith()", "toLowerCase()", "toUpperCase()",
                "trim()", "replace()", "split()", "concat()", "valueOf()", "toString()",
                "equals()", "hashCode()", "compareTo()", "parseInt()", "parseDouble()",
                "parseLong()", "parseFloat()", "parseBoolean()"
            ],
            'intermediate': [
                # Common Java patterns and classes (80+ items)
                "public class", "private int", "protected String", "public void", "private static",
                "@Override", "@Deprecated", "@SuppressWarnings", "@FunctionalInterface",
                "ArrayList<>", "LinkedList<>", "Vector<>", "Stack<>", "Queue<>", "Deque<>",
                "HashMap<>", "TreeMap<>", "LinkedHashMap<>", "Hashtable<>", "HashSet<>",
                "TreeSet<>", "LinkedHashSet<>", "PriorityQueue<>", "ArrayDeque<>",
                "for (int i = 0; i < n; i++)", "for (String s : list)", "while (condition)",
                "do { } while (condition)", "if (condition) { } else { }",
                "try { } catch (Exception e) { }", "try { } finally { }",
                "throw new Exception()", "throws IOException", "throws Exception",
                "Scanner scanner = new Scanner(System.in)", "scanner.nextLine()",
                "scanner.nextInt()", "scanner.close()", "BufferedReader reader",
                "Collections.sort()", "Collections.reverse()", "Collections.shuffle()",
                "Collections.min()", "Collections.max()", "Collections.frequency()",
                "Arrays.asList()", "Arrays.sort()", "Arrays.copyOf()", "Arrays.fill()",
                "Arrays.binarySearch()", "Arrays.equals()", "Arrays.toString()",
                "Math.max()", "Math.min()", "Math.abs()", "Math.pow()", "Math.sqrt()",
                "Math.random()", "Math.round()", "Math.ceil()", "Math.floor()",
                "String.format()", "String.join()", "StringBuilder", "StringBuffer",
                "append()", "insert()", "delete()", "reverse()", "capacity()",
                "Integer.valueOf()", "Integer.MAX_VALUE", "Integer.MIN_VALUE",
                "Double.valueOf()", "Double.isNaN()", "Double.isInfinite()",
                "Boolean.valueOf()", "Character.isDigit()", "Character.isLetter()"
            ],
            'advanced': [
                # Advanced Java and frameworks (80+ items)
                "public static void main(String[] args)", "public static final",
                "Generic<T>", "List<String>", "Map<K, V>", "Set<Integer>", "<? extends T>",
                "<? super T>", "Class<?>", "Comparable<T>", "Comparator<T>", "Iterable<T>",
                "Iterator<T>", "ListIterator<T>", "Runnable", "Callable<V>", "Thread",
                "ExecutorService", "ThreadPoolExecutor", "ScheduledExecutorService",
                "Future<V>", "CompletableFuture<T>", "CompletableFuture.supplyAsync()",
                "Stream<T>", "IntStream", "LongStream", "DoubleStream", "Optional<T>",
                "Optional.ofNullable()", "Optional.orElse()", "Optional.map()",
                "stream().filter()", "stream().map()", "stream().flatMap()", "stream().reduce()",
                "stream().collect()", "Collectors.toList()", "Collectors.toSet()",
                "Collectors.groupingBy()", "Collectors.partitioningBy()", "Collectors.joining()",
                "lambda -> expression", "(x, y) -> x + y", "method::reference", "Class::new",
                "Function<T, R>", "Consumer<T>", "Supplier<T>", "Predicate<T>", "BiFunction<T, U, R>",
                "try-with-resources", "try (Resource r = new Resource())",
                "synchronized (this)", "wait()", "notify()", "notifyAll()", "Lock",
                "ReentrantLock", "Semaphore", "CountDownLatch", "CyclicBarrier",
                "AtomicInteger", "AtomicLong", "AtomicReference", "ConcurrentHashMap",
                "@Entity", "@Table", "@Column", "@Id", "@GeneratedValue", "@Repository",
                "@Service", "@Controller", "@RestController", "@Component", "@Autowired",
                "@RequestMapping", "@GetMapping", "@PostMapping", "@PutMapping", "@DeleteMapping",
                "@PathVariable", "@RequestParam", "@RequestBody", "@ResponseBody",
                "@Transactional", "@EnableAutoConfiguration", "@SpringBootApplication",
                "@Configuration", "@Bean", "@Value", "@Qualifier", "@Profile",
                "JPA", "Hibernate", "JDBC", "Maven", "Gradle"
            ]
        },
        
        ProgrammingLanguage.CSHARP: {
            'beginner': [
                # Basic C# keywords and concepts (80+ items)
                "class", "public", "private", "protected", "internal", "static", "void", "int",
                "string", "bool", "char", "byte", "short", "long", "float", "double", "decimal",
                "if", "else", "else if", "for", "foreach", "while", "do", "break", "continue",
                "return", "switch", "case", "default", "goto", "true", "false", "null", "new",
                "this", "base", "using", "namespace", "struct", "interface", "enum",
                "var", "const", "readonly", "virtual", "override", "abstract", "sealed",
                "try", "catch", "finally", "throw", "checked", "unchecked", "fixed",
                "unsafe", "lock", "typeof", "sizeof", "nameof", "is", "as", "ref", "out", "in",
                "params", "delegate", "event", "operator", "implicit", "explicit",
                "Console.WriteLine()", "Console.ReadLine()", "Console.Write()", "Console.ReadKey()",
                "ToString()", "Equals()", "GetHashCode()", "GetType()", "Length", "Count"
            ],
            'intermediate': [
                # Common C# patterns and .NET classes (80+ items)
                "public class", "private int", "protected string", "internal bool", "public void",
                "public string Name { get; set; }", "public int Id { get; }", "{ get; private set; }",
                "List<T>", "Dictionary<K,V>", "HashSet<T>", "Queue<T>", "Stack<T>", "LinkedList<T>",
                "IEnumerable<T>", "IList<T>", "ICollection<T>", "IDictionary<K,V>",
                "foreach (var item in collection)", "for (int i = 0; i < length; i++)",
                "while (condition)", "do { } while (condition)", "if (condition) { } else { }",
                "try { } catch (Exception ex) { }", "try { } finally { }", "throw new Exception()",
                "throw new ArgumentException()", "throw new InvalidOperationException()",
                "string.IsNullOrEmpty()", "string.IsNullOrWhiteSpace()", "string.Format()",
                "string.Join()", "string.Split()", "string.Contains()", "string.StartsWith()",
                "string.EndsWith()", "string.Replace()", "string.Substring()", "string.ToUpper()",
                "string.ToLower()", "string.Trim()", "string.PadLeft()", "string.PadRight()",
                "int.Parse()", "int.TryParse()", "Convert.ToInt32()", "Convert.ToString()",
                "double.Parse()", "decimal.Parse()", "bool.Parse()",
                "DateTime.Now", "DateTime.Today", "DateTime.UtcNow", "DateTime.Parse()",
                "TimeSpan.FromDays()", "DateTimeOffset.Now", "Guid.NewGuid()", "Guid.Empty",
                "Math.Max()", "Math.Min()", "Math.Abs()", "Math.Round()", "Math.Floor()",
                "Math.Ceiling()", "Math.Pow()", "Math.Sqrt()", "Random.Next()",
                "LINQ", "from x in collection", "where x > 5", "select x", "orderby x",
                "group x by x.Category", "join a in listA on a.Id equals b.Id",
                "x => x.Property", "(x, y) => x + y", "Func<T, TResult>", "Action<T>",
                "Predicate<T>", "EventHandler", "EventArgs"
            ],
            'advanced': [
                # Advanced C# and .NET features (80+ items)
                "async", "await", "Task", "Task<T>", "ValueTask", "ValueTask<T>",
                "async Task<string> GetDataAsync()", "await Task.Run(() => {})",
                "await Task.WhenAll()", "await Task.WhenAny()", "ConfigureAwait(false)",
                "CancellationToken", "CancellationTokenSource", "IAsyncEnumerable<T>",
                "await foreach (var item in asyncEnumerable)", "yield return", "yield break",
                "record", "record struct", "init", "with", "required", "file", "global using",
                "public record Person(string Name, int Age)", "person with { Name = \"New\" }",
                "pattern matching", "is not null", "is { Length: > 0 }", "switch expression",
                "x switch { > 0 => \"positive\", < 0 => \"negative\", _ => \"zero\" }",
                "??", "??=", "?.", "?[]", "!", "^^", "..^", "^..", "..",
                "nullable reference types", "string?", "#nullable enable", "#nullable disable",
                "(int x, string y) = tuple", "var (a, b, c) = Deconstruct()",
                "Span<T>", "Memory<T>", "ReadOnlySpan<T>", "ArraySegment<T>", "stackalloc",
                "ref struct", "ref readonly", "ref return",
                "IDisposable", "using var", "using (var resource = new Resource())",
                "lock (lockObject)", "Monitor.Enter()", "Monitor.Exit()", "Interlocked",
                "Thread", "ThreadPool", "Task.Factory.StartNew()", "Parallel.For()",
                "Parallel.ForEach()", "PLINQ", "AsParallel()", "WithDegreeOfParallelism()",
                "SemaphoreSlim", "Mutex", "AutoResetEvent", "ManualResetEvent",
                "Channel<T>", "IAsyncDisposable", "await using",
                "[Attribute]", "[Serializable]", "[DataContract]", "[DataMember]",
                "[HttpGet]", "[HttpPost]", "[HttpPut]", "[HttpDelete]", "[Route]",
                "[ApiController]", "[Authorize]", "[AllowAnonymous]",
                "[Required]", "[StringLength]", "[Range]", "[RegularExpression]",
                "dependency injection", "IServiceCollection", "IServiceProvider",
                "AddScoped()", "AddTransient()", "AddSingleton()", "GetService<T>()",
                "IConfiguration", "IOptions<T>", "ILogger<T>", "IHostedService",
                "Entity Framework", "DbContext", "DbSet<T>", "LINQ to SQL",
                "IQueryable<T>", "Expression<Func<T, bool>>", "Include()", "ThenInclude()",
                "migration", "Add-Migration", "Update-Database"
            ]
        },
        
        ProgrammingLanguage.CPLUSPLUS: {
            'beginner': [
                # Basic C++ keywords and concepts (80+ items)
                "int", "char", "bool", "void", "float", "double", "long", "short", "unsigned",
                "signed", "const", "static", "extern", "volatile", "mutable", "register",
                "if", "else", "else if", "for", "while", "do", "break", "continue", "return",
                "switch", "case", "default", "goto", "true", "false", "nullptr", "NULL",
                "new", "delete", "new[]", "delete[]", "this", "sizeof", "typedef", "typename",
                "class", "struct", "union", "enum", "namespace", "using", "public", "private",
                "protected", "friend", "virtual", "override", "final", "explicit", "inline",
                "try", "catch", "throw", "noexcept", "static_cast", "dynamic_cast",
                "const_cast", "reinterpret_cast", "operator", "template",
                "std", "cout", "cin", "cerr", "clog", "endl", "std::cout", "std::cin",
                "std::endl", "main()", "return 0", "#include", "#define", "#ifndef", "#endif",
                "printf()", "scanf()", "strlen()", "strcpy()", "strcmp()"
            ],
            'intermediate': [
                # Common C++ patterns and STL (80+ items)
                "#include <iostream>", "#include <vector>", "#include <string>", "#include <map>",
                "#include <set>", "#include <queue>", "#include <stack>", "#include <algorithm>",
                "#include <memory>", "#include <utility>", "#include <functional>", "#include <array>",
                "std::vector<int>", "std::string", "std::map<K,V>", "std::set<T>",
                "std::unordered_map<K,V>", "std::unordered_set<T>", "std::queue<T>",
                "std::priority_queue<T>", "std::stack<T>", "std::deque<T>", "std::list<T>",
                "std::array<T,N>", "std::pair<T1,T2>", "std::tuple<Types...>",
                "for (int i = 0; i < n; i++)", "for (auto& item : container)",
                "for (auto it = begin(); it != end(); ++it)", "while (condition)",
                "do { } while (condition)", "if (condition) { } else { }",
                "std::cout << value << std::endl", "std::cin >> variable",
                "std::getline(std::cin, str)", "class MyClass { public: private: };",
                "MyClass() : member(value) {}", "~MyClass() {}", "MyClass(const MyClass& other)",
                "MyClass& operator=(const MyClass& other)", "MyClass(MyClass&& other)",
                "std::unique_ptr<T>", "std::shared_ptr<T>", "std::weak_ptr<T>",
                "std::make_unique<T>()", "std::make_shared<T>()", "std::move()",
                "std::forward<T>()", "auto", "decltype", "constexpr", "const T&", "T&&",
                "template<typename T>", "template<class T>", "typename T::type",
                "std::sort()", "std::find()", "std::find_if()", "std::count()",
                "std::copy()", "std::transform()", "std::accumulate()", "std::reverse()",
                "std::max()", "std::min()", "std::swap()", "std::fill()", "std::generate()",
                "push_back()", "emplace_back()", "pop_back()", "front()", "back()",
                "begin()", "end()", "rbegin()", "rend()", "size()", "empty()", "clear()",
                "insert()", "erase()", "find()", "count()", "at()", "operator[]"
            ],
            'advanced': [
                # Advanced C++ and modern features (80+ items)
                "template<typename T> class", "template<typename... Args>",
                "template<template<typename> class T>", "typename std::enable_if<>::type",
                "std::is_same<T1, T2>::value", "std::decay_t<T>", "std::remove_reference_t<T>",
                "constexpr if (condition)", "if constexpr (condition)", "static_assert()",
                "auto lambda = [](auto x) { return x; }", "[&](){ }", "[=](){ }", "[this](){ }",
                "[](const auto& x) -> decltype(x)", "mutable lambda",
                "std::function<void()>", "std::bind()", "std::placeholders::_1",
                "std::thread", "std::async()", "std::future<T>", "std::promise<T>",
                "std::mutex", "std::lock_guard<std::mutex>", "std::unique_lock<std::mutex>",
                "std::condition_variable", "std::atomic<T>", "std::memory_order",
                "std::chrono::steady_clock", "std::chrono::duration<>", "std::chrono::time_point<>",
                "using namespace std::chrono_literals", "1s", "100ms", "500us",
                "std::optional<T>", "std::variant<Types...>", "std::any", "std::string_view",
                "std::filesystem::path", "std::filesystem::directory_iterator",
                "ranges::view", "ranges::filter", "ranges::transform", "std::span<T>",
                "concept", "requires", "co_await", "co_yield", "co_return",
                "[[nodiscard]]", "[[maybe_unused]]", "[[deprecated]]", "[[fallthrough]]",
                "alignas", "alignof", "decltype(auto)", "auto&&",
                "std::move_if_noexcept()", "std::exchange()", "std::launder()",
                "std::invoke()", "std::apply()", "std::visit()", "std::get<I>()",
                "std::index_sequence<>", "std::make_index_sequence<N>",
                "SFINAE", "CRTP", "expression templates", "tag dispatch",
                "std::allocator<T>", "std::allocator_traits<>", "operator new", "operator delete",
                "placement new", "std::aligned_storage<>", "std::aligned_union<>",
                "std::memory_order_relaxed", "std::memory_order_acquire",
                "std::memory_order_release", "std::memory_order_seq_cst",
                "std::shared_mutex", "std::shared_lock<>", "std::scoped_lock<>",
                "std::jthread", "std::stop_token", "std::barrier", "std::latch",
                "std::binary_semaphore", "std::counting_semaphore<>",
                "module", "export", "import", "module :private", "export module",
                "std::format()", "std::source_location", "std::coroutine_handle<>",
                "std::ranges::range", "std::ranges::view", "std::ranges::algorithm"
            ]
        },
        
        ProgrammingLanguage.CSS: {
            'beginner': [
                # Basic CSS properties and values (80+ items)
                "color", "background", "background-color", "background-image", "background-size",
                "background-position", "background-repeat", "font-size", "font-family", "font-weight",
                "font-style", "line-height", "letter-spacing", "text-align", "text-decoration",
                "text-transform", "text-shadow", "width", "height", "min-width", "max-width",
                "min-height", "max-height", "margin", "margin-top", "margin-right", "margin-bottom",
                "margin-left", "padding", "padding-top", "padding-right", "padding-bottom",
                "padding-left", "border", "border-width", "border-style", "border-color",
                "border-radius", "border-top", "border-right", "border-bottom", "border-left",
                "display", "position", "top", "right", "bottom", "left", "float", "clear",
                "overflow", "overflow-x", "overflow-y", "visibility", "opacity", "z-index",
                "cursor", "outline", "box-sizing", "vertical-align", "white-space",
                "red", "blue", "green", "yellow", "black", "white", "gray", "transparent",
                "#000000", "#ffffff", "rgb()", "rgba()", "hsl()", "hsla()",
                "px", "em", "rem", "%", "vh", "vw", "auto", "inherit", "initial", "unset"
            ],
            'intermediate': [
                # Common CSS patterns and layouts (80+ items)
                "display: flex", "display: grid", "display: inline-block", "display: none",
                "display: block", "display: inline", "display: table", "display: inline-flex",
                "flex-direction: row", "flex-direction: column", "flex-wrap: wrap",
                "justify-content: center", "justify-content: space-between", "justify-content: flex-start",
                "align-items: center", "align-items: flex-start", "align-items: stretch",
                "align-self: center", "flex: 1", "flex-grow: 1", "flex-shrink: 0", "flex-basis: auto",
                "position: relative", "position: absolute", "position: fixed", "position: sticky",
                "transform: translate()", "transform: rotate()", "transform: scale()", "transform: skew()",
                "transition: all 0.3s", "transition: opacity 0.5s ease", "transition-property",
                "transition-duration", "transition-timing-function", "transition-delay",
                "animation: name 1s", "animation-name", "animation-duration", "animation-delay",
                "animation-iteration-count", "animation-direction", "animation-fill-mode",
                "@keyframes", "from { }", "to { }", "0% { }", "50% { }", "100% { }",
                "box-shadow: 0 2px 4px rgba(0,0,0,0.1)", "text-shadow: 1px 1px 2px rgba(0,0,0,0.5)",
                "border: 1px solid #ccc", "border-radius: 8px", "border-radius: 50%",
                "background: linear-gradient()", "background: radial-gradient()", "background: conic-gradient()",
                "@media screen and (max-width: 768px)", "@media (min-width: 1024px)",
                "@media print", "@media (orientation: landscape)",
                ":hover", ":active", ":focus", ":visited", ":first-child", ":last-child",
                ":nth-child()", ":nth-of-type()", ":not()", ":before", ":after", "::before", "::after",
                "content: ''", "calc()", "var(--variable)", "clamp()", "min()", "max()"
            ],
            'advanced': [
                # Advanced CSS and modern features (80+ items)
                "display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));",
                "grid-template-rows", "grid-template-areas", "grid-column", "grid-row",
                "grid-gap", "gap", "grid-auto-flow", "grid-auto-columns", "grid-auto-rows",
                "place-items: center", "place-content: center", "place-self: center",
                "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);",
                "background: repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px);",
                "background-blend-mode: multiply", "mix-blend-mode: screen", "isolation: isolate",
                ":root { --primary: #3498db; }", "var(--primary)", "--custom-property: value",
                "@custom-media --small-viewport (max-width: 30em)",
                "transform: translateX(-50%) translateY(-50%) scale(1.1) rotate(45deg);",
                "transform: perspective(1000px) rotateX(45deg) rotateY(45deg);",
                "transform-style: preserve-3d", "backface-visibility: hidden",
                "animation: slideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;",
                "@supports (display: grid) { }", "@supports not (display: grid) { }",
                "filter: blur(5px)", "filter: brightness(1.2)", "filter: contrast(1.1)",
                "filter: drop-shadow(0 0 10px rgba(0,0,0,0.5))", "filter: grayscale(50%)",
                "filter: hue-rotate(90deg)", "filter: invert(100%)", "filter: saturate(200%)",
                "filter: sepia(60%)", "backdrop-filter: blur(10px)",
                "clip-path: polygon(50% 0%, 0% 100%, 100% 100%);", "clip-path: circle(50%);",
                "clip-path: ellipse(130px 140px at 10% 20%);", "clip-path: url(#my-clip);",
                "mask: url(mask.svg)", "mask-image", "mask-position", "mask-size", "mask-repeat",
                "scroll-behavior: smooth", "scroll-snap-type: x mandatory", "scroll-snap-align: start",
                "overscroll-behavior: contain", "touch-action: manipulation",
                "will-change: transform", "contain: layout", "content-visibility: auto",
                "aspect-ratio: 16 / 9", "object-fit: cover", "object-position: center",
                "writing-mode: vertical-rl", "text-orientation: mixed",
                "@container (min-width: 700px) { }", "container-type: inline-size",
                "@layer utilities { }", "@layer components { }", "@layer base { }",
                "color-scheme: dark light", "accent-color: #007bff",
                ":is()", ":where()", ":has()", ":focus-within", ":focus-visible",
                "::marker", "::selection", "::backdrop", "::file-selector-button",
                "@font-face { }", "font-display: swap", "font-variation-settings",
                "text-decoration-thickness", "text-underline-offset", "text-decoration-skip-ink"
            ]
        },
        
        ProgrammingLanguage.HTML: {
            'beginner': [
                # Basic HTML tags and attributes (80+ items)
                "<html>", "</html>", "<head>", "</head>", "<body>", "</body>", "<title>", "</title>",
                "<h1>", "</h1>", "<h2>", "</h2>", "<h3>", "</h3>", "<h4>", "</h4>", "<h5>", "</h5>",
                "<h6>", "</h6>", "<p>", "</p>", "<div>", "</div>", "<span>", "</span>",
                "<a>", "</a>", "<img>", "<br>", "<hr>", "<ul>", "</ul>", "<ol>", "</ol>",
                "<li>", "</li>", "<table>", "</table>", "<tr>", "</tr>", "<td>", "</td>",
                "<th>", "</th>", "<strong>", "</strong>", "<em>", "</em>", "<b>", "</b>",
                "<i>", "</i>", "<u>", "</u>", "<strike>", "</strike>", "<sub>", "</sub>",
                "<sup>", "</sup>", "<blockquote>", "</blockquote>", "<pre>", "</pre>",
                "<code>", "</code>", "href=\"\"", "src=\"\"", "alt=\"\"", "title=\"\"",
                "class=\"\"", "id=\"\"", "style=\"\"", "width=\"\"", "height=\"\"", "target=\"\"",
                "rel=\"\"", "type=\"\"", "name=\"\"", "value=\"\"", "placeholder=\"\"",
                "disabled", "readonly", "required", "checked", "selected"
            ],
            'intermediate': [
                # Common HTML5 and form elements (80+ items)
                "<!DOCTYPE html>", "<html lang=\"en\">", "<meta charset=\"UTF-8\">",
                "<meta name=\"viewport\">", "<meta name=\"description\">", "<meta name=\"keywords\">",
                "<link rel=\"stylesheet\">", "<link rel=\"icon\">", "<link rel=\"canonical\">",
                "<script>", "</script>", "<script src=\"\">", "<script async>", "<script defer>",
                "<noscript>", "</noscript>", "<style>", "</style>",
                "<header>", "</header>", "<nav>", "</nav>", "<main>", "</main>",
                "<section>", "</section>", "<article>", "</article>", "<aside>", "</aside>",
                "<footer>", "</footer>", "<figure>", "</figure>", "<figcaption>", "</figcaption>",
                "<form>", "</form>", "<input>", "<textarea>", "</textarea>", "<select>", "</select>",
                "<option>", "</option>", "<optgroup>", "</optgroup>", "<button>", "</button>",
                "<label>", "</label>", "<fieldset>", "</fieldset>", "<legend>", "</legend>",
                "<datalist>", "</datalist>", "<output>", "</output>", "<progress>", "</progress>",
                "<meter>", "</meter>", "<details>", "</details>", "<summary>", "</summary>",
                "<dialog>", "</dialog>", "<template>", "</template>", "<slot>", "</slot>",
                "type=\"text\"", "type=\"email\"", "type=\"password\"", "type=\"number\"",
                "type=\"tel\"", "type=\"url\"", "type=\"search\"", "type=\"date\"", "type=\"time\"",
                "type=\"checkbox\"", "type=\"radio\"", "type=\"file\"", "type=\"submit\"",
                "type=\"button\"", "type=\"reset\"", "type=\"hidden\"", "type=\"range\"",
                "method=\"GET\"", "method=\"POST\"", "action=\"\"", "enctype=\"\"",
                "autocomplete=\"on\"", "autocomplete=\"off\"", "autofocus", "multiple",
                "pattern=\"\"", "min=\"\"", "max=\"\"", "step=\"\"", "maxlength=\"\"", "minlength=\"\""
            ],
            'advanced': [
                # Modern HTML5 and advanced features (80+ items)
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
                "<meta property=\"og:title\">", "<meta property=\"og:description\">",
                "<meta property=\"og:image\">", "<meta name=\"twitter:card\">",
                "<link rel=\"preconnect\">", "<link rel=\"dns-prefetch\">", "<link rel=\"preload\">",
                "<link rel=\"prefetch\">", "<link rel=\"modulepreload\">",
                "<script type=\"module\">", "<script nomodule>", "<script type=\"importmap\">",
                "<video>", "</video>", "<audio>", "</audio>", "<source>", "<track>",
                "<video controls>", "<video autoplay>", "<video loop>", "<video muted>",
                "<video poster=\"\">", "<video preload=\"metadata\">",
                "<audio controls>", "<audio autoplay>", "<audio loop>", "<audio muted>",
                "<canvas>", "</canvas>", "<svg>", "</svg>", "<math>", "</math>",
                "<picture>", "</picture>", "<source media=\"\">", "<source srcset=\"\">",
                "<iframe>", "</iframe>", "<embed>", "<object>", "</object>", "<param>",
                "<map>", "</map>", "<area>", "<time>", "</time>", "<mark>", "</mark>",
                "<ruby>", "</ruby>", "<rt>", "</rt>", "<rp>", "</rp>", "<bdi>", "</bdi>",
                "<bdo>", "</bdo>", "<wbr>", "<data>", "</data>",
                "aria-label=\"\"", "aria-labelledby=\"\"", "aria-describedby=\"\"",
                "aria-hidden=\"true\"", "aria-live=\"polite\"", "aria-atomic=\"true\"",
                "role=\"button\"", "role=\"navigation\"", "role=\"main\"", "role=\"article\"",
                "role=\"complementary\"", "role=\"banner\"", "role=\"contentinfo\"",
                "tabindex=\"0\"", "tabindex=\"-1\"", "contenteditable=\"true\"",
                "draggable=\"true\"", "spellcheck=\"false\"", "translate=\"no\"",
                "data-*=\"\"", "loading=\"lazy\"", "decoding=\"async\"", "fetchpriority=\"high\"",
                "crossorigin=\"anonymous\"", "integrity=\"\"", "referrerpolicy=\"no-referrer\"",
                "<web-component>", "</web-component>", "<custom-element>", "</custom-element>",
                "is=\"custom-element\"", "slot=\"name\"", "part=\"name\""
            ]
        }
    }
    
    @classmethod
    def get_words(cls, mode: GameMode, language: Optional[ProgrammingLanguage] = None, level: int = 1) -> List[str]:
        """Get word list based on game mode, programming language, and difficulty level"""
        if mode == GameMode.NORMAL:
            # Expanded difficulty ranges for better progression
            if level <= 7:
                return cls.NORMAL_WORDS['beginner']
            elif level <= 15:
                return cls.NORMAL_WORDS['intermediate']
            else:
                return cls.NORMAL_WORDS['advanced']
        
        elif mode == GameMode.PROGRAMMING and language:
            lang_dict = cls.PROGRAMMING_WORDS.get(language)
            if lang_dict:
                # Expanded difficulty ranges for programming languages
                # Now uses wider ranges to take advantage of 200+ words per language
                if level <= 6:
                    return lang_dict['beginner']
                elif level <= 14:
                    return lang_dict['intermediate']
                else:
                    return lang_dict['advanced']
            return cls.NORMAL_WORDS['beginner']
        
        return cls.NORMAL_WORDS['beginner']
    
    @classmethod
    def get_boss_word(cls, mode: GameMode, language: Optional[ProgrammingLanguage] = None, level: int = 1) -> str:
        """Get a challenging boss word based on game mode, programming language, and difficulty level"""
        if mode == GameMode.NORMAL:
            # Expanded difficulty ranges to match word ranges
            if level <= 7:
                words = cls.BOSS_WORDS['normal']['beginner']
            elif level <= 15:
                words = cls.BOSS_WORDS['normal']['intermediate']
            else:
                words = cls.BOSS_WORDS['normal']['advanced']
            return random.choice(words)
        
        elif mode == GameMode.PROGRAMMING and language:
            lang_dict = cls.BOSS_WORDS['programming'].get(language)
            if lang_dict:
                # Expanded difficulty ranges for programming languages
                if level <= 6:
                    words = lang_dict['beginner']
                elif level <= 14:
                    words = lang_dict['intermediate']
                else:
                    words = lang_dict['advanced']
                return random.choice(words)
            # Fallback to normal mode boss words
            return random.choice(cls.BOSS_WORDS['normal']['beginner'])
        
        return random.choice(cls.BOSS_WORDS['normal']['beginner'])

@dataclass
class PlayerStats:
    """Player statistics for a single session"""
    words_typed: int = 0
    total_keystrokes: int = 0
    correct_keystrokes: int = 0
    wpm_peak: float = 0.0
    accuracy: float = 100.0
    play_time: float = 0.0
    bosses_defeated: int = 0
    perfect_words: int = 0  # Words typed without any mistakes

@dataclass
class HighScoreEntry:
    """Single high score entry"""
    player_name: str
    score: int
    level: int
    wpm: float
    accuracy: float
    timestamp: str
    mode: str
    language: Optional[str] = None

class Achievement:
    """Achievement definition"""
    def __init__(self, id: str, name: str, description: str, icon: str = "🏆"):
        self.id = id
        self.name = name
        self.description = description
        self.icon = icon
        self.unlocked = False
        self.unlock_date = None

# Define all achievements with colored circles as icons
ACHIEVEMENTS = {
    "first_word": Achievement("first_word", "First Steps", "Type your first word", "BABY"),
    "speed_demon": Achievement("speed_demon", "Speed Demon", "Reach 100 WPM", "SPEED"),
    "accuracy_master": Achievement("accuracy_master", "Accuracy Master", "Complete a game with 95% accuracy", "TARGET"),
    "boss_slayer": Achievement("boss_slayer", "Boss Slayer", "Defeat your first boss", "BOSS"),
    "level_10": Achievement("level_10", "Halfway There", "Reach level 10", "L10"),
    "level_20": Achievement("level_20", "Master Typist", "Reach level 20", "L20"),
    "perfect_game": Achievement("perfect_game", "Perfection", "Complete 10 words in a row without mistakes", "100%"),
    "marathon": Achievement("marathon", "Marathon Runner", "Play for 30 minutes straight", "30M"),
    "polyglot": Achievement("polyglot", "Polyglot", "Play in all programming languages", "CODE"),
    "high_scorer": Achievement("high_scorer", "High Scorer", "Score over 10,000 points", "10K"),
    "veteran": Achievement("veteran", "Veteran", "Play 50 games", "50G"),
    "word_master": Achievement("word_master", "Word Master", "Type 1000 words total", "1000W")
}

class PlayerProfile:
    """Player profile with persistent data and achievements"""
    def __init__(self, name: str = ""):
        import datetime
        self.name: str = name
        self.created_at: str = datetime.datetime.now().isoformat() if name else ""
        self.total_play_time: float = 0.0
        self.games_played: int = 0
        self.total_score: int = 0
        self.total_words_typed: int = 0
        self.achievements: List[str] = []  # List of unlocked achievement IDs
        self.last_played: str = ""
        # Overall best stats
        self.best_score: int = 0
        self.highest_level: int = 0
        self.best_wpm: float = 0.0
        self.bosses_defeated: int = 0
        # Separate saves for each mode/language combination
        self.saved_games: Dict[str, Optional[Dict]] = {}  # Key: "normal" or "programming_<language>"
        # Stats by mode: 'normal' or 'programming_<language>'
        self.stats_by_mode: Dict[str, Dict[str, Any]] = {}
        # Initialize stats for each mode
        self.stats_by_mode['normal'] = {
            'best_wpm': 0.0,
            'best_score': 0,
            'highest_level': 0,
            'bosses_defeated': 0,
            'games_played': 0,
            'total_words': 0,
            'average_accuracy': 0.0
        }
        # Languages played
        self.languages_played: set = set()
    
    def get_mode_key(self, mode: str, language: Optional[str] = None) -> str:
        """Get the key for a mode/language combination"""
        if mode == 'programming' and language:
            return f"programming_{language}"
        return "normal"
    
    def get_saved_game(self, mode: str, language: Optional[str] = None) -> Optional[Dict]:
        """Get saved game for a specific mode/language"""
        key = self.get_mode_key(mode, language)
        return self.saved_games.get(key)
    
    def set_saved_game(self, mode: str, game_state: Dict, language: Optional[str] = None):
        """Save game state for a specific mode/language"""
        key = self.get_mode_key(mode, language)
        self.saved_games[key] = game_state
    
    def get_mode_stats(self, mode: str, language: Optional[str] = None) -> Dict:
        """Get stats for a specific mode/language"""
        key = self.get_mode_key(mode, language)
        if key not in self.stats_by_mode:
            self.stats_by_mode[key] = {
                'best_wpm': 0.0,
                'best_score': 0,
                'highest_level': 0,
                'bosses_defeated': 0,
                'games_played': 0,
                'total_words': 0,
                'average_accuracy': 0.0
            }
        return self.stats_by_mode[key]
    
    def check_achievements(self, game_state: Dict) -> List[str]:
        """Check and unlock achievements based on game state. Returns newly unlocked achievements."""
        import datetime
        newly_unlocked = []
        
        # First word
        if "first_word" not in self.achievements and self.total_words_typed > 0:
            self.achievements.append("first_word")
            newly_unlocked.append("first_word")
        
        # Speed demon - 100 WPM
        if "speed_demon" not in self.achievements and self.best_wpm >= 100:
            self.achievements.append("speed_demon")
            newly_unlocked.append("speed_demon")
        
        # Boss slayer
        if "boss_slayer" not in self.achievements and self.bosses_defeated > 0:
            self.achievements.append("boss_slayer")
            newly_unlocked.append("boss_slayer")
        
        # Level achievements
        if "level_10" not in self.achievements and self.highest_level >= 10:
            self.achievements.append("level_10")
            newly_unlocked.append("level_10")
        
        if "level_20" not in self.achievements and self.highest_level >= 20:
            self.achievements.append("level_20")
            newly_unlocked.append("level_20")
        
        # High scorer - 10,000 points
        if "high_scorer" not in self.achievements and self.best_score >= 10000:
            self.achievements.append("high_scorer")
            newly_unlocked.append("high_scorer")
        
        # Veteran - 50 games
        if "veteran" not in self.achievements and self.games_played >= 50:
            self.achievements.append("veteran")
            newly_unlocked.append("veteran")
        
        # Word master - 1000 words
        if "word_master" not in self.achievements and self.total_words_typed >= 1000:
            self.achievements.append("word_master")
            newly_unlocked.append("word_master")
        
        # Polyglot - all languages
        if "polyglot" not in self.achievements and len(self.languages_played) >= 7:
            self.achievements.append("polyglot")
            newly_unlocked.append("polyglot")
        
        # Check game-specific achievements
        if game_state:
            # Accuracy master - 95% accuracy in a complete game
            if "accuracy_master" not in self.achievements:
                accuracy = game_state.get('accuracy', 0)
                if accuracy >= 95 and game_state.get('game_over', False):
                    self.achievements.append("accuracy_master")
                    newly_unlocked.append("accuracy_master")
            
            # Perfect game - 10 perfect words in a row
            if "perfect_game" not in self.achievements:
                perfect_words = game_state.get('perfect_words', 0)
                if perfect_words >= 10:
                    self.achievements.append("perfect_game")
                    newly_unlocked.append("perfect_game")
            
            # Marathon - 30 minutes
            if "marathon" not in self.achievements:
                play_time = game_state.get('session_time', 0)
                if play_time >= 1800:  # 30 minutes in seconds
                    self.achievements.append("marathon")
                    newly_unlocked.append("marathon")
        
        return newly_unlocked
        
class SoundManager:
    """Simple sound effects manager using pygame's built-in sound generation"""
    def __init__(self, volume: float = 0.8):
        self.volume = volume
        self.sounds = {}
        self.generate_sounds()
    
    def generate_sounds(self):
        """Generate simple sound effects programmatically"""
        try:
            # Generate simple beep/click sounds using pygame's sound arrays
            # Type sound - pew-pew laser shooting sound
            self.sounds['type'] = self.create_pew_sound()  # Pew-pew laser sound
            # Correct word - success sound
            self.sounds['correct'] = self.create_beep(880, 100)  # A5 note, 100ms
            # Wrong key - error sound
            self.sounds['wrong'] = self.create_beep(220, 150)  # A3 note, 150ms
            # Ship destroyed - explosion
            self.sounds['destroy'] = self.create_noise_burst(200)  # 200ms noise
            # Boss appear - dramatic sound
            self.sounds['boss'] = self.create_sweep(200, 800, 300)  # Frequency sweep
            # Level complete - victory sound
            self.sounds['level'] = self.create_arpeggio([523, 659, 784], 100)  # C-E-G chord
            # Collision - impact sound
            self.sounds['collision'] = self.create_noise_burst(100)  # Short noise burst
            # Achievement unlocked
            self.sounds['achievement'] = self.create_arpeggio([440, 554, 659, 880], 80)  # Success fanfare
        except Exception as e:
            print(f"Could not generate sounds: {e}")
            # Create empty sound objects as fallback
            for key in ['type', 'correct', 'wrong', 'destroy', 'boss', 'level', 'collision', 'achievement']:
                self.sounds[key] = None
    
    def create_beep(self, frequency: int, duration: int) -> pygame.mixer.Sound:
        """Create a simple beep sound"""
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            
            for i in range(samples):
                t = float(i) / sample_rate
                # Generate sine wave
                value = int(32767 * math.sin(2 * math.pi * frequency * t))
                # Apply envelope to avoid clicks
                envelope = 1.0
                if i < samples * 0.1:  # Attack
                    envelope = i / (samples * 0.1)
                elif i > samples * 0.9:  # Release
                    envelope = (samples - i) / (samples * 0.1)
                value = int(value * envelope)
                waves.append([value, value])  # Stereo
            
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            # If numpy is not available, return a silent sound
            return pygame.mixer.Sound(buffer=bytes(100))
    
    def create_noise_burst(self, duration: int) -> pygame.mixer.Sound:
        """Create a noise burst for explosions"""
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            
            for i in range(samples):
                # Generate white noise
                value = random.randint(-16384, 16384)
                # Apply envelope
                envelope = (samples - i) / samples  # Decay
                value = int(value * envelope)
                waves.append([value, value])
            
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))
    
    def create_sweep(self, start_freq: int, end_freq: int, duration: int) -> pygame.mixer.Sound:
        """Create a frequency sweep sound"""
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            
            for i in range(samples):
                t = float(i) / sample_rate
                # Linear frequency sweep
                freq = start_freq + (end_freq - start_freq) * (i / samples)
                value = int(32767 * math.sin(2 * math.pi * freq * t))
                # Apply envelope
                envelope = 1.0 - (i / samples) * 0.7  # Decay to 30%
                value = int(value * envelope)
                waves.append([value, value])
            
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))
    
    def create_arpeggio(self, frequencies: List[int], note_duration: int) -> pygame.mixer.Sound:
        """Create an arpeggio (series of notes)"""
        try:
            import numpy as np
            sample_rate = 22050
            waves = []
            
            for freq in frequencies:
                samples = int(sample_rate * note_duration / 1000)
                for i in range(samples):
                    t = float(i) / sample_rate
                    value = int(32767 * math.sin(2 * math.pi * freq * t))
                    # Apply envelope
                    envelope = 1.0
                    if i < samples * 0.1:
                        envelope = i / (samples * 0.1)
                    elif i > samples * 0.8:
                        envelope = (samples - i) / (samples * 0.2)
                    value = int(value * envelope * 0.7)  # Reduce volume
                    waves.append([value, value])
            
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))
    
    def play(self, sound_name: str):
        """Play a sound effect"""
        if self.volume > 0 and sound_name in self.sounds and self.sounds[sound_name]:
            try:
                self.sounds[sound_name].set_volume(self.volume)
                self.sounds[sound_name].play()
            except Exception:
                pass  # Silently fail if sound can't play
    
    def create_pew_sound(self) -> pygame.mixer.Sound:
        """Create a pew-pew laser shooting sound effect"""
        try:
            import numpy as np
            sample_rate = 22050
            duration = 150  # 150ms for proper pew sound
            samples = int(sample_rate * duration / 1000)
            waves = np.zeros(samples)
            
            # Create the classic pew-pew sound with rapid frequency descent
            for i in range(samples):
                t = float(i) / sample_rate
                progress = i / samples
                
                # Classic laser sound: starts at 1200Hz and drops to 100Hz
                # Using power function for more dramatic sweep
                freq = 1200 * ((1 - progress) ** 3) + 100
                
                # Main oscillator
                wave = math.sin(2 * math.pi * freq * t)
                
                # Add a second oscillator for richness
                wave += 0.3 * math.sin(2 * math.pi * freq * 1.5 * t)
                
                # Amplitude envelope - quick attack, sustained, then decay
                if progress < 0.01:  # Attack
                    amplitude = progress / 0.01
                elif progress < 0.3:  # Sustain at full volume
                    amplitude = 1.0
                else:  # Decay
                    amplitude = (1 - progress) / 0.7
                
                # Apply amplitude and scale
                waves[i] = wave * amplitude * 16000
            
            # Convert to stereo
            stereo_waves = np.array([[w, w] for w in waves], dtype=np.int16)
            sound = pygame.sndarray.make_sound(stereo_waves)
            return sound
        except ImportError:
            # If numpy not available, use the sweep as fallback
            return self.create_sweep(1200, 100, 150)
    
    def create_laser(self, start_freq: int, end_freq: int, duration: int) -> pygame.mixer.Sound:
        """Create a laser shooting sound effect"""
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            
            for i in range(samples):
                t = float(i) / sample_rate
                # Rapid frequency sweep for laser effect
                progress = i / samples
                freq = start_freq * (1 - progress) + end_freq * progress
                
                # Add some noise for texture
                noise = random.uniform(-0.1, 0.1)
                
                # Generate the wave with quick decay
                value = int(20000 * (math.sin(2 * math.pi * freq * t) + noise * 0.3))
                
                # Quick exponential decay envelope
                envelope = math.exp(-5 * progress)
                value = int(value * envelope)
                
                # Add slight distortion for laser effect
                if abs(value) > 16000:
                    value = 16000 if value > 0 else -16000
                
                waves.append([value, value])
            
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            # Fallback to simple sweep if numpy not available
            return self.create_sweep(start_freq, end_freq, duration)
    
    def set_volume(self, volume: float):
        """Set the volume for all sounds"""
        self.volume = max(0.0, min(1.0, volume))

class GameSettings:
    """Modern settings management with persistence"""
    
    def __init__(self) -> None:
        # Create .ptype directory in user's home folder
        from pathlib import Path
        self.save_dir = Path.home() / ".ptype"
        self.save_dir.mkdir(exist_ok=True)
        
        # Set file paths in .ptype directory
        self.settings_file: str = str(self.save_dir / "settings.json")
        self.high_scores_file: str = str(self.save_dir / "scores.json")
        self.profiles_file: str = str(self.save_dir / "profiles.json")
        self.saves_file: str = str(self.save_dir / "saves.json")
        
        # Player profile
        self.current_profile: Optional[PlayerProfile] = None
        self.profiles: Dict[str, PlayerProfile] = {}
        self.current_player_name: str = ""
        
        # Default settings
        self.music_volume: float = 0.7
        self.sound_volume: float = 0.8
        
        # High scores - now stores list of HighScoreEntry objects
        self.high_scores: Dict[str, List[HighScoreEntry]] = {}
        self.personal_bests: Dict[str, Dict[str, Any]] = {}
        
        self.load_all_data()
    
    def load_all_data(self) -> None:
        """Load all game data"""
        self.load_settings()
        self.load_profiles()
        self.load_scores()
    
    def save_settings(self) -> None:
        """Save settings to file"""
        settings_data = {
            "music_volume": self.music_volume,
            "sound_volume": self.sound_volume,
            "current_player": self.current_profile.name if self.current_profile else "",
            "current_player_name": self.current_player_name
        }
        
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(settings_data, f, indent=2)
        except (IOError, OSError) as e:
            print(f"Could not save settings: {e}")
    
    def save_profiles(self) -> None:
        """Save player profiles"""
        profiles_data = {
            "profiles": {},
            "current_player": self.current_profile.name if self.current_profile else ""
        }
        for name, profile in self.profiles.items():
            if isinstance(profile, PlayerProfile):
                # Convert profile to dict, handling special types
                profile_dict = {}
                for key, value in profile.__dict__.items():
                    if isinstance(value, set):
                        profile_dict[key] = list(value)  # Convert sets to lists for JSON
                    else:
                        profile_dict[key] = value
                profiles_data["profiles"][name] = profile_dict
            else:
                # Profile is already a dict
                profiles_data["profiles"][name] = profile
        
        try:
            with open(self.profiles_file, 'w') as f:
                json.dump(profiles_data, f, indent=2)
        except (IOError, OSError) as e:
            print(f"Could not save profiles: {e}")
    
    def save_game(self, game_state: Dict) -> bool:
        """Save game to current player's profile for current mode"""
        if not self.current_profile:
            return False
        
        import datetime
        game_state['save_time'] = datetime.datetime.now().isoformat()
        game_state['player_name'] = self.current_profile.name
        
        # Determine mode and language
        mode = game_state.get('game_mode', 'normal')
        language = game_state.get('programming_language') if mode == 'programming' else None
        
        # Save to current player's profile for this mode
        self.current_profile.set_saved_game(mode, game_state, language)
        self.current_profile.last_played = datetime.datetime.now().isoformat()
        
        # Save profiles to file
        self.save_profiles()
        return True
    
    def load_game_for_current_profile(self) -> Optional[Dict]:
        """Load saved game for current profile"""
        if self.current_profile and self.current_profile.saved_game:
            return self.current_profile.saved_game
        return None
    
    def load_settings(self) -> None:
        """Load settings from file"""
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, 'r') as f:
                    data = json.load(f)
                    self.music_volume = max(0.0, min(1.0, data.get("music_volume", 0.7)))
                    self.sound_volume = max(0.0, min(1.0, data.get("sound_volume", 0.8)))
                    # Try both keys for backward compatibility
                    self.current_player_name = data.get("current_player_name", data.get("current_player", ""))
        except (IOError, OSError, json.JSONDecodeError) as e:
            print(f"Could not load settings: {e}")
    
    def load_profiles(self) -> None:
        """Load player profiles"""
        try:
            if os.path.exists(self.profiles_file):
                with open(self.profiles_file, 'r') as f:
                    data = json.load(f)
                    
                    # Handle both old and new formats
                    if "profiles" in data:
                        # New format with profiles dict
                        profiles_dict = data["profiles"]
                        self.current_player_name = data.get("current_player", "")
                    else:
                        # Old format - data is directly the profiles
                        profiles_dict = data
                    
                    for name, profile_data in profiles_dict.items():
                        profile = PlayerProfile(name)
                        for key, value in profile_data.items():
                            if key == 'languages_played' and isinstance(value, list):
                                # Convert list back to set for languages_played
                                setattr(profile, key, set(value))
                            else:
                                setattr(profile, key, value)
                        self.profiles[name] = profile
        except (IOError, OSError, json.JSONDecodeError) as e:
            print(f"Could not load profiles: {e}")
    
    
    def save_scores(self):
        """Save scores to file"""
        # Convert HighScoreEntry objects to dicts for JSON serialization
        serializable_scores = {}
        for key, entries in self.high_scores.items():
            serializable_scores[key] = [
                {
                    'player_name': entry.player_name,
                    'score': entry.score,
                    'level': entry.level,
                    'wpm': entry.wpm,
                    'accuracy': entry.accuracy,
                    'timestamp': entry.timestamp,
                    'mode': entry.mode,
                    'language': entry.language
                }
                for entry in entries
            ]
        
        scores_data = {
            "high_scores": serializable_scores,
            "personal_bests": self.personal_bests
        }
        
        try:
            with open(self.high_scores_file, 'w') as f:
                json.dump(scores_data, f, indent=2)
        except (IOError, OSError) as e:
            print(f"Could not save scores: {e}")
    
    def load_scores(self):
        """Load scores from file"""
        try:
            if os.path.exists(self.high_scores_file):
                with open(self.high_scores_file, 'r') as f:
                    data = json.load(f)
                    # Convert old format to new format if needed
                    loaded_scores = data.get("high_scores", {})
                    self.high_scores = {}
                    for key, value in loaded_scores.items():
                        if isinstance(value, list):
                            # Already in new format (list of entries)
                            self.high_scores[key] = []
                            for entry_data in value:
                                if isinstance(entry_data, dict):
                                    # Reconstruct HighScoreEntry from dict
                                    entry = HighScoreEntry(
                                        player_name=entry_data.get('player_name', 'Anonymous'),
                                        score=entry_data.get('score', 0),
                                        level=entry_data.get('level', 1),
                                        wpm=entry_data.get('wpm', 0.0),
                                        accuracy=entry_data.get('accuracy', 0.0),
                                        timestamp=entry_data.get('timestamp', ''),
                                        mode=entry_data.get('mode', 'normal'),
                                        language=entry_data.get('language')
                                    )
                                    self.high_scores[key].append(entry)
                        else:
                            # Old format - initialize as empty list
                            self.high_scores[key] = []
                    
                    self.personal_bests = data.get("personal_bests", {})
        except (IOError, OSError, json.JSONDecodeError) as e:
            print(f"Could not load scores: {e}")
    
    def add_high_score(self, mode: GameMode, score: int, level: int, wpm: float, accuracy: float, language: Optional[str] = None) -> int:
        """Add a high score entry and return its position (1-based, 0 if not in top 10)"""
        import datetime
        
        # Create the score entry
        entry = HighScoreEntry(
            player_name=self.current_profile.name if self.current_profile else "Anonymous",
            score=score,
            level=level,
            wpm=wpm,
            accuracy=accuracy,
            timestamp=datetime.datetime.now().isoformat(),
            mode=mode.value,
            language=language
        )
        
        # Get the key for this mode/language combination
        key = f"{mode.value}_{language}" if language else mode.value
        
        # Initialize list if not exists
        if key not in self.high_scores:
            self.high_scores[key] = []
        
        # Add the entry and sort
        self.high_scores[key].append(entry)
        self.high_scores[key].sort(key=lambda x: x.score, reverse=True)
        
        # Keep only top 10
        self.high_scores[key] = self.high_scores[key][:10]
        
        # Find position (1-based)
        position = 0
        for i, e in enumerate(self.high_scores[key]):
            if e == entry:
                position = i + 1
                break
        
        # Update personal best
        self.update_personal_best(mode, score, level, wpm, accuracy, language)
        
        self.save_scores()
        return position
    
    def update_personal_best(self, mode: GameMode, score: int, level: int, wpm: float, accuracy: float, language: Optional[str] = None) -> bool:
        """Update personal best for current player"""
        if not self.current_profile:
            return False
        
        player_key = self.current_profile.name
        mode_key = f"{mode.value}_{language}" if language else mode.value
        
        if player_key not in self.personal_bests:
            self.personal_bests[player_key] = {}
        
        if mode_key not in self.personal_bests[player_key]:
            self.personal_bests[player_key][mode_key] = {
                "score": 0, "level": 0, "wpm": 0.0, "accuracy": 0.0
            }
        
        current_best = self.personal_bests[player_key][mode_key]
        if score > current_best["score"]:
            self.personal_bests[player_key][mode_key] = {
                "score": score, "level": level, "wpm": wpm, "accuracy": accuracy
            }
            return True
        return False
    
    def get_high_scores(self, mode: GameMode, language: Optional[str] = None, limit: int = 10) -> List[HighScoreEntry]:
        """Get high scores for a specific mode/language"""
        key = f"{mode.value}_{language}" if language else mode.value
        return self.high_scores.get(key, [])[:limit]

def draw_3d_ship(screen, x, y, width, height, color, is_player=False, active=False, pulse=0):
    """Draw a modern 3D-style ship with advanced lighting, shadows and effects
    
    Args:
        pulse: Animation value 0-1 for pulsing effects
    """
    if is_player:
        # Player ship - sleek fighter design pointing up
        # Enhanced 3D lighting
        main_color = color
        light_color = tuple(min(255, c + 80) for c in color)
        dark_color = tuple(max(0, c - 60) for c in color)
        shadow_color = tuple(max(0, c - 100) for c in color)
        specular_color = tuple(min(255, c + 120) for c in color)
        
        # Drop shadow for depth
        shadow_offset = 3
        shadow_hull = [
            (x + shadow_offset, y + shadow_offset),
            (x - width//3 + shadow_offset, y + height//2 + shadow_offset),
            (x + shadow_offset, y + height + shadow_offset),
            (x + width//3 + shadow_offset, y + height//2 + shadow_offset)
        ]
        shadow_surface = pygame.Surface((width * 2, height * 2), pygame.SRCALPHA)
        pygame.draw.polygon(shadow_surface, (*shadow_color, 80), 
                          [(p[0] - x + width, p[1] - y + height//2) for p in shadow_hull])
        screen.blit(shadow_surface, (x - width, y - height//2))
        
        # Main hull with gradient
        hull_points = [
            (x, y),  # Top point (nose)
            (x - width//3, y + height//2),  # Left
            (x, y + height),  # Bottom
            (x + width//3, y + height//2)   # Right
        ]
        pygame.draw.polygon(screen, dark_color, hull_points)
        
        # Multiple highlight layers for depth
        highlight_points = [
            (x, y + 2),
            (x - width//5, y + height//4),
            (x, y + height//3)
        ]
        pygame.draw.polygon(screen, light_color, highlight_points)
        
        # Specular highlight
        spec_points = [
            (x - 2, y + 5),
            (x - width//8, y + height//6),
            (x + 2, y + height//5)
        ]
        pygame.draw.polygon(screen, specular_color, spec_points)
        
        # Enhanced 3D wings with metallic finish
        left_wing = [
            (x - width//3, y + height//2),
            (x - width//2 - 5, y + height//2 - 15),
            (x - width//2, y + height//2),
            (x - width//3 + 5, y + height//2 + 10)
        ]
        right_wing = [
            (x + width//3, y + height//2),
            (x + width//2 + 5, y + height//2 - 15),
            (x + width//2, y + height//2),
            (x + width//3 - 5, y + height//2 + 10)
        ]
        
        # Wing shadows
        pygame.draw.polygon(screen, shadow_color, left_wing)
        pygame.draw.polygon(screen, shadow_color, right_wing)
        
        # Wing main color
        left_wing_main = [(p[0] - 1, p[1] - 1) for p in left_wing]
        right_wing_main = [(p[0] + 1, p[1] - 1) for p in right_wing]
        pygame.draw.polygon(screen, ACCENT_BLUE, left_wing_main)
        pygame.draw.polygon(screen, ACCENT_BLUE, right_wing_main)
        
        # Wing highlights
        wing_highlight_color = tuple(min(255, c + 40) for c in ACCENT_BLUE)
        pygame.draw.line(screen, wing_highlight_color, 
                        (x - width//2 - 3, y + height//2 - 12),
                        (x - width//3, y + height//2), 2)
        pygame.draw.line(screen, wing_highlight_color,
                        (x + width//2 + 3, y + height//2 - 12),
                        (x + width//3, y + height//2), 2)
        
        # Enhanced engine glow with pulsing effect
        pulse_size = int(2 * abs(pulse))
        for i in range(8):
            alpha = max(0, 255 - i * 30)
            glow_color = (*ACCENT_CYAN[:3], alpha) if len(ACCENT_CYAN) == 3 else ACCENT_CYAN
            size = 8 - i + pulse_size
            
            # Create glow surface for proper alpha blending
            glow_surf = pygame.Surface((size * 4, size * 4), pygame.SRCALPHA)
            pygame.draw.circle(glow_surf, (*ACCENT_CYAN[:3], min(255, alpha)),
                             (size * 2, size * 2), size)
            screen.blit(glow_surf, (x - 8 - size * 2, y + height - 5 - size * 2))
            screen.blit(glow_surf, (x + 8 - size * 2, y + height - 5 - size * 2))
        
        # Engine cores
        pygame.draw.circle(screen, MODERN_WHITE, (x - 8, y + height - 5), 3)
        pygame.draw.circle(screen, MODERN_WHITE, (x + 8, y + height - 5), 3)
        
        # Enhanced cockpit with glass refraction effect
        pygame.draw.circle(screen, (0, 40, 60), (x, y + 22), 12)  # Outer ring
        pygame.draw.circle(screen, (0, 60, 100), (x, y + 21), 10)  # Middle ring  
        pygame.draw.circle(screen, NEON_GREEN, (x, y + 20), 8)  # Main cockpit
        pygame.draw.circle(screen, MODERN_WHITE, (x - 2, y + 18), 4)  # Glass reflection
        pygame.draw.circle(screen, (*MODERN_WHITE, 128), (x + 1, y + 22), 2)  # Secondary reflection
        
    else:
        # Enemy ship - aggressive design pointing down
        glow_intensity = 1.5 if active else 1.0
        main_color = tuple(min(255, int(c * glow_intensity)) for c in color)
        light_color = tuple(min(255, c + 40) for c in main_color)
        dark_color = tuple(max(0, c - 30) for c in main_color)
        
        # Main hull (aggressive diamond)
        hull_points = [
            (x, y),  # Top point (nose pointing down)
            (x - width//2, y + height//3),  # Left
            (x, y + height),  # Bottom
            (x + width//2, y + height//3)   # Right
        ]
        pygame.draw.polygon(screen, dark_color, hull_points)
        
        # 3D highlight
        highlight_points = [
            (x, y),
            (x - width//3, y + height//4),
            (x - width//4, y + height//2)
        ]
        pygame.draw.polygon(screen, light_color, highlight_points)
        
        # Weapon pods
        left_pod = [
            (x - width//2, y + height//3),
            (x - width//2 - 8, y + height//3 - 5),
            (x - width//2 - 8, y + height//2),
            (x - width//2, y + height//2 + 5)
        ]
        right_pod = [
            (x + width//2, y + height//3),
            (x + width//2 + 8, y + height//3 - 5),
            (x + width//2 + 8, y + height//2),
            (x + width//2, y + height//2 + 5)
        ]
        pygame.draw.polygon(screen, ACCENT_RED if active else MODERN_DARK_GRAY, left_pod)
        pygame.draw.polygon(screen, ACCENT_RED if active else MODERN_DARK_GRAY, right_pod)
        
        # Engine glow at rear (top)
        glow_color = ACCENT_ORANGE if active else MODERN_GRAY
        for i in range(4):
            fade_color = tuple(max(0, glow_color[j] - i * 20) for j in range(3))
            pygame.draw.circle(screen, fade_color, (x - 8, y + 8), 5 - i)
            pygame.draw.circle(screen, fade_color, (x + 8, y + 8), 5 - i)
        
        # Cockpit/sensor array
        cockpit_color = NEON_BLUE if active else ACCENT_BLUE
        pygame.draw.circle(screen, cockpit_color, (x, y + height//3), 8)
        pygame.draw.circle(screen, MODERN_WHITE, (x, y + height//3), 4)

class ModernStar:
    """Enhanced star with modern visual effects"""
    def __init__(self):
        self.x = random.randint(0, SCREEN_WIDTH)
        self.y = random.randint(0, SCREEN_HEIGHT)
        self.speed = random.uniform(0.3, 2.0)
        self.brightness = random.randint(100, 255)
        self.size = random.choice([1, 1, 1, 2, 2, 3])  # Mostly small stars
        self.twinkle = random.randint(0, 60)
        
    def update(self):
        self.y += self.speed
        if self.y > SCREEN_HEIGHT:
            self.y = -10
            self.x = random.randint(0, SCREEN_WIDTH)
        
        self.twinkle = (self.twinkle + 1) % 120
    
    def draw(self, screen):
        # Twinkling effect
        twinkle_factor = 0.7 + 0.3 * math.sin(self.twinkle * TWINKLE_MULTIPLIER)
        current_brightness = min(255, int(self.brightness * twinkle_factor))
        color = (current_brightness, current_brightness, min(255, current_brightness + 20))
        
        if self.size == 1:
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 1)
        elif self.size == 2:
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 2)
            # Add small glow
            glow_color = tuple(c // 3 for c in color)
            pygame.draw.circle(screen, glow_color, (int(self.x), int(self.y)), 3)
        else:  # size == 3
            # Bright star with cross pattern
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 2)
            pygame.draw.line(screen, color, (self.x - 4, self.y), (self.x + 4, self.y), 1)
            pygame.draw.line(screen, color, (self.x, self.y - 4), (self.x, self.y + 4), 1)

class ModernEnemy:
    """Modern enemy with enhanced 3D graphics and animations - moves toward player"""
    def __init__(self, word: str, level: int, player_x: int = SCREEN_WIDTH // 2):
        self.original_word = word
        self.word = word
        self.typed_chars = ""
        
        # Always spawn from top but at random X position
        self.x = random.randint(50, SCREEN_WIDTH - 50)
        self.y = -50
        
        # Target position (player location)
        self.target_x = player_x
        self.target_y = SCREEN_HEIGHT - 120  # Player Y position
        
        # Enhanced speed calculation
        target_wpm = BASE_WPM + ((MAX_WPM - BASE_WPM) * (level - 1) / (MAX_LEVELS - 1))
        chars_per_second = (target_wpm * 4) / 60
        self.speed = chars_per_second * len(word) / 15
        self.speed = max(0.5, min(6.0, self.speed))
        
        self.width = 60
        self.height = 45
        self.active = False
        self.level = level
        
        # Animation properties
        self.hover_offset = 0
        self.pulse = 0
        
        # Calculate initial direction
        self.calculate_direction()
        
    def calculate_direction(self):
        """Calculate movement direction toward player"""
        dx = self.target_x - self.x
        dy = self.target_y - self.y
        distance = math.sqrt(dx**2 + dy**2) if dx != 0 or dy != 0 else 1
        
        # Normalized direction vector
        self.vx = (dx / distance) * self.speed if distance > 0 else 0
        self.vy = (dy / distance) * self.speed if distance > 0 else self.speed
    
    def update(self):
        """Update position moving toward player"""
        # Move toward target
        self.x += self.vx
        self.y += self.vy
        
        # Update animations
        self.hover_offset += 0.1
        self.pulse += 0.15
        
    def draw(self, screen, font):
        # Calculate hover effect
        hover_y = self.y + math.sin(self.hover_offset) * 2
        
        # Determine ship color based on state and difficulty
        if self.active:
            base_color = NEON_PINK if self.level > 10 else ACCENT_YELLOW
        else:
            base_color = ACCENT_ORANGE if self.level > 7 else MODERN_GRAY
        
        # Draw 3D ship with pulse effect
        pulse_value = math.sin(self.pulse) * 0.5 + 0.5 if self.active else 0
        draw_3d_ship(screen, self.x, int(hover_y), self.width, self.height, base_color, False, self.active, pulse_value)
        
        # Enhanced word rendering with modern styling
        remaining_word = self.original_word[len(self.typed_chars):]
        typed_color = NEON_GREEN
        remaining_color = MODERN_WHITE if self.active else MODERN_GRAY
        
        # Word background for better readability
        full_word_surface = font.render(self.original_word, True, MODERN_WHITE)
        word_width = full_word_surface.get_width()
        word_height = full_word_surface.get_height()
        
        # Semi-transparent background - positioned in front of ship (below it)
        word_bg = pygame.Surface((word_width + 10, word_height + 4))
        word_bg.set_alpha(180)
        word_bg.fill(DARKER_BG)
        bg_rect = word_bg.get_rect(center=(self.x, hover_y + self.height + 25))
        screen.blit(word_bg, bg_rect)
        
        # Render typed part
        if self.typed_chars:
            typed_surface = font.render(self.typed_chars, True, typed_color)
            typed_rect = typed_surface.get_rect()
            typed_rect.centerx = self.x - word_width//2 + typed_surface.get_width()//2
            typed_rect.centery = hover_y + self.height + 25
            screen.blit(typed_surface, typed_rect)
        
        # Render remaining part
        if remaining_word:
            remaining_surface = font.render(remaining_word, True, remaining_color)
            remaining_rect = remaining_surface.get_rect()
            typed_width = font.render(self.typed_chars, True, typed_color).get_width() if self.typed_chars else 0
            remaining_rect.centerx = self.x - word_width//2 + typed_width + remaining_surface.get_width()//2
            remaining_rect.centery = hover_y + self.height + 25
            screen.blit(remaining_surface, remaining_rect)
        
        # Active ship indicator
        if self.active:
            pulse_size = 3 + math.sin(self.pulse) * 2
            pygame.draw.circle(screen, NEON_BLUE, (self.x, int(hover_y)), 
                             int(self.width//2 + 10 + pulse_size), 2)
    
    def is_off_screen(self, current_height=SCREEN_HEIGHT) -> bool:
        return self.y > current_height + 50
    
    def is_word_complete(self) -> bool:
        return len(self.typed_chars) == len(self.word)
    
    def type_char(self, char: str) -> bool:
        """Try to type a character. Returns True if successful."""
        if len(self.typed_chars) < len(self.word):
            if self.word[len(self.typed_chars)] == char:
                self.typed_chars += char
                return True
        return False
    
    def get_collision_rect(self) -> pygame.Rect:
        """Get collision rectangle for ship collision detection"""
        return pygame.Rect(self.x - self.width//2, self.y, self.width, self.height)

class BossEnemy(ModernEnemy):
    """Boss enemy - larger, more challenging ship that appears at level completion"""
    def __init__(self, word: str, level: int, player_x: int = SCREEN_WIDTH // 2, game_mode: GameMode = GameMode.NORMAL):
        # Store game mode before parent init
        self.game_mode = game_mode
        super().__init__(word, level, player_x)
        
        # Boss ships are larger and more imposing
        self.width = 120  # Double the normal width
        self.height = 90  # Double the normal height
        self.is_boss = True
        
        # Adjust boss speed based on game mode and word length
        # Bosses should move MUCH slower than regular enemies for dramatic effect
        if game_mode == GameMode.PROGRAMMING:
            # Programming bosses need special handling due to very long code snippets
            # Base speed reduction for bosses - EVEN SLOWER
            base_reduction = 0.05  # Start with only 5% of original speed (reduced from 8%)
            
            # Further reduce based on word length
            if len(word) > 50:
                self.speed = min(0.5, self.speed * base_reduction * 0.4)  # Extra slow for very long code
            elif len(word) > 30:
                self.speed = min(0.6, self.speed * base_reduction * 0.6)  # Slower for medium code
            else:
                self.speed = min(0.8, self.speed * base_reduction)  # Still slow for short code
        else:
            # Normal mode boss speed - much slower than regular enemies
            # Boss words are usually long, so give player more time
            # Reduced for expanded 500+ word dictionary
            base_reduction = 0.06  # Start with only 6% of original speed (reduced from 10%)
            
            # Further adjust based on level
            if level > 15:
                self.speed = self.speed * base_reduction * 1.3  # 8% at high levels (0.06 * 1.3 ≈ 0.08)
            elif level > 10:
                self.speed = self.speed * base_reduction * 1.1  # 6.6% at medium levels
            else:
                self.speed = self.speed * base_reduction  # 6% at low levels
        
        # Ensure minimum speed but cap maximum for bosses
        self.speed = max(0.2, min(1.0, self.speed))  # Boss speed between 0.2 and 1.0 (reduced max)
        
        # Special boss properties
        self.boss_glow = 0
        self.shield_pulse = 0
        
        # Position boss in center for dramatic entrance
        self.x = SCREEN_WIDTH // 2
        
    def update(self):
        super().update()
        self.boss_glow += 0.08
        self.shield_pulse += 0.12
        
    def draw(self, screen, font):
        # Calculate hover effect
        hover_y = self.y + math.sin(self.hover_offset) * 3  # More dramatic hover
        
        # Boss ships have special coloring
        if self.active:
            base_color = NEON_PINK  # Bright pink for active boss
        else:
            base_color = ACCENT_PURPLE  # Purple for inactive boss
        
        # Draw boss with enhanced 3D effect and special glow
        pulse_value = math.sin(self.boss_glow) * 0.7 + 0.3  # Stronger pulse for boss
        draw_3d_ship(screen, self.x, int(hover_y), self.width, self.height, base_color, False, self.active, pulse_value)
        
        # Draw boss shield effect - multiple layers
        for i in range(3):
            shield_alpha = int(100 + 30 * math.sin(self.shield_pulse + i * 0.5))
            ring_size = self.width//2 + 20 + i * 10
            shield_surface = pygame.Surface((ring_size * 2, ring_size * 2), pygame.SRCALPHA)
            pygame.draw.circle(shield_surface, (*NEON_PINK[:3], shield_alpha), 
                              (ring_size, ring_size), ring_size, 2)
            screen.blit(shield_surface, (self.x - ring_size, int(hover_y) + self.height//2 - ring_size))
        
        # Draw enlarged 3D ship
        draw_3d_ship(screen, self.x, int(hover_y), self.width, self.height, base_color, False, self.active)
        
        # Boss glow effect - remove the filled rectangle
        
        # Enhanced word rendering with boss styling
        remaining_word = self.original_word[len(self.typed_chars):]
        typed_color = NEON_GREEN
        remaining_color = ACCENT_YELLOW if self.active else MODERN_WHITE
        
        # Larger font for boss words (if available)
        # Word background with boss styling
        full_word_surface = font.render(self.original_word, True, MODERN_WHITE)
        word_width = full_word_surface.get_width()
        word_height = full_word_surface.get_height()
        
        # Enhanced background for boss words - positioned in front of boss ship (below it)
        word_bg = pygame.Surface((word_width + 20, word_height + 8))
        word_bg.set_alpha(200)
        word_bg.fill(DARKER_BG)
        pygame.draw.rect(word_bg, ACCENT_ORANGE, word_bg.get_rect(), 2)
        bg_rect = word_bg.get_rect(center=(self.x, hover_y + self.height + 35))
        screen.blit(word_bg, bg_rect)
        
        # Render typed part with boss styling
        if self.typed_chars:
            typed_surface = font.render(self.typed_chars, True, typed_color)
            typed_rect = typed_surface.get_rect()
            typed_rect.centerx = self.x - word_width//2 + typed_surface.get_width()//2
            typed_rect.centery = hover_y + self.height + 35
            screen.blit(typed_surface, typed_rect)
        
        # Render remaining part with boss styling
        if remaining_word:
            remaining_surface = font.render(remaining_word, True, remaining_color)
            remaining_rect = remaining_surface.get_rect()
            typed_width = font.render(self.typed_chars, True, typed_color).get_width() if self.typed_chars else 0
            remaining_rect.centerx = self.x - word_width//2 + typed_width + remaining_surface.get_width()//2
            remaining_rect.centery = hover_y + self.height + 35
            screen.blit(remaining_surface, remaining_rect)
        
        # Special boss active indicator
        if self.active:
            pulse_size = 5 + math.sin(self.pulse) * 3
            # Multiple rings for boss
            for i in range(3):
                ring_size = int(self.width//2 + 20 + pulse_size + i * 10)
                ring_alpha = max(50, 150 - i * 40)
                ring_surface = pygame.Surface((ring_size * 2, ring_size * 2))
                ring_surface.set_alpha(ring_alpha)
                pygame.draw.circle(ring_surface, NEON_PINK, (ring_size, ring_size), ring_size, 3)
                ring_rect = ring_surface.get_rect(center=(self.x, int(hover_y) + self.height//2))
                screen.blit(ring_surface, ring_rect)

class ModernPlayerShip:
    """Enhanced player ship with 3D graphics and responsive positioning.
    
    The player ship automatically centers horizontally and positions itself at the
    bottom of the window (120px from bottom) with fixed width window.
    """
    def __init__(self, window_height=SCREEN_HEIGHT):
        # Always use fixed width
        window_width = SCREEN_WIDTH
        
        self.x = window_width // 2  # Center horizontally with fixed width
        self.y = window_height - 120  # Position relative to current window height
        self.width = 70
        self.height = 60
        self.pulse = 0
        self.window_height = window_height
        self.window_width = window_width
        
    def update(self):
        self.pulse += 0.1
        
    def draw(self, screen):
        # Draw 3D player ship with pulse effect
        pulse_value = math.sin(self.pulse) * 0.5 + 0.5
        draw_3d_ship(screen, self.x, self.y, self.width, self.height, ACCENT_CYAN, True, False, pulse_value)
        
        # Add enhanced shield effect with proper alpha blending
        shield_alpha = int(50 + 30 * math.sin(self.pulse))
        shield_surface = pygame.Surface((self.width + 40, self.height + 40), pygame.SRCALPHA)
        
        # Multi-layer shield for depth
        for i in range(3):
            ring_alpha = shield_alpha // (i + 1)
            ring_color = (*NEON_BLUE[:3], ring_alpha)
            pygame.draw.ellipse(shield_surface, ring_color,
                              (i * 5, i * 5, self.width + 40 - i * 10, self.height + 40 - i * 10), 2)
        
        shield_rect = shield_surface.get_rect(center=(self.x, self.y + self.height//2))
        screen.blit(shield_surface, shield_rect)
    
    def update_position_for_window_dimensions(self, new_width, new_height):
        """Update player ship position when window dimensions change"""
        self.window_height = new_height
        self.window_width = SCREEN_WIDTH  # Always use fixed width
        self.x = SCREEN_WIDTH // 2  # Re-center horizontally with fixed width
        self.y = new_height - 120  # Position at bottom
    
    def get_collision_rect(self) -> pygame.Rect:
        """Get collision rectangle for ship collision detection"""
        return pygame.Rect(self.x - self.width//2, self.y, self.width, self.height)

class LaserBeam:
    """Laser beam burst effect from player to enemy"""
    def __init__(self, start_x: int, start_y: int, end_x: int, end_y: int):
        self.start_x = start_x
        self.start_y = start_y
        self.end_x = end_x
        self.end_y = end_y
        self.life = 6  # Very short burst - only 6 frames
        self.max_life = 6
        self.color = NEON_GREEN
        self.width = 4  # Thicker for more visibility in short time
    
    def update(self):
        self.life -= 1
    
    def draw(self, screen):
        if self.life > 0:
            # Strong initial burst that quickly fades
            alpha = (self.life / self.max_life) ** 0.5  # Square root for sharper fade
            
            # Draw burst effect with multiple beams
            for beam in range(3):  # Multiple beam lines for burst effect
                # Slightly offset each beam for spread effect
                offset_x = random.randint(-2, 2) * (1 - alpha)
                offset_y = random.randint(-2, 2) * (1 - alpha)
                
                # Draw beam layers for glow
                for i in range(4):
                    width = max(1, self.width - i)
                    # Bright core, dimmer edges
                    intensity = alpha * (1 - i * 0.2)
                    
                    if intensity > 0:
                        # Color gets brighter in the center
                        if i == 0:
                            color = MODERN_WHITE if self.life > self.max_life * 0.8 else self.color
                        else:
                            color = (int(self.color[0] * intensity),
                                   int(self.color[1] * intensity),
                                   int(self.color[2] * intensity))
                        
                        # Draw the beam segment
                        pygame.draw.line(screen, color,
                                       (self.start_x + offset_x, self.start_y + offset_y),
                                       (self.end_x + offset_x * 2, self.end_y + offset_y * 2),
                                       width)
            
            # Add muzzle flash at start point for first frame
            if self.life >= self.max_life - 1:
                pygame.draw.circle(screen, MODERN_WHITE, (self.start_x, self.start_y), 8)
                pygame.draw.circle(screen, self.color, (self.start_x, self.start_y), 12, 2)
            
            # Add impact burst at end point
            if self.life > self.max_life * 0.5:
                burst_size = int((self.max_life - self.life + 1) * 3)
                pygame.draw.circle(screen, self.color, (self.end_x, self.end_y), burst_size, 1)
                if self.life > self.max_life * 0.8:
                    pygame.draw.circle(screen, MODERN_WHITE, (self.end_x, self.end_y), burst_size // 2)
    
    def is_finished(self) -> bool:
        return self.life <= 0

class TypingEffect:
    """Visual effect when typing characters"""
    def __init__(self, x: int, y: int, char: str, correct: bool = True):
        self.x = x
        self.y = y
        self.char = char
        self.correct = correct
        self.life = 30
        self.max_life = 30
        self.particles = []
        
        # Create sparkle particles for correct typing
        if correct:
            for _ in range(8):
                angle = random.uniform(0, 2 * math.pi)
                speed = random.uniform(2, 5)
                self.particles.append({
                    'x': x,
                    'y': y,
                    'vx': math.cos(angle) * speed,
                    'vy': math.sin(angle) * speed - 2,  # Bias upward
                    'life': random.randint(15, 25),
                    'size': random.randint(1, 3),
                    'color': random.choice([NEON_GREEN, ACCENT_CYAN, MODERN_WHITE])
                })
    
    def update(self):
        self.life -= 1
        for particle in self.particles:
            particle['x'] += particle['vx']
            particle['y'] += particle['vy']
            particle['life'] -= 1
            particle['vx'] *= 0.95
            particle['vy'] += 0.2  # Gravity
        self.particles = [p for p in self.particles if p['life'] > 0]
    
    def draw(self, screen, font):
        # Draw the character floating up
        alpha_ratio = self.life / self.max_life
        if alpha_ratio > 0:
            # Character with fade effect
            color = NEON_GREEN if self.correct else ACCENT_RED
            char_surf = font.render(self.char, True, color)
            char_surf.set_alpha(int(255 * alpha_ratio))
            char_y = self.y - (self.max_life - self.life) * 2  # Float upward
            screen.blit(char_surf, (self.x, char_y))
            
            # Draw particles
            for particle in self.particles:
                p_alpha = particle['life'] / 25
                p_color = tuple(int(c * p_alpha) for c in particle['color'])
                pygame.draw.circle(screen, p_color,
                                 (int(particle['x']), int(particle['y'])),
                                 particle['size'])
    
    def is_finished(self) -> bool:
        return self.life <= 0 and len(self.particles) == 0

class ModernExplosion:
    """Enhanced explosion with particle effects"""
    def __init__(self, x: int, y: int, size: str = "normal"):
        self.x = x
        self.y = y
        self.particles = []
        
        # Adjust particle count based on size
        if size == "large":
            particle_count = 40
        elif size == "small":
            particle_count = 12
        else:
            particle_count = 25
        
        # Create more particles with varied properties
        for _ in range(particle_count):
            angle = random.uniform(0, 2 * math.pi)
            if size == "large":
                speed = random.uniform(3, 15)
            elif size == "small":
                speed = random.uniform(2, 6)
            else:
                speed = random.uniform(3, 12)
            self.particles.append({
                'x': x,
                'y': y,
                'vx': math.cos(angle) * speed,
                'vy': math.sin(angle) * speed,
                'life': random.randint(50, 70),
                'max_life': 70,
                'size': random.randint(3, 8) if size == "large" else (random.randint(1, 3) if size == "small" else random.randint(2, 6)),
                'color_type': random.choice(['fire', 'spark', 'smoke'])
            })
    
    def update(self):
        for particle in self.particles:
            particle['x'] += particle['vx']
            particle['y'] += particle['vy']
            particle['life'] -= 1
            particle['vx'] *= PARTICLE_DRAG
            particle['vy'] *= PARTICLE_DRAG
            particle['vy'] += PARTICLE_GRAVITY
        
        self.particles = [p for p in self.particles if p['life'] > 0]
    
    def draw(self, screen):
        for particle in self.particles:
            life_ratio = particle['life'] / particle['max_life']
            size = max(1, int(particle['size'] * life_ratio))
            
            # Different particle types
            if particle['color_type'] == 'fire':
                if life_ratio > 0.7:
                    color = (255, 255, int(255 * life_ratio))
                elif life_ratio > 0.3:
                    color = (255, int(255 * life_ratio), 0)
                else:
                    color = (int(200 * life_ratio), 0, 0)
            elif particle['color_type'] == 'spark':
                color = (255, 255, int(255 * life_ratio))
            else:  # smoke
                gray_val = int(100 * life_ratio)
                color = (gray_val, gray_val, gray_val)
            
            pygame.draw.circle(screen, color, 
                             (int(particle['x']), int(particle['y'])), size)
    
    def is_finished(self) -> bool:
        return len(self.particles) == 0

class ModernButton:
    """Sleek modern button with hover effects and disabled state"""
    def __init__(self, x, y, width, height, text, font, primary=False):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.font = font
        self.primary = primary
        self.is_hovered = False
        self.is_disabled = False
        self.click_animation = 0
        
    def handle_event(self, event):
        if self.is_disabled:
            return False  # Don't handle events when disabled
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.click_animation = 10
                return True
        return False
    
    def update(self):
        if self.click_animation > 0:
            self.click_animation -= 1
    
    def draw(self, screen):
        # Button colors
        if self.is_disabled:
            # Disabled state - grayed out
            base_color = (60, 60, 60)
            hover_color = (60, 60, 60)
            text_color = MODERN_GRAY
        elif self.primary:
            base_color = ACCENT_BLUE
            hover_color = NEON_BLUE
            text_color = MODERN_WHITE
        else:
            base_color = MODERN_DARK_GRAY
            hover_color = MODERN_GRAY
            text_color = MODERN_LIGHT
        
        # Current color based on state
        current_color = hover_color if (self.is_hovered and not self.is_disabled) else base_color
        
        # Click animation
        rect = self.rect.copy()
        if self.click_animation > 0:
            shrink = self.click_animation // 2
            rect.inflate_ip(-shrink, -shrink)
        
        # Draw button with gradient effect
        pygame.draw.rect(screen, current_color, rect, border_radius=8)
        
        # Highlight edge
        if self.is_hovered:
            pygame.draw.rect(screen, MODERN_WHITE, rect, 2, border_radius=8)
        
        # Button text
        text_surface = self.font.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=rect.center)
        screen.blit(text_surface, text_rect)

class ModernDropdown:
    """Sleek dropdown menu with smart positioning"""
    def __init__(self, x, y, width, height, options, font, selected_index=0, window_height=None):
        self.rect = pygame.Rect(x, y, width, height)
        self.options = list(options)  # Ensure options is a list
        self.font = font
        self.selected_index = min(selected_index, len(self.options) - 1) if self.options else 0
        self.is_open = False
        self.is_hovered = False
        
        # Use provided window height or try to get it from display
        if window_height is None:
            try:
                surface = pygame.display.get_surface()
                window_height = surface.get_height() if surface else SCREEN_HEIGHT
            except:
                window_height = SCREEN_HEIGHT
        
        # Calculate if dropdown should open upward or downward
        # We want to show all 8 options if possible
        desired_height = height * len(options)
        space_below = window_height - (y + height)
        space_above = y
        
        # Prefer opening downward
        self.open_upward = False  # Always open downward for consistency
        
        # Calculate how many options we can show
        available_space = space_below
        
        # For the mode dropdown, limit to what can actually fit on screen
        # Calculate how many can actually fit without going off screen
        max_that_fit = int(available_space // height) if height > 0 else 5
        # Limit to 5 options visible at once for better UX
        self.max_visible = min(5, max_that_fit, len(options))
        
        self.scroll_offset = 0
        self.option_rects = []
        self._update_option_rects()
    
    def _update_option_rects(self):
        """Update option rectangles based on current scroll offset"""
        self.option_rects = []
        
        for i in range(min(self.max_visible, len(self.options))):
            option_index = i + self.scroll_offset
            if option_index >= len(self.options):
                break
                
            if self.open_upward:
                option_y = self.rect.y - self.rect.height * (i + 1)
            else:
                option_y = self.rect.y + self.rect.height * (i + 1)
                
            option_rect = pygame.Rect(self.rect.x, option_y, self.rect.width, self.rect.height)
            self.option_rects.append((option_rect, option_index))
    
    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            # Handle scroll wheel as buttons 4/5 (standard for mouse wheel)
            if self.is_open and event.button in [4, 5]:
                if len(self.options) > self.max_visible:
                    if event.button == 4:  # Scroll up
                        self.scroll_offset = max(0, self.scroll_offset - 1)
                    elif event.button == 5:  # Scroll down
                        self.scroll_offset = min(len(self.options) - self.max_visible, self.scroll_offset + 1)
                    self._update_option_rects()
                return True
            # Handle regular left click (button 1)
            elif event.button == 1:
                if self.rect.collidepoint(event.pos):
                    self.is_open = not self.is_open
                    if self.is_open:
                        # Ensure selected option is visible when opening
                        if self.selected_index < self.scroll_offset:
                            self.scroll_offset = self.selected_index
                        elif self.selected_index >= self.scroll_offset + self.max_visible:
                            self.scroll_offset = self.selected_index - self.max_visible + 1
                        self._update_option_rects()
                    return True
                elif self.is_open:
                    # Check if click is on any option
                    clicked_option = False
                    for rect, option_index in self.option_rects:
                        if rect.collidepoint(event.pos):
                            self.selected_index = option_index
                            self.is_open = False
                            clicked_option = True
                            return True
                    
                    # If dropdown is open but click wasn't on an option, close it
                    # and return True to consume the event (prevent click-through)
                    self.is_open = False
                    return True  # Consume the event even if not clicking an option
        # Handle scrolling when dropdown is open (pygame.MOUSEWHEEL event)
        elif hasattr(pygame, 'MOUSEWHEEL') and event.type == pygame.MOUSEWHEEL and self.is_open:
            if len(self.options) > self.max_visible:
                # Scroll up with positive y, down with negative y
                self.scroll_offset = max(0, min(len(self.options) - self.max_visible, 
                                              self.scroll_offset - event.y))
                self._update_option_rects()
            return True
        # Handle keyboard navigation when dropdown is open
        elif event.type == pygame.KEYDOWN and self.is_open:
            if event.key == pygame.K_UP:
                # Move selection up
                if self.selected_index > 0:
                    self.selected_index -= 1
                    # Scroll up if needed
                    if self.selected_index < self.scroll_offset:
                        self.scroll_offset = self.selected_index
                        self._update_option_rects()
                return True
            elif event.key == pygame.K_DOWN:
                # Move selection down
                if self.selected_index < len(self.options) - 1:
                    self.selected_index += 1
                    # Scroll down if needed
                    if self.selected_index >= self.scroll_offset + self.max_visible:
                        self.scroll_offset = self.selected_index - self.max_visible + 1
                        self._update_option_rects()
                return True
            elif event.key == pygame.K_RETURN:
                # Select current item and close
                self.is_open = False
                return True
            elif event.key == pygame.K_ESCAPE:
                # Close without selecting
                self.is_open = False
                return True
        return False
    
    def draw(self, screen):
        # Main dropdown button
        color = ACCENT_BLUE if self.is_hovered else MODERN_DARK_GRAY
        pygame.draw.rect(screen, color, self.rect, border_radius=6)
        pygame.draw.rect(screen, MODERN_WHITE, self.rect, 2, border_radius=6)
        
        # Selected option text
        text = self.options[self.selected_index] if self.options else "Empty"
        text_surface = self.font.render(text, True, MODERN_WHITE)
        text_rect = text_surface.get_rect(center=self.rect.center)
        text_rect.x = self.rect.x + 10  # Left align
        screen.blit(text_surface, text_rect)
        
        # Arrow (pointing up if opening upward, down if opening downward)
        arrow_points = [
            (self.rect.right - 20, self.rect.centery - 5),
            (self.rect.right - 10, self.rect.centery + 5),
            (self.rect.right - 30, self.rect.centery + 5)
        ]
        pygame.draw.polygon(screen, MODERN_WHITE, arrow_points)
        
        # Options when open
        if self.is_open:
            # Draw each option directly below the dropdown
            y_offset = self.rect.bottom + 2
            
            # First draw a background for all options
            total_height = min(len(self.options), self.max_visible) * self.rect.height
            bg_rect = pygame.Rect(self.rect.x, y_offset, self.rect.width, total_height + 4)
            pygame.draw.rect(screen, DARKER_BG, bg_rect)  # Dark background
            pygame.draw.rect(screen, MODERN_WHITE, bg_rect, 2)  # White border
            
            # Then draw the visible options
            visible_start = self.scroll_offset
            visible_end = min(self.scroll_offset + self.max_visible, len(self.options))
            
            mouse_pos = pygame.mouse.get_pos()
            
            for i in range(visible_start, visible_end):
                option_y = y_offset + (i - visible_start) * self.rect.height + 2
                option_rect = pygame.Rect(self.rect.x + 2, option_y, self.rect.width - 4, self.rect.height - 2)
                
                # Highlight logic
                if i == self.selected_index:
                    pygame.draw.rect(screen, ACCENT_GREEN, option_rect, border_radius=4)
                elif option_rect.collidepoint(mouse_pos):
                    pygame.draw.rect(screen, ACCENT_BLUE, option_rect, border_radius=4)
                else:
                    pygame.draw.rect(screen, MODERN_DARK_GRAY, option_rect, border_radius=4)
                
                # Draw text
                text = self.font.render(self.options[i], True, MODERN_WHITE)
                text_rect = text.get_rect(midleft=(option_rect.x + 10, option_rect.centery))
                screen.blit(text, text_rect)
            
            # Update option_rects for click handling
            self.option_rects = []
            for i in range(visible_start, visible_end):
                option_y = y_offset + (i - visible_start) * self.rect.height + 2
                option_rect = pygame.Rect(self.rect.x + 2, option_y, self.rect.width - 4, self.rect.height - 2)
                self.option_rects.append((option_rect, i))
            
            # Visual scrollbar on the right (if scrollable)
            if len(self.options) > self.max_visible:
                scrollbar_track = pygame.Rect(bg_rect.right - 10, bg_rect.y + 2, 8, bg_rect.height - 4)
                pygame.draw.rect(screen, MODERN_DARK_GRAY, scrollbar_track, border_radius=4)
                
                # Calculate thumb position and size
                thumb_height = max(20, (self.max_visible / len(self.options)) * scrollbar_track.height)
                scroll_range = len(self.options) - self.max_visible
                if scroll_range > 0:
                    thumb_y = scrollbar_track.y + (self.scroll_offset / scroll_range) * (scrollbar_track.height - thumb_height)
                else:
                    thumb_y = scrollbar_track.y
                
                thumb_rect = pygame.Rect(scrollbar_track.x + 1, thumb_y, 6, thumb_height)
                pygame.draw.rect(screen, ACCENT_CYAN, thumb_rect, border_radius=3)
            
            # Don't draw the old option drawing code
            return
            
            # Check if mouse is hovering over any option for highlighting
            mouse_pos = pygame.mouse.get_pos()
            hovered_option = -1
            for i, (rect, option_index) in enumerate(self.option_rects):
                if rect.collidepoint(mouse_pos):
                    hovered_option = option_index
                    break
            
            for rect, option_index in self.option_rects:
                # Highlight selected option or hovered option
                if option_index == self.selected_index:
                    option_color = ACCENT_GREEN  # Currently selected option
                elif option_index == hovered_option:
                    option_color = ACCENT_BLUE   # Hovered option
                else:
                    option_color = MODERN_DARK_GRAY  # Normal option
                    
                pygame.draw.rect(screen, option_color, rect, border_radius=6)
                pygame.draw.rect(screen, MODERN_WHITE, rect, 1, border_radius=6)
                
                option_text = self.font.render(self.options[option_index], True, MODERN_WHITE)
                option_text_rect = option_text.get_rect(center=rect.center)
                option_text_rect.x = rect.x + 10
                screen.blit(option_text, option_text_rect)
            
            # Draw scroll indicators if needed
            if len(self.options) > self.max_visible:
                # Draw scroll hint text
                if self.scroll_offset > 0 or self.scroll_offset + self.max_visible < len(self.options):
                    hint_text = "↕ Scroll for more"
                    hint_surf = pygame.font.Font(None, 16).render(hint_text, True, ACCENT_YELLOW)
                    
                    if self.open_upward:
                        hint_y = self.option_rects[0][0].y - 20
                    else:
                        hint_y = self.option_rects[-1][0].bottom + 5
                    
                    hint_rect = hint_surf.get_rect(centerx=self.rect.centerx, y=hint_y)
                    screen.blit(hint_surf, hint_rect)
                
                # Visual scroll bar on the side
                if len(self.options) > 0:
                    # Calculate scrollbar dimensions
                    scrollbar_height = (self.max_visible / len(self.options)) * (self.max_visible * self.rect.height)
                    scrollbar_y = self.scroll_offset / len(self.options) * (self.max_visible * self.rect.height)
                    
                    if self.open_upward:
                        bar_y = self.rect.y - (self.max_visible * self.rect.height) + scrollbar_y
                    else:
                        bar_y = self.rect.bottom + scrollbar_y
                    
                    scrollbar_rect = pygame.Rect(self.rect.right - 8, bar_y, 6, scrollbar_height)
                    pygame.draw.rect(screen, ACCENT_YELLOW, scrollbar_rect, border_radius=3)
    
    def get_selected(self):
        if 0 <= self.selected_index < len(self.options):
            return self.options[self.selected_index]
        return self.options[0] if self.options else "Normal"

class ModernSlider:
    """Modern slider with smooth animations"""
    def __init__(self, x, y, width, height, min_val, max_val, initial_val, label):
        self.rect = pygame.Rect(x, y, width, height)
        self.min_val = min_val
        self.max_val = max_val
        self.val = initial_val
        self.label = label
        self.dragging = False
        self.knob_radius = height // 2 + 2
        
    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos) or self._get_knob_rect().collidepoint(event.pos):
                self.dragging = True
                return True
        elif event.type == pygame.MOUSEBUTTONUP:
            self.dragging = False
        elif event.type == pygame.MOUSEMOTION and self.dragging:
            relative_x = event.pos[0] - self.rect.x
            relative_x = max(0, min(self.rect.width, relative_x))
            self.val = self.min_val + (relative_x / self.rect.width) * (self.max_val - self.min_val)
            return True
        return False
    
    def _get_knob_x(self):
        """Calculate knob X position"""
        return self.rect.x + (self.val - self.min_val) / (self.max_val - self.min_val) * self.rect.width
    
    def _get_knob_rect(self):
        knob_x = self._get_knob_x()
        return pygame.Rect(knob_x - self.knob_radius, self.rect.y - 2, 
                          self.knob_radius * 2, self.rect.height + 4)
    
    def draw(self, screen, font):
        # Track
        pygame.draw.rect(screen, MODERN_DARK_GRAY, self.rect, border_radius=self.rect.height//2)
        
        # Fill (progress)
        progress_ratio = (self.val - self.min_val) / (self.max_val - self.min_val)
        fill_width = int(progress_ratio * self.rect.width)
        if fill_width > 0:
            fill_rect = pygame.Rect(self.rect.x, self.rect.y, fill_width, self.rect.height)
            pygame.draw.rect(screen, ACCENT_BLUE, fill_rect, border_radius=self.rect.height//2)
        
        # Knob
        knob_x = self._get_knob_x()
        knob_center = (int(knob_x), self.rect.centery)
        pygame.draw.circle(screen, MODERN_WHITE, knob_center, self.knob_radius)
        pygame.draw.circle(screen, ACCENT_BLUE, knob_center, self.knob_radius - 2)
        
        # Value percentage to the right of slider
        value_text = font.render(f"{int(self.val * 100)}%", True, MODERN_LIGHT)
        screen.blit(value_text, (self.rect.x + self.rect.width + 15, self.rect.centery - 8))

class PTypeGame:
    """Main P-Type game class with modern design"""
    
    def __init__(self):
        # Set up window - keep it simple for better compatibility
        self._disable_maximize_later = False  # Don't try to disable maximize
            
        # Create a proper windowed application that starts at screen height
        try:
            display_info = pygame.display.Info()
            screen_height = display_info.current_h
            # Use most of the screen height but leave space for title bar and taskbar
            calculated_height = screen_height - 80  # Leave 80px for title bar and taskbar
            default_height = max(MIN_WINDOW_HEIGHT, calculated_height)  # Ensure minimum height
        except Exception:
            # Fallback to a reasonable default that works on most monitors
            default_height = max(MIN_WINDOW_HEIGHT, 1000)  # Ensure minimum height
        
        # Use fixed width - don't calculate proportionally
        window_width = SCREEN_WIDTH
        
        # Create window with borders and proper title bar - force windowed mode
        # Ensure it's not fullscreen and has window decorations
        flags = pygame.RESIZABLE
        self.screen = pygame.display.set_mode((window_width, default_height), flags)
        pygame.display.set_caption("P-Type - The Typing Game")
        
        # Set window icon - load the spaceship icon
        try:
            import os
            icon_path = os.path.join(os.path.dirname(__file__), 'assets', 'images', 'spaceship_icon_small.png')
            if os.path.exists(icon_path):
                icon = pygame.image.load(icon_path)
                pygame.display.set_icon(icon)
                print("Window icon set successfully")
            else:
                print(f"Icon not found at: {icon_path}")
        except Exception as e:
            print(f"Could not set window icon: {e}")
        
        # Window is ready to use with normal Windows decorations
        
        self.clock = pygame.time.Clock()
        self.current_height = default_height
        self.is_maximized = False  # Start in normal windowed state
        self.normal_height = default_height  # Store this as normal height
        
        # Initialize fonts (Font(None, size) always works, no need for try/except)
        self.small_font = pygame.font.Font(None, 20)
        self.font = pygame.font.Font(None, 26)
        self.medium_font = pygame.font.Font(None, 36)
        self.large_font = pygame.font.Font(None, 48)
        self.title_font = pygame.font.Font(None, 84)
        
        # Game state
        self.running = True
        self.game_mode = GameMode.PROFILE_SELECT  # Start at profile selection
        self.programming_language = ProgrammingLanguage.PYTHON
        self.settings = GameSettings()
        
        # Initialize sound manager with current volume setting
        self.sound_manager = SoundManager(self.settings.sound_volume)
        
        # Initialize background music
        self.load_background_music()
        
        # Profile management
        self.profiles = self.load_profiles()
        self.current_profile_index = 0
        
        # Load the most recent player profile
        self.current_profile = None
        if self.settings.current_player_name:
            for profile in self.profiles:
                if profile.name == self.settings.current_player_name:
                    self.current_profile = profile
                    self.settings.current_profile = profile
                    break
        
        # If no current profile but profiles exist, use the first one
        if not self.current_profile and self.profiles:
            self.current_profile = self.profiles[0]
            self.settings.current_profile = self.profiles[0]
            self.settings.current_player_name = self.profiles[0].name
        
        self.creating_profile = False
        self.profile_name_input = ""
        self.update_profile_dropdown = False
        
        # Initialize selected mode to "Choose a Mode" by default
        self.selected_mode = "Choose a Mode"
        
        # If we have a current profile with saves, set selected mode to one with a save
        if self.current_profile and hasattr(self.current_profile, 'saved_games') and self.current_profile.saved_games:
            # Check for Normal mode save first
            if "normal" in self.current_profile.saved_games:
                self.selected_mode = "Normal"
            else:
                # Check for programming language saves
                for key in self.current_profile.saved_games.keys():
                    if key.startswith("programming_"):
                        lang = key.replace("programming_", "")
                        self.selected_mode = lang
                        break
        
        # Save/Load states
        self.saving_game = False
        self.loading_game = False
        self.show_save_slots = False
        
        # Game variables
        self.reset_game_state()
        
        # Enhanced game objects
        self.stars = [ModernStar() for _ in range(200)]
        self.player_ship = ModernPlayerShip(self.current_height)
        
        # UI elements - setup after window is created
        self.setup_ui_elements()
        
        # Load the logo image
        self.load_logo_image()
    
    def load_logo_image(self):
        """Load the P-TYPE logo PNG image"""
        try:
            import os
            logo_path = os.path.join(os.path.dirname(__file__), 'assets', 'images', 'ptype_logo.png')
            if os.path.exists(logo_path):
                self.logo_image = pygame.image.load(logo_path)
                # Scale the logo to appropriate size if needed
                logo_width = 400  # Adjust this to desired width
                logo_height = int(self.logo_image.get_height() * (logo_width / self.logo_image.get_width()))
                self.logo_image = pygame.transform.smoothscale(self.logo_image, (logo_width, logo_height))
                print("Logo image loaded successfully")
            else:
                print(f"Logo image not found at: {logo_path}")
                self.logo_image = None
        except Exception as e:
            print(f"Could not load logo image: {e}")
            self.logo_image = None
    
    def draw_gradient_logo(self, center_x, center_y):
        """Draw the P-TYPE logo with purple to blue gradient effect"""
        # Create pulsing animation
        pulse = abs(math.sin(pygame.time.get_ticks() * 0.001)) * 0.1 + 0.9
        
        # Draw multiple layers for 3D depth effect
        for depth in range(5, 0, -1):
            offset = depth * 2
            shadow_alpha = 100 - depth * 15
            
            # Shadow layer
            shadow_text = self.title_font.render("P-TYPE", True, (20, 20, 30))
            shadow_text.set_alpha(shadow_alpha)
            shadow_rect = shadow_text.get_rect(center=(center_x + offset, center_y + offset))
            self.screen.blit(shadow_text, shadow_rect)
        
        # Create gradient effect by drawing the text in segments
        text = "P-TYPE"
        font_size = 84
        
        # Draw each character with gradient
        char_positions = []
        total_width = 0
        
        # Calculate character positions
        for char in text:
            if char == '-':
                char_surface = self.title_font.render(char, True, (255, 255, 255))
            else:
                char_surface = self.title_font.render(char, True, (255, 255, 255))
            char_width = char_surface.get_width()
            char_positions.append((char, total_width, char_width))
            total_width += char_width
        
        # Starting position
        start_x = center_x - total_width // 2
        
        # Draw each character with vertical gradient
        for char, x_offset, width in char_positions:
            char_x = start_x + x_offset + width // 2
            
            # Create vertical gradient strips for each character
            for y in range(-30, 31, 2):
                # Calculate gradient color (purple at top to blue at bottom)
                t = (y + 30) / 60.0
                
                # Purple to blue gradient
                if t < 0.5:
                    # Purple to pink transition
                    color_r = int(186 - t * 100)
                    color_g = int(85 + t * 60)
                    color_b = int(211)
                else:
                    # Pink to blue transition  
                    t_local = (t - 0.5) * 2
                    color_r = int(136 - t_local * 106)
                    color_g = int(115 + t_local * 29)
                    color_b = int(211 + t_local * 44)
                
                color = (min(255, color_r), min(255, color_g), min(255, color_b))
                
                # Render character strip
                strip_surface = self.title_font.render(char, True, color)
                strip_rect = strip_surface.get_rect(center=(char_x, center_y + y))
                
                # Clip to only show a strip
                clip_rect = pygame.Rect(strip_rect.x, center_y + y - 1, strip_rect.width, 3)
                self.screen.set_clip(clip_rect)
                self.screen.blit(strip_surface, strip_rect)
                self.screen.set_clip(None)
        
        # Add white outline/highlight
        for dx in [-2, -1, 1, 2]:
            for dy in [-2, -1, 1, 2]:
                if abs(dx) == 2 or abs(dy) == 2:
                    outline_surface = self.title_font.render(text, True, (255, 255, 255))
                    outline_surface.set_alpha(30)
                    outline_rect = outline_surface.get_rect(center=(center_x + dx, center_y + dy))
                    self.screen.blit(outline_surface, outline_rect)
        
        # Add glow effect
        for i in range(3):
            glow_surface = self.title_font.render(text, True, (100, 150, 255))
            glow_surface.set_alpha(20 - i * 5)
            for angle in range(0, 360, 45):
                dx = math.cos(math.radians(angle)) * (3 + i * 2) * pulse
                dy = math.sin(math.radians(angle)) * (3 + i * 2) * pulse
                glow_rect = glow_surface.get_rect(center=(center_x + dx, center_y + dy))
                self.screen.blit(glow_surface, glow_rect)
    
    def load_background_music(self):
        """Load and start background music"""
        try:
            import os
            music_path = os.path.join(os.path.dirname(__file__), 'assets', 'sounds', 'game_music.mp3')
            if os.path.exists(music_path):
                pygame.mixer.music.load(music_path)
                pygame.mixer.music.set_volume(self.settings.music_volume)
                pygame.mixer.music.play(-1)  # Loop forever
                print("Background music loaded and playing")
            else:
                print(f"Music file not found: {music_path}")
        except Exception as e:
            print(f"Could not load background music: {e}")
    
    def reset_game_state(self):
        """Reset all game state variables"""
        self.score = 0
        self.level = 1
        self.health = 100
        self.shield_buffer = 0  # Extra shield from boss defeats at full health
        self.max_health = 100
        self.missed_ships = 0
        self.words_destroyed = 0
        self.enemies = []
        self.explosions = []
        self.typing_effects = []  # New: typing visual effects
        self.laser_beams = []  # Laser beam effects from player to enemy
        self.current_input = ""
        self.active_enemy = None
        self.last_enemy_spawn = 0
        self.game_start_time = 0
        self.collision_detected = False
        self.wrong_char_flash = 0
        
        # Initialize sound manager if not already initialized
        if not hasattr(self, 'sound_manager'):
            self.sound_manager = SoundManager(0.8)
        
        # EMP weapon system
        self.emp_ready = True
        self.emp_cooldown = 0
        self.emp_max_cooldown = 600  # 10 seconds at 60 FPS
        self.emp_radius = 250
        self.emp_effect_timer = 0
        
        # Boss system variables
        self.boss_spawned = False
        self.boss_defeated = False
        self.boss_spawn_time = 0
        self.enemies_defeated_this_level = 0
        
        # Player stats tracking
        self.session_stats = PlayerStats()
        self.total_keystrokes = 0
        self.correct_keystrokes = 0
        self.current_wpm = 0.0
        self.peak_wpm = 0.0
        self.accuracy = 100.0
        self.perfect_words = 0
        self.mistakes_this_word = 0
        
        # Name entry state
        self.entering_name = False
        self.player_name_input = ""
        
        # Achievement notifications
        self.achievement_notifications = []  # List of (achievement, timer) tuples
        
        self.update_spawn_delay()
    
    def update_spawn_delay(self):
        """Update enemy spawn delay based on current level"""
        base_delay = 4000
        min_delay = 1000
        delay_reduction = (base_delay - min_delay) * (self.level - 1) / (MAX_LEVELS - 1)
        self.enemy_spawn_delay = max(min_delay, base_delay - delay_reduction)
    
    def get_game_state(self) -> Dict:
        """Get current game state for saving"""
        # Use _last_game_mode if in pause, otherwise use current game_mode
        actual_mode = self._last_game_mode if hasattr(self, '_last_game_mode') and self.game_mode == GameMode.PAUSE else self.game_mode
        
        return {
            'score': self.score,
            'level': self.level,
            'health': self.health,
            'missed_ships': self.missed_ships,
            'words_destroyed': self.words_destroyed,
            'game_mode': actual_mode.value,
            'programming_language': self.programming_language.value if actual_mode == GameMode.PROGRAMMING else None,
            'boss_spawned': self.boss_spawned,
            'enemies_defeated_this_level': self.enemies_defeated_this_level,
            'total_keystrokes': self.total_keystrokes,
            'correct_keystrokes': self.correct_keystrokes,
            'peak_wpm': self.peak_wpm,
            'perfect_words': self.perfect_words
        }
    
    def load_profiles(self) -> list:
        """Load profiles from settings"""
        profiles = []
        for name, profile_data in self.settings.profiles.items():
            if isinstance(profile_data, PlayerProfile):
                profiles.append(profile_data)
            else:
                # Load from dict
                profile = PlayerProfile(name)
                if isinstance(profile_data, dict):
                    # Update profile attributes from saved data
                    for key, value in profile_data.items():
                        if hasattr(profile, key):
                            # Special handling for sets (languages_played)
                            if key == 'languages_played' and isinstance(value, list):
                                setattr(profile, key, set(value))
                            else:
                                setattr(profile, key, value)
                profiles.append(profile)
        # Create default profile if no profiles exist
        if not profiles:
            default = PlayerProfile("Player 1")
            profiles.append(default)
            self.settings.profiles["Player 1"] = default
            self.settings.save_profiles()
        return profiles
    
    def create_profile(self, name: str) -> PlayerProfile:
        """Create a new profile"""
        if name and name not in self.settings.profiles:
            profile = PlayerProfile(name)
            self.settings.profiles[name] = profile
            self.settings.save_profiles()
            self.profiles.append(profile)
            return profile
        return None
    
    def select_profile(self, profile: PlayerProfile) -> None:
        """Select a profile as the current profile"""
        self.current_profile = profile
        self.settings.current_profile = profile
        self.settings.current_player_name = profile.name
        self.settings.save_settings()
    
    def load_game_state(self, state: Dict) -> None:
        """Load game state from save"""
        self.reset_game_state()
        self.score = state.get('score', 0)
        self.level = state.get('level', 1)
        self.health = state.get('health', 100)
        self.missed_ships = state.get('missed_ships', 0)
        self.words_destroyed = state.get('words_destroyed', 0)
        self.boss_spawned = state.get('boss_spawned', False)
        self.enemies_defeated_this_level = state.get('enemies_defeated_this_level', 0)
        self.total_keystrokes = state.get('total_keystrokes', 0)
        self.correct_keystrokes = state.get('correct_keystrokes', 0)
        self.peak_wpm = state.get('peak_wpm', 0.0)
        self.perfect_words = state.get('perfect_words', 0)
        
        # Set game mode
        mode_value = state.get('game_mode', 'normal')
        self.game_mode = GameMode.NORMAL if mode_value == 'normal' else GameMode.PROGRAMMING
        
        # Set programming language if applicable
        if self.game_mode == GameMode.PROGRAMMING:
            lang = state.get('programming_language', 'Python')
            for pl in ProgrammingLanguage:
                if pl.value == lang:
                    self.programming_language = pl
                    break
        
        self.update_spawn_delay()
    
    def setup_ui_elements(self):
        """Setup modern UI elements with fully responsive positioning.
        
        This method creates all UI elements with positions calculated based on the current
        window dimensions. All elements use percentage-based positioning with minimum
        spacing constraints to prevent overlap at any window size.
        
        Key Features:
        - Responsive centering for all elements
        - Generous spacing prevents overlap
        - Portrait aspect ratio maintained
        - Automatic recalculation on window resize
        """
        # Get current window height (width is always fixed)
        actual_window = pygame.display.get_surface()
        if actual_window:
            window_h = actual_window.get_height()
        else:
            window_h = self.current_height
        
        # Use fixed width
        window_w = SCREEN_WIDTH
        
        # Central reference point for all UI
        center_x = window_w // 2
        
        # Store current window dimensions for responsive drawing
        self.ui_window_width = window_w
        self.ui_center_x = center_x
        
        # Store responsive positions for text elements
        self.ui_title_y = max(80, int(window_h * 0.08))  # Title at 8% of height, min 80px
        self.ui_subtitle_y = self.ui_title_y + 100  # Subtitle 100px below title (increased from 50)
        
        # Standard button width - 70% of window, constrained between 200-350px
        std_button_w = max(200, min(350, int(window_w * 0.7)))
        
        # Continue button - always visible, positioned at top
        continue_y = max(200, int(window_h * 0.22))
        
        # Check if current profile has a saved game for currently selected mode
        has_save = False
        if self.current_profile and hasattr(self, 'selected_mode') and self.selected_mode != "Choose a Mode":
            # Determine if selected mode is Normal or Programming
            if self.selected_mode == "Normal":
                saved_game = self.current_profile.get_saved_game("normal", None)
            else:
                # It's a programming language
                saved_game = self.current_profile.get_saved_game("programming", self.selected_mode)
            has_save = saved_game is not None
        
        # Continue button - always created but may be disabled
        self.continue_button = ModernButton(
            center_x - std_button_w // 2, continue_y, std_button_w, 60,
            "Continue", self.medium_font, has_save  # Enabled state based on save
        )
        if not has_save:
            self.continue_button.is_disabled = True  # Mark as disabled
        
        # New Game button (disabled until mode is selected)
        new_game_y = continue_y + 80
        self.new_game_button = ModernButton(
            center_x - std_button_w // 2, new_game_y, std_button_w, 60, 
            "New Game", self.medium_font, True
        )
        # Disable if no mode selected
        if not hasattr(self, 'selected_mode') or self.selected_mode == "Choose a Mode":
            self.new_game_button.is_disabled = True
        
        # Mode dropdown - includes placeholder plus Normal mode and all programming languages
        # Get all language values from the enum properly
        prog_languages = [lang.value for lang in ProgrammingLanguage]
        all_modes = ["Choose a Mode", "Normal"] + prog_languages
        
        # Position dropdown below New Game button
        dropdown_y = new_game_y + 100  # Below New Game button
        dropdown_w = max(250, min(300, int(window_w * 0.7)))
        
        # Create or update the dropdown with all modes
        # Force the dropdown to show all options properly
        # Preserve open state if dropdown already exists
        was_open = self.mode_dropdown.is_open if hasattr(self, 'mode_dropdown') else False
        self.mode_dropdown = ModernDropdown(
            center_x - dropdown_w // 2, dropdown_y, dropdown_w, 40, 
            all_modes, self.font, window_height=window_h
        )
        # Restore open state
        self.mode_dropdown.is_open = was_open
        
        # Initialize selected mode if not exists
        if not hasattr(self, 'selected_mode'):
            self.selected_mode = "Choose a Mode"
        
        # Find the index of current selected mode and set it in dropdown
        try:
            selected_index = all_modes.index(self.selected_mode)
            self.mode_dropdown.selected_index = selected_index
        except ValueError:
            # If selected_mode is not in the list, default to Choose a Mode
            self.selected_mode = "Choose a Mode"
            self.mode_dropdown.selected_index = 0
        
        # Store dropdown label position (30px above dropdown)
        self.dropdown_label_y = dropdown_y - 30
        
        # Store version info position (responsive to window height)
        self.ui_version_y = window_h - 20
        
        # Update player ship position for responsive window
        if hasattr(self, 'player_ship'):
            self.player_ship.update_position_for_window_dimensions(window_w, window_h)
        
        # Bottom menu buttons - positioned below dropdown area
        # Give reasonable space for dropdown
        bottom_y = dropdown_y + 80  # Space below closed dropdown
        # But ensure minimum space from bottom for help panel
        bottom_y = min(bottom_y, window_h - 300)  # Leave 300px at bottom for help panel and footer
        
        small_btn_w = max(85, min(110, window_w // 8))  # Responsive small button width
        btn_spacing = max(15, min(25, window_w // 25))  # More generous spacing
        
        # Calculate total width and starting position for centering
        total_width = 3 * small_btn_w + 2 * btn_spacing
        start_x = center_x - total_width // 2
        
        self.stats_button = ModernButton(
            start_x, bottom_y, small_btn_w, 50, 
            "Stats", self.font, False
        )
        
        self.settings_button = ModernButton(
            start_x + small_btn_w + btn_spacing, bottom_y, small_btn_w, 50, 
            "Settings", self.font, False
        )
        
        self.about_button = ModernButton(
            start_x + 2 * (small_btn_w + btn_spacing), bottom_y, small_btn_w, 50, 
            "About", self.font, False
        )
        
        # Exit game button - positioned below other buttons
        exit_btn_w = max(120, min(160, int(window_w * 0.6)))
        exit_y = bottom_y + 70  # 70px below other buttons
        # Ensure it doesn't go too close to bottom (leave space for help panel)
        exit_y = min(exit_y, window_h - 220)  # More space from bottom
        
        self.exit_game_button = ModernButton(
            center_x - exit_btn_w // 2, exit_y, exit_btn_w, 50, 
            "Exit Game", self.font, False
        )
        
        # Close popout button
        close_btn_w = max(110, min(140, int(window_w * 0.55)))
        self.close_popout_button = ModernButton(
            center_x - close_btn_w // 2, bottom_y, close_btn_w, 50, 
            "Close", self.medium_font, True
        )
        
        # Pause menu elements - improved layout
        pause_btn_w = max(200, min(280, int(window_w * 0.7)))
        pause_start_y = int(window_h * 0.35)  # Start lower to avoid covering the pause menu label
        btn_spacing = 65
        
        self.resume_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y, pause_btn_w, 55, 
            "Resume", self.medium_font, True
        )
        
        self.save_game_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing, pause_btn_w, 55,
            "Save Game", self.medium_font, False
        )
        
        self.pause_settings_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 2, pause_btn_w, 55,
            "Settings", self.medium_font, False
        )
        
        self.quit_to_menu_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 3, pause_btn_w, 55, 
            "Main Menu", self.medium_font, False
        )
        
        self.quit_game_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 4, pause_btn_w, 55, 
            "Exit Game", self.medium_font, False
        )
        
        # Settings sliders
        slider_w = max(200, min(320, int(window_w * 0.75)))
        self.music_slider = ModernSlider(
            center_x - slider_w // 2, int(window_h * 0.48), slider_w, 20, 
            0.0, 1.0, self.settings.music_volume, "Music Volume"
        )
        self.sound_slider = ModernSlider(
            center_x - slider_w // 2, int(window_h * 0.54), slider_w, 20, 
            0.0, 1.0, self.settings.sound_volume, "Sound Volume"
        )
        
        # Game over buttons
        game_over_btn_w = max(180, min(280, int(window_w * 0.7)))
        self.restart_button = ModernButton(
            center_x - game_over_btn_w // 2, window_h // 2 + 150, game_over_btn_w, 60, 
            "Play Again", self.medium_font, True
        )
        self.menu_button = ModernButton(
            center_x - game_over_btn_w // 2, window_h // 2 + 230, game_over_btn_w, 60, 
            "Main Menu", self.medium_font
        )
    
    def recalculate_ui_positions(self):
        """Recalculate UI positions and sizes based on current window dimensions.
        
        This method is called whenever the window is resized to ensure all UI elements
        maintain proper positioning and spacing. It delegates to setup_ui_elements()
        for a complete recalculation of all responsive positioning.
        """
        # Simply call setup_ui_elements again to recalculate everything
        self.setup_ui_elements()
    
    def _disable_windows_maximize_button(self):
        """Disable the Windows maximize button"""
        try:
            import ctypes
            from ctypes import wintypes
            
            # Get window handle
            hwnd = pygame.display.get_wm_info()["window"]
            
            # Windows API constants
            GWL_STYLE = -16
            WS_MAXIMIZEBOX = 0x00010000
            
            # Get current window style
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_STYLE)
            
            # Remove maximize box
            style &= ~WS_MAXIMIZEBOX
            
            # Set new window style
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_STYLE, style)
            
            # Force window to redraw
            ctypes.windll.user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0, 0x0027)
            
        except Exception as e:
            print(f"Could not disable maximize button: {e}")
    
    def handle_window_resize(self, width, height):
        """Handle window resize events - only height changes allowed.
        
        Keeps width static while allowing height adjustments.
        Automatically recalculates all UI element positions for the new dimensions.
        """
        # Enforce minimum height to ensure UI elements fit properly
        new_height = max(MIN_WINDOW_HEIGHT, height)
        
        # Keep width static at SCREEN_WIDTH
        new_width = SCREEN_WIDTH
        
        # Update normal height for restore functionality
        if not self.is_maximized:
            self.normal_height = new_height
        
        # Create resizable window with fixed width
        self.screen = pygame.display.set_mode((new_width, new_height), pygame.RESIZABLE)
        self.current_height = new_height
        
        # Re-disable maximize button after resize
        if self._disable_maximize_later:
            self._disable_windows_maximize_button()
        
        # Recalculate UI positions for the new dimensions
        self.recalculate_ui_positions()
    
    def check_maximize_state(self):
        """Check and handle window maximize state"""
        # Get display info to check if window should be maximized
        try:
            display_info = pygame.display.Info()
            screen_height = display_info.current_h
        except Exception:
            # Fallback method for standalone executables
            try:
                import tkinter as tk
                root = tk.Tk()
                screen_height = root.winfo_screenheight()
                root.destroy()
            except Exception:
                screen_height = 1080
        
        # If current height is close to screen height, ensure it's properly sized
        if self.current_height >= screen_height - 100:
            self.handle_window_resize(0, screen_height)  # Width will be calculated proportionally
    
    def toggle_maximize(self):
        """Toggle between normal and maximized window states using keyboard shortcut"""
        try:
            display_info = pygame.display.Info()
            screen_height = display_info.current_h
        except Exception:
            # Fallback method for standalone executables
            try:
                import tkinter as tk
                root = tk.Tk()
                screen_height = root.winfo_screenheight()
                root.destroy()
            except Exception:
                screen_height = 1080
        
        if self.is_maximized:
            # Restore to normal size
            self.is_maximized = False
            self.handle_window_resize(SCREEN_WIDTH, self.normal_height)  # Fixed width
        else:
            # Maximize to screen height (but keep width fixed)
            self.is_maximized = True
            max_height = screen_height - 80  # Leave space for taskbar
            self.handle_window_resize(SCREEN_WIDTH, max_height)  # Fixed width
    
    def spawn_enemy(self):
        """Spawn a new enemy with appropriate word based on current level"""
        # Reduce but don't stop regular enemy spawning when boss is present
        if self.boss_spawned:
            max_enemies = min(3 + self.level // 5, 6)  # Fewer enemies during boss fight
        else:
            max_enemies = min(8 + self.level // 3, 15)  # Normal enemy count
            
        # Count only non-boss enemies for spawn limit
        non_boss_count = len([e for e in self.enemies if not (hasattr(e, 'is_boss') and e.is_boss)])
        
        if non_boss_count < max_enemies:
            # Get words appropriate for current level
            words = WordDictionary.get_words(self.game_mode, self.programming_language, self.level)
            
            # Additional length filtering for very high levels to add variety
            if self.level <= 3:
                # Early levels: prefer shorter words
                filtered_words = [w for w in words if len(w) <= 8]
            elif self.level <= 7:
                # Mid-early levels: medium length words
                filtered_words = [w for w in words if len(w) <= 12]
            elif self.level <= 15:
                # Higher levels: longer words allowed
                filtered_words = [w for w in words if len(w) <= 20]
            else:
                # Highest levels: all words allowed
                filtered_words = words
            
            # Fall back to all words if filtering removed everything
            if not filtered_words:
                filtered_words = words
            
            word = random.choice(filtered_words)
            # Pass player position to enemy
            player_x = self.player_ship.x if hasattr(self, 'player_ship') else SCREEN_WIDTH // 2
            enemy = ModernEnemy(word, self.level, player_x)
            self.enemies.append(enemy)
    
    def spawn_boss(self):
        """Spawn a boss enemy with a challenging word"""
        if not self.boss_spawned:
            # Get a challenging boss word
            boss_word = WordDictionary.get_boss_word(self.game_mode, self.programming_language, self.level)
            
            # Create boss enemy targeting player, passing game mode for speed adjustment
            player_x = self.player_ship.x if hasattr(self, 'player_ship') else SCREEN_WIDTH // 2
            boss = BossEnemy(boss_word, self.level, player_x, self.game_mode)
            self.enemies.append(boss)
            
            self.boss_spawned = True
            self.boss_spawn_time = pygame.time.get_ticks()
            
            # Play boss appearance sound
            self.sound_manager.play('boss')
            
            # Don't clear existing enemies - let them coexist with boss for added challenge
    
    def handle_input(self, char: str):
        """Handle character input from player with comprehensive stats tracking"""
        current_time = pygame.time.get_ticks()
        
        # Track total keystrokes
        self.total_keystrokes += 1
        
        # Initialize keystroke timing if needed
        if not hasattr(self, 'keystroke_times'):
            self.keystroke_times = []
            self.last_keystroke_time = current_time
        
        # Track time between keystrokes for WPM calculation
        time_since_last = current_time - self.last_keystroke_time
        if 50 < time_since_last < 5000:  # Ignore very fast or very slow keystrokes
            self.keystroke_times.append(time_since_last)
            if len(self.keystroke_times) > 20:  # Keep last 20 keystrokes
                self.keystroke_times.pop(0)
            
            # Calculate current WPM
            if len(self.keystroke_times) >= 5:
                avg_time = sum(self.keystroke_times) / len(self.keystroke_times)
                # WPM = (60000ms / avg_time_per_char) / 5 chars_per_word
                self.current_wpm = (60000 / avg_time) / 5
                self.peak_wpm = max(self.peak_wpm, self.current_wpm)
        
        self.last_keystroke_time = current_time
        
        # If no active enemy, try to start typing a new word
        if self.active_enemy is None:
            for enemy in self.enemies:
                if enemy.original_word.startswith(char) and not enemy.active:
                    enemy.active = True
                    enemy.typed_chars = char
                    self.active_enemy = enemy
                    self.current_input = char
                    self.correct_keystrokes += 1
                    self.mistakes_this_word = 0
                    # Play type sound
                    self.sound_manager.play('type')
                    # Add laser beam effect
                    self.laser_beams.append(LaserBeam(
                        self.player_ship.x, self.player_ship.y,
                        enemy.x, enemy.y
                    ))
                    break
            else:
                # No matching enemy found - wrong key
                self.wrong_char_flash = 30
                self.sound_manager.play('wrong')
        else:
            # Continue typing the active word
            if self.active_enemy in self.enemies:
                if self.active_enemy.type_char(char):
                    self.current_input += char
                    self.correct_keystrokes += 1
                    
                    # Play type sound
                    self.sound_manager.play('type')
                    
                    # Add laser beam effect from player to enemy
                    if self.active_enemy:
                        self.laser_beams.append(LaserBeam(
                            self.player_ship.x, self.player_ship.y,
                            self.active_enemy.x, self.active_enemy.y
                        ))
                    
                    # Add typing effect at enemy position
                    if self.active_enemy:
                        effect_x = self.active_enemy.x + len(self.current_input) * 8 - 40
                        effect_y = self.active_enemy.y + 30
                        self.typing_effects.append(TypingEffect(effect_x, effect_y, char, True))
                    
                    if self.active_enemy.is_word_complete():
                        # Play correct word sound
                        self.sound_manager.play('correct')
                        # Track perfect words
                        if self.mistakes_this_word == 0:
                            self.perfect_words += 1
                            self.score += 50  # Perfect word bonus
                            # Heal more for perfect words
                            self.health = min(100, self.health + 8)
                        else:
                            # Normal heal for completing a word
                            self.health = min(100, self.health + 5)
                        
                        # Update profile stats
                        if self.current_profile:
                            self.current_profile.total_words_typed += 1
                            mode_stats = self.current_profile.get_mode_stats(
                                self.game_mode.value,
                                self.programming_language.value if self.game_mode == GameMode.PROGRAMMING else None
                            )
                            mode_stats['total_words'] += 1
                            # Update both overall and mode-specific best WPM
                            if self.current_wpm > mode_stats['best_wpm']:
                                mode_stats['best_wpm'] = self.current_wpm
                            # Also update the overall profile best_wpm
                            if self.current_wpm > self.current_profile.best_wpm:
                                self.current_profile.best_wpm = self.current_wpm
                            
                            # Check achievements in real-time
                            game_state = {
                                'perfect_words': self.perfect_words,
                                'session_time': (pygame.time.get_ticks() - self.game_start_time) / 1000 if self.game_start_time > 0 else 0
                            }
                            newly_unlocked = self.current_profile.check_achievements(game_state)
                            for achievement_id in newly_unlocked:
                                achievement = ACHIEVEMENTS[achievement_id]
                                self.achievement_notifications.append((achievement, 300))
                                # Play achievement sound
                                self.sound_manager.play('achievement')
                        
                        self.destroy_enemy(self.active_enemy)
                        self.active_enemy = None
                        self.current_input = ""
                        self.mistakes_this_word = 0
                else:
                    # Wrong character feedback
                    self.wrong_char_flash = 30
                    self.mistakes_this_word += 1
                    self.sound_manager.play('wrong')
            else:
                # Active enemy no longer exists
                self.active_enemy = None
                self.current_input = ""
                
                # Try to start a new word
                for enemy in self.enemies:
                    if enemy.original_word.startswith(char) and not enemy.active:
                        enemy.active = True
                        enemy.typed_chars = char
                        self.active_enemy = enemy
                        self.current_input = char
                        self.correct_keystrokes += 1
                        self.mistakes_this_word = 0
                        break
                else:
                    self.wrong_char_flash = 30
                    self.sound_manager.play('wrong')
        
        # Update accuracy
        if self.total_keystrokes > 0:
            self.accuracy = (self.correct_keystrokes / self.total_keystrokes) * 100
    
    def select_next_ship(self):
        """Select the next ship in the list"""
        if not self.enemies:
            return
        
        if self.active_enemy is None:
            self.active_enemy = self.enemies[0]
            self.active_enemy.active = True
            self.current_input = ""
            return
        
        try:
            current_index = self.enemies.index(self.active_enemy)
            self.active_enemy.active = False
            self.active_enemy.typed_chars = ""
            
            next_index = (current_index + 1) % len(self.enemies)
            self.active_enemy = self.enemies[next_index]
            self.active_enemy.active = True
            self.current_input = ""
        except ValueError:
            if self.enemies:
                self.active_enemy = self.enemies[0]
                self.active_enemy.active = True
                self.current_input = ""
    
    def trigger_emp(self):
        """Trigger EMP weapon to destroy nearby enemies"""
        if not self.emp_ready or self.emp_cooldown > 0:
            return  # EMP not ready
        
        # Find all enemies within radius
        player_x = self.player_ship.x
        player_y = self.player_ship.y
        
        enemies_to_destroy = []
        for enemy in self.enemies:
            # Skip bosses - EMP doesn't affect them
            if hasattr(enemy, 'is_boss') and enemy.is_boss:
                continue
                
            # Calculate distance
            dx = enemy.x - player_x
            dy = enemy.y - player_y
            distance = math.sqrt(dx**2 + dy**2)
            
            if distance <= self.emp_radius:
                enemies_to_destroy.append(enemy)
        
        # Destroy enemies caught in EMP
        if enemies_to_destroy:
            for enemy in enemies_to_destroy:
                # Create special EMP explosion effect
                self.explosions.append(ModernExplosion(enemy.x, enemy.y))
                if enemy in self.enemies:
                    self.enemies.remove(enemy)
                if enemy == self.active_enemy:
                    self.active_enemy = None
                    self.current_input = ""
                # Half points for EMP kills
                self.score += (len(enemy.word) * 5 * self.level) // 2
                self.words_destroyed += 1
            
            # Start EMP visual effect
            self.emp_effect_timer = 30
            
        # Start cooldown
        self.emp_ready = False
        self.emp_cooldown = self.emp_max_cooldown
    
    def select_previous_ship(self):
        """Select the previous ship in the list"""
        if not self.enemies:
            return
        
        if self.active_enemy is None:
            self.active_enemy = self.enemies[-1]
            self.active_enemy.active = True
            self.current_input = ""
            return
        
        try:
            current_index = self.enemies.index(self.active_enemy)
            self.active_enemy.active = False
            self.active_enemy.typed_chars = ""
            
            prev_index = (current_index - 1) % len(self.enemies)
            self.active_enemy = self.enemies[prev_index]
            self.active_enemy.active = True
            self.current_input = ""
        except ValueError:
            if self.enemies:
                self.active_enemy = self.enemies[-1]
                self.active_enemy.active = True
                self.current_input = ""
    
    def destroy_enemy(self, enemy):
        """Destroy an enemy and create explosion effect"""
        if enemy in self.enemies:
            self.enemies.remove(enemy)
            
            # Create explosion - larger for bosses
            if hasattr(enemy, 'is_boss') and enemy.is_boss:
                # Multiple explosions for boss
                for _ in range(3):
                    offset_x = random.randint(-30, 30)
                    offset_y = random.randint(-30, 30)
                    self.explosions.append(ModernExplosion(enemy.x + offset_x, enemy.y + offset_y, "large"))
                # Play destroy sound for boss
                self.sound_manager.play('destroy')
            else:
                self.explosions.append(ModernExplosion(enemy.x, enemy.y))
                # Play destroy sound
                self.sound_manager.play('destroy')
            
            # Boss enemies are worth more points
            word_score = len(enemy.word) * 10 * self.level
            if hasattr(enemy, 'is_boss') and enemy.is_boss:
                word_score *= 3  # Boss enemies worth triple points
                
            self.score += word_score
            self.words_destroyed += 1
            
            # Check if this was a boss - if so, advance level immediately
            if hasattr(enemy, 'is_boss') and enemy.is_boss:
                # Update profile boss count
                if self.current_profile:
                    self.current_profile.bosses_defeated += 1
                    mode_stats = self.current_profile.get_mode_stats(
                        self.game_mode.value,
                        self.programming_language.value if self.game_mode == GameMode.PROGRAMMING else None
                    )
                    mode_stats['bosses_defeated'] += 1
                    
                    # Check for boss slayer achievement
                    newly_unlocked = self.current_profile.check_achievements({})
                for achievement_id in newly_unlocked:
                    achievement = ACHIEVEMENTS[achievement_id]
                    self.achievement_notifications.append((achievement, 300))
                    # Play achievement sound
                    self.sound_manager.play('achievement')
                
                # Shield buffer if at full health
                if self.health >= self.max_health:
                    self.shield_buffer = min(self.shield_buffer + 25, 100)  # Add 25 shield, max 100
                
                if self.level < MAX_LEVELS:
                    self.level += 1
                    self.update_spawn_delay()
                    self.health = min(self.max_health, self.health + 40)  # Significant health restore for boss
                    self.boss_defeated = True
                    self.boss_spawned = False  # Allow new boss for next level
                    self.enemies_defeated_this_level = 0  # Reset counter
                    # Play level complete sound
                    self.sound_manager.play('level')
            else:
                # Count regular enemies defeated this level
                self.enemies_defeated_this_level += 1
                
                # Spawn boss after 8 regular enemies (if boss not already spawned)
                if self.enemies_defeated_this_level >= 8 and not self.boss_spawned:
                    self.spawn_boss()
    
    def check_collisions(self) -> bool:
        """Check for ship-to-ship collisions"""
        if not self.enemies:  # Early exit if no enemies
            return False
            
        player_rect = self.player_ship.get_collision_rect()
        
        for enemy in self.enemies[:]:  # Iterate over a copy to allow safe removal
            enemy_rect = enemy.get_collision_rect()
            if player_rect.colliderect(enemy_rect):
                # Calculate base damage
                if hasattr(enemy, 'is_boss') and enemy.is_boss:
                    # Boss collision: devastating damage
                    # Total damage is 75% of max health (75 points)
                    total_damage = 75
                else:
                    # Regular enemy damage
                    total_damage = 15
                
                # Always apply damage to shield first, then health
                remaining_damage = total_damage
                
                # Consume shield first
                if self.shield_buffer > 0:
                    shield_absorbed = min(remaining_damage, self.shield_buffer)
                    self.shield_buffer -= shield_absorbed
                    remaining_damage -= shield_absorbed
                
                # Apply remaining damage to health
                self.health -= remaining_damage
                self.health = max(0, self.health)  # Don't go below 0
                
                # Create explosion effects
                self.explosions.append(ModernExplosion(enemy.x, enemy.y))
                # Smaller explosion for player damage
                self.explosions.append(ModernExplosion(self.player_ship.x, self.player_ship.y, "small"))
                
                # Play collision sound
                self.sound_manager.play('collision')
                
                # Remove the enemy
                if enemy in self.enemies:
                    self.enemies.remove(enemy)
                if enemy == self.active_enemy:
                    self.active_enemy = None
                    self.current_input = ""
                    
                # Flash effect for damage
                self.collision_detected = True
                return True
        
        # Reset collision flag after a few frames
        if self.collision_detected:
            self.collision_detected = False
        
        return False
    
    def update_game(self):
        """Update game state"""
        if self.game_mode not in [GameMode.NORMAL, GameMode.PROGRAMMING]:
            return
        
        current_time = pygame.time.get_ticks()
        if self.game_start_time == 0:
            self.game_start_time = current_time
        
        # Spawn enemies
        if current_time - self.last_enemy_spawn > self.enemy_spawn_delay:
            self.spawn_enemy()
            self.last_enemy_spawn = current_time
        
        # Update game objects
        for star in self.stars:
            star.update()
        
        self.player_ship.update()
        
        # Update enemies
        enemies_to_remove = []
        for enemy in self.enemies:
            enemy.update()
            
            if enemy.is_off_screen(self.current_height):
                enemies_to_remove.append(enemy)
                # Take damage when enemies escape (less than collision)
                damage = 10
                
                # Apply damage to shield first
                if self.shield_buffer > 0:
                    shield_damage = min(damage, self.shield_buffer)
                    self.shield_buffer -= shield_damage
                    damage -= shield_damage
                
                self.health -= damage
                self.health = max(0, self.health)
                
                if enemy == self.active_enemy:
                    self.active_enemy = None
                    self.current_input = ""
        
        for enemy in enemies_to_remove:
            if enemy in self.enemies:
                self.enemies.remove(enemy)
        
        # Update explosions
        for explosion in self.explosions:
            explosion.update()
        
        self.explosions = [exp for exp in self.explosions if not exp.is_finished()]
        
        # Update typing effects
        for effect in self.typing_effects:
            effect.update()
        
        self.typing_effects = [eff for eff in self.typing_effects if not eff.is_finished()]
        
        # Update laser beams
        for laser in self.laser_beams:
            laser.update()
        
        self.laser_beams = [laser for laser in self.laser_beams if not laser.is_finished()]
        
        # Update EMP cooldown
        if self.emp_cooldown > 0:
            self.emp_cooldown -= 1
            if self.emp_cooldown == 0:
                self.emp_ready = True
        
        # Update EMP effect timer
        if self.emp_effect_timer > 0:
            self.emp_effect_timer -= 1
        
        # Update visual feedback
        if self.wrong_char_flash > 0:
            self.wrong_char_flash -= 1
        
        # Check collisions - but don't instantly kill
        self.check_collisions()
        
        # Check game over - only when health actually reaches 0
        if self.health <= 0:
            # Store the game mode before changing it
            actual_game_mode = self.game_mode
            self.game_mode = GameMode.GAME_OVER
            # Calculate final stats
            if self.total_keystrokes > 0:
                self.accuracy = (self.correct_keystrokes / self.total_keystrokes) * 100
            else:
                self.accuracy = 0
            
            # Update profile stats and check achievements
            if self.current_profile:
                # Update profile stats
                self.current_profile.games_played += 1
                self.current_profile.total_score += self.score
                self.current_profile.total_words_typed += self.words_destroyed
                
                if self.score > self.current_profile.best_score:
                    self.current_profile.best_score = self.score
                
                if self.level > self.current_profile.highest_level:
                    self.current_profile.highest_level = self.level
                
                # Update best WPM if this session's peak was better  
                if self.peak_wpm > self.current_profile.best_wpm:
                    self.current_profile.best_wpm = self.peak_wpm
                    # Save immediately to ensure it persists
                    self.settings.profiles[self.current_profile.name] = self.current_profile
                    self.settings.save_profiles()
                
                # Update mode-specific stats
                mode_key = self.current_profile.get_mode_key(
                    actual_game_mode.value,
                    self.programming_language.value if actual_game_mode == GameMode.PROGRAMMING else None
                )
                mode_stats = self.current_profile.get_mode_stats(
                    actual_game_mode.value,
                    self.programming_language.value if actual_game_mode == GameMode.PROGRAMMING else None
                )
                mode_stats['games_played'] += 1
                if self.score > mode_stats['best_score']:
                    mode_stats['best_score'] = self.score
                if self.level > mode_stats['highest_level']:
                    mode_stats['highest_level'] = self.level
                if self.peak_wpm > mode_stats['best_wpm']:
                    mode_stats['best_wpm'] = self.peak_wpm
                
                # Track language for polyglot achievement
                if actual_game_mode == GameMode.PROGRAMMING:
                    self.current_profile.languages_played.add(self.programming_language.value)
                
                # Calculate session time
                session_time = (pygame.time.get_ticks() - self.game_start_time) / 1000 if self.game_start_time > 0 else 0
                
                # Check achievements
                game_state = {
                    'accuracy': self.accuracy,
                    'game_over': True,
                    'perfect_words': self.perfect_words,
                    'session_time': session_time
                }
                newly_unlocked = self.current_profile.check_achievements(game_state)
                
                # Add achievement notifications to display in UI
                for achievement_id in newly_unlocked:
                    achievement = ACHIEVEMENTS[achievement_id]
                    self.achievement_notifications.append((achievement, 300))  # Show for 5 seconds (300 frames)
                    print(f"Achievement Unlocked: {achievement.name}")
                
                # Save profile
                self.settings.profiles[self.current_profile.name] = self.current_profile
                self.settings.save_profiles()
                self.settings.current_profile = self.current_profile
            
            # Use the stored game mode for high score recording
            lang = self.programming_language.value if actual_game_mode == GameMode.PROGRAMMING else None
            self.settings.add_high_score(actual_game_mode, self.score, self.level, self.current_wpm, self.accuracy, lang)
    
    def draw_modern_background(self):
        """Draw modern gradient background (responsive to current height)"""
        # Create gradient effect using current height
        for i in range(self.current_height):
            ratio = i / self.current_height
            r = int(DARK_BG[0] * (1 - ratio) + DARKER_BG[0] * ratio)
            g = int(DARK_BG[1] * (1 - ratio) + DARKER_BG[1] * ratio)
            b = int(DARK_BG[2] * (1 - ratio) + DARKER_BG[2] * ratio)
            pygame.draw.line(self.screen, (r, g, b), (0, i), (SCREEN_WIDTH, i))
    
    def draw_stats_popup(self):
        """Draw stats popup optimized for narrow window"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Optimized panel for narrow window
        panel_width = min(550, SCREEN_WIDTH - 40)  # Leave margin
        panel_height = min(700, self.current_height - 100)
        panel_rect = pygame.Rect(SCREEN_WIDTH//2 - panel_width//2, 50, panel_width, panel_height)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title (smaller for narrow window)
        stats_title = self.medium_font.render("Player Statistics", True, ACCENT_YELLOW)
        stats_rect = stats_title.get_rect(center=(SCREEN_WIDTH//2, 80))
        self.screen.blit(stats_title, stats_rect)
        
        y_offset = 110
        
        if self.current_profile:
            # Player info section with change button
            player_panel = pygame.Rect(panel_rect.x + 20, y_offset, panel_rect.width - 40, 45)
            pygame.draw.rect(self.screen, MODERN_DARK_GRAY, player_panel, border_radius=8)
            
            # Player name
            profile_title = self.font.render(f"Player: {self.current_profile.name}", True, ACCENT_CYAN)
            self.screen.blit(profile_title, (player_panel.x + 15, player_panel.y + 12))
            
            # Change player button
            change_btn = pygame.Rect(player_panel.right - 100, player_panel.y + 7, 90, 30)
            pygame.draw.rect(self.screen, ACCENT_BLUE, change_btn, border_radius=6)
            change_text = self.small_font.render("Change", True, MODERN_WHITE)
            change_rect = change_text.get_rect(center=change_btn.center)
            self.screen.blit(change_text, change_rect)
            self.stats_change_player_btn = change_btn
            
            y_offset += 55
            
            # Compact stats display - single column for narrow window
            # Get best stats from profile
            best_score = getattr(self.current_profile, 'best_score', 0)
            highest_level = getattr(self.current_profile, 'highest_level', 0)
            best_wpm = getattr(self.current_profile, 'best_wpm', 0.0)
            languages_played = getattr(self.current_profile, 'languages_played', set())
            bosses_defeated = getattr(self.current_profile, 'bosses_defeated', 0)
            
            stats_data = [
                ("Games:", f"{self.current_profile.games_played}", MODERN_WHITE),
                ("Best Score:", f"{best_score:,}", NEON_GREEN),
                ("Level:", f"{highest_level}", ACCENT_CYAN),
                ("Best WPM:", f"{best_wpm:.1f}", ACCENT_ORANGE),
                ("Languages:", f"{len(languages_played)}/7", ACCENT_BLUE)
            ]
            
            # Single column with aligned values
            max_label_width = max(self.small_font.size(label)[0] for label, _, _ in stats_data)
            for label, value, color in stats_data:
                label_surf = self.small_font.render(label, True, MODERN_GRAY)
                value_surf = self.small_font.render(value, True, color)
                self.screen.blit(label_surf, (panel_rect.x + 30, y_offset))
                self.screen.blit(value_surf, (panel_rect.x + 40 + max_label_width, y_offset))
                y_offset += 22
            
            y_offset += 20
            
            # Achievements Section - Better grid layout
            ach_title = self.font.render("Achievements", True, ACCENT_GREEN)
            self.screen.blit(ach_title, (panel_rect.x + 20, y_offset))
            y_offset += 35
            
            # Achievement grid with better spacing
            achievements_per_row = 4  # Less crowded
            ach_size = 70  # Slightly larger
            ach_spacing = 15  # More spacing
            
            # Calculate centering for achievement grid
            grid_width = achievements_per_row * (ach_size + ach_spacing) - ach_spacing
            grid_x_start = panel_rect.x + (panel_rect.width - grid_width) // 2
            
            for i, (ach_id, achievement) in enumerate(ACHIEVEMENTS.items()):
                if y_offset + ach_size > panel_rect.bottom - 100:  # Stop if we run out of space
                    break
                    
                row = i // achievements_per_row
                col = i % achievements_per_row
                
                x_pos = grid_x_start + col * (ach_size + ach_spacing)
                y_pos = y_offset + row * (ach_size + ach_spacing + 10)
                
                # Achievement background with better visuals
                unlocked = ach_id in self.current_profile.achievements
                
                ach_rect = pygame.Rect(x_pos, y_pos, ach_size, ach_size)
                
                if unlocked:
                    # Unlocked achievement - colorful background
                    pygame.draw.rect(self.screen, MODERN_DARK_GRAY, ach_rect, border_radius=10)
                    pygame.draw.rect(self.screen, ACCENT_YELLOW, ach_rect, 2, border_radius=10)
                    # Achievement icon - draw colored circle with text
                    # Different colors for different achievement types
                    icon_color = ACCENT_YELLOW
                    if "speed" in ach_id or "wpm" in ach_id:
                        icon_color = ACCENT_ORANGE
                    elif "boss" in ach_id:
                        icon_color = ACCENT_RED
                    elif "level" in ach_id:
                        icon_color = ACCENT_CYAN
                    elif "perfect" in ach_id or "accuracy" in ach_id:
                        icon_color = ACCENT_GREEN
                    elif "polyglot" in ach_id or "word_master" in ach_id:
                        icon_color = ACCENT_PURPLE
                    
                    # Draw colored circle
                    pygame.draw.circle(self.screen, icon_color, ach_rect.center, 25)
                    # Draw text icon
                    icon_surf = self.small_font.render(achievement.icon, True, MODERN_WHITE)
                    icon_rect = icon_surf.get_rect(center=ach_rect.center)
                    self.screen.blit(icon_surf, icon_rect)
                else:
                    # Locked achievement - mystery look
                    pygame.draw.rect(self.screen, (30, 30, 30), ach_rect, border_radius=10)
                    pygame.draw.rect(self.screen, (60, 60, 60), ach_rect, 1, border_radius=10)
                    # Lock icon or question mark
                    lock_surf = self.medium_font.render("?", True, (80, 80, 80))
                    lock_rect = lock_surf.get_rect(center=ach_rect.center)
                    self.screen.blit(lock_surf, lock_rect)
            
            y_offset += ((len(ACHIEVEMENTS) - 1) // achievements_per_row + 1) * (ach_size + ach_spacing + 10) + 20
        
        # High Scores Section (if space available)
        if y_offset < panel_rect.bottom - 150:  # More space for close button
            hs_title = self.font.render("Top Scores", True, ACCENT_YELLOW)
            self.screen.blit(hs_title, (panel_rect.x + 20, y_offset))
            y_offset += 25
            
            # Get top 3 scores only for narrow display
            all_scores = []
            for mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                scores = self.settings.get_high_scores(mode, limit=3)
                for score in scores:
                    all_scores.append((score, mode))
            
            # Sort by score and take top 3
            all_scores.sort(key=lambda x: x[0].score, reverse=True)
            
            for i, (entry, mode) in enumerate(all_scores[:3]):
                rank = f"{i+1}." 
                # Shortened display for narrow window
                score_text = self.small_font.render(
                    f"{rank} {entry.player_name[:12]}: {entry.score:,}",
                    True, MODERN_LIGHT)
                self.screen.blit(score_text, (panel_rect.x + 30, y_offset))
                y_offset += 20
        
        # Achievement progress at bottom
        if self.current_profile:
            progress_y = panel_rect.bottom - 50
            # Progress bar
            bar_rect = pygame.Rect(panel_rect.x + 20, progress_y, panel_rect.width - 40, 20)
            pygame.draw.rect(self.screen, MODERN_DARK_GRAY, bar_rect, border_radius=10)
            
            # Fill based on achievement percentage
            if len(ACHIEVEMENTS) > 0:
                progress = len(self.current_profile.achievements) / len(ACHIEVEMENTS)
                fill_width = int(bar_rect.width * progress)
                if fill_width > 0:
                    fill_rect = pygame.Rect(bar_rect.x, bar_rect.y, fill_width, bar_rect.height)
                    pygame.draw.rect(self.screen, ACCENT_GREEN, fill_rect, border_radius=10)
            
            # Text overlay
            progress_text = self.small_font.render(
                f"{len(self.current_profile.achievements)}/{len(ACHIEVEMENTS)} Achievements",
                True, MODERN_WHITE
            )
            text_rect = progress_text.get_rect(center=bar_rect.center)
            self.screen.blit(progress_text, text_rect)
            bar_width = panel_rect.width - 40
            bar_height = 10
            progress_ratio = len(self.current_profile.achievements) / len(ACHIEVEMENTS)
            
            bar_rect = pygame.Rect(panel_rect.x + 20, progress_y + 25, bar_width, bar_height)
            pygame.draw.rect(self.screen, MODERN_DARK_GRAY, bar_rect, border_radius=5)
            
            fill_rect = pygame.Rect(panel_rect.x + 20, progress_y + 25, int(bar_width * progress_ratio), bar_height)
            pygame.draw.rect(self.screen, ACCENT_GREEN, fill_rect, border_radius=5)
        
        # Close button - position higher to avoid overlap
        self.close_popout_button.rect.center = (SCREEN_WIDTH//2, panel_rect.bottom - 100)
        self.close_popout_button.draw(self.screen)
    
    def draw_settings_popup(self):
        """Draw settings popup with better spacing"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Settings panel
        panel_rect = pygame.Rect(SCREEN_WIDTH//2 - 250, self.current_height//2 - 250, 500, 500)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        settings_title = self.large_font.render("Settings", True, ACCENT_YELLOW)
        settings_rect = settings_title.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 50))
        self.screen.blit(settings_title, settings_rect)
        
        # Audio Settings Section
        audio_y = panel_rect.y + 100
        audio_title = self.medium_font.render("Audio Settings", True, ACCENT_CYAN)
        audio_rect = audio_title.get_rect(center=(SCREEN_WIDTH//2, audio_y))
        self.screen.blit(audio_title, audio_rect)
        
        # Music volume label and slider
        music_y = audio_y + 50
        music_label = self.font.render("Music Volume", True, MODERN_WHITE)
        self.screen.blit(music_label, (panel_rect.x + 50, music_y))
        
        # Position music slider properly
        self.music_slider.rect.x = panel_rect.x + 50
        self.music_slider.rect.y = music_y + 30
        self.music_slider.draw(self.screen, self.font)
        
        # Sound volume label and slider
        sound_y = music_y + 100
        sound_label = self.font.render("Sound Effects", True, MODERN_WHITE)
        self.screen.blit(sound_label, (panel_rect.x + 50, sound_y))
        
        # Position sound slider properly
        self.sound_slider.rect.x = panel_rect.x + 50
        self.sound_slider.rect.y = sound_y + 30
        self.sound_slider.draw(self.screen, self.font)
        
        # Close button at bottom
        self.close_popout_button.rect.center = (SCREEN_WIDTH//2, panel_rect.bottom - 50)
        self.close_popout_button.draw(self.screen)
    
    def draw_name_entry_popup(self):
        """Draw player name entry popup"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Name entry panel
        panel_w = min(500, int(SCREEN_WIDTH * 0.8))
        panel_h = 300
        panel_rect = pygame.Rect(self.ui_center_x - panel_w//2, self.current_height//2 - panel_h//2, panel_w, panel_h)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        title = self.large_font.render("Enter Your Name", True, ACCENT_YELLOW)
        title_rect = title.get_rect(center=(self.ui_center_x, panel_rect.y + 60))
        self.screen.blit(title, title_rect)
        
        # Name input field
        input_rect = pygame.Rect(self.ui_center_x - 200, panel_rect.y + 120, 400, 50)
        pygame.draw.rect(self.screen, MODERN_DARK_GRAY, input_rect, border_radius=8)
        pygame.draw.rect(self.screen, ACCENT_CYAN if self.entering_name else MODERN_GRAY, input_rect, 2, border_radius=8)
        
        # Display entered name with cursor
        name_display = self.player_name_input + ("_" if pygame.time.get_ticks() % 1000 < 500 else "")
        name_text = self.medium_font.render(name_display, True, MODERN_WHITE)
        name_rect = name_text.get_rect(center=input_rect.center)
        self.screen.blit(name_text, name_rect)
        
        # Instructions
        inst_text = self.font.render("Press ENTER to confirm or ESC to skip", True, MODERN_GRAY)
        inst_rect = inst_text.get_rect(center=(self.ui_center_x, panel_rect.y + 220))
        self.screen.blit(inst_text, inst_rect)
    
    def draw_save_slots_popup(self):
        """Draw save slots popup for saving/loading"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Save panel
        panel_w = min(600, int(SCREEN_WIDTH * 0.9))
        panel_h = 500
        panel_rect = pygame.Rect(self.ui_center_x - panel_w//2, self.current_height//2 - panel_h//2, panel_w, panel_h)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        title_text = "Save Game" if self.saving_game else "Load Game"
        title = self.large_font.render(title_text, True, ACCENT_YELLOW)
        title_rect = title.get_rect(center=(self.ui_center_x, panel_rect.y + 40))
        self.screen.blit(title, title_rect)
        
        # Draw save slots
        slot_y = panel_rect.y + 100
        for i in range(3):
            slot_rect = pygame.Rect(self.ui_center_x - 250, slot_y, 500, 80)
            
            # Check if slot has save data
            save_data = self.settings.save_slots[i]
            if save_data:
                # Slot has data
                pygame.draw.rect(self.screen, MODERN_DARK_GRAY, slot_rect, border_radius=10)
                pygame.draw.rect(self.screen, ACCENT_GREEN, slot_rect, 2, border_radius=10)
                
                # Display save info
                player_name = save_data.get('player_name', 'Unknown')
                level = save_data.get('level', 1)
                score = save_data.get('score', 0)
                mode = save_data.get('game_mode', 'normal')
                
                slot_text = self.font.render(f"Slot {i+1}: {player_name}", True, MODERN_WHITE)
                self.screen.blit(slot_text, (slot_rect.x + 20, slot_rect.y + 10))
                
                info_text = self.small_font.render(
                    f"Level {level} | Score: {score:,} | Mode: {mode.title()}", 
                    True, MODERN_LIGHT
                )
                self.screen.blit(info_text, (slot_rect.x + 20, slot_rect.y + 35))
                
                # Save time
                if 'save_time' in save_data:
                    time_text = self.small_font.render(
                        f"Saved: {save_data['save_time'][:19]}",
                        True, MODERN_GRAY
                    )
                    self.screen.blit(time_text, (slot_rect.x + 20, slot_rect.y + 55))
            else:
                # Empty slot
                pygame.draw.rect(self.screen, MODERN_DARK_GRAY, slot_rect, border_radius=10)
                pygame.draw.rect(self.screen, MODERN_GRAY, slot_rect, 1, border_radius=10)
                
                empty_text = self.font.render(f"Slot {i+1}: Empty", True, MODERN_GRAY)
                self.screen.blit(empty_text, (slot_rect.x + 20, slot_rect.y + 30))
            
            slot_y += 100
        
        # Close button
        close_btn = pygame.Rect(self.ui_center_x - 60, panel_rect.bottom - 70, 120, 40)
        pygame.draw.rect(self.screen, ACCENT_RED, close_btn, border_radius=8)
        close_text = self.font.render("Cancel", True, MODERN_WHITE)
        close_rect = close_text.get_rect(center=close_btn.center)
        self.screen.blit(close_text, close_rect)
    
    def draw_profile_select(self):
        """Draw profile selection as a centered popup over the main menu"""
        # Draw the main menu in the background
        self.draw_menu_background()
        
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Centered popup panel
        popup_w = 400
        popup_h = 300
        popup_x = SCREEN_WIDTH//2 - popup_w//2
        popup_y = self.current_height//2 - popup_h//2
        popup_rect = pygame.Rect(popup_x, popup_y, popup_w, popup_h)
        
        # Draw popup background
        pygame.draw.rect(self.screen, DARK_BG, popup_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_CYAN, popup_rect, 3, border_radius=15)
        
        # Title
        title = self.medium_font.render("SELECT PLAYER", True, ACCENT_YELLOW)
        title_rect = title.get_rect(center=(SCREEN_WIDTH//2, popup_y + 40))
        self.screen.blit(title, title_rect)
        
        # Create or update profile dropdown
        if not hasattr(self, 'profile_dropdown') or self.update_profile_dropdown:
            profile_names = [p.name for p in self.profiles] if self.profiles else []
            if not profile_names:
                profile_names = ["(No profiles)"]
            
            # Try to find the most recently used player from settings
            selected_idx = 0
            if self.settings.current_player_name:
                try:
                    selected_idx = profile_names.index(self.settings.current_player_name)
                except ValueError:
                    selected_idx = 0
            
            dropdown_y = popup_y + 100
            self.profile_dropdown = ModernDropdown(
                SCREEN_WIDTH//2 - 150, dropdown_y, 300, 45,
                profile_names, self.font, selected_index=selected_idx, window_height=self.current_height
            )
            
            # Set selected profile name
            if profile_names and profile_names[0] != "(No profiles)":
                self.selected_profile_name = profile_names[selected_idx]
            elif self.profiles:
                self.selected_profile_name = self.profiles[0].name
            
            self.update_profile_dropdown = False
        
        # If creating a profile, show input dialog
        if self.creating_profile:
            # Dark overlay
            overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
            overlay.set_alpha(180)
            overlay.fill(DARKER_BG)
            self.screen.blit(overlay, (0, 0))
            
            # Input dialog
            dialog_rect = pygame.Rect(SCREEN_WIDTH//2 - 200, self.current_height//2 - 100, 400, 200)
            pygame.draw.rect(self.screen, DARK_BG, dialog_rect, border_radius=10)
            pygame.draw.rect(self.screen, ACCENT_BLUE, dialog_rect, 3, border_radius=10)
            
            # Dialog title
            dialog_title = self.medium_font.render("Enter Profile Name", True, ACCENT_YELLOW)
            title_rect = dialog_title.get_rect(center=(SCREEN_WIDTH//2, dialog_rect.y + 40))
            self.screen.blit(dialog_title, title_rect)
            
            # Input field
            input_rect = pygame.Rect(dialog_rect.x + 50, dialog_rect.y + 80, 300, 40)
            pygame.draw.rect(self.screen, MODERN_DARK_GRAY, input_rect, border_radius=5)
            pygame.draw.rect(self.screen, ACCENT_CYAN, input_rect, 2, border_radius=5)
            
            # Input text
            if self.profile_name_input:
                input_text = self.font.render(self.profile_name_input, True, MODERN_WHITE)
                self.screen.blit(input_text, (input_rect.x + 10, input_rect.y + 10))
            
            # Cursor
            cursor_x = input_rect.x + 10
            if self.profile_name_input:
                text_width = self.font.size(self.profile_name_input)[0]
                cursor_x += text_width
            if pygame.time.get_ticks() % 1000 < 500:  # Blinking cursor
                pygame.draw.line(self.screen, MODERN_WHITE, 
                               (cursor_x, input_rect.y + 10), 
                               (cursor_x, input_rect.y + 30), 2)
            
            # Instructions
            inst_text = self.small_font.render("Press ENTER to confirm or ESC to cancel", True, MODERN_GRAY)
            inst_rect = inst_text.get_rect(center=(SCREEN_WIDTH//2, dialog_rect.bottom - 30))
            self.screen.blit(inst_text, inst_rect)
            
            return  # Don't draw profile slots when creating
        
        # Current player label
        if hasattr(self, 'selected_profile_name') and self.selected_profile_name != "(No profiles)":
            current_label = self.small_font.render(f"Current: {self.selected_profile_name}", True, ACCENT_GREEN)
            label_rect = current_label.get_rect(center=(SCREEN_WIDTH//2, popup_y + 160))
            self.screen.blit(current_label, label_rect)
        
        # Buttons in the popup (draw before dropdown so dropdown appears on top)
        button_y = popup_y + 200
        button_w = 150
        
        # Select button
        if not hasattr(self, 'select_profile_button') or self.update_profile_dropdown:
            self.select_profile_button = ModernButton(
                SCREEN_WIDTH//2 - button_w - 10, button_y, button_w, 40,
                "Select", self.font, True
            )
        
        # New profile button 
        if not hasattr(self, 'new_profile_button') or self.update_profile_dropdown:
            self.new_profile_button = ModernButton(
                SCREEN_WIDTH//2 + 10, button_y, button_w, 40,
                "+ New Player", self.font, False
            )
        
        self.select_profile_button.draw(self.screen)
        self.new_profile_button.draw(self.screen)
        
        # Profile dropdown (draw last so it appears on top)
        self.profile_dropdown.draw(self.screen)
    
    def draw_about_popup(self):
        """Draw about popup with version and credits"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # About panel - adjusted size for version info
        panel_w = 420
        panel_h = 280
        panel_rect = pygame.Rect(SCREEN_WIDTH//2 - panel_w//2, self.current_height//2 - panel_h//2, panel_w, panel_h)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        about_title = self.large_font.render("P-Type", True, ACCENT_YELLOW)
        about_rect = about_title.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 50))
        self.screen.blit(about_title, about_rect)
        
        # Version info
        version_text = self.font.render(f"Version {VERSION}", True, ACCENT_CYAN)
        version_rect = version_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 85))
        self.screen.blit(version_text, version_rect)
        
        # Version name
        version_name_text = self.small_font.render(f"{VERSION_NAME}", True, MODERN_GRAY)
        version_name_rect = version_name_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 105))
        self.screen.blit(version_name_text, version_name_rect)
        
        # Credit text
        credit_text = self.medium_font.render("Created by Randy Northrup", True, MODERN_WHITE)
        credit_rect = credit_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.centery + 10))
        self.screen.blit(credit_text, credit_rect)
        
        year_text = self.font.render("© 2025", True, ACCENT_CYAN)
        year_rect = year_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.centery + 40))
        self.screen.blit(year_text, year_rect)
        
        # Close button at the bottom of panel
        self.close_popout_button.rect.center = (SCREEN_WIDTH//2, panel_rect.bottom - 40)
        self.close_popout_button.draw(self.screen)
    
    def draw_menu_background(self):
        """Draw the menu background with title"""
        # Draw stars
        for star in self.stars:
            star.draw(self.screen)
        
        # Draw the PNG logo image if available, otherwise fall back to text
        if hasattr(self, 'logo_image') and self.logo_image:
            # Draw the logo image centered
            logo_rect = self.logo_image.get_rect(center=(self.ui_center_x, self.ui_title_y))
            self.screen.blit(self.logo_image, logo_rect)
            
            # Add subtle glow effect around the logo
            pulse = abs(math.sin(pygame.time.get_ticks() * 0.001)) * 0.3 + 0.7
            for i in range(3):
                glow_surf = pygame.Surface((logo_rect.width + 20 + i*10, logo_rect.height + 20 + i*10), pygame.SRCALPHA)
                glow_surf.set_alpha(int(30 * pulse * (1 - i/3)))
                pygame.draw.rect(glow_surf, (100, 150, 255, int(30 * pulse * (1 - i/3))), glow_surf.get_rect(), border_radius=15)
                glow_rect = glow_surf.get_rect(center=(self.ui_center_x, self.ui_title_y))
                self.screen.blit(glow_surf, glow_rect)
            
            # Re-draw the logo on top of the glow
            self.screen.blit(self.logo_image, logo_rect)
        else:
            # Fallback to text if image not loaded
            self.draw_gradient_logo(self.ui_center_x, self.ui_title_y)
        
        # Animated subtitle
        subtitle = "The Typing Game"
        subtitle_surface = self.medium_font.render(subtitle, True, ACCENT_CYAN)
        subtitle_rect = subtitle_surface.get_rect(center=(self.ui_center_x, self.ui_subtitle_y))
        self.screen.blit(subtitle_surface, subtitle_rect)
    
    def draw_menu(self):
        """Draw modern main menu"""
        self.draw_menu_background()
        
        # Main action buttons with better styling
        # Continue button (always visible, may be disabled)
        self.continue_button.draw(self.screen)
        
        # Draw New Game button
        self.new_game_button.draw(self.screen)
        
        # Mode selection with improved label
        mode_panel = pygame.Rect(self.ui_center_x - 140, self.dropdown_label_y - 5, 280, 30)
        pygame.draw.rect(self.screen, DARKER_BG, mode_panel, border_radius=15)
        mode_label = self.font.render("Game Mode", True, ACCENT_YELLOW)
        mode_rect = mode_label.get_rect(center=mode_panel.center)
        self.screen.blit(mode_label, mode_rect)
        
        # Bottom menu buttons with icons and better layout (draw before dropdown)
        self.stats_button.draw(self.screen)
        self.settings_button.draw(self.screen)
        self.about_button.draw(self.screen)
        
        # Exit game button
        self.exit_game_button.draw(self.screen)
        
        # Help panel at bottom - draw before dropdown so dropdown can overlap
        # Fixed position from bottom
        help_y = self.current_height - 140  # Fixed position from bottom
        help_panel = pygame.Rect(self.ui_center_x - 240, help_y, 480, 85)
        
        # Draw the help panel
        pygame.draw.rect(self.screen, DARKER_BG, help_panel, border_radius=10)
        pygame.draw.rect(self.screen, MODERN_DARK_GRAY, help_panel, 1, border_radius=10)
        
        # Help title
        help_title = self.font.render("How to Play", True, ACCENT_CYAN)
        title_rect = help_title.get_rect(center=(help_panel.centerx, help_panel.y + 18))
        self.screen.blit(help_title, title_rect)
        
        # Instructions (condensed)
        instructions = [
            "Type falling words before they reach bottom",
            "Health decreases on collision or escape",
            "Press ENTER to activate EMP weapon"
        ]
        
        y_off = help_panel.y + 35
        for instruction in instructions:
            inst_text = self.small_font.render(instruction, True, MODERN_LIGHT)
            inst_rect = inst_text.get_rect(center=(help_panel.centerx, y_off))
            self.screen.blit(inst_text, inst_rect)
            y_off += 16
        
        # Footer info - position above help panel
        footer_text = self.small_font.render("ESC to pause during game", True, MODERN_GRAY)
        footer_rect = footer_text.get_rect(center=(self.ui_center_x, self.current_height - 40))
        self.screen.blit(footer_text, footer_rect)
        
        # Draw mode dropdown ABSOLUTELY LAST so it appears on top of EVERYTHING
        self.mode_dropdown.draw(self.screen)
    
    def draw_game(self):
        """Draw main game screen"""
        # Draw stars
        for star in self.stars:
            star.draw(self.screen)
        
        # Draw player ship
        self.player_ship.draw(self.screen)
        
        # Draw enemies
        for enemy in self.enemies:
            enemy.draw(self.screen, self.font)
        
        # Draw explosions
        for explosion in self.explosions:
            explosion.draw(self.screen)
        
        # Draw laser beams (before typing effects so they appear behind)
        for laser in self.laser_beams:
            laser.draw(self.screen)
        
        # Draw typing effects
        for effect in self.typing_effects:
            effect.draw(self.screen, self.font)
        
        # Draw modern UI
        self.draw_game_ui()
    
    def draw_game_ui(self):
        """Draw modern game UI"""
        # Get current window width for responsive UI
        current_width = pygame.display.get_surface().get_width()
        
        # Top panel background - responsive width
        top_panel = pygame.Rect(0, 0, current_width, 100)
        pygame.draw.rect(self.screen, DARKER_BG, top_panel)
        pygame.draw.rect(self.screen, ACCENT_BLUE, (0, 95, current_width, 5))
        
        # Score
        score_text = self.medium_font.render(f"Score: {self.score:,}", True, MODERN_WHITE)
        self.screen.blit(score_text, (20, 20))
        
        # Level
        level_text = self.medium_font.render(f"Level: {self.level}/{MAX_LEVELS}", True, ACCENT_CYAN)
        self.screen.blit(level_text, (20, 50))
        
        # Health bar - responsive positioning
        health_rect = pygame.Rect(current_width - 220, 20, 180, 25)
        pygame.draw.rect(self.screen, MODERN_DARK_GRAY, health_rect, border_radius=12)
        
        # Draw health with flashing when low
        if self.health <= 30:
            # Flash between red and darker red when health is low
            flash = abs(math.sin(pygame.time.get_ticks() * 0.005)) 
            if flash > 0.5:  # Flash effect
                health_color = ACCENT_RED
            else:
                health_color = (150, 20, 20)  # Darker red
        else:
            health_color = NEON_GREEN if self.health > 60 else ACCENT_ORANGE
            
        health_fill_width = int(180 * self.health / self.max_health)
        if health_fill_width > 0:
            health_fill = pygame.Rect(current_width - 220, 20, health_fill_width, 25)
            pygame.draw.rect(self.screen, health_color, health_fill, border_radius=12)
        
        # Flash the text too when health is low
        text_color = MODERN_WHITE
        if self.health <= 30:
            flash = abs(math.sin(pygame.time.get_ticks() * 0.005))
            if flash > 0.5:
                text_color = ACCENT_RED
        
        health_text = self.small_font.render(f"HP: {self.health}/{self.max_health}", True, text_color)
        health_text_rect = health_text.get_rect(center=(current_width - 130, 32))
        self.screen.blit(health_text, health_text_rect)
        
        # Shield bar (always visible purple bar below health bar)
        shield_rect = pygame.Rect(current_width - 220, 50, 180, 25)
        pygame.draw.rect(self.screen, MODERN_DARK_GRAY, shield_rect, border_radius=12)
        
        shield_width = int(180 * self.shield_buffer / 100)
        if shield_width > 0:
            shield_fill = pygame.Rect(current_width - 220, 50, shield_width, 25)
            pygame.draw.rect(self.screen, ACCENT_PURPLE, shield_fill, border_radius=12)
        
        shield_text = self.small_font.render(f"Shield: {self.shield_buffer}%", True, MODERN_WHITE)
        shield_text_rect = shield_text.get_rect(center=(current_width - 130, 62))
        self.screen.blit(shield_text, shield_text_rect)
        
        # Current input with modern styling
        if self.current_input:
            input_color = ACCENT_YELLOW
            if self.wrong_char_flash > 0 and self.wrong_char_flash % 10 < 5:
                input_color = ACCENT_RED
            
            # Input background (positioned relative to current height)
            input_bg = pygame.Rect(20, self.current_height - 80, 300, 40)
            pygame.draw.rect(self.screen, DARKER_BG, input_bg, border_radius=8)
            pygame.draw.rect(self.screen, input_color, input_bg, 2, border_radius=8)
            
            input_text = self.font.render(f"Typing: {self.current_input}", True, input_color)
            self.screen.blit(input_text, (30, self.current_height - 70))
        
        # Wrong character feedback (positioned relative to current height)
        if self.wrong_char_flash > 0:
            flash_bg = pygame.Rect(20, self.current_height - 120, 200, 30)
            pygame.draw.rect(self.screen, ACCENT_RED, flash_bg, border_radius=6)
            flash_text = self.font.render("Wrong character!", True, MODERN_WHITE)
            flash_text_rect = flash_text.get_rect(center=flash_bg.center)
            self.screen.blit(flash_text, flash_text_rect)
        
        # Achievement notifications
        notification_y = 150
        for i, (achievement, timer) in enumerate(self.achievement_notifications[:3]):  # Show max 3 at once
            if timer > 0:
                # Fade effect
                alpha = min(255, timer * 2) if timer < 60 else 255
                
                # Notification panel
                notif_rect = pygame.Rect(current_width//2 - 200, notification_y + i * 80, 400, 60)
                notif_surface = pygame.Surface((400, 60), pygame.SRCALPHA)
                pygame.draw.rect(notif_surface, (*DARKER_BG[:3], alpha), (0, 0, 400, 60), border_radius=10)
                pygame.draw.rect(notif_surface, (*ACCENT_YELLOW[:3], alpha), (0, 0, 400, 60), 3, border_radius=10)
                
                # Achievement unlocked text
                unlock_text = self.font.render("ACHIEVEMENT UNLOCKED!", True, (*ACCENT_YELLOW[:3], alpha))
                unlock_rect = unlock_text.get_rect(center=(200, 20))
                notif_surface.blit(unlock_text, unlock_rect)
                
                # Achievement name only (no Unicode icon)
                ach_text = self.font.render(f"{achievement.name}", True, (*MODERN_WHITE[:3], alpha))
                ach_rect = ach_text.get_rect(center=(200, 40))
                notif_surface.blit(ach_text, ach_rect)
                
                self.screen.blit(notif_surface, notif_rect)
        
        # Update achievement notification timers
        self.achievement_notifications = [(ach, timer - 1) for ach, timer in self.achievement_notifications if timer > 0]
        
        # Game mode and WPM indicators - stacked display in center of top bar
        mode_text = self.game_mode.value.title()
        if self.game_mode == GameMode.PROGRAMMING:
            mode_text += f" - {self.programming_language.value}"
        
        current_wpm = BASE_WPM + ((MAX_WPM - BASE_WPM) * (self.level - 1) / (MAX_LEVELS - 1))
        
        # Display mode on first line
        mode_surface = self.font.render(mode_text, True, MODERN_WHITE)
        mode_rect = mode_surface.get_rect(center=(current_width//2, 35))
        self.screen.blit(mode_surface, mode_rect)
        
        # Display WPM goal on second line with color based on difficulty
        # Color changes based on WPM speed for visual feedback
        if current_wpm <= 50:
            wpm_color = NEON_GREEN  # Easy - green
        elif current_wpm <= 100:
            wpm_color = ACCENT_CYAN  # Moderate - cyan
        elif current_wpm <= 150:
            wpm_color = ACCENT_YELLOW  # Challenging - yellow
        elif current_wpm <= 200:
            wpm_color = ACCENT_ORANGE  # Hard - orange
        elif current_wpm <= 250:
            wpm_color = NEON_PINK  # Very Hard - pink
        else:
            wpm_color = ACCENT_RED  # Extreme - red
        
        wpm_text = f"WPM Goal: {int(current_wpm)}"
        wpm_surface = self.font.render(wpm_text, True, wpm_color)
        wpm_rect = wpm_surface.get_rect(center=(current_width//2, 60))
        self.screen.blit(wpm_surface, wpm_rect)
        
        # EMP indicator with larger vertical progress bar - add padding from right edge
        emp_y = 110  # Position lower to avoid touching the bar above
        emp_bar_x = current_width - 40  # More padding from right edge
        
        # Always draw vertical EMP progress bar (bigger)
        emp_bar_bg = pygame.Rect(emp_bar_x, emp_y, 15, 60)  # Bigger bar
        pygame.draw.rect(self.screen, MODERN_DARK_GRAY, emp_bar_bg, border_radius=6)
        
        # Progress fill
        if self.emp_ready:
            # Full green bar when ready
            pygame.draw.rect(self.screen, NEON_GREEN, emp_bar_bg, border_radius=6)
        else:
            cooldown_percent = (self.emp_max_cooldown - self.emp_cooldown) / self.emp_max_cooldown
            bar_height = int(60 * cooldown_percent)
            if bar_height > 0:
                emp_bar_fill = pygame.Rect(emp_bar_x, emp_y + (60 - bar_height), 15, bar_height)
                pygame.draw.rect(self.screen, ACCENT_ORANGE, emp_bar_fill, border_radius=6)
        
        # Border
        pygame.draw.rect(self.screen, MODERN_WHITE, emp_bar_bg, 2, border_radius=6)
        
        # EMP text (positioned to the left of the bar)
        if self.emp_ready:
            emp_text = self.small_font.render("EMP Ready", True, NEON_GREEN)
            emp_text2 = self.small_font.render("[ENTER]", True, NEON_GREEN)
            emp_rect = emp_text.get_rect(topright=(emp_bar_x - 10, emp_y + 15))
            emp_rect2 = emp_text2.get_rect(topright=(emp_bar_x - 10, emp_y + 30))
            self.screen.blit(emp_text, emp_rect)
            self.screen.blit(emp_text2, emp_rect2)
        else:
            cooldown_percent = (self.emp_max_cooldown - self.emp_cooldown) / self.emp_max_cooldown
            emp_text = self.small_font.render("EMP", True, ACCENT_ORANGE)
            emp_percent = self.small_font.render(f"{int(cooldown_percent * 100)}%", True, ACCENT_ORANGE)
            emp_rect = emp_text.get_rect(topright=(emp_bar_x - 10, emp_y + 20))
            percent_rect = emp_percent.get_rect(topright=(emp_bar_x - 10, emp_y + 35))
            self.screen.blit(emp_text, emp_rect)
            self.screen.blit(emp_percent, percent_rect)
        
        # Draw EMP effect if active
        if self.emp_effect_timer > 0:
            alpha = self.emp_effect_timer * 8  # Fade out effect
            emp_surf = pygame.Surface((self.emp_radius * 2, self.emp_radius * 2), pygame.SRCALPHA)
            pygame.draw.circle(emp_surf, (*ACCENT_CYAN, min(alpha, 100)), 
                             (self.emp_radius, self.emp_radius), self.emp_radius, 3)
            # Pulse rings
            for i in range(3):
                ring_radius = self.emp_radius * (1 - self.emp_effect_timer / 30) + i * 20
                if ring_radius < self.emp_radius:
                    pygame.draw.circle(emp_surf, (*NEON_BLUE, min(alpha // 2, 50)),
                                     (self.emp_radius, self.emp_radius), int(ring_radius), 2)
            self.screen.blit(emp_surf, (self.player_ship.x - self.emp_radius, 
                                       self.player_ship.y - self.emp_radius))
        
        # Controls - responsive positioning
        controls_text = self.small_font.render("ESC: Pause | Left/Right: Switch | ENTER: EMP", True, MODERN_GRAY)
        controls_rect = controls_text.get_rect(bottomright=(current_width - 20, self.current_height - 20))
        self.screen.blit(controls_text, controls_rect)
    
    def draw_pause_menu(self):
        """Draw modern pause menu"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Pause panel - make it taller to fit all buttons
        panel_h = 450
        panel_w = 350
        panel_y = self.current_height//2 - panel_h//2
        panel_rect = pygame.Rect(SCREEN_WIDTH//2 - panel_w//2, panel_y, panel_w, panel_h)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        pause_text = self.large_font.render("PAUSED", True, ACCENT_YELLOW)
        pause_rect = pause_text.get_rect(center=(SCREEN_WIDTH//2, panel_y + 40))
        self.screen.blit(pause_text, pause_rect)
        
        # Target WPM info
        current_wpm = BASE_WPM + ((MAX_WPM - BASE_WPM) * (self.level - 1) / (MAX_LEVELS - 1))
        info_text = self.small_font.render(f"Target: {int(current_wpm)} WPM", True, MODERN_GRAY)
        info_rect = info_text.get_rect(center=(SCREEN_WIDTH//2, panel_y + 70))
        self.screen.blit(info_text, info_rect)
        
        # Draw buttons only (they're already positioned correctly in setup_ui_elements)
        self.resume_button.draw(self.screen)
        self.save_game_button.draw(self.screen)
        self.pause_settings_button.draw(self.screen)
        self.quit_to_menu_button.draw(self.screen)
        self.quit_game_button.draw(self.screen)
        
        # Controls reminder at bottom
        controls_text = self.small_font.render("ESC: Resume | Left/Right: Switch Ships", True, MODERN_GRAY)
        controls_rect = controls_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.bottom - 20))
        self.screen.blit(controls_text, controls_rect)
    
    def draw_game_over(self):
        """Draw modern game over screen"""
        # Get current window dimensions for responsive UI
        current_width = pygame.display.get_surface().get_width()
        
        # Overlay - responsive to current dimensions
        overlay = pygame.Surface((current_width, self.current_height))
        overlay.set_alpha(220)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Game over panel - centered with current dimensions
        panel_rect = pygame.Rect(current_width//2 - 250, self.current_height//2 - 250, 500, 500)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_RED, panel_rect, 3, border_radius=15)
        
        # Title based on end condition - centered with current width
        if self.collision_detected:
            title_text = self.large_font.render("COLLISION!", True, ACCENT_RED)
        else:
            title_text = self.large_font.render("GAME OVER", True, ACCENT_RED)
        
        title_rect = title_text.get_rect(center=(current_width//2, self.current_height//2 - 180))
        self.screen.blit(title_text, title_rect)
        
        # Stats
        stats = [
            f"Final Score: {self.score:,}",
            f"Level Reached: {self.level}",
            f"Words Destroyed: {self.words_destroyed}",
            f"Mode: {self.game_mode.value.title()}"
        ]
        
        if self.game_mode == GameMode.PROGRAMMING:
            stats.append(f"Language: {self.programming_language.value}")
        
        if self.game_start_time > 0:
            game_time = (pygame.time.get_ticks() - self.game_start_time) / 1000
            minutes = int(game_time // 60)
            seconds = int(game_time % 60)
            stats.append(f"Time: {minutes:02d}:{seconds:02d}")
        
        y_start = self.current_height//2 - 100
        for i, stat in enumerate(stats):
            stat_text = self.font.render(stat, True, MODERN_WHITE)
            stat_rect = stat_text.get_rect(center=(current_width//2, y_start + i * 30))
            self.screen.blit(stat_text, stat_rect)
        
        # High score notification
        # Check if this is a new high score
        lang = self.programming_language.value if self.game_mode == GameMode.PROGRAMMING else None
        scores = self.settings.get_high_scores(self.game_mode, lang, limit=1)
        
        if scores and scores[0].score == self.score:
            new_record_text = self.medium_font.render("NEW HIGH SCORE!", True, ACCENT_YELLOW)
            record_rect = new_record_text.get_rect(center=(current_width//2, self.current_height//2 + 50))
            self.screen.blit(new_record_text, record_rect)
        
        # Buttons
        self.restart_button.draw(self.screen)
        self.menu_button.draw(self.screen)
    
    def draw(self):
        """Main draw method"""
        self.draw_modern_background()
        
        if self.game_mode == GameMode.PROFILE_SELECT:
            self.draw_profile_select()
        elif self.game_mode == GameMode.MENU:
            self.draw_menu()
        elif self.game_mode == GameMode.STATS:
            # Draw stars in background
            for star in self.stars:
                star.draw(self.screen)
            self.draw_stats_popup()
        elif self.game_mode == GameMode.SETTINGS:
            # Draw stars in background
            for star in self.stars:
                star.draw(self.screen)
            self.draw_settings_popup()
        elif self.game_mode == GameMode.ABOUT:
            # Draw stars in background
            for star in self.stars:
                star.draw(self.screen)
            self.draw_about_popup()
        elif self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
            self.draw_game()
        elif self.game_mode == GameMode.PAUSE:
            self.draw_game()
            self.draw_pause_menu()
        elif self.game_mode == GameMode.GAME_OVER:
            for star in self.stars:
                star.draw(self.screen)
            self.draw_game_over()
        
        pygame.display.flip()
    
    def handle_events(self):
        """Handle all game events"""
        for event in pygame.event.get():
            # Allow mouse wheel events only if dropdown is open and can handle them
            wheel_handled = False
            if event.type == pygame.MOUSEWHEEL and self.game_mode == GameMode.MENU:
                if hasattr(self, 'mode_dropdown') and self.mode_dropdown.is_open:
                    wheel_handled = self.mode_dropdown.handle_event(event)
            
            # Ignore mouse wheel events that weren't handled by dropdowns
            if event.type == pygame.MOUSEWHEEL and not wheel_handled:
                continue
            # Also ignore scroll-related mouse button events (4 and 5) ONLY if dropdown is not open
            if (event.type == pygame.MOUSEBUTTONDOWN or event.type == pygame.MOUSEBUTTONUP) and event.button in (4, 5):
                # Allow these events if dropdown is open
                if self.game_mode == GameMode.MENU and hasattr(self, 'mode_dropdown') and self.mode_dropdown.is_open:
                    pass  # Don't continue, let the event through
                else:
                    continue
                
            if event.type == pygame.QUIT:
                self.settings.save_settings()
                self.running = False
            
            elif event.type == pygame.VIDEORESIZE:
                # Handle window resize - maintain portrait proportions
                self.handle_window_resize(event.w, event.h)
            
            elif self.game_mode == GameMode.PROFILE_SELECT:
                self.handle_profile_select_events(event)
            
            elif self.game_mode == GameMode.MENU:
                self.handle_menu_events(event)
            
            elif self.game_mode in [GameMode.STATS, GameMode.SETTINGS, GameMode.ABOUT]:
                self.handle_popout_events(event)
            
            elif self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                self.handle_game_events(event)
            
            elif self.game_mode == GameMode.PAUSE:
                self.handle_pause_events(event)
            
            elif self.game_mode == GameMode.GAME_OVER:
                self.handle_game_over_events(event)
    
    def handle_profile_select_events(self, event):
        """Handle profile selection screen events"""
        # Handle ESC key to go back to menu
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            self.game_mode = GameMode.MENU
            return
        
        if self.creating_profile:
            # Handle profile name input
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    # Create profile with entered name
                    if self.profile_name_input.strip():
                        new_profile = self.create_profile(self.profile_name_input.strip())
                        if new_profile:
                            # Mark that we need to update the dropdown
                            self.update_profile_dropdown = True
                            self.selected_profile_name = new_profile.name
                            self.select_profile(new_profile)
                            # Recalculate UI for new profile
                            self.setup_ui_elements()
                            self.game_mode = GameMode.MENU
                        self.creating_profile = False
                        self.profile_name_input = ""
                elif event.key == pygame.K_ESCAPE:
                    self.creating_profile = False
                    self.profile_name_input = ""
                elif event.key == pygame.K_BACKSPACE:
                    self.profile_name_input = self.profile_name_input[:-1]
                elif event.unicode and event.unicode.isprintable() and len(self.profile_name_input) < 20:
                    self.profile_name_input += event.unicode
        else:
            # Handle dropdown selection
            if hasattr(self, 'profile_dropdown') and self.profile_dropdown.handle_event(event):
                self.selected_profile_name = self.profile_dropdown.get_selected()
            
            # Handle Select button
            elif hasattr(self, 'select_profile_button') and self.select_profile_button.handle_event(event):
                if hasattr(self, 'selected_profile_name') and self.selected_profile_name != "(No profiles)":
                    # Find and select the profile
                    for profile in self.profiles:
                        if profile.name == self.selected_profile_name:
                            self.select_profile(profile)
                            self.setup_ui_elements()
                            self.game_mode = GameMode.MENU
                            break
            
            # Handle New Profile button
            elif hasattr(self, 'new_profile_button') and self.new_profile_button.handle_event(event):
                self.creating_profile = True
                self.profile_name_input = ""
    
    def handle_menu_events(self, event):
        """Handle menu events"""
        
        # Handle dropdown FIRST when it's open - for ANY event type (scroll, keyboard, mouse)
        if self.mode_dropdown.is_open:
            handled = self.mode_dropdown.handle_event(event)
            if handled:
                old_mode = self.selected_mode
                self.selected_mode = self.mode_dropdown.get_selected()
                
                # Only update if selection actually changed
                if old_mode != self.selected_mode:
                    # Enable/disable New Game button based on selection
                    if self.selected_mode != "Choose a Mode":
                        self.new_game_button.is_disabled = False
                    else:
                        self.new_game_button.is_disabled = True
                    
                    # Update Continue button based on new selection
                    # Check if there's a save for the newly selected mode
                    if self.current_profile and self.selected_mode != "Choose a Mode":
                        if self.selected_mode == "Normal":
                            saved_game = self.current_profile.get_saved_game("normal", None)
                        else:
                            saved_game = self.current_profile.get_saved_game("programming", self.selected_mode)
                        self.continue_button.is_disabled = saved_game is None
                    else:
                        self.continue_button.is_disabled = True
                
                return  # Important: return early to prevent other events from being handled
        
        # Handle Continue button if enabled
        if self.continue_button and not self.continue_button.is_disabled and self.continue_button.handle_event(event):
            # Load saved game for currently selected mode
            if self.current_profile and self.selected_mode != "Choose a Mode":
                if self.selected_mode == "Normal":
                    saved_game = self.current_profile.get_saved_game("normal", None)
                    if saved_game:
                        self.load_game_state(saved_game)
                        self.game_mode = GameMode.NORMAL
                else:
                    # Programming mode
                    saved_game = self.current_profile.get_saved_game("programming", self.selected_mode)
                    if saved_game:
                        self.load_game_state(saved_game)
                        self.game_mode = GameMode.PROGRAMMING
                        # Set the correct language
                        for pl in ProgrammingLanguage:
                            if pl.value == self.selected_mode:
                                self.programming_language = pl
                                break
        
        elif self.new_game_button.handle_event(event):
            # Only start game if mode is selected
            if self.selected_mode != "Choose a Mode":
                # Start new game based on selected mode
                self.reset_game_state()
                # Make sure music is playing when game starts
                if not pygame.mixer.music.get_busy():
                    pygame.mixer.music.play(-1)
                if self.selected_mode == "Normal":
                    self.game_mode = GameMode.NORMAL
                else:
                    self.game_mode = GameMode.PROGRAMMING
                    # Set the programming language
                    for lang in ProgrammingLanguage:
                        if lang.value == self.selected_mode:
                            self.programming_language = lang
                            break
        
        elif self.stats_button.handle_event(event):
            self.game_mode = GameMode.STATS
        
        elif self.settings_button.handle_event(event):
            self.game_mode = GameMode.SETTINGS
        
        elif self.about_button.handle_event(event):
            self.game_mode = GameMode.ABOUT
        
        elif self.exit_game_button.handle_event(event):
            self.settings.save_settings()
            pygame.mixer.music.stop()
            self.running = False
        
        # Handle dropdown when it's closed (just opening it)
        elif self.mode_dropdown.handle_event(event):
            # Dropdown is being opened, no need to update anything
            pass
    
    def handle_popout_events(self, event):
        """Handle events for popout screens (stats, settings, about)"""
        if self.close_popout_button.handle_event(event):
            # Return to pause menu if we came from there, otherwise to main menu
            if hasattr(self, '_came_from_pause') and self._came_from_pause:
                self.game_mode = GameMode.PAUSE
                self._came_from_pause = False
            else:
                self.game_mode = GameMode.MENU
        
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            # Return to pause menu if we came from there, otherwise to main menu
            if hasattr(self, '_came_from_pause') and self._came_from_pause:
                self.game_mode = GameMode.PAUSE
                self._came_from_pause = False
            else:
                self.game_mode = GameMode.MENU
        
        # Handle change player button in stats
        elif self.game_mode == GameMode.STATS and hasattr(self, 'stats_change_player_btn'):
            if event.type == pygame.MOUSEBUTTONDOWN and self.stats_change_player_btn.collidepoint(event.pos):
                self.game_mode = GameMode.PROFILE_SELECT
                self.update_profile_dropdown = True
        
        # Handle settings-specific events
        elif self.game_mode == GameMode.SETTINGS:
            if self.music_slider.handle_event(event):
                self.settings.music_volume = self.music_slider.val
                pygame.mixer.music.set_volume(self.music_slider.val)
                self.settings.save_settings()
            
            elif self.sound_slider.handle_event(event):
                self.settings.sound_volume = self.sound_slider.val
                self.sound_manager.set_volume(self.sound_slider.val)
                self.settings.save_settings()
    
    def handle_game_events(self, event):
        """Handle in-game events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.game_mode = GameMode.PAUSE
            elif event.key == pygame.K_RETURN:  # EMP trigger
                self.trigger_emp()
            elif event.key == pygame.K_LEFT:
                self.select_previous_ship()
            elif event.key == pygame.K_RIGHT:
                self.select_next_ship()
            elif event.unicode and event.unicode.isprintable():
                # Allow all printable characters for maximum compatibility
                self.handle_input(event.unicode)
    
    def handle_pause_events(self, event):
        """Handle pause menu events"""
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            if hasattr(self, '_last_game_mode'):
                self.game_mode = self._last_game_mode
            else:
                self.game_mode = GameMode.NORMAL
        
        elif self.resume_button.handle_event(event):
            if hasattr(self, '_last_game_mode'):
                self.game_mode = self._last_game_mode
            else:
                self.game_mode = GameMode.NORMAL
        
        elif self.save_game_button.handle_event(event):
            # Save current game state to profile
            if self.current_profile:
                game_state = self.get_game_state()
                self.settings.current_profile = self.current_profile  # Ensure settings knows current profile
                if self.settings.save_game(game_state):
                    # Visual feedback
                    print(f"Game saved for {self.current_profile.name} - Mode: {game_state.get('game_mode')} Language: {game_state.get('programming_language', 'N/A')}")
        
        elif self.pause_settings_button.handle_event(event):
            # Open settings panel from pause menu
            self._came_from_pause = True  # Track that we came from pause menu
            self.game_mode = GameMode.SETTINGS
        
        elif self.quit_to_menu_button.handle_event(event):
            # Store the mode that was being played before resetting
            played_mode = "Normal" if self._last_game_mode == GameMode.NORMAL else self.programming_language.value
            
            # Reset game state
            self.reset_game_state()
            
            # Update selected mode to match what was just played
            if hasattr(self, 'mode_dropdown'):
                self.selected_mode = played_mode
            
            # Recalculate UI to update Continue button state
            self.setup_ui_elements()
            self.game_mode = GameMode.MENU
        
        elif self.quit_game_button.handle_event(event):
            self.settings.save_settings()
            pygame.mixer.music.stop()
            self.running = False
    
    def handle_game_over_events(self, event):
        """Handle game over screen events"""
        if self.restart_button.handle_event(event):
            self.reset_game_state()
            if hasattr(self, '_last_game_mode'):
                self.game_mode = self._last_game_mode
            else:
                self.game_mode = GameMode.NORMAL
        
        elif self.menu_button.handle_event(event):
            self.game_mode = GameMode.MENU
            self.reset_game_state()
        
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.game_mode = GameMode.MENU
                self.reset_game_state()
    
    def run(self):
        """Main game loop"""
        print(f"P-Type - The Typing Game v{VERSION}")
        print(f"{VERSION_NAME} - Released {RELEASE_DATE}")
        print("="*50)
        print("\nFeatures:")
        print("- Modern UI with 3D ship graphics and smooth animations")
        print("- Normal mode with standard English dictionary words")
        print("- Programming training with 7 languages")
        print("- Boss battles with challenging words at level completion")
        print("- 20 progressive difficulty levels (20-300 WPM)")
        print("- Advanced collision mechanics and visual effects")
        print("- High score tracking and detailed statistics")
        print("- Smart UI with scrollable dropdowns")
        print("- Full keyboard support including special characters")
        print("\nStarting game...")
        
        while self.running:
            # Store game mode for resume functionality
            if self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                self._last_game_mode = self.game_mode
            
            self.handle_events()
            
            # Update UI elements
            for button in [self.continue_button, self.new_game_button,
                          self.stats_button, self.settings_button, self.about_button, self.exit_game_button,
                          self.close_popout_button, self.resume_button, self.quit_to_menu_button, self.quit_game_button,
                          self.restart_button, self.menu_button]:
                if button:  # Check if button exists
                    button.update()
            
            # Update game
            if self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                self.update_game()
            
            self.draw()
            self.clock.tick(FPS)
        
        self.settings.save_settings()
        pygame.quit()
        sys.exit()

def main():
    """Entry point for P-Type"""
    game = PTypeGame()
    game.run()

if __name__ == "__main__":
    main()