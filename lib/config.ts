import _ from 'lodash'
import { env } from 'process'

export default {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  port: _.toNumber(env.PORT!),
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}
