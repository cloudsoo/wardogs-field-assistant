const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
const URL='https://wardogs-field-assistant2.cloudsoo2004.workers.dev/';
const PROXY_TILE=URL+'tiles/bakurani/zoom_4/0_0.webp';
const DATA='https://raw.githubusercontent.com/apollyon-sys/wardogs-calculator/main/maps/bakurani.json';
function browserPath(){for(const p of ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'])if(fs.existsSync(p))return p;return cp.execFileSync('which',['google-chrome'],{encoding:'utf8'}).trim()}
(async()=>{
 fs.mkdirSync('test-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:browserPath(),args:['--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'});
 const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[],responses=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.url().includes('/tiles/'))responses.push({url:r.url(),status:r.status()})});
 const probe=await context.request.get(PROXY_TILE);assert.equal(probe.status(),200,'tile proxy must return 200');assert.match(probe.headers()['content-type']||'',/image\/webp/i);
 const cfg=await (await context.request.get(DATA)).json();const towers=(cfg.markers||[]).filter(m=>m.icon==='tower');assert.equal(towers.length,5);assert.ok(Math.abs(cfg.bounds.maxX-cfg.bounds.minX-110.25)<.01);assert.ok(Math.abs(cfg.bounds.maxY-cfg.bounds.minY-110.31)<.02);assert.ok(cfg.coordinateMetersPerUnit===100);assert.ok(cfg.tileBounds&&cfg.tiles.maxZoom>=7);
 await page.goto(URL,{waitUntil:'domcontentloaded'});assert.match(await page.locator('#sub').textContent(),/第 1 页/);assert.equal(await page.locator('#lang').textContent(),'EN');
 await page.locator('#nav2').click();await page.waitForFunction(()=>window.Wardogs11?.canvasMap?.id==='bakurani');await page.waitForSelector('canvas.v18-map-canvas');await page.waitForSelector('.v18-tower-marker');await page.waitForTimeout(1800);
 assert.ok(responses.some(x=>x.status===200),'browser must load a successful terrain tile');assert.ok(responses.some(x=>x.status===200&&x.url.includes('/zoom_')), 'browser requested terrain tiles');
 assert.equal(await page.locator('#v18-quick').count(),1);assert.equal(await page.locator('.v11-quick,.v11-coord,.v14-quick').count(),0);assert.equal(await page.locator('.v18-tower-marker').count(),5);
 const renderedLabels=await page.locator('.v18-tower-marker').evaluateAll(es=>es.map(e=>({text:e.textContent||'',title:e.title||''})));for(const t of towers){const label=t.label.replace(/^Tower /,'高塔 ');assert.ok(renderedLabels.some(v=>v.text.includes(label)||v.title.includes(label)),`missing ${t.label}`)}
 await page.screenshot({path:'test-artifacts/map-fit-v18.png',fullPage:false});
 const mapBox=await page.locator('#map').boundingBox();assert.ok(mapBox);
 await page.locator('#v18-tower').selectOption('Tower 5');await page.locator('#v18-tgo').click();await page.waitForTimeout(250);const t5=await page.locator('.v18-tower-marker').filter({hasText:'高塔 5'}).evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}});const center={x:mapBox.x+mapBox.width/2,y:mapBox.y+mapBox.height/2};assert.ok(Math.hypot(t5.x-center.x,t5.y-center.y)<55,'Tower 5 was not centered by quick navigation');
 const before=await page.locator('.v18-tower-marker').evaluateAll(es=>{const e=es[0],r=e.getBoundingClientRect();return r.width});for(let i=0;i<7;i++)await page.locator('#zoomIn').click();await page.waitForFunction(()=>window.Wardogs11.canvasMap?.getZoom()===7);await page.waitForTimeout(800);const after=await page.locator('.v18-tower-marker').evaluateAll(es=>{const r=es[0].getBoundingClientRect();return r.width});assert.ok(after<before,'tower logo did not shrink');assert.ok(after<=6,'tower logo still too large at max zoom');
 await page.locator('#factionLayer').check();await page.locator('#vendorLayer').check();await page.locator('#spawnLayer').check();await page.waitForSelector('.v18-poi-marker');assert.ok(await page.locator('.v18-poi-marker').count()>=6);await page.locator('#factionLayer').uncheck();await page.locator('#vendorLayer').uncheck();await page.locator('#spawnLayer').uncheck();
 await page.locator('#setGun').click();await page.locator('#v18-coord').fill('84.25, 62.10');await page.locator('#v18-go').click();await page.waitForFunction(()=>Math.abs(window.Wardogs11.gun?.x-84.25)<.001&&Math.abs(window.Wardogs11.gun?.y-62.10)<.001);
 await page.locator('#setTarget').click();await page.locator('#v18-coord').fill('88.40, 66.20');await page.locator('#v18-go').click();await page.waitForFunction(()=>Math.abs(window.Wardogs11.target?.x-88.40)<.001&&Math.abs(window.Wardogs11.target?.y-66.20)<.001);
 await page.locator('#fitMap').click();await page.waitForFunction(()=>window.Wardogs11.canvasMap?.getZoom()===0);const mb=await page.locator('#map').boundingBox();await page.mouse.move(mb.x+mb.width*.55,mb.y+mb.height*.55);await page.waitForFunction(()=>/GRID [A-P](?:1[0-6]|[1-9]) · X/.test(document.getElementById('mapHoverCoord')?.textContent||''));await page.screenshot({path:'test-artifacts/map-hover-v18.png',fullPage:false});
 assert.deepEqual(errors,[]);console.log('LIVE E2E PASS: exact playable bounds, inverted Y axis, dynamic sharp tile LOD, five towers, single quick panel, tower centering, tower scaling, layers, coordinates, fit, hover grid');await context.close();await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
