import _ from 'lodash'
import { KnownBlock } from '@slack/types'
import config from '../config'

type Payload = {
  text?: string
  blocks?: KnownBlock[]
}

export async function send(message: string | Payload) {
  const payload = _.isString(message) ? { text: message } : message

  const response = await fetch(config.slack.webhookUrl.href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/string',
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error()

  return {
    text: await response.text(),
  }
}
