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

const isMOJUploadComponent = ({_type}) => _type === 'mojUpload'

const isMOJUploadSummaryPage = ({_type}) => _type === 'page.mojUploadSummary' // 'page.summary'

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

async function resolveMOJUploadComponent ({_id} = {}, referrer = '/') {
  await Promise.all(
    getEntryPointInstances()
      .filter(({_type}) => _type !== 'page.error')
      .map(deleteMOJUploadSummary(_id, referrer))
  )
}

function getPostRedirectUrl ({pageData, _id}) {
  const discreteInstance = getDiscreteInstance(_id) || {_id}

  let instanceUrl = '/admin'

  if (discreteInstance._id !== _id) {
    const REFERRER = pageData.getUserDataProperty('REFERRER')

    if (REFERRER) {
      instanceUrl = REFERRER
    } else {
      const {
        pagesMethods: {
          getUrl = () => instanceUrl
        } = {}
      } = pageData

      instanceUrl = getUrl('admin.instance', {_id: discreteInstance._id})
    }
  }

  return instanceUrl
}

function resolvePostRedirectUrl ({postRedirect, ...parameters}) {
  if (postRedirect) {
    return postRedirect.redirect(getPostRedirectUrl(parameters))
  }
}

function handleError (e, {postRedirect, pageInstance, pageData}) {
  if (postRedirect) {
    const errors = []
    const addError = initAddError(errors)

    addError(`Failed to delete: ${e.toString()}`, 'value')

    return postRedirect.failure(setErrors(pageInstance, errors), pageData)
  }
}

async function setData (pageInstance, pageData, POST, REFERRER) {
  console.log('lib/admin/route/admin.instance.delete/admin.instance.delete.setData()')

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
    if (isMOJUploadComponent(instance)) {
      await resolveMOJUploadComponent(getDiscreteInstance(_id), REFERRER)
    }
  }

  return pageInstance
}

async function postValidation (pageInstance, pageData, postRedirect) {
  console.log('lib/admin/route/admin.instance.delete/admin.instance.delete.postValidation()')

  const _id = pageData.getUserDataProperty('_id')

  try {
    await deleteInstance(_id)
    await loadServiceData()
    await resolvePostRedirectUrl({postRedirect, pageInstance, pageData, _id})
  } catch (e) {
    handleError(e, {postRedirect, pageInstance, pageData})
  }
}

module.exports = {
  setData,
  postValidation
}
