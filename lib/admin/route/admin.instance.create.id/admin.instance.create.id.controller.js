require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')
const jsonschema = require('jsonschema')
const validator = new jsonschema.Validator()

const {
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
} = require('~/fb-editor-node/lib/service-data/service-data')

const userData = require('@ministryofjustice/fb-runner-node/lib/middleware/user-data/user-data')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/lib/admin/common')

const {
  getUrlMatch,
  isUploadComponent,
  isUploadCheckPage,
  isUploadSummaryPage
} = require('~/fb-editor-node/lib/admin/common/components/upload')

async function createUploadCheckStep (pageInstance = {}) {
  const {
    url = '/upload',
    steps = []
  } = pageInstance

  const urlMatch = getUrlMatch(url)

  const bodyInput = {
    idSeedValue: `${urlMatch}-check`
  }

  if (!steps.some((id) => isUploadCheckPage(getInstance(id)))) {
    const {
      _id: pageInstanceId
    } = pageInstance

    /*
     *  Create an upload check page
     */
    const input = {
      ...bodyInput,
      _type: 'page.uploadCheck',
      addId: pageInstanceId,
      addProperty: 'steps',
      insertAt: 0
    }

    const pageData = userData.getUserDataMethods({input, count: {}})

    pageData.setBodyInput(bodyInput)
    pageData.body = pageData.getBodyInput()

    await setData(pageInstance, pageData)
    await validate(pageInstance, pageData, true)
    await postValidation(pageInstance, pageData)
  }
}

async function createUploadSummaryStep (pageInstance = {}) {
  const {
    url = '/upload',
    steps = []
  } = pageInstance

  const urlMatch = getUrlMatch(url)

  const bodyInput = {
    idSeedValue: `${urlMatch}-summary`
  }

  if (!steps.some((id) => isUploadSummaryPage(getInstance(id)))) {
    const {
      _id: pageInstanceId
    } = pageInstance

    /*
     *  Create an upload summary page
     */
    const input = {
      ...bodyInput,
      _type: 'page.uploadSummary',
      addId: pageInstanceId,
      addProperty: 'steps',
      insertAt: 1
    }

    const pageData = userData.getUserDataMethods({input, count: {}})

    pageData.setBodyInput(bodyInput)
    pageData.body = pageData.getBodyInput()

    await setData(pageInstance, pageData)
    await validate(pageInstance, pageData, true)
    await postValidation(pageInstance, pageData)
  }
}

async function resolveUploadComponent (pageInstance = {}, {maxFiles = 1} = {}) {
  await createUploadCheckStep(pageInstance)
  if (maxFiles > 1) await createUploadSummaryStep(pageInstance)
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
  if (isUploadComponent(getInstance(_id))) await resolveUploadComponent(getDiscreteInstance(_id), getInstance(_id))

  /*
   *  Either a conditional return, or implicit (at the end of the function)
   */
  if (postRedirect) return postRedirect.redirect(getPostRedirectUrl({addProperty, addId, redirectView, _id, _type, pageData}))
}

module.exports = {
  createUploadCheckStep,
  createUploadSummaryStep,
  setData,
  validate,
  postValidation
}
