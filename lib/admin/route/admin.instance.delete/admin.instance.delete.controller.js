require('module-alias/register')

const instancePropertyController = {}

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const serviceData = require('~/fb-editor-node/service-data/service-data')
const {
  loadServiceData,
  getDiscreteInstance,
  deleteInstance
} = serviceData

instancePropertyController.setData = (pageInstance, pageData, POST, REFERRER) => {
  if (!POST) {
    throw new Error(404)
  }
  pageData.setUserDataProperty('REFERRER', REFERRER)

  const _id = pageData.getUserDataProperty('_id')
  const discreteInstance = getDiscreteInstance(_id) || {}

  if (!discreteInstance) {
    throw new Error(404)
  }

  return pageInstance
}

instancePropertyController.postValidation = (pageInstance, pageData, postRedirect) => {
  const errors = []
  const addError = initAddError(errors)

  const _id = pageData.getUserDataProperty('_id')
  const discreteInstance = getDiscreteInstance(_id) || {}
  let instanceUrl = '/admin'
  if (discreteInstance._id !== _id) {
    instanceUrl = pageData.pagesMethods.getUrl('admin.instance', {_id: discreteInstance._id})
    const REFERRER = pageData.getUserDataProperty('REFERRER')
    if (REFERRER) {
      instanceUrl = REFERRER
    }
  }

  return deleteInstance(_id)
    .then(() => {
      return loadServiceData()
    })
    .then(() => {
      postRedirect.redirect(instanceUrl)
    })
    .catch(err => {
      addError(`Failed to write property instance: ${err.toString()}`, 'value')
      pageInstance = setErrors(pageInstance, errors)
      postRedirect.failure(pageInstance, pageData)
    })
}

module.exports = instancePropertyController
