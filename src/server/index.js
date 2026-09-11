const http = require('http');
const { exec } = require('child_process');
const { ROOT, START_PORT, HOST, loadLocalEnv } = require('./config');
const { serveFile, resolveRequestPath } = require('./static');

function createServer() {
  return http.createServer((req, res) => {
    let requestUrl;
    try {
      requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Invalid request URL');
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method not allowed');
      return;
    }

    const filePath = resolveRequestPath(requestUrl, ROOT);
    if (!filePath) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }
    if (req.method === 'HEAD') {
      res.writeHead(200);
      res.end();
      return;
    }
    serveFile(res, filePath);
  });
}

function startServer(port = START_PORT) {
  const server = createServer();
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT) {
      server.close();
      startServer(port + 1);
      return;
    }
    console.error(error);
    process.exitCode = 1;
  });
  server.listen(port, HOST, () => {
    const displayHost = HOST === '0.0.0.0' ? '127.0.0.1' : HOST;
    const url = `http://${displayHost}:${port}`;
    console.log(`排版工作台已启动：${url}`);
    if (process.platform === 'win32' && HOST === '127.0.0.1' && process.env.LAYOUT_STUDIO_OPEN_BROWSER !== 'false') {
      exec(`start "" "${url}"`);
    }
  });
  return server;
}

if (require.main === module) startServer();

module.exports = { createServer, startServer, loadLocalEnv };
