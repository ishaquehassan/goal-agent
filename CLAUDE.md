# Goal Agent: Flutter GDE Goal Tracker

## What This Is

This is the personal goal tracking workspace for achieving **Flutter Google Developer Expert (GDE)** status within 6 months (Apr 8 to Oct 8 2026). All state files live in this directory. The goal agent plugin is installed at `~/.claude/commands/goal/` with 13 slash commands.

**Plugin repo:** https://github.com/ishaquehassan/goal-agent
**OSS Auto-Contributor repo:** https://github.com/ishaquehassan/oss-auto-contributor

## Available Commands

| Command | Purpose |
|---------|---------|
| `/goal:set` | Initialize a new goal (already done for Flutter GDE) |
| `/goal:next` | Get today's top priorities |
| `/goal:status` | Full progress dashboard with KPIs |
| `/goal:log` | Log session work |
| `/goal:research` | Deep research on goal requirements |
| `/goal:optimize` | Optimize LinkedIn/GitHub profiles via browser |
| `/goal:write` | Write and publish Medium articles / LinkedIn posts |
| `/goal:engage` | LinkedIn engagement (comment, follow, react) via browser |
| `/goal:contacts` | Network tracker |
| `/goal:calendar` | Content calendar |
| `/goal:dashboard` | Open web dashboard |
| `/goal:update` | Update plugin to latest version |
| `/goal:contribute` | Submit session learnings as PR |

## State Files (This Directory)

| File | Purpose |
|------|---------|
| `goal-definition.md` | Flutter GDE goal, category, deadline, success criteria |
| `goal-profile.md` | Ishaq's profile, skills, social URLs, achievements |
| `strategy-roadmap.md` | 4-phase strategy with milestones and KPI dashboard |
| `progress-tracker.md` | Session logs, % complete, streak |
| `content-calendar.md` | Weekly content plan per platform |
| `contacts-network.md` | Tiered contacts (Waleed, Sakina, Craig, Andrew, etc.) |
| `engagement-log.md` | All LinkedIn comments/reactions/connections |
| `profile-audit.md` | Profile scores: LinkedIn 9.5/10, GitHub 9/10, Medium 7/10, SO 2/10, Twitter 4/10 |
| `research-findings.md` | GDE requirements, interview process, gap analysis |
| `blockers.md` | Active obstacles (SO suspended, Waleed cooldown, Craig pending) |
| `natural-content-rules.md` | Global rules for natural, human-like content (no em dashes, no AI phrases, variation rules) |

## Current Progress (Apr 10 2026)

- **Overall: 45%** | Day 3 of 183 | Phase 1 Foundation
- 3 PRs merged into flutter/flutter (#183081, #183097, #183109)
- 2 PRs approved, pending merge (#184545, #184569)
- 8 verified speaking events (EXCEEDS 3 requirement)
- 40 LinkedIn engagements, 7 Google engineers replied (28% rate)
- 4 Medium articles published
- LinkedIn profile optimized (9.5/10), GitHub revamped (9/10)
- Goal Agent plugin shipped to GitHub (public repo)

## Key Contacts Status

| Person | Role | Status | Notes |
|--------|------|--------|-------|
| Waleed Arshad | Flutter GDE Pakistan #1 | 3-week cooldown | Withdrew connect, must wait ~Apr 29. Profile: /in/waleed006/ |
| Sakina Abbas | Flutter GDE Pakistan | DM sent | Already 1st connection. Profile: /in/sakina-abbas/ |
| Craig Labenz | Flutter DevRel Google | Pending connect | Sent Apr 6. If not accepted in 2 weeks, engage via posts |
| Andrew Brogdon | Tech Lead Dart/Flutter DevRel Google | Pending connect | Sent Apr 6 with personalized note. Profile: /in/redbrogdon/ |
| Katya Vinnichenko | Program Manager DevRel Google | Pending connect | Sent without note (no personalized invites left) |
| Rody Davis | Sr DevRel Antigravity, Google | Followed + commented | Apr 8 |
| Qi Han Wong | Product Lead AI, Google | Followed + commented | Apr 8 |

## GitHub Profile

**Repo:** https://github.com/ishaquehassan/ishaquehassan
**Local clone (temp):** /tmp/ishaquehassan/ (may need re-clone after reboot)

14 sections: Custom Puppeteer banner, whoami, Flutter PRs (5 linked), Speaker section (8 events with verified links), Currently Building (DigitalHire), Contribution Highlights, Flutter Course, Open Source repos, Latest Articles, Tech Stack, Stats, Activity Graph, Footer.

Pinned repos: document_scanner_flutter, flutter_alarm_background_trigger, assets_indexer, nadra_verisys_flutter, claude-remote-terminal, goal-agent

## LinkedIn Profile

- Headline: Flutter Framework Contributor | Engineering Manager @ DigitalHire | Open Source Author | Public Tech Speaker
- About: Flutter contributions FIRST LINE, specific areas (widget rendering, animation APIs, cross-fade transitions)
- Banner: Custom Flutter Framework Contributor (Puppeteer rendered 3168x792px)
- Featured: 2 Medium articles + 2 LinkedIn posts
- Top Skills: Flutter, Software Development, Android Development, Dart, Mobile Applications
- Score: 9.5/10

## StackOverflow

- SUSPENDED until Apr 13 (4 answers flagged as AI content)
- When resumed: post manually only, max 1-2/week, rough human tone
- Profile: https://stackoverflow.com/users/2094696/ishaq-hassan

## Speaking Events (8 Verified with Links)

1. DevFest Karachi "Scaling Products with Flutter" (GDG Kolachi, panel with Waleed + Sakina)
2. Google IO Extended Karachi (GDG Kolachi)
3. Flutter Bootcamp Aug 2021 (GDG Kolachi, Instructor)
4. Facebook Developer Circle INAUGURAL (Nest I/O)
5. Flutter Seminar (Iqra University)
6. Industry Academia "Bridging the Gap" (Iqra University)
7. BLAZE 2022 Tech Workshops (GDG Kolachi)
8. DevNCode Meetup IV AI (Nest I/O)
9. Guest Speaker Seminar 2025 (Iqra University)

User confirmed but unverified (no links): WTM Karachi, GDG Live Pakistan, Pakistan's First Flutter Meetup 2018

## GDE Program Requirements

- **3 rounds:** Application form, Community Interview (with active GDE), Product Interview (with Flutter team)
- **Nomination:** Must be nominated by Google employee OR existing GDE
- **Requirements:** Community impact through speaking, content, open source, mentoring
- **Ideal profile:** 10+ speaking events (have 8+), merged PRs in official repos (have 3+5), published articles, community leadership
- **Pakistani landscape:** Only 2 Flutter GDEs (Waleed Arshad, Sakina Abbas). Both know Ishaq from events.

## Content Strategy

- **Medium:** 1 article every 2 weeks on Flutter internals (target 8 total, have 4)
- **LinkedIn:** 1 technical post per week (Flutter PR stories, framework deep-dives)
- **Cross-post:** Medium article -> LinkedIn promotion post next day
- **Topics backlog:** 15 ideas in content-calendar.md (RenderObject Pipeline, Element Recycling, BuildOwner, AnimatedCrossFade, etc.)

## BROWSER AUTOMATION TECHNICAL REFERENCE

### MCP Chrome Extension

Browser automation uses Claude in Chrome MCP extension. User has Brave browser with extension installed.

**Tools:** tabs_context_mcp, tabs_create_mcp, navigate, read_page, get_page_text, javascript_tool, form_input, computer, find, gif_creator

**Critical rules:**
1. ALWAYS call `tabs_context_mcp` first to get current browser state
2. Never reuse tab IDs from previous sessions
3. Tab focus matters, always focus working tab
4. Use JS verification instead of screenshots (faster, avoids lightbox)
5. Wait 1s max between actions, 3s only for page loads
6. JS bulk operations preferred over clicking one by one
7. Never trigger alert/confirm/prompt dialogs (they block everything)

### LinkedIn Automation

**Search URL Construction:**
```
Base: https://www.linkedin.com/search/results/content/
Params:
  ?keywords=ENCODED_KEYWORDS
  &datePosted="past-week"
  &sortBy="date_posted" OR "relevance"
  &authorCompany=%5B%221441%22%5D  (Google company ID)
```

**Profile URL extraction (CRITICAL):**
```javascript
// NEVER guess URLs. Some have random suffixes like /in/alexey-samsonov-36ab3843/
const links = document.querySelectorAll('a[href*="/in/"]');
const profileUrl = links[0]?.href;
```

**Follow button (inconsistent naming):**
```javascript
const buttons = document.querySelectorAll('button');
const followBtn = Array.from(buttons).find(b =>
  b.textContent.trim().startsWith('Follow') &&
  !b.textContent.includes('Following')
);
if (followBtn) followBtn.click();
```

**Comment posting workflow (PROVEN METHOD, DO NOT DEVIATE):**
1. Navigate to post DETAIL page (`/feed/update/urn:li:activity:{id}/`). NEVER comment from search results.
2. JS: Click comment button to open editor: `Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.toLowerCase().includes('comment'))?.click()`
3. Wait 2 seconds for editor to appear
4. Use `find` tool: query "comment text box editor" to get element ref
5. Use `computer` tool: `left_click` with ref (NOT coordinates, NOT scrollIntoView)
6. Use `computer` tool: `type` the comment text
7. Use `find` tool: query "Comment submit button" to get submit ref
8. Use `computer` tool: `left_click` with submit ref
9. Wait 4 seconds
10. JS verify BOTH conditions: `editor.innerText.trim().length === 0` (cleared) AND `document.body.innerText.includes('unique phrase')` (on page)
11. JS reload: `window.onbeforeunload = null; window.location.reload()`
12. Wait 4 seconds, verify again with same JS check
13. ONLY move to next post after reload verification passes

**HARD RULES for comment posting:**
- NEVER use `scrollIntoView()` on LinkedIn post pages. It triggers lightbox even after removing images.
- NEVER use `textContent =` or `innerHTML =` on ql-editor. It doesn't register with LinkedIn's internal state.
- NEVER use clipboard paste (`navigator.clipboard.writeText` + Cmd+V) on LinkedIn comment editors. It doesn't work.
- NEVER use coordinate-based clicks for editor/submit. Use `find` tool refs instead.
- NEVER take screenshots to verify comments on image/video posts. Use JS verification only.
- ALWAYS use the `find` + `ref click` + `computer type` + `find submit` + `ref click` flow. This is the ONLY method that works reliably.

**Image/Video Lightbox Trap (CRITICAL):**
- ANY scroll action (scrollIntoView, computer scroll, End key) through image/video areas triggers fullscreen lightbox that BLOCKS all interactions
- `display:none` on images does NOT prevent lightbox (LinkedIn's JS still has internal references)
- `el.remove()` on images does NOT prevent lightbox (scroll position still passes through removed area)
- `pointer-events: none` does NOT prevent lightbox
- THE ONLY SOLUTION: Use `find` tool to get element refs, then `computer left_click ref`. Ref clicks do NOT scroll through content.
- If lightbox activates: open a NEW TAB (don't try to dismiss or reload same tab, "Leave site?" dialog blocks navigation)
- Use JS verification instead of screenshots for ALL posts (not just video/image posts)

**"Leave site?" dialog fix:**
- LinkedIn shows this when editor has unsaved content and you try to navigate away
- Fix: `window.onbeforeunload = null` before any navigation
- Better fix: create new tab with `tabs_create_mcp` instead of navigating same tab
- If dialog blocks: JS `window.onbeforeunload = null; window.location.href = 'URL'`

**Tab management:**
- Create a new tab for each post engagement (avoids "Leave site?" dialogs)
- Don't reuse tabs across different posts
- If stuck on any page, create new tab and move on

**Two editor types:**
- Search results: tiptap ProseMirror editors
- Detail pages: ql-editor
- ALWAYS comment on detail page, never from search results

**@Mentions via JS = FAKE** (just text, no notification). Real mention only by typing @ and selecting from dropdown. Don't attempt.

**Clipboard paste approach (ONLY for Medium publishing and profile editing, NOT for LinkedIn comments):**
1. JS: `navigator.clipboard.writeText("content")`
2. Computer tool: keyboard shortcut paste (Cmd+V on Mac, Ctrl+V on Windows)
3. NOTE: This does NOT work on LinkedIn comment editors (ql-editor). Use `find ref + computer type` instead.

**Connection requests:**
- Always try "Add a note" first with personalized message
- LinkedIn has a MONTHLY quota for personalized invites. When exhausted, falls back to "Send without a note"
- Handle this gracefully: if premium upsell dialog appears after clicking "Add a note", close it and click "Send without a note" via More > Connect
- For GDE targets: always connect (with or without note), the comment on their post serves as context

**Profile URL safety:**
- NEVER hardcode or guess profile URLs. Same name can be different person (e.g., /in/craiglabenz/ is a Visual Designer, NOT the Flutter DevRel)
- ALWAYS extract exact URL from search results or activity pages via JS
- Verify person's role/title matches before engaging

**Search strategy for finding relevant posts:**
- `"Flutter GDE" OR "Google Developer Expert" flutter` = finds GDE posts directly
- `authorCompany=%5B%221441%22%5D` = Google employees only
- Generic keywords like "AI agents", "developer advocate" return marketing people, not devs. Be specific.
- Best approach: search for GDEs first, then Google company filter with Flutter/Dart keywords

**Activity URN extraction:**
- Use `document.querySelectorAll('[data-urn]')` on activity pages. Returns data-urn attributes.
- `a[href*="/feed/update/"]` selectors do NOT work on activity pages
- First URN in the list = most recent post

### Medium Publishing

- Navigate to medium.com/new-story
- Click "Title" placeholder, type (NOT JS inject)
- Body: clipboard paste ONLY (`navigator.clipboard.writeText` + Cmd+V)
- NEVER use textContent/innerHTML setters (breaks Medium's internal state)
- Add tags: type tag name, wait for dropdown, click suggestion
- Username: @ishaqhassan (NOT @ishaquehassan)

### OS-Aware Shortcuts

```javascript
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
// Modifier: Meta for Mac, Control for Windows/Linux
```

### Speed Optimization

- JS bulk operations over individual clicks
- Minimize screenshots, use JS verification
- Between actions: 0-1 second. Page load: 2-3 seconds. After comment: 3 seconds.
- Parallel data extraction in one JS call

## Commenting/Reply Rules (ALL PLATFORMS: LinkedIn, Medium, GitHub, Twitter, Reddit, HN, SO, Dev.to, etc.)

1. Never generic comments. Always reference SPECIFIC point from post.
2. Comment from real experience (Engineering Manager, Flutter contributor, multi-agent systems).
3. Differentiate from existing comments, add something nobody else said.
4. Casual developer tone. "caught my eye", "is a nightmare", "most teams skip this".
5. Short and punchy: 2 paragraphs usually, 3 max only for stories.
6. End with action or curiosity (not generic "Thanks for sharing").
7. No em dashes anywhere.
8. Emojis: max 1-2 per comment. NEVER 3+ emojis. Never stack emojis together. Vary which emoji each time.
9. No AI/Claude/automation mentions ever.
10. Vary structure: 1 para / 2 para / question / story / pushback / one-liner.
11. Include EMOTION: "Wait, what??" / "This is insane" / "Can't wait to try this".
12. If someone reads all comments same day on ANY platform, NO pattern should be visible.
13. LinkedIn specific: Max 10 per session. 60% target company, 40% others.
14. LinkedIn specific: Vary reactions: Like 40%, Insightful 30%, Celebrate 20%, Love 10%.
15. NEVER use GitHub repo path format (owner/repo) ANYWHERE. No "flutter/flutter", no "google/mediapipe", no "any/thing". Just say the project name like a normal human. "flutter", "mediapipe", "Next.js". This applies to LinkedIn, Medium, Twitter, Reddit, GitHub issues/PRs, everywhere.
16. NEVER use perfectly balanced paragraph structure. Make paragraphs uneven, drop a point, leave things slightly incomplete like real humans do.
17. Use casual tone markers: "honestly", "tbh", "lol", "hits different", "wild", "ngl", "imo". 1-3 per comment, vary which ones.
18. Lowercase starts OK sometimes. Not every comment needs to start with a capital letter.

## DigitalHire Mention Rules

- URL: digitalhire.ai (NOT .me, NOT .com)
- Only mention on TECHNICAL posts where it naturally fits
- NEVER on hiring/recruiting posts

## Event Verification Rule

When adding speaking events to profile: ALWAYS verify name on actual page before adding. Web search results frequently associate people with events WITHOUT them being a speaker. Spawned 9 agents, 150+ searches, most "found" events didn't have Ishaq's name when verified via browser. Only add events with verifiable proof (official page listing name, or third-party blog mentioning by name).

## Key Rules

- **No em dashes** anywhere (comments, PRs, LinkedIn, Medium, code, JSON, everywhere)
- **No AI mentions** in any external content
- **No Co-Authored-By** in any commits
- **Roman Urdu** communication style with user
- **Natural developer tone** in all external content
- **Gaaliyan allowed** in conversation

## Session End Rule (HARD RULE, NEVER SKIP)

**At the END of EVERY session, BEFORE saying goodbye or ending conversation, you MUST:**

1. Check if any plugin files changed during this session (CLAUDE.md, SKILL.md files, natural-content-rules.md, dashboard code, agents, install scripts)
2. If changes detected, ask the user: "Is session mein kuch improvements hue hain plugin mein. Contribute karna chahoge repo mein as PR?"
3. If user says yes: run `/goal:contribute` flow
4. If user says no: move on
5. If no changes detected: skip silently

**This is NOT optional.** Every session, every time, no exceptions. The goal is to make the plugin self-improving through real usage. Even if the session was short, check for changes. Even if you think nothing important changed, ASK.
