// Локальный сервер без зависимостей: node miso-menu/serve.cjs из родительской папки
// или node serve.cjs из папки меню. Корень всегда __dirname, не рабочий каталог.
// Запрос / явно обслуживается index.html; листинг каталогов не поддерживается.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname, types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.md':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{let relative;try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('MISO menu: http://127.0.0.1:4173'));
