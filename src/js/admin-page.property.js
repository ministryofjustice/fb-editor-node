function insertAtCursor (insertField, insertValue) {
  if (document.selection) {
    // IE support
    insertField.focus()
    const selection = document.selection.createRange()
    selection.text = insertValue
  } else if (insertField.selectionStart || insertField.selectionStart === '0') {
    // MOZILLA and others
    const startPos = insertField.selectionStart
    const endPos = insertField.selectionEnd
    const l = insertField.value.substring(0, startPos)
    const r = insertField.value.substring(endPos, insertField.value.length)
    insertField.value = l + insertValue + r
    insertField.selectionStart = startPos + insertValue.length
    insertField.selectionEnd = startPos + insertValue.length
  } else {
    insertField.value += insertValue
  }
}

let textInput = document.querySelector('.govuk-input[name="value"][type="text"]')
if (textInput && textInput.className.includes('govuk-input--width')) {
  textInput = undefined
}

if (textInput) {
  const html = `<textarea class="govuk-textarea" id="expandingTextInput" name="value" rows="1" aria-describedby="admin.instance.property--value-hint">${textInput.value}</textarea>`

  textInput.insertAdjacentHTML('afterend', html)
  textInput.remove()

  const expandingTextInput = document.querySelector('#expandingTextInput')
  expandingTextInput.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
    }
  })
  expandingTextInput.addEventListener('paste', (e) => {
    e.preventDefault()
    e.stopPropagation()
    let paste = (e.clipboardData || window.clipboardData).getData('text')
    paste = paste.replace(/\n/gi, ' ')
    insertAtCursor(expandingTextInput, paste)
  })
}
