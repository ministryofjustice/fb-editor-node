require('@ministryofjustice/module-alias/register')

const glob = require('glob-all')

const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true })

const router = require('express').Router()

const cloneDeep = require('lodash.clonedeep')

const route = require('@ministryofjustice/fb-runner-node/lib/route/route')

const {
  getPagesMethods
} = route

const {
  processInput,
  validateInput,
  setFormContent,
  formatProperties,
  updateControlNames,
  setDefaultValues,
  skipComponents,
  kludgeUpdates,
  setService
} = require('@ministryofjustice/fb-runner-node/lib/page/page')

const {
  renderPage
} = require('@ministryofjustice/fb-runner-node/lib/middleware/routes-metadata/routes-metadata')

const userData = require('@ministryofjustice/fb-runner-node/lib/middleware/user-data/user-data')

const {
  getServiceSchemas
} = require('~/fb-editor-node/lib/service-data/service-data')

const pageInstances = glob.sync('./route/**/*/*.json', { cwd: './lib/admin' })
  .map((filePath) => require(filePath))

const pageInstancesRouteMap = {}
const controllersRouteMap = {}

const EDIT_MODE = /(.*)\/(instance|flow|edit|preview)$/

let PAGES_METHODS
let SERVICE_SCHEMAS

const getRedirectUrl = ({ baseUrl = '' } = {}, url = '/') => baseUrl.concat(url)

function createPostRedirect (res, req, url, next) {
  return {
    redirect: (url) => {
      res.redirect(url)
    },
    success: () => {
      res.redirect(getRedirectUrl(req, url))
    },
    failure: (pageInstance, pageData) => {
      renderAdminPage(res, req, next, pageInstance, pageData)
    }
  }
}

function populateServiceSchemas () {
  Object.entries(SERVICE_SCHEMAS = getServiceSchemas())
    .forEach(([schemaName, schema]) => {
      ajv.addSchema(schema, schemaName)
    })
}

async function pageHandler (req, res, next) {
  if (req.baseUrl !== '/admin') {
    return next()
  }

  if (!SERVICE_SCHEMAS) populateServiceSchemas()

  const url = req._parsedUrl.pathname

  const handlerData = PAGES_METHODS.getData(url)

  if (!handlerData) {
    return next()
  } else {
    const {
      route
    } = handlerData

    Object.assign(req.params, handlerData.params)

    let pageInstance = cloneDeep(pageInstancesRouteMap[route])

    pageInstance._form = true

    const POST = req.method === 'POST'
    const REFERRER = (req.get('referrer') || '').replace(/.*\/\/.*?\//, '/')

    const bodyInput = { ...req.body }
    const input = { ...bodyInput, ...req.params }
    const pageData = userData.getUserDataMethods({ input, count: {} })

    pageData.setBodyInput(bodyInput)
    pageData.body = pageData.getBodyInput() || {}
    pageData.pagesMethods = PAGES_METHODS
    pageData.nunjucks = res.nunjucksAppEnv

    const controller = controllersRouteMap[route]

    if (controller.setData) { // assume async
      pageInstance = await controller.setData(pageInstance, pageData, POST, REFERRER)

      if (pageInstance.redirect) {
        return res.redirect(pageInstance.redirect)
      }
    }

    if (pageInstance.skipSkipComponents !== true) {
      pageInstance = skipComponents(pageInstance, pageData)
    }

    if (POST) { // handle inbound values
      pageInstance = processInput(pageInstance, pageData)

      if (pageInstance.skipValidation !== true) {
        pageInstance = validateInput(pageInstance, pageData)
      }
    }

    if (controller.validate) { // assume async
      pageInstance = await controller.validate(pageInstance, pageData, POST, ajv)
    }

    if (POST || pageInstance.executePostValidation) {
      if (!pageInstance.errorList) {
        if (controller.postValidation) {
          return controller.postValidation(pageInstance, pageData, createPostRedirect(res, req, url, next))
        }
      } else {
        if (controller.postValidationFailure) {
          return controller.postValidationFailure(pageInstance, pageData, createPostRedirect(res, req, url, next))
        }
      }
    }

    renderAdminPage(res, req, next, pageInstance, pageData)
  }
}

function renderAdminPage (res, req, next, pageInstance, pageData) {
  pageInstance = setFormContent(pageInstance, pageData)
  pageInstance = setService(pageInstance, pageData)
  pageInstance = setDefaultValues(pageInstance, pageData)
  pageInstance = updateControlNames(pageInstance, pageData)
  pageInstance = formatProperties(pageInstance, pageData)
  pageInstance = kludgeUpdates(pageInstance, pageData)

  // render with Nunjucks
  renderPage(res, pageInstance, { req }, next)
}

pageInstances.forEach((pageInstance) => {
  const {
    _id: route
  } = pageInstance

  pageInstancesRouteMap[route] = pageInstance
  try {
    controllersRouteMap[route] = require(`./route/${route}/${route}.controller`)
  } catch (e) {
    controllersRouteMap[route] = {}
  }
})

/*
 *  There's no point in declaring this a function if we're only going to execute it here
 *  -- but then there's no point in keeping some of these variables around, either
 */
{
  const routeMap = cloneDeep(pageInstancesRouteMap)

  Object.entries(routeMap)
    .forEach(([routeKey, { _type }]) => {
      if (!_type.startsWith('page.')) {
        delete routeMap[routeKey]
      }
    })

  PAGES_METHODS = route.init(routeMap, '/admin')
}

router.use(pageHandler)
router.use('/admin', router)
router.use(({ _parsedUrl: { pathname = '' } = {} }, res, next) => {
  const [
    match,
    matchUrl = '/',
    editmode
  ] = pathname.match(EDIT_MODE) || []

  if (match) {
    const pagesMethods = getPagesMethods()
    const matchData = pagesMethods.getData(matchUrl)
    if (matchData) {
      if (editmode === 'instance') {
        const {
          route: _id
        } = matchData

        const url = PAGES_METHODS.getUrl('admin.instance', { _id })

        return res.redirect(url)
      }

      if (editmode === 'flow') {
        const {
          route: _id
        } = matchData

        const url = PAGES_METHODS.getUrl('admin.flow', { _id })

        return res.redirect(url)
      }
    }
  }

  next()
})

module.exports = router
