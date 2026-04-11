#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

REPO_URL="https://github.com/ishaquehassan/goal-agent"
ZIP_URL="$REPO_URL/archive/refs/heads/main.zip"

PLUGIN_DIR="$HOME/.claude/plugins/data/goal-agent@ishaquehassan"
COMMANDS_DIR="$HOME/.claude/commands/goal"
AGENTS_DIR="$HOME/.claude/agents"

echo ""
echo -e "${CYAN}Goal Agent Updater${NC}"
echo ""

# Function: update via zip (no git needed)
update_via_zip() {
  echo -e "${YELLOW}Downloading latest version (zip)...${NC}"
  TEMP_DIR=$(mktemp -d)
  trap "rm -rf $TEMP_DIR" EXIT

  if command -v curl &> /dev/null; then
    curl -sL "$ZIP_URL" -o "$TEMP_DIR/goal-agent.zip"
  elif command -v wget &> /dev/null; then
    wget -q "$ZIP_URL" -O "$TEMP_DIR/goal-agent.zip"
  else
    echo -e "${RED}ERROR: Neither curl nor wget found.${NC}"
    exit 1
  fi

  if command -v unzip &> /dev/null; then
    unzip -q "$TEMP_DIR/goal-agent.zip" -d "$TEMP_DIR"
  else
    echo -e "${RED}ERROR: unzip not found.${NC}"
    exit 1
  fi

  rm -rf "$PLUGIN_DIR"
  mkdir -p "$(dirname "$PLUGIN_DIR")"
  mv "$TEMP_DIR/goal-agent-main" "$PLUGIN_DIR"
}

# Check not installed
if [ ! -d "$PLUGIN_DIR" ]; then
  echo -e "${RED}Goal Agent not installed.${NC}"
  echo "Install first: curl -sL https://raw.githubusercontent.com/ishaquehassan/goal-agent/main/install.sh | bash"
  exit 1
fi

# Update: prefer git, fallback to zip
if command -v git &> /dev/null; then
  if [ -d "$PLUGIN_DIR/.git" ]; then
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    cd "$PLUGIN_DIR"
    git fetch origin main
    git reset --hard origin/main
  else
    echo -e "${YELLOW}Upgrading to git-based install...${NC}"
    rm -rf "$PLUGIN_DIR"
    mkdir -p "$(dirname "$PLUGIN_DIR")"
    git clone --quiet "$REPO_URL.git" "$PLUGIN_DIR"
  fi
else
  update_via_zip
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
