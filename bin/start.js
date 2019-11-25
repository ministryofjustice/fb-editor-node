const path = require('path')
const init = require('@ministryofjustice/module-alias')

const APP_DIR = path.resolve(__dirname, '..')

init(APP_DIR)

process.env.APP_DIR = APP_DIR

const start = async () => {
  try {
    const server = require('~/fb-editor-node/server/server')
    await server.start()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    process.exit(1)
  }
}

module.exports = start()
