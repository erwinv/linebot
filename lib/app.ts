import Koa from 'koa'
import Router from '@koa/router'
import bodyparser from 'koa-bodyparser'
import config from './config'
import { middleware as lineMiddleware } from './domain/line'
import * as hooks from './controller/webhook'

export default function app() {
  const app = new Koa()
  const router = new Router()
  app.use(bodyparser())

  router.post('/webhook', lineMiddleware(config.line), hooks.line())

  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
