# 开发与验收

## 构建与安装入口

在扩展仓库根目录运行以下命令。

```sh
npm ci
npm run build
npm test
git diff --check
```

`manifest.json` 加载 `entry.js` 和 `dist/style.css`。入口桥接宿主上下文后，启动 Vite 构建的 Vue 工作台。发布时把 `dist/index.js` 和 `dist/style.css` 一并提交，确保扩展安装器可直接加载。

## 运行结构

| 位置 | 职责 |
| --- | --- |
| `src/` | Vue 页面、编辑器、设置及诊断。通过工作台状态与宿主交互。 |
| `host-v7.js` | 宿主生命周期、消息归幕、关幕分项任务、串行保存和上下文注入。 |
| `state-v7.js` | schema 7、内容备份 v3、事实与图谱写入和 0.3.x 迁移。 |
| `tasks-v7.js`、`channels.js`、`model-protocol.js` | 任务提示词、独立生成渠道、结构化输出和格式协商。 |
| `recall-v7.js`、`semantic.js` | 独立的事实和历史摘要检索、Embedding、重排、缓存和注入额度。 |

聊天内容保存于 `chat_metadata.scene_diary`，消息归幕用 `message.extra.scene_diary`。修改持久结构时先备份旧聊天，再迁移并通过宿主保存。普通写入以宿主保存返回结果为准。数据结构、ID、目标范围、锁定、聊天切换和实际异步竞争在各自写入边界检查。

## 自动检查

`test/v040.test.mjs` 和 `test/v040-workflows.test.mjs` 检查安装入口、迁移与回退数据、结构化请求、独立关幕审核、历史摘要、事实更新及图谱行为。旧版本的回归和迁移夹具保留在 `test/`。其中 `test/preview-server.mjs` 对应旧版测试夹具。

发布前确认 manifest、package 版本和分发构建一致。基本逻辑测试与实际宿主验收分别记录。

## 人工验收

1. 在 SillyTavern 与 TauriTavern 中打开备份后的 0.3.8 聊天，核对迁移、导出，以及重新打开后的数据。
2. 测试自建渠道，完成一次关幕并重试失败项。核对已确认日记驱动角色成长，且下次发言开启新幕。
3. 编辑旧日记并补摘要，核对成长重整、历史摘要和客观事实召回。删除一条事实后确认对应图谱边被移除。
4. 在桌面和移动端核对长文本编辑、触控、软键盘遮挡、保存反馈，以及刷新后内容。

版本上线后使用 [升级与回退](docs/UPGRADE-0.4.0.md) 指导用户迁移。往期验证和方案归档按旧版本查阅。[旧版文档归档](docs/archive/v0.3/README.md)
