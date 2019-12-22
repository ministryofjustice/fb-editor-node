if (window.Shortcut) {
    const keyChord = 'shift+alt+'
    const addShortcut = (char, fn) => {
       window.Shortcut.add(`${keyChord}${char}`, fn)
    }
    const href = document.location.href.replace(/^https{0,1}:\/\/[^/]+/, '')
    const modeNav = (stub) => {
      const urlLink = document.querySelector(`.fb-navigation-${stub} a`)
      if (!urlLink) {
        if (stub.match(/(edit|preview)/)) {
          document.location.href = href.replace(new RegExp(`/${stub}`), '') + (href === '/' ? '' : '/') + stub
        }
        return
      }
      document.location.href = urlLink.getAttribute('href')
    }
    const upNav = (type) => {
      if (document.location.href.match(/\admin\/instance\/.+?\/.+/)) {
        document.location.href = document.location.href.replace(/\/[^/]+$/, '')
        return
      }
      const urlLinks = [].slice.call(document.querySelectorAll('[data-block-id="admin.instance--used"] a'))
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
    if (!href.includes('/flow')) {
      addShortcut('f', () => {
        document.location.href = '/admin/flow'
      })
    }
    const flowNav = (direction) => {
      const link = document.querySelector(`.fb-preview-${direction} a`)
      if (link) {
        document.location.href = link.getAttribute('href')
      }
      // let index = direction === 'next' ? 1 : 0
      // const linkElement = links[index]
      // if (!linkElement) {
      //   return
      // }
      // let newHref = linkElement.href
      // if (newHref.includes('/dev/null')) {
      //   return
      // }
      // document.location.href = newHref
    }
    if (!href.startsWith('/admin') || href.includes('instance')) {
      const urlLink = document.querySelector('[data-block-id="admin.instance--url"] a')
      const url = urlLink ? urlLink.href : undefined
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
  }
