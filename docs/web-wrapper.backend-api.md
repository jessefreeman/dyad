# Backend API (Self-Hosted Wrapper)

Objective
- Provide HTTP and WebSocket endpoints that mirror Electron IPC capabilities for the web runtime with a minimal, well-documented surface.

Scope
- Single-user instance. Apps, files, settings, processes, logs.

Non-Goals
- Multi-tenant auth, rate limits, quotas.

Design Principles
- Keep endpoints parallel to existing IPC method shapes to minimize UI changes.
- Enforce path scoping to /workspace and validation on all inputs.
- Prefer idempotent operations where practical; return typed error objects.

## Base URLs
- REST base: /api
- WS base: ws://<host>:<wsPort>

Common headers
- Content-Type: application/json
- X-Request-Id: optional client-provided UUID echoed back

Error model
- 4xx for client errors (validation, missing resource, unsafe path)
- 5xx for server/process errors
- Body: { success: false, error: { code: string, message: string, details?: any } }

---

## Apps

List apps
- GET /api/apps
- 200: { success: true, data: { apps: App[] } }

Get app
- GET /api/apps/:id
- 200: { success: true, data: App }
- 404: { success: false, error: { code: "APP_NOT_FOUND", message } }

Create app
- POST /api/apps
- Body: { name: string, template?: string, repoUrl?: string }
- 201: { success: true, data: App }
- 409 if name exists

Delete app
- DELETE /api/apps/:id
- 204

## Filesystem

Read file
- GET /api/apps/:id/files/*
- 200: { success: true, data: { path: string, content: string } }
- 400 on traversal, 404 if not found

Write file
- PUT /api/apps/:id/files/*
- Body: { content: string, message?: string }
- 200: { success: true, data: { path: string, bytes: number, committed: boolean } }

List directory
- GET /api/apps/:id/dir/*?recursive=false
- 200: { success: true, data: { entries: Array<{ name: string, path: string, type: "file"|"dir", size?: number }> } }

## Git

List versions (commit history)
- GET /api/apps/:id/versions
- 200: { success: true, data: { versions: Version[] } }

Current branch
- GET /api/apps/:id/branch
- 200: { success: true, data: { branch: string } }

Revert to commit
- POST /api/apps/:id/revert
- Body: { oid: string }
- 200: { success: true }

## Settings

Get settings
- GET /api/settings
- 200: { success: true, data: UserSettings }

Update settings
- PUT /api/settings
- Body: Partial<UserSettings>
- 200: { success: true, data: UserSettings }

## Processes (Dev servers)

Start app
- POST /api/apps/:id/start
- Body: { port?: number, env?: Record<string,string> }
- 200: { success: true, data: { port: number, previewUrl: string } }

Stop app
- POST /api/apps/:id/stop
- 200: { success: true }

Restart app
- POST /api/apps/:id/restart
- 200: { success: true, data: { port: number, previewUrl: string } }

Status
- GET /api/apps/:id/status
- 200: { success: true, data: { running: boolean, pid?: number, port?: number } }

Logs (HTTP pull; use WS for streaming)
- GET /api/apps/:id/logs?offset=0&limit=1000
- 200: { success: true, data: { lines: string[], nextOffset: number } }

## WebSocket Events

Connection: ws://<host>:<wsPort>
Event envelope: { channel: string, data: any }

Channels
- app:<id>:output — { type: "stdout"|"stderr", message: string, ts: string }
- app:<id>:status — { running: boolean, port?: number, pid?: number }
- app:<id>:file-changed — { path: string, size: number }

## Health and Admin

Health
- GET /health
- 200: { status: "ok", database: { status: "healthy"|"unhealthy", responseTime?: number }, timestamp }

Readiness
- GET /ready
- 200: { ready: boolean }

## Validation & Safety
- All file paths are resolved against `/workspace/<app.name>` and must remain inside that root.
- Rejected with 400 and error.code = "INVALID_PATH" if traversal detected.
- Ports: default dynamic allocation in the 4000+ range if not specified.
- Git operations run within the app root with configured author info.

## Examples

Create app (request)
{ "name": "my-app", "template": "vite-react" }

Create app (response)
{ "success": true, "data": { "id": 42, "name": "my-app", "path": "/workspace/my-app" } }

Start app (response)
{ "success": true, "data": { "port": 4017, "previewUrl": "/project/42/" } }
