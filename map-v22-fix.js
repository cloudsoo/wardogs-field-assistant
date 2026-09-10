(()=>{
'use strict';
if(window.__WARDOGS_MAP_V22_FIX__)return;window.__WARDOGS_MAP_V22_FIX__=true;
function getMap(){return window.Wardogs19?.map||window.Wardogs11?.map}
function bind(id,fn){const e=document.getElementById(id);if(!e||e.dataset.v23fix)return;e.dataset.v23fix='1';const run=ev=>{ev?.preventDefault?.();ev?.stopImmediatePropagation?.();fn()};e.onclick=run;e.addEventListener('click',run,true)}
function wire(){const m=getMap(),q=m?.q;if(!q||!m?.refresh)return;bind('fitMap',()=>{q.zoom=0;q.px=0;q.py=0;m.refresh()});bind('zoomIn',()=>{q.zoom=Math.min(7,Number(q.zoom||0)+1);m.refresh()});bind('zoomOut',()=>{q.zoom=Math.max(0,Number(q.zoom||0)-1);m.refresh()})}
wire();setInterval(wire,200);window.addEventListener('wardogs:i18n',wire);
})();
