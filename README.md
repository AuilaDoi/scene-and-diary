# scene&diary 0.1.0

scene&diary adds scene-based chat to SillyTavern. A scene is closed with **结束这一幕**; the extension asks a Chat Completion model for a first-person diary and a factual handoff, then starts the next scene when the player sends the next real message.

## Install

Install the `scene-and-diary` directory as a third-party extension, or point SillyTavern's extension installer at the repository containing this directory. The published directory must contain `manifest.json`, `index.js`, and `style.css`.

The first release supports solo, newly created chats and Chat Completion. It does not migrate an existing chat automatically. It keeps the full transcript in the chat file while filtering earlier scenes from ordinary generation requests.

## Compatibility with 创世回廊 and SP·数据库

scene&diary does not require 酒馆助手 or SP·数据库. For the three-way setup:

1. Disable `【隐藏不发送】远楼层正则` from the database companion regex.
2. Disable 创世回廊's `10楼外只发送摘要` and the matching summary-generation/filter pair for scene chat.
3. Keep visual formatting and `scene_time` display rules enabled.
4. Do not load the SP·数据库 extension twice (the database body JSON is a remote script loader, not a second copy of the extension).
5. Keep 创世回廊 request-rewrite modes disabled until they have been tested with the scene interceptor.

The extension will show a compatibility reminder in its panel, but it does not silently change another extension's settings.

## Stored data

Chat metadata is stored under `chat_metadata.scene_diary`. Message ownership is stored under `message.extra.scene_diary`. API keys are never copied into this data. A JSON export is available from the panel.

## Database template

`templates/恋爱陪伴表格.json` contains starter logical tables for player preferences, relationship state, important events, important items, plans, and interaction habits. Version 0.1 does not automatically write these tables; use SP·数据库's normal update flow.

