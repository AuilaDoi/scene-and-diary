# scene&diary 0.2.2

scene&diary is a standalone SillyTavern extension for scene-based romance roleplay. It keeps the current act's dialogue in the normal context and carries continuity through short character diaries, act handoff details, and a searchable per-chat long-term memory library.

## Important compatibility rule

scene&diary **cannot run together with SP·数据库 / shujuku**. If its verified runtime API is present, scene&diary stops scene filtering, auxiliary generation, and prompt injection. It leaves saved data readable and exportable. Disable SP and reload SillyTavern before using scene&diary. The extension never changes or deletes SP settings or data.

The first 0.2 release supports solo character chats. Group chats, cross-chat shared memory, vector services, and SP data conversion are deliberately out of scope.

## How it works

1. Open the `🎬 scene&diary` panel beside the send box.
2. Configure optional opening/closing body-tag pairs separately for player and character messages. Each line is one complete pair, such as `<now_plot>` and `</now_plot>`. Leave all pair fields blank to use the full message.
3. Click **结束这一幕**. The extension freezes the current act, extracts only configured visible dialogue, and asks the diary and memory models separately.
4. Review the diary and every proposed memory. Edit the diary, uncheck unwanted memories, then confirm. Nothing is written to the memory library before confirmation.
5. The next actual player message opens the next act. On each normal generation, the extension retrieves related memory from the latest three valid messages by default.

If configured tags do not match a message, closing and generation stop with the affected message index shown in the Current Act page. Correct the tag rule or explicitly skip that message; skipped messages are excluded from that attempt.

## Memory and time

Memory entries record category, title, fact, people and aliases, importance, story time, source act/message IDs, device-local creation time and timezone, and edit/lock/review state. Entries marked deleted, disabled, or requiring review are never recalled. Manual edits lock an entry from automatic replacement.

Story time is copied only from the configured story-time tags. It may be relative text such as `初夏` and is never replaced with the device date. Device time is used only for management metadata.

Recall is local Chinese keyword/BM25-style matching. Aliases and titles receive a small boost, with importance as a secondary tie-breaker. The Diagnostics page displays the exact query, matches, scores, and token budget result.

The recall query inherits the same player/character body-tag rules used for diary and memory extraction. Text outside configured body tags never enters retrieval. If a recent message misses its required body tag, the generation is stopped and the affected floor is reported instead of recalling against unfiltered text.

## Data and migration

Data remains in `chat_metadata.scene_diary`; message ownership remains in `message.extra.scene_diary`. Loading a 0.1 chat migrates its acts, diaries, handoff data, and settings without converting old diary prose into factual memory. Existing ordinary chats require the player to select **从当前第一条接管旧聊天**; earlier messages stay in the chat file but are not silently treated as new memory.

No API key is stored by this extension. A diary and memory model can each use the current Chat Completion connection or a Connection Manager profile. Auxiliary requests explicitly disable inherited preset and instruct templates. They receive only the character card's description, personality, and scenario fields as character context; system prompts, jailbreaks, example dialogue, greetings, world books, and creator notes are not copied.

## Settings reference

- **正文标签**: enter complete, matching opening and closing tags such as `<now_plot>` and `</now_plot>`. Multiple pairs use corresponding lines. Mismatched names, invalid syntax, or unequal line counts are rejected when saving.
- **最近有效消息数**: 1–20 messages, default 3; this is messages, not dialogue turns.
- **长期记忆预算**: default 1,200 estimated tokens and at most 8 entries.
- **近期日记篇数**: default 2. Set to zero to inject no diary at all.
- **提示词**: the setting displays the effective default text and edits only the model role definition. Available variables are `{{char}}` and `{{user}}`. Character context, current dialogue, and mandatory JSON output instructions are appended internally and cannot be edited from the settings page.

The panel is responsive: on narrow screens it becomes full-screen, retains a touch-friendly 44px minimum target, and keeps act actions accessible above the mobile safe area.
