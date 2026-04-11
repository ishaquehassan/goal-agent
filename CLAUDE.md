# Goal Agent: Flutter GDE Goal Tracker

## What This Is

This is the personal goal tracking workspace for achieving **Flutter Google Developer Expert (GDE)** status within 6 months (Apr 8 to Oct 8 2026). All state files live in this directory. The goal agent plugin is installed at `~/.claude/commands/goal/` with 10 slash commands.

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

**Comment posting workflow:**
1. Navigate to post DETAIL page (`/feed/update/urn:li:activity:{id}/`). NEVER comment from search results.
2. Find comment textbox: `document.querySelector('[contenteditable="true"][role="textbox"]')`
3. Focus, set content, dispatch input event
4. Find submit button in form
5. Wait 3 seconds
6. Verify via JS: `document.body.innerText.includes('unique phrase')`

**Image/Video Lightbox Trap (CRITICAL):**
- Scrolling through image/video areas triggers fullscreen lightbox that BLOCKS all interactions
- Prevention: `document.addEventListener('click', e => { if (e.target.tagName === 'IMG') { e.stopPropagation(); e.preventDefault(); } }, true);`
- If stuck: reload the page
- Use JS verification instead of screenshots for video/image posts

**Two editor types:**
- Search results: tiptap ProseMirror editors
- Detail pages: ql-editor
- ALWAYS comment on detail page, never from search results

**@Mentions via JS = FAKE** (just text, no notification). Real mention only by typing @ and selecting from dropdown. Don't attempt.

**Clipboard paste approach (for profile editing, Medium publishing):**
1. JS: `navigator.clipboard.writeText("content")`
2. Computer tool: keyboard shortcut paste (Cmd+V on Mac, Ctrl+V on Windows)

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

## LinkedIn Commenting Rules

1. Never generic comments. Always reference SPECIFIC point from post.
2. Comment from real experience (Engineering Manager, Flutter contributor, multi-agent systems).
3. Differentiate from existing comments, add something nobody else said.
4. Casual developer tone. "caught my eye", "is a nightmare", "most teams skip this".
5. Short and punchy: 2 paragraphs usually, 3 max only for stories.
6. End with action or curiosity (not generic "Thanks for sharing").
7. No em dashes anywhere.
8. Emojis: vary (sometimes 0, sometimes 1-2, different each time).
9. No AI/Claude/automation mentions ever.
10. Vary structure: 1 para / 2 para / question / story / pushback / one-liner.
11. Include EMOTION: "Wait, what??" / "This is insane" / "Can't wait to try this".
12. If someone reads all comments same day, NO pattern should be visible.
13. Max 10 per session. 60% target company, 40% others.
14. Vary reactions: Like 40%, Insightful 30%, Celebrate 20%, Love 10%.
15. NEVER use GitHub repo path format (owner/repo) in comments. No "flutter/flutter", no "google/mediapipe", no "any/thing". Just say the project name like a normal human. "flutter", "mediapipe", "Next.js".
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
