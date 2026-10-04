# JSON 格式请求兼容策略

状态：已实施于 `release/v0.3.2-rc`。适用于日记、记忆提取、角色成长和记忆整理的 JSON 请求；启用须安装下述宿主适配并重启酒馆、刷新页面。

## 1. 目标与边界

每个新的逻辑请求按 `json_schema` → `json_object` 的顺序尝试。只有服务端明确拒绝当前格式时才切换。两种格式均不支持时终止，显示两次失败原因；不再降级为不带 `response_format` 的普通生成。

格式被接受不等于业务结果有效。所有响应仍通过原有 JSON 解析、必需字段和业务校验；有效的空 `memories` / `operations` 数组允许成功。格式协商不得改变事实内容校验边界、关幕确认或保存事务。

## 2. 请求协议

协商层给适配层传入明确的 `format`，并独立传递 `outputSchema`。不要再用 `outputSchema = null` 表示降级，否则既不能区分 JSON 模式与普通输出，也会丢失提示词中的结构要求。

```js
send({ messages, maxTokens, format, outputSchema })
// format: 'json_schema' | 'json_object'
```

对于 OpenAI 格式的 Chat Completions，两种实际请求分别为：

```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "scene_diary_memory",
      "strict": true,
      "schema": { "type": "object", "properties": {}, "additionalProperties": false }
    }
  }
}
```

```json
{
  "response_format": { "type": "json_object" }
}
```

上面的 Schema 仅示意封装形态；生产请求必须使用对应任务的完整 `OUTPUT_SCHEMAS`，保留字段、类型和必需字段。

两种模式都在提示词中明确要求只输出一个完整 JSON 对象。`json_object` 模式追加完整的输出结构要求，说明无结果时返回空数组。它只保证 JSON 语法，不保证结构；本地校验仍不可省略。

每次发送重新复制消息数组，追加结构说明不得修改原提示词或重复累积。格式切换复用同一份任务输入、模型、连接及输出预算；只有内容修复重试才追加修复说明并按现有上限扩大预算。

## 3. 状态与重试规则

| 当前结果 | 下一步 |
| --- | --- |
| `json_schema` 返回合格结果 | 成功 |
| `json_schema` 明确不支持 | 记录原因，尝试 `json_object` |
| `json_object` 返回合格结果 | 成功 |
| 两种格式均明确不支持 | 返回 `SCENE_DIARY_JSON_FORMAT_UNSUPPORTED` |
| 任一格式返回认证、限流、网络或其他非格式错误 | 立即返回当前错误；若之前发生过格式拒绝，在错误上下文中保留它 |
| 已接受的格式返回无法解析的 JSON 或缺少必需字段 | 使用该格式修复重试一次 |
| 修复后仍无法解析或缺字段 | 返回原有内容格式错误，不把它误报为提供商不支持 |
| 输出通过协议检查，但未通过后续业务校验 | 使用现有业务错误处理，不自动换格式 |

单个逻辑请求最多发生一次格式切换、一次内容修复，最多三次模型调用。被拒绝的格式在本次请求内不再尝试。若 `json_schema` 的内容修复请求明确拒绝格式，仍可切到尚未尝试的 `json_object`，但不再增加第二次内容修复机会。

初版不维护跨请求的能力缓存，避免暂时性拒绝导致以后永久跳过严格模式。重试当前失败部分时开始新的协商；关幕其他部分已经生成成功的结果不重新请求。

```text
format = json_schema
repairUsed = false
rejections = []
loop:
    发送当前格式的请求
    如果请求失败：
        如果不是明确的格式拒绝：返回该错误及已有上下文
        记录本次格式拒绝
        如果当前为 json_schema：format = json_object；继续
        否则：返回两种格式均不支持的错误
    解析并检查协议必需字段
    如果通过：返回结果
    如果错误不属于可修复内容错误：返回错误
    如果 repairUsed：返回两次内容均无效的错误
    repairUsed = true
    追加修复说明，调整输出预算；继续使用当前格式
```

## 4. 识别明确的格式拒绝

优先使用提供商返回的结构化 `code`、`param` 和错误详情；其次检查有限长度的 `message` / `cause` 链。

切换条件必须同时指向 JSON 输出格式，并明确表明不支持、不可用或无法识别，例如：

- `This response_format type is unavailable now`
- `response_format json_schema is not supported`
- `Unknown parameter: response_format`
- `Unsupported response_format type: json_object`
- `unsupported_parameter`，且 `param` 为 `response_format` 或其子字段
- `invalid_value` 明确指向 `response_format.type`，或错误明确列出该类型允许的 `text` / `json_object` 等枚举值

文本识别须覆盖 `json_schema`、`json_object`、`response_format` 等实际写法及 `unsupported`、`not supported`、`unavailable`、`unknown parameter` 等拒绝描述，允许跨行。不要只因出现 `invalid` 或 HTTP 400 就切换。

以下错误不属于格式兼容性拒绝：密钥失效、余额不足、429、超时、连接失败、5xx 服务异常、上下文或 token 超限、提示词缺少 JSON 指令、错误的 Schema 定义和内容解析失败。HTTP 状态码仅作为辅助信息；400 本身不能证明格式不支持，5xx 也不能证明两种格式均不可用。

## 5. 宿主适配要求

扩展 `json-request.js` 通过连接管理器覆盖参数传递 `json_response_format`，或通过 `generateRawData({ jsonSchema })` 中的 `jsonSchema.responseFormat` 传递模式。宿主前端保留此标记，后端在最终序列化前覆盖实际 `response_format`。

未经补丁的酒馆 DeepSeek 专用分支会把 `json_schema` 自动转换为 `json_object`。补丁仅对带显式格式标记的请求绕过此转换；原有调用者保留原来的模式。不能把同一种实际请求重复两次宣称为完成了格式协商。

实施分为两个独立部分：

1. 扩展：`model-protocol.js` 实现协商和有限内容修复；`index.js` 传递显式格式和原始 Schema。
2. 酒馆适配：连接管理器和当前聊天连接均须保留显式格式选项；后端按选项构造实际 `response_format`。需要兼容旧调用者时，未提供新选项才保留原有提供商转换行为。

宿主新增可选 `json_response_format` 字段，值为 `json_schema` / `json_object`，兼容从嵌套 `jsonSchema.responseFormat` 读取。显式选择 JSON Object 时，不得被通用 Schema 默认逻辑覆盖回 JSON Schema。Schema 始终作为独立结构说明存在。

对于 DeepSeek，显式 Schema 请求应真正发送 `json_schema`，其明确拒绝后再发送 `json_object`。这满足统一的先后尝试规则，也可用同一密钥验证最终请求体的区别。

对于非 OpenAI 格式的提供商，只有存在等价且可验证的原生模式时才实现映射；不能把工具调用或普通提示词请求静默当成其中一种格式。宿主缺少显式格式能力时应返回 `SCENE_DIARY_JSON_ADAPTER_UNAVAILABLE`，不能声称服务端已经拒绝两种格式。

宿主变更涉及 SillyTavern 主程序，不属于扩展仓库内补丁；实现与交付必须单独列出宿主影响、最低能力要求和安装方式。不得依赖扩展管理器自动安装宿主补丁。

### 安装、更新与回滚

在扩展目录执行（已安装 Node 的酒馆环境）：

```powershell
node scripts/install-json-host-adapter.mjs --check
node scripts/install-json-host-adapter.mjs
```

默认从扩展安装位置定位宿主；特殊目录使用 `--host-root "D:\路径\SillyTavern"`。脚本先检查所有源码标记再写入，重复执行不重复补丁；不支持的宿主源码会停止，不能通过只修改版本声明强行安装。

宿主影响文件为 `src/endpoints/backends/chat-completions.js`、`public/scripts/openai.js`、`public/scripts/custom-request.js`，新增 `src/scene-diary-json-format.js`。源补丁和安装脚本随扩展仓库分发；不修改宿主依赖、配置、密钥或聊天数据，不向 SillyTavern 官方仓库推送这些本地补丁。

安装输出包含备份目录，位于宿主 `data/scene-diary-json-adapter/<时间与标识>/`。备份清单记录前后 SHA-256 和原始文件；恢复前逐个核验，安装后另有修改的文件不会被覆盖：

```powershell
node scripts/install-json-host-adapter.mjs --restore "安装输出的完整备份目录"
```

安装或恢复后重启 SillyTavern，再刷新浏览器。宿主更新可能覆盖补丁，应重新执行 `--check`；源码不再匹配时需更新适配代码。仅回退扩展即可恢复旧扩展行为；完整移除宿主补丁按上述恢复步骤执行。没有数据结构迁移。

扩展每个逻辑任务先检查 `/api/backends/chat-completions/json-formats` 的版本和格式能力，缺失时不发送模型请求。原生 Claude、Gemini/Vertex、Cohere、Workers AI 和暂时禁用的 CometAPI 未建立此协议映射，明确返回适配不可用；并不把它们的原生工具或输出协议伪装成 `response_format`。

## 6. 错误与诊断

两种格式均被拒绝时，例如：

```text
记忆提取失败：当前连接的模型不支持本次 JSON 请求的两种格式。
json_schema：This response_format type is unavailable now
json_object：Unsupported response_format type: json_object
请更换支持 JSON 输出的连接或模型后重试该部分。
```

保留结构化诊断字段：错误代码、任务、连接标识、模型、请求格式、实际格式、每次状态码、已脱敏的错误原因和提供商 request_id。适配器信息与服务端拒绝分别记录，不混为同一种错误。

诊断不记录密钥、请求认证头、聊天原文或完整模型响应。展示提供商错误前移除已知敏感值并限制长度。每个任务只向用户展示一次最终结果；成功切换不逐次弹出错误。

日记、记忆、成长和整理保留各自失败状态与重试入口。两种格式失败或其他请求失败时，不提交失败结果，保留已生成的其他部分，沿用现有事务和取消恢复行为。

## 7. 实施验收

自动用例应验证实际行为和请求体，而不只验证模式名称：

1. Schema 成功只调用一次；首个请求为真实 `json_schema`。
2. 以 DeepSeek 原始 `unavailable now` 错误拒绝 Schema 后，第二次实际为 `json_object`，带完整结构要求，结果可通过本地校验。
3. 两种均明确拒绝时恰好调用两次，返回两次原因，无第三次普通请求。
4. Schema 被拒绝后 Object 遇到 401 / 429 / 超时，返回真实终止原因，不宣称两种格式均不支持。
5. JSON 内容修复沿用当前模式，预算不超过现有 16,384 上限，总调用不超过三次。
6. 合法空数组成功；非法内容两次仍失败；取消或切换聊天后旧结果不提交。
7. 格式切换不修改原消息，结构说明不重复累积；日记、记忆、成长、整理均接入同一策略。
8. 两条宿主调用路径都保留显式格式；缺少适配能力时报适配错误。

真实验收使用合成对话，不写入用户聊天：至少测试一个接受 Schema 的连接、DeepSeek 原生连接、以及可控地拒绝两种模式的测试服务。检查酒馆最终发出的两种请求体不同，分别记录请求状态与结果。DeepSeek 的普通与 Beta 接口都应符合相同协商流程。

运行时实现后须执行 `npm run build`、`npm test`、`git diff --check`，并分别完成扩展与宿主适配验收。单元测试通过不等于宿主真实请求、事务保存和其他提供商均已验证。此次设计不改变持久化结构，不需要数据迁移；后续实现不应为格式协商递增数据 Schema。

### 可重复执行的宿主检查

```powershell
npm run test:host-json
npm run test:host-json -- --live-deepseek
```

默认使用临时数据目录和独立本地端口启动真实酒馆，检查可控上游的 Schema 成功、Schema 拒绝后 Object 成功、两者均拒绝、限流，以及未适配原生协议。覆盖 DeepSeek 与自定义 OpenAI 兼容后端和两种客户端调用形态；客户端上下文是可控适配上下文，并非浏览器 UI 验收。

`--live-deepseek` 额外使用已配置的 `deepseek deepseek-flash` 原生连接和选定密钥，会产生少量 API 用量。只把该密钥放入隔离实例的临时密钥文件，检查完终止隔离实例并删除临时目录；不打印密钥，不把测试结果写入用户聊天。主程序的前端错误传递通过执行补丁后的测试素材验证，不替代真实浏览器端验收。

2026-10-04，Node 24.20.0 / 本地 SillyTavern 1.18.0：构建语法检查、109 项自动测试与差异空白检查通过；隔离宿主的 16 组格式与限流路径、1 组原生协议拒绝、2 组真实 DeepSeek 测试通过。真实 DeepSeek 的两组均为 `json_schema` HTTP 400 → `json_object` HTTP 200，返回合法的空记忆数组。浏览器交互、真实聊天保存、所有提供商及移动端仍属于独立 RC 验收范围。
