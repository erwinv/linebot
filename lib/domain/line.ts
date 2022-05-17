import { Middleware as koaMiddleware } from 'koa'
import {
  middleware as expressMiddleware,
  MiddlewareConfig,
} from '@line/bot-sdk'

interface TextMessage {
  type: 'text'
  text: string
}

interface MessageEvent {
  type: 'message'
  message: TextMessage | Record<string, unknown>
}

type Event = MessageEvent | Record<string, unknown>

interface WebhookPayload {
  destination: string
  events: Event[]
}

export async function handleIncomingWebhook(payload: WebhookPayload) {
  console.info(payload.destination)
  console.table(payload.events)
  // TODO format message and forward to slack
}

export const middleware = (config: MiddlewareConfig): koaMiddleware => {
  const expressMid = expressMiddleware(config)

  return async (ctx, next) => {
    try {
      const req = Object.assign(
        {},
        ctx.req,
        { headers: ctx.headers },
        { body: ctx.request.rawBody }
      )

      await new Promise<void>((resolve, reject) => {
        expressMid(req, ctx.res, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      return next()
    } catch (err) {
      console.error(err)
      ctx.status = 400
    }
  }
}
