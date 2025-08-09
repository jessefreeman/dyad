# PRD: Security and Sandboxing Guardrails

Objective
- Establish minimal but solid guardrails for single-user operation.

Scope
- Filesystem scope, input validation, process control, logging.

Filesystem
- Root scope: /workspace/<app.name>
- Deny traversal: normalize path, reject if outside root
- Write: mkdir -p parents; enforce size limits per request

Processes
- Allowed commands: pnpm install, pnpm run dev/build/test within project root
- Environment: whitelist pass-through env vars; strip secrets unless required
- Ports: allocate within policy (4000+)

Validation
- Strong schema validation on all API bodies/params
- Reject unexpected keys; sanitize strings

Logging
- Log security events (path violations, command denials) with timestamp and appId
- Avoid logging secrets; redact tokens

Future isolation
- Devbox per-project environments for tool isolation
- Potential container/VM runner preserving same API contracts
