function addBlockHover (blocks, className, targetClass) {
  const currentHover = []

  function getTargetBlock (block, seekTarget) {
    let targetBlock = block
    if (targetClass && seekTarget) {
      let targetFound
      while (!targetFound && targetBlock.parentNode) {
        targetBlock = targetBlock.parentNode
        if (targetBlock && targetBlock.className && targetBlock.className.includes(targetClass)) {
          targetFound = true
        }
      }
      if (!targetFound) {
        targetBlock = undefined
      }
    }
    return targetBlock
  }

  function addHover (triggerBlock, seekTarget) {
    const block = getTargetBlock(triggerBlock, seekTarget)
    if (block) {
      block.classList.add(className)
    }
  }

  function removeHover (triggerBlock, seekTarget) {
    const block = getTargetBlock(triggerBlock, seekTarget)
    if (block) {
      block.classList.remove(className)
    }
  }

  blocks.forEach(block => {
    if (block.classList.contains('fb-mode-edit')) {
      return
    }

    block.addEventListener('mouseover', (e) => {
      const previousHover = document.querySelector(`.${className}`)
      if (previousHover) {
        currentHover.push(previousHover)
        removeHover(previousHover)
      }
      addHover(block, true)
      e.stopPropagation()
    })

    block.addEventListener('mouseout', (e) => {
      removeHover(block, true)
      const previousHover = currentHover.shift()
      if (previousHover) {
        addHover(previousHover)
      }
      e.stopPropagation()
    })
  })
}

const dateBlocks = Array.from(document.querySelectorAll('.fb-block-date'))
dateBlocks.forEach(dateBlock => {
  const dateBlockId = dateBlock.getAttribute('data-block-id')
  const legend = dateBlock.querySelector('legend')
  legend.setAttribute('data-block-id', dateBlockId)
  legend.setAttribute('data-block-property', 'label')
})

const detailsBlocks = Array.from(document.querySelectorAll('details'))
detailsBlocks.forEach(detailsBlock => {
  detailsBlock.setAttribute('open', true)
  const detailsBlockId = detailsBlock.getAttribute('data-block-id')
  const summary = detailsBlock.querySelector('summary')
  summary.setAttribute('data-block-id', detailsBlockId)
  summary.setAttribute('data-block-property', 'summary')
  const html = detailsBlock.querySelector('.govuk-details__text')
  html.setAttribute('data-block-id', detailsBlockId)
  html.setAttribute('data-block-property', 'html')
})

const addButtonBlocks = Array.from(document.querySelectorAll('.fb-block--add'))
addButtonBlocks.forEach(block => {
  if (block.href.match(/\/items\/edit$/)) {
    const prevElement = block.parentElement.previousElementSibling
    if (prevElement.dataset.blockType === 'select') {
      block.setAttribute('href', block.href.replace(/\/items\/edit$/, '/items'))
    }
  }
})

const editBlocks = Array.from(document.querySelectorAll('[data-block-id]'))
editBlocks.forEach((block, index, blocks) => {
  if (block.parentElement && block.parentElement.tagName === 'SELECT') {
    return
  }
  const originalBlock = block
  const blockId = block.getAttribute('data-block-id')
  if (blockId === 'undefined') {
    return
  }

  const blockType = block.getAttribute('data-block-type') || ''

  const addEditContainer = (block, propertyType = '') => {
    let blockProperty = block.getAttribute(`data-block-property${propertyType}`)
    if (propertyType && !blockProperty) {
      return
    }
    if (propertyType === '-class') {
      const propertyClassParts = blockProperty.split(':')
      blockProperty = propertyClassParts[1]
      const propertyClass = propertyClassParts[0]
      block = block.querySelector(`.${propertyClass}`)
    }
    let blockLink = blockId + (blockProperty ? `/${blockProperty}` : '')
    let blockLevel = !blockProperty // block.classList.contains('govuk-form-group')
    if (blockId === 'actions') {
      blockLevel = false
      const pageBlock = document.querySelector('[data-block-type="page"]')
      blockLink = `${pageBlock.dataset.blockId}/actionType`
    }
    const blockText = blockLevel ? '{}' : '✎'
    const blockClass = blockLevel ? ' fb-block-instance' : ' fb-block-property'
    const insertPosition = 'afterbegin'
    if (block.localName === 'input') {
      block = block.parentNode
      blocks[index] = block
    }
    if (block.localName === 'fieldset') {
      block = block.querySelector('legend') || block
      blocks[index] = block
    }
    let blockContent = ''
    if (blockLevel) {
      const blockTypeName = blockType !== 'page' ? 'component' : 'page'
      const blockHasSteps = block.getAttribute('data-block-steps')
      const blockIsPageStart = block.getAttribute('data-block-pagetype') === 'page.start'
      let hasComponents = blockTypeName === 'page'
      if (block.getAttribute('data-block-pagetype') === 'page.singlequestion') {
        hasComponents = false
      }
      if (block.classList.contains('fb-block-group')) {
        hasComponents = true
      } else if (block.classList.contains('fb-block-section')) {
        hasComponents = true
      } else if (block.classList.contains('fb-block-fieldset')) {
        hasComponents = true
      }

      // blockTypeName = ''
      const blockTypeDisplay = blockType.charAt(0).toUpperCase() + blockType.slice(1)
      const blockHasValue = originalBlock.getAttribute('value') || originalBlock.querySelector(`[data-block-id="${blockId}"] > [value]`)
      const blockIsRadio = originalBlock.getAttribute('type') === 'radio'
      const blockHasName = !blockIsRadio && (originalBlock.getAttribute('name') || originalBlock.querySelector(`[data-block-id="${blockId}"] > [name]`))

      blockContent = `<div class="fb-block-instance-properties"><span class="fb-block-instance-properties-heading fb-block-edit">${blockText}</span><ul>`
      blockContent += `<li class="fb-block-instance-properties-type-item"><span class="fb-block-instance-properties-type">${blockTypeDisplay}</span></li>`
      if (blockHasName || blockType === 'radios' || blockType === 'date' || blockType === 'fileupload') {
        const blockNameProperty = `<li><a href="/admin/instance/${blockLink}/name">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> name</a></li>`
        blockContent += blockNameProperty
      } else if (blockIsRadio) {
        const blockValueProperty = `<li><a href="/admin/instance/${blockLink}/value">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> value</a></li>`
        blockContent += blockValueProperty
      } else if (blockHasValue) {
        const blockValueProperty = `<li><a href="/admin/instance/${blockLink}/value">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> value</a></li>`
        blockContent += blockValueProperty
      }
      if (blockType === 'fileupload') {
        // accept
        const blockMaxSizeProperty = `<li><a href="/admin/instance/${blockLink}/maxSize">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> max size</a></li>`
        blockContent += blockMaxSizeProperty
        const blockAcceptProperty = `<li><a href="/admin/instance/${blockLink}/accept">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> accepted types</a></li>`
        blockContent += blockAcceptProperty
        const blockMaxFilesProperty = `<li><a href="/admin/instance/${blockLink}/maxFiles">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> max files</a></li>`
        blockContent += blockMaxFilesProperty
        const blockMinFilesProperty = `<li><a href="/admin/instance/${blockLink}/minFiles">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> min files</a></li>`
        blockContent += blockMinFilesProperty
      }
      if (blockHasName || blockType === 'radios' || blockType === 'checkboxes' || blockType === 'date' || blockType === 'fieldset' || blockType === 'textarea') {
        if (blockType !== 'fieldset') {
          const blockRequiredProperty = `<li><a href="/admin/instance/${blockLink}/validation/required">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> required</a></li>`
          blockContent += blockRequiredProperty
        }
        if (blockType !== 'fieldset' && blockType !== 'radios' && blockType !== 'checkboxes') {
          const blockValidationProperty = `<li><a href="/admin/instance/validation/${blockLink}">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> validation</a></li>`
          blockContent += blockValidationProperty
        }
        if (blockType !== 'fileupload' && blockType !== 'radios' && blockType !== 'checkboxes') {
          const blockRepeatableProperty = `<li><a href="/admin/instance/${blockLink}/repeatable">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> repeatability</a></li>`
          blockContent += blockRepeatableProperty
        }
      }
      if (blockType !== 'page' || document.location.pathname !== '/edit') {
        const blockShow = `<li><a href="/admin/instance/${blockLink}/show">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> visibility</a></li>`
        blockContent += blockShow
      }

      if (hasComponents) {
        const blockComponentsProperty = `<li><a href="/admin/instance/${blockLink}/components">Reorder <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> components</a></li>`
        blockContent += blockComponentsProperty
      }

      if (blockTypeName === 'page') {
        if (blockHasSteps) {
          let blockStepsProperty = `<li><a href="/admin/instance/${blockLink}/steps">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> steps</a></li>`
          if (!blockIsPageStart) {
            blockStepsProperty += `<li><a href="/admin/instance/${blockLink}/showSteps">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> steps visibility</a></li>`
            blockStepsProperty += `<li><a href="/admin/instance/${blockLink}/stepsHeading">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> steps heading</a></li>`
          }
          blockContent += blockStepsProperty
        } else {
          const blockEnableStepsProperty = `<li><a href="/admin/instance/${blockLink}/enableSteps">Enable <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> steps</a></li>`
          blockContent += blockEnableStepsProperty
        }
        if (!blockIsPageStart) {
          blockContent += `<li><a href="/admin/instance/${blockLink}/url">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> URL</a></li>`
        }
      } else if (blockType.match(/^(text|textarea|number|select|autocomplete)$/)) {
        const blockWidthProperty = `<li><a href="/admin/instance/${blockLink}/widthClassInput">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> width</a></li>`
        blockContent += blockWidthProperty
      }

      if (blockType.match(/^(radio|checkbox)$/)) {
        const blockConditionalComponentProperty = `<li><a href="/admin/new/${blockLink}/conditionalComponent">Set <span class="fb-block-instance-property-link">${blockType} ${blockTypeName}</span> conditional component</a></li>`
        blockContent += blockConditionalComponentProperty
      }

      const blockViewProperties = `<li class="fb-block-instance--all"><a href="/admin/instance/${blockLink}">View all <span class="fb-block-instance-property-link">${blockType}</span> properties</a></li>`
      blockContent += blockViewProperties
      if (blockType !== 'page' || document.location.pathname !== '/edit') {
        const blockDelete = `<li class="fb-block-instance--delete"><form method="post" action="/admin/delete/${blockId}" class="fb-instance--delete" data-delete-type="${blockType}"><button>Delete ${blockTypeName} <span class="fb-block-instance-property-link">${blockType}</span></button></form></li>`
        blockContent += blockDelete
      }
      blockContent += '</ul></div>'
    } else {
      blockContent = `<div class="fb-block-edit-container${blockClass}"><a href="/admin/instance/${blockLink}" class="fb-block-edit" title="Edit ${blockLink}"><span>${blockText}</span></a></div>`
    }
    block.insertAdjacentHTML(insertPosition, blockContent)
  }
  addEditContainer(originalBlock)
  addEditContainer(originalBlock, '-instance')
  addEditContainer(originalBlock, '-class')
})

const stepBlocks = Array.from(document.querySelectorAll('.fb-page-steps'))

addBlockHover(editBlocks, 'fb-hover')
addBlockHover(stepBlocks, 'fb-step-highlight', 'fb-step-container')

const deleteActions = Array.from(document.querySelectorAll('.fb-instance--delete'))
deleteActions.forEach(deleteAction => {
  deleteAction.addEventListener('click', (e) => {
    const strconfirm = confirm('Are you sure you want to delete?')
    if (strconfirm !== true) {
      e.preventDefault()
    }
  })
})

const revealConditionals = () => {
  const conditionalComponents = Array.from(document.querySelectorAll('.govuk-radios__conditional, .govuk-checkboxes__conditional'))
  conditionalComponents.forEach(conditionalComponent => {
    conditionalComponent.classList.remove('govuk-radios__conditional--hidden')
    conditionalComponent.classList.remove('govuk-checkboxes__conditional--hidden')
  })
}

// !!!
setInterval(revealConditionals, 10)

// revealConditionals()
const ariaControls = Array.from(document.querySelectorAll('.govuk-radios__input, .govuk-checkboxes__input, [aria-controls]'))
ariaControls.forEach(ariaControl => {
  ariaControl.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    revealConditionals()
    const parentElement = e.target.parentElement
    if (parentElement && parentElement.className.includes('fb-block-edit')) {
      document.location.href = parentElement.href
    }
  })
})

// Disable inputs when in edit/build mode
const inputBlocks = Array.from(document.querySelectorAll('.govuk-input, .govuk-textarea'))
inputBlocks.forEach(input => {
  input.addEventListener('focus', () => {
    input.blur()
  })
})

// Disable back link
const backLink = document.querySelector('.govuk-back-link')
if (backLink) {
  backLink.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()
  })
}
