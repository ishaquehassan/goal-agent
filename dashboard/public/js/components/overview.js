/**
 * CMD // Mission Overview
 * CP2077 equipment-style stacked sections
 */

function generateSmartOps(state, metrics) {
  const actions = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dayOfWeek = now.getDay();

  const calendar = state.calendar || [];
  const overdue = calendar.filter(e => {
    const s = (e.status || '').toLowerCase();
    return s.includes('overdue') || s.includes('planned');
  });
  if (overdue.length) {
    const item = overdue[0];
    const platform = (item.platform || '').toLowerCase();
    if (platform.includes('medium') || (item.type || '').toLowerCase().includes('article')) {
      actions.push({ priority: 1, label: `Write: ${item.topic || 'Medium Article'}`, desc: item.status?.toLowerCase().includes('overdue') ? 'OVERDUE' : 'Due soon', cmd: 'write', args: 'article', urgent: true });
    }
    if (platform.includes('linkedin') && (item.type || '').toLowerCase().includes('post')) {
      actions.push({ priority: 2, label: `Write: ${item.topic || 'LinkedIn Post'}`, desc: item.status?.toLowerCase().includes('overdue') ? 'OVERDUE' : 'Scheduled', cmd: 'write', args: 'linkedin-post', urgent: item.status?.toLowerCase().includes('overdue') });
    }
  }

  const engagement = state.files['engagement-log'] || {};
  let totalEngagements = 0;
  for (const [, section] of Object.entries(engagement.sections || {})) {
    if (section.table) totalEngagements += section.table.length;
  }
  const roadmap = state.files['strategy-roadmap'] || {};
  let engagementTarget = 100;
  for (const [title, section] of Object.entries(roadmap.sections || {})) {
    if (title.toLowerCase().includes('kpi') && section.table) {
      section.table.forEach(row => {
        const metric = (row.Metric || row.metric || Object.values(row)[0] || '').toLowerCase();
        if (metric.includes('engagement') || metric.includes('linkedin')) {
          engagementTarget = parseInt(row.Target || row.target || Object.values(row)[1]) || 100;
        }
      });
    }
  }
  const engagementPct = Math.round((totalEngagements / engagementTarget) * 100);
  if (engagementPct < 80 && dayOfWeek >= 1 && dayOfWeek <= 5) {
    actions.push({ priority: 3, label: 'Engage: LinkedIn (5 interactions)', desc: `${totalEngagements}/${engagementTarget} (${engagementPct}%)`, cmd: 'engage', args: '5' });
  }

  const tracker = state.files['progress-tracker'] || {};
  const todayLogged = Object.keys(tracker.sections || {}).some(title => {
    const section = tracker.sections[title];
    return section.raw?.includes(today) || section.raw?.includes(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  });
  if (!todayLogged && metrics.sessions > 0) {
    actions.push({ priority: 5, label: "Log today's work", desc: 'No session logged today', cmd: 'log', args: '', needsInput: true });
  }

  const audit = state.files['profile-audit'] || {};
  const lowScores = [];
  for (const [title, section] of Object.entries(audit.sections || {})) {
    const scoreMatch = section.raw?.match(/(\d+\.?\d*)\/10/);
    if (scoreMatch && parseFloat(scoreMatch[1]) < 6) {
      lowScores.push({ platform: title, score: parseFloat(scoreMatch[1]) });
    }
  }
  if (lowScores.length) {
    const worst = lowScores.sort((a, b) => a.score - b.score)[0];
    actions.push({ priority: 4, label: `Optimize: ${worst.platform} (${worst.score}/10)`, desc: 'Low profile score', cmd: 'optimize', args: worst.platform.toLowerCase() });
  }

  if (metrics.streak === 0 && metrics.daysElapsed > 0) {
    actions.push({ priority: 6, label: "Get today's priorities", desc: 'Start your streak!', cmd: 'next', args: '' });
  }

  const contacts = state.contacts || {};
  let pendingContacts = 0;
  for (const [, tier] of Object.entries(contacts)) {
    tier.forEach(c => {
      const status = Object.values(c).find(v => typeof v === 'string' && (v.toLowerCase().includes('pending') || v.toLowerCase().includes('cooldown')));
      if (status) pendingContacts++;
    });
  }
  if (pendingContacts > 0) {
    actions.push({ priority: 7, label: `Review ${pendingContacts} pending contacts`, desc: 'Follow-up needed', cmd: 'contacts', args: '' });
  }

  if (actions.length === 0) {
    actions.push({ priority: 10, label: 'Get next priorities', desc: 'All caught up!', cmd: 'next', args: '' });
  }

  actions.sort((a, b) => a.priority - b.priority);
  return actions;
}

function smartOpClick(cmd, args, needsInput) {
  location.hash = 'commands';
  setTimeout(() => {
    if (needsInput) {
      const spec = COMMAND_SPECS?.find(s => s.cmd === cmd);
      if (spec) { selectedCmd = cmd; showInputBar(spec); }
    } else {
      handleCmdClick(cmd);
    }
  }, 100);
}

function renderOverview(state) {
  const el = document.getElementById('page-overview');
  if (!state.goalDefined) return;

  const goal = state.files['goal-definition'] || {};
  const roadmap = state.files['strategy-roadmap'] || {};
  const metrics = state.metrics || {};
  const blockers = state.files['blockers'] || {};

  const goalName = (goal.meta?.name || 'Your Goal').replace(/^Goal:\s*/i, '');
  const category = goal.meta?.category || '';
  const deadline = goal.meta?.deadline || '';
  const progress = parseFloat(metrics.overall_progress) || 0;
  const daysElapsed = parseInt(metrics.days_elapsed) || 0;
  const sessions = parseInt(metrics.sessions_completed) || 0;
  const streak = parseInt(metrics.streak) || 0;

  let daysRemaining = '?';
  let totalDays = 183;
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    daysRemaining = Math.max(0, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));
    const startDate = new Date(goal.meta?.start_date || '2026-04-08');
    totalDays = Math.ceil((deadlineDate - startDate) / (1000 * 60 * 60 * 24));
  }

  const timeProgress = totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0;

  // Phase data
  const phases = [];
  for (const [title, section] of Object.entries(roadmap.sections || {})) {
    if (title.toLowerCase().includes('phase')) {
      const raw = section.raw || '';
      const milestones = raw.split('\n').filter(l => l.match(/Status:\s*/i));
      const total = milestones.length || 1;
      const completed = milestones.filter(l => l.toLowerCase().includes('completed')).length;
      const inProgress = milestones.filter(l => l.toLowerCase().includes('in_progress')).length;
      const pct = Math.round(((completed + inProgress * 0.5) / total) * 100);
      phases.push({ name: title, progress: pct });
    }
  }

  // KPI data
  const kpis = [];
  for (const [title, section] of Object.entries(roadmap.sections || {})) {
    if (title.toLowerCase().includes('kpi') && section.table) {
      section.table.forEach(row => {
        const metric = row.Metric || row.metric || Object.values(row)[0] || '';
        const target = parseInt(row.Target || row.target || Object.values(row)[1]) || 0;
        const current = parseInt(row.Current || row.current || Object.values(row)[2]) || 0;
        if (metric && target) kpis.push({ metric, target, current });
      });
    }
  }

  const smartOps = generateSmartOps(state, { progress, daysElapsed, streak, daysRemaining, sessions });

  el.innerHTML = `
    <!-- Mission Title -->
    <div class="mb-6">
      <div class="flex items-center gap-3">
        <h1 class="font-display font-bold text-2xl text-white tracking-wider uppercase">${escapeHtml(goalName)}</h1>
        ${category ? `<span class="cp-badge cp-badge-cyan">${escapeHtml(category)}</span>` : ''}
      </div>
      ${deadline ? `<div class="font-mono text-[11px] text-cp-dim mt-1">DEADLINE: ${escapeHtml(deadline)} <span class="text-cp-red ml-3">T-${daysRemaining} DAYS</span></div>` : ''}
    </div>

    <!-- Inline Stats (CP2077 style, not cards) -->
    <div class="cp-stats">
      <div class="cp-stat">
        <div class="cp-stat-value">${progress}%</div>
        <div class="cp-stat-label">Progress</div>
      </div>
      <div class="cp-stat">
        <div class="cp-stat-value">${daysElapsed}</div>
        <div class="cp-stat-label">Days Active</div>
      </div>
      <div class="cp-stat">
        <div class="cp-stat-value red">${sessions}</div>
        <div class="cp-stat-label">Operations</div>
      </div>
      <div class="cp-stat">
        <div class="cp-stat-value red">${streak}</div>
        <div class="cp-stat-label">Day Streak</div>
      </div>
      <div class="cp-stat">
        <div class="cp-stat-value ${parseInt(daysRemaining) <= 30 ? 'red' : 'green'}">${daysRemaining}</div>
        <div class="cp-stat-label">Days Left</div>
      </div>
    </div>

    <!-- MISSION_STATUS section: slider bars -->
    <div class="cp-section">
      <div class="cp-section-header">MISSION_STATUS.ACTIVE</div>

      <!-- Overall Progress -->
      <div class="cp-slider mb-3">
        <div class="cp-slider-label">Overall Progress</div>
        <div class="cp-slider-track"><div class="cp-slider-fill" style="width: ${progress}%"></div></div>
        <div class="cp-slider-value">${progress}</div>
      </div>

      <!-- Time Elapsed -->
      <div class="cp-slider mb-3">
        <div class="cp-slider-label">Time Elapsed</div>
        <div class="cp-slider-track"><div class="cp-slider-fill cyan" style="width: ${timeProgress}%"></div></div>
        <div class="cp-slider-value">${timeProgress}</div>
      </div>

      <!-- KPIs as slider bars -->
      ${kpis.map(k => {
        const pct = Math.min(100, Math.round((k.current / k.target) * 100));
        return `
          <div class="cp-slider mb-2">
            <div class="cp-slider-label">${escapeHtml(k.metric).slice(0, 25)}</div>
            <div class="cp-slider-track"><div class="cp-slider-fill ${pct >= 80 ? 'green' : ''}" style="width: ${pct}%"></div></div>
            <div class="cp-slider-value">${k.current}/${k.target}</div>
          </div>`;
      }).join('')}
    </div>

    <!-- COUNTDOWN -->
    <div class="cp-section">
      <div class="cp-section-header">COUNTDOWN</div>
      <div class="flex gap-8 py-2">
        ${(() => {
          const d = parseInt(daysRemaining) || 0;
          const months = Math.floor(d / 30);
          const weeks = Math.floor((d % 30) / 7);
          const days = d % 7;
          return `
            <div class="cp-stat"><div class="cp-stat-value red">${months}</div><div class="cp-stat-label">Months</div></div>
            <div class="cp-stat"><div class="cp-stat-value red">${weeks}</div><div class="cp-stat-label">Weeks</div></div>
            <div class="cp-stat"><div class="cp-stat-value red">${days}</div><div class="cp-stat-label">Days</div></div>
          `;
        })()}
      </div>
    </div>

    <!-- PHASE_BREAKDOWN: slider bars per phase -->
    ${phases.length ? `
    <div class="cp-section">
      <div class="cp-section-header cyan">PHASE_BREAKDOWN</div>
      ${phases.map((p, i) => `
        <div class="cp-slider mb-2">
          <div class="cp-slider-label">${escapeHtml(p.name).replace(/Phase \d+:?\s*/i, 'P' + (i+1) + ' ')}</div>
          <div class="cp-slider-track"><div class="cp-slider-fill ${p.progress > 0 && p.progress < 100 ? 'cyan' : p.progress >= 100 ? 'green' : ''}" style="width: ${p.progress}%"></div></div>
          <div class="cp-slider-value">${p.progress}%</div>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- SMART_OPS: action list -->
    <div class="cp-section">
      <div class="cp-section-header">SMART_OPS <span class="cp-count">${smartOps.length} ACTIONS</span></div>
      ${smartOps.slice(0, 6).map(action => `
        <div class="cp-equip ${action.urgent ? '' : 'cyan'}">
          <div class="flex items-center justify-between">
            <div>
              <div class="cp-equip-title">${escapeHtml(action.label)}</div>
              <div class="cp-equip-sub ${action.urgent ? 'text-cp-red' : ''}">${escapeHtml(action.desc)}</div>
            </div>
            <button onclick="smartOpClick('${action.cmd}', '${escapeHtml(action.args)}', ${!!action.needsInput})" class="cp-btn ${action.urgent ? '' : 'cyan'}">
              ${action.urgent ? 'DO IT NOW' : 'DO IT'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- THREAT_BOARD -->
    ${blockers.sections?.['Active Blockers'] ? `
    <div class="cp-section">
      <div class="cp-section-header">THREAT_BOARD</div>
      ${(blockers.sections['Active Blockers'].raw || '').split(/^### /m).filter(b => b.trim()).map(block => {
        const lines = block.trim().split('\n');
        const title = lines[0] || '';
        const impact = lines.find(l => l.match(/Impact:/i))?.replace(/.*Impact:\s*/i, '') || '';
        const eta = lines.find(l => l.match(/ETA:/i))?.replace(/.*ETA:\s*/i, '') || '';
        return `
          <div class="cp-equip">
            <div class="flex items-center justify-between">
              <div>
                <div class="cp-equip-title">${escapeHtml(title)}</div>
                ${impact ? `<div class="cp-equip-sub"><span class="text-cp-red">${escapeHtml(impact)}</span></div>` : ''}
              </div>
              ${eta ? `<span class="cp-badge cp-badge-red">${escapeHtml(eta)}</span>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>` : ''}
  `;
}
