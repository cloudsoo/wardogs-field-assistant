(()=>{
'use strict';
if(window.__WARDOGS_PAGE_SWITCH_FIX__)return;
window.__WARDOGS_PAGE_SWITCH_FIX__=true;
const $=id=>document.getElementById(id),state=()=>window.Wardogs19||window.Wardogs11;
let saved=null;
function clamp(m){const h=$('map'),q=m?.q;if(!h||!q||!q.view)return;const W=h.clientWidth,H=h.clientHeight,bw=q.view.maxX-q.view.minX,bh=q.view.maxY-q.view.minY,base=Math.min(Math.max(1,(W-16)/bw),Math.max(1,(H-16)/bh)),scale=base*2**Number(q.zoom||0),mw=bw*scale,mh=bh*scale;const mx=Math.max(0,(mw-W)/2),my=Math.max(0,(mh-H)/2);q.px=Math.max(-mx,Math.min(mx,Number(q.px)||0));q.py=Math.max(-my,Math.min(my,Number(q.py)||0));q.zoom=Math.max(0,Math.min(7,Number(q.zoom)||0))}
function normalize(){const h=$('map'),c=h?.querySelector('.v22-canvas');if(!h||!c)return;const w=Math.max(1,Math.round(h.clientWidth)),hh=Math.max(1,Math.round(h.clientHeight));c.style.width=w+'px';c.style.height=hh+'px';if(c.width!==w||c.height!==hh){c.width=w;c.height=hh}}
function save(){const m=state()?.map,q=m?.q;if(!q)return;saved={id:m.id,px:Number(q.px)||0,py:Number(q.py)||0,zoom:Math.max(0,Math.min(7,Number(q.zoom)||0))}}
function restore(){const p=$('page2'),h=$('map'),m=state()?.map;if(!p?.classList.contains('active')||!h||!m?.q||h.clientWidth<2||h.clientHeight<2)return;normalize();const q=m.q;if(saved?.id===m.id){q.px=saved.px;q.py=saved.py;q.zoom=saved.zoom}clamp(m);m.refresh?.()}
function schedule(){setTimeout(restore,180);setTimeout(restore,450);setTimeout(restore,900)}
$('nav1')?.addEventListener('click',save,false);
$('nav2')?.addEventListener('click',schedule,false);
window.addEventListener('resize',()=>{$('page2')?.classList.contains('active')&&schedule()},{passive:true});
window.addEventListener('orientationchange',()=>{$('page2')?.classList.contains('active')&&schedule()},{passive:true});
})();
