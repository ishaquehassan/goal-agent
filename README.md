<div align="center">

<br>

# 🎯 Goal Agent

<h3>Stop planning your career. Start executing it.</h3>

<br>

[![Install in 10 seconds](https://img.shields.io/badge/⚡_Install_in_10_seconds-One_Liner-00C853?style=for-the-badge&labelColor=1a1a2e)](#install)
[![Commands](https://img.shields.io/badge/Commands-10-blue?style=for-the-badge&labelColor=1a1a2e)](#all-commands-reference)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&labelColor=1a1a2e)](LICENSE)

[![macOS](https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=apple&logoColor=white)](https://www.apple.com/macos/)
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://www.microsoft.com/windows)
[![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://ubuntu.com/)

[![Claude Code](https://img.shields.io/badge/Claude_Code-6B4FBB?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai/code)
[![Chrome](https://img.shields.io/badge/Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Brave](https://img.shields.io/badge/Brave-FB542B?style=for-the-badge&logo=brave&logoColor=white)](https://brave.com/)
[![MCP](https://img.shields.io/badge/MCP-FF6B6B?style=for-the-badge)](https://modelcontextprotocol.io)

<br>

**Any goal** · **Any niche** · **Cross-platform** · **Browser automation built-in**

<br>

</div>

<table>
<tr>
<td>

```
$ /goal:set "Land a senior role at Google"

✅ Goal set: Senior Engineer at Google
📋 Category: job
⏰ Timeline: 4 months

Strategy generated:
  Phase 1 → LeetCode prep, portfolio, profile optimization
  Phase 2 → Articles, LinkedIn engagement, GitHub PRs
  Phase 3 → Referrals, applications, interview prep

Gap Analysis:
  ✅ 13 years experience (exceeds requirement)
  ⚠️  LinkedIn needs optimization for target role
  ❌ No referral connections at Google yet

$ /goal:next

Today's Priorities:
  1. [OPTIMIZE] Fix LinkedIn headline     (20 min)
  2. [ENGAGE] Comment on 3 Google posts   (30 min)
  3. [CONTENT] Write article on system design (2 hr)
  4. [NETWORK] Connect with 2 engineers   (10 min)
```

</td>
</tr>
</table>

<div align="center">

<br>

**It doesn't just plan. It opens your browser, rewrites your [LinkedIn](https://linkedin.com), publishes your articles on [Medium](https://medium.com), comments on the right posts, and tracks every move.**

<br>

| | |
|:---:|:---:|
| 🧠 **Researches** your goal requirements | 📝 **Writes** articles and posts for you |
| 🔧 **Optimizes** your [LinkedIn](https://linkedin.com)/[GitHub](https://github.com) profiles | 💬 **Engages** with target audience automatically |
| 📊 **Tracks** progress across sessions | 📅 **Plans** your weekly content calendar |
| 🎯 **Prioritizes** what to do each day | 👥 **Manages** your professional network |

<br>

</div>

---

## 🔥 Works For Any Goal

> **You bring the ambition. Goal Agent figures out the rest.**

Goal Agent auto-detects your goal type and adapts **everything**: platforms, strategy, targets, content style, engagement approach.

| Your Goal | What It Does For You |
|:----------|:---------------------|
| 🏆 **Developer Expert Programs** | Targets engineers on [LinkedIn](https://linkedin.com), suggests conference talks, tracks PRs on [GitHub](https://github.com) and articles on [Medium](https://medium.com) |
| 💼 **Land a Job at a Top Company** | [LeetCode](https://leetcode.com) prep, referral connections on [LinkedIn](https://linkedin.com), interview practice, [GitHub](https://github.com) portfolio |
| 🎬 **YouTube 100k Subscribers** | [YouTube](https://youtube.com) content planning, cross-posts to [Twitter/X](https://x.com) and [TikTok](https://tiktok.com), subscriber milestones |
| 💰 **Start Freelancing** | Portfolio building, [Upwork](https://upwork.com)/[LinkedIn](https://linkedin.com) optimization, case study content |
| 🌐 **Open Source Maintainer** | [GitHub](https://github.com) contribution tracking, project suggestions, [Discord](https://discord.com) community presence |
| 📚 **Learn a New Skill** | Study plans on [Udemy](https://udemy.com), certification tracking, mentor connections on [LinkedIn](https://linkedin.com) |
| ✨ **Something Else Entirely** | You define the platforms, milestones, and success criteria |

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
- [Chrome](https://www.google.com/chrome/) or [Brave](https://brave.com/) browser
- [Claude in Chrome](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) extension installed

**Without the extension:** The other 7 commands (`set`, `next`, `status`, `log`, `research`, `contacts`, `calendar`) work perfectly fine. You just won't be able to auto-publish or auto-engage from the terminal.

**Cross-platform:** Browser automation works on [macOS](https://www.apple.com/macos/), [Windows](https://www.microsoft.com/windows), and [Linux](https://ubuntu.com/). Keyboard shortcuts (Cmd vs Ctrl) are auto-detected.

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
| `/goal:optimize [platform]` | Optimize social profiles (`linkedin`, `github`, `twitter`, `all`) | Yes |
| `/goal:write [type]` | Create and publish content (`article`, `linkedin-post`, `cross-post`) | Yes (for publish) |
| `/goal:engage [count]` | Engage with target audience (`1`-`10`, default: `5`) | Yes |
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
| [Claude in Chrome](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) | Profile optimization, publishing, engagement | [Chrome Web Store](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) |
| [LinkedIn](https://linkedin.com) account | Networking, engagement | Log in via [Chrome](https://www.google.com/chrome/)/[Brave](https://brave.com/) |
| [GitHub](https://github.com) account | OSS goals, profile optimization | [`gh` CLI](https://cli.github.com) recommended |
| [Medium](https://medium.com) account | Article publishing | Log in via [Chrome](https://www.google.com/chrome/)/[Brave](https://brave.com/) |

---

## Built With

- [Claude Code](https://claude.ai/code) by [Anthropic](https://anthropic.com)
- [Claude Code](https://claude.ai/code) Skills/Plugin system
- [MCP](https://modelcontextprotocol.io) (Model Context Protocol) for browser automation

---

## License

MIT

---

Built by [Ishaq Hassan](https://github.com/ishaquehassan)
