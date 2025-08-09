# PRD: Mocking and Gradual Migration Strategy

Objective
- Allow the UI to function end-to-end using mock data, then gradually replace individual features with real backend/Electron implementations.

Status
- Phase 1 completed: universal IPC factory with comprehensive mock implementation (80+ methods). Web app runs entirely on mocks.

Out of Scope
- Implementing real backend logic.

Requirements
- Central mock data store reflecting production schemas.
- Configurable mock client that can selectively use mock vs real per domain (apps, files, settings, chat, AI).
- Runtime toggles via feature flags and localStorage; environment variables for build-time defaults.
- Diagnostic utilities to validate data source health.

Interfaces
- Universal factory chooses between Electron IPC client, Web API client, or Mock client at runtime.
- Method signatures match Electron IPC client to avoid UI changes.

Feature toggles
- Build-time: VITE_FEATURE_FLAGS (comma-separated)
- Runtime: localStorage keys, e.g., feature.apps=real|mock, feature.files=real|mock

Coverage (from migration plan)
- Apps: create/list/get/delete
- Files: read/write
- Git: list versions, current branch, revert
- Settings: get/set
- Chat/AI: message streaming (mocked), token counting
- Integrations: GitHub/Vercel/Supabase basic flows mocked
- Processes: run/stop/restart (no real process spawn in mock)

Replacement path
1) Introduce WebIpcClient with real API calls for a domain (e.g., settings, apps).
2) Wire universal factory to select WebIpcClient for that domain when FEATURE_FLAGS enables.
3) Keep mocks as fallback if API not reachable; emit diagnostics.

Diagnostics
- Console utils to probe /health and emit readiness; warn if falling back to mock.
- UI badge indicating mock vs real per domain (optional).

Schema parity
- Periodically validate mock data shapes against Drizzle schema and API contracts.
