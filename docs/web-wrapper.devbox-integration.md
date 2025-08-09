# PRD: Devbox Integration (Per-Project Environments)

Objective
- Use Devbox to provide reproducible per-project environments for running commands without polluting the host.

Scope
- Project initialization, dependency toolchain, command execution, lifecycle management.

When to use
- Optional for MVP; process runner can execute directly on host/container.
- Enable Devbox per project via feature flag or project setting when isolation is desired.

Base packages
- nodejs, pnpm; language-specific tooling as needed per template.

Lifecycle
- create: generate devbox.json into /workspace/<app.name>
- start: `devbox run -- pnpm install && pnpm run dev -- --port <port> --host 0.0.0.0`
- health: probe http://localhost:<port>/
- stop: terminate devbox-run process; cleanup temp directories.

Logs
- Capture stdout/stderr from devbox wrapper; forward to WS app:<id>:output.

Fallbacks
- If devbox unavailable, fall back to direct spawn with same commands.

Notes
- Ensure Devbox is installed in Docker image or provide a bootstrap step.
