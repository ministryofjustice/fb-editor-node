require('@ministryofjustice/module-alias/register')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  isPage,
  getEntryPointInstances,
  loadServiceData,
  getInstance,
  getDiscreteInstance,
  deleteInstance
} = require('~/fb-editor-node/service-data/service-data')

const userData = require('@ministryofjustice/fb-runner-node/lib/middleware/user-data/user-data')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/admin/common')

const isMOJUploadComponent = ({_type}) => _type === 'mojUpload'
const isMOJUploadSummaryPage = ({_type}) => _type === 'page.mojUploadSummary'
const isMOJUploadConfirmationPage = ({_type}) => _type === 'page.mojUploadConfirmation'

function deleteMOJUploadSummary (step, referrer) {
  return async function deleteMOJUploadSummaryForStep (pageInstance) {
    const {
      steps = []
    } = pageInstance

    if (steps.includes(step)) {
      const uploadIndex = steps.findIndex((s) => s === step)
      const uploadSummaryIndex = uploadIndex + 1
      const id = steps[uploadSummaryIndex]

      if (id) {
        if (isMOJUploadSummaryPage(getInstance(id))) {
          const bodyInput = {_id: id} // _id is upload summary id
          const input = {...bodyInput}
          const pageData = userData.getUserDataMethods({input, count: {}})

          pageData.setBodyInput(bodyInput)
          pageData.body = pageData.getBodyInput()

          await setData(pageInstance, pageData, true, referrer)
          await postValidation(pageInstance, pageData)
        }
      }
    }
  }
}

function deleteMOJUploadConfirmation (step, referrer) {
  return async function deleteMOJUploadConfirmationForStep (pageInstance) {
    const {
      steps = []
    } = pageInstance

    if (steps.includes(step)) {
      const uploadIndex = steps.findIndex((s) => s === step)
      const uploadConfirmationIndex = uploadIndex + 2
      const id = steps[uploadConfirmationIndex]

      if (id) {
        if (isMOJUploadConfirmationPage(getInstance(id))) {
          const bodyInput = {_id: id} // _id is upload confirmation id
          const input = {...bodyInput}
          const pageData = userData.getUserDataMethods({input, count: {}})

          pageData.setBodyInput(bodyInput)
          pageData.body = pageData.getBodyInput()

          await setData(pageInstance, pageData, true, referrer)
          await postValidation(pageInstance, pageData)
        }
      }
    }
  }
}

async function resolveMOJUploadComponent ({_id} = {}, referrer = '/') {
  const enttryPointInstances = getEntryPointInstances()
    .filter(({_type}) => _type !== 'page.error')

  await Promise.all(enttryPointInstances.map(deleteMOJUploadConfirmation(_id, referrer))) // 2
  await Promise.all(enttryPointInstances.map(deleteMOJUploadSummary(_id, referrer))) // then 1
}

function getPostRedirectUrl ({pageData, _id}) {
  const {
    _id: discreteInstanceId
  } = getDiscreteInstance(_id) || {}

  let instanceUrl = '/admin'
  if (discreteInstanceId !== _id) {
    const referrer = pageData.getUserDataProperty('REFERRER')

    if (referrer) {
      instanceUrl = referrer
    } else {
      const getUrl = getUrlFromPageData(pageData)

      instanceUrl = getUrl('admin.instance', {_id: discreteInstanceId})
    }
  }

  return instanceUrl
}

function populateError (e, pageInstance) {
  const errors = []
  const addError = initAddError(errors)

  addError(`Failed to delete: ${e.toString()}`, 'value')

  return setErrors(pageInstance, errors)
}

async function setData (pageInstance, pageData, POST, REFERRER) {
  // console.log('lib/admin/route/admin.instance.delete/admin.instance.delete.setData()')

  if (!POST) {
    throw new Error(404)
  }

  pageData.setUserDataProperty('REFERRER', REFERRER)

  const _id = pageData.getUserDataProperty('_id')
  const instance = getInstance(_id)

  if (isPage(instance)) {
    const {
      components = []
    } = instance

    /*
     *  Deleting a page?
     *
     *  Resolve any `mojUpload` components
     */
    await Promise.all(
      components
        .filter(isMOJUploadComponent)
        .map(() => resolveMOJUploadComponent(getDiscreteInstance(_id), REFERRER))
    )
  } else {
    /*
     *  Deleting a component?
     *
     *  Resolve a `mojUpload` component
     */
    if (isMOJUploadComponent(instance)) await resolveMOJUploadComponent(getDiscreteInstance(_id), REFERRER)
  }

  return pageInstance
}

async function postValidation (pageInstance, pageData, postRedirect) {
  // console.log('lib/admin/route/admin.instance.delete/admin.instance.delete.postValidation()')

  const _id = pageData.getUserDataProperty('_id')

  try {
    /*
     *  Compute this before deleting the instance
     */
    const redirectUrl = postRedirect && getPostRedirectUrl({pageInstance, pageData, _id})

    /*
     *  Delete the instance
     */
    await deleteInstance(_id)
    await loadServiceData()

    /*
     *  Either a conditional return, or implicit (at the end of the function)
     */
    if (postRedirect) return postRedirect.redirect(redirectUrl)
  } catch (e) {
    /*
     *  As above
     */
    if (postRedirect) return postRedirect.failure(populateError(e, pageInstance), pageData)
  }
}

module.exports = {
  setData,
  postValidation
}
