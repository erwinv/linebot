import { Middleware } from 'koa'
import { handleIncomingWebhook as lineIncomingWebhook } from '../domain/line'
import { send as sendToSlackWebhook } from '../domain/slack'

export function line(): Middleware {
  return async (ctx) => {
    try {
      await lineIncomingWebhook(ctx.request.body, sendToSlackWebhook)
      ctx.status = 200
    } catch {
      ctx.status = 500
    }
  }
}
