# scene&diary 0.3

scene&diary is a scene-based memory extension for one-character SillyTavern roleplay chats. It writes a first-person diary and character-growth record for each closed act, maintains events and changing facts, and recalls related memories on each generation.

## Installation

The browser extension and server plugin must both be installed. The server package is the [`server`](server) directory in this repository. Copy that directory to `<SillyTavern>/plugins/scene-and-diary`, enable `enableServerPlugins: true` in SillyTavern's `config.yaml`, and restart SillyTavern. The browser extension stays in `public/scripts/extensions/third-party/scene-and-diary`. The panel's diagnostics tab shows service errors; an incompatible or unavailable service stops plugin-managed generation.

Node.js 20 or newer and SillyTavern 1.18.0 or newer are required. The server package has no native dependencies. The two components must use the same protocol version; the current protocol is 1.

## Workflow

1. Start a new one-character chat or select **从当前第一条接管旧聊天** for an existing chat.
2. Choose **结束这一幕**. The extension extracts the tagged dialogue, generates diary and memory candidates, compares candidates with relevant existing memories, then generates the growth update.
3. Review additions, fact replacements, evidence additions, conflicts, diary and growth. The confirmation saves one server transaction and advances to the next act. Changing the accepted memory proposals requires regenerating growth.
4. Open **记忆库** to search and edit records, inspect their evidence, links and versions, page through a large library, review history, or export a complete memory backup.

An event records what happened. A fact describes a current preference, habit, relationship or promise. A conditional fact can coexist with a general tendency: “usually skips breakfast” and “will eat breakfast made by the character” are both valid. Replacing a fact retains the old version for historical questions. Edits and deleted source messages mark dependent records for review.

Maintenance compares candidates in small batches. If too many old records match a candidate, it marks the suggestion as a conflict for review rather than assuming the old fact is absent. Entities with the same name remain separate until a confirmed identity choice or merge links them.

## Retrieval and embedding

The service maintains an incremental text index and an entity/link index. Retrieval combines weighted BM25, exact entity matches, optional vectors and one-hop links. Superseded facts are recalled only for historical questions. Permanent memories use part of the same token budget as dynamic results.

Embedding is off by default. To enable it, enter a separate OpenAI-compatible embedding base URL, model and API key under **设置**, save and test the connection, then enable semantic recall for the chat. The key stays in the authenticated user's server data directory. Model errors and timeouts fall back to text retrieval. Query rewriting and model reranking are separate advanced settings and are off by default.

## Migration, branches and backup

Opening a v0.2 chat imports its memories, acts and growth into a server library. The server keeps the original data as `legacyBackup`. Imported memories remain searchable; **整理旧记忆** proposes structural changes in batches of 20 for review. Export a complete memory backup from **记忆库** before substantial changes or moving to another device. The backup includes chat memory settings and transaction history; embedding credentials are excluded. SillyTavern's native chat export alone does not contain the server library.

Chats have separate libraries. A historical branch retains records whose source evidence is present in the branch and restores a previous fact version when its later replacement is absent. Open the original chat once under v0.3 before opening one of its branches. Chat rename keeps its binding; deleted libraries remain recoverable for 30 days.

Server data is stored under the authenticated SillyTavern user's root in `scene-and-diary`. Snapshot and transaction-journal files are authoritative. Text and vector indexes are derived and may be rebuilt. Embedding credentials are excluded from exported library backups.

## Verification

Run `npm test` for functional tests and `npm run build` for syntax checks. `node test/benchmark.mjs 5000 10000 50000` measures the retrieval core with synthetic records; it does not measure a phone or an external embedding provider. See [ACCEPTANCE.md](ACCEPTANCE.md) for the current evidence and remaining release checks.
