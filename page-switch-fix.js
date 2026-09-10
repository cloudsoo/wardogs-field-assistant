(()=>{
'use strict';
if(window.__WARDOGS_PAGE_SWITCH_FIX__)return;
window.__WARDOGS_PAGE_SWITCH_FIX__=true;
const $=id=>document.getElementById(id);
const state=()=>window.Wardogs19||window.Wardogs11;
function repair(pass=0){
  const page2=$('page2'),h=$('map');
  if(!page2?.classList.contains('active')||!h)return;
  const s=state(),m=s?.map;if(!m)return;
  const rect=h.getBoundingClientRect();
  if(rect.width<2||rect.height<2){if(pass<6)setTimeout(()=>repair(pass+1),80);return}
  try{m.resize?.()}catch{}
  const c=h.querySelector('.v22-canvas');
  if(c){
    const w=Math.max(1,Math.round(h.clientWidth)),hh=Math.max(1,Math.round(h.clientHeight));
    c.style.width=w+'px';c.style.height=hh+'px';
    if(c.width!==w||c.height!==hh){c.width=w;c.height=hh}
  }
  const q=m.q;
  if(q){
    q.px=Number.isFinite(q.px)?q.px:0;
    q.py=Number.isFinite(q.py)?q.py:0;
    q.zoom=Math.max(0,Math.min(7,Number.isFinite(q.zoom)?q.zoom:0));
    m.refresh?.();
  }
}
function schedule(){setTimeout(()=>repair(),80);setTimeout(()=>repair(),320)}
$('nav2')?.addEventListener('click',schedule,false);
$('nav1')?.addEventListener('click',()=>setTimeout(()=>{try{state()?.map?.resize?.()}catch{}},0),false);
window.addEventListener('resize',()=>{$('page2')?.classList.contains('active')&&schedule()},{passive:true});
window.addEventListener('orientationchange',()=>{$('page2')?.classList.contains('active')&&schedule()},{passive:true});
})();
