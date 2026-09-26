import { getRequestHeaders } from '../../../../script.js';

const ROOT = '/api/plugins/scene-and-diary';
export async function serviceRequest(route, body, signal) {
    const response = await fetch(`${ROOT}${route}`, { method: body === undefined ? 'GET' : 'POST', headers: getRequestHeaders(), body: body === undefined ? undefined : JSON.stringify(body), signal });
    let data; try { data = await response.json(); } catch { data = {}; }
    if (!response.ok) { const error = new Error(data.error || `记忆服务 HTTP ${response.status}`); error.status = response.status; throw error; }
    return data;
}
export async function checkService() {
    const capabilities = await serviceRequest('/capabilities');
    if (capabilities.protocol !== 1) throw new Error(`记忆服务协议不兼容：需要 1，当前 ${capabilities.protocol}`);
    return capabilities;
}
