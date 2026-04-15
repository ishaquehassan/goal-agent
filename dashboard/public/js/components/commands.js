/**
 * TERMINAL // Command Center
 * Split-panel: Left command palette + Right terminal hero
 * Keyboard-first, one-click execution, grouped commands
 */

const COMMAND_SPECS = [
  // QUICK OPS
  { cmd: 'next', icon: '\u25B6', label: 'NEXT OPS', desc: 'Priority actions for today', group: 'QUICK OPS', color: '#3dd83d', params: [] },
  { cmd: 'status', icon: '\u25A3', label: 'SITREP', desc: 'Full situation report', group: 'QUICK OPS', color: '#00d4ff', params: [] },
  { cmd: 'log', icon: '\u25C8', label: 'LOG OPS', desc: 'Record completed operations', group: 'QUICK OPS', color: '#e83535',
    params: [{ name: 'args', label: 'What did you do?', type: 'textarea', placeholder: '"commented on 3 posts, published article"' }] },

  // CONTENT
  { cmd: 'write', icon: '\u25A1', label: 'COMPOSE', desc: 'Create and deploy content', group: 'CONTENT', color: '#0066ff',
    params: [{ name: 'args', label: 'Type', type: 'select', options: ['linkedin-post', 'article', 'cross-post'] }] },
  { cmd: 'engage', icon: '\u25C6', label: 'ENGAGE', desc: 'Target audience interaction', group: 'CONTENT', color: '#00d4ff', browser: true,
    params: [{ name: 'args', label: 'Count (1-10)', type: 'number', min: 1, max: 10, default: 5 }] },

  // NETWORK
  { cmd: 'optimize', icon: '\u25C7', label: 'OPTIMIZE', desc: 'Profile enhancement ops', group: 'NETWORK', color: '#e83535', browser: true,
    params: [{ name: 'args', label: 'Target', type: 'select', options: ['linkedin', 'github', 'twitter', 'all'] }] },
  { cmd: 'research', icon: '\u25D4', label: 'RECON', desc: 'Deep intelligence gathering', group: 'NETWORK', color: '#e83535', params: [] },
  { cmd: 'contacts', icon: '\u25CB', label: 'CONTACTS', desc: 'Manage intel assets', group: 'NETWORK', color: '#3dd83d', params: [] },
  { cmd: 'calendar', icon: '\u25A0', label: 'PIPELINE', desc: 'Content pipeline management', group: 'NETWORK', color: '#e83535', params: [] },

  // SYSTEM
  { cmd: 'set', icon: '\u25CE', label: 'INIT GOAL', desc: 'Initialize a new mission', group: 'SYSTEM', color: '#e83535',
    params: [{ name: 'args', label: 'Mission objective', type: 'textarea', placeholder: '"Become a Flutter GDE in 6 months"' }] },
  { cmd: 'contribute', icon: '\u2B06', label: 'CONTRIBUTE', desc: 'Submit session learnings as PR', group: 'SYSTEM', color: '#3dd83d', params: [] },
  { cmd: 'update', icon: '\u21BB', label: 'UPDATE', desc: 'Update plugin to latest version', group: 'SYSTEM', color: '#00d4ff', params: [] }
];

const GROUPS = ['QUICK OPS', 'CONTENT', 'NETWORK', 'SYSTEM'];
const GROUP_ICONS = { 'QUICK OPS': '\u26A1', 'CONTENT': '\u270E', 'NETWORK': '\u25C9', 'SYSTEM': '\u2699' };
const GROUP_COLORS = { 'QUICK OPS': '#3dd83d', 'CONTENT': '#00d4ff', 'NETWORK': '#e83535', 'SYSTEM': '#e83535' };

let activeStreamId = null;
let activeEventSource = null;
let selectedCmd = null;
let runningCmd = null;
let commandHistory = [];
let paletteVisible = false;
let _commandsInitialized = false;

// Per-directory localStorage key prefix (isolates multiple goal dashboards)
function storageKey(name) {
  // Use port as unique identifier per instance (each dir gets different port)
  const port = location.port || '8080';
  return `goal-agent-${port}-${name}`;
}

// Terminal content persistence (survives re-renders AND page reloads)
function saveTerminalContent() {
  const terminal = document.getElementById('terminal');
  if (terminal) {
    try { localStorage.setItem(storageKey('terminal'), terminal.innerHTML); } catch {}
  }
}

function loadTerminalContent() {
  try { return localStorage.getItem(storageKey('terminal')) || ''; } catch { return ''; }
}

// Load recent from localStorage
function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(storageKey('recent')) || '[]').slice(0, 5);
  } catch { return []; }
}

function saveRecent(cmd, args) {
  const recent = loadRecent().filter(r => r.cmd !== cmd);
  recent.unshift({ cmd, args, time: Date.now() });
  localStorage.setItem(storageKey('recent'), JSON.stringify(recent.slice(0, 5)));
}

function getSpec(cmd) {
  return COMMAND_SPECS.find(s => s.cmd === cmd);
}

function renderCommands(state) {
  const el = document.getElementById('page-commands');

  // Only render DOM structure ONCE. After that, just update dynamic parts.
  if (_commandsInitialized && document.getElementById('terminal')) {
    // Just update recent section
    updateRecentSection();
    return;
  }
  _commandsInitialized = true;

  const recent = loadRecent();

  el.innerHTML = `
    <!-- Split Panel Layout -->
    <div class="flex gap-0 h-[calc(100vh-9rem)]">

      <!-- LEFT: Command Panel -->
      <div class="cmd-panel w-[260px] shrink-0 flex flex-col overflow-hidden" style="background: var(--surface); border-right: 1px solid var(--border)">
        <!-- Search -->
        <div class="p-3 border-b border-cp-border">
          <div class="cmd-search-box">
            <svg class="cmd-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="cmd-search" class="cmd-search-input" placeholder="Search... (Ctrl+K)" autocomplete="off" spellcheck="false">
            <kbd class="cmd-kbd">Ctrl K</kbd>
          </div>
        </div>

        <!-- Command Groups -->
        <div class="flex-1 overflow-y-auto py-2 px-2" id="cmd-list">
          ${GROUPS.map(group => {
            const cmds = COMMAND_SPECS.filter(s => s.group === group);
            const groupColor = GROUP_COLORS[group];
            return `
              <div class="mb-3">
                <div class="cmd-group-header" style="color: ${groupColor}">
                  <span class="opacity-60">${GROUP_ICONS[group]}</span>
                  ${group}
                </div>
                ${cmds.map(spec => `
                  <div class="cmd-item" data-cmd="${spec.cmd}" onclick="handleCmdClick('${spec.cmd}')" title="${spec.desc}">
                    <span class="cmd-item-icon" style="color: ${spec.color}">${spec.icon}</span>
                    <span class="cmd-item-label">${spec.label}</span>
                    ${spec.browser ? '<span class="cmd-item-tag">BRW</span>' : ''}
                    ${spec.params.length ? '<span class="cmd-item-param-dot" style="background: ' + spec.color + '"></span>' : ''}
                  </div>
                `).join('')}
              </div>`;
          }).join('')}
        </div>

        <!-- Recent -->
        <div id="cmd-recent-section" class="border-t border-cp-border p-3 ${recent.length ? '' : 'hidden'}">
          ${recent.length ? `
            <div class="cmd-group-header" style="color: #6a6a78">\u23F1 RECENT</div>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              ${recent.map(r => {
                const spec = getSpec(r.cmd);
                return spec ? `
                  <button class="cmd-recent-btn" onclick="handleRecentClick('${r.cmd}', '${escapeHtml(r.args || '')}')" style="border-color: ${spec.color}30; color: ${spec.color}">
                    ${spec.icon} ${spec.label}
                  </button>` : '';
              }).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Shortcuts hint -->
        <div class="border-t border-cp-border px-3 py-2">
          <div class="flex items-center justify-between text-[9px] font-mono text-cp-dim">
            <span>Enter: run</span>
            <span>Ctrl+L: clear</span>
            <span>Esc: cancel</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Terminal Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Terminal Header -->
        <div class="flex-1 flex flex-col overflow-hidden" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="flex items-center" style="padding: 8px 14px; border-bottom: 1px solid var(--border); font-family: Rajdhani, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--cyan)">
            <span>OUTPUT_STREAM</span>
            <div class="ml-auto flex items-center gap-3">
              <span id="cmd-run-indicator" class="hidden">
                <span class="cmd-running-dot"></span>
                <span id="cmd-run-label" class="text-[10px] font-mono text-cp-cyan uppercase tracking-wider"></span>
              </span>
              <span id="cmd-status" class="text-[9px] font-mono text-cp-dim uppercase tracking-wider"></span>
              <button onclick="clearTerminal()" class="text-[9px] font-mono text-cp-dim hover:text-cp-green transition-colors uppercase tracking-wider">Clear</button>
            </div>
          </div>

          <!-- Terminal Output (HERO) -->
          <div class="flex-1 relative overflow-hidden">
            <div class="cyber-terminal terminal-full" id="terminal"><span class="info">// SYSTEM READY</span><br><span class="info">// Select a command or press Ctrl+K to search</span></div>
            <button id="scroll-bottom-btn" class="cmd-scroll-btn hidden" onclick="scrollTerminalBottom()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><polyline points="6,9 12,15 18,9"/></svg>
            </button>
          </div>

          <!-- Input Bar (conditional, shown when param command selected) -->
          <div id="cmd-input-bar" class="cmd-input-bar hidden">
            <div class="flex items-center gap-3 p-3">
              <span id="input-bar-badge" class="cmd-input-badge"></span>
              <div class="flex-1" id="input-bar-field"></div>
              <button id="input-bar-exec" onclick="executeSelectedCommand()" class="cmd-exec-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><polygon points="5,3 19,12 5,21"/></svg>
                EXECUTE
              </button>
              <button onclick="hideInputBar()" class="cmd-cancel-btn">ESC</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Command Palette Overlay -->
    <div id="cmd-palette" class="cmd-palette-overlay hidden">
      <div class="cmd-palette-box">
        <div class="cmd-palette-search-wrap">
          <svg class="w-5 h-5 text-cp-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="palette-search" class="cmd-palette-input" placeholder="Type a command..." autocomplete="off" spellcheck="false">
          <kbd class="cmd-kbd">ESC</kbd>
        </div>
        <div id="palette-results" class="cmd-palette-results"></div>
      </div>
    </div>
  `;

  // Restore terminal content from localStorage and scroll to bottom
  const savedContent = loadTerminalContent();
  if (savedContent) {
    const terminal = document.getElementById('terminal');
    if (terminal) {
      terminal.innerHTML = savedContent;
      setTimeout(() => { terminal.scrollTop = terminal.scrollHeight; }, 50);
    }
  }

  // Setup event listeners
  setupKeyboardShortcuts();
  setupSearchFilter();
  setupTerminalScroll();
}

// ─── Update Recent Section (without full re-render) ───

function updateRecentSection() {
  const recent = loadRecent();
  const recentContainer = document.getElementById('cmd-recent-section');
  if (!recentContainer) return;

  if (recent.length) {
    recentContainer.innerHTML = `
      <div class="cmd-group-header" style="color: #6a6a78">\u23F1 RECENT</div>
      <div class="flex flex-wrap gap-1.5 mt-1.5">
        ${recent.map(r => {
          const spec = getSpec(r.cmd);
          return spec ? `
            <button class="cmd-recent-btn" onclick="handleRecentClick('${r.cmd}', '${escapeHtml(r.args || '')}')" style="border-color: ${spec.color}30; color: ${spec.color}">
              ${spec.icon} ${spec.label}
            </button>` : '';
        }).join('')}
      </div>
    `;
    recentContainer.classList.remove('hidden');
  }
}

// ─── Command Selection & Execution ───

function handleCmdClick(cmd) {
  const spec = getSpec(cmd);
  if (!spec) return;

  // Highlight in panel
  document.querySelectorAll('.cmd-item').forEach(el => el.classList.remove('active'));
  const item = document.querySelector(`.cmd-item[data-cmd="${cmd}"]`);
  if (item) item.classList.add('active');

  if (spec.params.length === 0) {
    // No params needed, execute immediately
    selectedCmd = cmd;
    executeSelectedCommand();
  } else {
    // Show input bar
    selectedCmd = cmd;
    showInputBar(spec);
  }
}

function showBrowserCommandBar(spec) {
  const bar = document.getElementById('cmd-input-bar');
  const badge = document.getElementById('input-bar-badge');
  const field = document.getElementById('input-bar-field');
  const execBtn = document.getElementById('input-bar-exec');

  badge.innerHTML = `<span style="color: ${spec.color}">${spec.icon}</span> ${spec.label}`;
  badge.style.borderColor = spec.color + '40';
  badge.style.color = spec.color;

  const p = spec.params[0];
  let paramHtml = '';
  if (p) {
    if (p.type === 'select') {
      paramHtml = `<select id="cmd-param-input" class="cmd-param-field" style="max-width: 140px">
        ${p.options.map(o => `<option value="${o}">${o.toUpperCase()}</option>`).join('')}
      </select>`;
    } else if (p.type === 'number') {
      paramHtml = `<input type="number" id="cmd-param-input" class="cmd-param-field" style="max-width: 80px" min="${p.min}" max="${p.max}" value="${p.default || ''}">`;
    }
  }

  field.innerHTML = `
    <div class="flex items-center gap-3">
      ${paramHtml}
      <span class="text-[10px] font-mono text-cp-red">BROWSER REQUIRED</span>
    </div>
  `;

  // Change execute button to copy
  execBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> COPY CMD`;
  execBtn.onclick = () => copyBrowserCommand(spec);

  bar.classList.remove('hidden');
}

function copyBrowserCommand(spec) {
  const paramInput = document.getElementById('cmd-param-input');
  const args = paramInput?.value || '';
  const fullCmd = `/goal:${spec.cmd}${args ? ' ' + args : ''}`;

  navigator.clipboard.writeText(fullCmd).then(() => {
    const terminal = document.getElementById('terminal');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    terminal.innerHTML += `\n<span class="cmd-divider"></span>\n<span class="prompt">$</span> <span class="info">${escapeHtml(fullCmd)}</span>  <span class="timestamp">${timeStr}</span>\n<span class="complete">// COPIED TO CLIPBOARD. Paste in your main Claude Code terminal.</span>\n<span class="info">// Browser commands need Chrome MCP which only connects to your active terminal session.</span>\n`;
    terminal.scrollTop = terminal.scrollHeight;
    saveTerminalContent();

    // Reset execute button after copy
    const execBtn = document.getElementById('input-bar-exec');
    execBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><polyline points="20,6 9,17 4,12"/></svg> COPIED!`;
    setTimeout(() => {
      hideInputBar();
      // Reset exec button for next use
      execBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><polygon points="5,3 19,12 5,21"/></svg> EXECUTE`;
      execBtn.onclick = () => executeSelectedCommand();
    }, 1500);
  });
}

function handleRecentClick(cmd, args) {
  const spec = getSpec(cmd);
  if (!spec) return;

  document.querySelectorAll('.cmd-item').forEach(el => el.classList.remove('active'));
  const item = document.querySelector(`.cmd-item[data-cmd="${cmd}"]`);
  if (item) item.classList.add('active');

  if (spec.params.length === 0 || args) {
    selectedCmd = cmd;
    executeCommand(cmd, args);
  } else {
    selectedCmd = cmd;
    showInputBar(spec);
  }
}

function showInputBar(spec) {
  const bar = document.getElementById('cmd-input-bar');
  const badge = document.getElementById('input-bar-badge');
  const field = document.getElementById('input-bar-field');

  badge.innerHTML = `<span style="color: ${spec.color}">${spec.icon}</span> ${spec.label}`;
  badge.style.borderColor = spec.color + '40';
  badge.style.color = spec.color;

  const p = spec.params[0];
  let inputHtml = '';
  if (p.type === 'textarea') {
    inputHtml = `<input type="text" id="cmd-param-input" class="cmd-param-field" placeholder="${p.placeholder || p.label}" autofocus>`;
  } else if (p.type === 'select') {
    inputHtml = `<select id="cmd-param-input" class="cmd-param-field" autofocus>
      ${p.options.map(o => `<option value="${o}">${o.toUpperCase()}</option>`).join('')}
    </select>`;
  } else if (p.type === 'number') {
    inputHtml = `<input type="number" id="cmd-param-input" class="cmd-param-field" min="${p.min}" max="${p.max}" value="${p.default || ''}" placeholder="${p.label}" autofocus>`;
  }
  field.innerHTML = inputHtml;

  bar.classList.remove('hidden');

  // Focus input
  setTimeout(() => {
    const input = document.getElementById('cmd-param-input');
    if (input) input.focus();
  }, 50);

  // Enter to execute on input
  const input = document.getElementById('cmd-param-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        executeSelectedCommand();
      }
      if (e.key === 'Escape') {
        hideInputBar();
      }
    });
  }
}

function hideInputBar() {
  const bar = document.getElementById('cmd-input-bar');
  bar.classList.add('hidden');
  selectedCmd = null;
  document.querySelectorAll('.cmd-item').forEach(el => el.classList.remove('active'));
}

function executeSelectedCommand() {
  if (!selectedCmd) return;
  const paramInput = document.getElementById('cmd-param-input');
  const args = paramInput?.value || '';
  executeCommand(selectedCmd, args);
  // Hide input bar after execution
  const bar = document.getElementById('cmd-input-bar');
  if (bar) bar.classList.add('hidden');
}

async function executeCommand(cmd, args) {
  const spec = getSpec(cmd);
  if (!spec) return;

  const terminal = document.getElementById('terminal');
  const statusEl = document.getElementById('cmd-status');
  const runIndicator = document.getElementById('cmd-run-indicator');
  const runLabel = document.getElementById('cmd-run-label');

  // Close previous stream
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  // Save to recent
  saveRecent(cmd, args);

  // Update running state
  runningCmd = cmd;
  document.querySelectorAll('.cmd-item').forEach(el => {
    el.classList.remove('active', 'running');
  });
  const item = document.querySelector(`.cmd-item[data-cmd="${cmd}"]`);
  if (item) {
    item.classList.add('running');
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Show running indicator
  if (runIndicator) runIndicator.classList.remove('hidden');
  if (runLabel) runLabel.textContent = spec.label;
  if (statusEl) statusEl.textContent = '';

  // Add command divider in terminal
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const browserWarning = spec.browser ? `\n<span class="info" style="color: #e83535">// NOTE: This command needs browser access. If it hangs, run from your main terminal.</span>` : '';

  terminal.innerHTML += `\n<span class="cmd-divider"></span>\n<span class="prompt">$</span> <span class="info">goal:${cmd}${args ? ' ' + escapeHtml(args) : ''}</span>  <span class="timestamp">${timeStr}</span>${browserWarning}\n<span class="executing">// EXECUTING<span class="cmd-dots"></span></span>\n`;
  terminal.scrollTop = terminal.scrollHeight;
  saveTerminalContent();

  try {
    const res = await fetch(`/api/commands/${cmd}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args })
    });

    const data = await res.json();
    if (!res.ok) {
      terminal.innerHTML += `<span class="error">ERROR: ${escapeHtml(data.error || 'Unknown error')}</span>\n`;
      finishExecution('ERROR', cmd);
      return;
    }

    activeStreamId = data.streamId;
    activeEventSource = new EventSource(`/api/commands/${data.streamId}/events`);

    activeEventSource.addEventListener('log', (e) => {
      // Remove executing dots
      const dots = terminal.querySelector('.executing');
      if (dots) dots.remove();

      terminal.innerHTML += `<span class="log">${escapeHtml(e.data)}</span>\n`;
      terminal.scrollTop = terminal.scrollHeight;
      saveTerminalContent();
    });

    activeEventSource.addEventListener('error', (e) => {
      if (e.data) {
        terminal.innerHTML += `<span class="error">${escapeHtml(e.data)}</span>\n`;
      }
    });

    activeEventSource.addEventListener('complete', (e) => {
      try {
        const info = JSON.parse(e.data);
        terminal.innerHTML += `\n<span class="complete">// OPERATION COMPLETE (${Math.round(info.duration / 1000)}s)</span>\n`;
      } catch {
        terminal.innerHTML += `\n<span class="complete">// OPERATION COMPLETE</span>\n`;
      }
      terminal.scrollTop = terminal.scrollHeight;
      saveTerminalContent();
      activeEventSource.close();
      activeEventSource = null;
      finishExecution('DONE', cmd);
      if (window.refreshState) window.refreshState();
    });

    activeEventSource.onerror = () => {
      activeEventSource.close();
      activeEventSource = null;
      finishExecution('DISCONNECTED', cmd);
    };

  } catch (err) {
    terminal.innerHTML += `<span class="error">FATAL: ${escapeHtml(err.message)}</span>\n`;
    finishExecution('ERROR', cmd);
  }
}

function finishExecution(status, cmd) {
  const statusEl = document.getElementById('cmd-status');
  const runIndicator = document.getElementById('cmd-run-indicator');

  if (statusEl) statusEl.textContent = status;
  if (runIndicator) runIndicator.classList.add('hidden');

  runningCmd = null;
  document.querySelectorAll('.cmd-item').forEach(el => el.classList.remove('running'));

  // Refresh recent display
  updateRecentSection();
}

function clearTerminal() {
  const terminal = document.getElementById('terminal');
  if (terminal) terminal.innerHTML = '<span class="info">// SYSTEM READY</span>';
  const statusEl = document.getElementById('cmd-status');
  if (statusEl) statusEl.textContent = '';
  saveTerminalContent();
}

function scrollTerminalBottom() {
  const terminal = document.getElementById('terminal');
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
  const btn = document.getElementById('scroll-bottom-btn');
  if (btn) btn.classList.add('hidden');
}

// ─── Search & Filter ───

function setupSearchFilter() {
  const search = document.getElementById('cmd-search');
  if (!search) return;

  search.addEventListener('input', (e) => {
    filterCommands(e.target.value);
  });

  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // Execute first visible command
      const firstVisible = document.querySelector('.cmd-item:not(.cmd-hidden)');
      if (firstVisible) {
        handleCmdClick(firstVisible.dataset.cmd);
        search.value = '';
        filterCommands('');
      }
    }
    if (e.key === 'Escape') {
      search.value = '';
      filterCommands('');
      search.blur();
    }
  });
}

function filterCommands(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.cmd-item').forEach(item => {
    const cmd = item.dataset.cmd;
    const spec = getSpec(cmd);
    if (!spec) return;
    const match = !q || spec.label.toLowerCase().includes(q) || spec.cmd.includes(q) || spec.desc.toLowerCase().includes(q) || spec.group.toLowerCase().includes(q);
    item.classList.toggle('cmd-hidden', !match);
  });

  // Hide empty groups
  document.querySelectorAll('#cmd-list > div').forEach(group => {
    const visibleItems = group.querySelectorAll('.cmd-item:not(.cmd-hidden)');
    group.style.display = visibleItems.length ? '' : 'none';
  });
}

// ─── Command Palette ───

function showPalette() {
  paletteVisible = true;
  const palette = document.getElementById('cmd-palette');
  const input = document.getElementById('palette-search');
  palette.classList.remove('hidden');
  input.value = '';
  input.focus();
  renderPaletteResults('');

  input.addEventListener('input', (e) => renderPaletteResults(e.target.value));
  input.addEventListener('keydown', handlePaletteKeydown);

  // Close on backdrop click
  palette.addEventListener('click', (e) => {
    if (e.target === palette) hidePalette();
  });
}

function hidePalette() {
  paletteVisible = false;
  const palette = document.getElementById('cmd-palette');
  palette.classList.add('hidden');
}

function renderPaletteResults(query) {
  const results = document.getElementById('palette-results');
  const q = query.toLowerCase().trim();

  const filtered = COMMAND_SPECS.filter(s =>
    !q || s.label.toLowerCase().includes(q) || s.cmd.includes(q) || s.desc.toLowerCase().includes(q)
  );

  results.innerHTML = filtered.map((spec, i) => `
    <div class="cmd-palette-item ${i === 0 ? 'active' : ''}" data-cmd="${spec.cmd}" onclick="selectPaletteItem('${spec.cmd}')">
      <span class="cmd-palette-item-icon" style="color: ${spec.color}">${spec.icon}</span>
      <div class="flex-1">
        <span class="cmd-palette-item-label">${spec.label}</span>
        <span class="cmd-palette-item-desc">${spec.desc}</span>
      </div>
      <span class="cmd-palette-item-group">${spec.group}</span>
      ${spec.params.length ? '<span class="cmd-palette-item-param">PARAM</span>' : ''}
    </div>
  `).join('');
}

let paletteIndex = 0;

function handlePaletteKeydown(e) {
  const items = document.querySelectorAll('.cmd-palette-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    paletteIndex = Math.min(paletteIndex + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('active', i === paletteIndex));
    items[paletteIndex]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    paletteIndex = Math.max(paletteIndex - 1, 0);
    items.forEach((el, i) => el.classList.toggle('active', i === paletteIndex));
    items[paletteIndex]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const active = items[paletteIndex];
    if (active) selectPaletteItem(active.dataset.cmd);
  } else if (e.key === 'Escape') {
    hidePalette();
  } else {
    paletteIndex = 0;
  }
}

function selectPaletteItem(cmd) {
  hidePalette();
  handleCmdClick(cmd);
}

// ─── Keyboard Shortcuts ───

function setupKeyboardShortcuts() {
  // Remove old listener if exists
  if (window._cmdKeyHandler) {
    document.removeEventListener('keydown', window._cmdKeyHandler);
  }

  window._cmdKeyHandler = (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const mod = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl+K: Command palette
    if (mod && e.key === 'k') {
      e.preventDefault();
      if (paletteVisible) hidePalette();
      else showPalette();
      return;
    }

    // Ctrl+L: Clear terminal
    if (mod && e.key === 'l') {
      e.preventDefault();
      clearTerminal();
      return;
    }

    // Escape: hide palette or input bar
    if (e.key === 'Escape') {
      if (paletteVisible) { hidePalette(); return; }
      hideInputBar();
      return;
    }
  };

  document.addEventListener('keydown', window._cmdKeyHandler);
}

// ─── Terminal Scroll Detection ───

function setupTerminalScroll() {
  setTimeout(() => {
    const terminal = document.getElementById('terminal');
    const btn = document.getElementById('scroll-bottom-btn');
    if (!terminal || !btn) return;

    terminal.addEventListener('scroll', () => {
      const isAtBottom = terminal.scrollHeight - terminal.scrollTop - terminal.clientHeight < 50;
      btn.classList.toggle('hidden', isAtBottom);
    });
  }, 100);
}
