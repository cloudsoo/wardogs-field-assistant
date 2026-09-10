const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
const URL='https://wardogs-field-assistant2.cloudsoo2004.workers.dev/';
function browserPath(){for(const p of ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'])if(fs.existsSync(p))return p;return cp.execFileSync('which',['google-chrome'],{encoding:'utf8'}).trim()}
async function waitMap(page,id='bakurani'){await page.waitForFunction(id=>window.Wardogs19?.map?.id===id,id);await page.waitForSelector('canvas.v22-canvas');await page.waitForTimeout(500)}
async function emptyPoint(page,box){for(const f of [[.18,.18],[.82,.18],[.18,.82],[.82,.82]]){const p={x:box.x+box.width*f[0],y:box.y+box.height*f[1]};const hit=await page.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y);return !!e?.closest?.('.v22-marker')},{x:p.x,y:p.y});if(!hit)return p}return{x:box.x+box.width*.12,y:box.y+box.height*.88}}
async function desktop(browser){
 const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1,recordVideo:{dir:'test-artifacts/videos',size:{width:1280,height:900}}});
 const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(URL,{waitUntil:'domcontentloaded'});await page.locator('#nav2').click();await waitMap(page);
 const map=page.locator('#map');await map.scrollIntoViewIfNeeded();const box=await map.boundingBox();assert.ok(box,'desktop map box');
 const wheelPoint=await emptyPoint(page,box);await page.mouse.move(wheelPoint.x,wheelPoint.y);await page.mouse.wheel(0,-500);await page.waitForFunction(()=>Number(window.Wardogs19.map.q.zoom)>0);const z=await page.evaluate(()=>window.Wardogs19.map.q.zoom);assert.ok(z>0,'desktop wheel zoom');
 const before=await page.evaluate(()=>({x:window.Wardogs19.map.q.px,y:window.Wardogs19.map.q.py}));
 const dragPoint=await emptyPoint(page,box);await page.mouse.move(dragPoint.x,dragPoint.y);await page.mouse.down();await page.mouse.move(dragPoint.x+120,dragPoint.y+50,{steps:10});await page.mouse.up();await page.waitForFunction(([x,y])=>Math.abs(window.Wardogs19.map.q.px-x)>20||Math.abs(window.Wardogs19.map.q.py-y)>20,[before.x,before.y]);
 await page.locator('#mapSelect').selectOption('ozeti');await waitMap(page,'ozeti');const box2=await map.boundingBox();assert.ok(box2);const p2=await emptyPoint(page,box2);await page.mouse.move(p2.x,p2.y);await page.mouse.wheel(0,-500);await page.waitForFunction(()=>window.Wardogs19.map.q.zoom>0);
 await page.locator('#inactiveTowerLayer').check();await page.waitForTimeout(120);
 const weapon=page.locator('#weapon');assert.equal((await weapon.evaluate(e=>getComputedStyle(e).backgroundColor)).replace(/\s/g,''),'rgb(6,11,16)','weapon selector dark');assert.deepEqual(errors,[],'desktop page errors');
 await context.close();
}
async function mobile(browser){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',recordVideo:{dir:'test-artifacts/videos',size:{width:390,height:844}}});
 const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(URL,{waitUntil:'domcontentloaded'});await page.locator('#nav2').click();await waitMap(page);await page.waitForTimeout(500);
 const map=page.locator('#map');await map.scrollIntoViewIfNeeded();await page.waitForTimeout(150);const box=await map.boundingBox();assert.ok(box,'mobile map box');
 const dims=await page.evaluate(()=>{const h=document.querySelector('#map'),c=h?.querySelector('.v22-canvas');return{mw:h?.clientWidth,mh:h?.clientHeight,cw:c?.width,ch:c?.height,sw:c?.getBoundingClientRect().width,sh:c?.getBoundingClientRect().height,dpr:devicePixelRatio}});assert.equal(dims.dpr,3,'mobile DPR emulation');assert.equal(dims.cw,dims.mw,'canvas backing width must match CSS width');assert.equal(dims.ch,dims.mh,'canvas backing height must match CSS height');assert.equal(Math.round(dims.sw),dims.mw,'canvas visible width must fill map');assert.equal(Math.round(dims.sh),dims.mh,'canvas visible height must fill map');
 await page.locator('#setTarget').click();assert.equal(await page.evaluate(()=>window.Wardogs19.mode),'target','target mode selected');
 const towerSelect=page.locator('#towerSelect');await towerSelect.selectOption({label:'高塔 1'}).catch(async()=>{await towerSelect.selectOption('Tower 1')});await page.locator('#towerGo').click();
 const target=await page.evaluate(()=>window.Wardogs19.target);assert.deepEqual(target,{x:80.52,y:69.85},'tower quick location must set target in target mode');
 const gun=await page.evaluate(()=>window.Wardogs19.gun);assert.equal(gun,null,'tower quick target selection must not modify gun');
 const tower=page.locator('.v22-tower').first();const tb=await tower.boundingBox();assert.ok(tb,'tower marker visible');
 const before=await page.evaluate(()=>({x:window.Wardogs19.map.q.px,y:window.Wardogs19.map.q.py}));const start=await emptyPoint(page,box);await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(start.x+90,start.y+35,{steps:10});await page.mouse.up();await page.waitForFunction(([x,y])=>Math.abs(window.Wardogs19.map.q.px-x)>20||Math.abs(window.Wardogs19.map.q.py-y)>20,[before.x,before.y]);
 const after=await page.evaluate(()=>({x:window.Wardogs19.map.q.px,y:window.Wardogs19.map.q.py}));assert.ok(Math.abs(after.x-before.x)>20||Math.abs(after.y-before.y)>20,'mobile drag must pan map');
 await page.mouse.move(start.x,start.y);await page.mouse.wheel(0,600);await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>window.Wardogs19.map.q.zoom>=0),'mobile wheel path remains valid');
 await page.screenshot({path:'test-artifacts/mobile-map-final.png',fullPage:false});assert.deepEqual(errors,[],'mobile page errors');
 await context.close();
}
(async()=>{fs.rmSync('test-artifacts',{recursive:true,force:true});fs.mkdirSync('test-artifacts/videos',{recursive:true});const browser=await chromium.launch({headless:true,executablePath:browserPath(),args:['--disable-dev-shm-usage']});try{await desktop(browser);await mobile(browser);const videos=fs.readdirSync('test-artifacts/videos').filter(f=>/\.webm$/i.test(f));assert.ok(videos.length>=2,'desktop and mobile videos must be recorded');console.log('MAP INTERACTION PASS: desktop wheel/drag, mobile DPR alignment, mobile target-mode tower quick location, mobile pan, selector contrast, screenshots and video proof')}finally{await browser.close()}})().catch(err=>{console.error(err.stack||err);process.exit(1)});
