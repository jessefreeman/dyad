# PRD: QA and Verification

Objective
- Ensure the web wrapper meets functional, reliability, and parity goals.

Scope
- Build/lint/test, smoke tests, manual checks.

Build & Lint
- Build web: vite build (web config)
- Typecheck: tsc -b
- Lint: biome/eslint as configured

Core flows (smoke)
- Apps: create app -> scaffold files -> list apps -> delete app
- Files: open existing file -> edit -> save -> verify git commit
- Processes: start dev server -> receive logs -> browse via reverse proxy -> stop
- Settings: load and modify user settings
- Health: /health returns healthy with DB responseTime

Parity checklist (Electron vs Web)
- Data shapes for apps/chats/messages/versions identical
- Git operations behave equivalently (branch, history, revert)
- File path validation and error responses match expectations
- Real-time events available via IPC (Electron) vs WS (Web)

Known gaps tracking
- Document any features still on mock; add to backlog with owner and ETA.

Reliability
- Termination cleans child processes; no orphans after restart
- Database persists across container restarts (named volume)
