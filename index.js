require('module-alias')(__dirname)

const server = require('~/fb-editor-node/server/server')

module.exports = server.start()
