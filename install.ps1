$ErrorActionPreference = "Stop"

$repoUrl = "https://github.com/ishaquehassan/goal-agent"
$zipUrl = "$repoUrl/archive/refs/heads/main.zip"

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

# Detect git
$hasGit = $null -ne (Get-Command git -ErrorAction SilentlyContinue)

# Check Node.js (needed for dashboard)
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "WARNING: Node.js not found." -ForegroundColor Yellow
    Write-Host "  Dashboard requires Node.js 18+."
    Write-Host "  Install: https://nodejs.org"
    Write-Host "  All CLI commands will work without it."
    Write-Host ""
} else {
    $nodeVer = [int](node -e "console.log(process.version.slice(1).split('.')[0])")
    if ($nodeVer -lt 18) {
        Write-Host "WARNING: Node.js $nodeVer found, dashboard needs 18+." -ForegroundColor Yellow
    }
}

# Setup directories
$claudeDir = Join-Path $env:USERPROFILE ".claude"
$pluginDir = Join-Path $claudeDir "plugins\data\goal-agent@ishaquehassan"
$commandsDir = Join-Path $claudeDir "commands\goal"
$agentsDir = Join-Path $claudeDir "agents"

# Function: install via zip
function Install-ViaZip {
    Write-Host "Downloading Goal Agent (zip)..." -ForegroundColor Yellow
    $tempDir = Join-Path $env:TEMP "goal-agent-install-$(Get-Random)"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    $zipFile = Join-Path $tempDir "goal-agent.zip"

    try {
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipFile -UseBasicParsing
        Expand-Archive -Path $zipFile -DestinationPath $tempDir -Force

        if (Test-Path $pluginDir) {
            Remove-Item -Recurse -Force $pluginDir
        }
        $parentDir = Split-Path $pluginDir -Parent
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
        Move-Item (Join-Path $tempDir "goal-agent-main") $pluginDir
    } finally {
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    }
}

# Install or update
$gitDir = Join-Path $pluginDir ".git"
if ($hasGit) {
    if (Test-Path $gitDir) {
        Write-Host "Existing installation found. Updating..." -ForegroundColor Yellow
        Push-Location $pluginDir
        git fetch origin main
        git reset --hard origin/main
        Pop-Location
    } elseif (Test-Path $pluginDir) {
        Write-Host "Upgrading to git-based install..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $pluginDir
        $parentDir = Split-Path $pluginDir -Parent
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
        git clone --quiet "$repoUrl.git" $pluginDir
    } else {
        Write-Host "Installing Goal Agent..." -ForegroundColor Yellow
        $parentDir = Split-Path $pluginDir -Parent
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
        git clone --quiet "$repoUrl.git" $pluginDir
    }
} else {
    Write-Host "git not found, using zip download..." -ForegroundColor Yellow
    Install-ViaZip
}

# Sync commands
Write-Host "Syncing commands..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $commandsDir | Out-Null

Get-ChildItem (Join-Path $pluginDir "skills\goal") -Directory | ForEach-Object {
    $skillName = $_.Name
    $skillFile = Join-Path $_.FullName "SKILL.md"
    if (Test-Path $skillFile) {
        Copy-Item $skillFile (Join-Path $commandsDir "$skillName.md")
    }
}

# Sync agents
New-Item -ItemType Directory -Force -Path $agentsDir | Out-Null
$agentFiles = Join-Path $pluginDir "agents\*.md"
if (Test-Path $agentFiles) {
    Copy-Item $agentFiles $agentsDir
}

# Show version
$version = "unknown"
$versionFile = Join-Path $pluginDir "version.json"
if (Test-Path $versionFile) {
    $versionData = Get-Content $versionFile | ConvertFrom-Json
    $version = $versionData.version
}

Write-Host ""
Write-Host "Goal Agent v$version installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  1. Open any project with Claude Code"
Write-Host '  2. Set your goal:     /goal:set "your goal here"'
Write-Host "  3. Today's priorities: /goal:next"
Write-Host "  4. Full dashboard:     /goal:status"
Write-Host ""
Write-Host "Dashboard:" -ForegroundColor Cyan
Write-Host "  /goal:dashboard  Open web dashboard (http://localhost:8080)"
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
Write-Host "  /goal:update     Update to latest version"
Write-Host ""
Write-Host "Update:" -ForegroundColor Cyan
Write-Host "  /goal:update     Update plugin from within Claude Code"
Write-Host '  Or run: irm https://raw.githubusercontent.com/ishaquehassan/goal-agent/main/update.ps1 | iex'
Write-Host ""
Write-Host "Browser Automation (optional):" -ForegroundColor Yellow
Write-Host "  Install 'Claude in Chrome' extension in Chrome or Brave"
Write-Host "  Required for: /goal:optimize, /goal:write, /goal:engage"
Write-Host "  Without it: all other commands work perfectly"
Write-Host ""
