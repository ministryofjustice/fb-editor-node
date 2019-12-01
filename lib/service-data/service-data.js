const jsonPath = require('jsonpath')

const serviceData = require('@ministryofjustice/fb-runner-node/lib/service-data/service-data')

const {
  initRoutes
} = require('@ministryofjustice/fb-runner-node/lib/middleware/routes-metadata/routes-metadata')

const {
  loadServiceData
} = serviceData

/*
 *  Monkey patch for Editor
 */
serviceData.loadServiceData = async () => {
  /*
   *  Re-load the service data
   */
  const serviceData = await loadServiceData()

  /*
   *  Re-initialise Runner
   */
  initRoutes()

  /*
   *  Return the re-loaded service data
   */
  return serviceData
}

serviceData.getServiceSchemaCategories = () => {
  const schemas = serviceData.getServiceSchemas()
  const categories = Object.values(schemas)
    .reduce((accumulator, {category}) => {
      return category
        ? accumulator.concat(
          category.reduce((accumulator, value) => {
            return value.match(/^(definition|option|.+Page)$/) || categories.includes(value)
              ? accumulator
              : accumulator.concat(value)
          }, [])
        )
        : accumulator
    }, [])

  return categories.sort()
}

serviceData.getSchemaTitle = (type) => serviceData.getServiceSchema(type).title

serviceData.getInstanceType = (_id) => serviceData.getInstanceProperty(_id, '_type')

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
