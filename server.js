const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  // Normalize URL path and strip query strings / hash
  const rawPath = req.url.split('?')[0];
  let safePath = path.normalize(rawPath).replace(/^(\.\.[\/\\])+/, '');
  let targetFile = path.join(DIST_DIR, safePath);

  // If path is a directory, look for index.html inside it
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(targetFile, 'index.html');
  }

  // If file exists in dist, serve it
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isImmutable = ext !== '.html';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isImmutable ? 'public, max-age=31536000, immutable' : 'no-cache'
    });
    return fs.createReadStream(targetFile).pipe(res);
  }

  // SPA fallback: Return index.html for all Angular client routes (/students, /courses, /enrollments, etc.)
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache'
    });
    return fs.createReadStream(indexPath).pipe(res);
  }

  // Not found fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Course Enrollment Management System live on http://0.0.0.0:${PORT}`);
});
