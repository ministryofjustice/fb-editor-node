require('@ministryofjustice/module-alias/register')

const {
  deepClone
} = require('@ministryofjustice/fb-utils-node')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  loadServiceData,
  createInstance,
  temporaryFile,
  expandInstance
} = require('~/fb-editor-node/service-data/service-data')

const instanceController = require('~/fb-editor-node/admin/route/admin.instance/admin.instance.controller')

function setData (pageInstance, pageData, POST) {
  // console.log('lib/admin/route/admin.instance.create.controller.setData()')

  const instanceErrors = []
  const addError = initAddError(instanceErrors)
  const {
    getUserDataProperty,
    setUserDataProperty
  } = pageData
  const _id = getUserDataProperty('_id')
  let sourceInstance
  if (POST) {
    sourceInstance = JSON.parse(getUserDataProperty('instance'))
  }
  try {
    const file = temporaryFile.get(_id)
    setUserDataProperty('temporaryFile', file)
    if (!POST) {
      sourceInstance = file.instance
    }
  } catch (e) {
    throw new Error(404)
  }

  const runtimeInstance = expandInstance(deepClone(sourceInstance), addError)
  setUserDataProperty('runtimeInstance', runtimeInstance)
  setUserDataProperty('sourceInstance', sourceInstance)
  setUserDataProperty('create', true)
  pageInstance = setErrors(pageInstance, instanceErrors)
  return instanceController.setData(pageInstance, pageData, POST)
}

function validate (pageInstance, pageData, POST, ajv) {
  // console.log('lib/admin/route/admin.instance.create.controller.validate()')

  return instanceController.validate(pageInstance, pageData, POST, ajv)
}

/*
 *  Returns a Promise
 */
function postValidationFailure (pageInstance, pageData, postRedirect) {
  // console.log('lib/admin/route/admin.instance.create.controller.postValidationFailure()')

  const _id = pageData.getUserDataProperty('_id')
  const instance = JSON.parse(pageData.getUserDataProperty('instance'))
  const file = pageData.getUserDataProperty('temporaryFile')

  file.instance = instance

  return temporaryFile.set(_id, file)
    .then(() => postRedirect.success())
    .catch((e) => {
      const errors = []
      const addError = initAddError(errors)

      addError(`Failed to write temporary instance: ${e.toString()}`, 'instance')

      return postRedirect.failure(setErrors(pageInstance, errors), pageData)
    })
}

/*
 *  Returns a Promise
 */
function postValidation (pageInstance, pageData, postRedirect) {
  // console.log('lib/admin/route/admin.instance.create.controller.postValidation()')

  const {
    pagesMethods: {
      getUrl = () => '/admin'
    } = {}
  } = pageData

  const _id = pageData.getUserDataProperty('_id')
  const instance = JSON.parse(pageData.getUserDataProperty('instance'))
  const {
    addId,
    addProperty,
    operation
  } = pageData.getUserDataProperty('temporaryFile')

  return createInstance(instance, {
    _id: addId,
    property: addProperty,
    operation
  })
    .then(loadServiceData)
    .then(() => {
      temporaryFile.unset(_id)

      return postRedirect.redirect(getUrl('admin.instance', {_id}))
    })
    .catch((e) => {
      const errors = []
      const addError = initAddError(errors)

      addError(`Failed to write instance: ${e.toString()}`, 'instance')

      return postRedirect.failure(setErrors(pageInstance, errors), pageData)
    })
}

module.exports = {
  setData,
  validate,
  postValidationFailure,
  postValidation
}
