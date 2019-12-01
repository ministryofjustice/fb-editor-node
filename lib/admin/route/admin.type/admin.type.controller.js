require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')

const serviceData = require('~/fb-editor-node/service-data/service-data')
const {
  getInstancesByType,
  getInstanceTitle,
  getSchemaTitle
} = serviceData

function setData (pageInstance, pageData, POST) {
  console.log('lib/admin/route/admin.type.controller.setData()')

  const {
    pagesMethods: {
      getUrl = () => '/admin'
    }
  } = pageData

  const {_type, nested} = pageData.getUserData()
  if (nested && nested !== 'nested') {
    throw new Error(404)
  }

  const typeTitle = getSchemaTitle(_type)

  pageData.setUserDataProperty('typeTitle', typeTitle)

  const instances = getInstancesByType(_type, {nested})

  const [action] = jsonPath.query(pageInstance, '$..[?(@._id === "admin.type--action")]')
  const [list] = jsonPath.query(pageInstance, '$..[?(@._id === "admin.type--list")]')

  action.href = getUrl('admin.instance.create.id', {_type})

  const nestedLinkUrl = getUrl('admin.type', {_type, nested: nested ? undefined : 'nested'})
  pageData.setUserDataProperty('nestedLinkUrl', nestedLinkUrl)

  list.items = instances.map(_id => {
    return {
      text: getInstanceTitle(_id),
      href: getUrl('admin.instance', {_id})
    }
  })

  const category = _type.startsWith('page.') ? 'page' : 'component'

  pageInstance.adminBack = getUrl('admin.category', {category})

  return pageInstance
}

module.exports = {
  setData
}
