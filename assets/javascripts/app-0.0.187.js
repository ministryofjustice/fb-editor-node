!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([,function(e,t,n){var r=n(2),o=function(e,t){return r.add("shift+alt+".concat(e),t)};function a(e){var t=document.querySelector(".fb-navigation-".concat(e," a"));t?document.location.href=t.getAttribute("href"):e.match(/(edit|preview)/)&&(document.location.href=l.replace(new RegExp("/".concat(e)),"")+("/"===l?"":"/")+e)}function c(e){if(document.location.href.match(/admin\/instance\/.+?\/.+/))document.location.href=document.location.href.replace(/\/[^/]+$/,"");else{var t,n=Array.from(document.querySelectorAll('[data-block-id="admin.instance--used"] a'));if(n.length)t="top"===e?n[0].href:n[n.length-1].href,document.location.href=t}}function i(e){var t=document.querySelector(".fb-preview-".concat(e," a"));t&&(document.location.href=t.getAttribute("href"))}var l=document.location.href.replace(/^https{0,1}:\/\/[^/]+/,"");l.includes("/flow")||o("f",(function(){document.location.href="/admin/flow"})),l.startsWith("/admin")&&!l.includes("instance")||(o("r",(function(){a("live")})),o("i",(function(){a("instance")})),o("e",(function(){a("edit")})),o("p",(function(){a("preview")})),o("t",(function(){c("top")})),o("up",(function(){c()})),o("left",(function(){i("previous")})),o("right",(function(){i("next")})))},function(e,t){e.exports={allShortcuts:{},add:function(e,t,n){var r={type:"keydown",propagate:!1,disable_in_input:!1,target:document,keycode:!1};if(n)for(var o in r)void 0===n[o]&&(n[o]=r[o]);else n=r;var a=n.target;"string"==typeof n.target&&(a=document.getElementById(n.target)),e=e.toLowerCase();var c=function(){var r,o,a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.event;if(n.disable_in_input&&(a.target?r=a.target:a.srcElement&&(r=a.srcElement),3===r.nodeType&&(r=r.parentNode),"INPUT"===r.tagName||"TEXTAREA"===r.tagName))return;a.keyCode?o=a.keyCode:a.which&&(o=a.which);var c=String.fromCharCode(o).toLowerCase();188===o&&(c=","),190===o&&(c=".");var i=e.split("+"),l=0,u={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":":","'":'"',",":"<",".":">","/":"?","\\":"|"},d={esc:27,escape:27,tab:9,space:32,return:13,enter:13,backspace:8,scrolllock:145,scroll_lock:145,scroll:145,capslock:20,caps_lock:20,caps:20,numlock:144,num_lock:144,num:144,pause:19,break:19,insert:45,home:36,delete:46,end:35,pageup:33,page_up:33,pu:33,pagedown:34,page_down:34,pd:34,left:37,up:38,right:39,down:40,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123},f={shift:{wanted:!1,pressed:!1},ctrl:{wanted:!1,pressed:!1},alt:{wanted:!1,pressed:!1},meta:{wanted:!1,pressed:!1}};a.ctrlKey&&(f.ctrl.pressed=!0),a.shiftKey&&(f.shift.pressed=!0),a.altKey&&(f.alt.pressed=!0),a.metaKey&&(f.meta.pressed=!0);for(var s,p=0;p<i.length;p++)"ctrl"===(s=i[p])||"control"===s?(l++,f.ctrl.wanted=!0):"shift"===s?(l++,f.shift.wanted=!0):"alt"===s?(l++,f.alt.wanted=!0):"meta"===s?(l++,f.meta.wanted=!0):s.length>1?d[s]===o&&l++:n.keycode?n.keycode===o&&l++:(c===s||u[c]&&a.shiftKey&&(c=u[c])===s)&&l++;if(l===i.length&&f.ctrl.pressed===f.ctrl.wanted&&f.shift.pressed===f.shift.wanted&&f.alt.pressed===f.alt.wanted&&f.meta.pressed===f.meta.wanted&&(t(a),!n.propagate))return a.cancelBubble=!0,a.returnValue=!1,a.stopPropagation&&(a.stopPropagation(),a.preventDefault()),!1};this.allShortcuts[e]={callback:c,target:a,event:n.type},a.addEventListener?a.addEventListener(n.type,c,!1):a.attachEvent?a.attachEvent("on".concat(n.type),c):a["on".concat(n.type)]=c},remove:function(e){e=e.toLowerCase();var t=this.allShortcuts[e];if(delete this.allShortcuts[e],t){var n=t.event,r=t.target,o=t.callback;r.detachEvent?r.detachEvent("on".concat(n),o):r.removeEventListener?r.removeEventListener(n,o,!1):r["on".concat(n)]=!1}}}}]);
//# sourceMappingURL=app-0.0.187.js.map