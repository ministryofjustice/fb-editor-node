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

const {
  isUploadComponent,
  isUploadCheckPage,
  isUploadSummaryPage,
  isEntryPointStep
} = require('~/fb-editor-node/admin/common/components/upload')

function deleteUploadCheckPage ({_id: step} = {}, referrer = '/') {
  return async function deleteUploadCheckPageForStep (pageInstance = {}) {
    const {
      steps = []
    } = pageInstance

    if (steps.includes(step)) {
      const uploadIndex = steps.findIndex((s) => s === step)
      const uploadCheckIndex = uploadIndex + 1
      const id = steps[uploadCheckIndex]

      if (id) {
        if (isUploadCheckPage(getInstance(id))) {
          const bodyInput = {_id: id} // _id is upload check id
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

async function deleteUploadCheckStep (pageInstance = {}, referrer = '/') {
  const {steps = []} = pageInstance

  if (steps.some((id) => isUploadCheckPage(getInstance(id)))) {
    const _id = steps.find((id) => isUploadCheckPage(getInstance(id)))

    const bodyInput = {_id} // _id is upload check id
    const input = {...bodyInput}
    const pageData = userData.getUserDataMethods({input, count: {}})

    pageData.setBodyInput(bodyInput)
    pageData.body = pageData.getBodyInput()

    await setData(pageInstance, pageData, true, referrer)
    await postValidation(pageInstance, pageData)

    steps.splice(steps.findIndex((id) => id === _id), 1)
  }
}

function deleteUploadSummaryPage ({_id: step} = {}, referrer = '/') {
  return async function deleteUploadSummaryPageForStep (pageInstance = {}) {
    const {
      steps = []
    } = pageInstance

    if (steps.includes(step)) {
      const uploadIndex = steps.findIndex((s) => s === step)
      const uploadSummaryIndex = uploadIndex + 2
      const id = steps[uploadSummaryIndex]

      if (id) {
        if (isUploadSummaryPage(getInstance(id))) {
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

async function deleteUploadSummaryStep (pageInstance = {}, referrer = '/') {
  const {steps = []} = pageInstance

  if (steps.some((id) => isUploadSummaryPage(getInstance(id)))) {
    const _id = steps.find((id) => isUploadSummaryPage(getInstance(id)))

    const bodyInput = {_id} // _id is upload summary id
    const input = {...bodyInput}
    const pageData = userData.getUserDataMethods({input, count: {}})

    pageData.setBodyInput(bodyInput)
    pageData.body = pageData.getBodyInput()

    await setData(pageInstance, pageData, true, referrer)
    await postValidation(pageInstance, pageData)

    steps.splice(steps.findIndex((id) => id === _id), 1)
  }
}

async function resolveUploadComponent (pageInstance = {}, {maxFiles = 1} = {}, referrer = '/') {
  const entryPointInstances = getEntryPointInstances()
    .filter(({_type}) => _type !== 'page.error' && _type !== 'page.admin')

  const {
    _id
  } = pageInstance

  if (entryPointInstances.some(isEntryPointStep(_id))) {
    if (maxFiles < 2) await Promise.all(entryPointInstances.map(deleteUploadSummaryPage(pageInstance, referrer)))
    await Promise.all(entryPointInstances.map(deleteUploadCheckPage(pageInstance, referrer)))
  } else {
    if (maxFiles < 2) await deleteUploadSummaryStep(pageInstance, referrer)
    await deleteUploadCheckStep(pageInstance, referrer)
  }
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
     *  Resolve any `upload` components
     */
    await Promise.all(
      components
        .filter(isUploadComponent)
        .map((component) => resolveUploadComponent(getDiscreteInstance(_id), component, REFERRER))
    )
  } else {
    /*
     *  Deleting a component?
     *
     *  Resolve a `upload` component
     */
    if (isUploadComponent(instance)) await resolveUploadComponent(getDiscreteInstance(_id), instance, REFERRER)
  }

  return pageInstance
}

async function postValidation (pageInstance, pageData, postRedirect) {
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
  deleteUploadSummaryPage,
  deleteUploadSummaryStep,
  deleteUploadCheckPage,
  deleteUploadCheckStep,
  setData,
  postValidation
}
