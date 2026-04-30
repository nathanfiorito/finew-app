const baseUrl: string = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${String(response.status)} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
