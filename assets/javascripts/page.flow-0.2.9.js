(()=>{for(var e=document.querySelectorAll(".fb-page-steps"),t=function(t){for(var n=e[t],o=n.parentNode;!o.classList.contains("fb-step-wrapper");)o=o.parentNode;n.addEventListener("mouseover",(function(){o.classList.add("fb-step-highlight")})),n.addEventListener("mouseout",(function(){o.classList.remove("fb-step-highlight")}))},n=0;n<e.length;++n)t(n);var o=document.querySelector(".govuk-main-wrapper"),c=o.cloneNode(!0),r=document.createElement("div");r.id="minimapContainer";var a=document.createElement("div");a.id="minimapLocation",r.appendChild(c),r.appendChild(a),document.body.appendChild(r);var i=.05;o.style.maxHeight="".concat(.375*o.scrollHeight,"px");var l=document.documentElement.clientWidth/o.scrollWidth,s=c.scrollWidth*i*l;a.style.width="".concat(s,"px");var d=document.documentElement.scrollHeight*i;a.style.height="".concat(d,"px"),r.style.height="".concat(d,"px"),o.style.maxHeight="".concat(parseInt(o.style.maxHeight,10)+d,"px");var u=function(){var e=document.documentElement.scrollLeft*i;a.style.marginLeft="".concat(e,"px")};c.onclick=function(e){var t=Math.max(0,20*(e.clientX-c.offsetLeft)-200);document.documentElement.scrollLeft=t,u()},window.onscroll=u,Array.from(document.querySelectorAll(".fb-step .govuk-radios__input, .fb-step .govuk-checkboxes__input, .fb-step .govuk-button, .fb-step [aria-controls]")).forEach((function(e){e.addEventListener("click",(function(e){e.target.blur(),e.preventDefault(),e.stopPropagation()}))})),Array.from(document.querySelectorAll(".fb-step input, .fb-step textarea")).forEach((function(e){e.addEventListener("focus",(function(){e.blur()}))}))})();
//# sourceMappingURL=page.flow-0.2.9.js.map