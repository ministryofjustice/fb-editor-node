const dragula = require('dragula')

const updateArray = () => {
  const items = Array.from(document.querySelectorAll('.fb-array-item:not(.gu-mirror)'))
    .map(item => JSON.parse(unescape(item.getAttribute('data-item-value'))))
  document.querySelector('textarea').value = JSON.stringify(items, null, 2)
  const button = document.querySelector('.fb-action-update')
  button.style = ''
  const addButton = document.querySelector('.fb-action-add')
  addButton.style = 'display: none;'
}
const initDragula = (selector, itemSelector, $valueElement) => {
  window.$valueElement = $valueElement
  window.canMove = true
  const itemContainer = document.querySelector(selector)
  dragula([itemContainer], {
    revertOnSpill: true,
    ignoreInputTextSelection: true,
    allowNestedContainers: true,
    moves: function () {
      return window.canMove
    }
  }).on('drop', (el) => {
    updateArray()
  })
}

const $hiddenValue = document.querySelector('[name=hiddenValue]')
if ($hiddenValue.value) {
  const $valueElementGroup = document.querySelector('[data-block-id="admin.instance.property--value"]')
  const $valueElement = $valueElementGroup.querySelector('textarea')
  $valueElement.style = 'display: none'
  const hiddenValue = JSON.parse($hiddenValue.value)
  if (Array.isArray(hiddenValue)) {
    const button = document.querySelector('.fb-action-update')
    button.style = 'display:none;'
    let itemsList = ''
    hiddenValue.forEach(item => {
      const itemData = escape(JSON.stringify(item.data))
      const removeString = typeof item.data === 'object' ? 'Delete' : 'Remove'
      itemsList += `<div class="fb-array-item container govuk-prose-scope" data-item-value="${itemData}"><div><p class="fb-array-item--title">${item.title}</p><p class="fb-array-item--id"><a href="${item.url}">${item._id}</a></p><p class="fb-array-item--remove govuk-button fb-action-secondary fb-action-remove">${removeString} <span class="">the item</span></p></div></div>`
    })
    itemsList = `<div class="fb-array-items">${itemsList}</div>`
    $valueElementGroup.insertAdjacentHTML('afterend', itemsList)
    initDragula('.fb-array-items', '.fb-array-item', $valueElement)
    const removeItems = Array.from(document.querySelectorAll('.fb-array-item--remove'))
    removeItems.forEach(removeItem => {
      removeItem.addEventListener('click', () => {
        const fbArrayItem = removeItem.parentNode.parentNode
        fbArrayItem.parentNode.removeChild(fbArrayItem)
        updateArray()
      })
    })
  }
}
