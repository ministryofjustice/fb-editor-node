require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')

const serviceData = require('~/fb-editor-node/service-data/service-data')
const {
  getSchemaNameByCategory,
  getSchemaTitle,
  getInstancesByType
} = serviceData

function setData (pageInstance, pageData, POST) {
  console.log('lib/admin/route/admin.category.controller.setData()')

  const {
    pagesMethods: {
      getUrl = () => '/admin'
    } = {}
  } = pageData
  const {category} = pageData.getUserData()
  const types = getSchemaNameByCategory(category)

  const [list] = jsonPath.query(pageInstance, '$.components[0]')
  list.items = types.map(_type => {
    return {
      text: getSchemaTitle(_type),
      href: getUrl('admin.type', {_type, nested: category === 'component' ? 'nested' : undefined}),
      count: getInstancesByType(_type, {count: true, nested: category === 'component'})
    }
  })

  pageInstance.adminBack = getUrl('admin.main')

  return pageInstance
}

module.exports = {
  setData
}
