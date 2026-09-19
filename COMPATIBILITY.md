# Compatibility

## SP·数据库 / shujuku

scene&diary 0.2 is intentionally incompatible with SP·数据库. Both products own long-term relationship data and prompt injection, so enabling them together can duplicate or contradict context.

When the verified `AutoCardUpdaterAPI` runtime marker is found, scene&diary becomes read-only: it does not filter acts, run diary or memory requests, or inject diary/memory context. It does not alter other extensions, their settings, or their stored data. Stop SP·数据库 and reload SillyTavern to resume scene&diary.

The check cannot reliably identify renamed, forked, or manually embedded copies that do not expose this marker. Those installations remain unsupported and must be disabled manually.

## SillyTavern

Requires SillyTavern 1.18.0 or newer and a solo character chat. Auxiliary diary and memory generation needs Chat Completion through the active connection or a Connection Manager profile. The extension has no server-side component and stores no API key.
