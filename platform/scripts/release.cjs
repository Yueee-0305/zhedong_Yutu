// Creates a credential-free GitHub-ready folder, excluding the Sites identity.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');const publicOnly=process.argv.includes('--public');
const dest=path.join(root,'releases',publicOnly?'coastal-atlas-public':'coastal-atlas-research');
if(fs.existsSync(dest))fs.rmSync(dest,{recursive:true});fs.mkdirSync(dest,{recursive:true});
const include=['src','data','public','server','scripts','tests','docs','.github','.gitignore','.env.example','package.json','README.md','LICENSE','DATA_LICENSE.md','CONTRIBUTING.md','SECURITY.md','CHANGELOG.md','start-windows.bat','start-local.sh'];
for(const name of include){const src=path.join(root,name);if(fs.existsSync(src))fs.cpSync(src,path.join(dest,name),{recursive:true,filter:s=>!s.includes('__pycache__')&&!s.endsWith('.pyc')});}
if(publicOnly){
 const file=path.join(dest,'data/catalog.json');const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 const keep=new Set(['遗产ID','遗址名称','记录层级','上级遗址ID','上级遗址名称','海防体系','遗产二级类型','地级行政区','区县','经度','纬度','坐标系','定位精度','年代原文','年代标签','数据审核状态','发布状态','原表行号']);
 for(const r of catalog['01_遗产主表'])for(const key of Object.keys(r))if(!keep.has(key))r[key]=null;
 for(const key of Object.keys(catalog))if(!['01_遗产主表','02_遗址关系表'].includes(key))delete catalog[key];
 fs.writeFileSync(file,JSON.stringify(catalog));
 const publicMedia=JSON.parse(fs.readFileSync(path.join(root,'data/media.json'),'utf8')).filter(m=>m.scope==='region').map(m=>({...m,url:'https://yueee-0305.github.io/zhedong_Yutu/assets/ming-zhejiang-map.jpg'}));
 fs.writeFileSync(path.join(dest,'data/media.json'),JSON.stringify(publicMedia));
 fs.writeFileSync(path.join(dest,'data/zhejiang.json'),JSON.stringify({type:'FeatureCollection',features:[]}));
 fs.rmSync(path.join(dest,'public/design-reference.png'),{force:true});
 fs.rmSync(path.join(dest,'public/media'),{recursive:true,force:true});
 const cfgFile=path.join(dest,'data/config.json'),cfg=JSON.parse(fs.readFileSync(cfgFile,'utf8'));cfg.distribution='public-metadata';cfg.aiEndpoint='';fs.writeFileSync(cfgFile,JSON.stringify(cfg,null,2));
}
cp.execFileSync(process.execPath,['scripts/build.cjs'],{cwd:dest,stdio:'inherit'});
console.log(dest);
