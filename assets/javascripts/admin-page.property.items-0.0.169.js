!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=6)}([function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(e){"object"===("undefined"==typeof window?"undefined":n(window))&&(r=window)}e.exports=r},,,,,,function(e,t,n){function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var o=n(7),i=function(){var e=[].slice.call(document.querySelectorAll(".fb-array-item:not(.gu-mirror)")).map((function(e){return JSON.parse(unescape(e.getAttribute("data-item-value")))}));document.querySelector("textarea").value=JSON.stringify(e,null,2),document.querySelector(".fb-action-update").style="",document.querySelector(".fb-action-add").style="display: none;"},c=document.querySelector("[name=hiddenValue]");if(c.value){var u=document.querySelector('[data-block-id="admin.instance.property--value"]'),a=u.querySelector("textarea");a.style="display: none";var l=JSON.parse(c.value);if(Array.isArray(l)){document.querySelector(".fb-action-update").style="display:none;";var f="";l.forEach((function(e){var t=escape(JSON.stringify(e.data)),n="object"===r(e.data)?"Delete":"Remove";f+='<div class="fb-array-item container govuk-prose-scope" data-item-value="'.concat(t,'"><div><p class="fb-array-item--title">').concat(e.title,'</p><p class="fb-array-item--id"><a href="').concat(e.url,'">').concat(e._id,'</a></p><p class="fb-array-item--remove govuk-button fb-action-secondary fb-action-remove">').concat(n,' <span class="">the item</span></p></div></div>')})),f='<div class="fb-array-items">'.concat(f,"</div>"),u.insertAdjacentHTML("afterend",f),function(e,t,n){window.$valueElement=n,window.canMove=!0;var r=document.querySelector(e);o([r],{revertOnSpill:!0,ignoreInputTextSelection:!0,allowNestedContainers:!0,moves:function(){return window.canMove}}).on("drop",(function(e){i()}))}(".fb-array-items",0,a),[].slice.call(document.querySelectorAll(".fb-array-item--remove")).forEach((function(e){e.addEventListener("click",(function(){var t=e.parentNode.parentNode;t.parentNode.removeChild(t),i()}))}))}}},function(e,t,n){"use strict";(function(t){var r=n(8),o=n(15),i=n(18),c=document,u=c.documentElement;function a(e,n,r,i){t.navigator.pointerEnabled?o[n](e,{mouseup:"pointerup",mousedown:"pointerdown",mousemove:"pointermove"}[r],i):t.navigator.msPointerEnabled?o[n](e,{mouseup:"MSPointerUp",mousedown:"MSPointerDown",mousemove:"MSPointerMove"}[r],i):(o[n](e,{mouseup:"touchend",mousedown:"touchstart",mousemove:"touchmove"}[r],i),o[n](e,r,i))}function l(e){if(void 0!==e.touches)return e.touches.length;if(void 0!==e.which&&0!==e.which)return e.which;if(void 0!==e.buttons)return e.buttons;var t=e.button;return void 0!==t?1&t?1:2&t?3:4&t?2:0:void 0}function f(e,n){return void 0!==t[n]?t[n]:u.clientHeight?u[e]:c.body[e]}function s(e,t,n){var r,o=e||{},i=o.className;return o.className+=" gu-hide",r=c.elementFromPoint(t,n),o.className=i,r}function d(){return!1}function m(){return!0}function v(e){return e.width||e.right-e.left}function p(e){return e.height||e.bottom-e.top}function h(e){return e.parentNode===c?null:e.parentNode}function y(e){return"INPUT"===e.tagName||"TEXTAREA"===e.tagName||"SELECT"===e.tagName||function e(t){if(!t)return!1;if("false"===t.contentEditable)return!1;if("true"===t.contentEditable)return!0;return e(h(t))}(e)}function g(e){return e.nextElementSibling||function(){var t=e;do{t=t.nextSibling}while(t&&1!==t.nodeType);return t}()}function b(e,t){var n=function(e){return e.targetTouches&&e.targetTouches.length?e.targetTouches[0]:e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:e}(t),r={pageX:"clientX",pageY:"clientY"};return e in r&&!(e in n)&&r[e]in n&&(e=r[e]),n[e]}e.exports=function(e,t){var n,S,w,T,E,x,O,C,I,N,_;1===arguments.length&&!1===Array.isArray(e)&&(t=e,e=[]);var M,j=null,P=t||{};void 0===P.moves&&(P.moves=m),void 0===P.accepts&&(P.accepts=m),void 0===P.invalid&&(P.invalid=function(){return!1}),void 0===P.containers&&(P.containers=e||[]),void 0===P.isContainer&&(P.isContainer=d),void 0===P.copy&&(P.copy=!1),void 0===P.copySortSource&&(P.copySortSource=!1),void 0===P.revertOnSpill&&(P.revertOnSpill=!1),void 0===P.removeOnSpill&&(P.removeOnSpill=!1),void 0===P.direction&&(P.direction="vertical"),void 0===P.ignoreInputTextSelection&&(P.ignoreInputTextSelection=!0),void 0===P.mirrorContainer&&(P.mirrorContainer=c.body);var k=r({containers:P.containers,start:function(e){var t=F(e);t&&R(t)},end:J,cancel:V,remove:U,destroy:function(){L(!0),H({})},canMove:function(e){return!!F(e)},dragging:!1});return!0===P.removeOnSpill&&k.on("over",(function(e){i.rm(e,"gu-hide")})).on("out",(function(e){k.dragging&&i.add(e,"gu-hide")})),L(),k;function A(e){return-1!==k.containers.indexOf(e)||P.isContainer(e)}function L(e){var t=e?"remove":"add";a(u,t,"mousedown",B),a(u,t,"mouseup",H)}function X(e){a(u,e?"remove":"add","mousemove",D)}function q(e){var t=e?"remove":"add";o[t](u,"selectstart",Y),o[t](u,"click",Y)}function Y(e){M&&e.preventDefault()}function B(e){if(x=e.clientX,O=e.clientY,!(1!==l(e)||e.metaKey||e.ctrlKey)){var t=e.target,n=F(t);n&&(M=n,X(),"mousedown"===e.type&&(y(t)?t.focus():e.preventDefault()))}}function D(e){if(M)if(0!==l(e)){if(void 0===e.clientX||e.clientX!==x||void 0===e.clientY||e.clientY!==O){if(P.ignoreInputTextSelection){var t=b("clientX",e),r=b("clientY",e);if(y(c.elementFromPoint(t,r)))return}var o=M;X(!0),q(),J(),R(o);var s,d={left:(s=w.getBoundingClientRect()).left+f("scrollLeft","pageXOffset"),top:s.top+f("scrollTop","pageYOffset")};T=b("pageX",e)-d.left,E=b("pageY",e)-d.top,i.add(N||w,"gu-transit"),function(){if(n)return;var e=w.getBoundingClientRect();(n=w.cloneNode(!0)).style.width=v(e)+"px",n.style.height=p(e)+"px",i.rm(n,"gu-transit"),i.add(n,"gu-mirror"),P.mirrorContainer.appendChild(n),a(u,"add","mousemove",W),i.add(P.mirrorContainer,"gu-unselectable"),k.emit("cloned",n,w,"mirror")}(),W(e)}}else H({})}function F(e){if(!(k.dragging&&n||A(e))){for(var t=e;h(e)&&!1===A(h(e));){if(P.invalid(e,t))return;if(!(e=h(e)))return}var r=h(e);if(r)if(!P.invalid(e,t))if(P.moves(e,r,t,g(e)))return{item:e,source:r}}}function R(e){var t,n;t=e.item,n=e.source,("boolean"==typeof P.copy?P.copy:P.copy(t,n))&&(N=e.item.cloneNode(!0),k.emit("cloned",N,e.item,"copy")),S=e.source,w=e.item,C=I=g(e.item),k.dragging=!0,k.emit("drag",w,S)}function J(){if(k.dragging){var e=N||w;K(e,h(e))}}function $(){M=!1,X(!0),q(!0)}function H(e){if($(),k.dragging){var t=N||w,r=b("clientX",e),o=b("clientY",e),i=Q(s(n,r,o),r,o);i&&(N&&P.copySortSource||!N||i!==S)?K(t,i):P.removeOnSpill?U():V()}}function K(e,t){var n=h(e);N&&P.copySortSource&&t===S&&n.removeChild(w),G(t)?k.emit("cancel",e,S,S):k.emit("drop",e,t,S,I),z()}function U(){if(k.dragging){var e=N||w,t=h(e);t&&t.removeChild(e),k.emit(N?"cancel":"remove",e,t,S),z()}}function V(e){if(k.dragging){var t=arguments.length>0?e:P.revertOnSpill,n=N||w,r=h(n),o=G(r);!1===o&&t&&(N?r&&r.removeChild(N):S.insertBefore(n,C)),o||t?k.emit("cancel",n,S,S):k.emit("drop",n,r,S,I),z()}}function z(){var e=N||w;$(),n&&(i.rm(P.mirrorContainer,"gu-unselectable"),a(u,"remove","mousemove",W),h(n).removeChild(n),n=null),e&&i.rm(e,"gu-transit"),_&&clearTimeout(_),k.dragging=!1,j&&k.emit("out",e,j,S),k.emit("dragend",e),S=w=N=C=I=_=j=null}function G(e,t){var r;return r=void 0!==t?t:n?I:g(N||w),e===S&&r===C}function Q(e,t,n){for(var r=e;r&&!o();)r=h(r);return r;function o(){if(!1===A(r))return!1;var o=Z(r,e),i=ee(r,o,t,n);return!!G(r,i)||P.accepts(w,r,S,i)}}function W(e){if(n){e.preventDefault();var t=b("clientX",e),r=b("clientY",e),o=t-T,i=r-E;n.style.left=o+"px",n.style.top=i+"px";var c=N||w,u=s(n,t,r),a=Q(u,t,r),l=null!==a&&a!==j;(l||null===a)&&(j&&v("out"),j=a,l&&v("over"));var f=h(c);if(a!==S||!N||P.copySortSource){var d,m=Z(a,u);if(null!==m)d=ee(a,m,t,r);else{if(!0!==P.revertOnSpill||N)return void(N&&f&&f.removeChild(c));d=C,a=S}(null===d&&l||d!==c&&d!==g(c))&&(I=d,a.insertBefore(c,d),k.emit("shadow",c,a,S))}else f&&f.removeChild(c)}function v(e){k.emit(e,c,j,S)}}function Z(e,t){for(var n=t;n!==e&&h(n)!==e;)n=h(n);return n===u?null:n}function ee(e,t,n,r){var o="horizontal"===P.direction;return t!==e?function(){var e=t.getBoundingClientRect();if(o)return i(n>e.left+v(e)/2);return i(r>e.top+p(e)/2)}():function(){var t,i,c,u=e.children.length;for(t=0;t<u;t++){if(i=e.children[t],c=i.getBoundingClientRect(),o&&c.left+c.width/2>n)return i;if(!o&&c.top+c.height/2>r)return i}return null}();function i(e){return e?g(t):t}}}}).call(this,n(0))},function(e,t,n){"use strict";var r=n(9),o=n(10);e.exports=function(e,t){var n=t||{},i={};return void 0===e&&(e={}),e.on=function(t,n){return i[t]?i[t].push(n):i[t]=[n],e},e.once=function(t,n){return n._once=!0,e.on(t,n),e},e.off=function(t,n){var r=arguments.length;if(1===r)delete i[t];else if(0===r)i={};else{var o=i[t];if(!o)return e;o.splice(o.indexOf(n),1)}return e},e.emit=function(){var t=r(arguments);return e.emitterSnapshot(t.shift()).apply(this,t)},e.emitterSnapshot=function(t){var c=(i[t]||[]).slice(0);return function(){var i=r(arguments),u=this||e;if("error"===t&&!1!==n.throws&&!c.length)throw 1===i.length?i[0]:i;return c.forEach((function(r){n.async?o(r,i,u):r.apply(u,i),r._once&&e.off(t,r)})),e}},e}},function(e,t){e.exports=function(e,t){return Array.prototype.slice.call(e,t)}},function(e,t,n){"use strict";var r=n(11);e.exports=function(e,t,n){e&&r((function(){e.apply(n||null,t||[])}))}},function(e,t,n){(function(t){var n;n="function"==typeof t?function(e){t(e)}:function(e){setTimeout(e,0)},e.exports=n}).call(this,n(12).setImmediate)},function(e,t,n){(function(e){var r=void 0!==e&&e||"undefined"!=typeof self&&self||window,o=Function.prototype.apply;function i(e,t){this._id=e,this._clearFn=t}t.setTimeout=function(){return new i(o.call(setTimeout,r,arguments),clearTimeout)},t.setInterval=function(){return new i(o.call(setInterval,r,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close()},i.prototype.unref=i.prototype.ref=function(){},i.prototype.close=function(){this._clearFn.call(r,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout((function(){e._onTimeout&&e._onTimeout()}),t))},n(13),t.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==e&&e.setImmediate||this&&this.setImmediate,t.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==e&&e.clearImmediate||this&&this.clearImmediate}).call(this,n(0))},function(e,t,n){(function(e,t){!function(e,n){"use strict";if(!e.setImmediate){var r,o,i,c,u,a=1,l={},f=!1,s=e.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(e);d=d&&d.setTimeout?d:e,"[object process]"==={}.toString.call(e.process)?r=function(e){t.nextTick((function(){v(e)}))}:!function(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=n,t}}()?e.MessageChannel?((i=new MessageChannel).port1.onmessage=function(e){v(e.data)},r=function(e){i.port2.postMessage(e)}):s&&"onreadystatechange"in s.createElement("script")?(o=s.documentElement,r=function(e){var t=s.createElement("script");t.onreadystatechange=function(){v(e),t.onreadystatechange=null,o.removeChild(t),t=null},o.appendChild(t)}):r=function(e){setTimeout(v,0,e)}:(c="setImmediate$"+Math.random()+"$",u=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(c)&&v(+t.data.slice(c.length))},e.addEventListener?e.addEventListener("message",u,!1):e.attachEvent("onmessage",u),r=function(t){e.postMessage(c+t,"*")}),d.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];var o={callback:e,args:t};return l[a]=o,r(a),a++},d.clearImmediate=m}function m(e){delete l[e]}function v(e){if(f)setTimeout(v,0,e);else{var t=l[e];if(t){f=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{m(e),f=!1}}}}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,n(0),n(14))},function(e,t){var n,r,o=e.exports={};function i(){throw new Error("setTimeout has not been defined")}function c(){throw new Error("clearTimeout has not been defined")}function u(e){if(n===setTimeout)return setTimeout(e,0);if((n===i||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:i}catch(e){n=i}try{r="function"==typeof clearTimeout?clearTimeout:c}catch(e){r=c}}();var a,l=[],f=!1,s=-1;function d(){f&&a&&(f=!1,a.length?l=a.concat(l):s=-1,l.length&&m())}function m(){if(!f){var e=u(d);f=!0;for(var t=l.length;t;){for(a=l,l=[];++s<t;)a&&a[s].run();s=-1,t=l.length}a=null,f=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===c||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function v(e,t){this.fun=e,this.array=t}function p(){}o.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];l.push(new v(e,t)),1!==l.length||f||u(m)},v.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=p,o.addListener=p,o.once=p,o.off=p,o.removeListener=p,o.removeAllListeners=p,o.emit=p,o.prependListener=p,o.prependOnceListener=p,o.listeners=function(e){return[]},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},function(e,t,n){"use strict";(function(t){var r=n(16),o=n(17),i=t.document,c=function(e,t,n,r){return e.addEventListener(t,n,r)},u=function(e,t,n,r){return e.removeEventListener(t,n,r)},a=[];function l(e,t,n){var r=function(e,t,n){var r,o;for(r=0;r<a.length;r++)if((o=a[r]).element===e&&o.type===t&&o.fn===n)return r}(e,t,n);if(r){var o=a[r].wrapper;return a.splice(r,1),o}}t.addEventListener||(c=function(e,n,r){return e.attachEvent("on"+n,function(e,n,r){var o=l(e,n,r)||function(e,n,r){return function(n){var o=n||t.event;o.target=o.target||o.srcElement,o.preventDefault=o.preventDefault||function(){o.returnValue=!1},o.stopPropagation=o.stopPropagation||function(){o.cancelBubble=!0},o.which=o.which||o.keyCode,r.call(e,o)}}(e,0,r);return a.push({wrapper:o,element:e,type:n,fn:r}),o}(e,n,r))},u=function(e,t,n){var r=l(e,t,n);if(r)return e.detachEvent("on"+t,r)}),e.exports={add:c,remove:u,fabricate:function(e,t,n){var c=-1===o.indexOf(t)?new r(t,{detail:n}):function(){var e;i.createEvent?(e=i.createEvent("Event")).initEvent(t,!0,!0):i.createEventObject&&(e=i.createEventObject());return e}();e.dispatchEvent?e.dispatchEvent(c):e.fireEvent("on"+t,c)}}}).call(this,n(0))},function(e,t,n){(function(t){var n=t.CustomEvent;e.exports=function(){try{var e=new n("cat",{detail:{foo:"bar"}});return"cat"===e.type&&"bar"===e.detail.foo}catch(e){}return!1}()?n:"function"==typeof document.createEvent?function(e,t){var n=document.createEvent("CustomEvent");return t?n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail):n.initCustomEvent(e,!1,!1,void 0),n}:function(e,t){var n=document.createEventObject();return n.type=e,t?(n.bubbles=Boolean(t.bubbles),n.cancelable=Boolean(t.cancelable),n.detail=t.detail):(n.bubbles=!1,n.cancelable=!1,n.detail=void 0),n}}).call(this,n(0))},function(e,t,n){"use strict";(function(t){var n=[],r="",o=/^on/;for(r in t)o.test(r)&&n.push(r.slice(2));e.exports=n}).call(this,n(0))},function(e,t,n){"use strict";var r={},o="(?:^|\\s)",i="(?:\\s|$)";function c(e){var t=r[e];return t?t.lastIndex=0:r[e]=t=new RegExp(o+e+i,"g"),t}e.exports={add:function(e,t){var n=e.className;n.length?c(t).test(n)||(e.className+=" "+t):e.className=t},rm:function(e,t){e.className=e.className.replace(c(t)," ").trim()}}}]);
//# sourceMappingURL=admin-page.property.items-0.0.169.js.map