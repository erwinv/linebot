import { Middleware as koaMiddleware } from 'koa'
import {
  middleware as expressMiddleware,
  MiddlewareConfig,
} from '@line/bot-sdk'

export const middleware = (config: MiddlewareConfig): koaMiddleware => {
  const expressMid = expressMiddleware(config)

  return async (ctx, next) => {
    try {
      const req = Object.assign({}, ctx.req, { body: ctx.request.body })

      await new Promise<void>((resolve, reject) => {
        expressMid(req, ctx.res, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      return next()
    } catch (err) {
      ctx.status = 400
    }
  }
}
