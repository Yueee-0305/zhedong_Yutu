const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {search}=require('../src/search.js');
const {answerQuestion}=require('../server/chat.cjs');
const {createServer}=require('../server/index.cjs');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/catalog.json'),'utf8'));
const records=catalog['01_遗产主表'];
const sample={'遗产ID':'ZJCD-TEST-001','遗址名称':'测试城址','遗址概况':'仅用于自动测试的资料。','数据审核状态':'已审核'};

test('stable IDs and relationships remain consistent',()=>{
 const ids=records.map(r=>r['遗产ID']);assert.equal(new Set(ids).size,ids.length);
 for(const r of catalog['02_遗址关系表']){assert.ok(ids.includes(r['上级遗址ID']));assert.ok(ids.includes(r['子遗址ID']));}
});
test('named natural-language query resolves the intended record',()=>{
 assert.equal(search(records,'观海卫城有什么历史？')[0].record['遗产ID'],'ZJCD-NB-003');
 assert.equal(search(records,'ZJCD-NB-003')[0].record['遗址名称'],'观海卫城');
 assert.equal(search(records,'qzxv-nonexistent-token').length,0);
});
test('no model key uses retrieval; unreviewed evidence is not sent',async()=>{
 const r=await answerQuestion('测试城址',[sample]);assert.equal(r.mode,'retrieval');
 const blocked=await answerQuestion('测试城址',[{...sample,'数据审核状态':'待复核'}],{endpoint:'https://example.invalid/api',key:'test',model:'test'},()=>{throw Error('Must not call provider')});assert.equal(blocked.mode,'retrieval');
});
test('provider adapter accepts grounded IDs and rejects unknown citations',async()=>{
 const config={endpoint:'https://example.invalid/api',key:'test',model:'test'};
 const response=content=>async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(content)}}]})});
 const r=await answerQuestion('测试城址',[sample],config,response({answer:'测试资料[ZJCD-TEST-001]',citations:['ZJCD-TEST-001']}));assert.equal(r.mode,'generated');
 await assert.rejects(answerQuestion('测试城址',[sample],config,response({answer:'伪造[ZJCD-TEST-999]',citations:['ZJCD-TEST-999']})));
});
test('offline file embeds all boot dependencies and has valid scripts',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../dist/offline.html'),'utf8');
 assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
 assert.ok(html.includes('window.ATLAS_DATA='));assert.ok(html.indexOf('<main')<html.indexOf('window.ATLAS_DATA='));
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.ok(scripts.length>=4);
 for(const [_,code]of scripts)new vm.Script(code);
});
test('HTTP entrypoint, MIME, missing assets and API validation',async t=>{
 const server=createServer({env:{},records});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const url='http://127.0.0.1:'+server.address().port;
 const home=await fetch(url+'/');assert.equal(home.status,200);assert.match(await home.text(),/浙东海防/);
 assert.match((await fetch(url+'/app.js')).headers.get('content-type'),/javascript/);
 assert.equal((await fetch(url+'/missing-file.js')).status,404);
 assert.equal((await fetch(url+'/.env')).status,404);
 const health=await(await fetch(url+'/api/health')).json();assert.equal(health.mode,'retrieval');
 const ask=async body=>fetch(url+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await ask({question:''})).status,400);
 const result=await(await ask({question:'观海卫城'})).json();assert.equal(result.mode,'retrieval');assert.ok(Array.isArray(result.sources));
 assert.equal((await fetch(url+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://wrong.invalid'},body:'{}'})).status,403);
});
test('site token is required when configured',async t=>{
 const server=createServer({env:{ATLAS_ACCESS_TOKEN:'test-site-token'},records});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const url='http://127.0.0.1:'+server.address().port+'/api/chat';
 assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
});
