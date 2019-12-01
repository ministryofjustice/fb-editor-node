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

function handleWriteTemporaryInstanceError (e, {postRedirect, ...parameters}) {
  if (postRedirect) {
    const errors = []
    const addError = initAddError(errors)

    addError(`Failed to write temporary instance: ${e.toString()}`, 'instance')

    const {
      pageInstance,
      pageData
    } = parameters

    return postRedirect.failure(setErrors(pageInstance, errors), pageData)
  }
}

function handleWriteInstanceError (e, {postRedirect, ...parameters}) {
  if (postRedirect) {
    const errors = []
    const addError = initAddError(errors)

    addError(`Failed to write instance: ${e.toString()}`, 'instance')

    const {
      pageInstance,
      pageData
    } = parameters

    return postRedirect.failure(setErrors(pageInstance, errors), pageData)
  }
}

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

async function postValidationFailure (pageInstance, pageData, postRedirect) {
  // console.log('lib/admin/route/admin.instance.create.controller.postValidationFailure()')

  const _id = pageData.getUserDataProperty('_id')
  const instance = JSON.parse(pageData.getUserDataProperty('instance'))
  const file = pageData.getUserDataProperty('temporaryFile')

  file.instance = instance

  try {
    await temporaryFile.set(_id, file)

    return postRedirect.success()
  } catch (e) {
    return handleWriteTemporaryInstanceError(e, {postRedirect, pageInstance, pageData})
  }
}

async function postValidation (pageInstance, pageData, postRedirect) {
  // console.log('lib/admin/route/admin.instance.create.controller.postValidation()')

  const _id = pageData.getUserDataProperty('_id')
  const instance = JSON.parse(pageData.getUserDataProperty('instance'))

  const {
    addId,
    addProperty,
    operation
  } = pageData.getUserDataProperty('temporaryFile')

  try {
    await createInstance(instance, {
      _id: addId,
      property: addProperty,
      operation
    })
    await loadServiceData()
    await temporaryFile.unset(_id)

    const {
      pagesMethods: {
        getUrl = () => '/admin'
      } = {}
    } = pageData

    return postRedirect.redirect(getUrl('admin.instance', {_id}))
  } catch (e) {
    return handleWriteInstanceError(e, {postRedirect, pageInstance, pageData})
  }
}

module.exports = {
  setData,
  validate,
  postValidationFailure,
  postValidation
}
