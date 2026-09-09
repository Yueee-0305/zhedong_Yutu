const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { answerQuestion } = require('./chat.cjs');
const ROOT = path.resolve(__dirname,'../dist');
function createServer(options={}) {
  const env=options.env||process.env;
  const records=options.records||JSON.parse(fs.readFileSync(path.join(ROOT,'data.json'),'utf8'))['01_遗产主表'];
  const config={endpoint:env.LLM_ENDPOINT||'',key:env.LLM_API_KEY||'',model:env.LLM_MODEL||'',allowUnreviewed:env.ALLOW_UNREVIEWED_AI==='true'};
  if (config.endpoint && new URL(config.endpoint).protocol!=='https:') throw new Error('LLM_ENDPOINT must use HTTPS');
  const limits=new Map();
  const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
  return http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,mode:config.endpoint&&config.key&&config.model?'model-configured':'retrieval',requiresToken:!!env.ATLAS_ACCESS_TOKEN});
    if(url.pathname==='/api/chat'){
      if(env.PUBLIC_ORIGIN && req.headers.origin===env.PUBLIC_ORIGIN){res.setHeader('Access-Control-Allow-Origin',env.PUBLIC_ORIGIN);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');}
      if(req.method==='OPTIONS'){if(env.PUBLIC_ORIGIN && req.headers.origin===env.PUBLIC_ORIGIN){res.writeHead(204);return res.end();}return json(res,403,{error:'不接受该来源。'});}
      if(req.method!=='POST')return json(res,405,{error:'请使用 POST。'});
      if(env.ATLAS_ACCESS_TOKEN){const expected=Buffer.from(`Bearer ${env.ATLAS_ACCESS_TOKEN}`),actual=Buffer.from(req.headers.authorization||'');if(expected.length!==actual.length||!crypto.timingSafeEqual(expected,actual))return json(res,401,{error:'请输入站点访问口令。'});}
      const origin=req.headers.origin;
      const expectedOrigin=env.PUBLIC_ORIGIN||`http://${req.headers.host}`;
      if(origin&&origin!==expectedOrigin)return json(res,403,{error:'不接受来自其他站点的请求。'});
      if(!String(req.headers['content-type']||'').startsWith('application/json'))return json(res,415,{error:'请发送 JSON。'});
      const now=Date.now(),ip=req.socket.remoteAddress;
      for(const [k,v] of limits)if(now-v.start>60000)limits.delete(k);
      if(!limits.has(ip)&&limits.size>=1000)return json(res,503,{error:'服务繁忙，请稍后再试。'});
      const bucket=limits.get(ip)||{start:now,count:0};bucket.count++;limits.set(ip,bucket);
      if(bucket.count>20)return json(res,429,{error:'请求过于频繁，请一分钟后再试。'});
      try{
        let raw='';for await(const chunk of req){raw+=chunk.toString('utf8');if(Buffer.byteLength(raw)>16384){json(res,413,{error:'请求过大。'});req.destroy();return;}}
        let body;try{body=JSON.parse(raw)}catch{return json(res,400,{error:'JSON 格式不正确。'});}
        if(typeof body.question!=='string'||!body.question.trim()||body.question.length>500)return json(res,400,{error:'问题应为 1–500 个字符。'});
        return json(res,200,await answerQuestion(body.question.trim(),records,config,options.request));
      }catch(error){return json(res,502,{error:error.name==='TimeoutError'?'模型请求超时，请重试。':error.message||'服务暂不可用。'});}
    }
    if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
    let decoded;try{decoded=decodeURIComponent(url.pathname)}catch{return json(res,400,{error:'Invalid path'});}
    const segments=decoded.split('/').filter(Boolean);
    if(segments.some(s=>s.startsWith('.')||s.includes('\\')))return json(res,404,{error:'Not found'});
    let filename=path.resolve(ROOT,'.'+decoded);if(!filename.startsWith(ROOT+path.sep)&&filename!==ROOT)return json(res,404,{error:'Not found'});
    if(filename===ROOT||decoded.endsWith('/'))filename=path.join(filename,'index.html');
    let stat;try{stat=fs.statSync(filename)}catch{return json(res,404,{error:'Not found'});}
    if(!stat.isFile())return json(res,404,{error:'Not found'});
    const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.geojson':'application/geo+json','.md':'text/plain; charset=utf-8'};
    res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Content-Length':stat.size,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-cache'});
    if(req.method==='HEAD')return res.end();fs.createReadStream(filename).pipe(res);
  });
}
if(require.main===module){const server=createServer();server.listen(Number(process.env.PORT)||8000,process.env.HOST||'127.0.0.1',()=>console.log(`Atlas: http://${process.env.HOST||'127.0.0.1'}:${process.env.PORT||8000}`));}
module.exports={createServer};
