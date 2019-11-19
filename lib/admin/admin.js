require('module-alias/register')

const Ajv = require('ajv')
const ajv = new Ajv({allErrors: true})

const router = require('express').Router()

const {deepClone, FBLogger} = require('@ministryofjustice/fb-utils-node')
FBLogger.verbose(true)

const {getPagesMethods} = require('@ministryofjustice/fb-runner-node/lib/route/route')

// TODO: load admin pages implicitly
const adminPages = [
  'admin.main',
  'admin.category',
  'admin.type',
  'admin.instance',
  'admin.instance.property',
  'admin.instance.validation',
  'admin.instance.create.location',
  'admin.instance.create.type',
  'admin.instance.create.id',
  'admin.instance.delete',
  'admin.flow'
]

const pageInstances = adminPages.map(_id => require(`./route/${_id}/${_id}.json`))

const adminData = {}
const controllers = {}

pageInstances.forEach(pageInstance => {
  const route = pageInstance._id
  adminData[route] = pageInstance
  try {
    const controller = require(`./route/${route}/${route}.controller`)
    controllers[route] = controller
  } catch (e) {
    controllers[route] = {}
    FBLogger(`Failed to register controller for ${route}`)
  }
})

const route = require('@ministryofjustice/fb-runner-node/lib/route/route')
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

const {renderPage} = require('@ministryofjustice/fb-runner-node/lib/middleware/routes-metadata/routes-metadata')
const userData = require('@ministryofjustice/fb-runner-node/lib/middleware/user-data/user-data')

const serviceData = require('~/fb-editor-node/service-data/service-data')
const {getServiceSchemas} = serviceData

let pagesMethods
let schemas

const initRoutes = () => {
  // Only handle actual routes
  // TODO: remove them based on actual pageness rather than relying on _type
  const pages = deepClone(adminData)
  Object.keys(pages).forEach(potentialPage => {
    if (!pages[potentialPage]._type.startsWith('page.')) {
      delete pages[potentialPage]
    }
  })

  // initialise route url matching and creation methods
  pagesMethods = route.init(pages, '/admin')
}

const adminRouter = () => {
  initRoutes()
  router.use(pageHandler)
  return router
}

const pageHandler = (req, res, next) => {
  if (req.baseUrl !== '/admin') {
    return next()
  }
  if (!schemas) {
    schemas = getServiceSchemas()

    Object.keys(schemas).forEach(schemaName => {
      ajv.addSchema(schemas[schemaName], schemaName)
    })
  }

  const url = req._parsedUrl.pathname

  const handlerData = pagesMethods.getData(url)

  if (!handlerData) {
    return next()
  } else {
    Object.assign(req.params, handlerData.params)
    const route = handlerData.route

    let pageInstance = deepClone(adminData[route])
    pageInstance._form = true

    const POST = req.method === 'POST'
    const REFERRER = (req.get('referrer') || '').replace(/.*\/\/.*?\//, '/')

    const input = Object.assign({}, req.body, req.params)

    const pageData = userData.getUserDataMethods({input, count: {}})
    pageData.setBodyInput(req.body)
    const body = pageData.getBodyInput()
    pageData.body = body || {}

    pageData.pagesMethods = pagesMethods

    pageData.nunjucks = res.nunjucksAppEnv

    const routeController = controllers[route]

    // now specific stuff
    if (routeController.setData) {
      pageInstance = routeController.setData(pageInstance, pageData, POST, REFERRER)
      if (pageInstance.redirect) {
        return res.redirect(pageInstance.redirect)
      }
    }

    if (pageInstance.skipSkipComponents !== true) {
      pageInstance = skipComponents(pageInstance, pageData)
    }

    if (POST) {
      // handle inbound values
      pageInstance = processInput(pageInstance, pageData)
    }

    if (POST || !POST) {
      // validate inbound values
      // TODO: Sort out whether this should run automagicakally
      // run it as part of the custom validation?
      // also component level validation
      if (POST) {
        if (pageInstance.skipValidation !== true) {
          pageInstance = validateInput(pageInstance, pageData)
        }
      }

      if (routeController.validate) {
        pageInstance = routeController.validate(pageInstance, pageData, POST, ajv)
      }

      const postRedirect = {
        redirect: (url) => {
          res.redirect(url)
        },
        success: () => {
          res.redirect(`${req.baseUrl ? req.baseUrl : ''}${url}`)
        },
        failure: (pageInstance, pageData) => {
          renderAdminPage(res, req, next, pageInstance, pageData)
        }
      }

      if (POST || pageInstance.executePostValidation) {
        if (!pageInstance.errorList) {
          if (routeController.postValidation) {
            return routeController.postValidation(pageInstance, pageData, postRedirect)
          }
        } else {
          if (routeController.postValidationFailure) {
            return routeController.postValidationFailure(pageInstance, pageData, postRedirect)
          }
        }
      }
    }

    renderAdminPage(res, req, next, pageInstance, pageData)
  }
}

const renderAdminPage = (res, req, next, pageInstance, pageData) => {
  pageInstance = setFormContent(pageInstance, pageData)
  pageInstance = setService(pageInstance, pageData)
  pageInstance = setDefaultValues(pageInstance, pageData)
  pageInstance = updateControlNames(pageInstance, pageData)
  pageInstance = formatProperties(pageInstance, pageData)
  pageInstance = kludgeUpdates(pageInstance, pageData)

  // render with Nunjucks
  renderPage(res, pageInstance, {req}, next)
}

// set default value for "user input"
// convenience function to retrieve instance node / set instance node / set instance property

router.use('/admin', adminRouter())

// pagesMethods
const editModeRegex = /(.*)\/(instance|flow|edit|preview)$/
router.use((req, res, next) => {
  let editmode
  const metadataMethods = getPagesMethods()
  const match = req._parsedUrl.pathname.match(editModeRegex)
  if (match) {
    const matchUrl = match[1] || '/'
    editmode = match[2]
    const matchData = metadataMethods.getData(matchUrl)
    if (matchData) {
      let redirectUrl
      if (editmode === 'instance') {
        redirectUrl = pagesMethods.getUrl('admin.instance', {_id: matchData.route})
      }
      if (editmode === 'flow') {
        redirectUrl = pagesMethods.getUrl('admin.flow', {_id: matchData.route})
      }
      if (redirectUrl) {
        return res.redirect(redirectUrl)
      }
    }
  }
  next()
})

module.exports = router
