#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

REPO_URL="https://github.com/ishaquehassan/goal-agent"
ZIP_URL="$REPO_URL/archive/refs/heads/main.zip"

echo ""
echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}  Goal Agent for Claude Code${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Check Claude Code
if ! command -v claude &> /dev/null; then
  echo -e "${RED}ERROR: Claude Code CLI not found.${NC}"
  echo ""
  echo "Install Claude Code first:"
  echo "  npm install -g @anthropic-ai/claude-code"
  echo "  Or visit: https://claude.ai/code"
  exit 1
fi

# Detect git
HAS_GIT=false
if command -v git &> /dev/null; then
  HAS_GIT=true
fi

# Check Node.js (needed for dashboard)
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}WARNING: Node.js not found.${NC}"
  echo "  Dashboard requires Node.js 18+."
  echo "  Install: https://nodejs.org or 'brew install node'"
  echo "  All CLI commands will work without it."
  echo ""
else
  NODE_VER=$(node -e "console.log(process.version.slice(1).split('.')[0])")
  if [ "$NODE_VER" -lt 18 ]; then
    echo -e "${YELLOW}WARNING: Node.js $NODE_VER found, dashboard needs 18+.${NC}"
  fi
fi

# Setup directories
CLAUDE_DIR="$HOME/.claude"
PLUGIN_DIR="$CLAUDE_DIR/plugins/data/goal-agent@ishaquehassan"
COMMANDS_DIR="$CLAUDE_DIR/commands/goal"
AGENTS_DIR="$CLAUDE_DIR/agents"

# Function: download via zip (no git needed)
install_via_zip() {
  echo -e "${YELLOW}Downloading Goal Agent (zip)...${NC}"
  TEMP_DIR=$(mktemp -d)
  trap "rm -rf $TEMP_DIR" EXIT

  if command -v curl &> /dev/null; then
    curl -sL "$ZIP_URL" -o "$TEMP_DIR/goal-agent.zip"
  elif command -v wget &> /dev/null; then
    wget -q "$ZIP_URL" -O "$TEMP_DIR/goal-agent.zip"
  else
    echo -e "${RED}ERROR: Neither curl nor wget found. Cannot download.${NC}"
    exit 1
  fi

  # Extract
  if command -v unzip &> /dev/null; then
    unzip -q "$TEMP_DIR/goal-agent.zip" -d "$TEMP_DIR"
  else
    echo -e "${RED}ERROR: unzip not found. Cannot extract.${NC}"
    exit 1
  fi

  # Move extracted folder to plugin dir
  rm -rf "$PLUGIN_DIR"
  mkdir -p "$(dirname "$PLUGIN_DIR")"
  mv "$TEMP_DIR/goal-agent-main" "$PLUGIN_DIR"
}

# Install or update
if [ "$HAS_GIT" = true ]; then
  if [ -d "$PLUGIN_DIR/.git" ]; then
    echo -e "${YELLOW}Existing installation found. Updating...${NC}"
    cd "$PLUGIN_DIR"
    git fetch origin main
    git reset --hard origin/main
  elif [ -d "$PLUGIN_DIR" ]; then
    echo -e "${YELLOW}Upgrading to git-based install...${NC}"
    rm -rf "$PLUGIN_DIR"
    mkdir -p "$(dirname "$PLUGIN_DIR")"
    git clone --quiet "$REPO_URL.git" "$PLUGIN_DIR"
  else
    echo -e "${YELLOW}Installing Goal Agent...${NC}"
    mkdir -p "$(dirname "$PLUGIN_DIR")"
    git clone --quiet "$REPO_URL.git" "$PLUGIN_DIR"
  fi
else
  echo -e "${YELLOW}git not found, using zip download...${NC}"
  install_via_zip
fi

# Sync skills as commands
echo -e "${YELLOW}Syncing commands...${NC}"
mkdir -p "$COMMANDS_DIR"

for skill_dir in "$PLUGIN_DIR/skills/goal"/*/; do
  if [ -d "$skill_dir" ]; then
    skill_name=$(basename "$skill_dir")
    if [ -f "$skill_dir/SKILL.md" ]; then
      cp "$skill_dir/SKILL.md" "$COMMANDS_DIR/$skill_name.md"
    fi
  fi
done

# Sync agents
mkdir -p "$AGENTS_DIR"
if [ -d "$PLUGIN_DIR/agents" ]; then
  cp "$PLUGIN_DIR/agents/"*.md "$AGENTS_DIR/" 2>/dev/null || true
fi

# Show version
VERSION="unknown"
if [ -f "$PLUGIN_DIR/version.json" ]; then
  VERSION=$(grep '"version"' "$PLUGIN_DIR/version.json" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
fi

echo ""
echo -e "${GREEN}Goal Agent v${VERSION} installed successfully!${NC}"
echo ""
echo -e "${CYAN}Quick Start:${NC}"
echo "  1. Open any project with Claude Code"
echo '  2. Set your goal:     /goal:set "your goal here"'
echo "  3. Today's priorities: /goal:next"
echo "  4. Full dashboard:     /goal:status"
echo ""
echo -e "${CYAN}Dashboard:${NC}"
echo "  /goal:dashboard  Open web dashboard (http://localhost:8080)"
echo ""
echo -e "${CYAN}All Commands:${NC}"
echo "  /goal:set        Set a new career/professional goal"
echo "  /goal:next       Get today's prioritized actions"
echo "  /goal:status     Full progress dashboard"
echo "  /goal:log        Log today's work"
echo "  /goal:research   Deep research goal requirements"
echo "  /goal:optimize   Optimize social profiles (needs browser)"
echo "  /goal:write      Create and publish content (needs browser)"
echo "  /goal:engage     Engage with target audience (needs browser)"
echo "  /goal:contacts   Manage your network"
echo "  /goal:calendar   Content calendar"
echo "  /goal:update     Update to latest version"
echo ""
echo -e "${CYAN}Update:${NC}"
echo "  /goal:update     Update plugin from within Claude Code"
echo "  Or run: curl -sL https://raw.githubusercontent.com/ishaquehassan/goal-agent/main/update.sh | bash"
echo ""
echo -e "${YELLOW}Browser Automation (optional):${NC}"
echo "  Install 'Claude in Chrome' extension in Chrome or Brave"
echo "  Required for: /goal:optimize, /goal:write, /goal:engage"
echo "  Without it: all other commands work perfectly"
echo ""
