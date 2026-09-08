const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');

const URL='https://wardogs-field-assistant2.cloudsoo2004.workers.dev/';

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    ...devices['iPhone 13'],
    serviceWorkers:'allow'
  });
  const page=await context.newPage();
  page.setDefaultTimeout(20000);
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(URL,{waitUntil:'domcontentloaded'});

  assert.match(await page.locator('#sub').textContent(),/第 1 页/,'startup Chinese text is missing');
  assert.equal(await page.locator('#lang').textContent(),'EN','language toggle should be English label in Chinese mode');

  await page.locator('#nav2').click();
  await page.waitForSelector('#map.leaflet-container,.leaflet-container',{state:'attached',timeout:20000});
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
  console.log('LIVE SMOKE PASS: Chinese startup, Page 2 map, HD tiles, coordinate jump, tower scaling');
  await browser.close();
})().catch(async err=>{
  console.error(err.stack||err);
  process.exit(1);
});