# PRD: Web Build and Bootstrap

Objective
- Enable a web-only build and local preview of the Dyad UI without Electron.

Out of Scope
- Server-side APIs, filesystem, or process execution details.

Build config
- Separate Vite config for web build (no Electron preload/main bundles).
- Environment detection utility selects WebIpcClient or Mock client.
- PostHog and similar analytics initialized conditionally.

Commands
- dev:web — run Vite dev server using vite.web.config.mts
- build:web — produce static assets to dist/ consumed by backend
- preview:web — optional static preview of built UI

Electron global stubbing
- Ensure window.electron is undefined in web; provide a thin adapter to selfHostedIpc when present.
- Avoid bundling Electron-only imports into the web build; tree-shake or dynamic import behind environment checks.

Index/Assets
- index.html must reference assets via relative paths compatible with Express static serving.
- Inject proxy client script server-side if running behind web wrapper.

Verification
- Load UI; verify no Electron references; navigation and core screens render.
