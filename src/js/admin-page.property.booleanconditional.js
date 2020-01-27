
const booleanConditional = document.querySelector('.booleanConditionalOptions')

const getOperator = (operatorName) => {
  return allowableOperators.filter(operator => operator.operator === operatorName)[0] || {}
}
const getOperatorProperty = (operatorName, property) => getOperator(operatorName)[property]
const getIdentifier = (identifierName) => {
  return allowableIdentifiers.filter(identifier => identifier.name === identifierName)[0] || {}
}
const getIdentifierProperty = (identifierName, property) => getIdentifier(identifierName)[property]

const createSelect = (name, values, selectedValue) => {
  let selectElement = `<select name="${name}" class="govuk-select" style="width:auto; min-width: 10rem; max-width:100%; display:block;margin-bottom: 0.5rem;"><option value=""></option>`
  values.forEach(item => {
    selectElement += `<option value="${item.value}"${selectedValue === item.value ? ' selected' : ''}>${item.label}</option>`
  })
  selectElement += '<select>'
  return selectElement
}

const createIdentifier = (condition, conditionId) => {
  const { identifier } = condition
  const values = allowableIdentifiers.map(item => {
    return {
      value: item.name,
      label: item.fullTitle // + ' (' + item.name + ')'
    }
  })
  const identifierElement = createSelect(`identifier===${conditionId}`, values, identifier)
  return identifierElement
}

const asIsOperators = [
  'boolean',
  'date',
  'number'
]
const createOperator = (condition, conditionId) => {
  let { identifier, operator, type, negated } = condition
  if (!identifier) {
    return ''
  }
  if (negated) {
    operator = `!${operator}`
  }
  type = getIdentifierProperty(identifier, 'type')
  if (!asIsOperators.includes(type)) {
    type = 'string'
  }
  const operators = allowableOperators.filter(operator => {
    if (!operator.type) {
      return true
    }
    const enumsMatch = true
    const typeMatch = operator.type === 'any' || operator.type === type
    return typeMatch && enumsMatch
  })
  const operatorElement = createSelect(`operator===${conditionId}`, operators, operator)
  return operatorElement
}

const createValue = (condition, conditionId) => {
  const { operator, value, enums } = condition
  if (!operator || operator === 'defined' || operator === 'isTrue') {
    return ''
  }
  let valueElement
  const valueName = `value===${conditionId}`
  if (enums && (operator === 'is' || operator === 'equals' || operator === 'defined')) {
    valueElement = createSelect(valueName, enums, value)
  } else {
    valueElement = `<input type="text" name="${valueName}" value="${value === undefined ? '' : value}" class="govuk-input" style="width:10em;">`
  }
  return valueElement
}

const createAnswer = (condition) => {
  const { identifier } = condition
  const answerElement = identifier && identifier.endsWith('[*]') ? 'any answer for' : 'the answer for'
  return answerElement
}

const conditionsLabel = {
  all: 'all these conditions are met',
  any: 'at least one of these conditons is met',
  exactly: 'one of these conditions is met'
}
const conditionsDelimiter = {
  all: 'and',
  any: 'and/or',
  exactly: 'or'
}
const conditionsType = Object.keys(conditionsLabel)

const createConditionsType = (currentType, conditionId) => {
  const conditionsTypeName = `conditionsType===${conditionId}`
  const enums = conditionsType.map(conditionType => {
    return {
      label: conditionsLabel[conditionType],
      value: conditionType
    }
  })
  const valueElement = createSelect(conditionsTypeName, enums, currentType)
  return valueElement
}
const createConditions = (conditions, conditionId = '', type) => {
  const conditionsId = `${conditionId}.${type}`
  let conditionIdCounter = 0
  const conditionParts = conditions.map(condition => {
    const newConditionId = `${conditionsId}[${conditionIdCounter}]`
    conditionIdCounter++
    const noDelete = conditions.length === 1
    return createCondition(condition, newConditionId, noDelete)
  })
  const conditionsRevert = conditions.length === 1 ? `<p class="govuk-button fb-action-secondary fb-action--revert-conditions condition-action condition-revert" data-destination="${conditionsId}" data-action="revert">Convert to single condition</p>` : ''
  const conditionsType = createConditionsType(type, conditionId)
  const addCondition = `<p class="govuk-button fb-action-secondary fb-action--add fb-action--add-condition conditionsAdd" data-action="add" data-destination="${conditionsId}">Add condition</p>`
  return `<div class="conditions-block">${conditionsType}${conditionsRevert}<div class="conditions-subconditions">${conditionParts.join(`<p class="conditions-delimiter">${conditionsDelimiter[type]}</p>`)}${addCondition}</div></div>`
}

const createCondition = (condition, conditionId = '', noDelete) => {
  if (typeof condition !== 'object') {
    valueControl.style.display = 'none'
    return ''
  }
  condition = JSON.parse(JSON.stringify(condition))
  const { all, any, exactly } = condition
  if (all) {
    return createConditions(all, conditionId, 'all')
  }
  if (any) {
    return createConditions(any, conditionId, 'any')
  }
  if (exactly) {
    return createConditions(exactly, conditionId, 'exactly')
  }
  // console.log('conditionId', conditionId)
  const { identifier } = condition
  const enums = allowableIdentifiers.filter(item => item.name === identifier).map(item => item.enums)[0]
  condition.enums = enums
  let conditionRemove = ''
  if (conditionId !== '' && !noDelete) {
    conditionRemove = `<p class="govuk-button fb-action-secondary fb-action--remove-condition condition-action condition-remove" data-destination="${conditionId}" data-action="remove">Delete</p>`
  }
  const conditionConvert = `<p class="govuk-button fb-action-secondary fb-action--convert-condition condition-action condition-convert" data-destination="${conditionId || 'TOP'}" data-action="convert">Convert to multiple conditions</p>`
  if (identifier !== 'undefined') {
    return `<div class="condition-individual">${createAnswer(condition)} ${createIdentifier(condition, conditionId)} ${createOperator(condition, conditionId)} ${createValue(condition, conditionId)}${conditionRemove}${conditionConvert}</div>`
  }
}

booleanConditional.insertAdjacentHTML('afterend', '<div id="conditions"></div><p id="conditionsToggle"><span class="govuk-button fb-action-secondary"></span></p>')

const conditionContainer = document.querySelector('#conditions')
const conditionsToggler = document.querySelector('#conditionsToggle .fb-action-secondary')

let jsonMode = false
let uiImpossible = false

const updateConditions = (condition) => {
  const renderedCondition = createCondition(condition)
  if (renderedCondition !== undefined) {
    uiImpossible = false
    conditionContainer.innerHTML = renderedCondition
    showJSONMode(jsonMode)
  } else {
    uiImpossible = true
    showJSONMode(true)
  }
}
const showJSONMode = (showJSON) => {
  jsonMode = !!showJSON
  let uiDisplay = ''
  let jsonDisplay = 'none'
  let toggleLabel = 'Edit JSON'
  if (showJSON) {
    uiDisplay = 'none'
    jsonDisplay = ''
    toggleLabel = 'Edit with UI'
  }
  if (uiImpossible) {
    toggleLabel = 'Cannot show JSON structure through UI'
  }
  conditionContainer.style.display = uiDisplay
  valueControl.style.display = jsonDisplay
  conditionsToggler.innerHTML = toggleLabel
}
conditionsToggler.addEventListener('click', () => {
  if (uiImpossible) {
    return
  }
  showJSONMode(!jsonMode)
})

conditionContainer.addEventListener('click', function (e) {
  const target = e.target
  let targetDestination = target.getAttribute('data-destination')
  if (!targetDestination) {
    return
  }
  const targetAction = target.getAttribute('data-action')
  if (targetAction === 'add') {
    const destination = getValueDestination(targetDestination)
    destination.push({})
  } else if (targetAction === 'remove') {
    let targetIndex
    targetDestination = targetDestination.replace(/\[(\d+)\]$/, (m, m1) => {
      targetIndex = m1
      return ''
    })
    const destination = getValueDestination(targetDestination)
    destination.splice(targetIndex, 1)
  } else if (targetAction === 'convert') {
    if (targetDestination === 'TOP') {
      targetDestination = ''
    }
    const destination = getValueDestination(targetDestination)
    const destinationValue = JSON.parse(JSON.stringify(destination))
    Object.keys(destination).forEach(key => {
      delete destination[key]
    })
    destination.all = [destinationValue]
  } else if (targetAction === 'revert') {
    const destinationValue = getValueDestination(targetDestination)
    const destination = getValueDestination(targetDestination.replace(/\.[^.]+$/, ''))
    Object.keys(destination).forEach(key => {
      delete destination[key]
    })
    Object.keys(destinationValue).forEach(key => {
      destination[key] = destinationValue[key]
    })
  }
  updateConditions(value)
})
conditionContainer.addEventListener('change', function (e) {
  const target = e.target
  let targetValue = target.value
  let [name, destination] = target.name.split('===')
  destination = destination || ''
  const valueDestination = getValueDestination(destination)
  if (name === 'identifier') {
    delete valueDestination.operator
    delete valueDestination.value
  } else if (name === 'operator') {
    if (targetValue.startsWith('!')) {
      targetValue = targetValue.substr(1)
      valueDestination.negated = true
    } else {
      delete valueDestination.negated
    }
    if (targetValue === 'defined' || targetValue === 'isTrue') {
      delete valueDestination.value
    }
  } else if (name === 'conditionsType') {
    let currentValue = []
    conditionsType.forEach(type => {
      if (valueDestination[type]) {
        currentValue = valueDestination[type]
        delete valueDestination[type]
      }
    })
    valueDestination[targetValue] = currentValue
  }
  if (name === 'value' && targetValue !== '') {
    const valueType = getOperatorProperty(value.operator, 'type')
    // allowableOperators.filter(operator => operator.operator === value.operator)[0].type
    if (valueType === 'number') {
      const numberValue = Number(targetValue)
      if (!isNaN(numberValue)) {
        targetValue = numberValue
      }
    }
  }
  valueDestination[name] = targetValue
  updateValueControl('condition')
  updateConditions(value)
})

const formElements = document.forms[0].elements

const allowableOperators = []
const allowableIdentifiers = JSON.parse(unescape(formElements.booleanConditional.value)).reverse()
const allowableOperatorsIn = JSON.parse(unescape(formElements.allowableOperators.value))

Object.entries(allowableOperatorsIn).forEach(([key, { type, yes, no }]) => {
  allowableOperators.push({
    operator: key,
    type,
    value: key,
    label: yes
  })
  allowableOperators.push({
    operator: key,
    type,
    value: `!${key}`,
    label: no
  })
})

const valueControl = formElements.value
valueControl.addEventListener('change', () => {
  value = JSON.parse(valueControl.value)
  updateConditions(value)
})

conditionContainer.parentNode.insertBefore(valueControl, conditionContainer.nextSibling)

let value = valueControl.value ? JSON.parse(valueControl.value) : valueControl.value

const getValueDestination = (destination) => {
  let valueDestination
  eval(`valueDestination = value${destination}`) // eslint-disable-line no-eval
  return valueDestination
}

const updateValueControl = (input) => {
  if (input === 'condition') {
    value = value || { identifier: '', operator: '' }
    input = JSON.stringify(value, null, 2)
  } else {
    value = undefined
  }
  valueControl.value = input
}

const booleanConditionalNodeList = formElements.booleanConditionalOptions

const typeValue = typeof value === 'boolean' ? value.toString() : 'condition'
if (typeof value === 'boolean') {
  value = undefined
}

booleanConditionalNodeList.value = typeValue

booleanConditional.classList.remove('js-hidden')

for (let index = 0; index < 3; index++) {
  booleanConditionalNodeList.item(index).addEventListener('change', function () {
    updateValueControl(this.value)
    updateConditions(value)
  })
}

if (typeof value === 'object') {
  updateConditions(value)
} else {
  valueControl.style.display = 'none'
}
