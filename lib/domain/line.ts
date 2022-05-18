import _ from 'lodash'
import { Middleware as koaMiddleware } from 'koa'
import {
  middleware as expressMiddleware,
  WebhookRequestBody,
  Client,
} from '@line/bot-sdk'
import config from '../config'

const client = new Client(config.line)

const getGroupSummary = _.memoize((groupId: string) => {
  _.delay(() => {
    getGroupSummary.cache.delete(groupId)
  }, 24 * 60 * 60 * 1000)
  return client.getGroupSummary(groupId)
})

const getGroupMemberProfileCacheKey = (groupId: string, userId: string) =>
  `${groupId}:${userId}`
const getGroupMemberProfile = _.memoize((groupId: string, userId: string) => {
  _.delay(() => {
    getGroupMemberProfile.cache.delete(
      getGroupMemberProfileCacheKey(groupId, userId)
    )
  }, 1 * 60 * 60 * 1000)
  return client.getGroupMemberProfile(groupId, userId)
}, getGroupMemberProfileCacheKey)

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
  const groupChatMessages = await Promise.all(
    payload.events
      .flatMap((event) => {
        if (
          event.type !== 'message' ||
          event.message.type !== 'text' ||
          event.source.type !== 'group'
        )
          return []

        console.info(event.message.text)
        if (event.message.emojis) console.table(event.message.emojis)
        if (event.message.mention)
          console.table(event.message.mention.mentionees)

        return [
          {
            source: event.source,
            text: event.message.text,
          },
        ]
      })
      .map(async ({ source, text }) => {
        const groupProfile = await getGroupSummary(source.groupId)
        const senderProfile = source.userId
          ? await getGroupMemberProfile(source.groupId, source.userId)
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
