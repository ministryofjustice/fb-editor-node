require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')

const {
  getSchemaNameByCategory,
  getSchemaTitle,
  countInstancesByType
} = require('~/fb-editor-node/lib/service-data/service-data')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/lib/admin/common')

function setData (pageInstance, pageData, POST) {
  const {
    category
  } = pageData.getUserData()

  const types = getSchemaNameByCategory(category)

  const nested = category === 'component'

  const [
    list
  ] = jsonPath.query(pageInstance, '$.components[0]')

  const getUrl = getUrlFromPageData(pageData)

  list.items = types.map((_type) => ({
    text: getSchemaTitle(_type),
    href: getUrl('admin.type', { _type, nested: nested && 'nested' }),
    count: countInstancesByType(_type, { nested })
  }))

  list.items.push({ text: 'Footer', href: '/admin/instance/config.meta' })

  pageInstance.adminBack = getUrl('admin.main')

  return pageInstance
}

module.exports = {
  setData
}
