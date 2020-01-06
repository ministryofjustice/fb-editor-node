const autosize = require('autosize')

const $textareas = document.querySelectorAll('textarea')
if ($textareas.length) {
  autosize($textareas)
  setInterval(function () {
    autosize.update($textareas)
  }, 100)
}

const detailsState = JSON.parse(localStorage.getItem('fbDetailsState') || '{}')
const location = window.location.href
detailsState[location] = detailsState[location] || {}
const detailsLocationState = detailsState[location]
if (Object.keys(detailsLocationState).length) {
  Object.keys(detailsLocationState).forEach(dataBlockId => {
    const details = document.querySelector(`[data-block-id="${dataBlockId}"]`)
    if (details) {
      details.open = detailsLocationState[dataBlockId]
    }
  })
}
const detailsList = Array.from(document.querySelectorAll('details'))
detailsList.forEach(details => {
  details.addEventListener('click', function (e) {
    e.stopPropagation()
    const target = e.target
    if (!target.className.match(/govuk-details__summary/)) {
      return
    }
    const dataBlockId = this.getAttribute('data-block-id')
    if (!dataBlockId) {
      return
    }
    const newState = !this.open
    detailsLocationState[dataBlockId] = newState
    localStorage.setItem('fbDetailsState', JSON.stringify(detailsState))
  })
})

setTimeout(() => {
  document.querySelector('.admin-content').style.position = 'relative'
}, 10)
