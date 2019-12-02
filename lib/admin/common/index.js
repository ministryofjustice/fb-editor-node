const get = require('lodash.get')

const {
  getServiceSchema
} = require('~/fb-editor-node/service-data/service-data')

const getUrlFromPageData = ({
  pagesMethods: {
    getUrl = () => '/admin'
  } = {}
} = {}) => getUrl

const isArray = (value) => Array.isArray(value)
const isObject = (value) => (value || false) instanceof Object
const toBoolean = (value) => String(value) === 'true'

const isConditionalBoolean = (properties = {}, property = '') => get(properties, property.concat('.oneOf[0]._name')) === 'definition.conditional.boolean'

const getInstancePropertyKey = (parentProperty, property) => parentProperty ? [parentProperty, property].join('.') : property

function getSchemaProperties (componentType, parentProperty) {
  let {
    properties
  } = getServiceSchema(componentType)
  if (parentProperty) {
    /*
     *  Get `properties` field from the schema's parent,
     *  using the `properties` field from the schema
     */
    ({
      properties
    } = get(properties, parentProperty.replace(/\./g, '.properties.')))
  }

  return properties
}

function transformValueForComparison (value) {
  return isArray(value) || isObject(value)
    ? JSON.stringify(value)
    : String(value)
}

function transformValueToDataType (value, properties = {}, property = '') {
  const key = property.replace(/:.+$/, '')
  const {
    [key]: {
      type
    } = {}
  } = properties

  switch (type) {
    case 'string':
      return String(value)
    case 'number':
      return Number(value)
    case 'boolean':
      return toBoolean(value)
    default:
      {
        const {
          [key]: {
            oneOf
          } = {}
        } = properties

        if (type === 'array' || type === 'object' || oneOf || isConditionalBoolean(properties, property)) {
          if (value !== undefined) {
            try {
              value = JSON.parse(value)
            } catch (e) {
              if (oneOf) {
                value = JSON.parse(`"${value}"`)
              }
            }
          }
        }
      }

      return value === null ? undefined : value
  }
}

module.exports = {
  getUrlFromPageData,
  isArray,
  isObject,
  toBoolean,
  isConditionalBoolean,
  getInstancePropertyKey,
  getSchemaProperties,
  transformValueForComparison,
  transformValueToDataType
}
