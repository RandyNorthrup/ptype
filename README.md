# P-Type

[![Quality](https://github.com/RandyNorthrup/ptype/actions/workflows/quality.yml/badge.svg)](https://github.com/RandyNorthrup/ptype/actions/workflows/quality.yml)

P-Type is a browser-based 3D typing game. Type the words attached to incoming
ships, survive boss waves, answer trivia, and earn power-ups and achievements.
The application is a React and Three.js progressive web app with all game data
and assets stored in this repository.

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

| Key          | Action                                                  |
| ------------ | ------------------------------------------------------- |
| Letter keys  | Type the targeted enemy word                            |
| `Tab`        | Cycle through available targets                         |
| `Enter`      | Fire the EMP when its cooldown is ready                 |
| `Arrow Up`   | Select the next collected bonus item                    |
| `Arrow Down` | Use the selected bonus item                             |
| `Escape`     | Pause or resume; close or back out of the active dialog |

The interface supports keyboard navigation, visible focus, reduced-motion
preferences, responsive dialogs and HUD layouts, and labelled dialog, status,
timer, health, and shield semantics. Gameplay still requires a keyboard and a
WebGL-capable browser. Leaving an active game uses an in-app confirmation dialog
that supports keyboard focus and cancellation.

## Local development

Requirements:

- Node.js 24.4 or newer
- npm 11.4.2 or newer
- Python 3.12+ and the pinned native quality tools for the full gates
- A current browser with WebGL enabled

Install the locked dependency graph and start Vite:

```bash
npm ci --ignore-scripts
npm run dev
```

Vite serves the application at `http://localhost:5173/ptype/`. Other useful commands:

```bash
npm run build          # type-check and create dist/
npm run preview        # serve the production build locally
npm test               # unit/component tests with coverage
npm run test:watch     # interactive Vitest watch mode
npm run quality        # code gates plus the required history secret scan
npm run quality:code   # source, dependency, workflow, drill, and browser gates
npm run test:red       # isolated defect injection and exact restoration
npm run test:browser   # muted desktop and narrow Chromium journeys
```

`npm run quality` checks formatting, TypeScript/React lint, CSS, HTML, strict
types, tests with measured coverage floors (94% statements, 82% branches, 97%
functions, 95% lines), unused code and dependencies, cycles, duplication, native
SAST, OSV across both lockfiles, workflow security, the production build, red
drills, and muted production-browser journeys. `quality:code` runs those gates;
`quality` also requires a clean reachable-history secret scan. The historical
Icons8 credential remains unresolved, so the latter is deliberately failing.
See [the audit](docs/QUALITY-RETROFIT.md) and [tool setup](docs/DEPLOYMENT.md).

The scene-frame suite advances production callbacks with the React Three test
renderer to verify pause, targeting, and particle motion. It mocks model/font
I/O and does not certify GPU rendering. WebGL components remain outside the
jsdom coverage denominator. Their
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
- GitHub Pages Actions hosting with project-scoped assets and PWA metadata

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
python -m pip install --require-hashes -r requirements-quality.txt
pre-commit install
pre-commit run --all-files
```

Every commit runs the complete `quality:code` aggregate and staged-secret hooks.
CI runs the same `quality` aggregate as local, including the required history
scan. `ci:parity` rejects missing or conditional CI gates and skipped commit
aggregates. Keep commits reviewable, open pull requests during delivery, and
leave unresolved gates visible in a draft PR. CI runs on every pull request and
push to the default branches.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the change workflow and
[SECURITY.md](SECURITY.md) for private vulnerability reporting.

## Documentation

- [Content inventory](docs/CONTENT.md)
- [Deployment and operations](docs/DEPLOYMENT.md)
- [Quality audit and verification scope](docs/QUALITY-RETROFIT.md)
- [Canonical delivery plan](PLAN.md)

## License

P-Type is released under the [MIT License](LICENSE).

Created by Randy Northrup.

If this project helps you, you can
[support it through PayPal](https://www.paypal.com/donate/?hosted_button_id=Q9VC7B42R7K82).
