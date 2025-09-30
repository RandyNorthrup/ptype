#!/usr/bin/env python3
"""
Generate actual typing phrases for P-Type, not just keywords.

Creates realistic code snippets with proper syntax that would actually
be typed by programmers in real development scenarios.
"""

import yaml
from pathlib import Path
import random

# Real code phrase templates by language and difficulty
phrase_templates = {
    'python': {
        'beginner': [
            "print('{message}')",
            "for i in range({num}):",
            "if {variable} > {value}:",
            "def {function_name}():",
            "return {variable}",
            "{list_name}.append({item})",
            "import {module}",
            "from {module} import {item}",
            "{var_name} = {value}",
            "while {condition}:",
            "try:\n    {statement}\nexcept:",
            "class {ClassName}:",
            "{var} = [{items}]",
            "{var} = {{{key}: {value}}}",
            "len({sequence})",
            "str({value})",
            "int({string})"
        ],
        'intermediate': [
            "async def {name}({params}):",
            "from typing import {types}",
            "{var}: {Type} = {value}",
            "@dataclass\nclass {ClassName}:",
            "with open('{file}.txt') as f:",
            "{list}.sort(reverse=True)",
            "[x*{factor} for x in {list}]",
            "{dict}.keys() | {dict}.values()",
            "functools.reduce(operator.add, {seq})",
            "itertools.chain(*{matrices})",
            "collections.Counter({iterable})",
            "pathlib.Path('{path}')",
            "datetime.datetime.now()",
            "requests.get('{url}').json()",
            "json.dumps({data}, indent=2)",
            "re.findall(r'{pattern}', {text})",
            "logging.info('{message}')",
            "unittest.TestCase.assertEqual()"
        ],
        'advanced': [
            "async with {client}('{url}') as resp:",
            "@contextmanager\ndef {name}():",
            "class {Name}(Generic[{T}]):",
            "{df}.query('{condition}')",
            "pd.concat([{frames}], axis=0)",
            "np.array({data}, dtype=float)",
            "torch.nn.Linear({in_dim}, {out_dim})",
            "@app.get('/{endpoint}')\ndef {handler}():",
            "SELECT * FROM {table} WHERE id = ?",
            "django.db.models.Model",
            "@pytest.mark.parametrize('{vars}', cases)",
            "docker build -t {image}:{tag} .",
            "git commit -m '{message}'",
            "kubernetes pod describe {name}",
            "terraform plan -out={file}",
            "kubectl apply -f {manifest}.yaml",
            "aws s3 cp {local} s3://{bucket}/",
            "docker-compose up -d {service}"
        ]
    },

    'javascript': {
        'beginner': [
            "console.log('{message}');",
            "for (let i = 0; i < {num}; i++) {{",
            "if ({variable} > {value}) {{",
            "function {functionName}() {{",
            "return {variable};",
            "const {varName} = '{value}';",
            "let {varName} = {value};",
            "const {arrayName} = [{items}];",
            "{array}.push({item});",
            "{object}['{key}'] = {value};",
            "document.getElementById('{id}')",
            "addEventListener('{event}', () => {{}};",
            "setTimeout(() => {}, {ms});",
            "'{string}'.split('{delimiter}')",
            "JSON.parse({jsonString})",
            "Math.floor(Math.random() * {max})"
        ],
        'intermediate': [
            "async function {name}({params}) {{",
            "fetch('{url}').then(res => res.json())",
            "const {{ {destructured} }} = {object};",
            "const mapped = array.map(({params}) => {{{",
            "[].reduce((acc, val) => acc + val, 0)",
            "new Promise((resolve, reject) => {{{{",
            "document.querySelectorAll('{selector}')",
            "localStorage.setItem('{key}', data)",
            "window.addEventListener('{event}', fn)",
            "setInterval(() => updateUI(), {ms})",
            "'{str}'.replace(/{pattern}/g, '{repl}');",
            "Object.assign({{}}, base, updates)",
            "Array.from({nodeList}, el => el.text)",
            "new Map([[{key}, {value}]])",
            "Set.from([{values}])"
        ],
        'advanced': [
            "export class {ClassName} extends React.Component {{",
            "const [{state}, set{State}] = useState({initial});",
            "@Param({name}: '{binding}', {validation})",
            "graphql`\n  query {Op}({params}: {Type}!) {{",
            "app.post('/{route}', ({params}) => {{{{",
            "describe('{suite}', () => {{{{",
            "it('should {behavior}', async () => {{",
            "@Entity({name}: '{entityName}'})",
            "TypeORM Repository<{Entity}>({Entity})",
            "SwaggerModule.setup('{path}', app, document);",
            "angular.copy(original, {copy});",
            "rxjs.of([{values}]).pipe(map(() => {{}}) )",
            "three.js: new THREE.{Object3D}({params})",
            "socket.io: io('{namespace}', {{autoConnect: false}}) )"
        ]
    },

    'java': {
        'beginner': [
            "System.out.println(\"{message}\");",
            "for (int i = 0; i < {num}; i++) {{",
            "if ({variable} > {value}) {{",
            "public void {methodName}() {{",
            "return {variable};",
            "String {varName} = \"{value}\";",
            "int[] {arrayName} = {{{items}}};",
            "{list}.add({item});",
            "{map}.put(\"{key}\", {value});",
            "try {{\n    {statement}\n}} catch ({exception} e) {{",
            "public class {ClassName} {{",
            "new ArrayList<{Type}>()",
            "{list}.stream().{operation}()",
            "Collections.sort({list});",
            "Objects.equals(a, b)"
        ],
        'intermediate': [
            "public static <{T}> {returnType} {method}<{T}>({params}) {{",
            "@Override\npublic String toString() {{",
            "{list}.stream().filter({predicate}).collect(Collectors.toList())",
            "Optional<{Type}> result = {sequence}.stream().findFirst();",
            "CompletableFuture.supplyAsync(() -> {computation})",
            "new Thread(() -> {runnable}).start();",
            "synchronized ({object}) {{\n    {code}\n}}",
            "try (AutoCloseable resource = {resource}) {{\n    {usage}\n}}",
            "@SpringBootApplication\npublic class Application {{",
            "@Autowired private {ServiceType} {serviceVar};",
            "List<{GenericType}> items = repository.findAll();",
            "ResponseEntity.ok().body({data});"
        ],
        'advanced': [
            "@RestController @RequestMapping(\"/api/v1\")\npublic class {Controller} {{",
            "public <{T} extends Comparable<? super {T}>> \n    {returnType} max({params}) {{",
            "CompletableFuture.runAsync(() -> operation())\n    .thenApply(result -> transform(result))",
            "@Entity @Table(name = \"{table_name}\")\npublic class {Entity} {{",
            "@JsonSerialize(using = {CustomSerializer}.class)\nprivate {FieldType} {fieldName};",
            "SpringApplication.run({ApplicationClass}.class, args);",
            "KafkaProducer<String, {ValueType}> producer = new KafkaProducer<>(config);",
            "private final ExecutorService executor = \n    Executors.newFixedThreadPool({cores});",
            "@Test @Transactional\npublic void test{Name}() {{\n    // Given\n    // When\n    // Then\n}}",
            "Map.Entry<String, Integer> entry = \n    map.entrySet().iterator().next();"
        ]
    },

    'csharp': {
        'beginner': [
            "Console.WriteLine(\"{message}\");",
            "for (int i = 0; i < {num}; i++) {{",
            "if ({variable} > {value}) {{",
            "public void {MethodName}() {{",
            "return {variable};",
            "string {varName} = \"{value}\";",
            "List<int> {listName} = new() {{",
            "{list}.Add({item});",
            "{dict}[\"{key}\"] = {value};",
            "try {{\n    {statement}\n}} catch ({exception} ex) {{",
            "public class {ClassName} {{"
        ],
        'intermediate': [
            "public async Task<{returnType}> {MethodName}Async({parameters}) {{",
            "IEnumerable<{T}> result = collection.Where({lambda}).Select({projection});",
            "var grouped = data.GroupBy(x => x.{property}).ToDictionary(g => g.Key, g => g.ToList());",
            "using var client = new HttpClient();",
            "var config = new ConfigurationBuilder().AddJsonFile(\"appsettings.json\").Build();",
            "services.AddScoped<I{InterfaceName}, {ImplementationName}>();",
            "[HttpGet(\"{route}\")] public IActionResult {ControllerMethod}() {{",
            "Task.Run(() => Parallel.ForEachAsync({source}, async (item, token) => {{}}));",
            "var sql = $\"SELECT * FROM {{table}} WHERE Id = {{{param}}}\";",
            "await using var transaction = await context.Database.BeginTransactionAsync();"
        ],
        'advanced': [
            "[ApiController] [Route(\"api/[controller]\")] public class {ControllerName}Controller : ControllerBase {{",
            "public record {RecordName}({properties}) {{\n    public {RecordName} CreateFrom({source}) => new(...); \n}}",
            "await foreach (var item in channel.ReadAllAsync().WithCancellation(cancellationToken)) {{",
            "ILogger<{T}> logger = loggerFactory.CreateLogger<{T}>();",
            "var pipeline = new PipelineBuilder().UseMiddleware<{middlewareType}>().Build();",
            "ImmutableDictionary<string, {T}> dict = ImmutableDictionary<string, {T}>.Empty;",
            "Span<byte> buffer = stackalloc byte[{size}]; var span = new ReadOnlySpan<byte>(data, {start}, {length});",
            "var matcher = Regex.Match({input}, @\"{pattern}\", RegexOptions.{options});",
            "[Theory] [InlineData(1, 2, 3)] public void Test_{Scenario}({parameters}) {{ }}",
            "using var lifetime = ApplicationLifetime.Start(applicationBuilder => applicationBuilder.UseStartup<{Startup}>());"
        ]
    },

    'cplusplus': {
        'beginner': [
            "std::cout << \"{message}\" << std::endl;",
            "for (int i = 0; i < {num}; ++i) {{",
            "if ({variable} > {value}) {{",
            "void {functionName}() {{",
            "return {variable};",
            "std::vector<{type}> {vectorName};",
            "{vector}.push_back({item});",
            "std::map<{keyType}, {valueType}> {mapName};",
            "{map}[\"{key}\"] = {value};",
            "try {{ {statement} }} catch ({exception}& ex) {{"
        ],
        'intermediate': [
            "template<typename {T}> {returnType} {function}<typename {T}>({parameters}) {{",
            "std::unique_ptr<{T}> ptr = std::make_unique<{T}>();",
            "std::shared_ptr<{T}> shared = std::make_shared<{T}>({args});",
            "auto lambda = [{capture}]({params}) -> {returnType} {{{body}}};",
            "std::array<{T}, {SIZE}> arr{{{initializer}}};",
            "std::optional<{T}> value = std::make_optional<{T}>({val});",
            "for (auto& {element} : {container}) {{ {code} }}",
            "constexpr {T} fibonacci({T} n) {{ return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }}",
            "static_assert({condition}, \"{message}\");",
            "std::thread worker([{capture}]() {{{task}}}); worker.join();"
        ],
        'advanced': [
            "template <typename {T}, typename = typename std::enable_if_t<{condition}>> class {MetaClass} {{{definitions}}};",
            "concept {ConceptName} = requires({T} t) {{{requirements}}};",
            "auto coroutine = []({params}) -> cppcoro::task<{returnType}> {{{body}}};",
            "boost::any variant; variant = {value}; variant = std::string(\"{text}\");",
            "Eigen::MatrixXd matrix = Eigen::MatrixXd::Random({rows}, {cols});",
            "std::pmr::monotonic_buffer_resource resource({buffer}, {size});",
            "folly::Future<{T}> future = folly::makeFuture({value}).thenValue([](auto&& val) {{{body}}});",
            "constexpr std::array<{T}, 3> vec{{ {x}, {y}, {z} }}; auto dot_product = std::inner_product(vec.begin(), vec.end(), vec.begin(), {init});",
            "QT_BEGIN_NAMESPACE\nclass {PluginClass} : public QObject, public {PluginInterface} {{{methods}}};\nQT_END_NAMESPACE",
            "asio::awaitable<void> async_handler(asio::io_context& context) {{{body}}}"
        ]
    },

    'css': {
        'beginner': [
            "color: {color};",
            "font-size: {size}px;",
            "margin: {spacing}px;",
            "padding: {spacing}px {spacing}px;",
            "border: {width}px solid {color};",
            "text-align: {alignment};",
            "display: {display};",
            "width: {size}%; height: {size}px;",
            "background-color: {color};",
            "font-family: {font};"
        ],
        'intermediate': [
            "flex-direction: {direction}; justify-content: {justify}; align-items: {align};",
            "@media (min-width: {breakpoint}px) {{ {selectors} }}",
            "animation: {name} {duration}s {timing} {iteration};",
            "position: {position}; top: {offset}px; left: {offset}px;",
            "box-shadow: {offset}px {offset}px {blur}px {color};",
            "linear-gradient({angle}deg, {color1}, {color2});",
            "grid-template-columns: repeat({count}, 1fr); gap: {gap}px;",
            "transform: translateX({x}px) rotate({degrees}deg);",
            "transition: {property} {duration}s {timing};",
            ":hover {{ background-color: {color}; }}"
        ],
        'advanced': [
            "@keyframes {animationName} {{ 0% {{ {property}: {value1}; }} 100% {{ {property}: {value2}; }} }}",
            "@supports (backdrop-filter: blur({blur}px)) {{ .glass {{ backdrop-filter: blur({blur}px); }} }}",
            ":is(button, input[type=\"submit\"]) {{ cursor: pointer; user-select: none; }}",
            "@container (min-width: {min}px) {{ .child {{ font-size: {scale}; }} }}",
            "clamp({min}, {fluid}, {max})",
            "color-mix(in srgb, {color1} {percent}%, {color2});",
            "animation-timeline: scroll(root); animation-range: {start} {end};",
            "view-transition-name: {name}; ::view-transition-old({name}) {{ opacity: 1; }}",
            "@layer base, components, utilities; @layer components {{ {rules} }}",
            "conic-gradient(from {angle}deg, {color1}, {color2}, {color3})"
        ]
    },

    'html': {
        'beginner': [
            "<div class=\"{className}\">{content}</div>",
            "<span style=\"color: {color};\">{text}</span>",
            "<img src=\"{path}\" alt=\"{description}\" width=\"{size}\">",
            "<a href=\"{url}\" target=\"{target}\">{linkText}</a>",
            "<button type=\"{type}\" onclick=\"{action}\">{label}</button>",
            "<input type=\"{type}\" placeholder=\"{placeholder}\" required>",
            "<h{level}>{heading}</h{level}>",
            "<p class=\"{class}\">{paragraph}</p>",
            "<ul><li>{item1}</li><li>{item2}</li></ul>",
            "<table><tr><td>{cell}</td></tr></table>"
        ],
        'intermediate': [
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
            "<link rel=\"stylesheet\" href=\"{cssFile}.css\" crossorigin=\"anonymous\">",
            "<script defer src=\"{jsFile}.js\" integrity=\"{hash}\"></script>",
            "<header role=\"banner\"><nav><ul><li>Home</li></ul></nav></header>",
            "<main><section><article><h2>Title</h2><p>Content</p></article></section></main>",
            "<aside aria-live=\"polite\" aria-label=\"Notifications\">{content}</aside>",
            "<form action=\"{endpoint}\" method=\"POST\" enctype=\"multipart/form-data\">",
            "<fieldset><legend>{groupName}</legend>{formControls}</fieldset>",
            "<video controls autoplay muted><source src=\"{video}.mp4\" type=\"video/mp4\"></video>",
            "<dialog open><p>{message}</p><button autofocus>OK</button></dialog>"
        ],
        'advanced': [
            "<template id=\"cardTemplate\"><article class=\"card\"><header><h3>{title}</h3></header><p>{content}</p></article></template>",
            "<custom-element data-prop=\"{value}\"><slot name=\"content\">Default</slot></custom-element>",
            "<web-component shadowroot=\"open\"><style>{css}</style><div>{markup}</div></web-component>",
            "<iframe src=\"{url}\" sandbox=\"allow-scripts allow-same-origin\" loading=\"lazy\" referrerpolicy=\"no-referrer\"></iframe>",
            "<picture><source srcset=\"{image}@2x.webp\" media=\"(min-width: 800px)\"><img src=\"{image}.jpg\" loading=\"lazy\"></picture>",
            "<svg viewBox=\"0 0 {width} {height}\" role=\"img\" aria-labelledby=\"{id}\"><title id=\"{id}\">{title}</title>{shapes}</svg>",
            "<portal src=\"{destination}\"></portal>",
            "<fencedframe src=\"{url}\" allow=\"geolocation *; microphone *; camera *\"></fencedframe>",
            "<math><msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><msup><mi>y</mi><mn>2</mn></msup><mo>=</mo><msup><mi>z</mi><mn>2</mn></msup></math>",
            "<data value=\"{num}\">{formatted}</data>"
        ]
    },

    'normal': {
        'beginner': [
            "a", "an", "and", "are", "by", "for", "from", "has", "have", "he", "her", "his", "in", "is",
            "it", "of", "on", "or", "that", "the", "this", "to", "was", "will", "with", "yes", "you"
        ],
        'intermediate': [
            "about", "after", "again", "before", "being", "below", "could", "doing", "every", "first",
            "found", "going", "great", "group", "house", "large", "later", "might", "money", "never",
            "often", "other", "place", "right", "small", "sound", "still", "their", "there", "these",
            "thing", "three", "under", "water", "where", "which", "world", "would", "write", "years"
        ],
        'advanced': [
            "activity", "addition", "analysis", "approach", "argument", "behavior", "capacity", "category",
            "century", "chapter", "company", "concept", "context", "control", "country", "decision",
            "develop", "disease", "economy", "effort", "energy", "example", "exercise", "expense",
            "factory", "failure", "feature", "freedom", "function", "future", "general", "history",
            "however", "imagine", "include", "initial", "instead", "justice", "knowledge", "language",
            "manager", "measure", "medical", "meeting", "mention", "message", "million", "minimum",
            "monitor", "morning", "natural", "network", "nothing", "nuclear", "patient", "pattern",
            "picture", "plastic", "potential", "present", "pressure", "primary", "probably", "process",
            "program", "project", "quarter", "receive", "remember", "replace", "research", "respond",
            "science", "section", "serious", "service", "several", "station", "student", "success",
            "suggest", "support", "surface", "teacher", "through", "thought", "towards", "traffic",
            "trouble", "variety", "version", "village", "warning", "weather", "website", "wedding",
            "welcome", "whether", "without", "witness", "working", "writing"
        ]
    }
}

def expand_phrase_template(template: str, **kwargs) -> str:
    """Expand a phrase template with random values."""
    result = template

    # Common fillers
    fillers = {
        'message': ['Hello World', 'Success', 'Error occurred', 'Processing', 'Complete'],
        'variable': ['count', 'index', 'data', 'value', 'result', 'temp'],
        'value': ['42', '0', '1', '100', 'null'],
        'num': ['5', '10', '100', '50'],
        'function_name': ['calculate', 'process', 'validate', 'update', 'init'],
        'ClassName': ['Controller', 'Manager', 'Service', 'Handler', 'Factory'],
        'var_name': ['result', 'data', 'count', 'index', 'temp'],
        'list_name': ['items', 'data', 'results', 'list'],
        'item': ['item', 'value', 'element'],
        'module': ['os', 'sys', 'math', 'time', 'json'],
        'condition': ['True', 'False', 'count > 0', 'result is None'],
        'file': ['data', 'config', 'output', 'input'],
        'types': ['List', 'Dict', 'Optional', 'Union[Int, str]'],
        'Type': ['str', 'int', 'float', 'bool', 'List[int]'],
        'name': ['fetch', 'process', 'load', 'save', 'validate'],
        'params': ['param: str', 'data: dict', 'count: int'],
        'T': ['T', 'U', 'V'],
        'client': ['session', 'client', 'connection'],
        'url': ['https://api.example.com/data', '/api/v1/items', 'ws://localhost:8080'],
        'df': ['df', 'data', 'dataset'],
        'table': ['users', 'products', 'items'],
        'endpoint': ['users', 'posts', 'data'],
        'handler': ['get_users', 'handle_post', 'fetch_data'],
        'functionName': ['handleClick', 'processData', 'validateForm'],
        'varName': ['data', 'config', 'state'],
        'arrayName': ['items', 'values', 'list'],
