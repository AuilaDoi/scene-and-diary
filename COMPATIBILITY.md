# Compatibility

`v0.3.0-rc.3` is a manual-testing release candidate. Its schema 4 migration preserves legacy memory content and control fields, but opening a v0.1–v0.2.5 chat upgrades its saved data. Keep a full pre-migration chat backup; returning to v0.2.5 requires restoring that backup. The extension stores a second, browser-local pre-migration copy and keeps the chat read-only until that copy is written and the upgraded save is verified. Live-host migration and rollback still need manual verification.

## SP·数据库 / shujuku

scene&diary 0.3 is intentionally incompatible with SP·数据库. Both products own long-term relationship data and prompt injection, so enabling them together can duplicate or contradict context.

When the verified `AutoCardUpdaterAPI` runtime marker is found, scene&diary becomes read-only: it does not filter acts, run diary or memory requests, or inject diary/memory context. It does not alter other extensions, their settings, or their stored data. Stop SP·数据库 and reload SillyTavern to resume scene&diary.

The check cannot reliably identify renamed, forked, or manually embedded copies that do not expose this marker. Those installations remain unsupported and must be disabled manually.

## SillyTavern

Requires SillyTavern 1.18.0 or newer and a solo character chat. Auxiliary diary and memory generation needs Chat Completion through the active connection or a Connection Manager profile. The extension has no server-side component. Optional embeddings use browser fetch and require a CORS-enabled OpenAI-compatible endpoint. A key is stored only when the user selects the account-local remember option; same-origin scripts can read it.
