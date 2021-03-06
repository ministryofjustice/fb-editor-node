require('@ministryofjustice/module-alias/register')

// TODO: Move Based on _isa to top section
// TODO: Macroize top section
// TODO: create additional error strings for errors that don't correspond to validation rules (and allow for them to be created in first place)
// TODO: Make schema titles and descriptions for summary, inline, widthInputClass

const jsonPath = require('jsonpath')
const get = require('lodash.get')
const cloneDeep = require('lodash.clonedeep')

const {
  initAddError,
  setErrors
} = require('@ministryofjustice/fb-runner-node/lib/page/set-errors/set-errors')

const {
  loadServiceData,
  getInstance,
  getDiscreteInstance,
  getSourceInstance,
  getInstanceTitle,
  getInstanceProperty,
  getInstancesByPropertyValue,
  getString,
  setInstance,
  getServiceSchema,
  expandInstance,
  deleteInstance
} = require('~/fb-editor-node/lib/service-data/service-data')

const {
  getNavigation
} = require('@ministryofjustice/fb-runner-node/lib/route/route')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/lib/admin/common')

const {
  isUploadComponent
} = require('~/fb-editor-node/lib/admin/common/components/upload')

const {
  createUploadCheckStep,
  createUploadSummaryStep
} = require('~/fb-editor-node/lib/admin/route/admin.instance.create.id/admin.instance.create.id.controller')

const {
  deleteUploadCheckStep,
  deleteUploadSummaryStep
} = require('~/fb-editor-node/lib/admin/route/admin.instance.delete/admin.instance.delete.controller')

const defaultOrder = [
  '_id',
  '_type',
  '_isa',
  'url',
  'name',
  'heading',
  'lede',
  'label',
  'legend',
  'hint',
  'body',
  'content',
  'components',
  'enableSteps',
  'steps',
  'continue',
  'actionType',
  'validation',
  'errors',
  'show',
  'namespace',
  'namespaceProtect',
  'title',
  'extraComponents',
  'sectionHeading',
  'stepsHeading',
  'nextPage',
  'widthClassInput',
  'widthClass',
  'id',
  'classes',
  'attributes',
  'multiple',
  'repeatable',
  'repeatableHeading',
  'repeatableLede',
  'repeatableMinimum',
  'repeatableMaximum',
  'repeatableAdd',
  'repeatableDelete',
  'repeatableRemove'
]

const indexMap = {}

const createOrderedSort = (order) => {
  for (let i = 0, j = order.length; i < j; i++) {
    indexMap[order[i]] = i
  }
}

createOrderedSort(defaultOrder)

async function resolveUploadComponent (pageInstance = {}, { maxFiles = 1 } = {}, referrer = '/') {
  if (maxFiles > 0) await createUploadCheckStep(pageInstance)
  if (maxFiles > 1) await createUploadSummaryStep(pageInstance)
  if (maxFiles < 2) await deleteUploadSummaryStep(pageInstance, referrer)
  if (maxFiles < 1) await deleteUploadCheckStep(pageInstance, referrer)
}

function getDataStructure (instance, instanceId, pageData, options = {}, heading) {
  const schema = getServiceSchema(instance._type) || getServiceSchema(`definition.${instance._type}`)
  if (!schema) {
    return
  }

  const getUrl = getUrlFromPageData(pageData)

  const url = getUrl('admin.instance', {
    _id: instance._id
  })
  const currentInstance = instance._id === instanceId
  const title = getInstanceTitle(instance._id)
  let type = schema.title || instance._type
  let compType = 'Component'
  if (instance._type.startsWith('page.')) {
    if (!type.includes('page')) {
      type += ' page'
    }
    compType = 'Page'
  }
  const structure = {
    url,
    title,
    type,
    currentInstance
  }
  if (currentInstance && options.currentInstanceLink) {
    structure.currentInstanceLink = true
  }

  const schemaProperties = schema.properties
  Object.keys(schemaProperties).forEach(property => {
    if (!instance[property] && (!schema.required || !schema.required.includes(property))) {
      return
    }
    const schemaProperty = schemaProperties[property]

    const schemaPropertyItems = schemaProperty.items
    if (schemaPropertyItems && schemaPropertyItems._name && schemaPropertyItems._name !== 'definition.data') {
      const structureItems = instance[property] ? instance[property].map(propertyInstance => getDataStructure(propertyInstance, instanceId, pageData, options)) : []
      structure.structure = structure.structure || []
      structure.structure.push({
        componentTypeTitle: schemaProperty.title,
        componentType: property,
        components: structureItems
      })
    } else if (schemaProperty.nestable) {
      structure.structure = [{
        componentTypeTitle: schemaProperty.title,
        componentType: property,
        components: [getDataStructure(instance[property], instanceId, pageData, options)]
      }]
    }
  })
  if (heading) {
    structure.heading = heading
    structure.top = true
    structure._type = 'datastructure'
    if (!structure.structure) {
      structure.empty = `${compType} has no nested components`
    }
  }
  return structure
}

function getPageHierarchy (instance, instanceId, pageData, options = {}, heading) {
  if (typeof instanceId === 'string') {
    instanceId = [instanceId]
  }

  if (heading) {
    let entryInstance = instance
    while (entryInstance._parent) {
      instanceId.push(entryInstance._parent)
      entryInstance = getInstance(entryInstance._parent)
    }
    const structure = getPageHierarchy(entryInstance, instanceId, pageData, options)
    structure.heading = heading
    structure.top = true
    structure._type = 'datastructure'
    return structure
  }

  const getUrl = getUrlFromPageData(pageData)

  let url = getUrl('admin.instance', {
    _id: instance._id
  })
  if (options.linkType === 'edit') {
    url = `${getInstanceProperty(instance._id, 'url')}/edit`
    if (url === '//edit') {
      url = '/edit'
    }
  }
  const currentInstance = instance._id === instanceId[0]
  const title = getInstanceTitle(instance._id)

  const structure = {
    url,
    title,
    currentInstance
  }
  if (currentInstance && options.currentInstanceLink) {
    structure.currentInstanceLink = true
  }
  if (instance.steps) {
    let steps = instance.steps
    if (options.showInstancePath) {
      steps = steps.filter(stepId => currentInstance || instanceId.includes(stepId))
    }
    const stepInstances = steps
      .map(stepInstance => getInstance(stepInstance))
      .filter(stepInstance => !stepInstance.$autoInjected)
    const stepPages = stepInstances.map(stepInstance => getPageHierarchy(stepInstance, instanceId, pageData, options))
    if (options.showSkipped) {
      const showSkippedSteps = steps.length || options.showSkippedSteps
      if (!currentInstance && showSkippedSteps) {
        if (steps.length !== instance.steps) {
          const instanceStepsLength = instance.steps.length
          if (instanceStepsLength !== 1) {
            const stepIndex = instance.steps.indexOf(steps[0])
            if (stepIndex) {
              stepPages.unshift({ skipped: true })
            }
            if (steps.length && stepIndex < instanceStepsLength - 1) {
              stepPages.push({ skipped: true })
            }
          }
        }
      }
    }
    structure.structure = [{
      components: stepPages
    }]
  }
  return structure
}

function setAdminPanels (pageInstance, runtimeInstance, discreteInstance, pageData, options = {}) {
  options = Object.assign({
    id: true,
    structure: true,
    hierarchy: true,
    basedOn: false,
    usedBy: false,
    currentInstanceLink: false
  }, options)

  const getUrl = getUrlFromPageData(pageData)

  const { _id } = runtimeInstance
  const isDiscreteInstancePage = discreteInstance._type.startsWith('page.')
  const structureHeading = isDiscreteInstancePage ? 'Page structure' : 'Component structure'
  const dataStructure = getDataStructure(discreteInstance, _id, pageData, options, structureHeading)
  let usedBy
  if (_id === discreteInstance._id) {
    const isaInstances = getInstancesByPropertyValue('_isa', _id)
    usedBy = isaInstances.map(isaInstance => {
      return {
        text: `${getInstanceTitle(isaInstance._id)} (${isaInstance._id})`,
        href: getUrl('admin.instance', { _id: isaInstance._id })
      }
    })
    if (!usedBy.length) {
      usedBy = undefined
    }
  }

  const buildUrl = getUrl(discreteInstance._id, {})
  if (buildUrl) {
    pageInstance.adminBack = `${buildUrl === '/' ? '' : buildUrl}/edit`
  }

  if (_id === 'service') {
    let heading
    if (options.property) {
      heading = 'sectionHeading'
      if (!pageInstance.adminBack) {
        pageInstance.adminBack = getUrl('admin.instance', { _id: 'service' })
      }
    } else {
      delete pageInstance.adminBack
      delete pageInstance.sectionHeading
      heading = 'heading'
    }
    pageInstance[heading] = 'Settings'
    return pageInstance
  }

  const asideComponents = []
  if (options.structure) {
    asideComponents.push(dataStructure)
  }
  if (options.basedOn) {
    asideComponents.push({
      _type: 'adminpanel',
      heading: 'Based on',
      classes: 'fb-instance-isa',
      block: {
        _id: 'fb-instance-isa',
        _type: 'content',
        html: '{basedOn, select, other{Based on [{basedOn}]({basedOnUrl}) [(Change)]({setBasedOnUrl})} undefined{Not based on anything [(Set)]({setBasedOnUrl})}}'
      }
    })
  }
  if (options.usedBy) {
    if (usedBy) {
      asideComponents.push({
        _type: 'adminpanel',
        heading: 'Used by',
        block: {
          _id: 'fb-instance-usedby',
          _type: 'list',
          items: usedBy
        }
      })
    }
  }

  pageInstance.asideComponents = asideComponents

  pageInstance = cloneDeep(pageInstance)
  return pageInstance
}

function getPostRedirectUrl ({ pageData, _id }) {
  const {
    _id: discreteId
  } = getDiscreteInstance(_id)

  if (discreteId === _id) {
    return '/admin'
  } else {
    const getUrl = getUrlFromPageData(pageData)

    return getUrl('admin.instance', { _id: discreteId })
  }
}

function populateDeleteInstanceError (e, pageInstance) {
  const errors = []
  const addError = initAddError(errors)

  addError(`Failed to delete instance: ${e.toString()}`)

  return setErrors(pageInstance, errors)
}

function populateWriteInstanceError (e, pageInstance) {
  const errors = []
  const addError = initAddError(errors)

  addError(`Failed to write instance: ${e.toString()}`, 'instance')

  return setErrors(pageInstance, errors)
}

async function setData (pageInstance, pageData, POST, REFERRER) {
  const _id = pageData.getUserDataProperty('_id')
  const runtimeInstance = getInstance(_id) || pageData.getUserDataProperty('runtimeInstance')
  if (!runtimeInstance || !runtimeInstance._type) {
    return pageInstance
  }

  /*
   *  Specific to MOJ component
   */
  if (isUploadComponent(runtimeInstance)) await resolveUploadComponent(getDiscreteInstance(_id), runtimeInstance, REFERRER)

  const getUrl = getUrlFromPageData(pageData)

  if (runtimeInstance.$autoInjected) {
    if (runtimeInstance._repeatableId) {
      const repeatableUrl = getUrl('admin.instance', {
        _id: runtimeInstance._repeatableId
      })
      pageInstance.redirect = repeatableUrl
      return pageInstance
    }
  }

  const instanceType = runtimeInstance._type
  const instanceTitle = getInstanceTitle(_id)

  const discreteInstance = getDiscreteInstance(_id) || {}

  const isPage = runtimeInstance._type.startsWith('page.')

  const instanceCategory = isPage ? 'Page' : 'Component'
  pageData.setUserDataProperty('instanceCategory', instanceCategory)
  if (instanceCategory !== 'Page') {
    pageData.setUserDataProperty('showBasedOn', true)
  }

  if (runtimeInstance._isa) {
    pageData.setUserDataProperty('_isa', runtimeInstance._isa)
    const basedOn = getInstanceTitle(runtimeInstance._isa)
    pageData.setUserDataProperty('basedOn', basedOn)
    const basedOnUrl = getUrl('admin.instance', {
      _id: runtimeInstance._isa
    })
    pageData.setUserDataProperty('basedOnUrl', basedOnUrl)
  }
  const setBasedOnUrl = getUrl('admin.instance.property', {
    _id,
    property: '_isa'
  })
  pageData.setUserDataProperty('setBasedOnUrl', setBasedOnUrl)

  if (isPage) {
    pageData.setUserDataProperty('instanceUrl', runtimeInstance.url)
  }

  let deletable = false
  if (discreteInstance._id === _id) {
    if (!discreteInstance._type.startsWith('config.')) {
      pageData.setUserDataProperty('discreteInstance', true)
    }
  }
  if (!pageData.getUserDataProperty('usedBy')) {
    if (discreteInstance.$source === 'service') {
      if (getInstanceProperty(_id, 'url') !== '/') {
        deletable = true
        pageData.setUserDataProperty('deletable', true)
      } else {
        pageData.unsetUserDataProperty('discreteInstance')
      }
    }
  }
  if (!deletable) {
    pageData.unsetUserDataProperty('delete-instance')
  }
  if (pageData.getUserDataProperty('delete-instance')) {
    pageInstance.skipValidation = true
  }

  const setPageInstanceNavigation = (pageInstance, navigation) => {
    const setNavDirection = (direction) => {
      const _id = navigation[direction] || navigation[`${direction}page`]
      if (_id) {
        pageInstance.preview = pageInstance.preview || {}
        const title = getInstanceTitle(_id)
        const url = getUrl('admin.instance', {
          _id
        })
        const navItem = {
          title,
          url
        }
        pageInstance.preview[direction] = navItem
      }
    }
    setNavDirection('next')
    setNavDirection('previous')

    return pageInstance
  }

  const MODEURL = getInstanceProperty(discreteInstance._id, 'url', '').replace(/\/:[^/]+/g, '/1')
  pageInstance.MODEURL = MODEURL
  pageInstance.MODE = 'instance'
  pageInstance.EDITMODE = 'instance'
  const navigation = getNavigation(discreteInstance._id) || {}
  pageInstance = setPageInstanceNavigation(pageInstance, navigation)

  const createMode = pageData.getUserDataProperty('create')
  const propertyRoute = createMode ? 'admin.instance.create.property' : 'admin.instance.property'

  const sourceInstance = getSourceInstance(_id, discreteInstance.$source) || pageData.getUserDataProperty('sourceInstance')
  const schema = getServiceSchema(sourceInstance._type)
  let propertyTitle = schema.title || sourceInstance._type
  if (isPage && !propertyTitle.includes('page')) {
    propertyTitle += ' page'
  }
  const propertyDescription = schema.description
  const notSet = '<em>Not set</em>' // '*Not set*'
  const inherited = ' <em>Inherited</em>' // ' *Inherited*'
  const optionalText = ' <em class="fb-property-optional">optional</em>' // ' *(optional)*'

  const getPropValue = (instanceValue, runtimeInstanceValue, defaultValue) => {
    let value = instanceValue
    if (value === undefined) {
      value = runtimeInstanceValue
      if (value) {
        value += ' <i>Inherited</i>'
      }
    }
    if (value === undefined) {
      value = '<i>Not set</i>' // notSet
      if (defaultValue) {
        value = `${defaultValue} <em class="fb-value-default">default</em>`
      }
    }
    return value
  }
  const surplusProperties = schema.surplusProperties || []
  const allInstanceProps = Object.keys(schema.properties)
    .filter(property => !property.match(/^(_id|_type|_isa|validation|errors)$/))
    .filter(property => !get(schema.properties[property], 'const'))
    .filter(property => !surplusProperties.includes(property))
    .filter(property => {
      let excluded = []
      const schemaProperties = schema.properties
      if (schemaProperties.enableSteps) {
        if (schemaProperties.enableSteps.const) {
          excluded = excluded.concat(['enableSteps'])
        } else if (!sourceInstance.enableSteps) {
          excluded = excluded.concat(['steps', 'stepsHeading', 'showSteps'])
        }
      }
      if (instanceType === 'page.singlequestion') {
        excluded = excluded.concat(['heading'])
      }
      if (instanceType.startsWith('page.')) {
        excluded = excluded.concat(['repeatable'])
      }
      if (instanceType === 'upload') {
        excluded = excluded.concat(['repeatable'])
      }
      if (excluded.length) {
        return !excluded.includes(property)
      }
      return true
    })
    // .sort(sortProperties)
    .sort((a, b) => {
      if (a === '_isa') { return -1 }
      if (b === '_isa') { return 1 }
      if (!schema.required) {
        return -1
      }
      const required = schema.required
      const aRequired = required.includes(a)
      const bRequired = required.includes(b)
      if (aRequired === bRequired) {
        return indexMap[a] - indexMap[b]
      }
      return aRequired ? -1 : 1
    })
    .map(property => {
      const nestedPropertySchema = schema.properties[property]
      const nestedPropertyTitle = nestedPropertySchema.title || property
      const nestedPropertyDescription = nestedPropertySchema.description
      let optional = false
      if (!schema.required || !schema.required.includes(property)) {
        optional = true
      }
      let value = sourceInstance[property]
      if (value === undefined && runtimeInstance[property] !== undefined) {
        if (!runtimeInstance[`$FALLBACK${property}`]) {
          value = `${runtimeInstance[property]}${inherited}`
        }
      }
      if (value === undefined) {
        value = notSet
      }
      let valueLength
      let items
      let addItem
      let deleteItem
      if (Array.isArray(value)) {
        items = []
        valueLength = value.length
        const valueIds = value.map(obj => {
          if (property === 'steps') {
            return obj
          }
          return obj._id
        }).filter(_id => _id)
        valueIds.forEach(_id => {
          const title = getInstanceTitle(_id)
          const url = getUrl('admin.instance', {
            _id
          })
          items.push({
            title,
            url
          })
        })
        // value is no longer needed
        value = ''
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value, null, 2)
      }
      if (nestedPropertySchema.category && nestedPropertySchema.category.includes('component')) {
        if (!value || value === notSet) {
          const addTitle = `Add ${property}`
          const addUrl = getUrl('admin.instance.create.type', {
            addId: _id,
            addProperty: property
          })
          addItem = {
            title: addTitle,
            url: addUrl
          }
        } else {
          const valueId = JSON.parse(value)._id
          const title = getInstanceTitle(valueId)
          const url = getUrl('admin.instance', {
            _id: valueId
          })
          items = [{
            title,
            url
          }]
        }
        value = ''
      }
      if (nestedPropertySchema.type === 'array') {
        let includeAdd = true
        if (nestedPropertySchema.maxItems !== undefined && valueLength >= nestedPropertySchema.maxItems) {
          includeAdd = false
        }
        if (runtimeInstance._type === 'table') {
          if (property === 'rows' || property === 'head') {
            includeAdd = false
          }
        }
        if (includeAdd) {
          const addPropertyName = property.replace(/s$/, '')
          // instanceType/new/:addId?/:addProperty
          const addTitle = `Add ${addPropertyName}`
          const addUrl = getUrl('admin.instance.create.type', {
            addId: _id,
            addProperty: property
          })
          addItem = {
            title: addTitle,
            url: addUrl
          }
        }
      }
      const defaultValue = nestedPropertySchema.default
      if (value === notSet && defaultValue) {
        value = `${defaultValue} <em class="fb-value-default">default</em>`
      }

      const title = nestedPropertyTitle
      const description = nestedPropertyDescription
      let url = getUrl(propertyRoute, {
        _id,
        property
      })

      if (nestedPropertySchema.properties) {
        const propJSON = sourceInstance[property] || {}

        url = getUrl('admin.instance', {
          _id: propJSON._id
        })
      }

      if (property === 'url' && value === '/') {
        url = ''
      }

      if (optional) {
        optional = optionalText
      }
      let zeinherited

      const zebundle = {
        category: nestedPropertySchema.category ? nestedPropertySchema.category[0] : undefined,
        title,
        description,
        url,
        optional,
        value,
        defaultValue,
        inherited: zeinherited,
        items,
        addItem,
        deleteItem,
        property
      }
      return zebundle
    })

  const getPropBundle = (bundleProp, bundleSchema, bundleValues, bundleInheritedValues, bundleParentProp, bundleNestedProp) => {
    let bundlePropSchema = bundleSchema.properties[bundleProp]
    if (bundleNestedProp) {
      bundlePropSchema = bundlePropSchema.properties[bundleNestedProp]
    }
    let title = bundlePropSchema.title
    if (!title) {
      title = bundleNestedProp || bundleProp
    }
    const description = bundlePropSchema.description

    const propertyLookup = bundleNestedProp ? `${bundleProp}.${bundleNestedProp}` : bundleProp

    const instanceValue = get(bundleValues, propertyLookup)
    const inheritedInstanceValue = get(bundleInheritedValues, propertyLookup)
    let defaultValue = bundlePropSchema.default
    if (instanceType === 'checkboxes' && propertyLookup === 'required') {
      defaultValue = false
    }

    if (!defaultValue && bundleParentProp === 'errors') {
      const typeLookup = propertyLookup.replace(/(\.[^.]+)$/, `.${instanceType}$1`)
      const errorType = `error.${typeLookup.replace(/\.any$/, '')}`
      defaultValue = getString(errorType)
      if (!defaultValue) {
        const errorProperty = `error.${propertyLookup.replace(/\.any$/, '')}`
        defaultValue = getString(errorProperty)
      }
    }
    let value = getPropValue(instanceValue, inheritedInstanceValue, defaultValue)
    if (typeof value === 'object') {
      value = JSON.stringify(value)
    }

    const parentProperty = bundleNestedProp ? `${bundleParentProp}.${bundleProp}` : bundleParentProp
    const property = bundleNestedProp || bundleProp

    const optional = optionalText

    const url = getUrl(propertyRoute, {
      _id,
      parentProperty,
      property
    })
    let inherited
    const validationPropBundle = {
      _id: `propBundle.${propertyLookup}`,
      title,
      description,
      url,
      optional,
      value,
      defaultValue,
      instanceValue,
      inheritedInstanceValue,
      inherited
    }
    return validationPropBundle
  }

  const errorTypes = ['any', 'summary', 'inline']
  const errorsSchema = schema.properties.errors || {}
  const errorsValues = sourceInstance.errors || {}
  const inheritedErrorsValues = sourceInstance._isa ? runtimeInstance.errors || {} : {}
  const validationSchema = schema.properties.validation || {}
  const validationValues = sourceInstance.validation || {}
  const inheritedValidationValues = sourceInstance._isa ? runtimeInstance.validation || {} : {}
  const validationProps = Object.keys(validationSchema.properties ||
    [])
    .filter(property => !property.startsWith('formatM'))
    .filter(property => !property.startsWith('exclusiveM'))
    .filter(property => instanceType !== 'email' || property === 'required' || property === 'format')
    .filter(property => instanceType === 'email' || property !== 'format')
    .map(validationProp => {
      const validationPropBundle = getPropBundle(validationProp, validationSchema, validationValues, inheritedValidationValues, 'validation')

      const { instanceValue, inheritedInstanceValue } = validationPropBundle
      let needErrorProps = instanceValue !== undefined || inheritedInstanceValue !== undefined
      // special case for required since all fields are required by default
      if (validationProp === 'required' && instanceType !== 'checkboxes') {
        needErrorProps = instanceValue !== false && inheritedInstanceValue !== false
      }
      if (instanceType === 'email' && validationProp === 'format') {
        needErrorProps = true
      }
      if (needErrorProps) {
        const errorComponents = errorTypes.map(errorType => {
          const propBundle = getPropBundle(validationProp, errorsSchema, errorsValues, inheritedErrorsValues, 'errors', errorType)
          return propBundle
        })
        if (errorComponents.length) {
          validationPropBundle._type = 'details'
          validationPropBundle._id = `admin.instance.${validationProp}.errors`
          validationPropBundle.summary = 'Error messages'
          validationPropBundle.open = true
          validationPropBundle.components = [{
            _type: 'propertylist',
            items: errorComponents
          }]
        }
      }

      return validationPropBundle
    })

  const addProps = (propsType, props) => {
    if (!props) {
      return
    }
    if (props.length) {
      pageData.setUserDataProperty(`${propsType}Properties`, true)
    }
    const propsComp = jsonPath.query(pageInstance, `$..[?(@._id === "admin.instance--properties.${propsType}")]`)[0]
    if (propsComp) {
      if (propsType === 'main') {
        propsComp.items = props
      } else {
        propsComp.components = [
          {
            _type: 'propertylist',
            items: props
          }
        ]
      }
    }
  }

  const uiCategory = schema.uiCategory || {}

  const mainProps = allInstanceProps.filter(prop => {
    return prop.property === 'name' || !prop.category || (uiCategory.main || []).includes(prop.property)
  })

  const filterProps = (instanceProps, category) => {
    return instanceProps.filter(prop => {
      return prop.category === category || (uiCategory[category] || []).includes(prop.property)
    })
  }

  const repeatableProps = getInstanceProperty(_id, 'repeatable') ? filterProps(allInstanceProps, 'repeatable') : undefined
  const userinputProps = filterProps(allInstanceProps, 'userinput')
  const logicProps = filterProps(allInstanceProps, 'logic')
  const contentProps = filterProps(allInstanceProps, 'content')
  const htmlProps = filterProps(allInstanceProps, 'htmlattributes')
  const additionalProps = filterProps(allInstanceProps, 'additional')

  addProps('main', mainProps)
  addProps('userinput', userinputProps)
  addProps('validation', validationProps)
  addProps('repeatable', repeatableProps)
  addProps('logic', logicProps)
  addProps('content', contentProps)
  addProps('html', htmlProps)
  addProps('additional', additionalProps)

  pageData.setUserDataProperty('instanceTitle', instanceTitle)
  pageData.setUserDataProperty('instanceType', instanceType) // instanceTypeUrl
  pageData.setUserDataProperty('typeTitle', propertyTitle)
  pageData.setUserDataProperty('instanceHint', propertyDescription || '')

  pageData.setUserDataProperty('expandedInstance', JSON.stringify(runtimeInstance, null, 2))

  if (!POST) {
    pageData.setUserDataProperty('instance', JSON.stringify(sourceInstance, null, 2))
  }

  pageInstance = setAdminPanels(pageInstance, runtimeInstance, discreteInstance, pageData, {
    basedOn: true,
    usedBy: true
  })

  return pageInstance
}

function validate (pageInstance, pageData, POST, ajv) {
  if (pageData.getUserDataProperty('delete-instance')) {
    return pageInstance
  }

  const instanceErrors = []
  const addError = initAddError(instanceErrors)

  let instanceIn = pageData.getUserDataProperty('instance')
  if (instanceIn) {
    const _id = pageData.getUserDataProperty('_id')
    const runtimeInstance = getInstance(_id) || pageData.getUserDataProperty('runtimeInstance')
    if (!runtimeInstance) {
      addError('instance.notfound')
      pageInstance = setErrors(pageInstance, instanceErrors)
      return pageInstance
    }

    const seenValidationErrors = {}
    const updateCheckbox = (instance) => {
      if (instance._type === 'checkbox') {
        if (instance.value === undefined) {
          instance.value = 'yes'
        }
      }
      return instance
    }
    const validateInstance = (instance, validationPath = '') => {
      const errors = []
      const schema = getServiceSchema(instance._type)
      if (schema) {
        let instanceClone = expandInstance(instance, addError)
        // ensure checkbox defaults
        instanceClone = updateCheckbox(instanceClone)
        jsonPath.apply(instanceClone, '$..[?(@._type === "checkbox")]', value => updateCheckbox(value))

        const valid = ajv.validate(instance._type, instanceClone)
        if (!valid) {
          const ajvErrors = ajv.errors.map(err => {
            const errObj = Object.assign({}, err)
            errObj.dataPath = validationPath + (errObj.dataPath ? errObj.dataPath : '')
            return errObj
          }).filter(errObj => {
            const errKey = `${errObj.keyword}:${errObj.dataPath}`
            const alreadySeen = seenValidationErrors[errKey]
            seenValidationErrors[errKey] = true
            return !alreadySeen
          })

          errors.push(...ajvErrors)
        }
        const schemaProperties = schema.properties
        const arrayProperties = Object.keys(schemaProperties).filter(prop => {
          return schemaProperties[prop].type && schemaProperties[prop].type === 'array'
        })
        arrayProperties.forEach(arrayProp => {
          const instanceItems = instance[arrayProp]
          if (Array.isArray(instanceItems)) {
            instanceItems.forEach((instanceItem, index) => {
              if (instanceItem._id) {
                const nestedValidationPath = `${validationPath}.${arrayProp}[${index}]`
                errors.push(...validateInstance(instanceItem, nestedValidationPath))
              }
            })
          }
        })
      } else {
        addError('instance.validation.schema.missing', 'instance', { type: instance._type })
      }
      return errors
    }

    const schema = getServiceSchema(runtimeInstance._type)
    try {
      instanceIn = JSON.parse(instanceIn)
      try {
        if (_id !== instanceIn._id) {
          addError('instance.id.incorrect', 'instance')
        } else {
          const validationErrors = validateInstance(instanceIn)
          validationErrors.forEach(error => {
            // TODO - really only do on post?
            if (!POST && !error.dataPath && error.keyword === 'required') {
              const getUrl = getUrlFromPageData(pageData)

              const schemaProperties = schema.properties
              const property = error.params.missingProperty
              const title = schemaProperties[property].title || property
              const infoMessage = title
              const infoUrl = getUrl('admin.instance.property', {
                _id,
                property
              })
              pageInstance.infoList = pageInstance.infoList || []
              pageInstance.infoList.push({
                html: infoMessage,
                href: infoUrl
              })
            } else {
              if (error.dataPath) {
                try {
                  const getUrl = getUrlFromPageData(pageData)

                  const dataPathInstance = get(instanceIn, error.dataPath.replace(/^\./, ''))
                  const dataPathTitle = getInstanceTitle(dataPathInstance._id)
                  const dataPathUrl = getUrl('admin.instance', {
                    _id: dataPathInstance._id
                  })
                  addError(`Nested component ${dataPathTitle} ${error.message}==${dataPathUrl}`)
                } catch (e) {
                  addError(`‘{control}’ ${error.dataPath ? error.dataPath : ''} ${error.message}`, 'instance')
                }
              } else {
                addError(`‘{control}’ ${error.dataPath ? error.dataPath : ''} ${error.message}`, 'instance')
              }
            }
          })
          if (pageInstance.infoList) {
            pageInstance.infoTitle = 'You need to set'
          }
        }
      } catch (e) {
        addError('instance.validation.fatal', 'instance')
      }
    } catch (e) { // Invalid JSON
      addError('instance.parse', 'instance')
    }
  }

  pageInstance = setErrors(pageInstance, instanceErrors)

  return pageInstance
}

async function postValidation (pageInstance, pageData, postRedirect) {
  const _id = pageData.getUserDataProperty('_id')

  if (pageData.getUserDataProperty('delete-instance')) {
    try {
      await deleteInstance(_id)
      await loadServiceData()

      /*
       *  A conditional return
       */
      if (postRedirect) return postRedirect.redirect(getPostRedirectUrl({ pageData, _id }))
    } catch (e) {
      /*
       *  As above
       */
      if (postRedirect) return postRedirect.failure(populateDeleteInstanceError(e, pageInstance), pageData)
    }
  } else {
    /*
     *  Get as a string
     */
    const instance = pageData.getUserDataProperty('instance')

    /*
     *  Subsequent work depends on `postRedirect`
     */
    if (postRedirect) {
      const {
        $source
      } = getDiscreteInstance(_id)

      /*
       *  Get as an object, transform to a string
       */
      const sourceInstance = JSON.stringify(getSourceInstance(_id, $source))

      /*
       *  Compare as strings
       */
      if (instance === sourceInstance) return postRedirect && postRedirect.success()
    }

    /*
     *  Transform to an object
     */
    try {
      await setInstance(JSON.parse(instance))
      await loadServiceData()

      /*
       *  Either a conditional return, or implicit (at the end of the function)
       */
      if (postRedirect) return postRedirect.success()
    } catch (e) {
      /*
       *  As above
       */
      if (postRedirect) return postRedirect.failure(populateWriteInstanceError(e, pageInstance), pageData)
    }
  }
}

module.exports = {
  getPageHierarchy,
  setAdminPanels,
  setData,
  validate,
  postValidation
}
