import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const LOG = path.join(ROOT, '.cursor', 'debug-d5c492.log');
const PORT = Number(process.env.PORT || 8766);
const INGEST = 'http://127.0.0.1:7736/ingest/a24cc339-a827-4a49-b2ce-70866a52d6d1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function send(res, code, body, type = 'text/plain; charset=utf-8'){
  res.writeHead(code, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Debug-Session-Id',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(body);
}

function readBody(req){
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleDebug(req, res){
  if(req.method === 'OPTIONS'){
    send(res, 204, '');
    return;
  }
  const body = await readBody(req);
  try{
    fs.mkdirSync(path.dirname(LOG), { recursive: true });
    const line = body.trim();
    if(line) fs.appendFileSync(LOG, line + '\n');
  }catch(_e){}
  try{
    await fetch(INGEST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'd5c492'
      },
      body
    });
  }catch(_e){}
  send(res, 204, '');
}

function safePath(urlPath){
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rel = decoded === '/' ? '/preview.html' : decoded;
  const full = path.normalize(path.join(ROOT, rel));
  if(!full.startsWith(ROOT)) return null;
  return full;
}

const server = http.createServer(async (req, res) => {
  try{
    const url = req.url || '/';
    if(url.startsWith('/__debug_ingest')){
      await handleDebug(req, res);
      return;
    }
    if(req.method !== 'GET' && req.method !== 'HEAD'){
      send(res, 405, 'Method Not Allowed');
      return;
    }
    const file = safePath(url);
    if(!file){
      send(res, 403, 'Forbidden');
      return;
    }
    if(!fs.existsSync(file) || fs.statSync(file).isDirectory()){
      send(res, 404, 'Not Found');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const data = fs.readFileSync(file);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    if(req.method === 'HEAD') res.end();
    else res.end(data);
  }catch(err){
    send(res, 500, String(err && err.message || err));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[serve-debug] http://127.0.0.1:${PORT}/preview.html`);
  console.log(`[serve-debug] debug POST /__debug_ingest -> ${LOG}`);
});
