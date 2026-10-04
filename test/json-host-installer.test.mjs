import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { install, restore, patchOpenAI, patchCustomRequest } from '../scripts/install-json-host-adapter.mjs';

const backend = `import fetch from 'node-fetch';
async function send(request, response) {
    if (request.body.json_schema) {}
    ${Array.from({ length: 12 }, (_, index) => `const config${index} = { body: JSON.stringify(requestBody), };`).join('\n')}
}
export const router = express.Router();
router.post('/status', async () => {});
router.post('/generate', async function (request, response) {
    try {
        if (!request.body) return response.status(400).send({ error: true });
        if (request.body.json_schema?.value) {}
        const config = { body: JSON.stringify(requestBody), };
        const data = tryParse(text) || { error: { message: fetchResponse.statusText || 'Unknown error occurred' } };
        response.send({ error: { message }, quota_error: quota_error });
    } catch (error) {}
});
const multimodalModels = express.Router();`;
const openai = `async function parameters(jsonSchema) {
    const generate_data = {};
    if (jsonSchema) {
        generate_data.json_schema = jsonSchema;
    }
    return generate_data;
}
async function send(jsonSchema) {
    const response = await fetch();
    if (!response.ok) {
        tryParseStreamingError(response, await response.text());
        throw new Error(\`Got response status \${response.status}\`);
    }
    const data = await response.json();
        checkQuotaError(data);
        checkModerationError(data);
    if (data.error) { toastr.error('error'); throw new Error(data.error.message); }
    return data;
}`;
const custom = `export class ChatCompletionService {
    static async send(data) {
        const response = await fetch();
        const json = await response.json();
            if (!response.ok || json.error) {
                throw new Error(String(json.error?.message || 'Response not OK'));
            }
        return json;
    }
}`;

test('host installation is preflighted, idempotent and reversible, and protects later edits', async () => {
    const root = await mkdtemp(join(tmpdir(), 'scene-json-installer-'));
    try {
        const fixtures = { 'package.json': JSON.stringify({ version: '1.18.0', scripts: { start: 'node server.js' } }), 'src/endpoints/backends/chat-completions.js': backend, 'public/scripts/openai.js': openai, 'public/scripts/custom-request.js': custom };
        for (const [name, text] of Object.entries(fixtures)) { await mkdir(dirname(join(root, name)), { recursive: true }); await writeFile(join(root, name), text); }
        assert.equal((await install(root, true)).supported, true);
        assert.equal(await readFile(join(root, 'src/endpoints/backends/chat-completions.js'), 'utf8'), backend);
        const first = await install(root);
        assert.equal(first.installed, true);
        assert.equal((await install(root)).unchanged, true);
        const changed = join(root, 'public/scripts/openai.js');
        const installed = await readFile(changed, 'utf8');
        await writeFile(changed, installed + '\n// another edit');
        await assert.rejects(restore(root, first.backup), /已有其他修改/);
        await writeFile(changed, installed);
        assert.equal((await restore(root, first.backup)).restored, true);
        for (const [name, text] of Object.entries(fixtures)) assert.equal(await readFile(join(root, name), 'utf8'), text);
        await assert.rejects(readFile(join(root, 'src/scene-diary-json-format.js')), { code: 'ENOENT' });
        await writeFile(join(root, 'public/scripts/openai.js'), '// incompatible upstream');
        await assert.rejects(install(root), /不支持此宿主源码/);
        assert.equal(await readFile(join(root, 'src/endpoints/backends/chat-completions.js'), 'utf8'), backend);
    } finally { if (dirname(root) === tmpdir() && root.startsWith(join(tmpdir(), 'scene-json-installer-'))) await rm(root, { recursive: true, force: true }); }
});

test('patched frontend preserves provider errors without intermediate notifications', async () => {
    const detail = { message: 'This response_format type is unavailable now', code: 'unsupported_parameter', param: 'response_format.type', status: 400, effective_format: 'json_schema' };
    let notifications = 0;
    for (const ok of [true, false]) {
        const fetch = async () => ({ ok, status: ok ? 200 : 500, text: async () => JSON.stringify({ error: detail }), json: async () => ({ error: detail }) });
        const api = new Function('fetch', 'tryParseStreamingError', 'checkQuotaError', 'checkModerationError', 'toastr', patchOpenAI(openai) + '\nreturn {parameters,send};')(fetch, () => notifications++, () => notifications++, () => notifications++, { error: () => notifications++ });
        assert.equal((await api.parameters({ responseFormat: 'json_object' })).json_response_format, 'json_object');
        await assert.rejects(api.send({ responseFormat: 'json_schema' }), error => error.status === 400 && error.param === 'response_format.type' && error.effectiveFormat === 'json_schema');
        const service = new Function('fetch', patchCustomRequest(custom).replace('export class', 'class') + '\nreturn ChatCompletionService;')(fetch);
        await assert.rejects(service.send({ json_response_format: 'json_schema' }), error => error.status === 400 && error.code === 'unsupported_parameter');
    }
    assert.equal(notifications, 0);
});
