(()=>{
'use strict';

const DATA='https://raw.githubusercontent.com/apollyon-sys/wardogs-calculator/main/maps/';
const DEFAULT_TILE_SIZE=256;
const DEFAULT_WORLD=163.84;
const MAX_ZOOM=7;
const TILE_CACHE=new Map();

function boot(){
  const s=window.Wardogs11;
  const host=document.getElementById('map');
  if(!s||!host){setTimeout(boot,100);return}
  if(s.__mapV13)return;
  s.__mapV13=true;
  s.__mapV13Build=build;
  bindNavigation(s);
  bindGlobalResize();
  setTimeout(()=>{if(document.getElementById('page2')?.classList.contains('active'))build()},80);
}

function bindNavigation(s){
  const n1=document.getElementById('nav1'),n2=document.getElementById('nav2');
  n2?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showPage(2);build()},true);
  n1?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showPage(1)},true);
  document.getElementById('mapSelect')?.addEventListener('change',()=>build(true));
}
function showPage(n){
  document.getElementById('page1')?.classList.toggle('active',n===1);
  document.getElementById('page2')?.classList.toggle('active',n===2);
  document.getElementById('nav1')?.classList.toggle('active',n===1);
  document.getElementById('nav2')?.classList.toggle('active',n===2);
  if(n===2)setTimeout(()=>window.Wardogs11?.canvasMap?.resize(),40);
}
function bindGlobalResize(){
  const fn=()=>setTimeout(()=>window.Wardogs11?.canvasMap?.resize(),60);
  window.addEventListener('resize',fn,{passive:true});
  window.addEventListener('orientationchange',fn,{passive:true});
}

async function loadConfig(id){
  const r=await fetch(DATA+id+'.json',{cache:'no-store'});
  if(!r.ok)throw new Error('map config '+r.status);
  return r.json();
}

function build(force=false){
  const s=window.Wardogs11,host=document.getElementById('map');
  if(!s||!host||!document.getElementById('page2')?.classList.contains('active')||!host.clientWidth||!host.clientHeight)return;
  const id=document.getElementById('mapSelect')?.value||'bakurani';
  if(s.canvasMap?.id===id&&!force){s.canvasMap.resize();return}
  if(s.canvasMap?.destroy)s.canvasMap.destroy();
  host.replaceChildren();
  const loadingHud=document.createElement('div');
  loadingHud.className='v13-hud';
  loadingHud.innerHTML='<span id="mapHud">加载地图中</span><span id="hudZoom">ZOOM 1×</span>';
  host.appendChild(loadingHud);
  const map=createCanvasMap(host,id);
  s.canvasMap=map;
  loadConfig(id).then(data=>{if(s.canvasMap!==map)return;map.setData(data);}).catch(err=>{console.error(err);map.setHud('地图加载失败，请重试')});
}

function createCanvasMap(host,id){
  const root=document.createElement('div');root.className='v13-map-root';
  const canvas=document.createElement('canvas');canvas.className='v13-map-canvas';root.appendChild(canvas);
  const overlay=document.createElement('div');overlay.className='v13-marker-layer';root.appendChild(overlay);
  const cross=document.createElement('div');cross.className='v13-cross';cross.innerHTML='<span></span>';
  root.appendChild(cross);
  host.appendChild(root);

  const ctx=canvas.getContext('2d',{alpha:false});
  const st=window.Wardogs11;
  const state={id,data:null,w:DEFAULT_WORLD,h:DEFAULT_WORLD,zoom:0,cx:DEFAULT_WORLD/2,cy:DEFAULT_WORLD/2,panX:0,panY:0,dpr:Math.max(1,Math.min(2,window.devicePixelRatio||1)),mapBounds:{minX:0,maxX:DEFAULT_WORLD,minY:0,maxY:DEFAULT_WORLD},tileBounds:{minX:0,maxX:DEFAULT_WORLD,minY:0,maxY:DEFAULT_WORLD},tilePath:'',tiles:{tileSize:DEFAULT_TILE_SIZE,minZoom:0,maxZoom:MAX_ZOOM,extension:'webp'},markers:[],polygons:[],lastCoord:null,drag:null,pinch:null,raf:0,destroyed:false};

  function size(){
    const w=host.clientWidth,h=host.clientHeight;state.dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));canvas.width=Math.max(1,Math.round(w*state.dpr));canvas.height=Math.max(1,Math.round(h*state.dpr));canvas.style.width=w+'px';canvas.style.height=h+'px';draw();
  }
  function worldSize(){return Math.max(1,state.tileBounds.maxX-state.tileBounds.minX)}
  function zoomScale(){
    const pad=8,fit=Math.min((host.clientWidth-pad*2)/Math.max(1,state.w),(host.clientHeight-pad*2)/Math.max(1,state.h));
    return fit*Math.pow(2,state.zoom);
  }
  function worldToScreen(x,y){const sc=zoomScale();return{x:host.clientWidth/2+(x-state.cx)*sc+state.panX,y:host.clientHeight/2+(state.cy-y)*sc+state.panY}}
  function screenToWorld(x,y){const sc=zoomScale();return{x:state.cx+(x-host.clientWidth/2-state.panX)/sc,y:state.cy-(y-host.clientHeight/2-state.panY)/sc}}
  function clampCenter(){
    const sc=zoomScale(),hw=host.clientWidth/(2*sc),hh=host.clientHeight/(2*sc);
    state.cx=Math.max(state.tileBounds.minX+hw,Math.min(state.tileBounds.maxX-hw,state.cx));
    state.cy=Math.max(state.tileBounds.minY+hh,Math.min(state.tileBounds.maxY-hh,state.cy));
  }
  function tileZoom(){return Math.max(state.tiles.minZoom,Math.min(state.tiles.maxZoom,state.zoom))}
  function tileKey(z,x,y){return state.id+':'+z+':'+x+':'+y}
  function tileUrl(z,x,y){return state.tilePath+'/zoom_'+z+'/'+x+'_'+y+'.'+state.tiles.extension}
  function loadTile(z,x,y){
    if(x<0||y<0||x>=2**z||y>=2**z)return null;
    const key=tileKey(z,x,y);let t=TILE_CACHE.get(key);if(t)return t;
    const img=new Image();t={img,loaded:false,failed:false};TILE_CACHE.set(key,t);
    img.onload=()=>{t.loaded=true;draw()};img.onerror=()=>{t.failed=true;draw()};img.decoding='async';img.src=tileUrl(z,x,y);return t;
  }
  function ancestor(z,x,y){for(let a=z-1;a>=0;a--){const k=z-a,s=2**k,px=Math.floor(x/s),py=Math.floor(y/s),t=TILE_CACHE.get(tileKey(a,px,py));if(t?.loaded&&!t.failed)return{t,sourceX:(x%s)*(DEFAULT_TILE_SIZE/s),sourceY:(y%s)*(DEFAULT_TILE_SIZE/s),sourceSize:DEFAULT_TILE_SIZE/s}}return null}
  function drawTiles(){
    const z=tileZoom(),count=2**z,tw=worldSize()/count,sc=zoomScale();
    const tl=screenToWorld(0,0),br=screenToWorld(host.clientWidth,host.clientHeight);
    const left=Math.max(state.tileBounds.minX,Math.min(tl.x,br.x)-tw),right=Math.min(state.tileBounds.maxX,Math.max(tl.x,br.x)+tw),top=Math.min(state.tileBounds.maxY,Math.max(tl.y,br.y)+tw),bottom=Math.max(state.tileBounds.minY,Math.min(tl.y,br.y)-tw);
    const minX=Math.max(0,Math.floor((left-state.tileBounds.minX)/tw)),maxX=Math.min(count-1,Math.floor((right-state.tileBounds.minX)/tw));
    const minY=Math.max(0,Math.floor((state.tileBounds.maxY-top)/tw)),maxY=Math.min(count-1,Math.floor((state.tileBounds.maxY-bottom)/tw));
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
      const tile=loadTile(z,x,y),wx=state.tileBounds.minX+x*tw,wy=state.tileBounds.maxY-y*tw,p=worldToScreen(wx,wy),sw=tw*sc+1;
      if(tile?.loaded&&!tile.failed)ctx.drawImage(tile.img,p.x,p.y,sw,sw);
      else {const a=ancestor(z,x,y);if(a)ctx.drawImage(a.t.img,a.sourceX,a.sourceY,a.sourceSize,a.sourceSize,p.x,p.y,sw,sw);else{ctx.fillStyle='#151b20';ctx.fillRect(p.x,p.y,sw,sw)}}
    }
  }
  function drawOverlays(){
    const showGrid=document.getElementById('gridLayer')?.checked!==false;
    const showBattle=document.getElementById('battleLayer')?.checked!==false;
    if(showGrid){ctx.strokeStyle='rgba(100,170,225,.20)';ctx.lineWidth=1;for(let i=0;i<=16;i++){const x=i*DEFAULT_WORLD/16,y=i*DEFAULT_WORLD/16,p1=worldToScreen(x,0),p2=worldToScreen(x,DEFAULT_WORLD),q1=worldToScreen(0,y),q2=worldToScreen(DEFAULT_WORLD,y);ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();ctx.beginPath();ctx.moveTo(q1.x,q1.y);ctx.lineTo(q2.x,q2.y);ctx.stroke()}}
    if(showBattle){for(const poly of state.polygons){const pts=poly.points||[];if(!pts.length)continue;ctx.beginPath();pts.forEach((q,i)=>{const p=worldToScreen(q.x/100,q.y===undefined?q.y:q.y/100);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.closePath();ctx.fillStyle=poly.color||'#6fa9ce';ctx.globalAlpha=poly.fillOpacity??.12;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=poly.color||'#6fa9ce';ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([])}}
  }
  function renderMarkers(){
    overlay.replaceChildren();const z=state.zoom;
    for(const m of state.markers){
      const isTower=m.icon==='tower',show=isTower?(document.getElementById('towerLayer')?.checked!==false):(document.getElementById('facilityLayer')?.checked===true);if(!show)continue;
      const p=worldToScreen(m.x/100,(DEFAULT_WORLD*100-m.y)/100);if(p.x<-80||p.x>host.clientWidth+80||p.y<-80||p.y>host.clientHeight+80)continue;
      const el=document.createElement('div');el.className=isTower?'v13-tower-marker':'v13-poi-marker';const k=isTower?Math.max(.14,1/(1+z*.34)):Math.max(.28,1/(1+z*.22));
      if(isTower){el.innerHTML='<img src="'+(st.__towerIcon||'https://cdn.jsdelivr.net/gh/apollyon-sys/wardogs-calculator@main/assets/map-markers/tower.webp')+'" alt=""><span>'+String(m.label||'').replace(/^Tower /,'高塔 ')+'</span>';el.style.setProperty('--k',k.toFixed(3));el.title=m.label||'';el.onclick=ev=>{ev.stopPropagation();setPointFromMarker(m)}}
      else{el.textContent=String(m.label||'').replace('Weapons Vendor','武器商人').replace('Garage Vendor','车库商人').replace('Spawn Board','复活板');el.style.setProperty('--k',k.toFixed(3))}
      el.style.left=p.x+'px';el.style.top=p.y+'px';overlay.appendChild(el);
    }
    if(st.gun||st.target){for(const [kind,c] of [['gun',st.gun],['target',st.target]])if(c){const p=worldToScreen(c.x,c.y),el=document.createElement('div');el.className=kind==='gun'?'v13-gun-point':'v13-target-point';el.style.left=p.x+'px';el.style.top=p.y+'px';overlay.appendChild(el)}}
  }
  function draw(){if(state.destroyed)return;cancelAnimationFrame(state.raf);state.raf=requestAnimationFrame(()=>{const dpr=state.dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#11181e';ctx.fillRect(0,0,host.clientWidth,host.clientHeight);drawTiles();drawOverlays();renderMarkers();updateCoord(state.lastCoord?.x,state.lastCoord?.y);updateHud()})}
  function updateHud(){const h=document.getElementById('hudZoom');if(h)h.textContent='ZOOM '+(2**state.zoom).toFixed(0)+'×'}
  function setHud(v){const h=document.getElementById('mapHud');if(h)h.textContent=v}
  function updateCoord(x,y){const e=document.getElementById('mapHoverCoord');if(!e||!Number.isFinite(x)||!Number.isFinite(y))return;e.textContent='X '+x.toFixed(2)+'  /  Y '+y.toFixed(2)}
  function setCoordFromEvent(e,place=false){const r=root.getBoundingClientRect(),c=screenToWorld(e.clientX-r.left,e.clientY-r.top);if(c.x<0||c.x>DEFAULT_WORLD||c.y<0||c.y>DEFAULT_WORLD)return;state.lastCoord=c;updateCoord(c.x,c.y);if(place)setPoint(c)}
  function setPoint(c){if(st.mode==='gun'){if(st.gunLocked){return}else st.gun={x:c.x,y:c.y}}else{if(st.targetLocked)return;st.target={x:c.x,y:c.y}};syncInputs();maybeCalc();draw()}
  function setPointFromMarker(m){setPoint({x:m.x/100,y:(DEFAULT_WORLD*100-m.y)/100})}
  function maybeCalc(){if(st.gun&&st.target)document.getElementById('calc')?.click()}
  function syncInputs(){const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v==null?'':Number(v).toFixed(2)};set('sx',st.gun?.x);set('sy',st.gun?.y);set('tx',st.target?.x);set('ty',st.target?.y);const g=document.getElementById('gunCoord'),t=document.getElementById('targetCoord');if(g)g.textContent=st.gun?`${st.gun.x.toFixed(2)}, ${st.gun.y.toFixed(2)}`:'--';if(t)t.textContent=st.target?`${st.target.x.toFixed(2)}, ${st.target.y.toFixed(2)}`:'--'}
  function setMode(m){st.mode=m;document.getElementById('setGun')?.classList.toggle('active',m==='gun');document.getElementById('setTarget')?.classList.toggle('active',m==='target')}
  function quickControls(data){
    const old=document.getElementById('v13-quick');if(old)old.remove();const box=document.createElement('div');box.id='v13-quick';box.className='v13-quick';box.innerHTML='<div><b>坐标快速定位</b><div class="v13-row"><input id="v13-coord" placeholder="例如 84.25, 62.10"><button id="v13-go">定位</button></div></div><div><b>高塔快速定位</b><div class="v13-row"><select id="v13-tower"><option value="">选择高塔</option></select><button id="v13-tgo">定位</button></div></div><div id="mapHoverCoord" class="v13-coord-readout">X -- / Y --</div>';
    host.parentElement.insertBefore(box,host);const ts=box.querySelector('#v13-tower');for(const m of state.markers.filter(x=>x.icon==='tower').sort((a,b)=>String(a.label).localeCompare(String(b.label),undefined,{numeric:true}))){const o=document.createElement('option');o.value=m.label;o.textContent=String(m.label).replace(/^Tower /,'高塔 ');ts.appendChild(o)}
    box.querySelector('#v13-go').onclick=()=>{const n=(box.querySelector('#v13-coord').value||'').trim().split(/[,\s]+/).map(Number);if(n.length>=2&&n.every(Number.isFinite)&&n[0]>=0&&n[0]<=DEFAULT_WORLD&&n[1]>=0&&n[1]<=DEFAULT_WORLD){setPoint({x:n[0],y:n[1]});focus({x:n[0],y:n[1]})}};
    box.querySelector('#v13-tgo').onclick=()=>{const m=state.markers.find(x=>x.icon==='tower'&&x.label===ts.value);if(m){setPointFromMarker(m);focus({x:m.x/100,y:(DEFAULT_WORLD*100-m.y)/100})}};
  }
  function focus(c){state.cx=c.x;state.cy=c.y;state.panX=0;state.panY=0;clampCenter();draw()}
  function bindControls(){
    const on=(id,fn)=>document.getElementById(id)?.addEventListener('click',fn);
    on('zoomIn',()=>{state.zoom=Math.min(MAX_ZOOM,state.zoom+1);clampCenter();draw()});
    on('zoomOut',()=>{state.zoom=Math.max(0,state.zoom-1);clampCenter();draw()});
    on('reload',()=>{TILE_CACHE.clear();draw()});
    on('setGun',()=>setMode('gun'));on('setTarget',()=>setMode('target'));
    on('lockGun',()=>{st.gunLocked=!st.gunLocked;document.getElementById('lockGun')?.classList.toggle('active',st.gunLocked)});
    on('lockTarget',()=>{st.targetLocked=!st.targetLocked;document.getElementById('lockTarget')?.classList.toggle('active',st.targetLocked)});
    on('clearGun',()=>{if(!st.gunLocked)st.gun=null;syncInputs();draw()});on('clearTarget',()=>{if(!st.targetLocked)st.target=null;syncInputs();draw()});on('resetMap',()=>{st.gun=null;st.target=null;st.gunLocked=false;st.targetLocked=false;setMode('gun');syncInputs();state.zoom=0;state.cx=DEFAULT_WORLD/2;state.cy=DEFAULT_WORLD/2;state.panX=state.panY=0;draw()});
    ['towerLayer','facilityLayer','battleLayer','gridLayer'].forEach(id=>document.getElementById(id)?.addEventListener('change',draw));
  }
  root.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;root.setPointerCapture?.(e.pointerId);state.drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:state.panX,py:state.panY};setCoordFromEvent(e,false)});
  root.addEventListener('pointermove',e=>{setCoordFromEvent(e,false);if(!state.drag||state.drag.id!==e.pointerId)return;state.panX=state.drag.px+(e.clientX-state.drag.x);state.panY=state.drag.py+(e.clientY-state.drag.y);clampCenter();draw()});
  root.addEventListener('pointerup',e=>{const d=state.drag;if(!d)return;state.drag=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<6)setCoordFromEvent(e,true)});
  root.addEventListener('pointercancel',()=>state.drag=null);
  root.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(0,Math.min(MAX_ZOOM,state.zoom+(e.deltaY<0?1:-1)));clampCenter();draw()},{passive:false});

  const publicMap={id,resize:size,resizeNow:size,getZoom:()=>state.zoom,zoomIn:()=>{state.zoom=Math.min(MAX_ZOOM,state.zoom+1);draw()},zoomOut:()=>{state.zoom=Math.max(0,state.zoom-1);draw()},setView:(c)=>focus(c),fitBounds:()=>{state.zoom=0;state.cx=DEFAULT_WORLD/2;state.cy=DEFAULT_WORLD/2;state.panX=state.panY=0;draw()},invalidateSize:size,setHud,destroy:()=>{state.destroyed=true;cancelAnimationFrame(state.raf);overlay.replaceChildren();root.remove();document.getElementById('v13-quick')?.remove()}};
  publicMap.setData=(data)=>{state.data=data;state.tilePath=(data.tiles?.path||'').replace(/\/$/,'');state.tiles={tileSize:data.tiles?.tileSize||DEFAULT_TILE_SIZE,minZoom:data.tiles?.minZoom||0,maxZoom:data.tiles?.maxZoom||MAX_ZOOM,extension:data.tiles?.extension||'webp'};state.mapBounds=data.tileBounds||{minX:0,maxX:DEFAULT_WORLD,minY:0,maxY:DEFAULT_WORLD};state.tileBounds=state.mapBounds;state.w=state.mapBounds.maxX-state.mapBounds.minX;state.h=state.mapBounds.maxY-state.mapBounds.minY;state.cx=(state.mapBounds.minX+state.mapBounds.maxX)/2;state.cy=(state.mapBounds.minY+state.mapBounds.maxY)/2;state.markers=data.markers||[];state.polygons=data.polygons||[];quickControls(data);bindControls();syncInputs();setHud('高清地图');draw()};
  size();return publicMap;
}
boot();
})();
