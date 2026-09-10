(()=>{
'use strict';
if(window.__WARDOGS_MAP_V22_FIX__)return;window.__WARDOGS_MAP_V22_FIX__=true;
const MAX=7,$=id=>document.getElementById(id);
function getMap(){return window.Wardogs19?.map||window.Wardogs11?.map}
function metrics(m){const q=m?.q,host=$('map');if(!q||!host)return null;const W=host.clientWidth,H=host.clientHeight,bw=q.view.maxX-q.view.minX,bh=q.view.maxY-q.view.minY,base=Math.min(Math.max(1,(W-16)/bw),Math.max(1,(H-16)/bh)),scale=base*2**Number(q.zoom||0),mw=bw*scale,mh=bh*scale;return{q,host,W,H,bw,bh,base,scale,mw,mh,left:(W-mw)/2+q.px,top:(H-mh)/2+q.py}}
function clamp(v){const mx=Math.max(0,(v.mw-v.W)/2),my=Math.max(0,(v.mh-v.H)/2);v.q.px=Math.max(-mx,Math.min(mx,v.q.px));v.q.py=Math.max(-my,Math.min(my,v.q.py))}
function w2s(v,x,y){return{x:v.left+(x-v.q.view.minX)*v.scale,y:v.top+(v.q.view.maxY-y)*v.scale}}
function s2w(v,x,y){return{x:v.q.view.minX+(x-v.left)/v.scale,y:v.q.view.maxY-(y-v.top)/v.scale}}
function refresh(){getMap()?.refresh?.()}
function isMapEvent(e){const host=$('map'),root=host?.querySelector('.v22-root');if(!host||!root||!root.contains(e.target))return false;if(e.target.closest?.('.v22-marker'))return false;return true}
function wireButtons(){for(const [id,fn] of [['fitMap',()=>{const m=getMap(),q=m?.q;if(q){q.zoom=0;q.px=0;q.py=0;refresh()}}],['zoomIn',()=>{const m=getMap(),q=m?.q;if(q){q.zoom=Math.min(MAX,Number(q.zoom||0)+1);refresh()}}],['zoomOut',()=>{const m=getMap(),q=m?.q;if(q){q.zoom=Math.max(0,Number(q.zoom||0)-1);refresh()}}]]){const e=$(id);if(!e||e.dataset.v24)return;e.dataset.v24='1';e.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();fn()},true)}}
function setPointAt(v,x,y){const m=getMap(),q=m?.q,s=window.Wardogs19||window.Wardogs11;if(!q||!s)return;const c=s2w(v,x,y);if(c.x<q.view.minX||c.x>q.view.maxX||c.y<q.view.minY||c.y>q.view.maxY)return;if(s.mode==='target'){if(s.targetLocked)return;s.target=c}else{if(s.gunLocked)return;s.gun=c}s.mapData=q.data;s.map?.refresh?.()}
let pointer=new Map(),drag=null,pinch=null;
function install(){const host=$('map'),root=host?.querySelector('.v22-root');if(!host||!root||root.dataset.v24events)return;root.dataset.v24events='1';host.style.touchAction='none';root.style.touchAction='none';root.querySelector('.v22-canvas')?.style.setProperty('touch-action','none');
 document.addEventListener('wheel',e=>{if(!isMapEvent(e))return;const m=getMap(),q=m?.q;if(!q)return;e.preventDefault();e.stopImmediatePropagation();const v=metrics(m),r=root.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,c=s2w(v,mx,my),old=q.zoom;q.zoom=Math.max(0,Math.min(MAX,old+(e.deltaY<0?1:-1)));const n=metrics(m),p=w2s(n,c.x,c.y);q.px+=mx-p.x;q.py+=my-p.y;clamp(n);refresh()},true);
 root.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest?.('.v22-marker'))return;e.preventDefault();e.stopImmediatePropagation();pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointer.size===2){const a=[...pointer.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z:getMap()?.q?.zoom||0};drag=null}else{root.setPointerCapture?.(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:getMap()?.q?.px||0,py:getMap()?.q?.py||0};}install.lastClick={x:e.clientX,y:e.clientY,time:performance.now()};},true);
 root.addEventListener('pointermove',e=>{if(!pointer.has(e.pointerId))return;e.preventDefault();e.stopImmediatePropagation();pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});const m=getMap();if(!m)return;const q=m.q;if(pinch&&pointer.size===2){const a=[...pointer.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);q.zoom=Math.max(0,Math.min(MAX,pinch.z+Math.log2(Math.max(1,d)/Math.max(1,pinch.d))));clamp(metrics(m));refresh();return}if(drag?.id===e.pointerId){q.px=drag.px+e.clientX-drag.x;q.py=drag.py+e.clientY-drag.y;clamp(metrics(m));refresh()}},true);
 const up=e=>{if(!pointer.has(e.pointerId))return;e.preventDefault();e.stopImmediatePropagation();const p=pointer.get(e.pointerId);pointer.delete(e.pointerId);if(pointer.size<2)pinch=null;const m=getMap();if(m&&drag?.id===e.pointerId){const moved=Math.hypot(e.clientX-p.x,e.clientY-p.y);if(moved<6)setPointAt(metrics(m),e.clientX-root.getBoundingClientRect().left,e.clientY-root.getBoundingClientRect().top)}drag=null;};root.addEventListener('pointerup',up,true);root.addEventListener('pointercancel',up,true);
}
function wire(){wireButtons();install()}
wire();setInterval(wire,250);window.addEventListener('wardogs:i18n',wire);
})();
