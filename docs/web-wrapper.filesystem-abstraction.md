# PRD: Interchangeable Filesystem Abstraction (Electron & Web)

Objective
- Unify filesystem access behind a single interface, supporting Electron (IPC) and Web (HTTP) implementations.

Scope
- Read, write, list, delete; directory operations; path safety; root scoping.

Non-Goals
- Full VFS, sync services, or remote storage.

Contract
- Inputs: appId (number), relativePath (string), content? (string)
- Outputs: success flag, file content/metadata; consistent error objects
- Safety: all operations scoped to /workspace/<app.name>

Interface (UI-facing)
- read(appId, path): Promise<{ content: string, path: string }>
- write(appId, path, content, opts?): Promise<{ bytes: number, committed: boolean }>
- list(appId, dir, opts?): Promise<{ entries: Array<{ name, path, type, size? }> }>
- remove(appId, path): Promise<{ removed: boolean }>
- mkdirp(appId, dir): Promise<{ created: boolean }>

Electron adapter
- Maps to ipcRenderer.invoke('read-app-file'|'edit-app-file'|...) with same parameters.

Web adapter
- Maps to REST endpoints:
	- GET /api/apps/:id/files/*
	- PUT /api/apps/:id/files/*
	- GET /api/apps/:id/dir/*
	- DELETE /api/apps/:id/files/*
	- POST /api/apps/:id/dir/*

Path rules (from migration analysis)
- Project root: /workspace/<app.name>
- A resolved path must startWith(projectRoot); else INVALID_PATH.
- Normalize and reject any '..' traversal segments.
- Create parent directories (mkdir -p) on write if missing.

Git side-effects
- On write: stage and commit with message "Updated <path>" unless opts.skipCommit.
- Return committed: true/false depending on git success.

Error taxonomy
- INVALID_PATH: 400 — attempted traversal or outside root
- NOT_FOUND: 404 — missing file/dir
- EISDIR/ENOTDIR: 400 — type mismatch
- PERMISSION_DENIED: 403 — blocked by policy
- IO_ERROR: 500 — underlying fs failure
- GIT_ERROR: 500 — commit/stage failed

Performance considerations
- Prefer async fs APIs; batch multiple writes when applicable.
- Optional debounced commits or commit-on-save toggles.

Future backends
- S3/R2 object storage mirror via same interface with a project-level mapping file.
