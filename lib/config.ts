import _ from 'lodash'
import { env } from 'process'

export default {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  port: _.toNumber(env.PORT!),
  line: {
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret: env.LINE_CHANNEL_SECRET!,
  },
  slack: {
    webhookUrl: new URL(env.SLACK_WEBHOOK_URL!),
  },
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}
