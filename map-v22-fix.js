(()=>{
'use strict';
if(window.__WARDOGS_MAP_V22_FIX__)return;window.__WARDOGS_MAP_V22_FIX__=true;
function bind(){const btn=document.getElementById('fitMap');if(!btn||btn.dataset.v23fit)return;btn.dataset.v23fit='1';btn.addEventListener('click',()=>{const m=window.Wardogs19?.map||window.Wardogs11?.map;const q=m?.q;if(!q)return;q.zoom=0;q.px=0;q.py=0;m.refresh?.()})}
bind();setInterval(bind,200);window.addEventListener('wardogs:i18n',bind);
})();
