# Web Wrapper PRD: Self-Hosted Wrapper for Electron App

Purpose
- Deliver a self-hosted web wrapper that runs the Dyad UI without modifying the Electron main codebase, remaining interchangeable with the desktop app.

Goals
- Run Dyad UI as a web app served by a lightweight backend.
- Replace Electron-only services (IPC, filesystem, process spawn) with web-accessible equivalents behind a unified API.
- Retain SQLite + Drizzle for persistence.
- Support per-project isolated dev environments (Devbox) for command execution.
- Keep the frontend code reusable across Electron and Web without invasive changes.

Non-Goals
- Multi-tenant SaaS.
- Strong sandboxing/containers beyond Devbox (can be future work).
- Rewriting core product flows.

Success Criteria
- The same UI can run in Electron or Web by switching adapters.
- CRUD on apps/files/settings works via web backend.
- Start/stop a project dev server and stream logs in-browser.
- SQLite data persists across restarts.

Master Checklist (deliverables link to detailed PRDs)
- [ ] Architecture alignment and constraints finalized
- [ ] Web build and bootstrap prepared (see web-wrapper.web-build-and-bootstrap.md)
- [ ] Mocking and gradual migration strategy in place (see web-wrapper.mocking-and-migration.md)
- [ ] Backend API surface defined and implemented (see web-wrapper.backend-api.md)
- [ ] Interchangeable filesystem abstraction wired (see web-wrapper.filesystem-abstraction.md)
- [ ] SQLite + Drizzle integration retained (see web-wrapper.sqlite-and-drizzle.md)
- [ ] Devbox-based per-project isolation operational (see web-wrapper.devbox-integration.md)
- [ ] Process runner and log streaming working (see web-wrapper.process-runner-and-logs.md)
- [ ] Security and sandboxing guardrails in place (see web-wrapper.security-and-sandboxing.md)
- [ ] Deployment/config documented and tested (see web-wrapper.deployment-and-config.md)
- [ ] QA and verification complete (see web-wrapper.qa-and-verification.md)

Constraints & Principles
- Do not modify Electron main process or desktop-specific files to achieve web support; add adapters instead.
- Prefer composition over forks. New web-only code must be additive.
- Keep the API contracts narrow and documented.
- Avoid UI regressions; parity over polish for MVP.

Dependencies
- Node.js runtime for backend.
- SQLite (better-sqlite3) + Drizzle ORM.
- Devbox installed where processes are executed (or alternate runner later).

Risks & Mitigations
- Hidden Electron coupling in UI: Mitigate with adapter interfaces and feature flags.
- Security around filesystem/process: Start with single-user guardrails; plan for stricter isolation later.
- Env fragmentation: Centralize feature flags and config.

## Architecture at a glance

Single-container architecture that mirrors Electron behavior with HTTP/WebSocket replacing IPC. Project files live under `/workspace`, and the SQLite database under `/data`.

```
┌──────────────────────────────────────────────────────────────┐
│ Single Container Environment                                 │
│                                                              │
│ ┌──────────────────────────────┐        ┌───────────────────┐ │
│ │ Dyad Web App (Express/React) │:3000   │ WebSocket Server  │ │
│ └──────────────────────────────┘        └───────────────────┘ │
│                                                              │
│ ┌──────────────────────────────┐                              │
│ │ Project Files /workspace/    │                              │
│ │ ├─ app-1/                    │                              │
│ │ ├─ app-2/                    │                              │
│ │ └─ app-3/                    │                              │
│ └──────────────────────────────┘                              │
│                                                              │
│ ┌──────────────────────────────┐                              │
│ │ Dev Servers (child processes)│ :4000+                      │
│ └──────────────────────────────┘                              │
│                                                              │
│ /data/dyad.db (SQLite + Drizzle)                              │
└──────────────────────────────────────────────────────────────┘
```

What changes (vs Electron)
- IPC → HTTP/WebSocket for all invocations and events.
- Fixed home-based paths → container paths (/workspace, /data).
- Port 32100 → dynamic ports (4000+), with reverse-proxy routing.

What stays the same
- SQLite + Drizzle schema, migrations, and queries.
- isomorphic-git/native git operations and flows.
- File operations semantics and guardrails (path scoping & validation).
- Business logic and data shapes returned to the UI.

Single-container layout
- /workspace: all app folders (cloned/scaffolded projects).
- /data/dyad.db: SQLite DB (WAL mode; migrations from `drizzle/`).
- Web app: Express/Hono server for REST + WebSocket for logs/events.

Migration timeline (from analysis report)
- Week 1: Core API layer + file path updates + DB path update.
- Week 2: Dev server management (ports, proxy) + frontend client.
- Week 3: E2E tests, polish, and productionizing.

Interfaces and adapters
- Universal IPC in the UI selects Electron or Web at runtime.
- WebIpcClient mirrors method signatures of the real IPC client.
- Filesystem and process runner behind narrow interfaces to swap backends.

References
- See web-wrapper.backend-api.md for endpoint contracts.
- See web-wrapper.filesystem-abstraction.md for fs scoping & safety.
- See web-wrapper.process-runner-and-logs.md for dev server lifecycle & logs.
- See web-wrapper.sqlite-and-drizzle.md for DB pathing, migrations, and backups.
