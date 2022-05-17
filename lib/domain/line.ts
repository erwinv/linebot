import { Middleware as koaMiddleware } from 'koa'
import {
  middleware as expressMiddleware,
  MiddlewareConfig,
  MessageEvent,
  TextEventMessage,
  WebhookRequestBody,
} from '@line/bot-sdk'

export type LineTextMessageHandler = (textMessage: string) => Promise<unknown>

export async function handleIncomingWebhook(
  payload: WebhookRequestBody,
  textMessageHandler: LineTextMessageHandler
) {
  console.info(payload.destination)
  console.table(payload.events)

  await Promise.all(
    payload.events
      .filter((event): event is MessageEvent => event.type === 'message')
      .map((event) => event.message)
      .filter((message): message is TextEventMessage => message.type === 'text')
      .map((message) => message.text)
      .map(textMessageHandler)
  )
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
