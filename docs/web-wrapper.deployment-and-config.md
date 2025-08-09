# PRD: Deployment and Configuration

Objective
- Document environment variables, build modes, and serving strategies to deploy the web wrapper.

Scope
- Single binary/container with static assets and API.

Environment variables
- PORT: HTTP port for REST/static (default 3000)
- WS_PORT: WebSocket port (default 3002)
- WORKSPACE_DIR: defaults to /workspace
- DB_PATH: defaults to /data/dyad.db (dev fallback: ./data/dyad.db)
- LOG_LEVEL: info|debug (optional)
- FEATURE_FLAGS: comma-separated flags (e.g., devbox, mockFallback)

Local run
- Build frontend with web config and serve via backend.
- Ensure `./data/` exists or set DB_PATH.
- Access http://localhost:${PORT}

Docker run (example)
```
services:
	dyad-web:
		build: .
		ports:
			- "3000:3000"
			- "3002:3002"
		volumes:
			- dyad-data:/data
			- ./workspace:/workspace
		environment:
			- NODE_ENV=production
			- PORT=3000
			- WS_PORT=3002
			- DB_PATH=/data/dyad.db
volumes:
	dyad-data:
```

Static assets
- Backend serves built assets under / (SPA). Index routed for unknown paths.
- Cache: short max-age during development; enable immutable hash-based caching in production build.

Health & readiness
- GET /health — includes DB health and timestamp
- GET /ready — returns { ready: true } when server initialized

Logs
- Process runner logs via WebSocket; server logs to stdout (structured logging recommended).

Security
- Single-user assumption; limit CORS to expected origins; validate all inputs.

Notes
- Use a named volume for DB persistence; mount a host directory for /workspace to edit projects from the host.
