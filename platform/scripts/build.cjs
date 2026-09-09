const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'), out=path.join(root,'dist');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
fs.mkdirSync(out,{recursive:true});
const catalog=JSON.parse(read('data/catalog.json'));
const boundary=JSON.parse(read('data/zhejiang.json'));
const media=JSON.parse(read('data/media.json'));
const config=JSON.parse(read('data/config.json'));
const ids=catalog['01_遗产主表'].map(r=>r['遗产ID']);
if(new Set(ids).size!==ids.length)throw Error('Duplicate heritage IDs');
for(const r of catalog['02_遗址关系表'])if(!ids.includes(r['上级遗址ID'])||!ids.includes(r['子遗址ID']))throw Error('Dangling relation');
for(const m of media){if((m.scope!=='region'&&!ids.includes(m.heritage_id))||!m.id||!m.url||!m.title)throw Error('Invalid media entry');if(!/^(https:\/\/|media\/)/.test(m.url)||m.url.includes('..'))throw Error('Media URLs must be HTTPS or relative media/ paths');}
for(const file of ['app.js','search.js','style.css','index.html'])fs.copyFileSync(path.join(root,'src',file),path.join(out,file));
for(const file of ['leaflet.js','leaflet.css','LICENSE'])fs.copyFileSync(path.join(root,'public/vendor',file),path.join(out,file==='LICENSE'?'LEAFLET-LICENSE.txt':file));
fs.cpSync(path.join(root,'public/images'),path.join(out,'images'),{recursive:true});
const hasReference=fs.existsSync(path.join(root,'public/design-reference.png'));
if(hasReference)fs.copyFileSync(path.join(root,'public/design-reference.png'),path.join(out,'design-reference.png'));
else{const appFile=path.join(out,'app.js');fs.writeFileSync(appFile,fs.readFileSync(appFile,'utf8').replace(/<img class="reference-image"[^>]+>/g,''));}
if(fs.existsSync(path.join(root,'public/media')))fs.cpSync(path.join(root,'public/media'),path.join(out,'media'),{recursive:true});
fs.writeFileSync(path.join(out,'data.json'),JSON.stringify(catalog));
fs.writeFileSync(path.join(out,'zhejiang.json'),JSON.stringify(boundary));
fs.writeFileSync(path.join(out,'data.bundle.js'),'window.ATLAS_DATA='+JSON.stringify({catalog,boundary,media,config}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';\n');
fs.writeFileSync(path.join(out,'.nojekyll'),'');
// Embedded scripts avoid file:// fetch/CORS restrictions. No key or .env is bundled.
function dataUri(file){const ext=path.extname(file).slice(1);return 'data:image/'+(ext==='svg'?'svg+xml':ext==='jpg'?'jpeg':ext)+';base64,'+fs.readFileSync(path.join(out,file)).toString('base64');}
const reference=hasReference?dataUri('design-reference.png'):'';
let html=read('src/index.html');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,name)=>'<style>'+fs.readFileSync(path.join(out,name),'utf8').replace(/url\((?:["']?)(images\/[^)"']+)["']?\)/g,(_,asset)=>`url("${dataUri(asset)}")`)+'</style>');
html=html.replace(/<script defer src="([^"]+)"><\/script>/g,(_,name)=>{
 let code=fs.readFileSync(path.join(out,name),'utf8');
 if(name==='app.js')code=code.replaceAll('design-reference.png',reference);
 if(name==='data.bundle.js'){let embedded=JSON.parse(JSON.stringify({catalog,boundary,media,config}));embedded.media=embedded.media.map(m=>m.url.startsWith('media/')&&fs.existsSync(path.join(out,m.url))?{...m,url:dataUri(m.url)}:m);code='window.ATLAS_DATA='+JSON.stringify(embedded).replace(/</g,'\\u003c')+';';}
 return '<script defer-inline>'+code.replace(/<\/script/gi,'<\\/script')+'</script>';
});
// Defer has no effect on inline scripts: move all of them after the document body.
const scripts=[];html=html.replace(/<script defer-inline>([\s\S]*?)<\/script>/g,(_,s)=>{scripts.push('<script>'+s+'</script>');return ''});
html=html.replace('</body>',()=>scripts.join('\n')+'</body>');
fs.writeFileSync(path.join(out,'offline.html'),html);
console.log(`Built ${ids.length} records; GitHub Pages and standalone offline.html are ready.`);
