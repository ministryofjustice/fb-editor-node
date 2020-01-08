require('@ministryofjustice/module-alias/register')

const cloneDeep = require('lodash.clonedeep')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  temporaryFile,
  expandInstance
} = require('~/fb-editor-node/lib/service-data/service-data')

const instancePropertyController = require('~/fb-editor-node/lib/admin/route/admin.instance.property/admin.instance.property.controller')

const {
  getSchemaProperties,
  transformValueToDataType
} = require('~/fb-editor-node/lib/admin/common')

function populateError (e, pageInstance) {
  const errors = []
  const addError = initAddError(errors)

  addError(`Failed to write temporary instance: ${e.toString()}`, 'value')

  return setErrors(pageInstance, errors)
}

/*
 *  Assume returns a Promise
 */
function setData (pageInstance, pageData, POST) {
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

  pageData.setUserDataProperty('runtimeInstance', expandInstance(cloneDeep(sourceInstance), addError))
  pageData.setUserDataProperty('sourceInstance', sourceInstance)
  pageData.setUserDataProperty('create', true)

  pageInstance = setErrors(pageInstance, errors)

  return instancePropertyController.setData(pageInstance, pageData, POST)
}

async function postValidation (pageInstance, pageData, postRedirect) {
  const _id = pageData.getUserDataProperty('_id')
  const {
    _type
  } = pageData.getUserDataProperty('sourceInstance')

  const parentProperty = pageData.getUserDataProperty('parentProperty')
  const property = pageData.getUserDataProperty('property')
  const value = transformValueToDataType(pageData.getUserDataProperty('value'), getSchemaProperties(_type, parentProperty), property)

  const file = pageData.getUserDataProperty('temporaryFile')

  /*
   *  Read the previous value
   */
  const previousValue = file.instance[property]

  /*
   *  Compare as strings
   */
  if (JSON.stringify(value) === JSON.stringify(previousValue)) return postRedirect && postRedirect.success()

  /*
   *  Save the current value
   */
  file.instance[property] = value

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
    if (postRedirect) return postRedirect.failure(populateError(e, pageInstance), pageData)
  }
}

module.exports = {
  setData,
  postValidation
}
