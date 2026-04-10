/**
 * Claude CLI command runner with SSE streaming
 * Spawns claude -p and streams output
 */

const { spawn } = require('child_process');
const crypto = require('crypto');

const activeStreams = new Map();

// Cleanup streams older than 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, stream] of activeStreams) {
    if (now - stream.startedAt > 5 * 60 * 1000) {
      if (stream.process && !stream.process.killed) {
        stream.process.kill();
      }
      activeStreams.delete(id);
    }
  }
}, 30000);

function buildPrompt(command, args) {
  let prompt = `/goal:${command}`;
  if (args && args.trim()) {
    prompt += ` ${args}`;
  }
  return prompt;
}

function runCommand(command, args, workDir) {
  const streamId = crypto.randomUUID();
  const prompt = buildPrompt(command, args);

  const isWindows = process.platform === 'win32';
  const claudeCmd = isWindows ? 'claude.cmd' : 'claude';

  const proc = spawn(claudeCmd, ['-p', '--output-format', 'text', prompt], {
    cwd: workDir,
    shell: isWindows,
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const stream = {
    id: streamId,
    command: `goal:${command}`,
    args,
    status: 'running',
    output: '',
    error: '',
    startedAt: Date.now(),
    completedAt: null,
    exitCode: null,
    process: proc,
    sseClients: []
  };

  activeStreams.set(streamId, stream);

  proc.stdout.on('data', (data) => {
    const text = data.toString();
    stream.output += text;
    broadcastSSE(stream, 'log', text);
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    stream.error += text;
    broadcastSSE(stream, 'error', text);
  });

  proc.on('close', (code) => {
    stream.status = code === 0 ? 'completed' : 'error';
    stream.exitCode = code;
    stream.completedAt = Date.now();
    broadcastSSE(stream, 'complete', JSON.stringify({
      exitCode: code,
      duration: stream.completedAt - stream.startedAt
    }));
    // Close all SSE connections
    for (const res of stream.sseClients) {
      try { res.end(); } catch (e) {}
    }
    stream.sseClients = [];
  });

  proc.on('error', (err) => {
    stream.status = 'error';
    stream.error = err.message;
    stream.completedAt = Date.now();
    broadcastSSE(stream, 'error', err.message);
    for (const res of stream.sseClients) {
      try { res.end(); } catch (e) {}
    }
    stream.sseClients = [];
  });

  return { streamId, command: stream.command, status: 'running', startedAt: stream.startedAt };
}

function broadcastSSE(stream, event, data) {
  const lines = data.split('\n');
  for (const res of stream.sseClients) {
    try {
      for (const line of lines) {
        res.write(`event: ${event}\ndata: ${line}\n\n`);
      }
    } catch (e) {}
  }
}

function addSSEClient(streamId, res) {
  const stream = activeStreams.get(streamId);
  if (!stream) return false;

  // Send buffered output first
  if (stream.output) {
    for (const line of stream.output.split('\n')) {
      res.write(`event: log\ndata: ${line}\n\n`);
    }
  }

  if (stream.status !== 'running') {
    res.write(`event: complete\ndata: ${JSON.stringify({ exitCode: stream.exitCode })}\n\n`);
    res.end();
    return true;
  }

  stream.sseClients.push(res);

  // Remove client on disconnect
  res.on('close', () => {
    stream.sseClients = stream.sseClients.filter(c => c !== res);
  });

  return true;
}

function getStreamStatus(streamId) {
  const stream = activeStreams.get(streamId);
  if (!stream) return null;

  return {
    streamId: stream.id,
    command: stream.command,
    status: stream.status,
    exitCode: stream.exitCode,
    startedAt: stream.startedAt,
    completedAt: stream.completedAt,
    outputLength: stream.output.length
  };
}

function killStream(streamId) {
  const stream = activeStreams.get(streamId);
  if (stream && stream.process && !stream.process.killed) {
    stream.process.kill();
    return true;
  }
  return false;
}

module.exports = { runCommand, addSSEClient, getStreamStatus, killStream };
