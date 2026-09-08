const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');

const URL='https://wardogs-field-assistant2.cloudsoo2004.workers.dev/';
function browserPath(){for(const p of ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'])if(fs.existsSync(p))return p;try{return cp.execFileSync('which',['google-chrome'],{encoding:'utf8'}).trim()}catch{}try{return cp.execFileSync('which',['chromium'],{encoding:'utf8'}).trim()}catch{}throw new Error('No system Chromium/Chrome found')}

(async()=>{
  fs.mkdirSync('test-artifacts',{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:browserPath(),args:['--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',recordVideo:{dir:'test-artifacts',size:{width:390,height:844}}});
  const page=await context.newPage();
  page.setDefaultTimeout(20000);
  const errors=[];const tileResponses=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.url().includes('/maps/tiles/'))tileResponses.push({url:r.url(),status:r.status()})});
  await page.goto(URL,{waitUntil:'domcontentloaded'});

  assert.match(await page.locator('#sub').textContent(),/第 1 页/,'startup Chinese text is missing');
  assert.equal(await page.locator('#lang').textContent(),'EN','language toggle should be English label in Chinese mode');

  await page.locator('#nav2').click();
  await page.waitForFunction(()=>window.Wardogs11?.canvasMap,'V13 canvas map did not initialize');
  await page.waitForFunction(()=>document.querySelector('canvas.v13-map-canvas'),'map canvas did not mount');
  await page.waitForFunction(()=>document.querySelectorAll('.v13-tower-marker').length>0,'tower markers did not load');
  await page.waitForFunction(()=>performance.getEntriesByType('resource').some(x=>x.name.includes('/maps/tiles/')),'no map tile request observed');
  await page.screenshot({path:'test-artifacts/map-loaded.png',fullPage:false});

  const mapBox=await page.locator('#map').boundingBox();
  const towerBox=await page.locator('.v13-tower-marker').first().boundingBox();
  assert.ok(mapBox&&towerBox,'map/tower bounds missing');
  const towerCx=towerBox.x+towerBox.width/2,towerCy=towerBox.y+towerBox.height/2;
  assert.ok(towerCx>mapBox.x+mapBox.width*.12&&towerCx<mapBox.x+mapBox.width*.88,'tower marker is stuck at map left/top edge');
  assert.ok(towerCy>mapBox.y+mapBox.height*.12&&towerCy<mapBox.y+mapBox.height*.88,'tower marker is stuck at map left/top edge');

  await page.locator('#setGun').click();
  await page.locator('#v13-coord').fill('84.25, 62.10');
  await page.locator('#v13-go').click();
  await page.waitForFunction(()=>Math.abs(window.Wardogs11.gun?.x-84.25)<0.001&&Math.abs(window.Wardogs11.gun?.y-62.10)<0.001,'coordinate jump did not set Gun');
  await page.locator('#setTarget').click();
  await page.locator('#v13-coord').fill('88.40, 66.20');
  await page.locator('#v13-go').click();
  await page.waitForFunction(()=>Math.abs(window.Wardogs11.target?.x-88.40)<0.001&&Math.abs(window.Wardogs11.target?.y-66.20)<0.001,'coordinate jump did not set Target');

  const before=await page.locator('.v13-tower-marker').first().locator('img').boundingBox();
  for(let i=0;i<7;i++)await page.locator('#zoomIn').click();
  await page.waitForFunction(()=>window.Wardogs11.canvasMap?.getZoom()===7,'map did not reach max zoom');
  await page.waitForTimeout(500);
  const after=await page.locator('.v13-tower-marker').first().locator('img').boundingBox();
  assert.ok(before&&after,'tower logo bounds missing');
  assert.ok(after.width < before.width,'tower logo did not shrink after zoom');
  assert.ok(after.width<=8,'tower logo can still be smaller at max zoom');
  assert.ok(tileResponses.some(x=>x.status===200),'no successful map tile response observed');
  await page.screenshot({path:'test-artifacts/map-max-zoom.png',fullPage:false});

  await page.locator('#zoomOut').click();
  assert.match(await page.locator('#mapHoverCoord').textContent(),/X|Y/,'hover coordinate readout is missing');
  assert.deepEqual(errors,[],'browser page errors were reported');
  console.log('LIVE E2E PASS: startup Chinese, V13 canvas map, real tile response, centered towers, coordinate jump, max zoom, tower shrink, hover readout');
  await context.close();
  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
