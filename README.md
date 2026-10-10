# scene&diary 0.3.6

v0.3.6 introduces retrieval-based memory organization, a required dedicated connection, and an editable organization system prompt. Chat schema upgrades to 6; content backups remain v2. See [validation and rollback](VALIDATION-v0.3.6.md) and [upgrade instructions](UPGRADE-v0.3.6.md). Automatic updates remain disabled. This working version awaits real-host acceptance before publication.

开发与维护请遵循 [开发与维护规范](DEVELOPMENT.md)。

TauriTavern structured JSON compatibility is included in `main`; the user confirmed manual acceptance on 2026-10-05. See [the extension-only implementation and verification plan](JSON-REQUEST-COMPATIBILITY.md). No host patch, Node installer, or APK rebuild is required; use `main`, update and reload to obtain the adapter.

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

Changing chat settings during act closing keeps existing previews available for saving. Regenerating one part uses the settings saved when that attempt starts, including its prompt, connection, body tags and story-time tags; other previews and manual edits are retained. Running requests keep their original input. Changes to source messages or saved character growth still require a fresh close preview.

On TauriTavern, supported DeepSeek, OpenAI Chat and Custom / OpenAI compatible connections request `json_schema` first, then `json_object` only after explicit format rejection. Both rejected formats produce a combined error; this path never switches to ordinary output. Malformed JSON or missing required fields receive one repair using the accepted format, with at most three calls per preview or organization batch. Authentication, quota and network failures stop immediately. Other native wire protocols currently report a support error. Ordinary SillyTavern retains its existing host schema path and ordinary-output fallback. Failed parts remain available for manual retry while successful previews are preserved.

Extraction validates output structure, not factual correctness. It receives only the current act dialogue, proposes new entries, and never compares or modifies existing memories. Valid candidates remain available when other candidates fail validation. Review and select each proposed fact before confirming it.

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

Diaries remain per-act first-person records of concrete experiences. Long-term memory stores objective facts, importance (1–5), story time, locking and optional **常驻** controls. Reference excerpts and lifecycle/status fields have been removed. Wishes, speculation, internal monologue, and unfulfilled plans must not become accomplished events. The **记忆整理** button on the memory page independently proposes semantic duplicate merges and associations between developing facts. Nothing changes until you approve the proposals. Editing or deleting an earlier chat message does not automatically disable a memory.

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

Only memory content and story time enter recalled memory context. Titles, categories, people, aliases and association reasons remain available for user search and maintenance, but are not injected. Lexical, vector and rerank documents use content only; story time is not searched. Vector caches use a new namespace so old vectors are rebuilt. Manual deletion removes all links involving the deleted entry without linking its former neighbors.

Memory retrieval merges the entire chat's latest three effective player/character messages, in chronological speaker order, into one query, including across act boundaries. Lexical retrieval, one query embedding and one rerank request share that query. Local lexical retrieval works without network services. Optional semantic retrieval accepts an OpenAI-compatible embeddings URL, model, optional dimension, and API key. Optional reranking uses a separate URL, model and key, returning `results` with `index` and `relevance_score`. Both endpoints require browser CORS support. Failures retain the available local/pre-rerank result and produce one combined warning per generation; failed results are retried on the next generation.

The v0.3.5 recall-flow update removes extension-imposed embedding and rerank deadlines, including background vector indexing. Query embedding, cached-vector reads and local lexical retrieval overlap; identical in-flight recalls share work, and vector builds share identical snapshots and queue changed snapshots. Vector cache reads/writes use batch transactions. Empty and permanent-only libraries skip unnecessary model requests. Stopping generation, changing chats or superseding a recall cancels obsolete query/rerank requests. Browser and service transport failures can still occur.

**诊断** now displays the latest recall as a compact stage log with status and elapsed time, followed by groups in final ranking order and member titles (ranked seeds first, then associated entries). Service warnings remain brief; expand **查看具体原因** in the log for redacted HTTP/provider errors, response validation failures and cache errors. Only the latest run is retained in memory; query/memory bodies, credentials and the old raw JSON dump are not shown. Background vector updates invalidate full recall caches. Validation and local rollback steps: [recall flow validation](VALIDATION-v0.3.5.md).

Ordinary retrieval takes the top 30 lexical and top 30 available-vector documents without an early score cutoff, then merges them by reciprocal rank fusion (RRF). The normalized RRF relevance is capped by the strongest actual channel evidence: lexical evidence is `BM25 / (BM25 + 0.5)`, and vector evidence is cosine similarity clamped to 0–1. Missing vectors are not vector candidates. This heuristic keeps a weak top result from being promoted to relevance 1. Successful rerank uses each service score clamped to 0–1 directly, without dividing by the best result; use a service whose `relevance_score` represents 0–1 relevance. Scores on other scales need adaptation by the service.

The final score is `0.95 × relevance + 0.05 × ((importance − 1) / 4)`. **最低召回分数** defaults to **0.30**, accepts 0–1, and is saved per chat. Ordinary entries scoring below it are excluded from the final candidate/seed set; equality is retained. Set 0 to disable the cutoff. Rerank receives the unfiltered ordinary retrieval pool, so it can rescue initially weak candidates; successful rerank is filtered after scoring, and failed rerank retains the thresholded local result. The group count is only a capacity ceiling, never a target to fill. Permanent seeds bypass the cutoff but remain subject to group count and budget. The scores are retrieval heuristics, not calibrated probabilities; tune the threshold for your library and service. Equal scores use stable IDs.

Each independently matching memory expands only its direct neighbors. A—B—C with only A matching recalls A/B; C is added only if B independently matches as well. Overlapping groups merge and inject each fact once. After all overlaps have merged, a group with more than two distinct final candidate seeds retains only those seeds, removing every attached non-seed neighbor before budget calculation. Groups with one or two seeds still carry direct neighbors, even if those neighbors did not pass the cutoff. Pruning does not split the merged group or expand its seeds again. Permanent seeds count toward the two-seed boundary. One group occupies one recall slot regardless of its number of memories. Deleted entries are excluded, including as neighbors. The disabled switch has been removed; legacy disabled entries participate again. An entire group is skipped with a warning when it does not fit the remaining token budget, including permanent groups. Diagnostics report the cutoff, rejected candidates, seeds, attached/pruned entries, group/item counts, scores, budget skips and fallback reasons.

### Independent memory organization

Choose a mode and click **记忆整理** after configuring **记忆整理连接**. This dedicated Connection Manager profile must support Chat Completion; organization never falls back to extraction or main-chat connections. Its editable system prompt supports {{char}} and {{user}}. The plugin adds the JSON protocol, batch material and permitted comparisons separately.

- **全量整理／初始化** uses each currently saved fact as a retrieval anchor. Only approval replaces all old links with the approved links and applies approved merges. Previously merged facts remain fixed current entries. Cancelling or failing leaves the original library intact.
- **增量整理** becomes available after approved initialization. Only new/changed records serve as anchors, including new-new comparisons, and existing links are retained or redirected by approved merges. A clean library makes no model calls.

Organization uses content-only BM25 and optional embeddings, taking the top 30 from each channel, then RRF fusion and optional rerank over the complete initial pool. It includes permanent and locked records, excludes the query record itself, and uses relevance alone. It does not use chat-recall importance bonuses, permanent priority, graph expansion or injection budgets. **每条记忆最多整理候选** defaults to 20 (1–60); **整理最低相关分数** defaults to 0.15 (0–1, 0 disables cutoff). These parameters are independent of chat recall. Candidate limits are ceilings, not targets. Retrieval is a limited screening strategy and does not guarantee comparison of all possible pairs or detection of every relationship.

Cached memory vectors are also the query vectors; only missing vectors are embedded in batches. Normalized candidate pairs are deduplicated and packed into sequential analysis batches with a 12,000-character complete-input budget. Each batch sends memory material once, its anchors, permitted pairs and applicable existing links. Links must be permitted pairs; multi-member merges must have one common anchor whose other members are all its batch candidates. A context-limit failure splits the existing candidate pairs without widening the scope. A single pair that cannot fit fails visibly instead of truncating facts.

The transaction freezes the selected profile identity, custom system prompt and screening settings. Setting edits affect the next organization run and do not invalidate an existing preview. Retries keep the frozen settings; a removed or changed profile requires a new run. Disabled retrieval services are skipped. A failure of an enabled embedding/rerank service pauses the run instead of silently degrading; completed queries and model batches survive retry and reload. Cancellation and stale chat/library protection remain, with no extension-imposed semantic deadline. Cancelling a shared index wait does not cancel other consumers' index builds.

Pure unchanged-old operations, out-of-candidate-scope suggestions and duplicates are automatically filtered and recorded in diagnostics; they require no extra approval or retry. Actual integrity errors (unknown IDs, self-links, locked merges, invalid fields/content) retain visible reasons and the **忽略未通过的建议并批准** flow. Missing IDs are checked before scope filtering. Batch, preview and save stages enforce the scope. Only valid reviewed operations are saved; the program does not verify their factual truth.

The approved baseline records IDs and fingerprints in chat-level memoryOrganization. Healthy completed runs with no suggestions can still be approved. Failed, cancelled or stale runs do not advance the baseline. Settings edits do not automatically enroll every old entry; run full organization to apply a new strategy to the whole library.

Merges keep an existing ID, maximum importance, combined aliases/people and permanent status if any member is permanent. Existing links redirect and deduplicate. Latest comparable story time is retained; ambiguous times require choosing an original member value. Locked entries cannot merge, but can be linked. Stable **建议 #N** labels identify mutually exclusive overlapping merges, which start unchecked and cannot both be saved.

Progress and diagnostics show index/screening/analysis/review stages, durations, query/candidate/pair/batch counts, automatic filters and redacted errors. They contain no raw model responses or API keys. Content backup v2 continues to contain diaries, growth, facts, links and the organization baseline, without connection/prompt settings or transaction logs. Use a full chat backup for migration rollback.

Schema 5 initialization, current facts and completed legacy organization previews survive the schema 6 migration. Unfinished legacy runs remain inspectable/cancellable and must be restarted. Older data without a baseline still requires approved full initialization. See [upgrade and rollback](UPGRADE-v0.3.6.md).

## Settings reference

- **正文标签**: complete matching opening and closing tags such as `<now_plot>` and `</now_plot>`; multiple pairs use corresponding lines.
- **最近有效消息**: fixed at three for recall, merged chronologically into one query across acts.
- **长期记忆**: default maximum 8 groups and 1,200 estimated tokens; permanent groups have priority and obey the budget.
- **近期日记篇数**: default 2; zero disables diary injection.
- **角色成长**: stored content is capped at 4,000 characters; the full saved document is injected.
- **提示词**: diary, memory, and character-growth role definitions are editable. Available variables are `{{char}}` and `{{user}}`; inputs and output formats are appended internally.

The panel is responsive. Tabs scroll horizontally on narrow screens, touch targets remain at least 44px, and the character-growth editor uses the mobile full-screen panel with a sticky save area.
