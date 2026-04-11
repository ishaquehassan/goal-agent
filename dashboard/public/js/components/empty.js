/**
 * EMPTY STATE // No Goal Set
 * CP2077 style onboarding
 */

function renderEmpty() {
  const el = document.getElementById('page-empty');
  el.innerHTML = `
    <div class="max-w-lg mx-auto py-16">
      <!-- Diamond icon -->
      <div class="flex justify-center mb-8">
        <div style="width: 40px; height: 40px; background: #e83535; transform: rotate(45deg); opacity: 0.6;"></div>
      </div>

      <h1 class="font-display font-bold text-2xl text-white tracking-wider uppercase text-center mb-3">NO MISSION DETECTED</h1>
      <p class="text-sm text-cp-dim font-body text-center mb-8">
        Initialize a mission objective to activate the command center.
      </p>

      <div class="cp-section">
        <div class="cp-section-header">INITIALIZATION_PROTOCOL</div>
        ${[
          { step: '01', title: 'Open Claude Code', desc: 'In any project directory' },
          { step: '02', title: 'Execute command', desc: '/goal:set "Your mission objective"', isCode: true },
          { step: '03', title: 'Complete briefing', desc: 'Provide background, skills, social profiles' },
          { step: '04', title: 'Refresh dashboard', desc: 'System will auto-detect mission files' }
        ].map(s => `
          <div class="cp-row">
            <span class="font-display text-lg font-bold text-cp-red" style="min-width: 28px">${s.step}</span>
            <div>
              <div class="text-sm font-semibold text-white font-body">${s.title}</div>
              ${s.isCode
                ? `<code class="text-xs font-mono text-cp-cyan">${s.desc}</code>`
                : `<div class="text-xs text-cp-dim font-body">${s.desc}</div>`
              }
            </div>
          </div>
        `).join('')}
      </div>

      <div class="cp-section">
        <div class="cp-section-header cyan">EXAMPLE_MISSIONS</div>
        ${[
          '\u{1F3C6} Become a Google Developer Expert in Flutter',
          '\u{1F4BC} Land a senior engineering role at Google',
          '\u{1F3AC} Grow YouTube channel to 100k subscribers',
          '\u{1F4B0} Start freelancing and get 5 clients',
          '\u{1F310} Become a recognized open source maintainer'
        ].map(e => `
          <div class="cp-row">
            <span class="text-xs text-cp-text font-body">${e}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
