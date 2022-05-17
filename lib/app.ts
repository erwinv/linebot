import Koa from 'koa'
import Router from '@koa/router'
import bodyparser from 'koa-bodyparser'

export default function app() {
  const app = new Koa()
  const router = new Router()
  app.use(bodyparser())

  router.get('/ping', async (ctx) => {
    ctx.body = 'pong'
  })

  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
