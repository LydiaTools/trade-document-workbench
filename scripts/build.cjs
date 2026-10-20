const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../src');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace("script-src 'self';", "script-src 'self' 'unsafe-inline';");
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+fs.readFileSync(path.join(root,'styles.css'),'utf8')+'</style>');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,f)=>'<script>'+fs.readFileSync(path.join(root,f),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
const notices=['LICENSE-jspdf.txt','LICENSE-html2canvas.txt','LICENSE-fflate.txt'].map(f=>f+'\n'+fs.readFileSync(path.join(root,'vendor',f),'utf8')).join('\n\n');
if(notices.includes('-->'))throw Error('License comment requires escaping');
html=html.replace('</head>','\n<!-- Third-party license notices\n'+notices+'\n-->\n</head>');
fs.mkdirSync(path.resolve(__dirname,'../dist'),{recursive:true});
fs.writeFileSync(path.resolve(__dirname,'../dist/单证工作台.html'),html);

console.log('Standalone HTML created: '+Buffer.byteLength(html)+' bytes');
