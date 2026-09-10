(()=>{
'use strict';
if(window.__WARDOGS_MAP_V22_FIX__)return;window.__WARDOGS_MAP_V22_FIX__=true;
const MAX=7,$=id=>document.getElementById(id);
function getMap(){return window.Wardogs19?.map||window.Wardogs11?.map}
function metrics(m){const q=m?.q,host=$('map');if(!q||!host)return null;const W=host.clientWidth,H=host.clientHeight,bw=q.view.maxX-q.view.minX,bh=q.view.maxY-q.view.minY,base=Math.min(Math.max(1,(W-16)/bw),Math.max(1,(H-16)/bh)),scale=base*2**Number(q.zoom||0),mw=bw*scale,mh=bh*scale;return{q,host,W,H,bw,bh,base,scale,mw,mh,left:(W-mw)/2+q.px,top:(H-mh)/2+q.py}}
function clamp(v){if(!v)return;const mx=Math.max(0,(v.mw-v.W)/2),my=Math.max(0,(v.mh-v.H)/2);v.q.px=Math.max(-mx,Math.min(mx,v.q.px));v.q.py=Math.max(-my,Math.min(my,v.q.py))}
function w2s(v,x,y){return{x:v.left+(x-v.q.view.minX)*v.scale,y:v.top+(v.q.view.maxY-y)*v.scale}}
function s2w(v,x,y){return{x:v.q.view.minX+(x-v.left)/v.scale,y:v.q.view.maxY-(y-v.top)/v.scale}}
function refresh(){getMap()?.refresh?.()}
function inMap(e){const host=$('map');if(!host)return null;const el=document.elementFromPoint(e.clientX,e.clientY);return el&&host.contains(el)?{host,el}:null}
function wireButtons(){for(const [id,fn] of [['fitMap',()=>{const q=getMap()?.q;if(q){q.zoom=0;q.px=0;q.py=0;refresh()}}],['zoomIn',()=>{const q=getMap()?.q;if(q){q.zoom=Math.min(MAX,Number(q.zoom||0)+1);refresh()}}],['zoomOut',()=>{const q=getMap()?.q;if(q){q.zoom=Math.max(0,Number(q.zoom||0)-1);refresh()}}]]){const e=$(id);if(!e||e.dataset.v26)return;e.dataset.v26='1';e.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();fn()},true)}}
function setPointAt(v,x,y){const s=window.Wardogs19||window.Wardogs11;if(!v||!s)return;const c=s2w(v,x,y);if(c.x<v.q.view.minX||c.x>v.q.view.maxX||c.y<v.q.view.minY||c.y>v.q.view.maxY)return;if(s.mode==='target'){if(s.targetLocked)return;s.target=c}else{if(s.gunLocked)return;s.gun=c}s.mapData=v.q.data;refresh()}
const pointers=new Map();let gesture=null,eventsBound=false;
function bindGlobal(){if(eventsBound)return;eventsBound=true;
 window.addEventListener('wheel',e=>{const hit=inMap(e);if(!hit)return;const m=getMap(),v=metrics(m);if(!v)return;e.preventDefault();e.stopImmediatePropagation();const r=hit.host.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,c=s2w(v,mx,my),old=v.q.zoom;v.q.zoom=Math.max(0,Math.min(MAX,old+(e.deltaY<0?1:-1)));const n=metrics(m),p=w2s(n,c.x,c.y);v.q.px+=mx-p.x;v.q.py+=my-p.y;clamp(n);refresh()},{passive:false,capture:true});
 window.addEventListener('pointerdown',e=>{const hit=inMap(e);if(!hit||hit.el.closest?.('.v22-marker'))return;if(e.pointerType==='mouse'&&e.button!==0)return;const m=getMap();if(!m?.q)return;e.preventDefault();e.stopImmediatePropagation();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){gesture={mode:'drag',id:e.pointerId,startX:e.clientX,startY:e.clientY,px:m.q.px,py:m.q.py,mapId:m.id}}else if(pointers.size===2){const a=[...pointers.values()];gesture={mode:'pinch',d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z:m.q.zoom,mapId:m.id};}},true);
 window.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const m=getMap();if(!m?.q)return;e.preventDefault();e.stopImmediatePropagation();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const q=m.q;if(gesture?.mapId!==m.id)return;if(gesture.mode==='pinch'&&pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);q.zoom=Math.max(0,Math.min(MAX,gesture.z+Math.log2(Math.max(1,d)/Math.max(1,gesture.d))));clamp(metrics(m));refresh()}else if(gesture.mode==='drag'&&gesture.id===e.pointerId){q.px=gesture.px+e.clientX-gesture.startX;q.py=gesture.py+e.clientY-gesture.startY;clamp(metrics(m));refresh()}},true);
 const end=e=>{if(!pointers.has(e.pointerId))return;const m=getMap(),g=gesture;e.preventDefault();e.stopImmediatePropagation();pointers.delete(e.pointerId);if(pointers.size<2)gesture=null;if(m&&g?.mapId===m.id&&g.mode==='drag'&&g.id===e.pointerId&&Math.hypot(e.clientX-g.startX,e.clientY-g.startY)<6){const hit=inMap(e),r=hit?.host?.getBoundingClientRect();if(hit&&r&&!hit.el.closest?.('.v22-marker'))setPointAt(metrics(m),e.clientX-r.left,e.clientY-r.top)}if(m?.q?.releasePointerCapture)try{m.q.releasePointerCapture(e.pointerId)}catch{}};
 window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);
}
function wire(){wireButtons();bindGlobal()}
wire();setInterval(wire,250);window.addEventListener('wardogs:i18n',wire);
})();
