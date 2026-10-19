import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {STORE_ENDPOINT,REFRESH_MS} from '../src/js/store-list.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const root=path.resolve(import.meta.dirname,'..');
const output=process.env.STORE_VERIFY_OUTPUT||path.resolve(root,'..','store-list-verification-20261019');
await mkdir(output,{recursive:true});
const server=createServer(async(req,res)=>{try{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=process.env.STORE_VERIFY_URL || `http://127.0.0.1:${server.address().port}/pages/store.html`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const checks=[];
async function newContext(options){
  const context=await browser.newContext(options);
  if(process.env.STORE_VERIFY_PREVIEW==='1'){
    await context.route('https://playpark.app/**',async route=>{
      const pathname=new URL(route.request().url()).pathname;
      if(['/pages/store.html','/src/js/store-list.mjs','/dist/store-list.css'].includes(pathname)){
        const mime=pathname.endsWith('.html')?'text/html':pathname.endsWith('.css')?'text/css':'text/javascript';
        await route.fulfill({contentType:mime,body:await readFile(path.join(root,pathname))});
      }else await route.continue();
    });
  }
  return context;
}
try{
  const context=await newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#store-list[aria-busy="false"]').waitFor({timeout:25000});
  const cards=page.locator('#store-list > li');
  assert.equal(await cards.count(),2);
  assert.equal(await cards.filter({hasText:'플레이파크 장안점'}).locator('a').getAttribute('href'),'https://ppscreen.playpark.app/reserve?storeId=PS003');
  const dangoo=cards.filter({hasText:'아쿠아랜드(MyPark단구)'});
  assert.equal(await dangoo.locator('.store-badge').textContent(),'준비중'); assert.equal(await dangoo.locator('a').count(),0);
  assert.equal(await page.locator('#store-list-retry').isVisible(),false);
  const section=page.locator('section[aria-labelledby="find-title"]');
  await section.scrollIntoViewIfNeeded(); await section.screenshot({path:path.join(output,'desktop.png')});
  checks.push({check:'live data: Jang direct link; Dangoo preparing without reservation',passed:true,names:await cards.locator('.store-name').allTextContents()});
  await page.setViewportSize({width:390,height:844}); await section.screenshot({path:path.join(output,'mobile.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  checks.push({check:'mobile 390px: no horizontal overflow',passed:true});
  const reserve=await context.newPage(); await reserve.goto('https://ppscreen.playpark.app/reserve?storeId=PS003',{waitUntil:'domcontentloaded'});
  await reserve.getByText('플레이파크 장안점',{exact:true}).first().waitFor({timeout:30000});
  checks.push({check:'actual reservation deep link resolves Jang store',passed:true}); await reserve.close(); assert.deepEqual(errors,[]); await context.close();
  const fixtures=await newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const fixture=await fixtures.newPage(); await fixture.clock.install({time:new Date('2026-10-19T00:00:00Z')});
  const value=v=>v==null?{nullValue:null}:typeof v==='string'?{stringValue:v}:typeof v==='boolean'?{booleanValue:v}:Array.isArray(v)?{arrayValue:{values:v.map(value)}}:{mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,v])=>[k,value(v)]))}};
  const record=(id,fields)=>({document:{name:`projects/p/databases/(default)/documents/stores/${id}`,fields:value(fields).mapValue.fields}});
  const base={name:'장안점 <img src=x onerror=alert(1)>',address:'주소 <script>bad()</script>',storeType:'무인',storeState:'운영중',operations:{openHours:['0000','2400'],selfHours:['0000-2400']}};
  let rows=[record('PS003',base),record('PS005',{...base,name:'단구점',storeType:'병행',storeState:'운영준비'}),record('DEV',{...base,isDev:true}),record('DELETED',{...base,isDeleted:true}),record('CLOSED',{...base,storeState:'폐업'}),record('SUSPENDED',{...base,suspension:{enabled:true}})];
  let fail=false,requests=0;
  await fixture.route(STORE_ENDPOINT,route=>{requests++;return route.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(fail?{error:'unavailable'}:rows)});});
  await fixture.goto(url,{waitUntil:'domcontentloaded'}); await fixture.locator('#store-list[aria-busy="false"]').waitFor();
  assert.equal(await fixture.locator('#store-list > li').count(),2); assert.equal(await fixture.locator('#store-list img, #store-list script').count(),0);
  checks.push({check:'fixture excludes dev/deleted/closed/suspended; text injection safe',passed:true});
  rows=[record('PS005',{...base,name:'단구점',storeType:'병행',storeState:'운영중'})];
  const initialRequests=requests;
  await fixture.clock.fastForward(60000);
  await fixture.evaluate(()=>{window.dispatchEvent(new Event('online'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('pageshow'));});
  assert.equal(requests,initialRequests);
  await fixture.reload({waitUntil:'domcontentloaded'}); await fixture.locator('#store-list[aria-busy="false"]').waitFor();
  assert.equal(requests,initialRequests); assert.equal(await fixture.locator('#store-list > li').count(),2);
  checks.push({check:'fresh seven-day cache survives reload, tab and network events without querying',passed:true});
  await fixture.clock.fastForward(REFRESH_MS-60000+1);
  await fixture.waitForFunction(()=>document.querySelectorAll('#store-list a').length===1&&document.querySelector('#store-list a').href.includes('PS005'));
  assert.equal(await fixture.locator('#store-list > li').count(),1);
  checks.push({check:'seven-day expiry: removal and preparing-to-open transition',passed:true});
  fail=true; await fixture.clock.fastForward(REFRESH_MS+1); await fixture.locator('#store-list-retry').waitFor({state:'visible'});
  assert.equal(await fixture.locator('#store-list > li').count(),0); await fixture.locator('section[aria-labelledby="find-title"]').screenshot({path:path.join(output,'error.png')});
  checks.push({check:'failed refresh clears stale cards and exposes retry',passed:true});
  fail=false;rows=[];await fixture.locator('#store-list-retry').click();await fixture.locator('#store-list-retry').waitFor({state:'hidden'});
  assert.match(await fixture.locator('#store-list-status').textContent(),/현재 안내 가능한/);checks.push({check:'retry recovers to explicit empty state',passed:true,requests});await fixtures.close();
  const noJs=await newContext({javaScriptEnabled:false});const plain=await noJs.newPage();await plain.goto(url,{waitUntil:'domcontentloaded'});
  assert.equal(await plain.locator('#store-list > li').count(),0);assert.equal(await plain.locator('noscript p').isVisible(),true);assert.equal(await plain.locator('#store-list-retry').isVisible(),false);
  checks.push({check:'no JavaScript: no fabricated stores; reservation fallback visible',passed:true});await noJs.close();
  await writeFile(path.join(output,'browser-results.json'),JSON.stringify({verifiedAt:new Date().toISOString(),checks},null,2));console.log(JSON.stringify({output,checks},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
