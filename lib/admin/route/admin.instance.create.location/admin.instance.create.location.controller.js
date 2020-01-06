require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')

const {
  getInstancesByPropertyValue,
  getInstanceTitle
} = require('~/fb-editor-node/lib/service-data/service-data')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/lib/admin/common')

function setData (pageInstance, pageData, POST) {
  const location = pageData.getUserDataProperty('location')

  if (location) {
    let locationParams = {
      instanceType: 'page'
    }

    if (location !== 'standalone') {
      locationParams = {
        addId: location,
        addProperty: 'steps',
        operation: 'edit'
      }
    }

    const getUrl = getUrlFromPageData(pageData)

    pageInstance.redirect = getUrl('admin.instance.create.type', locationParams)

    return pageInstance
  }

  const pagesWithSteps = getInstancesByPropertyValue('_type', 'page.start')
    .concat(getInstancesByPropertyValue('enableSteps', true))
    .filter(instance => {
      if (instance.$source.startsWith('module:')) {
        return false
      }

      if (instance.url === '/') {
        return true
      }

      /**
       * TODO: Confirm operator precdence https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
       */
      return instance.enableSteps || instance.steps && instance.steps.length // eslint-disable-line
    })
    .map(instance => {
      const mainPage = instance.url === '/' ? ' (main page)' : ''

      if (mainPage) {
        pageData.setUserDataProperty('location', instance._id)
      }

      return {
        _type: 'radio',
        value: instance._id,
        label: getInstanceTitle(instance._id) + mainPage
      }
    })

  const [
    nameNode
  ] = jsonPath.query(pageInstance, '$..[?(@.name === "location")]')

  pagesWithSteps
    .reverse()
    .forEach((locationOption) => {
      nameNode.items.unshift(locationOption)
    })

  return pageInstance
}

module.exports = {
  setData
}
