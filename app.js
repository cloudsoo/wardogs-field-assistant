const $ = (id) => document.getElementById(id);

let zh = true;
let mode = 'gun';
let gun = null;
let target = null;
let gunLocked = false;
let targetLocked = false;
let zoom = 1;
let panX = 0;
let panY = 0;
let ballistics = null;
let mapData = null;
let layerState = { tower: true, facility: false, battle: true, grid: true };
let pointers = new Map();
let gesture = null;
let suppressNextTap = false;

$('world').style.transformOrigin = '0 0';

const I = {
  zh: {
    sub:'第1页 • 手动输入 / 火控', title:'手动输入 / 计算', sx:'炮位 X', sy:'炮位 Y', tx:'目标 X', ty:'目标 Y',
    calc:'⚡ 开始计算', clear:'清除坐标', bearingTitle:'方位 Code / 方位角', check:'检查', load:'↻ 加载火控表',
    dist:'距离', az:'方位角', dir:'方向', range:'射程状态', mil:'仰角 MIL', arc:'弹道', ready:'准备', done:'已计算',
    inrange:'射程内', out:'超出射程', unavailable:'暂无火控表', p1note:'第1页保留快速手动输入；第2页可直接点地图，炮位和目标独立锁定。',
    setGun:'📍 设置炮位', setTarget:'🎯 设置目标', lockGun:'🔒 锁定炮位', unlockGun:'🔓 解锁炮位', lockTarget:'🔒 锁定目标', unlockTarget:'🔓 解锁目标',
    clearGun:'清除炮位', clearTarget:'清除目标', resetMap:'重置地图', layers:'☰ 地图图层', tower:'高塔', facility:'主要建筑 / 设施', battle:'主要战场 / 战区', grid:'1 km 网格',
    gun:'炮位', target:'目标', mapHelp:'单指拖动地图；双指捏合缩放。选择炮位或目标后点击地图。锁定后对应点不会移动。标记点会随缩放缩小。',
    page1:'⌨️ 第1页 • 计算', page2:'🗺️ 第2页 • 地图', quick:'高塔快速定位', choose:'请选择高塔', map:'地图', zoom:'缩放', towerSet:'已定位', locked:'已锁定'
  },
  en: {
    sub:'PAGE 1 • KEY-IN / FIRE CONTROL', title:'KEY-IN / CALCULATOR', sx:'GUN X', sy:'GUN Y', tx:'TARGET X', ty:'TARGET Y',
    calc:'⚡ CALCULATE', clear:'CLEAR COORDS', bearingTitle:'BEARING CODE', check:'CHECK', load:'↻ LOAD FIRING TABLE',
    dist:'DISTANCE', az:'BEARING', dir:'DIRECTION', range:'RANGE', mil:'ELEVATION MIL', arc:'ARC', ready:'READY', done:'CALCULATED',
    inrange:'IN RANGE', out:'OUT OF RANGE', unavailable:'TABLE UNAVAILABLE', p1note:'Page 1 keeps the fast manual workflow. Page 2 can place Gun/Target on the map; locks are independent.',
    setGun:'📍 SET GUN', setTarget:'🎯 SET TARGET', lockGun:'🔒 LOCK GUN', unlockGun:'🔓 UNLOCK GUN', lockTarget:'🔒 LOCK TARGET', unlockTarget:'🔓 UNLOCK TARGET',
    clearGun:'CLEAR GUN', clearTarget:'CLEAR TARGET', resetMap:'RESET MAP', layers:'☰ MAP LAYERS', tower:'TOWERS', facility:'MAJOR BUILDINGS / FACILITIES', battle:'MAJOR BATTLE AREAS', grid:'1 KM GRID',
    gun:'GUN', target:'TARGET', mapHelp:'One finger drags the map; two fingers pinch to zoom. Choose Gun or Target, then tap the map. Locked points stay fixed. Markers shrink as you zoom in.',
    page1:'⌨️ PAGE 1 • CALC', page2:'🗺️ PAGE 2 • MAP', quick:'TOWER QUICK LOCATION', choose:'SELECT TOWER', map:'MAP', zoom:'ZOOM', towerSet:'LOCATED', locked:'LOCKED'
  }
};
const tr = () => zh ? I.zh : I.en;

function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 1400);
}

function applyLang() {
  const t = tr();
  $('lang').textContent = zh ? 'EN' : '中文';
  $('sub').textContent = t.sub;
  $('title1').textContent = t.title;
  $('sxL').textContent = t.sx; $('syL').textContent = t.sy; $('txL').textContent = t.tx; $('tyL').textContent = t.ty;
  $('calc').textContent = t.calc; $('clear').textContent = t.clear;
  $('bearingTitle').textContent = t.bearingTitle; $('bearingBtn').textContent = t.check; $('ballisticsBtn').textContent = t.load;
  $('distL').textContent = t.dist; $('azL').textContent = t.az; $('dirL').textContent = t.dir; $('rangeL').textContent = t.range; $('milL').textContent = t.mil; $('arcL').textContent = t.arc;
  $('p1note').textContent = t.p1note;
  $('setGun').textContent = t.setGun; $('setTarget').textContent = t.setTarget;
  $('lockGun').textContent = gunLocked ? t.unlockGun : t.lockGun;
  $('lockTarget').textContent = targetLocked ? t.unlockTarget : t.lockTarget;
  $('clearGun').textContent = t.clearGun; $('clearTarget').textContent = t.clearTarget; $('resetMap').textContent = t.resetMap;
  $('layersTitle').textContent = t.layers; $('towerText').textContent = t.tower; $('facilityText').textContent = t.facility; $('battleText').textContent = t.battle; $('gridText').textContent = t.grid;
  $('gunLabel').textContent = t.gun; $('targetLabel').textContent = t.target; $('mapHelp').textContent = t.mapHelp;
  $('nav1').textContent = t.page1; $('nav2').textContent = t.page2;
  if ($('towerQuickTitle')) $('towerQuickTitle').textContent = t.quick;
  if ($('towerSelect') && $('towerSelect').options[0]) $('towerSelect').options[0].text = t.choose;
  $('weapon').options[0].text = zh ? '迫击炮 / Mortar' : 'Mortar';
  $('weapon').options[1].text = zh ? '自行火炮 / SPH-2' : 'SPH-2';
}

function showPage(n) {
  $('page1').classList.toggle('active', n === 1);
  $('page2').classList.toggle('active', n === 2);
  $('nav1').classList.toggle('active', n === 1);
  $('nav2').classList.toggle('active', n === 2);
  if (n === 2) loadMap();
}
$('nav1').onclick = () => showPage(1);
$('nav2').onclick = () => showPage(2);
$('lang').onclick = () => { zh = !zh; applyLang(); renderMapLayers(); };

function direction(b) {
  return ['N ↑','NE ↗','E →','SE ↘','S ↓','SW ↙','W ←','NW ↖'][Math.floor((b + 22.5) / 45) % 8];
}

function interp(arr, meters) {
  if (!Array.isArray(arr) || !arr.length) return null;
  const p = arr.slice().sort((a,b) => a[0] - b[0]);
  if (meters < p[0][0] || meters > p[p.length-1][0]) return null;
  for (let i=1;i<p.length;i++) {
    if (meters <= p[i][0]) {
      const [x1,y1]=p[i-1], [x2,y2]=p[i], f=(meters-x1)/(x2-x1);
      return y1 + (y2-y1)*f;
    }
  }
  return p[p.length-1][1];
}

function updateBallistics(km) {
  if (!ballistics) return;
  const w = ballistics[$('weapon').value];
  if (!w) return;
  $('range').textContent = km >= w.minRangeKm && km <= w.maxRangeKm ? tr().inrange : tr().out;
  if (w.id === 'mortar') {
    const m = interp(w.ballistics.single, km);
    $('mil').textContent = m == null ? '--' : Math.round(m);
    $('arc').textContent = m == null ? '--' : (zh ? '单一' : 'SINGLE');
  } else {
    const lo = interp(w.ballistics.low, km);
    const hi = interp(w.ballistics.high, km);
    $('mil').textContent = lo == null ? '--' : Math.round(lo);
    $('arc').textContent = lo == null ? '--' : hi == null ? 'LOW' : `LOW ${Math.round(lo)} / HIGH ${Math.round(hi)}`;
  }
}

function calculate() {
  const sx=+$('sx').value, sy=+$('sy').value, tx=+$('tx').value, ty=+$('ty').value;
  if ([sx,sy,tx,ty].some(Number.isNaN)) { toast(zh?'请完整输入坐标':'Enter all coordinates'); return; }
  const dx=tx-sx, dy=ty-sy;
  const meters=Math.hypot(dx,dy)*100;
  let b=Math.atan2(dx,dy)*180/Math.PI; if(b<0)b+=360;
  $('distance').textContent=meters.toFixed(1)+' m'; $('bearing').textContent=b.toFixed(1)+'°'; $('direction').textContent=direction(b); $('status').textContent=tr().done;
  updateBallistics(meters/1000);
}
$('calc').onclick=calculate;
$('clear').onclick=()=>['sx','sy','tx','ty'].forEach(id=>$(id).value='');
$('bearingBtn').onclick=()=>{const b=+$('bearingInput').value;$('bearingOut').textContent=Number.isFinite(b)&&b>=0&&b<360?b.toFixed(1)+'°  '+direction(b):'0–359.9°'};
$('weapon').onchange=()=>{const d=parseFloat(($('distance').textContent||'').replace(' m',''));if(Number.isFinite(d))updateBallistics(d/1000)};
$('ballisticsBtn').onclick=async()=>{try{const r=await fetch('https://raw.githubusercontent.com/apollyon-sys/wardogs-calculator/main/data/weapons.json');if(!r.ok)throw new Error('HTTP');const j=await r.json();ballistics=Object.fromEntries(j.weapons.map(w=>[w.id,w]));const d=parseFloat(($('distance').textContent||'').replace(' m',''));if(Number.isFinite(d))updateBallistics(d/1000);toast(tr().load)}catch(e){toast(tr().unavailable)}};

const BASE={bakurani:'https://cdn.jsdelivr.net/gh/apollyon-sys/wardogs-calculator@main/maps/tiles/bakurani/',ozeti:'https://cdn.jsdelivr.net/gh/apollyon-sys/wardogs-calculator@main/maps/tiles/ozeti/'};
const RAW='https://raw.githubusercontent.com/apollyon-sys/wardogs-calculator/main/';
const MAPSIZE=16384;

async function fetchMapData(id){try{const r=await fetch(`${RAW}maps/${id}.json`);if(!r.ok)throw new Error('HTTP');return await r.json()}catch(e){toast(zh?'地图配置加载失败':'Map config failed');return null}}
function currentTileZoom(){return Math.min(7,Math.max(1,Math.ceil(zoom)))}
function renderTiles(){
  const id=$('mapSelect').value,z=currentTileZoom(),n=2**z,tiles=$('tiles'),r=$('map').getBoundingClientRect();tiles.innerHTML='';
  const x0=(-panX)/(zoom*r.width), y0=(-panY)/(zoom*r.height), x1=(r.width-panX)/(zoom*r.width), y1=(r.height-panY)/(zoom*r.height),pad=1;
  const minX=Math.max(0,Math.floor(x0*n)-pad),maxX=Math.min(n-1,Math.ceil(x1*n)+pad),minY=Math.max(0,Math.floor(y0*n)-pad),maxY=Math.min(n-1,Math.ceil(y1*n)+pad);
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const img=new Image();img.className='tile';img.draggable=false;img.alt='';img.style.left=x/n*100+'%';img.style.top=y/n*100+'%';img.style.width=100/n+'%';img.style.height=100/n+'%';img.src=`${BASE[id]}zoom_${z}/${x}_${y}.webp`;img.onerror=()=>{if(!img.dataset.fallback){img.dataset.fallback='1';img.src=`${RAW}maps/tiles/${id}/zoom_${z}/${x}_${y}.webp`}};tiles.appendChild(img);
  }
  $('hudZoom').textContent='ZOOM '+zoom.toFixed(1)+'×';
}
function pctFromMapXY(x,y){return{x:x/MAPSIZE*100,y:y/MAPSIZE*100}}
function gameCoordFromPct(p){return{x:p.x/100*(MAPSIZE/100),y:(1-p.y/100)*(MAPSIZE/100)}}
function screenToPct(clientX,clientY){const r=$('map').getBoundingClientRect(),wx=(clientX-r.left-panX)/zoom,wy=(clientY-r.top-panY)/zoom;return{x:Math.max(0,Math.min(100,wx/r.width*100)),y:Math.max(0,Math.min(100,wy/r.height*100))}}
function mapPointFromClient(x,y){return gameCoordFromPct(screenToPct(x,y))}
function clampPan(){const r=$('map').getBoundingClientRect(),sw=r.width*zoom,sh=r.height*zoom,lowX=Math.min(0,r.width-sw),lowY=Math.min(0,r.height-sh);panX=Math.max(lowX,Math.min(0,panX));panY=Math.max(lowY,Math.min(0,panY))}
function applyTransform(){$('world').style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;$('hudZoom').textContent='ZOOM '+zoom.toFixed(1)+'×'}
function centerOnGameCoord(c){const r=$('map').getBoundingClientRect(),p=pctFromMapXY(c.x*100,MAPSIZE-c.y*100),wx=p.x/100*r.width,wy=p.y/100*r.height;panX=r.width/2-wx*zoom;panY=r.height/2-wy*zoom;clampPan();applyTransform();renderTiles();renderMapLayers()}
function labelOf(s){if(!zh)return s;return s.replace(/^Tower /,'高塔 ').replace('Weapons Vendor','武器商人').replace('Garage Vendor','车库商人').replace('Spawn Board','复活板').replace(' Spawn',' 战区')}
function poiIcon(m){if(m.icon==='tower')return '🏰';if(m.icon.includes('vendor'))return '🔧';if(m.icon==='spawn_board')return '📋';if(['valkyra','manticore','lonestar'].includes(m.icon))return '◆';return '🏭'}
function ensureTowerQuickUI(){if($('towerQuick'))return;const box=document.createElement('details');box.id='towerQuick';box.className='card';box.open=true;box.innerHTML=`<summary id="towerQuickTitle"></summary><div style="display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:8px"><select id="towerSelect"><option value="">${tr().choose}</option></select><button id="towerGo">GO</button></div><div id="towerQuickButtons" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:7px"></div>`;$('map').parentElement.insertBefore(box,$('map'));$('towerSelect').onchange=()=>{if($('towerSelect').value)selectTower($('towerSelect').value)};$('towerGo').onclick=()=>{const v=$('towerSelect').value;if(v)selectTower(v)};applyLang()}
function renderTowerQuick(){ensureTowerQuickUI();const select=$('towerSelect'),btns=$('towerQuickButtons');select.innerHTML=`<option value="">${tr().choose}</option>`;btns.innerHTML='';const towers=(mapData?.markers||[]).filter(m=>m.icon==='tower').sort((a,b)=>a.label.localeCompare(b.label,undefined,{numeric:true}));towers.forEach(m=>{const key=m.label,o=document.createElement('option');o.value=key;o.textContent=labelOf(key);select.appendChild(o);const b=document.createElement('button');b.textContent=key.replace('Tower ','T');b.onclick=()=>selectTower(key);btns.appendChild(b)})}
function selectTower(label){const m=(mapData?.markers||[]).find(x=>x.icon==='tower'&&x.label===label);if(!m)return;const c={x:m.x/100,y:(MAPSIZE-m.y)/100};centerOnGameCoord(c);if(mode==='gun'){if(gunLocked){toast(tr().locked+' '+tr().gun);return}gun=c}else{if(targetLocked){toast(tr().locked+' '+tr().target);return}target=c}sync();renderMapLayers();if(gun&&target)calculate();toast(`${labelOf(label)} • ${tr().towerSet}`)}
function renderMapLayers(){const w=$('world');w.querySelectorAll('.poi,.point').forEach(e=>e.remove());$('zones').innerHTML='';if(!mapData)return;layerState.tower=document.querySelector('[data-layer="tower"]')?.checked??true;layerState.facility=document.querySelector('[data-layer="facility"]')?.checked??false;layerState.battle=document.querySelector('[data-layer="battle"]')?.checked??true;layerState.grid=document.querySelector('[data-layer="grid"]')?.checked??true;$('grid').style.display=layerState.grid?'block':'none';const sx=Math.max(.45,1/Math.pow(zoom,.9));for(const m of mapData.markers||[]){const kind=m.icon==='tower'?'tower':'facility';if(!layerState[kind])continue;const p=pctFromMapXY(m.x,m.y),e=document.createElement('div');e.className='poi';e.style.left=p.x+'%';e.style.top=p.y+'%';e.style.transform=`translate(-50%,-50%) scale(${sx})`;e.innerHTML=`<i>${poiIcon(m)}</i><b>${labelOf(m.label)}</b>`;e.onclick=ev=>{ev.stopPropagation();selectTower(m.label)};w.appendChild(e)}if(layerState.battle)for(const poly of mapData.polygons||[]){const el=document.createElementNS('http://www.w3.org/2000/svg','polygon');el.setAttribute('points',(poly.points||[]).map(p=>`${p.x},${p.y}`).join(' '));el.setAttribute('fill',poly.color||'#5fa8d3');el.setAttribute('fill-opacity',String(poly.fillOpacity??.12));el.setAttribute('stroke',poly.color||'#5fa8d3');el.setAttribute('stroke-width','18');el.setAttribute('stroke-dasharray','45 28');$('zones').appendChild(el)}if(gun)drawPoint(gun,'📍',gunLocked);if(target)drawPoint(target,'🎯',targetLocked)}
function drawPoint(c,icon,locked){const p=pctFromMapXY(c.x*100,MAPSIZE-c.y*100),e=document.createElement('div');e.className='point'+(locked?' locked':'');e.style.left=p.x+'%';e.style.top=p.y+'%';e.style.transform=`translate(-50%,-50%) scale(${Math.min(1.35,1/Math.pow(zoom,.85))})`;e.textContent=icon;$('world').appendChild(e)}
function sync(){if(gun){$('gunCoord').textContent=gun.x.toFixed(2)+', '+gun.y.toFixed(2);$('sx').value=gun.x.toFixed(2);$('sy').value=gun.y.toFixed(2)}else{$('gunCoord').textContent='--';$('sx').value='';$('sy').value=''}if(target){$('targetCoord').textContent=target.x.toFixed(2)+', '+target.y.toFixed(2);$('tx').value=target.x.toFixed(2);$('ty').value=target.y.toFixed(2)}else{$('targetCoord').textContent='--';$('tx').value='';$('ty').value=''}$('gunBox').classList.toggle('lockedbox',gunLocked);$('targetBox').classList.toggle('lockedbox',targetLocked)}
async function loadMap(){ensureTowerQuickUI();mapData=await fetchMapData($('mapSelect').value);zoom=1;panX=panY=0;applyTransform();renderTiles();renderTowerQuick();renderMapLayers();sync()}
$('mapSelect').onchange=()=>{gun=null;target=null;gunLocked=targetLocked=false;loadMap()};
$('reload').onclick=loadMap;$('zoomIn').onclick=()=>{const r=$('map').getBoundingClientRect(),cx=r.width/2,cy=r.height/2,wx=(cx-panX)/zoom,wy=(cy-panY)/zoom;zoom=Math.min(7,+(zoom+0.75).toFixed(2));panX=cx-wx*zoom;panY=cy-wy*zoom;clampPan();applyTransform();renderTiles();renderMapLayers()};
$('zoomOut').onclick=()=>{zoom=Math.max(1,+(zoom-.75).toFixed(2));clampPan();applyTransform();renderTiles();renderMapLayers()};
$('resetMap').onclick=()=>{zoom=1;panX=panY=0;applyTransform();renderTiles();renderMapLayers()};
$('setGun').onclick=()=>{mode='gun';$('setGun').classList.add('active');$('setTarget').classList.remove('active')};$('setTarget').onclick=()=>{mode='target';$('setTarget').classList.add('active');$('setGun').classList.remove('active')};
$('lockGun').onclick=()=>{if(!gun)return toast(zh?'先设置炮位':'Set gun first');gunLocked=!gunLocked;applyLang();sync();renderMapLayers()};$('lockTarget').onclick=()=>{if(!target)return toast(zh?'先设置目标':'Set target first');targetLocked=!targetLocked;applyLang();sync();renderMapLayers()};
$('clearGun').onclick=()=>{gun=null;gunLocked=false;sync();renderMapLayers()};$('clearTarget').onclick=()=>{target=null;targetLocked=false;sync();renderMapLayers()};

document.querySelectorAll('[data-layer]').forEach(el=>el.onchange=renderMapLayers);

$('map').addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){gesture={type:'tapPan',startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false}}else if(pointers.size===2){const a=[...pointers.values()],midX=(a[0].x+a[1].x)/2,midY=(a[0].y+a[1].y)/2,r=$('map').getBoundingClientRect(),mx=midX-r.left,my=midY-r.top;gesture={type:'pinch',startDist:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),startZoom:zoom,anchorX:(mx-panX)/zoom,anchorY:(my-panY)/zoom};suppressNextTap=true}e.preventDefault()},{passive:false});
$('map').addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size>=2&&gesture?.type==='pinch'){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),midX=(a[0].x+a[1].x)/2,midY=(a[0].y+a[1].y)/2,r=$('map').getBoundingClientRect(),mx=midX-r.left,my=midY-r.top;zoom=Math.min(7,Math.max(1,gesture.startZoom*d/gesture.startDist));panX=mx-gesture.anchorX*zoom;panY=my-gesture.anchorY*zoom;clampPan();applyTransform();renderTiles();renderMapLayers();e.preventDefault();return}if(pointers.size===1&&gesture?.type==='tapPan'){const dx=e.clientX-gesture.lastX,dy=e.clientY-gesture.lastY;gesture.lastX=e.clientX;gesture.lastY=e.clientY;if(Math.hypot(e.clientX-gesture.startX,e.clientY-gesture.startY)>7)gesture.moved=true;if(gesture.moved){panX+=dx;panY+=dy;clampPan();applyTransform();renderTiles();renderMapLayers()}e.preventDefault()}},{passive:false});
$('map').addEventListener('pointerup',e=>{const was=gesture;pointers.delete(e.pointerId);if(pointers.size===0){gesture=null;if(was?.type==='tapPan'&&!was.moved&&!suppressNextTap){const c=mapPointFromClient(e.clientX,e.clientY);if(mode==='gun'&&!gunLocked)gun=c;else if(mode==='target'&&!targetLocked)target=c;else return;sync();renderMapLayers();if(gun&&target)calculate()}suppressNextTap=false}else if(pointers.size===1){const p=[...pointers.values()][0];gesture={type:'tapPan',startX:p.x,startY:p.y,lastX:p.x,lastY:p.y,moved:true}}});
$('map').addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);gesture=null;suppressNextTap=true});

applyLang();
showPage(1);
loadMap();
