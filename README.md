# scene&diary 0.3.1

The stable release is available from the `main` branch and the `v0.3.1` tag. Automatic updates are enabled. Before updating an older installation, export a full SillyTavern chat backup. Opening a pre-0.3 chat upgrades its scene&diary data to schema 4 and saves a browser-local pre-migration copy of its metadata and messages.

开发与维护请遵循 [开发与维护规范](DEVELOPMENT.md)。

scene&diary is a standalone SillyTavern extension for scene-based romance roleplay. It keeps the current act in normal chat context and carries earlier development through a cumulative character-growth document, recent first-person diaries, and a searchable per-chat long-term memory library.

## Important compatibility rule

scene&diary **cannot run together with SP·数据库 / shujuku**. If its verified runtime API is present, scene&diary stops scene filtering, auxiliary generation, and prompt injection. It leaves saved data readable. Disable SP and reload SillyTavern before using scene&diary.

The 0.3 series supports solo character chats. Group chats, cross-chat shared memory, and SP data conversion are out of scope. Optional vector retrieval uses a direct browser connection to an OpenAI-compatible embeddings endpoint.

## How it works

1. Open the `🎬 scene&diary` panel beside the send box.
2. Configure optional complete opening/closing body-tag pairs separately for player and character messages. Leave them blank to use the full message.
3. Click **结束这一幕**. The extension freezes the current act and independently generates a diary, memory candidates, and an updated character-growth document.
4. Review all three results. Memory candidates may include unverified reference excerpts and proposed additions or updates to earlier memories. A failed part keeps the successful parts and can be retried by itself. The act cannot close until all three parts succeed.
5. Confirm to save the diary, accepted memories, character growth, and closed-act state together. The next real player message opens the next act.

The extension asks compatible Chat Completion providers for JSON object output when generating these three previews. If a provider does not support that option, the extension uses its normal output mode. A malformed JSON result or missing required `memories` array triggers one retry of only the affected preview with a larger output allowance; failed results remain in the preview for manual retry. Memory references are optional and are not checked against chat messages. Review proposed facts yourself before confirming them.

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

Diaries remain per-act first-person records of concrete experiences. Long-term memory stores objective facts with optional, unverified reference excerpts, locking, and optional **常驻** recall. Wishes, speculation, internal monologue, and unfulfilled plans must not become accomplished events. Memory maintenance is proposed at act close and committed only after review. Editing or deleting an earlier chat message does not automatically disable a memory.

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

Empty sections are omitted. Character growth is injected whole. Recent diaries obey their count and token budget; recalled memories obey their limit and budget, except eligible permanent memories, which occupy the first recall slots.

## Data and migration

Data remains in `chat_metadata.scene_diary`; message ownership remains in `message.extra.scene_diary`. Schema v4 adds optional reference metadata, lifecycle, revision, maintenance history, memory-space identity, and optional semantic settings. Old entries retain their content and control choices; unavailable old references remain marked unverified. This release uses the same schema as RC.4.

- v0.1–v0.2.4 handoff data is preserved but inactive.
- A test-build `summary` object migrates to `characterGrowth`; an existing `characterGrowth` object takes precedence.
- The old `handoffTokenBudget` setting may remain in saved JSON for downgrade compatibility but is not used or displayed.
- Optional embedding and rerank API keys may be saved in SillyTavern account storage when explicitly selected. This browser storage is accessible to same-origin scripts. Keys never enter chat metadata or content backups.
- Embeddings are a rebuildable IndexedDB cache. Losing that cache does not delete memory entries.
- Rollback to v0.2.5 requires restoring a pre-migration chat backup, not only switching extension code.
- Auxiliary requests disable inherited preset and instruct templates when using a dedicated Connection Manager profile.

## Content backup and retrieval

The memory page exports one JSON backup containing every visible diary, the character-growth document, and every visible memory in the current chat. Importing that file restores all three content types together after confirmation. Backups are bound to their originating chat and require the corresponding acts to exist. They do not contain chat messages or API keys, so keep a separate full SillyTavern chat backup for migration rollback. If a save cannot be verified, the local recovery button appears so the pending state can be saved again.

Memory retrieval uses the latest player message at 40% and the two preceding effective messages at 30% each; when fewer messages exist, the available weights are normalized. Local lexical retrieval works without network services. Optional semantic retrieval accepts an OpenAI-compatible embeddings URL, model, optional dimension, and API key. Optional reranking uses a separate rerank URL, model, and key through a direct browser request to a `/rerank`-style API returning `results` with `index` and `relevance_score`. Each message is scored separately and combined with the same weights. Both endpoints require browser CORS support. Failed embedding or rerank requests fall back to the available local result.

Current automated checks do not prove live SillyTavern save, model accuracy, CORS support, or visual behavior. Validate those flows with a backed-up chat before relying on a migrated library.

## Settings reference

- **正文标签**: complete matching opening and closing tags such as `<now_plot>` and `</now_plot>`; multiple pairs use corresponding lines.
- **最近有效消息**: fixed at three for recall, weighted 40% / 30% / 30% from newest to oldest.
- **长期记忆**: default maximum 8 entries and 1,200 estimated tokens; permanent entries occupy recall slots first.
- **近期日记篇数**: default 2; zero disables diary injection.
- **角色成长**: stored content is capped at 4,000 characters; the full saved document is injected.
- **提示词**: diary, memory, and character-growth role definitions are editable. Available variables are `{{char}}` and `{{user}}`; inputs and output formats are appended internally.

The panel is responsive. Tabs scroll horizontally on narrow screens, touch targets remain at least 44px, and the character-growth editor uses the mobile full-screen panel with a sticky save area.
