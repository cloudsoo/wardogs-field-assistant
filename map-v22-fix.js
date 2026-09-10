(()=>{
'use strict';
if(window.__WARDOGS_MAP_V22_FIX__)return;window.__WARDOGS_MAP_V22_FIX__=true;
function bind(id,fn){const e=document.getElementById(id);if(!e||e.dataset.v23fix)return;e.dataset.v23fix='1';e.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();fn()},true)}
function wire(){const m=window.Wardogs19?.map||window.Wardogs11?.map,q=m?.q;if(!q||!m?.refresh)return;bind('fitMap',()=>{q.zoom=0;q.px=0;q.py=0;m.refresh()});bind('zoomIn',()=>{q.zoom=Math.min(7,q.zoom+1);m.refresh()});bind('zoomOut',()=>{q.zoom=Math.max(0,q.zoom-1);m.refresh()});}
wire();setInterval(wire,200);window.addEventListener('wardogs:i18n',wire);
})();
