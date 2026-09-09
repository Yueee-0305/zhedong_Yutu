const fs=require('node:fs'),path=require('node:path');
const project=path.resolve(__dirname,'..');
const parent=path.dirname(project);
if(path.basename(project)!=='platform'||!fs.existsSync(path.join(parent,'index.html')))throw Error('Run this only from zhedong_Yutu/platform');
const target=path.join(parent,'atlas');fs.mkdirSync(target,{recursive:true});
fs.cpSync(path.join(project,'dist'),target,{recursive:true});
console.log('Updated atlas/. Original root index.html remains untouched.');
