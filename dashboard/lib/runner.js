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

// Browser commands need Chrome MCP which only works in interactive sessions
const BROWSER_COMMANDS = ['engage', 'optimize', 'write'];

function runCommand(command, args, workDir) {
  const streamId = crypto.randomUUID();
  const prompt = buildPrompt(command, args);

  // Browser commands: open in new terminal window (interactive session with MCP)
  if (BROWSER_COMMANDS.includes(command)) {
    return runBrowserCommand(streamId, command, args, prompt, workDir);
  }

  const isWindows = process.platform === 'win32';
  const claudeCmd = isWindows ? 'claude.cmd' : 'claude';

  const proc = spawn(claudeCmd, ['-p', '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions'], {
    cwd: workDir,
    shell: isWindows,
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Write prompt to stdin and close it (claude -p reads from stdin)
  proc.stdin.write(prompt);
  proc.stdin.end();

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

  // Auto-kill after 2 minutes if still running (prevents hanging commands)
  const killTimer = setTimeout(() => {
    if (stream.status === 'running') {
      if (proc && !proc.killed) proc.kill();
      stream.status = 'timeout';
      stream.completedAt = Date.now();
      broadcastSSE(stream, 'error', 'Command timed out after 2 minutes. If this is a browser command (engage/optimize), run it from your main Claude Code terminal where Chrome MCP is connected.');
      broadcastSSE(stream, 'complete', JSON.stringify({ exitCode: -1, duration: Date.now() - stream.startedAt }));
      for (const res of stream.sseClients) { try { res.end(); } catch(e) {} }
      stream.sseClients = [];
    }
  }, 120000);

  // Clear timer if process ends naturally
  proc.on('close', () => { clearTimeout(killTimer); });

  // Buffer for incomplete JSON lines
  let stdoutBuffer = '';

  proc.stdout.on('data', (data) => {
    stdoutBuffer += data.toString();
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);

        // Extract readable text from different event types
        if (event.type === 'assistant' && event.message?.content) {
          for (const block of event.message.content) {
            if (block.type === 'text' && block.text) {
              stream.output += block.text;
              broadcastSSE(stream, 'log', block.text);
            }
          }
        } else if (event.type === 'result' && event.result) {
          // Final result, only broadcast if not already sent
          if (!stream.output.includes(event.result)) {
            stream.output += event.result;
            broadcastSSE(stream, 'log', event.result);
          }
        }
        // Skip system, hook, rate_limit events silently
      } catch {
        // Non-JSON line, broadcast as-is
        if (line.trim()) {
          stream.output += line;
          broadcastSSE(stream, 'log', line);
        }
      }
    }
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    // Filter out claude CLI noise (stdin warnings, hook messages)
    if (text.includes('no stdin data received') || text.includes('Hook cancelled')) return;
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

function runBrowserCommand(streamId, command, args, prompt, workDir) {
  const isMac = process.platform === 'darwin';

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
    process: null,
    sseClients: []
  };

  activeStreams.set(streamId, stream);

  if (isMac) {
    // Open new Terminal window: run command, auto-log result, then close
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/'/g, "'\\''");
    const escapedWorkDir = workDir.replace(/"/g, '\\"');
    const logMsg = `Dashboard ${command} session completed`;
    const shellScript = [
      `cd \\"${escapedWorkDir}\\"`,
      `echo \\"\\\\n[GOAL AGENT] Running ${command}...\\"`,
      `claude --dangerously-skip-permissions \\"${escapedPrompt}\\"`,
      `echo \\"\\\\n[GOAL AGENT] Command finished. Updating goal state...\\"`,
      `echo \\"/goal:log '${logMsg}'\\" | claude -p --output-format text 2>/dev/null`,
      `echo \\"\\\\n[GOAL AGENT] Done. Closing in 3s...\\"`,
      `sleep 3`,
      `exit`
    ].join(' && ');

    const appleScript = `tell application "Terminal"
      activate
      do script "${shellScript}"
    end tell`;

    const proc = spawn('osascript', ['-e', appleScript], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    stream.process = proc;

    proc.on('close', (code) => {
      stream.status = 'completed';
      stream.exitCode = code;
      stream.completedAt = Date.now();
      const msg = 'Opened in new Terminal window. Claude is running with full browser access there.';
      stream.output = msg;
      broadcastSSE(stream, 'log', msg);
      broadcastSSE(stream, 'complete', JSON.stringify({ exitCode: 0, duration: Date.now() - stream.startedAt }));
      for (const res of stream.sseClients) { try { res.end(); } catch(e) {} }
      stream.sseClients = [];
    });

    proc.on('error', (err) => {
      stream.status = 'error';
      stream.error = err.message;
      stream.completedAt = Date.now();
      broadcastSSE(stream, 'error', err.message);
      for (const res of stream.sseClients) { try { res.end(); } catch(e) {} }
      stream.sseClients = [];
    });
  } else {
    // Non-Mac: just show instruction
    stream.status = 'completed';
    stream.completedAt = Date.now();
    stream.exitCode = 0;
    const msg = `Run this in your terminal: claude "${prompt}"`;
    stream.output = msg;

    // Broadcast after a tick so SSE clients can connect first
    setTimeout(() => {
      broadcastSSE(stream, 'log', msg);
      broadcastSSE(stream, 'complete', JSON.stringify({ exitCode: 0, duration: 0 }));
      for (const res of stream.sseClients) { try { res.end(); } catch(e) {} }
      stream.sseClients = [];
    }, 100);
  }

  return { streamId, command: stream.command, status: 'running', startedAt: stream.startedAt };
}

module.exports = { runCommand, addSSEClient, getStreamStatus, killStream };
