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
} = require('~/fb-editor-node/lib/service-data/service-data')

const instanceController = require('~/fb-editor-node/lib/admin/route/admin.instance/admin.instance.controller')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/lib/admin/common')

function populateWriteTemporaryInstanceError (e, pageInstance) {
  const errors = []
  const addError = initAddError(errors)

  addError(`Failed to write temporary instance: ${e.toString()}`, 'instance')

  return setErrors(pageInstance, errors)
}

function populateWriteInstanceError (e, pageInstance) {
  const errors = []
  const addError = initAddError(errors)

  addError(`Failed to write instance: ${e.toString()}`, 'instance')

  return setErrors(pageInstance, errors)
}

function setData (pageInstance, pageData, POST) {
  const _id = pageData.getUserDataProperty('_id')
  let sourceInstance
  if (POST) {
    sourceInstance = JSON.parse(pageData.getUserDataProperty('instance'))
  } else {
    try {
      const file = temporaryFile.get(_id)

      pageData.setUserDataProperty('temporaryFile', file)

      sourceInstance = file.instance
    } catch (e) {
      throw new Error(404)
    }
  }

  const instanceErrors = []
  const addError = initAddError(instanceErrors)

  pageData.setUserDataProperty('runtimeInstance', expandInstance(deepClone(sourceInstance), addError))
  pageData.setUserDataProperty('sourceInstance', sourceInstance)
  pageData.setUserDataProperty('create', true)
  pageInstance = setErrors(pageInstance, instanceErrors)

  return instanceController.setData(pageInstance, pageData, POST)
}

const validate = (...args) => instanceController.validate(...args)

async function postValidationFailure (pageInstance, pageData, postRedirect) {
  const _id = pageData.getUserDataProperty('_id')
  const instance = JSON.parse(pageData.getUserDataProperty('instance'))
  const file = pageData.getUserDataProperty('temporaryFile')

  file.instance = instance

  try {
    await temporaryFile.set(_id, file)

    /*
     *  Either a conditional return, or implicit (at the end of the function)
     */
    if (postRedirect) return postRedirect.success()
  } catch (e) {
    /*
     *  As above
     */
    if (postRedirect) return postRedirect.failure(populateWriteTemporaryInstanceError(e, pageInstance), pageData)
  }
}

async function postValidation (pageInstance, pageData, postRedirect) {
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

    /*
     *  Either a conditional return, or implicit (at the end of the function)
     */
    if (postRedirect) {
      const getUrl = getUrlFromPageData(pageData)

      return postRedirect.redirect(getUrl('admin.instance', {_id}))
    }
  } catch (e) {
    /*
     *  As above
     */
    if (postRedirect) return postRedirect.failure(populateWriteInstanceError(e, pageInstance), pageData)
  }
}

module.exports = {
  setData,
  validate,
  postValidationFailure,
  postValidation
}
