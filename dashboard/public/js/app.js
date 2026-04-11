/**
 * GOAL AGENT // COMMAND CENTER
 * Main Application: Router, State, WebSocket, Charts
 */

let appState = null;
let ws = null;
let currentPage = 'overview';

// ─── Utility ───

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Live Clock ───

function initClock() {
  function update() {
    const el = document.getElementById('nav-clock');
    if (!el) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  update();
  setInterval(update, 1000);
}

// ─── SVG Charts (Cyberpunk Style) ───

function svgBarChart(data, options = {}) {
  const { width = 400, height = 180, label = '' } = options;
  if (!data.length) return '';

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.floor((width - 40) / data.length) - 6;
  const chartHeight = height - 40;

  let bars = '';
  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartHeight;
    const x = 30 + i * (barWidth + 6);
    const y = chartHeight - barH + 10;
    const color = d.color || '#00d4ff';

    bars += `
      <defs>
        <linearGradient id="bar-grad-${i}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="url(#bar-grad-${i})" opacity="0.9">
        <animate attributeName="height" from="0" to="${barH}" dur="0.8s" fill="freeze"/>
        <animate attributeName="y" from="${chartHeight + 10}" to="${y}" dur="0.8s" fill="freeze"/>
        <title>${escapeHtml(d.label)}: ${d.value}</title>
      </rect>
      <rect x="${x}" y="${y}" width="${barWidth}" height="1" fill="${color}" opacity="0.8"/>`;

    if (data.length <= 12) {
      bars += `<text x="${x + barWidth / 2}" y="${height - 5}" text-anchor="middle" fill="#6a6a78" font-size="8" font-family="Rajdhani, sans-serif">${escapeHtml((d.label || '').slice(0, 8))}</text>`;
    }
  });

  return `<svg viewBox="0 0 ${width} ${height}" class="w-full">
    ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
      const y = chartHeight - pct * chartHeight + 10;
      return `<line x1="25" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(232,53,53,0.05)" stroke-width="1"/>
        <text x="22" y="${y + 3}" text-anchor="end" fill="#6a6a78" font-size="7" font-family="JetBrains Mono">${Math.round(maxVal * pct)}</text>`;
    }).join('')}
    ${bars}
  </svg>`;
}

function svgDonutChart(segments, options = {}) {
  const { size = 140, thickness = 16, label = '', centerColor = '#00d4ff' } = options;
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  let paths = '';
  let offset = 0;

  segments.forEach((seg, i) => {
    const pct = seg.value / total;
    const dashLen = circumference * pct;
    paths += `<circle cx="${center}" cy="${center}" r="${radius}" fill="none"
      stroke="${seg.color}" stroke-width="${thickness}"
      stroke-dasharray="${dashLen} ${circumference - dashLen}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${center} ${center})"
      opacity="0.8">
      <title>${escapeHtml(seg.label)}: ${seg.value}</title>
      <animate attributeName="stroke-dashoffset" from="${circumference}" to="${-offset}" dur="1s" fill="freeze"/>
    </circle>`;
    offset += dashLen;
  });

  return `<svg viewBox="0 0 ${size} ${size}" class="w-full max-w-[${size}px]">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(232,53,53,0.04)" stroke-width="${thickness}"/>
    ${paths}
    ${label ? `<text x="${center}" y="${center + 5}" text-anchor="middle" fill="${centerColor}" font-size="16" font-weight="700" font-family="Rajdhani, sans-serif">${escapeHtml(label)}</text>` : ''}
  </svg>`;
}

function svgRadarChart(dataPoints, options = {}) {
  const { size = 200, color = '#00d4ff' } = options;
  const center = size / 2;
  const radius = (size - 40) / 2;
  const n = dataPoints.length;
  if (n < 3) return '';

  const angleStep = (2 * Math.PI) / n;

  // Grid lines
  let grid = '';
  for (let ring = 1; ring <= 4; ring++) {
    const r = (radius * ring) / 4;
    const points = [];
    for (let i = 0; i < n; i++) {
      const angle = angleStep * i - Math.PI / 2;
      points.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
    }
    grid += `<polygon points="${points.join(' ')}" fill="none" stroke="rgba(232,53,53,0.06)" stroke-width="0.5"/>`;
  }

  // Axis lines
  let axes = '';
  for (let i = 0; i < n; i++) {
    const angle = angleStep * i - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    axes += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(232,53,53,0.06)" stroke-width="0.5"/>`;

    // Labels
    const lx = center + (radius + 16) * Math.cos(angle);
    const ly = center + (radius + 16) * Math.sin(angle);
    axes += `<text x="${lx}" y="${ly + 3}" text-anchor="middle" fill="#6a6a78" font-size="7" font-family="Rajdhani, sans-serif">${escapeHtml((dataPoints[i].label || '').slice(0, 8))}</text>`;
  }

  // Data polygon
  const dataCoords = [];
  for (let i = 0; i < n; i++) {
    const val = Math.min(dataPoints[i].value / (dataPoints[i].max || 10), 1);
    const angle = angleStep * i - Math.PI / 2;
    const x = center + radius * val * Math.cos(angle);
    const y = center + radius * val * Math.sin(angle);
    dataCoords.push(`${x},${y}`);
  }

  // Data points
  let dots = '';
  dataCoords.forEach((coord) => {
    const [x, y] = coord.split(',');
    dots += `<circle cx="${x}" cy="${y}" r="3" fill="${color}" opacity="0.9">
      <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
    </circle>`;
  });

  return `<svg viewBox="0 0 ${size} ${size}" class="w-full radar-chart">
    ${grid}
    ${axes}
    <polygon points="${dataCoords.join(' ')}" fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-width="1.5" stroke-opacity="0.7">
      <animate attributeName="fill-opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite"/>
    </polygon>
    ${dots}
  </svg>`;
}

function svgScoreGauge(score, maxScore = 10, label = '', color = '#00d4ff') {
  const pct = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 30;
  return `
    <div class="kpi-gauge">
      <svg viewBox="0 0 80 80" class="w-16 h-16" style="color: ${color}">
        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(232,53,53,0.06)" stroke-width="4"/>
        <circle cx="40" cy="40" r="30" fill="none" stroke="${color}" stroke-width="4"
          stroke-linecap="round" opacity="0.8"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${circumference * (1 - pct / 100)}"
          transform="rotate(-90 40 40)">
          <animate attributeName="stroke-dashoffset" from="${circumference}" to="${circumference * (1 - pct / 100)}" dur="1s" fill="freeze"/>
        </circle>
        <text x="40" y="38" text-anchor="middle" fill="${color}" font-size="14" font-weight="700" font-family="Rajdhani, sans-serif">${score}</text>
        <text x="40" y="50" text-anchor="middle" fill="#6a6a78" font-size="7" font-family="JetBrains Mono">/${maxScore}</text>
      </svg>
      <div style="font-family: Rajdhani; font-size: 0.55rem; color: #6a6a78; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">${escapeHtml(label)}</div>
    </div>
  `;
}

// ─── Enhanced Overview Charts ───

function renderOverviewCharts(state) {
  const el = document.getElementById('page-overview');
  if (!el.innerHTML || !state.goalDefined) return;

  // Remove old charts container to prevent duplicates on re-render
  const oldCharts = document.getElementById('overview-charts');
  if (oldCharts) oldCharts.remove();

  const audit = state.files['profile-audit'] || {};
  const scores = [];
  for (const [title, section] of Object.entries(audit.sections || {})) {
    const scoreMatch = section.raw?.match(/(\d+\.?\d*)\/10/);
    if (scoreMatch) {
      scores.push({ label: title, value: parseFloat(scoreMatch[1]), max: 10 });
    }
  }

  const engagement = state.files['engagement-log'] || {};
  const engagementSessions = [];
  for (const [title, section] of Object.entries(engagement.sections || {})) {
    if (section.table) {
      engagementSessions.push({ label: title.replace(/Session\s*/i, 'S'), value: section.table.length });
    }
  }

  let chartsHtml = '<div id="overview-charts" class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">';

  // Profile Radar Chart
  if (scores.length >= 3) {
    const colors = ['#00d4ff', '#e83535', '#e83535', '#e83535', '#3dd83d'];
    chartsHtml += `
      <div class="hud-panel hud-corners hud-panel-magenta">
        <div class="panel-header panel-header-magenta"><span class="dot"></span>PROFILE RADAR</div>
        <div class="p-4">
          <div class="max-w-[220px] mx-auto">
            ${svgRadarChart(scores, { size: 220, color: '#e83535' })}
          </div>
          <div class="grid grid-cols-${Math.min(scores.length, 5)} gap-2 mt-4">
            ${scores.map((s, i) => `
              <div class="text-center">
                <div class="font-display text-sm font-bold" style="color: ${colors[i % colors.length]}">${s.value}</div>
                <div class="text-[9px] font-mono text-cyber-dim uppercase">${escapeHtml(s.label).slice(0, 10)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Engagement Bar Chart
  if (engagementSessions.length) {
    chartsHtml += `
      <div class="hud-panel hud-corners hud-panel-purple">
        <div class="panel-header"><span class="dot"></span>ENGAGEMENT OPS</div>
        <div class="p-4">
          ${svgBarChart(engagementSessions, { height: 160 })}
        </div>
      </div>
    `;
  }

  // Content Distribution
  const calEntries = state.calendar || [];
  if (calEntries.length) {
    const platforms = {};
    calEntries.forEach(e => {
      const p = (e.platform || 'Other').toLowerCase();
      platforms[p] = (platforms[p] || 0) + 1;
    });
    const platformColors = { linkedin: '#0066ff', medium: '#e83535', twitter: '#00d4ff', youtube: '#e83535', github: '#6a6a78' };
    const segments = Object.entries(platforms).map(([k, v]) => ({
      label: k, value: v, color: platformColors[k] || '#6a6a78'
    }));

    chartsHtml += `
      <div class="hud-panel hud-corners">
        <div class="panel-header"><span class="dot"></span>CONTENT DISTRIBUTION</div>
        <div class="p-4 flex items-center gap-6">
          <div class="w-32">${svgDonutChart(segments, { size: 130, thickness: 14, label: calEntries.length.toString() })}</div>
          <div class="space-y-2">
            ${segments.map(s => `
              <div class="flex items-center gap-2 text-sm">
                <span class="w-2 h-2" style="background: ${s.color}; opacity: 0.8"></span>
                <span class="font-mono text-xs text-cyber-dim uppercase">${escapeHtml(s.label)}</span>
                <span class="font-display font-bold text-xs ml-auto" style="color: ${s.color}">${s.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Network Distribution
  const tiers = state.contacts || {};
  const tierEntries = Object.entries(tiers);
  if (tierEntries.length) {
    const tierColors = ['#e83535', '#00d4ff', '#e83535'];
    const segments = tierEntries.map(([name, contacts], i) => ({
      label: name.replace(/Tier \d+:?\s*/i, 'T' + (i + 1) + ' '),
      value: contacts.length,
      color: tierColors[i] || '#6a6a78'
    }));
    const totalContacts = segments.reduce((a, s) => a + s.value, 0);

    chartsHtml += `
      <div class="hud-panel hud-corners hud-panel-yellow">
        <div class="panel-header panel-header-yellow"><span class="dot"></span>NETWORK GRID</div>
        <div class="p-4 flex items-center gap-6">
          <div class="w-32">${svgDonutChart(segments, { size: 130, thickness: 14, label: totalContacts.toString(), centerColor: '#e83535' })}</div>
          <div class="space-y-2">
            ${segments.map(s => `
              <div class="flex items-center gap-2 text-sm">
                <span class="w-2 h-2" style="background: ${s.color}; opacity: 0.8"></span>
                <span class="font-mono text-xs text-cyber-dim uppercase">${escapeHtml(s.label)}</span>
                <span class="font-display font-bold text-xs ml-auto" style="color: ${s.color}">${s.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  chartsHtml += '</div>';
  el.innerHTML += chartsHtml;
}

// ─── Navigation ───

function navigate(page) {
  currentPage = page;

  document.querySelectorAll('.cp-tab').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  if (!appState) return;

  if (!appState.goalDefined && page !== 'commands') {
    document.getElementById('page-empty').classList.remove('hidden');
    renderEmpty();
    return;
  }

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.remove('hidden');

  renderPage(page);
}

function renderPage(page) {
  if (!appState) return;

  switch (page) {
    case 'overview':
      renderOverview(appState);
      renderOverviewCharts(appState);
      break;
    case 'progress':
      renderProgress(appState);
      break;
    case 'calendar':
      renderCalendar(appState);
      break;
    case 'network':
      renderNetwork(appState);
      break;
    case 'commands':
      renderCommands(appState);
      break;
  }
}

// ─── State Management ───

async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    appState = await res.json();
    updateNav();
    navigate(currentPage);
  } catch (err) {
    console.error('Failed to fetch state:', err);
  }
}

window.refreshState = fetchState;

function updateNav() {
  if (!appState) return;

  const goalName = appState.files?.['goal-definition']?.meta?.name || '';
  const progress = appState.metrics?.overall_progress || 0;
  const streak = appState.metrics?.streak || 0;
  const daysElapsed = appState.metrics?.days_elapsed || 0;

  const nameEl = document.getElementById('nav-goal-name');
  const progressEl = document.getElementById('nav-progress');
  const daysEl = document.getElementById('sidebar-days');
  const streakEl = document.getElementById('sidebar-streak');

  const cleanName = goalName.replace(/^Goal:\s*/i, '');
  if (nameEl) nameEl.textContent = cleanName;
  if (progressEl) progressEl.textContent = `${progress}%`;

  // Update browser tab title per goal
  if (cleanName) document.title = `${cleanName} // COMMAND CENTER`;
  if (daysEl) daysEl.textContent = daysElapsed;
  if (streakEl) streakEl.textContent = streak || '0';
}

// ─── WebSocket ───

let wsRetries = 0;
let pollTimer = null;

function connectWS() {
  try {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}/ws`);

    ws.onopen = () => {
      wsRetries = 0;
      const statusEl = document.getElementById('nav-status');
      if (statusEl) {
        statusEl.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-cp-green animate-pulse"></div><span class="text-[10px] font-mono text-cp-green tracking-wider uppercase">LIVE</span>';
      }
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'init' || msg.type === 'stateChange') {
          fetchState();
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      wsRetries++;
      if (wsRetries <= 3) {
        setTimeout(connectWS, 3000);
      } else {
        startPolling();
      }
    };

    ws.onerror = () => {
      try { ws.close(); } catch(e) {}
    };
  } catch (e) {
    startPolling();
  }
}

function startPolling() {
  const statusEl = document.getElementById('nav-status');
  if (statusEl) {
    statusEl.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-cp-red"></div><span class="text-[10px] font-mono text-cp-red tracking-wider uppercase">POLL</span>';
  }
  if (!pollTimer) {
    pollTimer = setInterval(fetchState, 5000);
  }
}

// ─── Router ───

function handleHashChange() {
  const hash = location.hash.replace('#', '') || 'overview';
  navigate(hash);
}

// ─── Init ───

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  fetchState();
  connectWS();

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  document.querySelectorAll('.cp-tab').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      location.hash = page;
    });
  });
});
