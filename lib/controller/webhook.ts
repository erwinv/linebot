import { Middleware } from 'koa'
import { handleIncomingWebhook as lineIncomingWebhook } from '../domain/line'
import { send as sendToSlackWebhook } from '../domain/slack'

export function line(): Middleware {
  return async (ctx) => {
    try {
      await lineIncomingWebhook(ctx.request.body, ({ group, sender, text }) => {
        const textFmt = text
          .split(/\n*```\n*/)
          .map((block, i) =>
            i % 2 === 0
              ? block
                  .split('\n')
                  .map((line) => `>${line}`)
                  .join('\n')
              : '\n>\n>```' + block + '```\n>\n'
          )
          .join('')

        return sendToSlackWebhook({
          blocks: [
            {
              type: 'context',
              elements: [
                {
                  type: 'image',
                  image_url: sender.photo,
                  alt_text: sender.name,
                },
                {
                  type: 'mrkdwn',
                  text: `*${sender.name}* sent in _*${group.name}*_:`,
                },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: textFmt,
              },
              accessory: {
                type: 'image',
                image_url: group.photo,
                alt_text: group.name,
              },
            },
          ],
        })
      })
      ctx.status = 200
    } catch {
      ctx.status = 500
    }
  }
}
