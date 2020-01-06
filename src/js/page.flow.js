const stepsPanels = document.querySelectorAll('.fb-page-steps')
for (let index = 0; index < stepsPanels.length; ++index) {
  const stepPanel = stepsPanels[index]
  let stepParent = stepPanel.parentNode
  while (!stepParent.classList.contains('fb-step-wrapper')) {
    stepParent = stepParent.parentNode
  }
  stepPanel.addEventListener('mouseover', () => {
    stepParent.classList.add('fb-step-highlight')
  })
  stepPanel.addEventListener('mouseout', () => {
    stepParent.classList.remove('fb-step-highlight')
  })
}

const main = document.querySelector('.govuk-main-wrapper')
const minimap = main.cloneNode(true)

const minimapContainer = document.createElement('div')
minimapContainer.id = 'minimapContainer'

const minimapLocation = document.createElement('div')
minimapLocation.id = 'minimapLocation'

minimapContainer.appendChild(minimap)
minimapContainer.appendChild(minimapLocation)

document.body.appendChild(minimapContainer)

const scale = 0.05
const flowScale = 0.375

main.style.maxHeight = `${main.scrollHeight * flowScale}px`

const windowWidth = document.documentElement.clientWidth
const mainScrollWidth = main.scrollWidth
const ratio = windowWidth / mainScrollWidth
const mapWidth = minimap.scrollWidth * scale * ratio
minimapLocation.style.width = `${mapWidth}px`

const minimapLocationHeight = document.documentElement.scrollHeight * scale
minimapLocation.style.height = `${minimapLocationHeight}px`
minimapContainer.style.height = `${minimapLocationHeight}px`

main.style.maxHeight = `${parseInt(main.style.maxHeight, 10) + minimapLocationHeight}px`

const updateMinimapLocation = () => {
  const scrollLeft = document.documentElement.scrollLeft
  const marginLeft = scrollLeft * scale
  minimapLocation.style.marginLeft = `${marginLeft}px`
}

minimap.onclick = function (e) {
  const scrollLeft = Math.max(0, 1 / scale * (e.clientX - minimap.offsetLeft) - 200) // innerWidth/2

  document.documentElement.scrollLeft = scrollLeft
  updateMinimapLocation()
}

window.onscroll = updateMinimapLocation

const ariaControls = Array.from(document.querySelectorAll('.fb-step .govuk-radios__input, .fb-step .govuk-checkboxes__input, .fb-step .govuk-button, .fb-step [aria-controls]'))
ariaControls.forEach(ariaControl => {
  ariaControl.addEventListener('click', (e) => {
    e.target.blur()
    e.preventDefault()
    e.stopPropagation()
  })
})
const inputControls = Array.from(document.querySelectorAll('.fb-step input, .fb-step textarea'))
inputControls.forEach(control => {
  control.addEventListener('focus', () => {
    control.blur()
  })
})
