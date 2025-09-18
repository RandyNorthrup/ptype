"""
P-Type - Modern Programming Typing Challenge
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
import pygame.mixer
import random
import math
import sys
import json
import os
from typing import List, Tuple, Optional, Dict
from enum import Enum

# Force proper Windows windowing
import os
os.environ['SDL_VIDEO_WINDOW_POS'] = 'centered'
os.environ['SDL_VIDEO_CENTERED'] = '1'
os.environ['SDL_VIDEODRIVER'] = 'windows'  # Force Windows video driver
os.environ['SDL_VIDEO_ALLOW_SCREENSAVER'] = '1'

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# Modern Constants
SCREEN_WIDTH = 600  # Narrow portrait width for typing game
SCREEN_HEIGHT = 800
MIN_WINDOW_WIDTH = 550  # Minimum width to ensure UI elements fit without overlap
MIN_WINDOW_HEIGHT = 800  # Minimum height for all UI elements to fit properly (same as SCREEN_HEIGHT)
PORTRAIT_RATIO = 0.75  # Width to height ratio for portrait orientation (3:4)
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

class GameMode(Enum):
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
                    "padding: 5px;", "display: block;", "width: 100px;", "height: 50px;"
                ],
                'intermediate': [
                    "@media (max-width: 768px) { .container { flex-direction: column; } }",
                    "display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;",
                    ":root { --primary: #3498db; --secondary: #2ecc71; --text: #2c3e50; }",
                    "animation: slideIn 0.5s ease-out forwards;"
                ],
                'advanced': [
                    "@supports (display: grid) { .modern-layout { display: grid; grid-template-areas: 'header header' 'sidebar main' 'footer footer'; } }",
                    "filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)) blur(1px) brightness(1.2) contrast(1.1);",
                    "clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);",
                    "transform: perspective(1000px) rotateX(45deg) rotateY(10deg) rotateZ(5deg) scale3d(1.1, 0.9, 1);"
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
    
    # Normal mode words organized by difficulty - Standard English dictionary words
    NORMAL_WORDS = {
        'beginner': [
            # Simple everyday words (3-5 letters)
            "cat", "dog", "car", "sun", "moon", "tree", "book", "home", "love", "time",
            "hand", "face", "blue", "red", "good", "nice", "come", "word", "work", "life",
            "play", "help", "look", "find", "tell", "make", "take", "give", "said", "water",
            "house", "light", "right", "small", "great", "place", "world", "where", "after", "back"
        ],
        'intermediate': [
            # Common English words (6-8 letters)
            "people", "family", "friend", "school", "student", "teacher", "office", "business",
            "moment", "reason", "result", "change", "number", "letter", "mother", "father",
            "sister", "brother", "question", "problem", "service", "history", "picture", "country",
            "between", "important", "example", "community", "development", "education", "different",
            "national", "special", "possible", "research", "increase", "company", "program"
        ],
        'advanced': [
            # Complex English words (9+ letters)
            "beautiful", "wonderful", "necessary", "important", "experience", "understand",
            "political", "newspaper", "character", "community", "television", "knowledge",
            "education", "government", "development", "management", "organization", "information",
            "relationship", "environment", "traditional", "international", "responsibility",
            "opportunity", "transportation", "communication", "investigation", "appreciation",
            "administration", "representative", "characteristics", "entrepreneurship", "interdisciplinary"
        ]
    }
    
    PROGRAMMING_WORDS = {
        ProgrammingLanguage.PYTHON: {
            'beginner': [
                # Basic Python keywords and simple concepts
                "if", "else", "for", "in", "is", "and", "or", "not", "def", "try",
                "int", "str", "len", "sum", "max", "min", "abs", "pow", "bool", "list",
                "dict", "set", "tuple", "range", "print", "input", "open", "read", "write",
                "True", "False", "None", "pass", "break", "continue", "return", "import"
            ],
            'intermediate': [
                # Common Python patterns and built-ins
                "class", "self", "__init__", "super()", "@property", "lambda", "yield",
                "except", "finally", "with", "as", "from", "global", "nonlocal", "assert",
                "enumerate", "zip", "map", "filter", "sorted", "reversed", "any", "all",
                "isinstance", "hasattr", "getattr", "setattr", "@staticmethod", "@classmethod",
                "split()", "join()", "replace()", "format()", "upper()", "lower()", "strip()",
                "startswith()", "endswith()", "find()", "index()", "append()", "extend()"
            ],
            'advanced': [
                # Advanced Python concepts and libraries
                "async def", "await", "yield from", "f'{variable}'", "[x for x in range(10)]",
                "{k: v for k, v in items()}", "lambda x: x**2", "*args, **kwargs",
                "if __name__ == '__main__':", "with open('file.txt') as f:",
                "try: except Exception as e: finally:", "from typing import List, Dict, Optional",
                "@functools.wraps(func)", "collections.defaultdict(list)", "pathlib.Path()",
                "json.loads(data)", "json.dumps(obj, indent=2)", "requests.get(url)",
                "pandas.DataFrame(data)", "numpy.array([1, 2, 3])", "@pytest.fixture",
                "async with aiohttp.ClientSession():", "dataclasses.dataclass",
                "contextlib.contextmanager", "functools.lru_cache(maxsize=128)"
            ]
        },
        
        ProgrammingLanguage.JAVASCRIPT: {
            'beginner': [
                # Basic JavaScript keywords and concepts
                "var", "let", "const", "if", "else", "for", "while", "do", "break", "continue",
                "true", "false", "null", "undefined", "typeof", "return", "function",
                "alert", "console", "log", "length", "push", "pop", "shift", "slice",
                "string", "number", "boolean", "array", "object", "this", "new", "delete"
            ],
            'intermediate': [
                # Common JavaScript patterns and methods
                "function()", "=> {}", "callback", "promise", "then", "catch", "finally",
                "async", "await", "try", "throw", "switch", "case", "default",
                "forEach", "map", "filter", "reduce", "find", "some", "every", "sort",
                "JSON.parse", "JSON.stringify", "parseInt", "parseFloat", "toString",
                "setTimeout", "setInterval", "clearTimeout", "Math.random", "Math.floor",
                "document", "window", "getElementById", "querySelector", "createElement"
            ],
            'advanced': [
                # Advanced JavaScript and frameworks
                "const { name, age } = person", "const [first, ...rest] = array",
                "import { Component } from 'react'", "export default MyComponent",
                "async function fetchData() { const response = await fetch(url); }",
                "new Promise((resolve, reject) => { /* async operation */ })",
                "array.map(item => ({ ...item, processed: true }))",
                "Object.keys(obj).forEach(key => console.log(obj[key]))",
                "addEventListener('click', event => event.preventDefault())",
                "localStorage.setItem('key', JSON.stringify(data))",
                "fetch('/api/data').then(res => res.json()).catch(err => console.error(err))",
                "const [state, setState] = React.useState(initialValue)",
                "useEffect(() => { /* side effect */ }, [dependency])",
                "class Component extends React.Component { render() { return <div />; } }"
            ]
        },
        
        ProgrammingLanguage.JAVA: {
            'beginner': [
                # Basic Java keywords and concepts
                "class", "public", "private", "static", "void", "int", "String", "boolean",
                "if", "else", "for", "while", "do", "break", "continue", "return",
                "true", "false", "null", "new", "this", "super", "extends", "implements",
                "import", "package", "final", "abstract", "interface", "enum", "try", "catch"
            ],
            'intermediate': [
                # Common Java patterns and classes
                "public class MyClass", "private int value", "public String getName()",
                "@Override", "toString()", "equals()", "hashCode()", "ArrayList<String>",
                "HashMap<String, Integer>", "for (String item : list)", "instanceof",
                "try { } catch (Exception e) { } finally { }", "throw new Exception()",
                "System.out.println()", "Scanner scanner = new Scanner(System.in)",
                "Collections.sort()", "Arrays.asList()", "String.valueOf()", "Integer.parseInt()"
            ],
            'advanced': [
                # Advanced Java and frameworks
                "public static void main(String[] args) { System.out.println(\"Hello\"); }",
                "@Component @Service @Repository @Autowired",
                "List<String> result = stream.filter(s -> s.length() > 5).collect(Collectors.toList())",
                "Optional.ofNullable(getValue()).map(String::toUpperCase).orElse(\"default\")",
                "CompletableFuture.supplyAsync(() -> doSomething()).thenApply(String::toUpperCase)",
                "try (BufferedReader reader = Files.newBufferedReader(path)) { /* auto-close */ }",
                "@RestController public class ApiController { @GetMapping(\"/api\") }",
                "@Entity @Table(name = \"users\") public class User { @Id @GeneratedValue }",
                "interface FunctionalInterface<T> { T apply(T input); }",
                "stream.parallel().mapToInt(String::length).summaryStatistics()"
            ]
        },
        
        ProgrammingLanguage.CSHARP: {
            'beginner': [
                # Basic C# keywords and concepts
                "class", "public", "private", "static", "void", "int", "string", "bool",
                "if", "else", "for", "while", "do", "break", "continue", "return",
                "true", "false", "null", "new", "this", "base", "using", "namespace",
                "var", "const", "readonly", "try", "catch", "finally", "throw", "enum"
            ],
            'intermediate': [
                # Common C# patterns and classes
                "public class MyClass", "private int _value", "public string Name { get; set; }",
                "Console.WriteLine()", "List<string>", "Dictionary<string, int>", "foreach",
                "try { } catch (Exception ex) { } finally { }", "throw new Exception()",
                "string.IsNullOrEmpty()", "int.TryParse()", "DateTime.Now", "Guid.NewGuid()",
                "var result = from x in list where x > 5 select x", "x => x.ToString()"
            ],
            'advanced': [
                # Advanced C# and .NET
                "public async Task<string> GetDataAsync() { return await HttpClient.GetStringAsync(url); }",
                "public record Person(string Name, int Age);",
                "var result = list?.Where(x => x.IsActive)?.Select(x => x.Name).ToList() ?? new List<string>();",
                "using var scope = serviceProvider.CreateScope();",
                "[HttpGet(\"api/users/{id:int}\")] public async Task<ActionResult<User>> GetUser(int id)",
                "services.AddScoped<IUserService, UserService>().AddDbContext<AppDbContext>();",
                "public class User { [Key] public int Id { get; init; } [Required] public string Name { get; init; } }",
                "var config = new ConfigurationBuilder().AddJsonFile(\"appsettings.json\").Build();",
                "await foreach (var item in GetAsyncEnumerable()) { ProcessItem(item); }"
            ]
        },
        
        ProgrammingLanguage.CPLUSPLUS: {
            'beginner': [
                # Basic C++ keywords and concepts
                "int", "char", "bool", "void", "float", "double", "const", "static",
                "if", "else", "for", "while", "do", "break", "continue", "return",
                "true", "false", "nullptr", "new", "delete", "this", "public", "private",
                "class", "struct", "enum", "namespace", "using", "std", "cout", "cin"
            ],
            'intermediate': [
                # Common C++ patterns and STL
                "#include <iostream>", "#include <vector>", "#include <string>", "#include <map>",
                "std::cout <<", "std::cin >>", "std::vector<int>", "std::string",
                "for (auto& item : container)", "class MyClass { public: private: };",
                "std::make_unique<T>()", "std::shared_ptr<T>", "std::move()", "auto",
                "template<typename T>", "const T&", "T&&", "override", "virtual", "final"
            ],
            'advanced': [
                # Advanced C++ and modern features
                "template<typename T> class SmartPointer { std::unique_ptr<T> ptr; };",
                "auto lambda = [](const auto& x) -> decltype(x + 1) { return x + 1; };",
                "std::async(std::launch::async, []() { return expensive_computation(); })",
                "constexpr auto factorial(int n) -> int { return n <= 1 ? 1 : n * factorial(n-1); }",
                "template<typename... Args> void print(Args&&... args) { ((std::cout << args), ...); }",
                "class RAII_Resource { std::unique_ptr<Resource> resource; public: ~RAII_Resource() = default; };",
                "std::vector<std::future<int>> futures; futures.emplace_back(std::async(...));",
                "concept Addable = requires(T a, T b) { a + b; }; template<Addable T> T add(T a, T b);"
            ]
        },
        
        ProgrammingLanguage.CSS: {
            'beginner': [
                # Basic CSS properties and values
                "color", "background", "font-size", "width", "height", "margin", "padding",
                "border", "display", "position", "top", "left", "right", "bottom",
                "text-align", "font-weight", "font-family", "line-height", "opacity",
                "red", "blue", "white", "black", "center", "left", "right", "bold"
            ],
            'intermediate': [
                # Common CSS patterns and layouts
                "display: flex", "justify-content: center", "align-items: center", "flex-direction: column",
                "position: relative", "position: absolute", "position: fixed", "z-index: 999",
                "background-color: #ffffff", "border: 1px solid #ccc", "border-radius: 8px",
                "box-shadow: 0 2px 4px rgba(0,0,0,0.1)", "transition: all 0.3s ease",
                "@media (max-width: 768px)", "hover:scale-105", "focus:outline-none"
            ],
            'advanced': [
                # Advanced CSS and modern features
                "display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));",
                "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);",
                ":root { --primary-color: #3498db; --secondary-color: #2ecc71; }",
                "transform: translateX(-50%) translateY(-50%) scale(1.1) rotate(45deg);",
                "animation: slideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;",
                "@supports (display: grid) { .container { display: grid; } }",
                "filter: blur(5px) brightness(1.2) contrast(1.1) drop-shadow(0 0 10px rgba(0,0,0,0.5));",
                "clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"
            ]
        },
        
        ProgrammingLanguage.HTML: {
            'beginner': [
                # Basic HTML tags and attributes
                "<html>", "<head>", "<body>", "<title>", "<h1>", "<h2>", "<p>", "<div>",
                "<span>", "<a>", "<img>", "<br>", "<hr>", "<ul>", "<ol>", "<li>",
                "href", "src", "alt", "class", "id", "style", "width", "height"
            ],
            'intermediate': [
                # Common HTML5 and form elements
                "<!DOCTYPE html>", "<html lang=\"en\">", "<meta charset=\"UTF-8\">",
                "<header>", "<nav>", "<main>", "<section>", "<article>", "<aside>", "<footer>",
                "<form>", "<input>", "<textarea>", "<select>", "<option>", "<button>", "<label>",
                "<table>", "<thead>", "<tbody>", "<tr>", "<th>", "<td>", "<canvas>",
                "type=\"text\"", "type=\"email\"", "method=\"POST\"", "action=\"/submit\""
            ],
            'advanced': [
                # Modern HTML5 and accessibility
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
                "<link rel=\"stylesheet\" href=\"styles.css\" type=\"text/css\">",
                "<script src=\"script.js\" defer></script>",
                "<form method=\"POST\" action=\"/api/submit\" enctype=\"multipart/form-data\">",
                "<input type=\"email\" name=\"email\" required aria-describedby=\"email-help\">",
                "<picture><source media=\"(min-width: 800px)\" srcset=\"large.jpg\"><img src=\"small.jpg\"></picture>",
                "<video controls preload=\"metadata\"><source src=\"video.mp4\" type=\"video/mp4\"></video>",
                "<details><summary>Click to expand</summary><p>Hidden content here</p></details>"
            ]
        }
    }
    
    @classmethod
    def get_words(cls, mode: GameMode, language: Optional[ProgrammingLanguage] = None, level: int = 1) -> List[str]:
        """Get word list based on game mode, programming language, and difficulty level"""
        if mode == GameMode.NORMAL:
            # Select difficulty based on level
            if level <= 5:
                return cls.NORMAL_WORDS['beginner']
            elif level <= 12:
                return cls.NORMAL_WORDS['intermediate']
            else:
                return cls.NORMAL_WORDS['advanced']
        
        elif mode == GameMode.PROGRAMMING and language:
            lang_dict = cls.PROGRAMMING_WORDS.get(language)
            if lang_dict:
                # Progressive difficulty for programming languages
                if level <= 4:
                    return lang_dict['beginner']
                elif level <= 10:
                    return lang_dict['intermediate']
                else:
                    return lang_dict['advanced']
            return cls.NORMAL_WORDS['beginner']
        
        return cls.NORMAL_WORDS['beginner']
    
    @classmethod
    def get_boss_word(cls, mode: GameMode, language: Optional[ProgrammingLanguage] = None, level: int = 1) -> str:
        """Get a challenging boss word based on game mode, programming language, and difficulty level"""
        if mode == GameMode.NORMAL:
            # Select difficulty based on level
            if level <= 5:
                words = cls.BOSS_WORDS['normal']['beginner']
            elif level <= 12:
                words = cls.BOSS_WORDS['normal']['intermediate']
            else:
                words = cls.BOSS_WORDS['normal']['advanced']
            return random.choice(words)
        
        elif mode == GameMode.PROGRAMMING and language:
            lang_dict = cls.BOSS_WORDS['programming'].get(language)
            if lang_dict:
                # Progressive difficulty for programming languages
                if level <= 4:
                    words = lang_dict['beginner']
                elif level <= 10:
                    words = lang_dict['intermediate']
                else:
                    words = lang_dict['advanced']
                return random.choice(words)
            # Fallback to normal mode boss words
            return random.choice(cls.BOSS_WORDS['normal']['beginner'])
        
        return random.choice(cls.BOSS_WORDS['normal']['beginner'])

class GameSettings:
    """Modern settings management with persistence"""
    
    def __init__(self):
        self.settings_file = "ptype_settings.json"
        self.high_scores_file = "ptype_scores.json"
        
        # Default settings
        self.music_volume = 0.7
        self.sound_volume = 0.8
        self.high_scores = {mode.value: {} for mode in [GameMode.NORMAL, GameMode.PROGRAMMING]}
        self.personal_bests = {mode.value: {} for mode in [GameMode.NORMAL, GameMode.PROGRAMMING]}
        
        self.load_settings()
    
    def save_settings(self):
        """Save settings to file"""
        settings_data = {
            "music_volume": self.music_volume,
            "sound_volume": self.sound_volume
        }
        
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(settings_data, f, indent=2)
        except Exception as e:
            print(f"Could not save settings: {e}")
    
    def load_settings(self):
        """Load settings from file"""
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, 'r') as f:
                    data = json.load(f)
                    self.music_volume = data.get("music_volume", 0.7)
                    self.sound_volume = data.get("sound_volume", 0.8)
        except Exception as e:
            print(f"Could not load settings: {e}")
        
        self.load_scores()
    
    def save_scores(self):
        """Save scores to file"""
        scores_data = {
            "high_scores": self.high_scores,
            "personal_bests": self.personal_bests
        }
        
        try:
            with open(self.high_scores_file, 'w') as f:
                json.dump(scores_data, f, indent=2)
        except Exception as e:
            print(f"Could not save scores: {e}")
    
    def load_scores(self):
        """Load scores from file"""
        try:
            if os.path.exists(self.high_scores_file):
                with open(self.high_scores_file, 'r') as f:
                    data = json.load(f)
                    self.high_scores = data.get("high_scores", {mode.value: {} for mode in [GameMode.NORMAL, GameMode.PROGRAMMING]})
                    self.personal_bests = data.get("personal_bests", {mode.value: {} for mode in [GameMode.NORMAL, GameMode.PROGRAMMING]})
        except Exception as e:
            print(f"Could not load scores: {e}")
    
    def update_high_score(self, mode: GameMode, language: Optional[str], score: int, level: int):
        """Update high score if new score is better"""
        mode_key = mode.value
        lang_key = language if language else "default"
        
        if mode_key not in self.high_scores:
            self.high_scores[mode_key] = {}
        
        if lang_key not in self.high_scores[mode_key]:
            self.high_scores[mode_key][lang_key] = {"score": 0, "level": 0}
        
        current_best = self.high_scores[mode_key][lang_key]
        if score > current_best["score"] or (score == current_best["score"] and level > current_best["level"]):
            self.high_scores[mode_key][lang_key] = {"score": score, "level": level}
            self.save_scores()
            return True
        return False

def draw_3d_ship(screen, x, y, width, height, color, is_player=False, active=False):
    """Draw a modern 3D-style ship with lighting effects"""
    if is_player:
        # Player ship - sleek fighter design pointing up
        # Main body with 3D effect
        main_color = color
        light_color = tuple(min(255, c + 60) for c in color)
        dark_color = tuple(max(0, c - 40) for c in color)
        
        # Main hull (diamond shape)
        hull_points = [
            (x, y),  # Top point (nose)
            (x - width//3, y + height//2),  # Left
            (x, y + height),  # Bottom
            (x + width//3, y + height//2)   # Right
        ]
        pygame.draw.polygon(screen, dark_color, hull_points)
        
        # Highlight edge
        highlight_points = [
            (x, y),
            (x - width//4, y + height//3),
            (x, y + height//2)
        ]
        pygame.draw.polygon(screen, light_color, highlight_points)
        
        # Wings with 3D effect
        left_wing = [
            (x - width//3, y + height//2),
            (x - width//2, y + height//2 - 10),
            (x - width//2 + 5, y + height//2),
            (x - width//3 + 5, y + height//2 + 8)
        ]
        right_wing = [
            (x + width//3, y + height//2),
            (x + width//2, y + height//2 - 10),
            (x + width//2 - 5, y + height//2),
            (x + width//3 - 5, y + height//2 + 8)
        ]
        pygame.draw.polygon(screen, ACCENT_BLUE, left_wing)
        pygame.draw.polygon(screen, ACCENT_BLUE, right_wing)
        
        # Engine glow with gradient effect
        for i in range(5):
            glow_color = tuple(max(0, ACCENT_CYAN[j] - i * 30) for j in range(3))
            pygame.draw.circle(screen, glow_color, (x - 8, y + height - 5), 6 - i)
            pygame.draw.circle(screen, glow_color, (x + 8, y + height - 5), 6 - i)
        
        # Cockpit with glass effect
        pygame.draw.circle(screen, NEON_GREEN, (x, y + 20), 10)
        pygame.draw.circle(screen, MODERN_WHITE, (x - 2, y + 18), 6)
        
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
        twinkle_factor = 0.7 + 0.3 * math.sin(self.twinkle * 0.1)
        current_brightness = int(self.brightness * twinkle_factor)
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
    """Modern enemy with enhanced 3D graphics and animations"""
    def __init__(self, word: str, level: int):
        self.original_word = word
        self.word = word
        self.typed_chars = ""
        self.x = random.randint(80, SCREEN_WIDTH - 80)
        self.y = -50
        
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
        
    def update(self):
        self.y += self.speed
        self.hover_offset += 0.1
        self.pulse += 0.15
        
    def draw(self, screen, font):
        # Calculate hover effect
        hover_y = self.y + math.sin(self.hover_offset) * 2
        
        # Determine ship color based on state
        base_color = ACCENT_RED if self.active else MODERN_DARK_GRAY
        
        # Draw 3D ship
        draw_3d_ship(screen, self.x, int(hover_y), self.width, self.height, base_color, False, self.active)
        
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
    def __init__(self, word: str, level: int):
        super().__init__(word, level)
        
        # Boss ships are larger and more imposing
        self.width = 120  # Double the normal width
        self.height = 90  # Double the normal height
        self.is_boss = True
        
        # Boss ships move much slower but are more menacing
        self.speed *= 0.3  # Much slower movement for better gameplay
        
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
            base_color = ACCENT_ORANGE  # Golden/orange for active boss
        else:
            base_color = ACCENT_PURPLE  # Purple for inactive boss
        
        # Draw boss shield effect
        shield_alpha = int(60 + 40 * math.sin(self.shield_pulse))
        shield_surface = pygame.Surface((self.width + 40, self.height + 40))
        shield_surface.set_alpha(shield_alpha)
        pygame.draw.circle(shield_surface, NEON_PINK, 
                          (self.width//2 + 20, self.height//2 + 20), 
                          self.width//2 + 20, 3)
        shield_rect = shield_surface.get_rect(center=(self.x, int(hover_y) + self.height//2))
        screen.blit(shield_surface, shield_rect)
        
        # Draw enlarged 3D ship
        draw_3d_ship(screen, self.x, int(hover_y), self.width, self.height, base_color, False, self.active)
        
        # Boss glow effect
        glow_intensity = int(30 + 20 * math.sin(self.boss_glow))
        glow_surface = pygame.Surface((self.width + 60, self.height + 60))
        glow_surface.set_alpha(glow_intensity)
        glow_surface.fill(ACCENT_YELLOW)
        glow_rect = glow_surface.get_rect(center=(self.x, int(hover_y) + self.height//2))
        screen.blit(glow_surface, glow_rect)
        
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
    bottom of the window (120px from bottom) regardless of window size.
    """
    def __init__(self, window_height=SCREEN_HEIGHT):
        # Get current window width for responsive positioning
        actual_window = pygame.display.get_surface()
        if actual_window:
            window_width = actual_window.get_width()
        else:
            window_width = SCREEN_WIDTH
        
        self.x = window_width // 2  # Center horizontally in current window
        self.y = window_height - 120  # Position relative to current window height
        self.width = 70
        self.height = 60
        self.pulse = 0
        self.window_height = window_height
        self.window_width = window_width
        
    def update(self):
        self.pulse += 0.1
        
    def draw(self, screen):
        # Draw 3D player ship
        draw_3d_ship(screen, self.x, self.y, self.width, self.height, ACCENT_CYAN, True, False)
        
        # Add shield effect
        shield_alpha = int(50 + 30 * math.sin(self.pulse))
        shield_surface = pygame.Surface((self.width + 20, self.height + 20))
        shield_surface.set_alpha(shield_alpha)
        pygame.draw.circle(shield_surface, NEON_BLUE, (self.width//2 + 10, self.height//2 + 10), 
                          self.width//2 + 10, 2)
        shield_rect = shield_surface.get_rect(center=(self.x, self.y + self.height//2))
        screen.blit(shield_surface, shield_rect)
    
    def update_position_for_window_dimensions(self, new_width, new_height):
        """Update player ship position when window dimensions change"""
        self.window_height = new_height
        self.window_width = new_width
        self.x = new_width // 2  # Re-center horizontally
        self.y = new_height - 120  # Position at bottom
    
    def get_collision_rect(self) -> pygame.Rect:
        """Get collision rectangle for ship collision detection"""
        return pygame.Rect(self.x - self.width//2, self.y, self.width, self.height)

class ModernExplosion:
    """Enhanced explosion with particle effects"""
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y
        self.particles = []
        
        # Create more particles with varied properties
        for _ in range(25):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(3, 12)
            self.particles.append({
                'x': x,
                'y': y,
                'vx': math.cos(angle) * speed,
                'vy': math.sin(angle) * speed,
                'life': random.randint(40, 60),
                'max_life': 60,
                'size': random.randint(2, 6),
                'color_type': random.choice(['fire', 'spark', 'smoke'])
            })
    
    def update(self):
        for particle in self.particles:
            particle['x'] += particle['vx']
            particle['y'] += particle['vy']
            particle['life'] -= 1
            particle['vx'] *= 0.98  # Drag
            particle['vy'] *= 0.98
            particle['vy'] += 0.1   # Gravity
        
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
    """Sleek modern button with hover effects"""
    def __init__(self, x, y, width, height, text, font, primary=False):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.font = font
        self.primary = primary
        self.is_hovered = False
        self.click_animation = 0
        
    def handle_event(self, event):
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
        if self.primary:
            base_color = ACCENT_BLUE
            hover_color = NEON_BLUE
            text_color = MODERN_WHITE
        else:
            base_color = MODERN_DARK_GRAY
            hover_color = MODERN_GRAY
            text_color = MODERN_LIGHT
        
        # Current color based on state
        current_color = hover_color if self.is_hovered else base_color
        
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
    def __init__(self, x, y, width, height, options, font, selected_index=0):
        self.rect = pygame.Rect(x, y, width, height)
        self.options = options
        self.font = font
        self.selected_index = selected_index
        self.is_open = False
        self.is_hovered = False
        
        # Calculate if dropdown should open upward or downward
        dropdown_height = height * len(options)
        space_below = SCREEN_HEIGHT - (y + height)
        space_above = y
        
        self.open_upward = space_below < dropdown_height and space_above > space_below
        
        # Limit visible options to fit in screen
        max_visible = min(len(options), 
                         int((space_above if self.open_upward else space_below) // height))
        self.max_visible = max(3, max_visible)  # Show at least 3 options
        
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
                for rect, option_index in self.option_rects:
                    if rect.collidepoint(event.pos):
                        self.selected_index = option_index
                        self.is_open = False
                        return True
                self.is_open = False
        # Handle scrolling when dropdown is open
        elif event.type == pygame.MOUSEWHEEL and self.is_open:
            if len(self.options) > self.max_visible:
                self.scroll_offset = max(0, min(len(self.options) - self.max_visible, 
                                              self.scroll_offset - event.y))
                self._update_option_rects()
            return True
        return False
    
    def draw(self, screen):
        # Main dropdown button
        color = ACCENT_BLUE if self.is_hovered else MODERN_DARK_GRAY
        pygame.draw.rect(screen, color, self.rect, border_radius=6)
        pygame.draw.rect(screen, MODERN_WHITE, self.rect, 2, border_radius=6)
        
        # Selected option text
        text = self.options[self.selected_index]
        text_surface = self.font.render(text, True, MODERN_WHITE)
        text_rect = text_surface.get_rect(center=self.rect.center)
        text_rect.x = self.rect.x + 10  # Left align
        screen.blit(text_surface, text_rect)
        
        # Arrow (pointing up if opening upward, down if opening downward)
        if self.open_upward:
            arrow_points = [
                (self.rect.right - 20, self.rect.centery + 5),
                (self.rect.right - 10, self.rect.centery - 5),
                (self.rect.right - 30, self.rect.centery - 5)
            ]
        else:
            arrow_points = [
                (self.rect.right - 20, self.rect.centery - 5),
                (self.rect.right - 10, self.rect.centery + 5),
                (self.rect.right - 30, self.rect.centery + 5)
            ]
        pygame.draw.polygon(screen, MODERN_WHITE, arrow_points)
        
        # Options when open
        if self.is_open:
            # Draw background for dropdown area
            if self.option_rects:
                first_rect = self.option_rects[0][0]
                last_rect = self.option_rects[-1][0]
                
                bg_rect = pygame.Rect(
                    first_rect.x - 2,
                    min(first_rect.y, last_rect.y) - 2,
                    first_rect.width + 4,
                    abs(last_rect.bottom - first_rect.top) + 4
                )
                pygame.draw.rect(screen, DARKER_BG, bg_rect, border_radius=8)
                pygame.draw.rect(screen, ACCENT_BLUE, bg_rect, 2, border_radius=8)
            
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
                # Scroll up indicator
                if self.scroll_offset > 0:
                    up_arrow = [
                        (self.rect.right - 15, self.rect.y - 15),
                        (self.rect.right - 10, self.rect.y - 10),
                        (self.rect.right - 20, self.rect.y - 10)
                    ]
                    pygame.draw.polygon(screen, ACCENT_YELLOW, up_arrow)
                
                # Scroll down indicator
                if self.scroll_offset + self.max_visible < len(self.options):
                    down_y = self.rect.bottom + (self.max_visible * self.rect.height) + 5
                    if not self.open_upward:
                        down_arrow = [
                            (self.rect.right - 15, down_y + 5),
                            (self.rect.right - 10, down_y),
                            (self.rect.right - 20, down_y)
                        ]
                        pygame.draw.polygon(screen, ACCENT_YELLOW, down_arrow)
    
    def get_selected(self):
        return self.options[self.selected_index]

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
    
    def _get_knob_rect(self):
        knob_x = self.rect.x + (self.val - self.min_val) / (self.max_val - self.min_val) * self.rect.width
        return pygame.Rect(knob_x - self.knob_radius, self.rect.y - 2, 
                          self.knob_radius * 2, self.rect.height + 4)
    
    def draw(self, screen, font):
        # Track
        pygame.draw.rect(screen, MODERN_DARK_GRAY, self.rect, border_radius=self.rect.height//2)
        
        # Fill (progress)
        fill_width = int((self.val - self.min_val) / (self.max_val - self.min_val) * self.rect.width)
        if fill_width > 0:
            fill_rect = pygame.Rect(self.rect.x, self.rect.y, fill_width, self.rect.height)
            pygame.draw.rect(screen, ACCENT_BLUE, fill_rect, border_radius=self.rect.height//2)
        
        # Knob
        knob_x = self.rect.x + (self.val - self.min_val) / (self.max_val - self.min_val) * self.rect.width
        knob_center = (int(knob_x), self.rect.centery)
        pygame.draw.circle(screen, MODERN_WHITE, knob_center, self.knob_radius)
        pygame.draw.circle(screen, ACCENT_BLUE, knob_center, self.knob_radius - 2)
        
        # Label and value
        label_text = font.render(f"{self.label}: {self.val:.1f}", True, MODERN_WHITE)
        screen.blit(label_text, (self.rect.x, self.rect.y - 30))

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
        
        # Calculate proportional width to maintain portrait ratio
        proportional_width = int(default_height * PORTRAIT_RATIO)
        window_width = max(MIN_WINDOW_WIDTH, proportional_width)
        
        # Create window with borders and proper title bar - force windowed mode
        # Ensure it's not fullscreen and has window decorations
        flags = pygame.RESIZABLE
        self.screen = pygame.display.set_mode((window_width, default_height), flags)
        pygame.display.set_caption("P-Type - Programming Typing Challenge")
        
        # Window is ready to use with normal Windows decorations
        
        self.clock = pygame.time.Clock()
        self.current_height = default_height
        self.is_maximized = False  # Start in normal windowed state
        self.normal_height = default_height  # Store this as normal height
        
        # Modern fonts
        try:
            self.small_font = pygame.font.Font(None, 20)
            self.font = pygame.font.Font(None, 26)
            self.medium_font = pygame.font.Font(None, 36)
            self.large_font = pygame.font.Font(None, 48)
            self.title_font = pygame.font.Font(None, 84)
        except:
            # Fallback to default fonts
            self.small_font = pygame.font.Font(None, 20)
            self.font = pygame.font.Font(None, 26)
            self.medium_font = pygame.font.Font(None, 36)
            self.large_font = pygame.font.Font(None, 48)
            self.title_font = pygame.font.Font(None, 84)
        
        # Game state
        self.running = True
        self.game_mode = GameMode.MENU
        self.programming_language = ProgrammingLanguage.PYTHON
        self.settings = GameSettings()
        
        # Game variables
        self.reset_game_state()
        
        # Enhanced game objects
        self.stars = [ModernStar() for _ in range(200)]
        self.player_ship = ModernPlayerShip(self.current_height)
        
        # UI elements - setup after window is created
        self.setup_ui_elements()
        
        # Force UI recalculation with actual window dimensions
        pygame.display.flip()  # Ensure window is fully created
        self.setup_ui_elements()  # Setup again with correct dimensions
        
    def reset_game_state(self):
        """Reset all game state variables"""
        self.score = 0
        self.level = 1
        self.health = 100
        self.missed_ships = 0
        self.words_destroyed = 0
        self.enemies = []
        self.explosions = []
        self.current_input = ""
        self.active_enemy = None
        self.last_enemy_spawn = 0
        self.game_start_time = 0
        self.collision_detected = False
        self.wrong_char_flash = 0
        
        # Boss system variables
        self.boss_spawned = False
        self.boss_defeated = False
        self.boss_spawn_time = 0
        self.enemies_defeated_this_level = 0
        
        self.update_spawn_delay()
    
    def update_spawn_delay(self):
        """Update enemy spawn delay based on current level"""
        base_delay = 4000
        min_delay = 1000
        delay_reduction = (base_delay - min_delay) * (self.level - 1) / (MAX_LEVELS - 1)
        self.enemy_spawn_delay = max(min_delay, base_delay - delay_reduction)
    
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
        # Force window update and get actual current dimensions
        pygame.display.flip()
        
        actual_window = pygame.display.get_surface()
        if actual_window:
            window_w = actual_window.get_width()
            window_h = actual_window.get_height()
        else:
            window_w = SCREEN_WIDTH
            window_h = self.current_height
        
        
        # Central reference point for all UI
        center_x = window_w // 2
        
        # Store current window dimensions for responsive drawing
        self.ui_window_width = window_w
        self.ui_center_x = center_x
        
        # Store responsive positions for text elements
        self.ui_title_y = max(80, int(window_h * 0.08))  # Title at 8% of height, min 80px
        self.ui_subtitle_y = self.ui_title_y + 50  # Subtitle 50px below title
        
        # Standard button width - 70% of window, constrained between 200-350px
        std_button_w = max(200, min(350, int(window_w * 0.7)))
        
        # Main mode buttons - positioned with generous spacing
        # Start at 25% of window height, minimum 200px from top for title space
        normal_y = max(200, int(window_h * 0.25))
        programming_y = normal_y + 90  # Generous 90px spacing between buttons
        
        self.start_normal_button = ModernButton(
            center_x - std_button_w // 2, normal_y, std_button_w, 60, 
            "📝 Normal Mode", self.medium_font, True
        )
        
        self.start_programming_button = ModernButton(
            center_x - std_button_w // 2, programming_y, std_button_w, 60, 
            "💻 Programming Mode", self.medium_font, True
        )
        
        # Language dropdown - positioned with generous spacing below programming button
        languages = [lang.value for lang in ProgrammingLanguage]
        # Programming button ends at programming_y + 60, add 100px spacing minimum
        dropdown_y = programming_y + 160  # Fixed generous spacing
        dropdown_w = max(180, min(250, int(window_w * 0.65)))
        
        self.language_dropdown = ModernDropdown(
            center_x - dropdown_w // 2, dropdown_y, dropdown_w, 50, 
            languages, self.font
        )
        
        # Store dropdown label position (30px above dropdown)
        self.dropdown_label_y = dropdown_y - 30
        
        # Store version info position (responsive to window height)
        self.ui_version_y = window_h - 20
        
        # Update player ship position for responsive window
        if hasattr(self, 'player_ship'):
            self.player_ship.update_position_for_window_dimensions(window_w, window_h)
        
        # Bottom menu buttons - positioned with generous spacing below dropdown
        # Dropdown ends at dropdown_y + 50, add 100px spacing minimum
        bottom_y = dropdown_y + 150  # Fixed generous spacing
        # Ensure we're not too close to bottom (at least 100px from bottom)
        bottom_y = min(bottom_y, window_h - 150)
        
        small_btn_w = max(85, min(110, window_w // 8))  # Responsive small button width
        btn_spacing = max(15, min(25, window_w // 25))  # More generous spacing
        
        # Calculate total width and starting position for centering
        total_width = 3 * small_btn_w + 2 * btn_spacing
        start_x = center_x - total_width // 2
        
        self.stats_button = ModernButton(
            start_x, bottom_y, small_btn_w, 50, 
            "📈 Stats", self.font, False
        )
        
        self.settings_button = ModernButton(
            start_x + small_btn_w + btn_spacing, bottom_y, small_btn_w, 50, 
            "⚙️ Settings", self.font, False
        )
        
        self.about_button = ModernButton(
            start_x + 2 * (small_btn_w + btn_spacing), bottom_y, small_btn_w, 50, 
            "ℹ️ About", self.font, False
        )
        
        # Exit game button - positioned below other buttons
        exit_btn_w = max(120, min(160, int(window_w * 0.6)))
        exit_y = bottom_y + 70  # 70px below other buttons
        # Ensure it doesn't go too close to bottom
        exit_y = min(exit_y, window_h - 80)
        
        self.exit_game_button = ModernButton(
            center_x - exit_btn_w // 2, exit_y, exit_btn_w, 50, 
            "🚪 Exit Game", self.font, False
        )
        
        # Close popout button
        close_btn_w = max(110, min(140, int(window_w * 0.55)))
        self.close_popout_button = ModernButton(
            center_x - close_btn_w // 2, bottom_y, close_btn_w, 50, 
            "Close", self.medium_font, True
        )
        
        # Pause menu elements - now with 3 buttons
        pause_btn_w = max(160, min(250, int(window_w * 0.65)))
        self.resume_button = ModernButton(
            center_x - pause_btn_w // 2, int(window_h * 0.35), pause_btn_w, 60, 
            "Resume", self.medium_font, True
        )
        self.quit_to_menu_button = ModernButton(
            center_x - pause_btn_w // 2, int(window_h * 0.50), pause_btn_w, 60, 
            "Main Menu", self.medium_font
        )
        self.quit_game_button = ModernButton(
            center_x - pause_btn_w // 2, int(window_h * 0.65), pause_btn_w, 60, 
            "🚪 Quit Game", self.medium_font
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
        """Handle window resize events maintaining portrait proportions.
        
        Enforces minimum window dimensions and maintains 3:4 aspect ratio.
        Automatically recalculates all UI element positions for the new dimensions.
        """
        # Enforce minimum height to ensure UI elements fit properly
        new_height = max(MIN_WINDOW_HEIGHT, height)
        
        # Always maintain portrait ratio by calculating proportional width
        proportional_width = int(new_height * PORTRAIT_RATIO)
        new_width = max(MIN_WINDOW_WIDTH, proportional_width)
        
        # Update normal height for restore functionality
        if not self.is_maximized:
            self.normal_height = new_height
        
        # Create resizable window
        self.screen = pygame.display.set_mode((new_width, new_height), pygame.RESIZABLE)
        self.current_height = new_height
        
        # Re-disable maximize button after resize
        if self._disable_maximize_later:
            self._disable_windows_maximize_button()
        
        # Recalculate UI positions for the new dimensions
        pygame.display.flip()  # Ensure window changes are applied
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
            self.handle_window_resize(0, self.normal_height)  # Width will be calculated proportionally
        else:
            # Maximize to screen height (but keep draggable)
            self.is_maximized = True
            max_height = screen_height - 80  # Leave space for taskbar
            self.handle_window_resize(0, max_height)  # Width will be calculated proportionally
    
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
            enemy = ModernEnemy(word, self.level)
            self.enemies.append(enemy)
    
    def spawn_boss(self):
        """Spawn a boss enemy with a challenging word"""
        if not self.boss_spawned:
            # Get a challenging boss word
            boss_word = WordDictionary.get_boss_word(self.game_mode, self.programming_language, self.level)
            
            # Create boss enemy
            boss = BossEnemy(boss_word, self.level)
            self.enemies.append(boss)
            
            self.boss_spawned = True
            self.boss_spawn_time = pygame.time.get_ticks()
            
            # Don't clear existing enemies - let them coexist with boss for added challenge
    
    def handle_input(self, char: str):
        """Handle character input from player"""
        # If no active enemy, try to start typing a new word
        if self.active_enemy is None:
            for enemy in self.enemies:
                if enemy.original_word.startswith(char) and not enemy.active:
                    enemy.active = True
                    enemy.typed_chars = char
                    self.active_enemy = enemy
                    self.current_input = char
                    break
        else:
            # Continue typing the active word
            if self.active_enemy in self.enemies:
                if self.active_enemy.type_char(char):
                    self.current_input += char
                    
                    if self.active_enemy.is_word_complete():
                        self.destroy_enemy(self.active_enemy)
                        self.active_enemy = None
                        self.current_input = ""
                else:
                    # Wrong character feedback
                    self.wrong_char_flash = 30
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
                        break
    
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
            self.explosions.append(ModernExplosion(enemy.x, enemy.y))
            
            # Boss enemies are worth more points
            word_score = len(enemy.word) * 10 * self.level
            if hasattr(enemy, 'is_boss') and enemy.is_boss:
                word_score *= 3  # Boss enemies worth triple points
                
            self.score += word_score
            self.words_destroyed += 1
            
            # Check if this was a boss - if so, advance level immediately
            if hasattr(enemy, 'is_boss') and enemy.is_boss:
                if self.level < MAX_LEVELS:
                    self.level += 1
                    self.update_spawn_delay()
                    self.health = min(100, self.health + 30)  # Extra health for beating boss
                    self.boss_defeated = True
                    self.boss_spawned = False  # Allow new boss for next level
                    self.enemies_defeated_this_level = 0  # Reset counter
            else:
                # Count regular enemies defeated this level
                self.enemies_defeated_this_level += 1
                
                # Spawn boss after 8 regular enemies (if boss not already spawned)
                if self.enemies_defeated_this_level >= 8 and not self.boss_spawned:
                    self.spawn_boss()
    
    def check_collisions(self):
        """Check for ship-to-ship collisions"""
        player_rect = self.player_ship.get_collision_rect()
        
        for enemy in self.enemies:
            enemy_rect = enemy.get_collision_rect()
            if player_rect.colliderect(enemy_rect):
                self.collision_detected = True
                self.explosions.append(ModernExplosion(enemy.x, enemy.y))
                self.explosions.append(ModernExplosion(self.player_ship.x, self.player_ship.y))
                if enemy in self.enemies:
                    self.enemies.remove(enemy)
                if enemy == self.active_enemy:
                    self.active_enemy = None
                    self.current_input = ""
                return True
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
                self.missed_ships += 1
                self.health -= 15
                
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
        
        # Update visual feedback
        if self.wrong_char_flash > 0:
            self.wrong_char_flash -= 1
        
        # Check collisions
        if self.check_collisions():
            self.health = 0
        
        # Check game over
        if self.health <= 0 or self.missed_ships >= MAX_MISSED_SHIPS or self.collision_detected:
            self.game_mode = GameMode.GAME_OVER
            lang = self.programming_language.value if self.game_mode == GameMode.PROGRAMMING else None
            self.settings.update_high_score(self.game_mode, lang, self.score, self.level)
    
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
        """Draw stats popup with high scores and personal bests"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Stats panel
        panel_rect = pygame.Rect(SCREEN_WIDTH//2 - 300, 100, 600, 700)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        stats_title = self.large_font.render("📊 Statistics", True, ACCENT_YELLOW)
        stats_rect = stats_title.get_rect(center=(SCREEN_WIDTH//2, 150))
        self.screen.blit(stats_title, stats_rect)
        
        # High Scores Section
        hs_title = self.medium_font.render("🏆 High Scores", True, ACCENT_CYAN)
        self.screen.blit(hs_title, (SCREEN_WIDTH//2 - 280, 220))
        
        y_offset = 260
        for mode_name in ["normal", "programming"]:
            mode_title = self.font.render(f"{mode_name.title()} Mode:", True, MODERN_WHITE)
            self.screen.blit(mode_title, (SCREEN_WIDTH//2 - 280, y_offset))
            y_offset += 30
            
            if mode_name in self.settings.high_scores:
                mode_scores = self.settings.high_scores[mode_name]
                if mode_scores:
                    # Show top 3 scores
                    sorted_scores = sorted(mode_scores.items(), 
                                          key=lambda x: x[1]["score"], reverse=True)[:3]
                    
                    for i, (lang_key, score_data) in enumerate(sorted_scores):
                        lang_display = lang_key if lang_key != "default" else "English"
                        icon = "🥇" if i == 0 else "🥈" if i == 1 else "🥉"
                        score_text = self.small_font.render(
                            f"  {icon} {lang_display}: {score_data['score']:,} (Level {score_data['level']})",
                            True, MODERN_LIGHT)
                        self.screen.blit(score_text, (SCREEN_WIDTH//2 - 260, y_offset))
                        y_offset += 25
                else:
                    no_scores = self.small_font.render("  No scores yet", True, MODERN_GRAY)
                    self.screen.blit(no_scores, (SCREEN_WIDTH//2 - 260, y_offset))
                    y_offset += 25
            y_offset += 20
        
        # Personal Bests Section (if implemented)
        pb_title = self.medium_font.render("✨ Personal Records", True, ACCENT_GREEN)
        self.screen.blit(pb_title, (SCREEN_WIDTH//2 - 280, y_offset))
        y_offset += 40
        
        records_text = self.small_font.render("Track your progress across sessions!", True, MODERN_GRAY)
        self.screen.blit(records_text, (SCREEN_WIDTH//2 - 280, y_offset))
        
        # Close button
        self.close_popout_button.draw(self.screen)
    
    def draw_settings_popup(self):
        """Draw settings popup"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Settings panel
        panel_rect = pygame.Rect(SCREEN_WIDTH//2 - 250, 150, 500, 600)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        settings_title = self.large_font.render("⚙️ Settings", True, ACCENT_YELLOW)
        settings_rect = settings_title.get_rect(center=(SCREEN_WIDTH//2, 200))
        self.screen.blit(settings_title, settings_rect)
        
        # Audio Settings
        audio_title = self.medium_font.render("🔊 Audio", True, MODERN_WHITE)
        self.screen.blit(audio_title, (SCREEN_WIDTH//2 - 200, 280))
        
        # Volume sliders
        self.music_slider.rect.x = SCREEN_WIDTH//2 - 150
        self.music_slider.rect.y = 320
        self.sound_slider.rect.x = SCREEN_WIDTH//2 - 150
        self.sound_slider.rect.y = 380
        
        self.music_slider.draw(self.screen, self.font)
        self.sound_slider.draw(self.screen, self.font)
        
        # Game Settings
        game_title = self.medium_font.render("🎮 Game", True, MODERN_WHITE)
        self.screen.blit(game_title, (SCREEN_WIDTH//2 - 200, 460))
        
        # Future game settings can go here
        future_text = self.small_font.render("More settings coming soon...", True, MODERN_GRAY)
        self.screen.blit(future_text, (SCREEN_WIDTH//2 - 200, 500))
        
        # Close button
        self.close_popout_button.draw(self.screen)
    
    def draw_about_popup(self):
        """Draw about popup with game features and info"""
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # About panel
        panel_rect = pygame.Rect(SCREEN_WIDTH//2 - 300, 100, 600, 700)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title
        about_title = self.large_font.render("ℹ️ About P-Type", True, ACCENT_YELLOW)
        about_rect = about_title.get_rect(center=(SCREEN_WIDTH//2, 150))
        self.screen.blit(about_title, about_rect)
        
        # Description
        desc_lines = [
            "P-Type is an advanced typing game designed for",
            "programmers and typing enthusiasts. Improve your",
            "coding skills while having fun!"
        ]
        
        y_offset = 200
        for line in desc_lines:
            desc_text = self.font.render(line, True, MODERN_LIGHT)
            desc_rect = desc_text.get_rect(center=(SCREEN_WIDTH//2, y_offset))
            self.screen.blit(desc_text, desc_rect)
            y_offset += 30
        
        # Features
        features_title = self.medium_font.render("✨ Features", True, ACCENT_CYAN)
        self.screen.blit(features_title, (SCREEN_WIDTH//2 - 280, y_offset + 20))
        y_offset += 60
        
        features = [
            "⚡ Real-time typing challenges",
            "🚀 Modern 3D ship graphics",
            "💻 7 Programming languages",
            "🎯 20 Progressive difficulty levels",
            "🏆 High score tracking",
            "🎮 Ship collision mechanics",
            "⚙️ Customizable settings",
            "📊 Detailed statistics"
        ]
        
        for feature in features:
            feature_text = self.font.render(feature, True, MODERN_WHITE)
            self.screen.blit(feature_text, (SCREEN_WIDTH//2 - 260, y_offset))
            y_offset += 35
        
        # Version and credits
        version_info = self.font.render("Version 2.2 - Responsive UI Edition", True, ACCENT_GREEN)
        version_rect = version_info.get_rect(center=(SCREEN_WIDTH//2, y_offset + 40))
        self.screen.blit(version_info, version_rect)
        
        # Close button
        self.close_popout_button.draw(self.screen)
    
    def draw_menu(self):
        """Draw modern main menu"""
        # Draw stars
        for star in self.stars:
            star.draw(self.screen)
        
        # Modern title with glow effect
        title_text = "P-TYPE"
        
        # Title glow effect - responsive positioning
        for offset in range(8, 0, -1):
            glow_color = tuple(min(255, NEON_BLUE[i] // (offset + 1)) for i in range(3))
            glow_surface = self.title_font.render(title_text, True, glow_color)
            glow_rect = glow_surface.get_rect(center=(self.ui_center_x + offset//2, self.ui_title_y + offset//2))
            self.screen.blit(glow_surface, glow_rect)
        
        # Main title - responsive positioning
        title_surface = self.title_font.render(title_text, True, MODERN_WHITE)
        title_rect = title_surface.get_rect(center=(self.ui_center_x, self.ui_title_y))
        self.screen.blit(title_surface, title_rect)
        
        # Subtitle - responsive positioning
        subtitle = "Programming Typing Challenge"
        subtitle_surface = self.medium_font.render(subtitle, True, ACCENT_CYAN)
        subtitle_rect = subtitle_surface.get_rect(center=(self.ui_center_x, self.ui_subtitle_y))
        self.screen.blit(subtitle_surface, subtitle_rect)
        
        # Removed tagline and mode selection text to avoid overlap with UI buttons
        
        # Buttons
        self.start_normal_button.draw(self.screen)
        self.start_programming_button.draw(self.screen)
        
        # Language selection label (using calculated responsive position)
        lang_label = self.font.render("Programming Language:", True, MODERN_WHITE)
        lang_rect = lang_label.get_rect(center=(self.ui_center_x, self.dropdown_label_y))
        self.screen.blit(lang_label, lang_rect)
        
        # Menu buttons (draw before dropdown so dropdown appears on top)
        self.stats_button.draw(self.screen)
        self.settings_button.draw(self.screen)
        self.about_button.draw(self.screen)
        
        # Exit game button
        self.exit_game_button.draw(self.screen)
        
        # Version info (responsive positioning)
        version_text = self.small_font.render("v2.2 - Responsive UI Edition", True, MODERN_GRAY)
        version_rect = version_text.get_rect(bottomright=(self.ui_window_width - 20, self.ui_version_y))
        self.screen.blit(version_text, version_rect)
        
        # Draw dropdown last so it appears over everything else
        self.language_dropdown.draw(self.screen)
    
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
        
        health_color = NEON_GREEN if self.health > 60 else (ACCENT_ORANGE if self.health > 30 else ACCENT_RED)
        health_fill = pygame.Rect(current_width - 220, 20, int(180 * self.health / 100), 25)
        pygame.draw.rect(self.screen, health_color, health_fill, border_radius=12)
        
        health_text = self.small_font.render(f"Health: {self.health}%", True, MODERN_WHITE)
        health_text_rect = health_text.get_rect(center=(current_width - 130, 32))
        self.screen.blit(health_text, health_text_rect)
        
        # Missed ships - responsive positioning
        missed_color = ACCENT_RED if self.missed_ships >= MAX_MISSED_SHIPS - 1 else MODERN_WHITE
        missed_text = self.font.render(f"Missed: {self.missed_ships}/{MAX_MISSED_SHIPS}", True, missed_color)
        self.screen.blit(missed_text, (current_width - 220, 55))
        
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
        
        # Game mode indicator - responsive positioning
        mode_text = f"{self.game_mode.value.title()} Mode"
        if self.game_mode == GameMode.PROGRAMMING:
            mode_text += f" - {self.programming_language.value}"
        
        mode_surface = self.small_font.render(mode_text, True, ACCENT_CYAN)
        mode_rect = mode_surface.get_rect(topright=(current_width - 20, 110))
        self.screen.blit(mode_surface, mode_rect)
        
        # WPM indicator - responsive positioning
        current_wpm = BASE_WPM + ((MAX_WPM - BASE_WPM) * (self.level - 1) / (MAX_LEVELS - 1))
        wpm_text = self.small_font.render(f"Target: {int(current_wpm)} WPM", True, MODERN_GRAY)
        wpm_rect = wpm_text.get_rect(topright=(current_width - 20, 130))
        self.screen.blit(wpm_text, wpm_rect)
        
        # Controls - responsive positioning
        controls_text = self.small_font.render("ESC: Pause | ←→: Switch Ships", True, MODERN_GRAY)
        controls_rect = controls_text.get_rect(bottomright=(current_width - 20, self.current_height - 20))
        self.screen.blit(controls_text, controls_rect)
    
    def draw_pause_menu(self):
        """Draw modern pause menu"""
        # Get current window dimensions for responsive UI
        current_width = pygame.display.get_surface().get_width()
        
        # Semi-transparent overlay - responsive to current dimensions
        overlay = pygame.Surface((current_width, self.current_height))
        overlay.set_alpha(200)
        overlay.fill(DARKER_BG)
        self.screen.blit(overlay, (0, 0))
        
        # Pause panel - centered with current dimensions
        panel_rect = pygame.Rect(current_width//2 - 200, self.current_height//2 - 200, 400, 400)
        pygame.draw.rect(self.screen, DARK_BG, panel_rect, border_radius=15)
        pygame.draw.rect(self.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)
        
        # Title - centered with current width
        pause_text = self.large_font.render("PAUSED", True, ACCENT_YELLOW)
        pause_rect = pause_text.get_rect(center=(current_width//2, self.current_height//2 - 150))
        self.screen.blit(pause_text, pause_rect)
        
        # Settings - centered with current width
        settings_text = self.medium_font.render("Settings", True, MODERN_WHITE)
        settings_rect = settings_text.get_rect(center=(current_width//2, self.current_height//2 - 100))
        self.screen.blit(settings_text, settings_rect)
        
        # Sliders
        self.music_slider.draw(self.screen, self.font)
        self.sound_slider.draw(self.screen, self.font)
        
        # Buttons
        self.resume_button.draw(self.screen)
        self.quit_to_menu_button.draw(self.screen)
        self.quit_game_button.draw(self.screen)
    
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
        elif self.missed_ships >= MAX_MISSED_SHIPS:
            title_text = self.large_font.render("OVERWHELMED!", True, ACCENT_RED)
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
        
        # High score notification - responsive positioning
        lang = self.programming_language.value if self.game_mode == GameMode.PROGRAMMING else None
        mode_key = self.game_mode.value
        lang_key = lang if lang else "default"
        
        if (mode_key in self.settings.high_scores and 
            lang_key in self.settings.high_scores[mode_key] and
            self.settings.high_scores[mode_key][lang_key]["score"] == self.score):
            
            new_record_text = self.medium_font.render("🏆 NEW HIGH SCORE! 🏆", True, ACCENT_YELLOW)
            record_rect = new_record_text.get_rect(center=(current_width//2, self.current_height//2 + 50))
            self.screen.blit(new_record_text, record_rect)
        
        # Buttons
        self.restart_button.draw(self.screen)
        self.menu_button.draw(self.screen)
    
    def draw(self):
        """Main draw method"""
        self.draw_modern_background()
        
        if self.game_mode == GameMode.MENU:
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
                if hasattr(self, 'language_dropdown') and self.language_dropdown.is_open:
                    wheel_handled = self.language_dropdown.handle_event(event)
            
            # Ignore mouse wheel events that weren't handled by dropdowns
            if event.type == pygame.MOUSEWHEEL and not wheel_handled:
                continue
            # Also ignore any other scroll-related mouse button events (buttons 4 and 5)
            if (event.type == pygame.MOUSEBUTTONDOWN or event.type == pygame.MOUSEBUTTONUP) and event.button in (4, 5):
                continue
                
            if event.type == pygame.QUIT:
                self.settings.save_settings()
                self.running = False
            
            elif event.type == pygame.VIDEORESIZE:
                # Handle window resize - maintain portrait proportions
                self.handle_window_resize(event.w, event.h)
            
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
    
    def handle_menu_events(self, event):
        """Handle menu events"""
        # Handle keyboard shortcuts
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_F11 or (event.key == pygame.K_RETURN and event.mod & pygame.KMOD_ALT):
                self.toggle_maximize()
                return
        
        if self.start_normal_button.handle_event(event):
            self.game_mode = GameMode.NORMAL
            self.reset_game_state()
        
        elif self.start_programming_button.handle_event(event):
            self.game_mode = GameMode.PROGRAMMING
            self.reset_game_state()
        
        elif self.stats_button.handle_event(event):
            self.game_mode = GameMode.STATS
        
        elif self.settings_button.handle_event(event):
            self.game_mode = GameMode.SETTINGS
        
        elif self.about_button.handle_event(event):
            self.game_mode = GameMode.ABOUT
        
        elif self.exit_game_button.handle_event(event):
            self.settings.save_settings()
            self.running = False
        
        elif self.language_dropdown.handle_event(event):
            selected_lang = self.language_dropdown.get_selected()
            for lang in ProgrammingLanguage:
                if lang.value == selected_lang:
                    self.programming_language = lang
                    break
    
    def handle_popout_events(self, event):
        """Handle events for popout screens (stats, settings, about)"""
        if self.close_popout_button.handle_event(event):
            self.game_mode = GameMode.MENU
        
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            self.game_mode = GameMode.MENU
        
        # Handle settings-specific events
        elif self.game_mode == GameMode.SETTINGS:
            if self.music_slider.handle_event(event):
                self.settings.music_volume = self.music_slider.val
                self.settings.save_settings()
            
            elif self.sound_slider.handle_event(event):
                self.settings.sound_volume = self.sound_slider.val
                self.settings.save_settings()
    
    def handle_game_events(self, event):
        """Handle in-game events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.game_mode = GameMode.PAUSE
            elif event.key == pygame.K_F11 or (event.key == pygame.K_RETURN and event.mod & pygame.KMOD_ALT):
                self.toggle_maximize()
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
        
        elif self.quit_to_menu_button.handle_event(event):
            self.game_mode = GameMode.MENU
            self.reset_game_state()
        
        elif self.quit_game_button.handle_event(event):
            self.settings.save_settings()
            self.running = False
        
        elif self.music_slider.handle_event(event):
            self.settings.music_volume = self.music_slider.val
            self.settings.save_settings()
        
        elif self.sound_slider.handle_event(event):
            self.settings.sound_volume = self.sound_slider.val
            self.settings.save_settings()
    
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
        print("P-Type - Programming Typing Challenge")
        print("Modern Edition with Enhanced Graphics & Boss Battles")
        print("\nFeatures:")
        print("• Modern UI with 3D ship graphics and smooth animations")
        print("• Normal mode with standard English dictionary words")
        print("• Programming training with 7 languages")
        print("• Boss battles with challenging words at level completion")
        print("• 20 progressive difficulty levels (20-300 WPM)")
        print("• Advanced collision mechanics and visual effects")
        print("• High score tracking and detailed statistics")
        print("• Smart UI with scrollable dropdowns")
        print("• Full keyboard support including special characters")
        print("\nStarting game...")
        
        while self.running:
            # Store game mode for resume functionality
            if self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                self._last_game_mode = self.game_mode
            
            self.handle_events()
            
            # Update UI elements
            for button in [self.start_normal_button, self.start_programming_button, 
                          self.stats_button, self.settings_button, self.about_button, self.exit_game_button,
                          self.close_popout_button, self.resume_button, self.quit_to_menu_button, self.quit_game_button,
                          self.restart_button, self.menu_button]:
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