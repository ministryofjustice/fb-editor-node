require('@ministryofjustice/module-alias/register')

const server = require('~/fb-editor-node/lib/server/server')

module.exports = server.start()
