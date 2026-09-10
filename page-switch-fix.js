(()=>{
'use strict';
if(window.__WARDOGS_PAGE_SWITCH_FIX__)return;
window.__WARDOGS_PAGE_SWITCH_FIX__=true;
const $=id=>document.getElementById(id);
const state=()=>window.Wardogs19||window.Wardogs11;
function activePage2(){return $('page2')?.classList.contains('active')===true}
function repair(pass=0){
  if(!activePage2())return;
  const s=state(),m=s?.map,h=$('map');if(!m||!h)return;
  const rect=h.getBoundingClientRect();
  if(rect.width<2||rect.height<2){if(pass<8)setTimeout(()=>repair(pass+1),40);return}
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
  if(pass<3){requestAnimationFrame(()=>repair(pass+1));setTimeout(()=>repair(pass+1),120)}
}
function schedule(){repair(0);setTimeout(()=>repair(1),30);setTimeout(()=>repair(2),160);setTimeout(()=>repair(3),420)}
const nav2=$('nav2'),nav1=$('nav1');
nav2?.addEventListener('click',()=>schedule(),false);
nav1?.addEventListener('click',()=>setTimeout(()=>{const s=state();try{s?.map?.resize?.()}catch{}},0),false);
new MutationObserver(()=>{if(activePage2())schedule()}).observe($('page2')||document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',()=>{if(activePage2())schedule()},{passive:true});
window.addEventListener('orientationchange',()=>{if(activePage2())schedule()},{passive:true});
schedule();
})();
