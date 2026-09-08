const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');

const URL='https://wardogs-field-assistant2.cloudsoo2004.workers.dev/';
function browserPath(){for(const p of ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'])if(fs.existsSync(p))return p;try{return cp.execFileSync('which',['google-chrome'],{encoding:'utf8'}).trim()}catch{}try{return cp.execFileSync('which',['chromium'],{encoding:'utf8'}).trim()}catch{}throw new Error('No system Chromium/Chrome found')}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:browserPath(),args:['--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'});
  const page=await context.newPage();
  page.setDefaultTimeout(20000);
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(URL,{waitUntil:'domcontentloaded'});

  assert.match(await page.locator('#sub').textContent(),/第 1 页/,'startup Chinese text is missing');
  assert.equal(await page.locator('#lang').textContent(),'EN','language toggle should be English label in Chinese mode');

  await page.locator('#nav2').click();
  await page.waitForFunction(()=>window.Wardogs11?.map && window.L,'map engine did not initialize');
  await page.waitForFunction(()=>document.querySelectorAll('img.leaflet-tile').length>0,'map tiles did not load');
  await page.waitForFunction(()=>document.querySelectorAll('.v11-tower-marker').length>0,'tower markers did not load');

  await page.locator('#setGun').click();
  await page.locator('#coordJump').fill('84.25, 62.10');
  await page.locator('#coordGo').click();
  await page.waitForFunction(()=>Math.abs(window.Wardogs11.gun?.x-84.25)<0.001 && Math.abs(window.Wardogs11.gun?.y-62.10)<0.001,'coordinate jump did not set Gun');

  await page.locator('#setTarget').click();
  await page.locator('#coordJump').fill('88.40, 66.20');
  await page.locator('#coordGo').click();
  await page.waitForFunction(()=>Math.abs(window.Wardogs11.target?.x-88.40)<0.001 && Math.abs(window.Wardogs11.target?.y-66.20)<0.001,'coordinate jump did not set Target');

  const before=await page.locator('.v11-tower-marker').first().boundingBox();
  await page.locator('#zoomIn').click();
  await page.locator('#zoomIn').click();
  await page.waitForTimeout(250);
  const after=await page.locator('.v11-tower-marker').first().boundingBox();
  assert.ok(before && after,'tower marker box missing');
  assert.ok(after.width < before.width,'tower marker did not shrink after zoom');

  assert.deepEqual(errors,[],'browser page errors were reported');
  console.log('LIVE E2E PASS: startup Chinese, Page 2 map, HD tiles, coordinate jump, tower scaling');
  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1)});