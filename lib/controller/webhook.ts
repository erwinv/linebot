import { Middleware } from 'koa'
import { handleIncomingWebhook as lineIncomingWebhook } from '../domain/line'
import { send as sendToSlackWebhook } from '../domain/slack'

export function line(): Middleware {
  return async (ctx) => {
    try {
      await lineIncomingWebhook(ctx.request.body, ({ group, sender, text }) =>
        sendToSlackWebhook({
          blocks: [
            {
              type: 'context',
              elements: [
                {
                  type: 'image',
                  image_url: group.photo,
                  alt_text: group.name,
                },
                {
                  type: 'image',
                  image_url: sender.photo,
                  alt_text: sender.name,
                },
                {
                  type: 'mrkdwn',
                  text: `In _${group.name}_, *${sender.name}* sent:`,
                },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text,
              },
            },
          ],
        })
      )
      ctx.status = 200
    } catch {
      ctx.status = 500
    }
  }
}
