# scene&diary 0.2.5

scene&diary is a standalone SillyTavern extension for scene-based romance roleplay. It keeps the current act in normal chat context and carries earlier development through a cumulative character-growth document, recent first-person diaries, and a searchable per-chat long-term memory library.

## Important compatibility rule

scene&diary **cannot run together with SP·数据库 / shujuku**. If its verified runtime API is present, scene&diary stops scene filtering, auxiliary generation, and prompt injection. It leaves saved data readable. Disable SP and reload SillyTavern before using scene&diary.

The 0.2 series supports solo character chats. Group chats, cross-chat shared memory, vector services, and SP data conversion are out of scope.

## How it works

1. Open the `🎬 scene&diary` panel beside the send box.
2. Configure optional complete opening/closing body-tag pairs separately for player and character messages. Leave them blank to use the full message.
3. Click **结束这一幕**. The extension freezes the current act and independently generates a diary, memory candidates, and an updated character-growth document.
4. Review all three results. A failed part keeps the successful parts and can be retried by itself. The act cannot close until all three parts succeed.
5. Confirm to save the diary, accepted memories, character growth, and closed-act state together. The next real player message opens the next act.

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

Diaries remain per-act first-person records of concrete experiences. Long-term memories remain searchable factual entries with categories, sources, review state, locking, and optional **常驻** recall.

Handoff generation and injection have been removed. Existing handoff fields remain untouched in old chat data for rollback compatibility, but 0.2.5 never reads or updates them and new acts do not create them. Story time comes only from configured story-time tags.

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

Data remains in `chat_metadata.scene_diary`; message ownership remains in `message.extra.scene_diary`. Schema v3 adds `characterGrowth` without rewriting existing diaries, memories, tag rules, prompts, or permanent-memory choices.

- v0.1–v0.2.4 handoff data is preserved but inactive.
- A test-build `summary` object migrates to `characterGrowth`; an existing `characterGrowth` object takes precedence.
- The old `handoffTokenBudget` setting may remain in saved JSON for downgrade compatibility but is not used or displayed.
- No API key is stored. Auxiliary requests disable inherited preset and instruct templates.

## Settings reference

- **正文标签**: complete matching opening and closing tags such as `<now_plot>` and `</now_plot>`; multiple pairs use corresponding lines.
- **最近有效消息数**: 1–20 messages, default 3.
- **长期记忆**: default maximum 8 entries and 1,200 estimated tokens; permanent entries occupy recall slots first.
- **近期日记篇数**: default 2; zero disables diary injection.
- **角色成长目标长度**: default 800–1500 Chinese characters; storage is capped at 4,000 characters.
- **提示词**: diary, memory, and character-growth role definitions are editable. Available variables are `{{char}}` and `{{user}}`; inputs and output formats are appended internally.

The panel is responsive. Tabs scroll horizontally on narrow screens, touch targets remain at least 44px, and the character-growth editor uses the mobile full-screen panel with a sticky save area.
