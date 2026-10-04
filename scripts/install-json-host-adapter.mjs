import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const paths = ['src/endpoints/backends/chat-completions.js', 'public/scripts/openai.js', 'public/scripts/custom-request.js', 'src/scene-diary-json-format.js'];
const hash = value => createHash('sha256').update(value).digest('hex');
const marker = '// scene-diary-json-adapter v1';

function replaceOnce(text, before, after) {
    if (text.split(before).length !== 2) throw new Error(`不支持此宿主源码，定位标记不唯一或缺失：${before.slice(0, 70)}`);
    return text.replace(before, after);
}

export function patchBackend(source) {
    if (source.includes(marker)) {
        if (!source.includes("router.get('/json-formats'") || !source.includes('const formatError = prepareJsonFormat(request.body, TEXT_COMPLETION_MODELS);') || (source.match(/JSON.stringify\(applyJsonResponseFormat/g) || []).length !== 13) throw new Error('宿主补丁标记存在但适配代码不完整，停止安装');
        return source;
    }
    let text = source.replace(/\r\n/g, '\n');
    text = replaceOnce(text, "import fetch from 'node-fetch';", "import fetch from 'node-fetch';\n" + marker + "\nimport { JSON_FORMAT_CAPABILITIES, prepareJsonFormat, applyJsonResponseFormat, jsonFormatProviderError } from '../../scene-diary-json-format.js';");
    text = replaceOnce(text, 'export const router = express.Router();', "export const router = express.Router();\n\nrouter.get('/json-formats', (_request, response) => response.json(JSON_FORMAT_CAPABILITIES));");
    text = replaceOnce(text, "router.post('/generate', async function (request, response) {\n    try {\n        if (!request.body) return response.status(400).send({ error: true });", "router.post('/generate', async function (request, response) {\n    try {\n        if (!request.body) return response.status(400).send({ error: true });\n        const formatError = prepareJsonFormat(request.body, TEXT_COMPLETION_MODELS);\n        if (formatError) return response.status(400).send(formatError);");
    text = replaceOnce(text, 'if (request.body.json_schema?.value) {', 'if (request.body.json_schema?.value && !request.body.json_response_format) {');
    // Only generation handlers: status/model probes must remain untouched.
    const statusStart = text.indexOf("router.post('/status'");
    const generateStart = text.indexOf("router.post('/generate'");
    const generateEnd = text.indexOf('const multimodalModels =', generateStart);
    if (statusStart < 0 || generateStart < statusStart || generateEnd < generateStart) throw new Error('宿主请求处理区间无法定位');
    const modify = block => block
        .replace(/if \(request.body.json_schema\) \{/g, 'if (request.body.json_schema && !request.body.json_response_format) {')
        .replace(/request.body.json_schema\n(\s*)\? setJsonObjectFormat/g, 'request.body.json_schema && !request.body.json_response_format\n$1? setJsonObjectFormat')
        .replace(/body: JSON.stringify\((requestBody|apiRequestBody|body)\),/g, 'body: JSON.stringify(applyJsonResponseFormat(request.body, $1)),')
        .replace(/const errorJson = tryParse\(errorText\) \?\? \{ error: true \};/g, 'const errorJson = jsonFormatProviderError(tryParse(errorText), generateResponse.status, request.body);')
        .replace(/response.send\(\{ error: true \}\);/g, 'response.send(request.body.json_response_format ? jsonFormatProviderError({ error: { message: error.message } }, 502, request.body) : { error: true });');
    text = modify(text.slice(0, statusStart)) + text.slice(statusStart, generateStart) + modify(text.slice(generateStart, generateEnd)) + text.slice(generateEnd);
    if ((text.match(/JSON.stringify\(applyJsonResponseFormat/g) || []).length !== 13) throw new Error('宿主序列化路径与已验证版本不同，停止安装');
    text = replaceOnce(text, "const data = tryParse(text) || { error: { message: fetchResponse.statusText || 'Unknown error occurred' } };", "const data = request.body.json_response_format ? jsonFormatProviderError(tryParse(text), fetchResponse.status, request.body) : tryParse(text) || { error: { message: fetchResponse.statusText || 'Unknown error occurred' } };");
    text = replaceOnce(text, 'response.send({ error: { message }, quota_error: quota_error });', 'response.status(request.body.json_response_format ? fetchResponse.status : 200).send(request.body.json_response_format ? jsonFormatProviderError(errorData, fetchResponse.status, request.body) : { error: { message }, quota_error: quota_error });');
    return text;
}

export function patchOpenAI(source) {
    if (source.includes(marker)) {
        if (!source.includes('generate_data.json_response_format = jsonSchema.responseFormat;') || !source.includes('status: detail.status || response.status')) throw new Error('宿主前端补丁不完整，停止安装');
        return source;
    }
    let text = source.replace(/\r\n/g, '\n');
    text = replaceOnce(text, 'generate_data.json_schema = jsonSchema;', 'generate_data.json_schema = jsonSchema;\n        ' + marker + '\n        if (jsonSchema.responseFormat) generate_data.json_response_format = jsonSchema.responseFormat;');
    text = replaceOnce(text, "    if (!response.ok) {\n        tryParseStreamingError(response, await response.text());\n        throw new Error(`Got response status ${response.status}`);\n    }", "    if (!response.ok) {\n        const responseText = await response.text();\n        if (jsonSchema?.responseFormat) {\n            let data;\n            try { data = JSON.parse(responseText); } catch { /* Do not expose raw response bodies. */ }\n            const detail = data?.error || {};\n            throw Object.assign(new Error(detail.message || `JSON request failed (HTTP ${response.status})`), { code: detail.code, param: detail.param, status: detail.status || response.status, source: detail.source, model: detail.model, effectiveFormat: detail.effective_format });\n        }\n        tryParseStreamingError(response, responseText);\n        throw new Error(`Got response status ${response.status}`);\n    }");
    text = replaceOnce(text, '        checkQuotaError(data);\n        checkModerationError(data);', '        if (jsonSchema?.responseFormat && data.error) {\n            const detail = data.error;\n            throw Object.assign(new Error(detail.message || "JSON request failed"), { code: detail.code, param: detail.param, status: detail.status || response.status, source: detail.source, model: detail.model, effectiveFormat: detail.effective_format });\n        }\n        checkQuotaError(data);\n        checkModerationError(data);');
    return text;
}

export function patchCustomRequest(source) {
    if (source.includes(marker)) {
        if (!source.includes('data.json_response_format || data.json_schema?.responseFormat') || !source.includes('status: detail.status || response.status')) throw new Error('连接请求补丁不完整，停止安装');
        return source;
    }
    const split = source.indexOf('export class ChatCompletionService');
    if (split < 0) throw new Error('无法定位 ChatCompletionService');
    const prefix = source.slice(0, split);
    source = source.slice(split);
    return prefix + replaceOnce(source.replace(/\r\n/g, '\n'), "            if (!response.ok || json.error) {\n                throw new Error(String(json.error?.message || 'Response not OK'));\n            }", "            if (!response.ok || json.error) {\n                " + marker + "\n                if (data.json_response_format || data.json_schema?.responseFormat) {\n                    const detail = json.error || {};\n                    throw Object.assign(new Error(detail.message || `JSON request failed (HTTP ${response.status})`), { code: detail.code, param: detail.param, status: detail.status || response.status, source: detail.source, model: detail.model, effectiveFormat: detail.effective_format });\n                }\n                throw new Error(String(json.error?.message || 'Response not OK'));\n            }");
}

function inside(root, name) {
    const target = resolve(root, name), rel = relative(root, target);
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('补丁路径必须位于指定宿主目录内');
    return target;
}

export async function install(root, check = false) {
    root = resolve(root);
    const packageInfo = JSON.parse(await readFile(inside(root, 'package.json'), 'utf8'));
    if (!packageInfo.version || !packageInfo.scripts?.start?.includes('server.js')) throw new Error('目标不是支持的 SillyTavern 工作目录');
    const previous = await Promise.all(paths.map(async name => {
        try { return await readFile(inside(root, name), 'utf8'); } catch (error) { if (name === paths[3] && error.code === 'ENOENT') return null; throw error; }
    }));
    const next = [patchBackend(previous[0]), patchOpenAI(previous[1]), patchCustomRequest(previous[2]), await readFile(resolve(here, '../host-adapter/json-format.js'), 'utf8')];
    if (next.every((value, index) => value === previous[index])) return { installed: true, unchanged: true };
    if (check) return { installed: false, supported: true, hostVersion: packageInfo.version };
    const backup = inside(root, `data/scene-diary-json-adapter/${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`);
    await mkdir(backup, { recursive: true });
    const entries = paths.map((name, index) => ({ path: name, existed: previous[index] !== null, before: previous[index] === null ? null : hash(previous[index]), after: hash(next[index]) }));
    for (let index = 0; index < paths.length; index++) if (previous[index] !== null) await writeFile(resolve(backup, `${index}.bak`), previous[index], 'utf8');
    await writeFile(resolve(backup, 'manifest.json'), JSON.stringify({ root, version: 1, entries }, null, 2), 'utf8');
    try {
        for (let index = 0; index < paths.length; index++) await writeFile(inside(root, paths[index]), next[index], 'utf8');
    } catch (error) {
        for (let index = 0; index < paths.length; index++) {
            if (previous[index] !== null) await writeFile(inside(root, paths[index]), previous[index], 'utf8');
            else await unlink(inside(root, paths[index])).catch(() => {});
        }
        throw error;
    }
    return { installed: true, hostVersion: packageInfo.version, backup, restartRequired: true };
}

export async function restore(root, backup) {
    root = resolve(root);
    backup = inside(root, relative(root, resolve(backup)));
    const manifest = JSON.parse(await readFile(resolve(backup, 'manifest.json'), 'utf8'));
    if (resolve(manifest.root) !== root || manifest.entries.length !== paths.length || !manifest.entries.every((entry, index) => entry.path === paths[index])) throw new Error('备份不属于此宿主或备份路径无效');
    const originals = [];
    for (const [index, entry] of manifest.entries.entries()) {
        if (hash(await readFile(inside(root, entry.path), 'utf8')) !== entry.after) throw new Error(`安装后宿主文件已有其他修改，拒绝覆盖：${entry.path}`);
        const original = entry.existed ? await readFile(resolve(backup, `${index}.bak`), 'utf8') : null;
        if (original !== null && hash(original) !== entry.before) throw new Error('备份校验失败');
        originals.push(original);
    }
    for (const [index, entry] of manifest.entries.entries()) {
        if (originals[index] === null) await unlink(inside(root, entry.path));
        else await writeFile(inside(root, entry.path), originals[index], 'utf8');
    }
    return { restored: true, restartRequired: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const args = process.argv.slice(2), rootIndex = args.indexOf('--host-root'), restoreIndex = args.indexOf('--restore');
        const root = rootIndex >= 0 ? args[rootIndex + 1] : resolve(here, '../../../../../..');
        if (!root || (restoreIndex >= 0 && !args[restoreIndex + 1])) throw new Error('缺少宿主或备份目录参数');
        const result = restoreIndex >= 0 ? await restore(root, args[restoreIndex + 1]) : await install(root, args.includes('--check'));
        console.log(JSON.stringify(result, null, 2));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
