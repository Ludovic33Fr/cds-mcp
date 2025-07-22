// src/http.ts
import fetch from 'node-fetch';
export async function doRequest(url, options) {
    const res = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body || undefined
    });
    return {
        statusCode: res.status,
        body: res
    };
}
