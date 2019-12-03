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
  return Object.values(serviceData.getServiceSchemas())
    .reduce((accumulator, {category}) => Array.isArray(category)
      ? accumulator.concat(category)
      : accumulator, [])
    .reduce((accumulator, category) => !/^(definition|option|.+Page)$/.test(category) && !accumulator.includes(category)
      ? accumulator.concat(category)
      : accumulator, [])
    .sort()
}

serviceData.getSchemaTitle = (type) => serviceData.getServiceSchema(type).title

serviceData.getInstanceType = (_id) => serviceData.getInstanceProperty(_id, '_type')

serviceData.getInstancesByType = (query, {nested = false} = {}) => {
  let instances = serviceData.getServiceInstances()

  if (nested) {
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

  return (
    typeof query === 'string'
      ? instanceKeys.filter((_id) => instances[_id]._type === query)
      : instanceKeys.filter((_id) => Object.keys(query).some((key) => instances[_id][key] === query[key]))
  ).filter((instanceType) => instanceType !== 'page.admin')
}

serviceData.countInstancesByType = (...args) => serviceData.getInstancesByType(...args).length

module.exports = serviceData
