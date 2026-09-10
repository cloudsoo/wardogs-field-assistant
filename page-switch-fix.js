(()=>{
'use strict';
if(window.__WARDOGS_PAGE_SWITCH_FIX__)return;
window.__WARDOGS_PAGE_SWITCH_FIX__=true;
const $=id=>document.getElementById(id),state=()=>window.Wardogs19||window.Wardogs11;
let returning=false;
function normalize(){const h=$('map'),c=h?.querySelector('.v22-canvas');if(!h||!c)return;const w=Math.max(1,Math.round(h.clientWidth)),hh=Math.max(1,Math.round(h.clientHeight));c.style.width=w+'px';c.style.height=hh+'px';if(c.width!==w||c.height!==hh){c.width=w;c.height=hh}}
function repair(){const p=$('page2'),h=$('map'),m=state()?.map;if(!p?.classList.contains('active')||!h||!m?.q||h.clientWidth<2||h.clientHeight<2)return;normalize();const q=m.q;if(returning){q.px=0;q.py=0;q.zoom=0;returning=false}else{q.px=Number.isFinite(q.px)?q.px:0;q.py=Number.isFinite(q.py)?q.py:0;q.zoom=Math.max(0,Math.min(7,Number.isFinite(q.zoom)?q.zoom:0))}m.refresh?.()}
function schedule(){setTimeout(repair,180);setTimeout(repair,500);setTimeout(repair,900)}
$('nav1')?.addEventListener('click',()=>{returning=true},false);
$('nav2')?.addEventListener('click',schedule,false);
window.addEventListener('resize',()=>{$('page2')?.classList.contains('active')&&schedule()},{passive:true});
window.addEventListener('orientationchange',()=>{$('page2')?.classList.contains('active')&&schedule()},{passive:true});
})();
