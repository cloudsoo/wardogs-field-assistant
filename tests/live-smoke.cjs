const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
const URL='https://wardogs-field-assistant2.cloudsoo2004.workers.dev/';
const PROXY_TILE=URL+'tiles/bakurani/zoom_4/0_0.webp';
const DATA='https://raw.githubusercontent.com/apollyon-sys/wardogs-calculator/main/maps/bakurani.json';
function browserPath(){for(const p of ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'])if(fs.existsSync(p))return p;try{return cp.execFileSync('which',['google-chrome'],{encoding:'utf8'}).trim()}catch{}try{return cp.execFileSync('which',['chromium'],{encoding:'utf8'}).trim()}catch{}throw new Error('No system Chromium/Chrome found')}
(async()=>{
  fs.mkdirSync('test-artifacts',{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:browserPath(),args:['--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'});
  const page=await context.newPage(); page.setDefaultTimeout(20000); const errors=[]; const tileResponses=[];
  page.on('pageerror',e=>errors.push(String(e))); page.on('response',r=>{if(r.url().includes('/tiles/'))tileResponses.push({url:r.url(),status:r.status()})});
  const probe=await context.request.get(PROXY_TILE); assert.equal(probe.status(),200,'same-origin terrain proxy did not return 200'); assert.match(probe.headers()['content-type']||'',/image\/webp/i,'proxy content type is not webp');
  const cfg=await (await context.request.get(DATA)).json(); const expectedTowers=(cfg.markers||[]).filter(m=>m.icon==='tower'); assert.equal(expectedTowers.length,5,'source Bakurani tower count is not 5');
  await page.goto(URL,{waitUntil:'domcontentloaded'}); assert.match(await page.locator('#sub').textContent(),/第 1 页/); assert.equal(await page.locator('#lang').textContent(),'EN');
  await page.locator('#nav2').click(); await page.waitForFunction(()=>window.Wardogs11?.canvasMap); await page.waitForSelector('canvas.v14-map-canvas'); await page.waitForSelector('.v14-tower-marker'); await page.waitForTimeout(1800);
  assert.ok(tileResponses.some(x=>x.status===200),'browser did not load a successful same-origin terrain tile'); assert.ok(tileResponses.some(x=>x.status===200&&x.url.includes('/zoom_4/')),'initial map did not request the sharp zoom_4 LOD');
  assert.equal(await page.locator('#v14-quick').count(),1,'quick controls must exist exactly once'); assert.equal(await page.locator('.v11-quick,.v11-coord').count(),0,'legacy duplicate quick controls remain');
  assert.equal(await page.locator('.v14-tower-marker').count(),5,'Bakurani must show exactly five towers');
  const renderedLabels=await page.locator('.v14-tower-marker').evaluateAll(es=>es.map(e=>({text:e.textContent||'',title:e.getAttribute('title')||''}))); for(const t of expectedTowers){const n=t.label.replace(/^Tower /,'高塔 ');assert.ok(renderedLabels.some(v=>v.text.includes(n)||v.text.includes(t.label)||v.title.includes(n)||v.title.includes(t.label)),`missing tower marker ${t.label}`)}
  await page.screenshot({path:'test-artifacts/map-loaded.png',fullPage:false});
  const mapBox=await page.locator('#map').boundingBox(); assert.ok(mapBox,'map bounds missing');
  const towers=await page.locator('.v14-tower-marker').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})); for(const p of towers){assert.ok(p.x>mapBox.x-10&&p.x<mapBox.x+mapBox.width+10,'tower X position is outside map');assert.ok(p.y>mapBox.y-10&&p.y<mapBox.y+mapBox.height+10,'tower Y position is outside map')}
  await page.locator('#setGun').click(); await page.locator('#v14-coord').fill('84.25, 62.10'); await page.locator('#v14-go').click(); await page.waitForFunction(()=>Math.abs(window.Wardogs11.gun?.x-84.25)<.001&&Math.abs(window.Wardogs11.gun?.y-62.10)<.001);
  await page.locator('#setTarget').click(); await page.locator('#v14-coord').fill('88.40, 66.20'); await page.locator('#v14-go').click(); await page.waitForFunction(()=>Math.abs(window.Wardogs11.target?.x-88.40)<.001&&Math.abs(window.Wardogs11.target?.y-66.20)<.001);
  await page.locator('#v14-tower').selectOption('Tower 5'); await page.locator('#v14-tgo').click(); const tower5=expectedTowers.find(t=>t.label==='Tower 5'); await page.waitForFunction(({x,y})=>Math.abs(window.Wardogs11.gun?.x-x)<.001&&Math.abs(window.Wardogs11.gun?.y-y)<.001,{x:tower5.x/100,y:tower5.y/100});
  const before=await page.locator('.v14-tower-marker').first().locator('img').boundingBox(); for(let i=0;i<7;i++)await page.locator('#zoomIn').click(); await page.waitForFunction(()=>window.Wardogs11.canvasMap?.getZoom()===7); await page.waitForTimeout(800); const after=await page.locator('.v14-tower-marker').first().locator('img').boundingBox(); assert.ok(before&&after); assert.ok(after.width<before.width,'tower logo did not shrink'); assert.ok(after.width<=6,'tower logo still too large at max zoom');
  await page.locator('#factionLayer').check(); await page.locator('#vendorLayer').check(); await page.locator('#spawnLayer').check(); await page.waitForSelector('.v14-poi-marker'); assert.ok(await page.locator('.v14-poi-marker').count()>=6,'faction/vendor layers did not render'); await page.locator('#spawnLayer').uncheck(); await page.locator('#vendorLayer').uncheck(); await page.locator('#factionLayer').uncheck();
  await page.locator('#fitMap').click(); await page.waitForFunction(()=>window.Wardogs11.canvasMap?.getZoom()===0); await page.screenshot({path:'test-artifacts/map-fit.png',fullPage:false});
  const mb=await page.locator('#map').boundingBox(); assert.ok(mb); await page.mouse.move(mb.x+mb.width*.55,mb.y+mb.height*.55); await page.waitForFunction(()=>/GRID [A-P](?:1[0-6]|[1-9]) · X/.test(document.getElementById('mapHoverCoord')?.textContent||'')); await page.screenshot({path:'test-artifacts/map-hover-grid.png',fullPage:false});
  assert.deepEqual(errors,[],'browser page errors were reported'); console.log('LIVE E2E PASS: proxy terrain, zoom_4 initial LOD, five exact towers, single quick panel, coordinates, tower quick jump, max zoom scaling, layers, fit, hover grid'); await context.close(); await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
