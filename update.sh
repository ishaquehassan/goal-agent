#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

PLUGIN_DIR="$HOME/.claude/plugins/data/goal-agent@ishaquehassan"
COMMANDS_DIR="$HOME/.claude/commands/goal"
AGENTS_DIR="$HOME/.claude/agents"

echo ""
echo -e "${CYAN}Goal Agent Updater${NC}"
echo ""

# Check git
if ! command -v git &> /dev/null; then
  echo -e "${RED}ERROR: git not found.${NC}"
  exit 1
fi

# Check installation type
if [ -d "$PLUGIN_DIR/.git" ]; then
  echo -e "${YELLOW}Pulling latest changes...${NC}"
  cd "$PLUGIN_DIR"
  git fetch origin main
  git reset --hard origin/main
elif [ -d "$PLUGIN_DIR" ]; then
  echo -e "${YELLOW}Upgrading from copy-based to git-based install...${NC}"
  rm -rf "$PLUGIN_DIR"
  mkdir -p "$(dirname "$PLUGIN_DIR")"
  git clone --quiet https://github.com/ishaquehassan/goal-agent.git "$PLUGIN_DIR"
else
  echo -e "${RED}Goal Agent not installed.${NC}"
  echo "Install first: curl -sL https://raw.githubusercontent.com/ishaquehassan/goal-agent/main/install.sh | bash"
  exit 1
fi

# Sync commands
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
cp "$PLUGIN_DIR/agents/"*.md "$AGENTS_DIR/" 2>/dev/null || true

# Show version
if [ -f "$PLUGIN_DIR/version.json" ]; then
  VERSION=$(grep '"version"' "$PLUGIN_DIR/version.json" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
  CHANGELOG=$(grep '"changelog"' "$PLUGIN_DIR/version.json" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
  echo ""
  echo -e "${GREEN}Updated to v${VERSION}${NC}"
  echo -e "${CYAN}Changes: ${CHANGELOG}${NC}"
else
  echo ""
  echo -e "${GREEN}Update complete!${NC}"
fi

echo ""
echo "Restart Claude Code to use new commands."
echo ""
