$ErrorActionPreference = "Stop"

$repoUrl = "https://github.com/ishaquehassan/goal-agent"
$zipUrl = "$repoUrl/archive/refs/heads/main.zip"

$pluginDir = Join-Path $env:USERPROFILE ".claude\plugins\data\goal-agent@ishaquehassan"
$commandsDir = Join-Path $env:USERPROFILE ".claude\commands\goal"
$agentsDir = Join-Path $env:USERPROFILE ".claude\agents"

Write-Host ""
Write-Host "Goal Agent Updater" -ForegroundColor Cyan
Write-Host ""

# Function: update via zip
function Update-ViaZip {
    Write-Host "Downloading latest version (zip)..." -ForegroundColor Yellow
    $tempDir = Join-Path $env:TEMP "goal-agent-update-$(Get-Random)"
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

# Check not installed
if (-not (Test-Path $pluginDir)) {
    Write-Host "Goal Agent not installed." -ForegroundColor Red
    Write-Host 'Install first: irm https://raw.githubusercontent.com/ishaquehassan/goal-agent/main/install.ps1 | iex'
    exit 1
}

# Update: prefer git, fallback to zip
$hasGit = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
$gitDir = Join-Path $pluginDir ".git"

if ($hasGit) {
    if (Test-Path $gitDir) {
        Write-Host "Pulling latest changes..." -ForegroundColor Yellow
        Push-Location $pluginDir
        git fetch origin main
        git reset --hard origin/main
        Pop-Location
    } else {
        Write-Host "Upgrading to git-based install..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $pluginDir
        $parentDir = Split-Path $pluginDir -Parent
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
        git clone --quiet "$repoUrl.git" $pluginDir
    }
} else {
    Update-ViaZip
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
$versionFile = Join-Path $pluginDir "version.json"
if (Test-Path $versionFile) {
    $versionData = Get-Content $versionFile | ConvertFrom-Json
    Write-Host ""
    Write-Host "Updated to v$($versionData.version)" -ForegroundColor Green
    Write-Host "Changes: $($versionData.changelog)" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Update complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Restart Claude Code to use new commands."
Write-Host ""
