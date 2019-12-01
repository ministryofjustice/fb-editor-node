require('@ministryofjustice/module-alias/register')

const {
  deepClone
} = require('@ministryofjustice/fb-utils-node')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  getServiceSchema,
  temporaryFile,
  expandInstance
} = require('~/fb-editor-node/service-data/service-data')

const instancePropertyController = require('~/fb-editor-node/admin/route/admin.instance.property/admin.instance.property.controller')

function handleError (e, {postRedirect, ...parameters}) {
  if (postRedirect) {
    const errors = []
    const addError = initAddError(errors)

    addError(`Failed to write temporary instance: ${e.toString()}`, 'value')

    const {
      pageInstance,
      pageData
    } = parameters

    return postRedirect.failure(setErrors(pageInstance, errors), pageData)
  }
}

/*
 *  Assume returns a Promise
 */
function setData (pageInstance, pageData, POST) {
  // console.log('lib/admin/route/admin.instance.create.property.controller.setData()')

  const _id = pageData.getUserDataProperty('_id')
  const property = pageData.getUserDataProperty('property')

  let sourceInstance
  let value

  if (POST) {
    value = pageData.getUserDataProperty('value')
    pageData.setUserDataProperty('value', value)
  }

  try {
    const file = temporaryFile.get(_id)

    pageData.setUserDataProperty('temporaryFile', file)

    sourceInstance = file.instance
    if (!POST) {
      const previousValue = sourceInstance[property]
      pageData.setUserDataProperty('value', previousValue)
    }
  } catch (e) {
    throw new Error(404)
  }

  const errors = []
  const addError = initAddError(errors)

  pageData.setUserDataProperty('runtimeInstance', expandInstance(deepClone(sourceInstance), addError))
  pageData.setUserDataProperty('sourceInstance', sourceInstance)
  pageData.setUserDataProperty('create', true)

  pageInstance = setErrors(pageInstance, errors)

  return instancePropertyController.setData(pageInstance, pageData, POST)
}

/*
 *  Returns a Promise
 */
async function postValidation (pageInstance, pageData, postRedirect) {
  // console.log('lib/admin/route/admin.instance.create.property.controller.postValidation()')

  const _id = pageData.getUserDataProperty('_id')
  const property = pageData.getUserDataProperty('property')
  let value = pageData.getUserDataProperty('value')

  const sourceInstance = pageData.getUserDataProperty('sourceInstance')

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

  const file = pageData.getUserDataProperty('temporaryFile')

  /*
   *  Read the previous value
   */
  const previousValue = file.instance[property]

  /*
   *  Compare as strings
   */
  if (JSON.stringify(value) === JSON.stringify(previousValue)) return postRedirect.success()

  /*
   *  Save the current value
   */
  file.instance[property] = value

  try {
    await temporaryFile.set(_id, file)

    return postRedirect.success()
  } catch (e) {
    return handleError(e, {postRedirect, pageInstance, pageData})
  }
}

module.exports = {
  setData,
  postValidation
}
