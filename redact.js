export function redactJsonError(value, secrets = []) {
    let text = String(value ?? '');
    for (const secret of secrets.filter(item => typeof item === 'string' && item.length)) text = text.split(secret).join('[已隐藏]');
    return text.replace(/https?:\/\/[^\s"'<>]+/gi, '[地址已隐藏]')
        .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[已隐藏]')
        .replace(/\bBearer\s+[^\s,"'}]+/gi, 'Bearer [已隐藏]')
        .replace(/((?:api[_-]?key|authorization|proxy_password|password|secret|token)\s*["']?\s*[:=]\s*)["']?[^\s,"'}]+/gi, '$1[已隐藏]')
        .slice(0, 600);
}
