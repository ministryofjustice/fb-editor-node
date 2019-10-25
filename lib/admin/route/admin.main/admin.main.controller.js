const adminController = {}

const serviceData = require('../../../service-data/service-data')
const {
  getEntryPointInstances,
  getInstance
} = serviceData

const {getPageHierarchy} = require('../admin.instance/admin.instance.controller')

adminController.setData = (pageInstance, pageData, POST) => {
  const _id = 'page.start'
  const instance = getInstance(_id)
  const _ids = _id ? [_id] : getEntryPointInstances()
    .filter(instance => instance._type !== 'page.error')
    .sort((a, b) => a.url > b.url ? 1 : -1)
    .map(instance => instance._id)

  const hierarchy = getPageHierarchy(instance, _ids, pageData, {
    currentInstanceLink: true,
    linkType: 'edit'
  })
  hierarchy._type = 'datastructure'
  hierarchy.top = true

  pageInstance.components.push(hierarchy)

  return pageInstance
}

module.exports = adminController
