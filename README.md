# Goal Agent

**Your AI-powered career agent for Claude Code.**

Set any professional goal. Get a strategy. Execute it. Track progress. All from your terminal.

Goal Agent turns Claude Code into a full career execution engine. It researches what you need, builds your roadmap, optimizes your profiles, writes your content, engages with the right people, and tracks everything across sessions.

---

## What It Does

| Command | What Happens |
|---------|-------------|
| `/goal:set "Grow my YouTube to 100k"` | Collects your profile, researches requirements, generates a phased strategy with milestones |
| `/goal:next` | Analyzes your progress and tells you exactly what to do today |
| `/goal:status` | Full dashboard with KPIs, phase breakdown, engagement stats, content tracker |
| `/goal:optimize linkedin` | Audits your LinkedIn profile against your goal, rewrites headline/about/skills, executes changes |
| `/goal:write article` | Writes a full Medium article, publishes it, auto-generates a LinkedIn promotion post |
| `/goal:engage 5` | Finds target audience posts on LinkedIn, writes contextual comments, follows, reacts |
| `/goal:contacts` | Manages your professional network in tiers, suggests who to reach out to |
| `/goal:calendar` | Plans your weekly content across platforms |
| `/goal:log "wrote 2 articles"` | Records your work, updates progress percentage |
| `/goal:research` | Deep dives into goal requirements, finds success patterns, identifies gaps |

---

## Works For Any Goal

Goal Agent auto-detects your goal type and adapts everything accordingly:

| Your Goal | What Changes |
|-----------|-------------|
| **Developer Expert Programs** | Targets relevant engineers on LinkedIn, suggests conference talks, tracks PRs and articles |
| **Land a Job at a Top Company** | Focuses on LeetCode prep, referral connections, interview practice, portfolio projects |
| **YouTube 100k subscribers** | Plans video content, cross-posts to Twitter/TikTok, tracks subscriber milestones |
| **Start Freelancing** | Builds portfolio, optimizes Upwork/LinkedIn, plans case study content |
| **Open Source Maintainer** | Tracks contributions, suggests projects, builds community presence |
| **Learn a New Skill** | Creates study plan, tracks certifications, connects with mentors |
| **Custom Goal** | You define the platforms, milestones, and success criteria |

---

## Install

### macOS / Linux

```bash
curl -sL https://raw.githubusercontent.com/ishaquehassan/goal-agent/main/install.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/ishaquehassan/goal-agent/main/install.ps1 | iex
```

### Manual Install

```bash
git clone https://github.com/ishaquehassan/goal-agent.git
cp -r goal-agent/skills/goal ~/.claude/commands/goal
cp goal-agent/agents/*.md ~/.claude/agents/
```

---

## How to Use (Daily Flow)

### Step 1: Set Your Goal (One Time)

```bash
/goal:set "Grow my YouTube channel to 100k subscribers"
```

It asks your name, role, skills, social links, achievements. Takes 3-5 minutes. Then it researches what's needed, builds your strategy, creates a content calendar, identifies gaps. Everything auto-generated.

### Step 2: Check Today's Priorities (Every Day)

```bash
/goal:next
```

Reads all your progress, calculates what's most urgent, gives you **top 5 actions** with time estimates and tags like `[ENGAGE]`, `[CONTENT]`, `[OPTIMIZE]`.

### Step 3: Execute (Pick What Fits Your Day)

```bash
/goal:engage 5             # Find target audience posts, comment, follow, react
/goal:write article        # Write a full article, publish to Medium, auto-promote on LinkedIn
/goal:write linkedin-post  # Write and publish a LinkedIn post for your target audience
/goal:optimize linkedin    # Audit your profile against your goal, fix headline/about/skills
```

### Step 4: Log Your Work

```bash
/goal:log "commented on 3 posts, published 1 article"
```

Records what you did, updates your progress percentage, suggests tomorrow's focus.

### Step 5: Track Progress

```bash
/goal:status
```

Full dashboard: phase breakdown, KPIs, engagement stats, content tracker, streak, blockers.

### Other Commands (When You Need Them)

```bash
/goal:research    # Deep dive into goal requirements, find success patterns
/goal:contacts    # Manage your network, see who to reach out to
/goal:calendar    # View and plan your weekly content schedule
```

> **Your daily loop:** `/goal:next` to see what to do, execute it, `/goal:log` to record it. That's it.

---

## Browser Automation

Three commands use browser automation to actually execute actions: `/goal:optimize`, `/goal:write`, and `/goal:engage`.

**Requirements:**
- Chrome or Brave browser
- [Claude in Chrome](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) extension installed

**Without the extension:** The other 7 commands (`set`, `next`, `status`, `log`, `research`, `contacts`, `calendar`) work perfectly fine. You just won't be able to auto-publish or auto-engage from the terminal.

**Cross-platform:** Browser automation works on macOS, Windows, and Linux. Keyboard shortcuts (Cmd vs Ctrl) are auto-detected.

---

## All Commands Reference

### Tracking Layer

| Command | Description | Browser Needed |
|---------|-------------|:--------------:|
| `/goal:set "goal"` | Initialize goal, profile, strategy | No |
| `/goal:next` | Today's prioritized actions | No |
| `/goal:status` | Full progress dashboard | No |
| `/goal:log "work done"` | Record session work | No |
| `/goal:research` | Deep research requirements | No |

### Execution Layer

| Command | Description | Browser Needed |
|---------|-------------|:--------------:|
| `/goal:optimize [platform]` | Optimize social profiles | Yes |
| `/goal:write [type]` | Create and publish content | Yes (for publish) |
| `/goal:engage [count]` | Engage with target audience | Yes |
| `/goal:contacts` | Network management | No |
| `/goal:calendar` | Content calendar | No |

---

## Memory Files

Goal Agent stores everything in Claude Code's project memory. These files are auto-created by `/goal:set`:

| File | Purpose |
|------|---------|
| `goal-profile.md` | Your background, skills, social links |
| `goal-definition.md` | Goal statement, category, deadline, success criteria |
| `strategy-roadmap.md` | Phased milestones with KPIs |
| `progress-tracker.md` | Session logs, percentage complete |
| `content-calendar.md` | Weekly content plan |
| `contacts-network.md` | Tiered professional network |
| `research-findings.md` | Goal requirements and gap analysis |
| `blockers.md` | Obstacles and risks |
| `engagement-log.md` | All comments, reactions, connections |
| `profile-audit.md` | Profile scores and optimization history |

---

## Uninstall

### macOS / Linux
```bash
rm -rf ~/.claude/plugins/data/goal-agent@ishaquehassan/
rm -rf ~/.claude/commands/goal/
rm -f ~/.claude/agents/goal-researcher.md ~/.claude/agents/engagement-writer.md
```

### Windows (PowerShell)
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\plugins\data\goal-agent@ishaquehassan\"
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\commands\goal\"
Remove-Item -Force "$env:USERPROFILE\.claude\agents\goal-researcher.md","$env:USERPROFILE\.claude\agents\engagement-writer.md"
```

---

## Requirements

| Requirement | Needed For | Install |
|-------------|-----------|---------|
| [Claude Code](https://claude.ai/code) | Everything | `npm i -g @anthropic-ai/claude-code` |
| [Claude in Chrome](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) | Profile optimization, publishing, engagement | Chrome Web Store |
| LinkedIn account | Networking, engagement | Log in via browser |
| GitHub account | OSS goals, profile optimization | `gh` CLI recommended |
| Medium account | Article publishing | Log in via browser |

---

## Built With

- [Claude Code](https://claude.ai/code) by Anthropic
- Claude Code Skills/Plugin system
- MCP (Model Context Protocol) for browser automation

---

## License

MIT

---

Built by [Ishaq Hassan](https://github.com/ishaquehassan)
