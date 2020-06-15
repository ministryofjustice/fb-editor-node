require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')
const get = require('lodash.get')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  getEvaluationOperators
} = require('@ministryofjustice/fb-runner-node/lib/evaluate-condition/evaluate-condition')

const {
  getNavigationPages
} = require('@ministryofjustice/fb-runner-node/lib/route/route')

const {
  setControlNames,
  setRepeatable
} = require('@ministryofjustice/fb-runner-node/lib/page/page')

const {
  getSourceInstanceProperty,
  loadServiceData,
  getInstance,
  getInstanceTitle,
  getInstanceProperty,
  setInstanceProperty,
  deleteInstanceProperty,
  getDiscreteInstance,
  getServiceSchema,
  getServiceInstances
} = require('~/fb-editor-node/lib/service-data/service-data')

const {
  setAdminPanels
} = require('~/fb-editor-node/lib/admin/route/admin.instance/admin.instance.controller')

const {
  getUrlFromPageData,
  isConditionalBoolean,
  getPropertyKey,
  getSchemaProperties,
  transformValueForComparison,
  transformValueToDataType
} = require('~/fb-editor-node/lib/admin/common')

const {
  isUploadCheckPage,
  isUploadSummaryPage
} = require('~/fb-editor-node/lib/admin/common/components/upload')

const includeUploadSteps = (step) => isUploadCheckPage(getDiscreteInstance(step._id)) || isUploadSummaryPage(getDiscreteInstance(step._id))
const excludeUploadSteps = (step) => !isUploadCheckPage(getDiscreteInstance(step._id)) && !isUploadSummaryPage(getDiscreteInstance(step._id))

function getPostRedirectToPreviousUrl ({ pageData, pageInstance }) {
  return pageData.getUserDataProperty('previouspage') || pageInstance.adminBack
}

function getPostRedirectUrl ({ _id, property, pageData }) {
  const redirectToPreviousUrl = getPostRedirectToPreviousUrl()

  return property === 'url' && redirectToPreviousUrl.endsWith('/edit')
    ? getInstanceProperty(_id, 'url').concat('/edit')
    : redirectToPreviousUrl
}

function populateError (e, pageInstance) {
  const errors = []
  const addError = initAddError(errors)

  addError(`Failed to write property instance: ${e.toString()}`, 'value')

  return setErrors(pageInstance, errors)
}

function setData (pageInstance, pageData, POST, REFERRER) {
  const _id = pageData.getUserDataProperty('_id')
  const parentProperty = pageData.getUserDataProperty('parentProperty')
  const property = pageData.getUserDataProperty('property')

  const runtimeInstance = getInstance(_id) || pageData.getUserDataProperty('runtimeInstance')

  if (!runtimeInstance || !runtimeInstance._type) {
    return pageInstance
  }

  if (property === 'url' && runtimeInstance.url === '/') {
    const getUrl = getUrlFromPageData(pageData)

    pageInstance.redirect = getUrl('admin.instance', {
      _id: runtimeInstance._id
    })
    return pageInstance
  }

  if (runtimeInstance.$autoInjected) {
    if (runtimeInstance._repeatableId) {
      const getUrl = getUrlFromPageData(pageData)

      const repeatableUrl = getUrl('admin.instance', {
        _id: runtimeInstance._repeatableId
      })
      pageInstance.redirect = repeatableUrl
      return pageInstance
    }
  }

  const discreteInstance = getDiscreteInstance(_id) || {}
  const actualProperty = property.replace(/:.+$/, '')

  const schema = getServiceSchema(runtimeInstance._type)
  let schemaProperties = schema.properties
  let parentPropertyTitle

  if (parentProperty) {
    const parentPropertyLookup = parentProperty.replace(/\./g, '.properties.')
    const parentPropertySchema = get(schemaProperties, parentPropertyLookup)
    if (!parentPropertySchema) {
      // 404 surely?
      return pageInstance
    }
    parentPropertyTitle = parentPropertySchema.title || parentProperty
    schemaProperties = parentPropertySchema.properties
  }
  const propertySchema = schemaProperties[actualProperty]

  if (!propertySchema) {
    // 404 surely?
    return pageInstance
  }

  const propertyTitle = propertySchema.title || property
  let propertyDescription = propertySchema.description || ''
  const instanceType = runtimeInstance._type.startsWith('page.') ? 'page' : 'component'
  propertyDescription = propertyDescription.replace(/page\/component/, instanceType)
  let valueType = propertySchema.type || 'text'
  const valueTypeRecord = valueType

  if (valueType === 'string') {
    valueType = 'text'
  }

  let hiddenValueRequired
  if (valueType === 'array' || valueType === 'object' || propertySchema.properties || propertySchema.items) {
    valueType = 'textarea'
    hiddenValueRequired = true
  }

  if (propertySchema.multiline) {
    valueType = 'textarea'
  }

  if (propertySchema.oneOf) {
    valueType = 'textarea'
  }

  if (propertySchema.pattern) {
    const [
      valueInstance
    ] = jsonPath.query(pageInstance, '$..[?(@._id === "admin.instance.property--value")]')

    valueInstance.validation = {
      pattern: propertySchema.pattern
    }
  }

  const conditionalBoolean = isConditionalBoolean(schemaProperties, property)

  if (conditionalBoolean) {
    valueType = 'textarea'

    const pages = getNavigationPages()

    const controls = []

    const discreteId = discreteInstance._id
    const updateControls = (_id, processNext, includeSelf) => {
      if (!processNext) {
        return
      }
      if (_id === discreteId) {
        if (!includeSelf) {
          return
        } else {
          processNext = false
        }
      }

      let pageInstance = getInstance(_id)
      pageInstance = setControlNames(pageInstance, pageData)
      pageInstance = setRepeatable(pageInstance, pageData, true)

      const controlInstances = jsonPath.query(pageInstance, '$..[?(@.name && @._type && @._type !== "button")]')
        .filter(({ _id }) => getInstance(_id))
        .map((instance) => {
          let enums
          if (instance.items) {
            enums = instance.items.map(item => {
              return {
                value: item.value,
                label: getInstanceTitle(item._id)
              }
            })
          }
          const name = instance.name.replace(/\[.+?\]/g, '[*]')

          const instances = getServiceInstances()

          const nameParts = name.split('.')
            .map((part, index, arr) => {
              const partType = index === arr.length - 1 ? 'property' : 'namespace'
              const adjustedPart = part.replace('[*]', '')
              const partBundle = {
                [partType]: adjustedPart,
                repeatable: part !== adjustedPart
              }

              let namespaceTitle
              if (partType === 'namespace') {
                const namespaceInstance = jsonPath.query(instances, `$..[?(@.namespace === "${adjustedPart}")]`)[0]
                if (namespaceInstance) {
                  namespaceTitle = getInstanceProperty(namespaceInstance._id, 'namespace[title]')
                  namespaceTitle = namespaceTitle || getInstanceTitle(namespaceInstance._id)
                  namespaceTitle = namespaceTitle || namespaceInstance._id
                }
              }
              if (namespaceTitle) {
                partBundle.namespaceTitle = namespaceTitle
              }
              return partBundle
            })

          const title = getInstanceTitle(instance._id)
          let fullTitle = title
          if (pageInstance._type !== 'page.singlequestion') {
            const titlePrefix = getInstanceProperty(_id, 'namespace[title]') || getInstanceProperty(_id, 'heading')
            if (titlePrefix) {
              fullTitle = `${titlePrefix} - ${title}`
            }
          }
          const repeatableTitle = instance.repeatableHeading

          const controlBundle = {
            name,
            type: instance._type,
            title,
            fullTitle,
            repeatableTitle,
            nameParts
          }
          if (enums) {
            controlBundle.enums = enums
          }
          return controlBundle
        })

      controls.push(...controlInstances)
      if (pages[_id].nextpage) {
        updateControls(pages[_id].nextpage, processNext, includeSelf)
      }
    }

    if (pages[discreteId].entrypage) {
      const includeSelf = ['showSteps']
      updateControls(pages[discreteId].entrypage, true, includeSelf.includes(property))
    }

    pageData.setUserDataProperty('booleanConditional', JSON.stringify(controls, null, 2))

    const allowableOperators = getEvaluationOperators()
    pageData.setUserDataProperty('allowableOperators', JSON.stringify(allowableOperators, null, 2))
  }

  let propertySingular = property
  propertySingular = propertySingular.replace(/ies$/, 'ey')
  propertySingular = propertySingular.replace(/s$/, '')

  pageData.setUserDataProperty('propertySingular', propertySingular)

  // TODO: adjust schema to parentPropertySchema if parentProperty
  const isRequired = schema.required && schema.required.includes(property)
  const valueRequired = isRequired ? 'true' : 'false'

  const createMode = pageData.getUserDataProperty('create')
  const instancePropertyKey = getPropertyKey(parentProperty, property)
  let value = createMode ? pageData.getUserDataProperty('value') : getSourceInstanceProperty(_id, instancePropertyKey, discreteInstance.$source)

  if (discreteInstance.$source !== 'service') {
    pageData.setUserDataProperty('instanceSource', discreteInstance.$source)
  }

  let deletable = false
  if (!isRequired && value !== undefined && !Array.isArray(value)) {
    deletable = true
    pageData.setUserDataProperty('deletable', true)
  } else {
    pageData.unsetUserDataProperty('deletable')
  }
  if (!deletable) {
    pageData.unsetUserDataProperty('delete-property')
  }
  if (pageData.getUserDataProperty('delete-property')) {
    pageInstance.skipValidation = true
  }

  let addUrl
  if (hiddenValueRequired) {
    let hiddenValue = value
    if (!value) {
      if (valueTypeRecord === 'array') {
        hiddenValue = []
      } else if (valueTypeRecord === 'object') {
        hiddenValue = {}
      }
    }

    if (runtimeInstance._type === 'table') {
      if (property === 'rows' || property === 'head') {
        hiddenValue = undefined
      }
    }

    if (Array.isArray(hiddenValue)) {
      const getUrl = getUrlFromPageData(pageData)

      pageData.setUserDataProperty('addValue', true)

      hiddenValue = hiddenValue
        .filter(excludeUploadSteps)
        .map((item) => {
          const _id = typeof item === 'string' ? item : item._id

          return {
            _id,
            data: item,
            title: getInstanceTitle(_id),
            url: getUrl('admin.instance', { _id })
          }
        })

      addUrl = getUrl('admin.instance.create.type', {
        addId: _id,
        addProperty: property
      })
    }

    hiddenValue = JSON.stringify(hiddenValue)

    pageData.setUserDataProperty('hiddenValue', hiddenValue)
  }

  let inheritedValue = createMode ? get(runtimeInstance, instancePropertyKey) : getInstanceProperty(_id, instancePropertyKey)
  if (typeof value !== 'string') {
    value = JSON.stringify(value, null, 2)
    if (value && value.match(/^\{[\s\S]*\}$/)) {
      valueType = 'textarea'
    }
    // TODO: Hmmmm, seems a bit pointless
    inheritedValue = ''
  }

  if (inheritedValue === value || inheritedValue === undefined) {
    inheritedValue = ''
  }

  let items
  if (valueType === 'boolean') {
    valueType = 'radios'
    items = [{
      _id: 'admin.instance.property--value--true',
      _type: 'radio',
      value: 'true',
      label: 'Yes'
    }, {
      _id: 'admin.instance.property--value--false',
      _type: 'radio',
      value: 'false',
      label: 'No'
    }]
  }

  const schemaEnum = propertySchema.enum
  if (schemaEnum) {
    const enumMap = propertySchema.enumMap || {}
    items = []
    valueType = 'radios'
    items = schemaEnum.map((enumValue) => {
      return {
        _id: `admin.instance.property--value--${enumValue}`,
        _type: 'radio',
        value: enumValue,
        label: enumMap[enumValue] || enumValue
      }
    })
  }

  const instanceRoute = createMode ? 'admin.instance.create' : 'admin.instance'

  const getUrl = getUrlFromPageData(pageData)

  const previouspage = pageData.getUserDataProperty('previouspage') || REFERRER || getUrl(instanceRoute, { _id })
  pageData.setUserDataProperty('previouspage', previouspage)

  const pagePropertyComponentId = `${instanceRoute}.property`
  const comp = jsonPath.query(pageInstance, `$..[?(@._id === "${pagePropertyComponentId}--value")]`)[0]
  comp._type = valueType
  if (valueType === 'radios') {
    comp.legend = comp.label
    delete comp.label
  }
  comp.validation = comp.validation || {}
  comp.validation.required = isRequired
  if (items) {
    comp.items = items
  }
  if (property.match(/^(accept)$/)) {
    addUrl = ''
  }
  if (addUrl) {
    pageData.setUserDataProperty('updateInstructions', true)
    pageInstance._template = 'admin-page.property.items'
    const addComp = jsonPath.query(pageInstance, `$..[?(@._id === "${pagePropertyComponentId}--add")]`)[0]
    addComp.href = addUrl
  }

  if (conditionalBoolean) {
    pageInstance._template = 'admin-page.property.booleanconditional'
  }

  pageInstance.adminBack = previouspage

  if (!POST) {
    pageData.setUserDataProperty('value', value)
  }

  if (value === undefined) {
    value = schemaProperties[property].default
    if (runtimeInstance._type === 'checkboxes') {
      value = false
    }

    pageData.setUserDataProperty('value', value)
  }

  if (conditionalBoolean) {
    if (typeof value === 'object' || typeof value === 'boolean') {
      pageData.setUserDataProperty('value', JSON.stringify(value))
    }
  }

  pageData.setUserDataProperty('instanceTitle', getInstanceTitle(_id))
  pageData.setUserDataProperty('instanceType', instanceType)
  pageData.setUserDataProperty('valueRequired', valueRequired)
  pageData.setUserDataProperty('valueType', valueType)
  pageData.setUserDataProperty('parentPropertyTitle', parentPropertyTitle)
  pageData.setUserDataProperty('propertyTitle', propertyTitle)
  pageData.setUserDataProperty('propertyDescription', propertyDescription)
  pageData.setUserDataProperty('inheritedValue', inheritedValue)

  const MODEURL = getInstanceProperty(discreteInstance._id, 'url')
  pageInstance.MODEURL = MODEURL
  pageInstance.MODE = 'instance'

  pageInstance = setAdminPanels(pageInstance, runtimeInstance, discreteInstance, pageData, {
    currentInstanceLink: true,
    property
  })

  return pageInstance
}

/*
 *  Upload steps are removed from the "order steps" list and are added
 *  here from the list kept on the instance
 */
const addUploadSteps = (currentValue = [], value = []) => currentValue
  .filter(includeUploadSteps)
  .concat(value)

function getInstancePropertyKey (pageData) {
  const parentProperty = pageData.getUserDataProperty('parentProperty')
  const property = pageData.getUserDataProperty('property')

  return getPropertyKey(parentProperty, property)
}

function getInstancePropertyValue (_id, pageData) {
  const instancePropertyKey = getInstancePropertyKey(pageData)
  let instancePropertyValue

  const parentProperty = pageData.getUserDataProperty('parentProperty')
  const property = pageData.getUserDataProperty('property')
  const value = pageData.getUserDataProperty('value')

  const instance = getInstance(_id)
  const {
    _type
  } = instance

  const schemaProperties = getSchemaProperties(_type, parentProperty)

  if (instancePropertyKey === 'steps') {
    const {
      [property]: currentValue
    } = instance

    instancePropertyValue = addUploadSteps(currentValue, transformValueToDataType(value, schemaProperties, property))
  } else {
    instancePropertyValue = transformValueToDataType(value, schemaProperties, property)
  }

  return instancePropertyValue
}

async function postValidation (pageInstance, pageData, postRedirect) {
  const _id = pageData.getUserDataProperty('_id')
  const instancePropertyKey = getInstancePropertyKey(pageData)
  let instancePropertyValue // `undefined` is acceptable

  try {
    if (pageData.getUserDataProperty('delete-property') === 'yes') {
      await deleteInstanceProperty(_id, instancePropertyKey)
    } else {
      instancePropertyValue = getInstancePropertyValue(_id, pageData)

      await setInstanceProperty(_id, instancePropertyKey, instancePropertyValue)
    }

    await loadServiceData()

    /*
     *  All subsequent work depends on `postRedirect`
     */
    if (postRedirect) {
      const {
        _type
      } = getInstance(_id)

      const {
        $source
      } = getDiscreteInstance(_id)

      const property = pageData.getUserDataProperty('property')

      const previousValue = getSourceInstanceProperty(_id, instancePropertyKey, $source)

      const parameters = { _id, _type, pageInstance, pageData, property }

      /*
       *  Where are we going?
       */
      return transformValueForComparison(instancePropertyValue) === transformValueForComparison(previousValue) // instancePropertyValue may be `undefined`
        ? postRedirect.redirect(getPostRedirectToPreviousUrl(parameters))
        : postRedirect.redirect(getPostRedirectUrl(parameters))
    }
  } catch (e) {
    if (postRedirect) return postRedirect.failure(populateError(e, pageInstance), pageData)
  }
}

module.exports = {
  setData,
  postValidation
}
