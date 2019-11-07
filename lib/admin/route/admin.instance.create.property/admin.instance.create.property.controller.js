require('module-alias/register')

const {deepClone} = require('@ministryofjustice/fb-utils-node')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')
const {
  getServiceSchema,
  temporaryFile,
  expandInstance
} = require('~/service-data/service-data')

const instancePropertyController = require('~/admin/route/admin.instance.property/admin.instance.property.controller')
const instanceCreatePropertyController = {}

instanceCreatePropertyController.setData = (pageInstance, pageData, POST) => {
  const instanceErrors = []
  const addError = initAddError(instanceErrors)
  const {
    getUserDataProperty,
    setUserDataProperty
  } = pageData
  const _id = getUserDataProperty('_id')
  const property = getUserDataProperty('property')
  let sourceInstance
  let value
  if (POST) {
    value = getUserDataProperty('value')
    setUserDataProperty('value', value)
  }
  try {
    const tmpFile = temporaryFile.get(_id)
    setUserDataProperty('temporaryFile', tmpFile)
    sourceInstance = tmpFile.instance
    if (!POST) {
      setUserDataProperty('value', sourceInstance[property])
    }
  } catch (e) {
    throw new Error(404)
  }

  const runtimeInstance = expandInstance(deepClone(sourceInstance), addError)
  setUserDataProperty('runtimeInstance', runtimeInstance)
  setUserDataProperty('sourceInstance', sourceInstance)
  setUserDataProperty('create', true)
  pageInstance = setErrors(pageInstance, instanceErrors)
  return instancePropertyController.setData(pageInstance, pageData, POST)
}

instanceCreatePropertyController.postValidation = (pageInstance, pageData, postRedirect) => {
  const {
    getUserDataProperty
  } = pageData
  const errors = []
  const addError = initAddError(errors)

  const _id = getUserDataProperty('_id')
  const property = getUserDataProperty('property')
  let value = getUserDataProperty('value')

  const sourceInstance = getUserDataProperty('sourceInstance')
  // TODO: this block replicates code in admin.instance.property
  // and it should be handled when the values are received
  const schema = getServiceSchema(sourceInstance._type)
  const propertyType = schema.properties[property].type
  if (propertyType === 'number') {
    value *= 1
  } else if (propertyType === 'boolean') {
    value = value === 'true'
  } else if (propertyType === 'array' || propertyType === 'object' || value === undefined || value.match(/^\{[\s\S]*\}$/)) {
    value = JSON.parse(value)
  }

  const tmpFile = getUserDataProperty('temporaryFile')

  if (JSON.stringify(value) === JSON.stringify(tmpFile.instance[property])) {
    return postRedirect.success()
  }
  tmpFile.instance[property] = value

  temporaryFile.set(_id, tmpFile)
    .then(() => {
      postRedirect.success()
    })
    .catch(err => {
      addError(`Failed to update temporary instance: ${err.toString()}`, 'value')
      pageInstance = setErrors(pageInstance, errors)
      postRedirect.failure(pageInstance, pageData)
    })
}

module.exports = instanceCreatePropertyController
