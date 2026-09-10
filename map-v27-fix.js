(()=>{
'use strict';
if(window.__WARDOGS_MAP_V27_FIX__)return;
window.__WARDOGS_MAP_V27_FIX__=true;
const MAX=7,$=id=>document.getElementById(id);
const state=()=>window.Wardogs19||window.Wardogs11;
const mapApi=()=>state()?.map;
const host=()=>$('map');
function toast(v){const e=$('toast');if(!e)return;e.textContent=v;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1400)}
function mapMetrics(m){const q=m?.q,h=host();if(!q||!h)return null;const W=h.clientWidth,H=h.clientHeight,bw=q.view.maxX-q.view.minX,bh=q.view.maxY-q.view.minY,base=Math.min(Math.max(1,(W-16)/bw),Math.max(1,(H-16)/bh)),scale=base*2**Number(q.zoom||0),mw=bw*scale,mh=bh*scale;return{q,h,W,H,scale,mw,mh,left:(W-mw)/2+q.px,top:(H-mh)/2+q.py}}
function clamp(v){if(!v)return;const mx=Math.max(0,(v.mw-v.W)/2),my=Math.max(0,(v.mh-v.H)/2);v.q.px=Math.max(-mx,Math.min(mx,v.q.px));v.q.py=Math.max(-my,Math.min(my,v.q.py))}
function screenToWorld(v,x,y){return{x:v.q.view.minX+(x-v.left)/v.scale,y:v.q.view.maxY-(y-v.top)/v.scale}}
function worldToScreen(v,x,y){return{x:v.left+(x-v.q.view.minX)*v.scale,y:v.top+(v.q.view.maxY-y)*v.scale}}
function setSelectedPoint(c,label){const s=state(),m=mapApi();if(!s||!m||!c)return false;if(s.mode==='target'){if(s.targetLocked){toast(s.lang==='zh'?'目标已锁定':'TARGET IS LOCKED');return false}s.target={x:Number(c.x),y:Number(c.y)}}else{if(s.gunLocked){toast(s.lang==='zh'?'炮位已锁定':'GUN IS LOCKED');return false}s.gun={x:Number(c.x),y:Number(c.y)}}s.mapData=m.q?.data||s.mapData;m.refresh?.();toast(label|| (s.mode==='target'?(s.lang==='zh'?'目标已设置':'TARGET SET'):(s.lang==='zh'?'炮位已设置':'GUN SET')));return true}
function towerFromSelect(){const m=mapApi(),sel=$('towerSelect');if(!m||!sel||!sel.value)return null;return(m.q?.data?.markers||[]).find(x=>x.icon==='tower'&&x.label===sel.value&&x.active!==false&&x.inactive!==true)||null}
function focusPoint(c){const m=mapApi(),v=mapMetrics(m);if(!m||!v||!c)return;const p=worldToScreen(v,c.x,c.y);m.q.px+=v.W/2-p.x;m.q.py+=v.H/2-p.y;clamp(mapMetrics(m));m.refresh?.()}
function normalizeCanvas(){const m=mapApi(),h=host(),canvas=h?.querySelector('.v22-canvas');if(!m||!h||!canvas)return;const w=Math.max(1,Math.round(h.clientWidth)),hh=Math.max(1,Math.round(h.clientHeight));if(canvas.width!==w||canvas.height!==hh||canvas.style.width!==w+'px'||canvas.style.height!==hh+'px'){canvas.width=w;canvas.height=hh;canvas.style.width=w+'px';canvas.style.height=hh+'px';canvas.style.display='block';m.refresh?.()}}
let wrappedMap=null;
function stabilizeResize(){const m=mapApi();if(!m)return;if(wrappedMap===m)return;wrappedMap=m;const orig=m.resize?.bind(m);m.resize=()=>{orig?.();normalizeCanvas();m.refresh?.()};normalizeCanvas()}
function wireTowerQuick(){const b=$('towerGo');if(!b)return;const handler=e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const raw=towerFromSelect();if(!raw)return;const c={x:Number(raw.x)/100,y:Number(raw.y)/100};if(setSelectedPoint(c,String(raw.label||'')))focusPoint(c)};b.onclick=handler;b.dataset.v27='1'}
function wireTowerMarkers(){const h=host();if(!h||h.dataset.v27tower)return;h.dataset.v27tower='1';h.addEventListener('click',e=>{const el=e.target.closest?.('.v22-tower');if(!el)return;e.preventDefault();e.stopImmediatePropagation();const c={x:Number(el.dataset.x),y:Number(el.dataset.y)};if(!Number.isFinite(c.x)||!Number.isFinite(c.y))return;setSelectedPoint(c,el.dataset.label||'TOWER');focusPoint(c)},true)}
function wireHelp(){const s=state();const e=$('mapHelp');if(!e||!s)return;e.textContent=s.lang==='zh'?'点击地图设置点位；拖动平移；双指或滚轮缩放。高塔快速定位会按照当前选中的“炮位 / 目标”设定。坐标快速定位使用 X / Y 两个输入框。':'Tap the map to place a point; drag to pan; pinch or wheel to zoom. Tower quick location follows the currently selected GUN / TARGET mode. Coordinate jump uses separate X / Y inputs.'}
let activePointers=new Map();let drag=null;let pinch=null;let globalBound=false;
function globalGestures(){if(globalBound)return;globalBound=true;
 document.addEventListener('pointerdown',e=>{const h=host();if(!h||!h.contains(e.target)||e.target.closest?.('.v22-marker'))return;if(e.pointerType==='mouse'&&e.button!==0)return;const m=mapApi();if(!m?.q)return;activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(activePointers.size===1){drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,px:m.q.px,py:m.q.py,mapId:m.id};}else if(activePointers.size===2){const a=[...activePointers.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z:m.q.zoom,mapId:m.id};drag=null}},true);
 document.addEventListener('pointermove',e=>{if(!activePointers.has(e.pointerId))return;const m=mapApi();if(!m?.q)return;activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(drag?.mapId!==m.id&&pinch?.mapId!==m.id)return;const h=host();if(!h)return;e.preventDefault();if(pinch&&activePointers.size===2){const a=[...activePointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);m.q.zoom=Math.max(0,Math.min(MAX,pinch.z+Math.log2(Math.max(1,d)/Math.max(1,pinch.d))));clamp(mapMetrics(m));m.refresh?.();return}if(drag?.id===e.pointerId){m.q.px=drag.px+e.clientX-drag.startX;m.q.py=drag.py+e.clientY-drag.startY;clamp(mapMetrics(m));m.refresh?.()}},true);
 const end=e=>{if(!activePointers.has(e.pointerId))return;const m=mapApi(),g=drag;const moved=g&&g.id===e.pointerId?Math.hypot(e.clientX-g.startX,e.clientY-g.startY):999;activePointers.delete(e.pointerId);if(activePointers.size<2)pinch=null;if(g&&g.id===e.pointerId&&moved<6&&m){const h=host(),r=h?.getBoundingClientRect();if(r&&!e.target.closest?.('.v22-marker')){const v=mapMetrics(m),c=screenToWorld(v,e.clientX-r.left,e.clientY-r.top);if(c.x>=m.q.view.minX&&c.x<=m.q.view.maxX&&c.y>=m.q.view.minY&&c.y<=m.q.view.maxY)setSelectedPoint(c)}}drag=null};
 document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);
}
function wire(){stabilizeResize();wireTowerQuick();wireTowerMarkers();wireHelp();globalGestures()}
wire();setInterval(wire,200);window.addEventListener('wardogs:i18n',wire);window.addEventListener('resize',()=>setTimeout(normalizeCanvas,0));window.addEventListener('orientationchange',()=>setTimeout(normalizeCanvas,80));
})();
