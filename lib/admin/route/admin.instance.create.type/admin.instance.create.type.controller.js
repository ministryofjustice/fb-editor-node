require('@ministryofjustice/module-alias/register')

const jsonPath = require('jsonpath')

const {
  getInstance,
  getServiceSchema,
  getSchemaNameByCategory,
  getSchemaPropertyAllowableTypes
} = require('~/fb-editor-node/service-data/service-data')

const {
  getUrlFromPageData
} = require('~/fb-editor-node/admin/common')

const defaultOrder = [
  'page.singlequestion',
  'page.form',
  'page.summary',
  'page.confirmation',
  'page.mojUploadSummary',
  'page.mojUploadConfirmation',
  'page.content',
  'page.flashcard',
  'text',
  'number',
  'date',
  'email',
  'textarea',
  'radios',
  'checkboxes',
  'fileupload',
  'fieldset',
  'group',
  'section',
  'autocomplete',
  'tabs',
  'accordion',
  'select',
  'content',
  'details',
  'inset',
  'warning',
  'panel',
  'table',
  'hidden'
]

const indexMap = {}

const createOrderedSort = (order) => {
  for (let i = 0, j = order.length; i < j; i++) {
    indexMap[order[i]] = i
  }

  return (a, b) => {
    if (indexMap[a] === undefined) return 0
    if (indexMap[b] === undefined) return -1
    return indexMap[a] - indexMap[b]
  }
}

const sortProperties = createOrderedSort(defaultOrder)

function setData (pageInstance, pageData, POST) {
  let {
    instanceType,
    _type
  } = pageData.getUserData()

  const {
    addId,
    addProperty,
    operation
  } = pageData.getUserData()

  let instanceDisplayType = 'component'

  let types = []
  if (instanceType && instanceType.match(/^(page|component|field|grouping|control)$/)) {
    types = getSchemaNameByCategory(instanceType)
    instanceDisplayType = instanceType
  } else {
    // TODO: !!!
    if (!addId && !addProperty) {
      // boom!
    } else {
      const addInstance = getInstance(addId)
      const addType = addInstance._type
      if (addProperty === 'steps') {
        types = getSchemaNameByCategory('page')
        instanceDisplayType = 'step'
      } else {
        const allowableTypes = getSchemaPropertyAllowableTypes(addType, addProperty)
        if (allowableTypes && allowableTypes.length) {
          types = allowableTypes
        } else {
          types = getSchemaNameByCategory('component')
        }
      }
    }
  }

  pageData.setUserDataProperty('instanceType', instanceDisplayType)

  // If there's only one type allowable, then _type is implicit
  if (types.length === 1) {
    _type = types[0]
  }

  if (_type) {
    const getUrl = getUrlFromPageData(pageData)

    pageInstance.redirect = getUrl('admin.instance.create.id', {
      _type,
      addId,
      addProperty,
      operation
    })
  } else {
    const excludeTypes = ['page.admin', 'page.start', 'page.error', 'button', 'checkbox', 'form', 'header', 'option', 'radio', 'buttonPrimary', 'buttonSecondary']
    types = types.filter(type => !excludeTypes.includes(type))
      .sort(sortProperties)

    const [
      nameNode
    ] = jsonPath.query(pageInstance, '$..[?(@.name === "_type")]')

    const {
      items: [
        option
      ]
    } = nameNode

    nameNode.items.shift()
    types.forEach((type, index) => {
      const newOption = Object.assign({}, option)
      newOption.value = type
      const schema = getServiceSchema(type)
      newOption.label = schema.title
      newOption.hint = schema.description
      newOption._id += `__${index}`
      nameNode.items.push(newOption)
    })
  }

  return pageInstance
}

module.exports = {
  setData
}
