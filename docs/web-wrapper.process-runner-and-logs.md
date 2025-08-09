# PRD: Process Runner and Log Streaming

Objective
- Start/stop per-project dev processes and stream logs to the browser.

Scope
- Single-user, single-run per project (MVP).

Lifecycle
1) Start: allocate port (dynamic 4000+), ensure cwd = /workspace/<app.name>, run install if needed, spawn `pnpm run dev -- --port <port> --host 0.0.0.0`.
2) Track: keep registry by appId with pid, port, start time, status.
3) Stream: pipe stdout/stderr to WebSocket channel app:<id>:output.
4) Proxy: route /project/:id/* to http://localhost:<port>.
5) Stop: kill child, emit status update, cleanup registry.

API endpoints (see backend-api)
- POST /api/apps/:id/start — returns { port, previewUrl }
- POST /api/apps/:id/stop
- POST /api/apps/:id/restart
- GET /api/apps/:id/status
- GET /api/apps/:id/logs — paged pull as fallback

Port policy
- Range start: 4000; scan upwards for available.
- Allow override via body.port if free; else reject with PORT_IN_USE.

WebSocket channels
- app:<id>:output — { type: "stdout"|"stderr", message, ts }
- app:<id>:status — { running, port?, pid? }
- app:<id>:lifecycle — { event: "start"|"stop"|"exit"|"error", code?, signal? }

Backpressure and truncation
- Chunk messages to <= 8KB per WS frame.
- Keep a ring buffer per app (e.g., last 1000 lines) for pull API.

Errors
- START_FAILED: process failed to spawn or exited early
- PORT_IN_USE: requested port not available
- NOT_RUNNING: stop/restart called when no process
- TIMEOUT: health wait exceeded

Health check
- After spawn, wait up to N seconds probing http://localhost:<port>/ for readiness (optional framework heuristics); emit status when ready.

Shutdown
- On server exit, iterate registry, send SIGINT then SIGKILL after grace period; emit lifecycle events.
