# Changelog

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
