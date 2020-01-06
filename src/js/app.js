const shortcuts = require('./shortcuts')

const addShortcut = (char, func) => shortcuts.add(`shift+alt+${char}`, func)

function modeNav (stub) {
  const urlLink = document.querySelector(`.fb-navigation-${stub} a`)
  if (!urlLink) {
    if (stub.match(/(edit|preview)/)) {
      document.location.href = href.replace(new RegExp(`/${stub}`), '') + (href === '/' ? '' : '/') + stub
    }
    return
  }
  document.location.href = urlLink.getAttribute('href')
}

function upNav (type) {
  if (document.location.href.match(/admin\/instance\/.+?\/.+/)) {
    document.location.href = document.location.href.replace(/\/[^/]+$/, '')
    return
  }
  const urlLinks = Array.from(document.querySelectorAll('[data-block-id="admin.instance--used"] a'))
  if (!urlLinks.length) {
    return
  }
  let newHref
  if (type === 'top') {
    // return modeNav('instance')
    newHref = urlLinks[0].href
  } else {
    newHref = urlLinks[urlLinks.length - 1].href
  }
  document.location.href = newHref
}

function flowNav (direction) {
  const link = document.querySelector(`.fb-preview-${direction} a`)
  if (link) {
    document.location.href = link.getAttribute('href')
  }
}

const href = document.location.href.replace(/^https{0,1}:\/\/[^/]+/, '')

if (!href.includes('/flow')) {
  addShortcut('f', () => {
    document.location.href = '/admin/flow'
  })
}

if (!href.startsWith('/admin') || href.includes('instance')) {
  addShortcut('r', () => {
    modeNav('live')
  })
  addShortcut('i', () => {
    modeNav('instance')
  })
  addShortcut('e', () => {
    modeNav('edit')
  })
  addShortcut('p', () => {
    modeNav('preview')
  })
  addShortcut('t', () => {
    upNav('top')
  })
  addShortcut('up', () => {
    upNav()
  })
  addShortcut('left', () => {
    flowNav('previous')
  })
  addShortcut('right', () => {
    flowNav('next')
  })
}
