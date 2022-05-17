import 'dotenv-safe/config'
import app from '../lib/app'
import config from '../lib/config'

app().listen(config.port)
