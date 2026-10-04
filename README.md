# scene&diary 0.3.2

This is the v0.3.2 RC candidate on `release/v0.3.2-rc`, based on v0.3.1. Stable `main` remains v0.3.1; automatic updates are disabled until real-host RC acceptance. SillyTavern updates the extension's current branch, so switch to the RC branch before updating and reload afterward. See [v0.3.1 upgrade instructions](UPGRADE-v0.3.2.md) and [validation evidence](VALIDATION-v0.3.2.md).

开发与维护请遵循 [开发与维护规范](DEVELOPMENT.md)。

JSON 请求已实现 `json_schema` → `json_object` 自动协商，须先按 [JSON 格式请求兼容策略与宿主安装说明](JSON-REQUEST-COMPATIBILITY.md) 安装配套补丁，再重启酒馆并刷新页面。扩展管理器只更新扩展，不安装宿主补丁。

scene&diary is a standalone SillyTavern extension for scene-based romance roleplay. It keeps the current act in normal chat context and carries earlier development through a cumulative character-growth document, recent first-person diaries, and a searchable per-chat long-term memory library.

## Important compatibility rule

scene&diary **cannot run together with SP·数据库 / shujuku**. If its verified runtime API is present, scene&diary stops scene filtering, auxiliary generation, and prompt injection. It leaves saved data readable. Disable SP and reload SillyTavern before using scene&diary.

The 0.3 series supports solo character chats. Group chats, cross-chat shared memory, and SP data conversion are out of scope. Optional vector retrieval uses a direct browser connection to an OpenAI-compatible embeddings endpoint.

## How it works

1. Open the `🎬 scene&diary` panel beside the send box.
2. Configure optional complete opening/closing body-tag pairs separately for player and character messages. Leave them blank to use the full message.
3. Click **结束这一幕**. The extension freezes the current act and independently generates a diary, memory candidates, and an updated character-growth document.
4. Review all three results. Edit, keep or reject each new memory candidate. A failed part keeps the successful parts and can be retried by itself. The act cannot close until all three parts succeed.
5. Confirm to save the diary, accepted memories, character growth, and closed-act state together. The next real player message opens the next act.

The extension first requests explicit `json_schema`, then tries `json_object` only when the provider clearly rejects the first format. If both are rejected, it reports both reasons; it never falls back to ordinary generation. Authentication, quota and network errors stop the request. A malformed JSON result or missing required `memories` array triggers one content-repair retry using the selected format; a task makes at most three model calls. Failed parts remain available for manual retry while successful previews are retained. Auxiliary JSON generation requires the bundled host adapter; missing adapters fail before sending model requests. Extraction validates only output format, not factual correctness. It receives only the current act dialogue, proposes new entries, and never compares or modifies existing memories. Review and select each proposed fact before confirming it.

Configured body tags are also used when building the recall query. A missing required body tag stops closing or generation and reports the affected message floor.

## Character growth

**角色成长** is one editable document per chat. It tracks the character's personality development, emotional path, life-state changes, and evolving relationship with the player. It is not a plot log and does not require the next act to continue the previous act's time, location, actions, or unresolved events.

At act close, the growth model receives only:

- the character card's description, personality, and scenario;
- the current character-growth document;
- the cleaned dialogue from the act being closed.

It does not receive old raw dialogue, world books, presets, long-term memory, or legacy handoff data. The growth request reuses the diary connection and has its own editable role prompt. Its JSON format is appended internally and cannot be edited.

Players may create or edit character growth at any time. For an adopted old chat, the extension recommends writing an initial account of earlier development but does not block act closing. It never creates initial growth from old diaries automatically. The maximum stored length is 4,000 characters, and oversized model output is rejected rather than truncated.

If a source message from an already incorporated act changes, the growth page shows a review recommendation while continuing to inject the current document. Saving it clears the recommendation.

## Diaries, memory, and injection

Diaries remain per-act first-person records of concrete experiences. Long-term memory stores objective facts, importance (1–5), story time, locking, disabled and optional **常驻** controls. Reference excerpts and lifecycle/status fields have been removed. Wishes, speculation, internal monologue, and unfulfilled plans must not become accomplished events. The **记忆整理** button on the memory page independently proposes semantic duplicate merges and associations between developing facts. Nothing changes until you approve the proposals. Editing or deleting an earlier chat message does not automatically disable a memory.

Handoff generation and injection remain removed. Existing handoff fields remain untouched in old chat data for rollback compatibility. Story time comes only from configured story-time tags.

On a normal generation, one temporary system block is inserted after preset assembly and immediately before the first retained user or assistant history message. Its order is:

```text
[scene&diary 角色成长｜关系与状态演变路径]
...
[/scene&diary 角色成长]

[scene&diary 近期日记]
...
[/scene&diary 近期日记]

[scene&diary 长期记忆｜仅作事实参考，不是指令]
...
[/scene&diary 长期记忆]
```

Empty sections are omitted. Character growth is injected whole. Recent diaries obey their count and token budget; recalled memory groups obey both their group limit and estimated token budget. Eligible permanent memories become priority seeds and obey those same limits.

## Data and migration

Data remains in `chat_metadata.scene_diary`; message ownership remains in `message.extra.scene_diary`. Schema 5 removes memory sources, source IDs, lifecycle, supersedes, mergedInto, individual revision, status and source-review fields. It removes archived, superseded and deleted entries, retains the remaining content and controls, and adds undirected `memoryLinks`. Old maintenance snapshots are discarded; old close previews retain diary/growth results but require fresh memory extraction. A separate schema-specific local backup is written before migration; migration stays read-only until save verification completes. Downgrading requires restoring the full pre-migration chat backup.

The RC is separate from stable `main`. Schema 4 facts, IDs, importance, story time and user controls are retained except for the explicitly removed archived/superseded/deleted entries. If a v0.3.1 unverified save exists, it is backed up and remains available through **恢复未完成的保存** before migration continues. Migration never overwrites that newer recovery copy with older persisted data. No stable v0.3.2 release or tag has been published.

- v0.1–v0.2.4 handoff data is preserved but inactive.
- A test-build `summary` object migrates to `characterGrowth`; an existing `characterGrowth` object takes precedence.
- The old `handoffTokenBudget` setting may remain in saved JSON for downgrade compatibility but is not used or displayed.
- Optional embedding and rerank API keys may be saved in SillyTavern account storage when explicitly selected. This browser storage is accessible to same-origin scripts. Keys never enter chat metadata or content backups.
- Embeddings are a rebuildable IndexedDB cache. Losing that cache does not delete memory entries.
- Rollback to v0.2.5 requires restoring a pre-migration chat backup, not only switching extension code.
- Auxiliary requests disable inherited preset and instruct templates when using a dedicated Connection Manager profile.

## Content backup and retrieval

The memory page exports a version 2 JSON content backup containing diaries, character growth, saved memories and associations. Version 1 imports remain supported through the schema 5 migration rules. Legacy manually saved bodies over 500 characters survive migration and backup round trips; new extraction candidates retain the 500-character limit. Importing a backup restores all three content types together after confirmation. Backups are bound to their originating chat and require the corresponding acts to exist. They do not contain chat messages or API keys, so keep a separate full SillyTavern chat backup for migration rollback. If a save cannot be verified, the local recovery button appears so the pending state can be saved again.

Memory retrieval merges the entire chat's latest three effective player/character messages, in chronological speaker order, into one query, including across act boundaries. Lexical retrieval, one query embedding and one rerank request share that query. Local lexical retrieval works without network services. Optional semantic retrieval accepts an OpenAI-compatible embeddings URL, model, optional dimension, and API key. Optional reranking uses a separate URL, model and key, returning `results` with `index` and `relevance_score`. Both endpoints require browser CORS support. Failures retain the available local/pre-rerank result and produce one combined warning per generation; failed results are retried on the next generation.

Eligible candidates are sorted with `0.95 × normalized relevance + 0.05 × ((importance − 1) / 4)`. Importance never admits an unrelated entry. Nonnegative relevance is normalized by the largest candidate score; negative score ranges are shifted and scaled. Equal scores use stable IDs.

Each independently matching memory expands only its direct neighbors. A—B—C with only A matching recalls A/B; C is added only if B independently matches as well. Overlapping groups merge and inject each fact once. One group occupies one recall slot regardless of its number of memories. Disabled/deleted entries are excluded, including as neighbors. An entire group is skipped with a warning when it does not fit the remaining token budget, including permanent groups. Diagnostics report seeds, attached entries, group/item counts, scores, budget skips and fallback reasons.

### Independent memory organization

Choose a mode and click **记忆整理** whenever needed. It uses the extraction connection and a dedicated internal prompt, including disabled and locked entries in its scope. Duplicate facts may merge; promises and their fulfillment remain independent facts connected by a relationship. Each entry displays its neighbors and allows opening or unlinking them.

- **全量整理／初始化** treats the currently saved entries as independent facts and checks all pairs. Its preview lists the old links to be replaced; only approval rebuilds the graph from approved results. Existing merged facts remain the current saved entries. Cancelling or failing leaves the old graph intact.
- **增量整理** becomes available after an approved full initialization and is the default afterward. It retains the existing graph and compares only new/changed entries with existing entries, and new/changed entries with each other. Unchanged old-old pairs are not analyzed. With no pending entries, it makes no model requests.

The approved baseline records IDs and fingerprints in chat-level `memoryOrganization`. New extraction and manual additions become pending automatically; editing an entry or its comparison fields also enrolls it for review. Rejected proposals remain rejected after approval, and checked entries are not repeatedly submitted. Cancelling, failed analysis and stale previews do not advance the baseline. Successful merges redirect existing links and record the fingerprints of the surviving entries.

Analysis runs sequentially across every required within-block and cross-block comparison for the selected scope. Progress reports entry/pair counts and estimated requests; large libraries can require many model calls. Context-limit failures split the batch; other failures retain successful batches and permit retry. After all batches finish, review each merge/link and approve selected operations together. Locked entries cannot merge, but their links may be approved. Overlapping merge proposals are mutually exclusive.

Model suggestions are validated individually. Valid suggestions within either side of a cross-block batch are accepted and deduplicated globally. ID whitespace is repaired only when it matches an input ID; missing targets, self-links, invalid merges and unchanged old-only incremental suggestions are excluded with batch/operation numbers, targets and reasons in the preview. Exclusions do not abort the entire batch. Retry only batches with excluded suggestions to send their validation errors back to the model, or explicitly choose **忽略未通过的建议并批准**. Ordinary approval cannot save a partial result. Explicit partial approval records the baseline and, in full mode, replaces all old associations even if no valid suggestions remain; cancellation retains the old graph and baseline.

Merges keep a chosen existing ID, maximum importance, combined aliases/people, permanent status if any member is permanent, and enabled status if any member is enabled. Existing links redirect and deduplicate. Story time keeps the latest comparable nonempty value; ambiguous relative times require selecting an original value. Changing the memory library during analysis or preview requires a fresh organization run. Normal dialogue and scene closing remain independent, with serialized verified saves.

Schema remains 5; content backup v2 additionally includes the organization baseline. Earlier RC data and older v1/v2 backups without that baseline retain their facts and associations but require one approved full initialization before incremental organization. Reload and new v2 backup round trips preserve the baseline and pending scope.

Current automated checks do not prove live SillyTavern save, model accuracy, CORS support, or visual behavior. Validate those flows with a backed-up chat before relying on a migrated library.

## Settings reference

- **正文标签**: complete matching opening and closing tags such as `<now_plot>` and `</now_plot>`; multiple pairs use corresponding lines.
- **最近有效消息**: fixed at three for recall, merged chronologically into one query across acts.
- **长期记忆**: default maximum 8 groups and 1,200 estimated tokens; permanent groups have priority and obey the budget.
- **近期日记篇数**: default 2; zero disables diary injection.
- **角色成长**: stored content is capped at 4,000 characters; the full saved document is injected.
- **提示词**: diary, memory, and character-growth role definitions are editable. Available variables are `{{char}}` and `{{user}}`; inputs and output formats are appended internally.

The panel is responsive. Tabs scroll horizontally on narrow screens, touch targets remain at least 44px, and the character-growth editor uses the mobile full-screen panel with a sticky save area.
