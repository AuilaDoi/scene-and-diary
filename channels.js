import { TaskResponseError, parseResult, taskModules, taskMessages } from './tasks-v8.js';
import { redactJsonError } from './redact.js';
import { newId } from './core.js';

const CHANNEL_KEY = 'scene_diary_channels';
const PROXY = '/api/backends/chat-completions/';
export const blankChannel = () => ({ id: newId('channel'), name: '', url: '', key: '', model: '', temperature: 0.4, maxTokens: 4096 });

export function channels(context) {
    return context.extensionSettings?.[CHANNEL_KEY] || [];
}

export function saveChannels(context, values) {
    context.extensionSettings[CHANNEL_KEY] = values;
    context.saveSettingsDebounced();
}

function baseUrl(value) {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('请输入不含认证信息的 HTTP(S) API 地址。');
    let path = url.pathname.replace(/\/+$/, '').replace(/\/(?:chat\/completions|models)$/, '');
    if (!path) path = '/v1';
    return url.origin + path;
}

export function validatedChannel(value) {
    const url = baseUrl(value.url);
    if (!value.name.trim() || !value.model.trim()) throw new Error('请填写渠道名称和模型。');
    if (!Number.isFinite(value.temperature) || value.temperature < 0 || value.temperature > 2 || !Number.isInteger(value.maxTokens) || value.maxTokens < 1) throw new Error('请检查温度与最大输出 token。');
    return { ...value, url, name: value.name.trim(), model: value.model.trim(), key: value.key.trim() };
}

export async function proxyRequest(context, channel, endpoint, data, signal) {
    const includeHeaders = channel.key ? { Authorization: 'Bearer ' + channel.key } : {};
    const payload = {
        chat_completion_source: 'custom', custom_api_format: 'openai_compat', custom_url: baseUrl(channel.url),
        custom_include_headers: JSON.stringify(includeHeaders), ...data,
    };
    try {
        const response = await fetch(PROXY + endpoint, {
            method: 'POST', headers: context.getRequestHeaders(), signal, body: JSON.stringify(payload),
        });
        const raw = await response.text();
        let result;
        try { result = JSON.parse(raw); } catch { result = { message: raw }; }
        if (!response.ok || result?.error) {
            const detail = result.error || result;
            throw Object.assign(new Error(redactJsonError(detail.message || (typeof detail === 'string' ? detail : 'HTTP ' + response.status), [channel.key])), {
                bridgeStatus: response.status, providerStatus: detail.status || detail.status_code,
                providerCode: redactJsonError(detail.code || '', [channel.key]), param: detail.param,
            });
        }
        if (String(result?.id || '').startsWith('tauritavern-error-')) throw new Error('TauriTavern 代理未返回有效补全，请检查渠道或更新宿主。');
        return result;
    } catch (error) {
        signal?.throwIfAborted();
        error.message = redactJsonError(error.message, [channel.key]);
        throw error;
    }
}

export async function fetchModels(context, channel, signal) {
    const result = await proxyRequest(context, channel, 'status', {}, signal);
    const models = result?.data ?? result?.models;
    if (!Array.isArray(models)) throw new Error('代理未返回模型列表，可手动填写模型。');
    return [...new Set(models.map(model => typeof model === 'string' ? model : model?.id).filter(id => typeof id === 'string' && id.trim()))].sort();
}

export async function generateTask(context, channel, task, messages, signal) {
    const result = await proxyRequest(context, channel, 'generate', {
        model: channel.model, messages, stream: false, type: 'quiet', max_tokens: channel.maxTokens, temperature: channel.temperature,
    }, signal);
    const choice = result?.choices?.[0];
    if (choice?.message?.refusal || choice?.finish_reason === 'content_filter') throw new Error('模型拒绝生成该内容。');
    const content = choice?.message?.content;
    if (choice?.finish_reason === 'length') {
        throw new TaskResponseError('模型输出被截断，请调整渠道最大输出 token 后重试。', content);
    }
    if (typeof content !== 'string') throw new Error('渠道未返回文本。');
    return parseResult(task, content);
}
export function testChannel(context, channel, signal) {
    const modules = taskModules('test', { prompts: { test: { system: '渠道连通性测试。', description: '按规定格式确认连接。' } } }, {}, '', '');
    return generateTask(context, validatedChannel(channel), 'test', taskMessages(modules), signal);
}
