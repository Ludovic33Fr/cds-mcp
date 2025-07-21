// src/http.ts
export async function doRequest(url: string, options: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  return {
    statusCode: res.status,
    body: res
  };
}
