require('@ministryofjustice/module-alias/register')

const {
  getInstance
} = require('~/fb-editor-node/service-data/service-data')

const {
  getPageHierarchy
} = require('~/fb-editor-node/admin/route/admin.instance/admin.instance.controller')

function setData (pageInstance, pageData, POST) {
  // console.log('lib/admin/route/admin.main/admin.main.controller.setData()')

  const _id = 'page.start'
  const instance = getInstance(_id)

  const pageHierarchy = {
    ...getPageHierarchy(instance, [_id], pageData, {
      currentInstanceLink: true,
      linkType: 'edit'
    }),
    _type: 'datastructure',
    top: true
  }

  pageInstance.components.push(pageHierarchy)

  return pageInstance
}

module.exports = {
  setData
}
