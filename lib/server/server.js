require('@ministryofjustice/module-alias/register')

const path = require('path')
const {
  createWriteStream,
  unlinkSync
} = require('fs')

const ensureDir = require('ensure-dir')
const stripAnsi = require('strip-ansi')
const debug = require('debug')

const runnerServer = require('@ministryofjustice/fb-runner-node/lib/server/server')
const adminRouter = require('~/fb-editor-node/lib/admin/admin')

const postCachedRoutes = () => adminRouter

function getWriteStream (streamPath) {
  const writeStream = createWriteStream(streamPath, { flags: 'a' })

  const {
    write
  } = writeStream

  writeStream.write = (value) => write.call(writeStream, stripAnsi(value))

  return writeStream
}

const log = debug('editor:server')

module.exports = {
  async start () {
    log('Editor is awake')

    if (process.env.LOGDIR) {
      const servicePath = process.env.SERVICE_PATH || process.env.SERVICEDATA
      const serviceName = servicePath.replace(/\/$/, '').replace(/.*\//, '')
      const logdir = process.env.LOGDIR

      await ensureDir(logdir)

      const outStreamPath = path.join(logdir, `${serviceName}.access.log`)
      const errStreamPath = path.join(logdir, `${serviceName}.error.log`)

      log(outStreamPath)
      log(errStreamPath)

      try {
        unlinkSync(outStreamPath)
      } catch (e) {
        const { code } = e
        if (code !== 'ENOENT') throw e
      }

      try {
        unlinkSync(errStreamPath)
      } catch (e) {
        const { code } = e
        if (code !== 'ENOENT') throw e
      }

      const outStream = getWriteStream(outStreamPath)
      const errStream = getWriteStream(errStreamPath)

      /*
       *  Bind console to `outStream` and `errStream`
       */
      global.console = new console.Console(outStream, errStream)

      /*
       *  Redirect `stdout` and `stderr`` to streams
       */
      process.__defineGetter__('stdout', () => outStream)
      process.__defineGetter__('stderr', () => errStream)
    }

    log('Editor is starting Runner')

    return runnerServer.start({
      postCachedRoutes
    })
  }
}
