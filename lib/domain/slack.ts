const jsonMimeType = 'application/json'

export async function send<T extends Record<string, unknown>, R = unknown>(
  webhookUrl: URL,
  payload: T
): Promise<R> {
  const response = await fetch(webhookUrl.href, {
    method: 'POST',
    headers: {
      'Content-Type': jsonMimeType,
      Accept: jsonMimeType,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error()
  return response.json() as Promise<R>
}
