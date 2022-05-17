import { Middleware } from 'koa'
import { handleIncomingWebhook as lineIncomingWebhook } from '../domain/line'

export function line(): Middleware {
  return async (ctx) => {
    try {
      await lineIncomingWebhook(ctx.request.body)
      ctx.status = 200
    } catch {
      ctx.status = 500
    }
  }
}
