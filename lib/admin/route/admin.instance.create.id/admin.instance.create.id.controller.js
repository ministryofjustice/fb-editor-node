require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')
const jsonschema = require('jsonschema')
const validator = new jsonschema.Validator()

const {
  getEntryPointInstances,
  getServiceInstances,
  createInstance,
  getInstance,
  getDiscreteInstance,
  getInstanceTitle,
  getServiceSchema,
  getInstancesByType,
  getSourceInstanceProperty,
  getInstanceIdByPropertyValue,
  setInstanceProperty,
  loadServiceData
} = require('~/fb-editor-node/service-data/service-data')

const userData = require('@ministryofjustice/fb-runner-node/lib/middleware/user-data/user-data')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/admin/common')

const {
  getUrlMatch,
  isMOJUploadComponent,
  isMOJUploadSummaryPage,
  isMOJUploadConfirmationPage
} = require('~/fb-editor-node/admin/common/components/moj-upload')

function createMOJUploadSummaryPage (step, url) {
  const urlMatch = getUrlMatch(url)

  const bodyInput = {
    idSeedValue: `${urlMatch}-summary`
  }

  return async function createMOJUploadSummaryPageForStep (pageInstance) {
    const {
      _id: pageInstanceId,
      steps = []
    } = pageInstance

    if (steps.includes(step)) {
      const uploadIndex = steps.findIndex((s) => s === step)
      const uploadSummaryIndex = uploadIndex + 1
      const id = steps[uploadSummaryIndex]

      let pageData
      if (id) {
        if (!isMOJUploadSummaryPage(getInstance(id))) {
          /*
           *  There's a page at this position and it's not an upload summary,
           *  so insert one
           */
          const input = {
            ...bodyInput,
            _type: 'page.mojUploadSummary',
            addId: pageInstanceId,
            addProperty: 'steps',
            insertAt: uploadSummaryIndex
          }

          pageData = userData.getUserDataMethods({input, count: {}})
        }
      } else {
        /*
         *  There's no page at this position,
         *  so create one
         */
        const input = {
          ...bodyInput,
          _type: 'page.mojUploadSummary',
          addId: pageInstanceId,
          addProperty: 'steps',
          operation: 'edit'
        }

        pageData = userData.getUserDataMethods({input, count: {}})
      }

      if (pageData) {
        pageData.setBodyInput(bodyInput)
        pageData.body = pageData.getBodyInput()

        await setData(pageInstance, pageData)
        await validate(pageInstance, pageData, true)
        await postValidation(pageInstance, pageData)
      }
    }
  }
}

function createMOJUploadConfirmationPage (step, url) {
  const urlMatch = getUrlMatch(url)

  const bodyInput = {
    idSeedValue: `${urlMatch}-confirmation`
  }

  return async function createMOJUploadConfirmationPageForStep (pageInstance) {
    const {
      _id: pageInstanceId,
      steps = []
    } = pageInstance

    if (steps.includes(step)) {
      const uploadIndex = steps.findIndex((s) => s === step)
      const uploadConfirmationIndex = uploadIndex + 2
      const id = steps[uploadConfirmationIndex]

      let pageData
      if (id) {
        if (!isMOJUploadConfirmationPage(getInstance(id))) {
          /*
           *  There's a page at this position and it's not an upload confirmation,
           *  so insert one
           */
          const input = {
            ...bodyInput,
            _type: 'page.mojUploadConfirmation',
            addId: pageInstanceId,
            addProperty: 'steps',
            insertAt: uploadConfirmationIndex
          }

          pageData = userData.getUserDataMethods({input, count: {}})
        }
      } else {
        /*
         *  There's no page at this position,
         *  so create one
         */
        const input = {
          ...bodyInput,
          _type: 'page.mojUploadConfirmation',
          addId: pageInstanceId,
          addProperty: 'steps',
          operation: 'edit'
        }

        pageData = userData.getUserDataMethods({input, count: {}})
      }

      if (pageData) {
        pageData.setBodyInput(bodyInput)
        pageData.body = pageData.getBodyInput()

        await setData(pageInstance, pageData)
        await validate(pageInstance, pageData, true)
        await postValidation(pageInstance, pageData)
      }
    }
  }
}

async function resolveMOJUploadComponent ({_id, url} = {url: '/mojUpload'}, {maxFiles = 1}) {
  const entryPointInstances = getEntryPointInstances()
    .filter(({_type}) => _type !== 'page.error')

  await Promise.all(entryPointInstances.map(createMOJUploadSummaryPage(_id, url)))
  if (maxFiles > 1) await Promise.all(entryPointInstances.map(createMOJUploadConfirmationPage(_id, url)))
}

function getPostRedirectUrl ({addProperty, addId, redirectView, _id, _type, pageData}) {
  let redirectUrl
  let redirectId

  if (addProperty === 'conditionalComponent') {
    redirectView = 'edit'
  }

  const getUrl = getUrlFromPageData(pageData)

  switch (redirectView) {
    case 'view':
      redirectUrl = getUrl('admin.flow', {})
      break
    case 'edit':
      redirectId = _type.startsWith('page.') ? _id : addId
      break
    default:
      redirectUrl = getUrl('admin.instance', {_id})
      break
  }

  if (redirectId) {
    const redirectInstance = getDiscreteInstance(redirectId)
    if (redirectInstance._type === 'page.singlequestion' && !redirectInstance.components) {
      redirectUrl = getUrl('admin.instance.create.type', {
        addId: redirectId,
        addProperty: 'components',
        operation: 'edit'
      })
    } else {
      redirectUrl = `${redirectInstance.url}/edit`.replace(/^\/\//, '/')
    }
  }

  return redirectUrl
}

function updateInstanceProperty ({addId, addProperty, _id, operation, pageData}) {
  const {
    $source
  } = getInstance(addId)

  const steps = getSourceInstanceProperty(addId, addProperty, $source, [])

  const {
    insertAt,
    removeFrom
  } = pageData.getUserData()

  if (!isNaN(insertAt)) {
    steps.splice(insertAt, 0, _id)
  } else if (!isNaN(removeFrom)) {
    steps.splice(removeFrom, 1)
  } else {
    const method = operation || 'push'
    steps[method](_id)
  }

  return setInstanceProperty(addId, addProperty, steps)
}

function setData (pageInstance, pageData) {
  /*
   *  If we are populating the data for a page, the user data property
   *  `addId` will be undefined (and default to an empty string)
   *
   *  If we are populating the data for a component, the user data property
   *  `addId` will be the page id
   */
  const addId = pageData.getUserDataProperty('addId') || ''

  /*
   *  If we are populating the data for a page, the user data property
   *  `addProperty` will be undefined (and default to an empty string)
   *
   *  If we are populating the data for a component, the user data property
   *  `addProperty` will have the value 'components'
   */
  const addProperty = pageData.getUserDataProperty('addProperty') || ''

  // `_id` is resolved below

  /*
   *  The schema type for the page or component
   */
  const _type = pageData.getUserDataProperty('_type') || ''

  /*
   *  The schema for the type
   */
  const schema = getServiceSchema(_type)

  /*
   *  If we are populating the data for a page, the user data property
   *  `idSeed` will have the value 'url'
   *
   *  If we are populating the data for a component, the user data property
   *  `idSeed` will have the value 'name'
   */
  const {
    idSeed
  } = schema

  const isPage = _type.startsWith('page.')

  if (idSeed === 'name' || idSeed === 'value') {
    let propertySeed = `auto_${idSeed}__1`
    let propertySeedCheck = true

    while (propertySeedCheck) {
      if (getInstanceIdByPropertyValue(idSeed, propertySeed)) {
        propertySeed = propertySeed.replace(/_(\d+)$/, (m, n) => '_'.concat(n * 1 + 1))
      } else {
        propertySeedCheck = false
      }
    }

    pageData.setUserDataProperty('idSeedValue', propertySeed)
    pageInstance.executePostValidation = true
  }

  pageData.setUserDataProperty('idSeed', idSeed)

  if (idSeed) {
    const {
      properties: {
        [idSeed]: {
          title,
          description
        }
      }
    } = schema

    pageData.setUserDataProperty('idSeedLabel', title)
    pageData.setUserDataProperty('idSeedHint', description)
  }

  const pagePrefix = isPage ? 'page.' : ''

  const idPrefixType = !pagePrefix && addId ? 'auto' : 'stub'

  pageData.setUserDataProperty('idPrefixType', idPrefixType)

  let idPrefix = pagePrefix || (addId ? `${addId}--${_type}` : '')

  const idSeedValue = pageData.getUserDataProperty('idSeedValue')

  if (idSeedValue) {
    if (idPrefix) idPrefix += '.'
    idPrefix += idSeedValue.replace(/\s/g, '-').replace(/\s*\/\s*/, '_')
    idPrefix = idPrefix.replace(/\.\./, '.').replace(/\//g, '')
  }

  while (getInstance(idPrefix)) {
    if (idPrefix.match(/--\d+$/)) {
      idPrefix = idPrefix.replace(/--(\d+)$/, (m, n) => '--'.concat(n * 1 + 1))
    } else {
      idPrefix += '--2'
    }
  }

  if (isPage) {
    if (addProperty === 'steps') {
      const serviceInstances = getServiceInstances()
      const existingIds = getInstancesByType(_type)
        .filter(_id => !jsonPath.query(serviceInstances, `$..[?(@.steps && @.steps.includes("${_id}"))]`).length)

      if (existingIds.length) {
        pageData.setUserDataProperty('existingIds', true)

        const [
          existingRadios
        ] = jsonPath.query(pageInstance, '$..[?(@._id == "admin.instance.create.id--existing--radios")]')

        if (existingRadios) {
          existingRadios.items = existingIds.map((_id, index) => ({
            _id: `admin.instance.create.id--existing--radios--${index}`,
            _type: 'radio',
            value: _id,
            label: getInstanceTitle(_id)
          }))
        }
      }
    }
  }

  const _id = pageData.getUserDataProperty('existingId') || pageData.getUserDataProperty('_id') || idPrefix
  pageData.setUserDataProperty('_id', _id)

  const instanceTypeTitle = schema.title || _type
  pageData.setUserDataProperty('instanceTypeTitle', instanceTypeTitle)

  const instanceCategory = isPage ? 'page' : 'component'
  pageData.setUserDataProperty('instanceCategory', instanceCategory)

  return pageInstance
}

function validate (pageInstance, pageData, isPost) {
  const instanceErrors = []
  const addError = initAddError(instanceErrors)

  const existingId = pageData.getUserDataProperty('existingId')
  const _id = pageData.getUserDataProperty('_id') || existingId

  const idSeed = pageData.getUserDataProperty('idSeed')

  if (isPost) {
    if (idSeed) {
      if (!pageData.getUserDataProperty('idSeedValue')) {
        addError('required', 'idSeedValue')
      } else {
        const idSeedLabel = pageData.getUserDataProperty('idSeedLabel')
        const idSeedValue = pageData.getUserDataProperty('idSeedValue')
        const _type = pageData.getUserDataProperty('_type')

        const {
          properties: {
            [idSeed]: property
          } = {}
        } = getServiceSchema(_type)

        const {
          errors: [
            error
          ] = []
        } = validator.validate(idSeedValue, property)

        if (error) {
          error.values = {
            idSeedLabel,
            idSeedValue,
            control: idSeedLabel,
            pattern: 'no spaces'
          }

          addError(error.name, 'idSeedValue', error)
        }
      }
    } else {
      if (_id) {
        const serviceInstances = getServiceInstances()
        const matches = jsonPath.query(serviceInstances, `$..[?(@._id === "${_id}")]`)

        if (matches.length && !existingId) {
          addError('_id.duplicate', '_id')
        } else if (existingId && !matches.length) {
          addError('_id.missing', '_id')
        }

        if (_id.match(/^(page|component)\.$/)) {
          addError('_id.stub.incomplete', '_id')
        }
      }
    }
  }

  if (instanceErrors.length) {
    pageInstance = setErrors(pageInstance, instanceErrors)
  } else if (!idSeed) {
    pageInstance.executePostValidation = true
  }

  return pageInstance
}

async function postValidation (pageInstance, pageData, postRedirect) {
  const {
    existingId,
    _id = existingId,
    _type,
    addId,
    addProperty
  } = pageData.getUserData()

  let {
    operation
  } = pageData.getUserData()

  let redirectView
  if (operation && operation.match(/^(edit|flow)$/)) {
    redirectView = operation
    operation = undefined
  }

  const instanceProperties = {
    _id,
    _type
  }

  const idSeed = pageData.getUserDataProperty('idSeed')

  if (idSeed) {
    instanceProperties[idSeed] = pageData.getUserDataProperty('idSeedValue')
  }

  const addOptions = addProperty !== 'steps'
    ? {
      _id: addId,
      property: addProperty,
      operation
    }
    : {}

  const resolveCreateInstance = existingId ? () => Promise.resolve() : createInstance

  await resolveCreateInstance(instanceProperties, addOptions)

  if (addProperty === 'steps') await updateInstanceProperty({addId, addProperty, _id, operation, pageData})

  await loadServiceData()

  /*
   *  Specific to MOJ component
   */
  if (isMOJUploadComponent(getInstance(_id))) await resolveMOJUploadComponent(getDiscreteInstance(_id), getInstance(_id))

  /*
   *  Either a conditional return, or implicit (at the end of the function)
   */
  if (postRedirect) return postRedirect.redirect(getPostRedirectUrl({addProperty, addId, redirectView, _id, _type, pageData}))
}

module.exports = {
  createMOJUploadSummaryPage,
  createMOJUploadConfirmationPage,
  setData,
  validate,
  postValidation
}
