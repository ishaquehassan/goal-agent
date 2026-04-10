/**
 * Goal Agent Dashboard - Main Application
 * SPA router, state management, WebSocket client, charts
 */

let appState = null;
let ws = null;
let currentPage = 'overview';

// ─── Utility ───

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── SVG Charts ───

function svgBarChart(data, options = {}) {
  const { width = 400, height = 200, barColor = '#3b82f6', label = '' } = options;
  if (!data.length) return '';

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.floor((width - 40) / data.length) - 4;
  const chartHeight = height - 40;

  let bars = '';
  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartHeight;
    const x = 30 + i * (barWidth + 4);
    const y = chartHeight - barH + 10;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="${d.color || barColor}" opacity="0.8">
      <title>${escapeHtml(d.label)}: ${d.value}</title>
    </rect>`;
    // Labels
    if (data.length <= 12) {
      bars += `<text x="${x + barWidth / 2}" y="${height - 5}" text-anchor="middle" fill="#64748b" font-size="9">${escapeHtml(d.label?.slice(0, 6) || '')}</text>`;
    }
  });

  return `<svg viewBox="0 0 ${width} ${height}" class="w-full">
    ${label ? `<text x="${width / 2}" y="12" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">${escapeHtml(label)}</text>` : ''}
    <!-- Grid lines -->
    ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
      const y = chartHeight - pct * chartHeight + 10;
      return `<line x1="25" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <text x="22" y="${y + 3}" text-anchor="end" fill="#475569" font-size="8">${Math.round(maxVal * pct)}</text>`;
    }).join('')}
    ${bars}
  </svg>`;
}

function svgDonutChart(segments, options = {}) {
  const { size = 150, thickness = 20, label = '' } = options;
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  let paths = '';
  let offset = 0;

  segments.forEach(seg => {
    const pct = seg.value / total;
    const dashLen = circumference * pct;
    paths += `<circle cx="${center}" cy="${center}" r="${radius}" fill="none"
      stroke="${seg.color}" stroke-width="${thickness}"
      stroke-dasharray="${dashLen} ${circumference - dashLen}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${center} ${center})">
      <title>${escapeHtml(seg.label)}: ${seg.value}</title>
    </circle>`;
    offset += dashLen;
  });

  return `<svg viewBox="0 0 ${size} ${size}" class="w-full max-w-[${size}px]">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="${thickness}"/>
    ${paths}
    ${label ? `<text x="${center}" y="${center + 4}" text-anchor="middle" fill="#e2e8f0" font-size="14" font-weight="700">${escapeHtml(label)}</text>` : ''}
  </svg>`;
}

function svgScoreGauge(score, maxScore = 10, label = '', color = '#3b82f6') {
  const pct = (score / maxScore) * 100;
  return `
    <div class="text-center">
      <div class="relative inline-block">
        <svg viewBox="0 0 80 80" class="w-16 h-16">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke="${color}" stroke-width="6"
            stroke-linecap="round"
            stroke-dasharray="${2 * Math.PI * 32}"
            stroke-dashoffset="${2 * Math.PI * 32 * (1 - pct / 100)}"
            transform="rotate(-90 40 40)"/>
          <text x="40" y="43" text-anchor="middle" fill="#e2e8f0" font-size="14" font-weight="700">${score}</text>
        </svg>
      </div>
      <div class="text-xs text-gray-500 mt-1">${escapeHtml(label)}</div>
    </div>
  `;
}

// ─── Enhanced Overview with Charts ───

function renderOverviewCharts(state) {
  const el = document.getElementById('page-overview');
  if (!el.innerHTML || !state.goalDefined) return;

  // Profile audit scores chart
  const audit = state.files['profile-audit'] || {};
  const scores = [];
  for (const [title, section] of Object.entries(audit.sections || {})) {
    const scoreMatch = section.raw?.match(/(\d+\.?\d*)\/10/);
    if (scoreMatch) {
      scores.push({ label: title, value: parseFloat(scoreMatch[1]) });
    }
  }

  // Engagement stats
  const engagement = state.files['engagement-log'] || {};
  const engagementSessions = [];
  for (const [title, section] of Object.entries(engagement.sections || {})) {
    if (section.table) {
      engagementSessions.push({ label: title.replace(/Session\s*/i, 'S'), value: section.table.length });
    }
  }

  // Build charts HTML
  let chartsHtml = '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">';

  // Profile Scores
  if (scores.length) {
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
    chartsHtml += `
      <div class="glass-card p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Profile Scores</h2>
        <div class="flex justify-around flex-wrap gap-4">
          ${scores.map((s, i) => svgScoreGauge(s.value, 10, s.label, colors[i % colors.length])).join('')}
        </div>
      </div>
    `;
  }

  // Engagement Chart
  if (engagementSessions.length) {
    chartsHtml += `
      <div class="glass-card p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Engagement per Session</h2>
        ${svgBarChart(engagementSessions, { height: 160, barColor: '#8b5cf6' })}
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
    const platformColors = { linkedin: '#0077b5', medium: '#8b5cf6', twitter: '#1da1f2', youtube: '#ff0000', github: '#6e7681' };
    const segments = Object.entries(platforms).map(([k, v]) => ({
      label: k, value: v, color: platformColors[k] || '#64748b'
    }));

    chartsHtml += `
      <div class="glass-card p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Content by Platform</h2>
        <div class="flex items-center gap-6">
          <div class="w-32">${svgDonutChart(segments, { size: 120, thickness: 18, label: calEntries.length.toString() })}</div>
          <div class="space-y-2">
            ${segments.map(s => `
              <div class="flex items-center gap-2 text-sm">
                <span class="w-3 h-3 rounded-full" style="background: ${s.color}"></span>
                <span class="text-gray-400">${escapeHtml(s.label)}</span>
                <span class="text-gray-500 ml-auto">${s.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Contact Tiers
  const tiers = state.contacts || {};
  const tierEntries = Object.entries(tiers);
  if (tierEntries.length) {
    const tierColors = ['#f59e0b', '#3b82f6', '#8b5cf6'];
    const segments = tierEntries.map(([name, contacts], i) => ({
      label: name.replace(/Tier \d+:?\s*/i, 'T' + (i + 1) + ' '),
      value: contacts.length,
      color: tierColors[i] || '#64748b'
    }));
    const totalContacts = segments.reduce((a, s) => a + s.value, 0);

    chartsHtml += `
      <div class="glass-card p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Network Distribution</h2>
        <div class="flex items-center gap-6">
          <div class="w-32">${svgDonutChart(segments, { size: 120, thickness: 18, label: totalContacts.toString() })}</div>
          <div class="space-y-2">
            ${segments.map(s => `
              <div class="flex items-center gap-2 text-sm">
                <span class="w-3 h-3 rounded-full" style="background: ${s.color}"></span>
                <span class="text-gray-400">${escapeHtml(s.label)}</span>
                <span class="text-gray-500 ml-auto">${s.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  chartsHtml += '</div>';

  // Append charts after existing overview content
  el.innerHTML += chartsHtml;
}

// ─── Navigation ───

function navigate(page) {
  currentPage = page;

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Show/hide pages
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  if (!appState?.goalDefined && page !== 'commands') {
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
    renderPage(currentPage);
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

  if (nameEl) nameEl.textContent = goalName.replace(/^Goal:\s*/i, '');
  if (progressEl) progressEl.textContent = `${progress}%`;
  if (daysEl) daysEl.textContent = `Day ${daysElapsed}`;
  if (streakEl) streakEl.textContent = streak ? `🔥 ${streak} day streak` : '';
}

// ─── WebSocket ───

function connectWS() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${location.host}/ws`);

  ws.onopen = () => {
    const statusEl = document.getElementById('nav-status');
    if (statusEl) {
      statusEl.textContent = 'Connected';
      statusEl.className = 'text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400';
    }
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'init' || msg.type === 'stateChange') {
        // Re-fetch full state on change
        fetchState();
      }
    } catch (e) {}
  };

  ws.onclose = () => {
    const statusEl = document.getElementById('nav-status');
    if (statusEl) {
      statusEl.textContent = 'Reconnecting...';
      statusEl.className = 'text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400';
    }
    // Reconnect after 3s
    setTimeout(connectWS, 3000);
  };

  ws.onerror = () => ws.close();
}

// ─── Router ───

function handleHashChange() {
  const hash = location.hash.replace('#', '') || 'overview';
  navigate(hash);
}

// ─── Init ───

document.addEventListener('DOMContentLoaded', () => {
  // Fetch initial state
  fetchState();

  // Connect WebSocket
  connectWS();

  // Router
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  // Nav link clicks
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      location.hash = page;
    });
  });
});
