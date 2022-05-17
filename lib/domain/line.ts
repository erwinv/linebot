import { Middleware as koaMiddleware } from 'koa'
import {
  middleware as expressMiddleware,
  WebhookRequestBody,
  Client,
} from '@line/bot-sdk'
import config from '../config'

const client = new Client(config.line)

interface LineGroupChatMessage {
  group: {
    name: string
    photo: string
  }
  sender: {
    name: string
    photo: string
  }
  text: string
}

export type LineGroupChatMessageHandler = (
  message: LineGroupChatMessage
) => Promise<unknown>

export async function handleIncomingWebhook(
  payload: WebhookRequestBody,
  groupChatMessageHandler: LineGroupChatMessageHandler
) {
  console.table(payload.events)

  const groupChatMessages = await Promise.all(
    payload.events
      .flatMap((event) => {
        if (
          event.type !== 'message' ||
          event.message.type !== 'text' ||
          event.source.type !== 'group'
        )
          return []

        return [
          {
            source: event.source,
            text: event.message.text,
          },
        ]
      })
      .map(async ({ source, text }) => {
        const groupProfile = await client.getGroupSummary(source.groupId)
        const senderProfile = source.userId
          ? await client.getGroupMemberProfile(source.groupId, source.userId)
          : null
        return {
          group: {
            name: groupProfile.groupName,
            photo: groupProfile.pictureUrl,
          },
          sender: {
            name: senderProfile?.displayName ?? 'Anonymous user',
            photo: senderProfile?.pictureUrl ?? '',
          },
          text,
        }
      })
  )

  await Promise.all(groupChatMessages.map(groupChatMessageHandler))
}

export const middleware = (): koaMiddleware => {
  const expressMid = expressMiddleware(config.line)

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
