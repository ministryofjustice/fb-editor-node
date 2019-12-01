require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')

const serviceData = require('~/fb-editor-node/service-data/service-data')
const {
  getSchemaNameByCategory,
  getSchemaTitle,
  countInstancesByType
} = serviceData

function setData (pageInstance, pageData, POST) {
  console.log('lib/admin/route/admin.category.controller.setData()')

  const {
    pagesMethods: {
      getUrl = () => '/admin'
    } = {}
  } = pageData

  const {
    category
  } = pageData.getUserData()

  const types = getSchemaNameByCategory(category)

  const nested = category === 'component'

  const [
    list
  ] = jsonPath.query(pageInstance, '$.components[0]')

  list.items = types.map((_type) => ({
    text: getSchemaTitle(_type),
    href: getUrl('admin.type', {_type, nested: nested && 'nested'}),
    count: countInstancesByType(_type, {nested})
  }))

  pageInstance.adminBack = getUrl('admin.main')

  return pageInstance
}

module.exports = {
  setData
}
