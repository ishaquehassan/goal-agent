/**
 * Empty state - shown when no goal is set
 */

function renderEmpty() {
  const el = document.getElementById('page-empty');
  el.innerHTML = `
    <div class="max-w-2xl mx-auto text-center py-20">
      <div class="text-6xl mb-6">🎯</div>
      <h1 class="text-3xl font-bold mb-4">No Goal Set Yet</h1>
      <p class="text-gray-400 mb-8 text-lg">
        Set your first goal to start tracking progress, creating content, and building your network.
      </p>

      <div class="glass-card p-6 text-left mb-8">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Getting Started</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <span class="text-accent font-mono text-sm mt-0.5">1</span>
            <div>
              <div class="text-gray-200 font-medium">Open Claude Code</div>
              <div class="text-sm text-gray-400">In any project directory</div>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-accent font-mono text-sm mt-0.5">2</span>
            <div>
              <div class="text-gray-200 font-medium">Run the set command</div>
              <code class="text-sm text-accent bg-accent/10 px-2 py-1 rounded mt-1 inline-block">/goal:set "Your goal here"</code>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-accent font-mono text-sm mt-0.5">3</span>
            <div>
              <div class="text-gray-200 font-medium">Follow the prompts</div>
              <div class="text-sm text-gray-400">It will ask about your background, skills, and social profiles</div>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-accent font-mono text-sm mt-0.5">4</span>
            <div>
              <div class="text-gray-200 font-medium">Refresh this page</div>
              <div class="text-sm text-gray-400">The dashboard will auto-detect your goal files</div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 text-left">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Example Goals</h2>
        <div class="space-y-2 text-sm">
          <div class="text-gray-400">🏆 "Become a Google Developer Expert in Flutter"</div>
          <div class="text-gray-400">💼 "Land a senior engineering role at Google"</div>
          <div class="text-gray-400">🎬 "Grow my YouTube channel to 100k subscribers"</div>
          <div class="text-gray-400">💰 "Start freelancing and get 5 clients"</div>
          <div class="text-gray-400">🌐 "Become a recognized open source maintainer"</div>
        </div>
      </div>
    </div>
  `;
}
