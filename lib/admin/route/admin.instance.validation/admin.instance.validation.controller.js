require('module-alias/register')

const instanceController = require('~/fb-editor-node/admin/route/admin.instance/admin.instance.controller')

const instanceValidationController = Object.assign({}, instanceController)

module.exports = instanceValidationController
