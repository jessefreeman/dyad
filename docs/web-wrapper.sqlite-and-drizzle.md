# PRD: SQLite + Drizzle Integration (Single-User)

Objective
- Retain SQLite persistence using Drizzle ORM for the self-hosted web runtime.

Scope
- Single-user DB file; migrations; schema parity with Electron where applicable.

DB file location
- Container target: /data/dyad.db
- Dev fallback: <repo>/data/dyad.db (ensure directory exists)

Initialization (from migration guide)
- Ensure parent directory exists; enable WAL and foreign_keys.
- Run drizzle migrations from `drizzle/` at startup.
- Optionally seed on first run (providers, models).

Example pragmas
- PRAGMA journal_mode = WAL
- PRAGMA foreign_keys = ON

Schema
- Reuse existing Drizzle schema (schema.ts) and migrations under `drizzle/`.
- Key tables: apps, chats, messages, versions, language_model_providers, language_models.

Seeding
- On empty language_model_providers, insert defaults (OpenAI, Anthropic, Google) and a few models for quick start.

Health
- Simple select from apps to validate; report response time.

Backups
- Copy file safely when process is idle or after checkpoint: cp /data/dyad.db /data/dyad.db.bak
- Consider `.backup` via sqlite3 CLI for consistent snapshots if available.

Failure handling
- If DB < 100 bytes at startup, treat as corrupted and recreate.
- Log migration failures and abort startup; do not proceed with partial state.

Persistence in Docker
- Mount a named volume at /data to persist across restarts.

Scripts (suggested)
- db:test — smoke test init/migrations/CRUD
- db:seed — seed defaults if needed
- db:reset — remove dev db and reseed
