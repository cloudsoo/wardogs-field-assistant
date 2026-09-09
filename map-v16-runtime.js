(()=>{
'use strict';
function boot(){
  if(window.__wardogsMapV16Runtime)return;
  window.__wardogsMapV16Runtime=true;
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('#v14-tgo');
    if(!b)return;
    const map=window.Wardogs11?.canvasMap;
    const sel=document.getElementById('v14-tower');
    const raw=sel?.value;
    if(!map||!raw)return;
    const localized=raw.replace(/^Tower /,'高塔 ');
    const marker=[...document.querySelectorAll('.v14-tower-marker')].find(el=>el.textContent?.includes(localized)||el.title?.includes(localized));
    if(!marker)return;
    const title=marker.getAttribute('title')||'';
    const m=title.match(/X\s*(-?\d+(?:\.\d+)?)\s*\/\s*Y\s*(-?\d+(?:\.\d+)?)/);
    if(!m)return;
    e.preventDefault();e.stopImmediatePropagation();
    const c={x:Number(m[1]),y:Number(m[2])};
    if(map.getZoom()<1)map.zoomIn();
    const recenter=()=>map.setView(c);
    recenter();
    setTimeout(recenter,50);
    setTimeout(recenter,160);
  },true);
}
boot();
})();
