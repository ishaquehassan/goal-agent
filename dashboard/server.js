/**
 * Goal Agent Dashboard Server
 * Zero-dependency Node.js HTTP server with WebSocket support
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const StateManager = require('./lib/state-manager');
const FileWatcher = require('./lib/file-watcher');
const { runCommand, addSSEClient, getStreamStatus, killStream } = require('./lib/runner');

// Resolve working directory (where state .md files live)
// Auto-detect: walk up from given dir until goal-definition.md is found
function findGoalDir(startDir) {
  let dir = startDir;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, 'goal-definition.md'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir; // fallback to original
}
const WORK_DIR = findGoalDir(process.env.GOAL_AGENT_WORKDIR || process.cwd());
const PORT_START = parseInt(process.env.GOAL_DASHBOARD_PORT || '8080', 10);

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// Initialize state manager and file watcher
const stateManager = new StateManager(WORK_DIR);
const fileWatcher = new FileWatcher(WORK_DIR);

// WebSocket clients for real-time updates
const wsClients = new Set();

fileWatcher.onChange((filename) => {
  stateManager.notify();
  broadcastWS({ type: 'stateChange', file: filename, timestamp: Date.now() });
});

// Allowed commands (whitelist)
const ALLOWED_COMMANDS = ['set', 'next', 'status', 'log', 'research', 'optimize', 'write', 'engage', 'contacts', 'calendar', 'contribute', 'update'];

// ─── HTTP Server ───

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers (localhost only but good practice)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    handleAPI(req, res, pathname, url);
    return;
  }

  // Static files
  serveStatic(req, res, pathname);
});

// ─── API Handler ───

function handleAPI(req, res, pathname, url) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // GET /api/health
  if (pathname === '/api/health' && req.method === 'GET') {
    const state = stateManager.getState();
    return sendJSON(res, 200, {
      status: 'ok',
      uptime: process.uptime(),
      goalDefined: state.goalDefined,
      port: server.address()?.port,
      workDir: WORK_DIR
    });
  }

  // GET /api/state
  if (pathname === '/api/state' && req.method === 'GET') {
    return sendJSON(res, 200, stateManager.getState());
  }

  // GET /api/state/:file
  const stateFileMatch = pathname.match(/^\/api\/state\/([a-z-]+)$/);
  if (stateFileMatch && req.method === 'GET') {
    const data = stateManager.getFile(stateFileMatch[1]);
    if (!data) return sendJSON(res, 404, { error: 'File not found' });
    return sendJSON(res, 200, data);
  }

  // POST /api/commands/:command
  const cmdMatch = pathname.match(/^\/api\/commands\/([a-z]+)$/);
  if (cmdMatch && req.method === 'POST') {
    const command = cmdMatch[1];
    if (!ALLOWED_COMMANDS.includes(command)) {
      return sendJSON(res, 400, { error: `Unknown command: ${command}` });
    }


    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let args = '';
      try {
        const parsed = JSON.parse(body || '{}');
        args = parsed.args || '';
      } catch (e) {
        return sendJSON(res, 400, { error: 'Invalid JSON body' });
      }

      // Sanitize args
      if (typeof args !== 'string' || args.length > 1000) {
        return sendJSON(res, 400, { error: 'Invalid args' });
      }

      const result = runCommand(command, args, WORK_DIR);
      return sendJSON(res, 202, result);
    });
    return;
  }

  // GET /api/commands/:streamId/events (SSE)
  const sseMatch = pathname.match(/^\/api\/commands\/([a-f0-9-]+)\/events$/);
  if (sseMatch && req.method === 'GET') {
    const streamId = sseMatch[1];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Heartbeat
    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch (e) { clearInterval(heartbeat); }
    }, 15000);

    res.on('close', () => clearInterval(heartbeat));

    if (!addSSEClient(streamId, res)) {
      res.write(`event: error\ndata: Stream not found\n\n`);
      res.end();
    }
    return;
  }

  // GET /api/commands/:streamId/status
  const statusMatch = pathname.match(/^\/api\/commands\/([a-f0-9-]+)\/status$/);
  if (statusMatch && req.method === 'GET') {
    const status = getStreamStatus(statusMatch[1]);
    if (!status) return sendJSON(res, 404, { error: 'Stream not found' });
    return sendJSON(res, 200, status);
  }

  sendJSON(res, 404, { error: 'Not found' });
}

// ─── Static File Server ───

function serveStatic(req, res, pathname) {
  if (pathname === '/') pathname = '/index.html';

  const publicDir = path.join(__dirname, 'public');
  const filePath = path.join(publicDir, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: serve index.html for non-file routes
      if (err.code === 'ENOENT') {
        const indexPath = path.join(publicDir, 'index.html');
        fs.readFile(indexPath, (err2, indexData) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(indexData);
        });
        return;
      }
      res.writeHead(500);
      res.end('Server Error');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// ─── WebSocket (RFC 6455 minimal implementation) ───

server.on('upgrade', (req, socket, head) => {
  if (req.url !== '/ws') {
    socket.destroy();
    return;
  }

  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-5AB5DC11E65B')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
    '\r\n'
  );

  wsClients.add(socket);

  // Send current state immediately
  const state = stateManager.getState();
  sendWSFrame(socket, JSON.stringify({ type: 'init', data: state }));

  socket.on('data', (buffer) => {
    // Parse WebSocket frame (handle ping/pong/close)
    try {
      const frame = parseWSFrame(buffer);
      if (frame.opcode === 0x8) {
        // Close
        wsClients.delete(socket);
        socket.end();
      } else if (frame.opcode === 0x9) {
        // Ping -> Pong
        sendWSRawFrame(socket, 0xA, frame.payload);
      }
    } catch (e) {}
  });

  socket.on('close', () => wsClients.delete(socket));
  socket.on('error', () => wsClients.delete(socket));

  // Keep-alive ping every 30s
  const pingInterval = setInterval(() => {
    if (socket.destroyed) {
      clearInterval(pingInterval);
      return;
    }
    try { sendWSRawFrame(socket, 0x9, Buffer.from('ping')); } catch (e) { clearInterval(pingInterval); }
  }, 30000);
});

function parseWSFrame(buffer) {
  const firstByte = buffer[0];
  const opcode = firstByte & 0x0F;
  const secondByte = buffer[1];
  const masked = (secondByte & 0x80) !== 0;
  let payloadLength = secondByte & 0x7F;
  let offset = 2;

  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    payloadLength = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  let maskKey = null;
  if (masked) {
    maskKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  let payload = buffer.slice(offset, offset + payloadLength);
  if (masked && maskKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskKey[i % 4];
    }
  }

  return { opcode, payload };
}

function sendWSFrame(socket, data) {
  const payload = Buffer.from(data, 'utf-8');
  sendWSRawFrame(socket, 0x1, payload); // Text frame
}

function sendWSRawFrame(socket, opcode, payload) {
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode; // FIN + opcode
    header[1] = payload.length;
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }

  try {
    socket.write(Buffer.concat([header, payload]));
  } catch (e) {}
}

function broadcastWS(message) {
  const data = JSON.stringify(message);
  for (const socket of wsClients) {
    try {
      sendWSFrame(socket, data);
    } catch (e) {
      wsClients.delete(socket);
    }
  }
}

// ─── Utility ───

function sendJSON(res, status, data) {
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

function openBrowser(url) {
  const { exec } = require('child_process');
  const platform = process.platform;
  let cmd;

  if (platform === 'darwin') cmd = `open "${url}"`;
  else if (platform === 'win32') cmd = `start "" "${url}"`;
  else cmd = `xdg-open "${url}" 2>/dev/null || sensible-browser "${url}" 2>/dev/null`;

  exec(cmd, (err) => {
    if (err) console.log(`  Open manually: ${url}`);
  });
}

// ─── Start Server ───

function tryListen(port) {
  server.listen(port, '127.0.0.1', () => {
    const actualPort = server.address().port;
    const url = `http://127.0.0.1:${actualPort}`;

    console.log('');
    console.log('  ┌─────────────────────────────────────┐');
    console.log('  │   Goal Agent Dashboard               │');
    console.log(`  │   ${url}            │`);
    console.log('  │   Press Ctrl+C to stop               │');
    console.log('  └─────────────────────────────────────┘');
    console.log('');
    console.log(`  Working directory: ${WORK_DIR}`);
    console.log(`  State files: ${stateManager.getState().goalDefined ? 'Found' : 'Not found (run /goal:set first)'}`);
    console.log('');

    // Start file watcher
    fileWatcher.start();

    // Auto-open browser
    if (!process.env.GOAL_DASHBOARD_NO_OPEN) {
      openBrowser(url);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      if (nextPort <= 8999) {
        console.log(`  Port ${port} in use, trying ${nextPort}...`);
        tryListen(nextPort);
      } else {
        console.error('  No available ports (8080-8999). Set GOAL_DASHBOARD_PORT env var.');
        process.exit(1);
      }
    } else {
      console.error('  Server error:', err.message);
      process.exit(1);
    }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n  Shutting down...');
  fileWatcher.stop();
  for (const socket of wsClients) {
    try { socket.end(); } catch (e) {}
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000);
});

process.on('SIGTERM', () => process.emit('SIGINT'));

tryListen(PORT_START);
