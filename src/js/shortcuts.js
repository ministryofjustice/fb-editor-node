/**
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */
module.exports = {
  allShortcuts: {}, // All the shortcuts are stored in this object

  // Add the shortcut
  add (shortcutCombination, callback, opt) {
    // Provide a set of default options
    const defaultOptions = {
      type: 'keydown',
      propagate: false,
      disable_in_input: false,
      target: document,
      keycode: false
    }
    if (!opt) opt = defaultOptions
    else {
      for (const dfo in defaultOptions) {
        if (typeof opt[dfo] === 'undefined') opt[dfo] = defaultOptions[dfo]
      }
    }

    let ele = opt.target
    if (typeof opt.target === 'string') ele = document.getElementById(opt.target)

    shortcutCombination = shortcutCombination.toLowerCase()

    // The function to be called at keypress
    const func = function (e = window.event) {
      if (opt.disable_in_input) { // Don't enable shortcut keys in Input, Textarea fields
        let element
        if (e.target) element = e.target
        else if (e.srcElement) element = e.srcElement
        if (element.nodeType === 3) element = element.parentNode

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') return
      }

      let code
      // Find Which key is pressed
      if (e.keyCode) code = e.keyCode
      else if (e.which) code = e.which

      let character = String.fromCharCode(code).toLowerCase()

      if (code === 188) character = ',' // If the user presses , when the type is onkeydown
      if (code === 190) character = '.' // If the user presses , when the type is onkeydown

      const keys = shortcutCombination.split('+')
      // Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
      let kp = 0

      // Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
      const shiftNums = {
        '`': '~',
        1: '!',
        2: '@',
        3: '#',
        4: '$',
        5: '%',
        6: '^',
        7: '&',
        8: '*',
        9: '(',
        0: ')',
        '-': '_',
        '=': '+',
        ';': ':',
        '\'': '"',
        ',': '<',
        '.': '>',
        '/': '?',
        '\\': '|'
      }
      // Special Keys - and their codes
      const specialKeys = {
        esc: 27,
        escape: 27,
        tab: 9,
        space: 32,
        return: 13,
        enter: 13,
        backspace: 8,

        scrolllock: 145,
        scroll_lock: 145,
        scroll: 145,
        capslock: 20,
        caps_lock: 20,
        caps: 20,
        numlock: 144,
        num_lock: 144,
        num: 144,

        pause: 19,
        break: 19,

        insert: 45,
        home: 36,
        delete: 46,
        end: 35,

        pageup: 33,
        page_up: 33,
        pu: 33,

        pagedown: 34,
        page_down: 34,
        pd: 34,

        left: 37,
        up: 38,
        right: 39,
        down: 40,

        f1: 112,
        f2: 113,
        f3: 114,
        f4: 115,
        f5: 116,
        f6: 117,
        f7: 118,
        f8: 119,
        f9: 120,
        f10: 121,
        f11: 122,
        f12: 123
      }

      const modifiers = {
        shift: { wanted: false, pressed: false },
        ctrl: { wanted: false, pressed: false },
        alt: { wanted: false, pressed: false },
        meta: { wanted: false, pressed: false } // Meta is Mac specific
      }

      if (e.ctrlKey) modifiers.ctrl.pressed = true
      if (e.shiftKey) modifiers.shift.pressed = true
      if (e.altKey) modifiers.alt.pressed = true
      if (e.metaKey) modifiers.meta.pressed = true

      for (let k, i = 0; i < keys.length; i++) {
        k = keys[i]

        // Modifiers
        if (k === 'ctrl' || k === 'control') {
          kp++
          modifiers.ctrl.wanted = true
        } else if (k === 'shift') {
          kp++
          modifiers.shift.wanted = true
        } else if (k === 'alt') {
          kp++
          modifiers.alt.wanted = true
        } else if (k === 'meta') {
          kp++
          modifiers.meta.wanted = true
        } else if (k.length > 1) { // If it is a special key
          if (specialKeys[k] === code) kp++
        } else if (opt.keycode) {
          if (opt.keycode === code) kp++
        } else { // The special keys did not match
          if (character === k) kp++
          else {
            if (shiftNums[character] && e.shiftKey) { // Stupid Shift key bug created by using lowercase
              character = shiftNums[character]
              if (character === k) kp++
            }
          }
        }
      }

      if (kp === keys.length &&
          modifiers.ctrl.pressed === modifiers.ctrl.wanted &&
          modifiers.shift.pressed === modifiers.shift.wanted &&
          modifiers.alt.pressed === modifiers.alt.wanted &&
          modifiers.meta.pressed === modifiers.meta.wanted) {
        callback(e)

        if (!opt.propagate) { // Stop the event
          // e.cancelBubble is supported by IE - this will kill the bubbling process.
          e.cancelBubble = true
          e.returnValue = false

          // e.stopPropagation works in Firefox.
          if (e.stopPropagation) {
            e.stopPropagation()
            e.preventDefault()
          }
          return false
        }
      }
    }
    this.allShortcuts[shortcutCombination] = {
      callback: func,
      target: ele,
      event: opt.type
    }
    // Attach the function with the event
    if (ele.addEventListener) ele.addEventListener(opt.type, func, false)
    else if (ele.attachEvent) ele.attachEvent(`on${opt.type}`, func)
    else ele[`on${opt.type}`] = func
  },

  // Remove the shortcut - just specify the shortcut and I will remove the binding
  remove (shortcutCombination) {
    shortcutCombination = shortcutCombination.toLowerCase()
    const binding = this.allShortcuts[shortcutCombination]
    delete this.allShortcuts[shortcutCombination]
    if (!binding) return
    const type = binding.event
    const ele = binding.target
    const callback = binding.callback

    if (ele.detachEvent) ele.detachEvent(`on${type}`, callback)
    else if (ele.removeEventListener) ele.removeEventListener(type, callback, false)
    else ele[`on${type}`] = false
  }
}
