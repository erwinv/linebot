import { Middleware } from 'koa'

interface LineTextMessage {
  type: 'text'
  text: string
}

interface LineMessageEvent {
  type: 'message'
  message: LineTextMessage | Record<string, unknown>
}

type LineEvent = LineMessageEvent | Record<string, unknown>

interface LineWebhookPayload {
  events: LineEvent[]
}

export function line(): Middleware {
  return async (ctx) => {
    const payload = ctx.request.body as LineWebhookPayload
    console.table(payload.events)
    ctx.status = 200
  }
}
