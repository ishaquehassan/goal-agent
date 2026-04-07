$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Goal Agent for Claude Code" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Claude Code
$claudePath = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claudePath) {
    Write-Host "ERROR: Claude Code CLI not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Claude Code first:"
    Write-Host "  npm install -g @anthropic-ai/claude-code"
    Write-Host "  Or visit: https://claude.ai/code"
    exit 1
}

# Check git
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Host "ERROR: git not found." -ForegroundColor Red
    Write-Host "Please install git first."
    exit 1
}

Write-Host "Downloading Goal Agent..." -ForegroundColor Yellow

# Clone to temp
$tempDir = Join-Path $env:TEMP "goal-agent-install-$(Get-Random)"
git clone --depth 1 --quiet https://github.com/ishaquehassan/goal-agent.git $tempDir

Write-Host "Installing plugin..." -ForegroundColor Yellow

# Install as plugin
$claudeDir = Join-Path $env:USERPROFILE ".claude"
$pluginDir = Join-Path $claudeDir "plugins\data\goal-agent@ishaquehassan"

# Clean previous install
if (Test-Path $pluginDir) {
    Remove-Item -Recurse -Force $pluginDir
}

New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null
Copy-Item -Recurse "$tempDir\*" "$pluginDir\"

# Copy skills as commands for immediate use
$commandsDir = Join-Path $claudeDir "commands\goal"
New-Item -ItemType Directory -Force -Path $commandsDir | Out-Null

Get-ChildItem (Join-Path $tempDir "skills\goal") -Directory | ForEach-Object {
    $skillName = $_.Name
    $skillFile = Join-Path $_.FullName "SKILL.md"
    if (Test-Path $skillFile) {
        Copy-Item $skillFile (Join-Path $commandsDir "$skillName.md")
    }
}

# Copy agents
$agentsDir = Join-Path $claudeDir "agents"
New-Item -ItemType Directory -Force -Path $agentsDir | Out-Null
$agentFiles = Join-Path $tempDir "agents\*.md"
if (Test-Path $agentFiles) {
    Copy-Item $agentFiles $agentsDir
}

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "Goal Agent installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  1. Open any project with Claude Code"
Write-Host '  2. Set your goal:     /goal:set "your goal here"'
Write-Host "  3. Today's priorities: /goal:next"
Write-Host "  4. Full dashboard:     /goal:status"
Write-Host ""
Write-Host "All Commands:" -ForegroundColor Cyan
Write-Host "  /goal:set        Set a new career/professional goal"
Write-Host "  /goal:next       Get today's prioritized actions"
Write-Host "  /goal:status     Full progress dashboard"
Write-Host "  /goal:log        Log today's work"
Write-Host "  /goal:research   Deep research goal requirements"
Write-Host "  /goal:optimize   Optimize social profiles (needs browser)"
Write-Host "  /goal:write      Create and publish content (needs browser)"
Write-Host "  /goal:engage     Engage with target audience (needs browser)"
Write-Host "  /goal:contacts   Manage your network"
Write-Host "  /goal:calendar   Content calendar"
Write-Host ""
Write-Host "Browser Automation (optional):" -ForegroundColor Yellow
Write-Host "  Install 'Claude in Chrome' extension in Chrome or Brave"
Write-Host "  Required for: /goal:optimize, /goal:write, /goal:engage"
Write-Host "  Without it: all other commands work perfectly"
Write-Host ""
