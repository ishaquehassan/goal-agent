/**
 * Overview dashboard panel
 */

function renderOverview(state) {
  const el = document.getElementById('page-overview');
  if (!state.goalDefined) return;

  const goal = state.files['goal-definition'] || {};
  const profile = state.files['goal-profile'] || {};
  const roadmap = state.files['strategy-roadmap'] || {};
  const metrics = state.metrics || {};
  const blockers = state.files['blockers'] || {};

  const goalName = goal.meta?.name || 'Your Goal';
  const category = goal.meta?.category || '';
  const deadline = goal.meta?.deadline || '';

  const progress = parseFloat(metrics.overall_progress) || 0;
  const daysElapsed = parseInt(metrics.days_elapsed) || 0;
  const sessions = parseInt(metrics.sessions_completed) || 0;
  const streak = parseInt(metrics.streak) || 0;

  // Calculate days remaining
  let daysRemaining = '?';
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    daysRemaining = Math.max(0, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));
  }

  // Phase data from roadmap sections
  const phases = [];
  for (const [title, section] of Object.entries(roadmap.sections || {})) {
    if (title.toLowerCase().includes('phase')) {
      const pctMatch = section.raw?.match(/(\d+)%/);
      phases.push({
        name: title,
        progress: pctMatch ? parseInt(pctMatch[1]) : 0
      });
    }
  }

  // Engagement stats from profile
  const profileSections = profile.sections || {};

  el.innerHTML = `
    <div class="max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-1">${escapeHtml(goalName.replace(/^Goal:\s*/i, ''))}</h1>
        <div class="flex items-center gap-3 text-sm text-gray-400">
          ${category ? `<span class="badge badge-blue">${escapeHtml(category)}</span>` : ''}
          ${deadline ? `<span>Deadline: ${escapeHtml(deadline)}</span>` : ''}
          <span>${daysRemaining} days remaining</span>
        </div>
      </div>

      <!-- Progress + Stats Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Progress Ring -->
        <div class="glass-card stat-card flex items-center justify-center col-span-1">
          <div class="text-center">
            <svg class="progress-ring mx-auto" width="140" height="140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
              <circle class="progress-ring__circle" cx="70" cy="70" r="60" fill="none"
                stroke="url(#gradient)" stroke-width="10" stroke-linecap="round"
                stroke-dasharray="${2 * Math.PI * 60}"
                stroke-dashoffset="${2 * Math.PI * 60 * (1 - progress / 100)}"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#a78bfa"/>
                </linearGradient>
              </defs>
              <text x="70" y="65" text-anchor="middle" fill="white" font-size="28" font-weight="700">${progress}%</text>
              <text x="70" y="85" text-anchor="middle" fill="#64748b" font-size="11">COMPLETE</text>
            </svg>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="glass-card stat-card">
            <div class="stat-value">${daysElapsed}</div>
            <div class="stat-label">Days Active</div>
          </div>
          <div class="glass-card stat-card">
            <div class="stat-value">${sessions}</div>
            <div class="stat-label">Sessions</div>
          </div>
          <div class="glass-card stat-card">
            <div class="stat-value">${streak}</div>
            <div class="stat-label">Day Streak 🔥</div>
          </div>
          <div class="glass-card stat-card">
            <div class="stat-value">${daysRemaining}</div>
            <div class="stat-label">Days Left</div>
          </div>
        </div>
      </div>

      <!-- Phases -->
      ${phases.length ? `
      <div class="glass-card p-5 mb-8">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Phase Breakdown</h2>
        <div class="space-y-4">
          ${phases.map((p, i) => {
            const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
            return `
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-300">${escapeHtml(p.name)}</span>
                  <span class="text-gray-400">${p.progress}%</span>
                </div>
                <div class="phase-bar">
                  <div class="phase-bar-fill" style="width: ${p.progress}%; background: ${colors[i % colors.length]}"></div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Blockers -->
      ${blockers.sections ? `
      <div class="glass-card p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Active Blockers</h2>
        <div class="space-y-2">
          ${Object.entries(blockers.sections).map(([title, section]) => `
            <div class="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <span class="text-red-400 mt-0.5">⚠️</span>
              <div>
                <div class="text-sm font-medium text-gray-200">${escapeHtml(title)}</div>
                <div class="text-xs text-gray-400 mt-1">${escapeHtml(section.raw?.split('\n')[0] || '')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div>
  `;
}
