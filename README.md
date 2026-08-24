# P-Type

[![Quality](https://github.com/RandyNorthrup/ptype/actions/workflows/quality.yml/badge.svg)](https://github.com/RandyNorthrup/ptype/actions/workflows/quality.yml)

P-Type is a browser-based 3D typing game. Type the words attached to incoming
ships, survive boss waves, answer trivia, and earn power-ups and achievements.
The application is a React and Three.js progressive web app with all game data
and assets stored in this repository.

**Play:** [ptype.vercel.app](https://ptype.vercel.app)

## Gameplay

- Normal mode uses tiered English word lists.
- Programming mode includes Python, JavaScript, Java, C#, C++, CSS, and HTML.
- Bosses appear every three levels. Every second boss opens a trivia round.
- Five starting difficulty settings progress through Easy, Normal, Hard,
  Expert, and Master tiers.
- Local persistence retains settings, aggregate statistics, high scores, and 19
  achievements.
- The installable PWA caches application resources. Large 3D models are cached
  on first use rather than included in the initial precache.

### Keyboard controls

| Key          | Action                                        |
| ------------ | --------------------------------------------- |
| Letter keys  | Type the targeted enemy word                  |
| `Tab`        | Cycle through available targets               |
| `Enter`      | Fire the EMP when its cooldown is ready       |
| `Arrow Up`   | Select the next collected bonus item          |
| `Arrow Down` | Use the selected bonus item                   |
| `Escape`     | Pause or resume; close the active menu dialog |

The interface supports keyboard navigation, visible focus, reduced-motion
preferences, responsive dialogs and HUD layouts, and labelled dialog, status,
timer, health, and shield semantics. Gameplay still requires a keyboard and a
WebGL-capable browser.

## Local development

Requirements:

- Node.js 24.4 or newer
- npm 11.4.2 or newer
- A current browser with WebGL enabled

Install the locked dependency graph and start Vite:

```bash
npm ci
npm run dev
```

Vite serves the application at `http://localhost:5173`. Other useful commands:

```bash
npm run build          # type-check and create dist/
npm run preview        # serve the production build locally
npm test               # unit/component tests with coverage
npm run test:watch     # interactive Vitest watch mode
npm run quality        # every local release gate
npm run build:analyze  # build and emit Rollup bundle analysis
```

`npm run quality` checks formatting, TypeScript/React lint, CSS, HTML, strict
types, tests and 80% global coverage thresholds, unused code, dependency cycles,
duplication, dependency vulnerabilities, and the production build.

WebGL render-loop components are not executed inside jsdom coverage. Their
integration is checked against the production application in a real browser;
the application orchestration, accessible UI, state, loaders, and domain logic
remain inside the coverage gate.

## Current stack

- React 19.2 and React DOM 19.2
- TypeScript 6.0 in strict mode
- Vite 8.2 and `vite-plugin-pwa` 1.3
- Three.js 0.185, React Three Fiber 9.7, and Drei 10.7
- Vitest 4.1, Testing Library, and axe-core
- ESLint 10, Stylelint 17, Prettier 3, Knip, dpdm, and jscpd
- Vercel static hosting with cache and browser-security headers

Runtime state uses React Context and hooks. Persistent data is validated before
it enters the application state; no backend or environment variables are
required.

## Repository layout

```text
public/
  assets/       Local fonts, icons, images, audio, and GLB models
  data/         Eight word dictionaries and the trivia database
src/
  components/   Accessible UI and WebGL scene components
  entities/     Player and enemy 3D entities
  store/        React Context game state and persistence
  utils/        Content loaders and game-domain managers
tests/unit/     Vitest unit and component coverage
docs/           Content and deployment documentation
```

## Quality workflow

Install the repository hooks after cloning:

```bash
python -m pip install pre-commit
pre-commit install
pre-commit run --all-files
```

The hooks enforce formatting, lint, strict types, dead-code detection, secret
scanning, and dependency auditing before affected commits. CI repeats the
portable release gates on every pull request and push to the default branches.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the change workflow and
[SECURITY.md](SECURITY.md) for private vulnerability reporting.

## Documentation

- [Content inventory](docs/CONTENT.md)
- [Deployment and operations](docs/DEPLOYMENT.md)

## License

P-Type is released under the [MIT License](LICENSE).

Created by Randy Northrup.

If this project helps you, you can
[support it through PayPal](https://www.paypal.com/donate/?hosted_button_id=Q9VC7B42R7K82).
