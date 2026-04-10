/**
 * Commands execution panel with terminal output
 */

const COMMAND_SPECS = [
  {
    cmd: 'set', icon: '🎯', label: 'Set Goal', desc: 'Initialize a new goal with strategy',
    params: [{ name: 'args', label: 'Your goal', type: 'textarea', placeholder: 'e.g. "Become a Flutter GDE in 6 months"' }],
    color: 'from-blue-500/20 to-purple-500/20'
  },
  {
    cmd: 'next', icon: '📋', label: 'Next Actions', desc: "Today's prioritized tasks",
    params: [],
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    cmd: 'status', icon: '📊', label: 'Status', desc: 'Full progress dashboard',
    params: [],
    color: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    cmd: 'log', icon: '📝', label: 'Log Work', desc: 'Record session work',
    params: [{ name: 'args', label: 'What did you do?', type: 'textarea', placeholder: 'e.g. "commented on 3 posts, published 1 article"' }],
    color: 'from-amber-500/20 to-orange-500/20'
  },
  {
    cmd: 'research', icon: '🔬', label: 'Research', desc: 'Deep research on goal requirements',
    params: [],
    color: 'from-violet-500/20 to-purple-500/20'
  },
  {
    cmd: 'optimize', icon: '🔧', label: 'Optimize Profile', desc: 'Audit and optimize social profiles',
    params: [{ name: 'args', label: 'Platform', type: 'select', options: ['linkedin', 'github', 'twitter', 'all'] }],
    color: 'from-pink-500/20 to-rose-500/20',
    browser: true
  },
  {
    cmd: 'write', icon: '✍️', label: 'Write Content', desc: 'Create and publish content',
    params: [{ name: 'args', label: 'Type', type: 'select', options: ['linkedin-post', 'article', 'cross-post'] }],
    color: 'from-indigo-500/20 to-blue-500/20',
    browser: true
  },
  {
    cmd: 'engage', icon: '💬', label: 'Engage', desc: 'Engage with target audience',
    params: [{ name: 'args', label: 'Count (1-10)', type: 'number', min: 1, max: 10, default: 5 }],
    color: 'from-teal-500/20 to-cyan-500/20',
    browser: true
  },
  {
    cmd: 'contacts', icon: '👥', label: 'Contacts', desc: 'Manage your network',
    params: [],
    color: 'from-emerald-500/20 to-green-500/20'
  },
  {
    cmd: 'calendar', icon: '📅', label: 'Calendar', desc: 'Content calendar management',
    params: [],
    color: 'from-orange-500/20 to-amber-500/20'
  }
];

let activeStreamId = null;
let activeEventSource = null;

function renderCommands(state) {
  const el = document.getElementById('page-commands');

  el.innerHTML = `
    <div class="max-w-5xl">
      <h1 class="text-2xl font-bold mb-6">Commands</h1>

      <!-- Command Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" id="cmd-grid">
        ${COMMAND_SPECS.map(spec => `
          <div class="glass-card cmd-card p-4 bg-gradient-to-br ${spec.color}" data-cmd="${spec.cmd}" id="cmd-card-${spec.cmd}">
            <div class="flex items-start justify-between mb-2">
              <span class="text-2xl">${spec.icon}</span>
              ${spec.browser ? '<span class="badge badge-yellow text-[0.6rem]">Browser</span>' : ''}
            </div>
            <h3 class="font-semibold text-gray-200 mb-1">${spec.label}</h3>
            <p class="text-xs text-gray-400 mb-3">${spec.desc}</p>

            <!-- Params -->
            ${spec.params.map(p => {
              if (p.type === 'textarea') {
                return `<textarea id="param-${spec.cmd}" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/50 resize-none" rows="2" placeholder="${p.placeholder || ''}"></textarea>`;
              }
              if (p.type === 'select') {
                return `<select id="param-${spec.cmd}" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/50">
                  ${p.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>`;
              }
              if (p.type === 'number') {
                return `<input type="number" id="param-${spec.cmd}" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/50" min="${p.min}" max="${p.max}" value="${p.default || ''}">`;
              }
              return '';
            }).join('')}

            <button onclick="executeCommand('${spec.cmd}')" class="mt-3 w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium text-gray-200 transition-all">
              Run /${spec.cmd}
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Terminal Output -->
      <div class="glass-card p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">Output</h2>
          <div class="flex gap-2">
            <span id="cmd-status" class="text-xs text-gray-500"></span>
            <button onclick="clearTerminal()" class="text-xs text-gray-500 hover:text-gray-300 transition-colors">Clear</button>
          </div>
        </div>
        <div class="terminal" id="terminal">
          <span class="info">Ready. Click a command to execute.</span>
        </div>
      </div>
    </div>
  `;
}

async function executeCommand(cmd) {
  const paramEl = document.getElementById(`param-${cmd}`);
  const args = paramEl?.value || '';
  const terminal = document.getElementById('terminal');
  const statusEl = document.getElementById('cmd-status');
  const card = document.getElementById(`cmd-card-${cmd}`);

  // Close previous stream
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  // Clear terminal
  terminal.innerHTML = `<span class="info">Running /goal:${cmd}${args ? ' ' + args : ''}...</span>\n`;
  if (statusEl) statusEl.textContent = 'Running...';

  // Highlight active card
  document.querySelectorAll('.cmd-card').forEach(c => c.classList.remove('running'));
  if (card) card.classList.add('running');

  try {
    const res = await fetch(`/api/commands/${cmd}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args })
    });

    const data = await res.json();
    if (!res.ok) {
      terminal.innerHTML += `<span class="error">Error: ${escapeHtml(data.error || 'Unknown error')}</span>\n`;
      if (statusEl) statusEl.textContent = 'Error';
      return;
    }

    activeStreamId = data.streamId;

    // Connect to SSE stream
    activeEventSource = new EventSource(`/api/commands/${data.streamId}/events`);

    activeEventSource.addEventListener('log', (e) => {
      terminal.innerHTML += `<span class="log">${escapeHtml(e.data)}</span>\n`;
      terminal.scrollTop = terminal.scrollHeight;
    });

    activeEventSource.addEventListener('error', (e) => {
      if (e.data) {
        terminal.innerHTML += `<span class="error">${escapeHtml(e.data)}</span>\n`;
      }
    });

    activeEventSource.addEventListener('complete', (e) => {
      try {
        const info = JSON.parse(e.data);
        terminal.innerHTML += `\n<span class="complete">Command completed (${Math.round(info.duration / 1000)}s)</span>\n`;
      } catch {
        terminal.innerHTML += `\n<span class="complete">Command completed</span>\n`;
      }

      if (statusEl) statusEl.textContent = 'Done';
      if (card) card.classList.remove('running');
      activeEventSource.close();
      activeEventSource = null;

      // Refresh state after command completes
      if (window.refreshState) window.refreshState();
    });

    activeEventSource.onerror = () => {
      if (statusEl) statusEl.textContent = 'Disconnected';
      if (card) card.classList.remove('running');
      activeEventSource.close();
      activeEventSource = null;
    };

  } catch (err) {
    terminal.innerHTML += `<span class="error">Failed to execute: ${escapeHtml(err.message)}</span>\n`;
    if (statusEl) statusEl.textContent = 'Error';
    if (card) card.classList.remove('running');
  }
}

function clearTerminal() {
  const terminal = document.getElementById('terminal');
  if (terminal) terminal.innerHTML = '<span class="info">Ready.</span>';
}
