# Changelog

## 0.3.1 — 2026-09-29

- Replace chat-model memory reranking with a separately configured, browser-direct rerank endpoint, model, and optional key. Failed requests keep the local recall result.
- Replace memory-only export/import and manual memory inspection controls with one per-chat backup that saves and restores visible diaries, character growth, and memories together.
- Weight the latest player message and two preceding messages at 40%, 30%, and 30% for lexical, vector, and rerank retrieval. Keep schema 4 and existing chats.

## 0.3.0 — 2026-09-29

- Promote the tested RC.4 memory system to the stable `main` branch without changing schema 4 or memory behavior.
- Enable automatic updates for the stable extension. Back up complete chats before migration; returning to v0.2.5 requires restoring the pre-migration chat backup.
- The project owner confirmed the principal functions in manual SillyTavern testing. Automated checks cover the core behavior; fault-injection and every host configuration were not separately verified.

## 0.3.0-rc.4 — memory references are informational

- Stop checking generated or manually edited memory references against chat messages; missing or mismatched references no longer reject a memory.
- Stop marking memories for review after edits to older messages, and allow legacy `dirty` memories to participate in recall. Diary and character-growth review behavior remains.
- Let status updates and archive suggestions operate without source excerpts, while keeping structural checks, lock rules, user confirmation, and save verification.
- Keep existing source fields as optional, unverified reference information. Schema remains 4.

## 0.3.0-rc.3 — evidence review and memory workflow

- Match source quotes despite punctuation, whitespace and full-width formatting differences, then store the exact span from the source message. Invalid IDs and factual rewrites remain rejected.
- Keep valid facts when another candidate fails source validation; show each excluded candidate in the close preview with a regenerate option.
- Retry a well-formed JSON response once when its required `memories` array is absent.
- Remove the ineffective growth target-length setting. Growth still has a 4,000-character storage limit and is injected in full.
- Present memory maintenance as a review flow, with plain-language changes and backup/recovery controls grouped separately.
- Continue RC development on `release/v0.3.0-rc`; retain prior RC tags.

## 0.3.0-rc.2 — structured model output

- Request JSON object output through SillyTavern for diary, memory, growth and maintenance responses.
- Increase output allowances and retry only malformed JSON responses once; preserve completed close tasks.
- Keep plain-output fallback for providers that reject structured output.
- Verified the three close response types with the saved siliconflow-glm5.2 profile through the SillyTavern backend using synthetic dialogue. Real chat and UI testing remain pending.

## 0.3.0-rc.1 — manual testing candidate

- Added evidence-backed objective memory extraction and reviewable maintenance proposals.
- Added schema 4 provenance, lifecycle, revision and maintenance history with legacy migration.
- Added local retrieval improvements, optional direct embeddings, reranking and an IndexedDB vector cache.
- Added memory review, undo, export/import and save recovery controls.
- Added post-save chat verification for act close and maintenance changes.

Legacy schema 1–3 memory migration, retrieval eligibility and repeatability pass synthetic tests. The RC saves a browser-local copy of full chat metadata and messages before migration and verifies the migrated chat save. Live SillyTavern, model, network failure and migration rollback scenarios still require manual validation before a stable release.
