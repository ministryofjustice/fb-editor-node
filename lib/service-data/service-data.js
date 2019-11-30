const jsonPath = require('jsonpath')
const serviceData = require('@ministryofjustice/fb-runner-node/lib/service-data/service-data')
const {initRoutes} = require('@ministryofjustice/fb-runner-node/lib/middleware/routes-metadata/routes-metadata')

const originalLoadServiceData = serviceData.loadServiceData

serviceData.loadServiceData = () => {
  return originalLoadServiceData()
    .then(serviceData => {
      initRoutes()
      return serviceData
    })
}

serviceData.getServiceSchemaCategories = () => {
  const categories = []
  const schemas = serviceData.getServiceSchemas()
  Object.keys(schemas).forEach(schema => {
    const {category} = schemas[schema]
    if (category) {
      category.forEach(cat => {
        if (cat.match(/^(definition|option|.+Page)$/)) {
          return
        }
        if (!categories.includes(cat)) {
          categories.push(cat)
        }
      })
    }
  })
  return categories.sort()
}

serviceData.getSchemaTitle = (type) => {
  return serviceData.getServiceSchema(type).title
}

serviceData.getInstanceType = (_id) => {
  return serviceData.getInstanceProperty(_id, '_type')
}

serviceData.getInstancesByType = (query, options = {}) => {
  let instances = serviceData.getServiceInstances()

  if (options.nested) {
    const instanceKeys = Object.keys(instances)

    instances = jsonPath.query(instances, '$..[?(@._id)]')
      .reduce((instances, instance) => {
        const {
          _id
        } = instance

        return instanceKeys.includes(_id)
          ? instances
          : {
            ...instances,
            [_id]: instance
          }
      }, {})
  }

  const instanceKeys = Object.keys(instances)

  let instancesByType

  if (typeof query === 'string') {
    instancesByType = instanceKeys.filter(_id => instances[_id]._type === query)
  } else {
    instancesByType = instanceKeys.filter(_id => {
      Object.keys(query).forEach(key => {
        if (instances[_id][key] !== query[key]) {
          return false
        }
      })
      return true
    })
  }

  instancesByType = instancesByType.filter(instance => instance !== 'page.admin')

  if (options.count) {
    return instancesByType.length
  }

  return instancesByType
}

module.exports = serviceData
