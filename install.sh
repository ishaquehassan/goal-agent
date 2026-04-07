#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

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
  echo "  Or visit: https://claude.com/download"
  exit 1
fi

# Check git
if ! command -v git &> /dev/null; then
  echo -e "${RED}ERROR: git not found.${NC}"
  echo "Please install git first."
  exit 1
fi

echo -e "${YELLOW}Downloading Goal Agent...${NC}"

# Clone to temp
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT
git clone --depth 1 --quiet https://github.com/ishaquehassan/goal-agent.git "$TEMP_DIR/goal-agent"

echo -e "${YELLOW}Installing plugin...${NC}"

# Install as plugin
CLAUDE_DIR="$HOME/.claude"
PLUGIN_DIR="$CLAUDE_DIR/plugins/data/goal-agent@ishaquehassan"

# Clean previous install
if [ -d "$PLUGIN_DIR" ]; then
  rm -rf "$PLUGIN_DIR"
fi

mkdir -p "$PLUGIN_DIR"
cp -r "$TEMP_DIR/goal-agent/." "$PLUGIN_DIR/"

# Copy skills as commands for immediate use
COMMANDS_DIR="$CLAUDE_DIR/commands/goal"
mkdir -p "$COMMANDS_DIR"

for skill_dir in "$TEMP_DIR/goal-agent/skills/goal"/*/; do
  if [ -d "$skill_dir" ]; then
    skill_name=$(basename "$skill_dir")
    if [ -f "$skill_dir/SKILL.md" ]; then
      cp "$skill_dir/SKILL.md" "$COMMANDS_DIR/$skill_name.md"
    fi
  fi
done

# Copy agents
AGENTS_DIR="$CLAUDE_DIR/agents"
mkdir -p "$AGENTS_DIR"
if [ -d "$TEMP_DIR/goal-agent/agents" ]; then
  cp "$TEMP_DIR/goal-agent/agents/"*.md "$AGENTS_DIR/" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}Goal Agent installed successfully!${NC}"
echo ""
echo -e "${CYAN}Quick Start:${NC}"
echo "  1. Open any project with Claude Code"
echo '  2. Set your goal:     /goal:set "your goal here"'
echo "  3. Today's priorities: /goal:next"
echo "  4. Full dashboard:     /goal:status"
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
echo ""
echo -e "${YELLOW}Browser Automation (optional):${NC}"
echo "  Install 'Claude in Chrome' extension in Chrome or Brave"
echo "  Required for: /goal:optimize, /goal:write, /goal:engage"
echo "  Without it: all other commands work perfectly"
echo ""
