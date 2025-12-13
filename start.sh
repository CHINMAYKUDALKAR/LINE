#!/bin/bash

# =========================================
# Lineup Development Environment Starter
# =========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   🚀 Starting Lineup Development Env   ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i:"$1" >/dev/null 2>&1
}

# =========================================
# 1. Check Prerequisites
# =========================================
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm: $(npm -v)${NC}"

# =========================================
# 2. Start Redis (if not running)
# =========================================
echo ""
echo -e "${YELLOW}🔴 Checking Redis...${NC}"

if port_in_use 6379; then
    echo -e "${GREEN}✅ Redis is already running on port 6379${NC}"
else
    if command_exists redis-server; then
        echo -e "${BLUE}Starting Redis...${NC}"
        redis-server --daemonize yes
        sleep 1
        echo -e "${GREEN}✅ Redis started${NC}"
    elif command_exists brew; then
        echo -e "${BLUE}Starting Redis via Homebrew...${NC}"
        brew services start redis 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ Redis started${NC}"
    else
        echo -e "${RED}⚠️  Redis not found - queues won't work${NC}"
        echo -e "${YELLOW}   Install with: brew install redis${NC}"
    fi
fi

# =========================================
# 3. Start MailHog (if not running)
# =========================================
echo ""
echo -e "${YELLOW}📧 Checking MailHog...${NC}"

if port_in_use 8025; then
    echo -e "${GREEN}✅ MailHog is already running on port 8025${NC}"
else
    if command_exists MailHog; then
        echo -e "${BLUE}Starting MailHog...${NC}"
        MailHog -api-bind-addr 127.0.0.1:8025 -smtp-bind-addr 127.0.0.1:1025 -ui-bind-addr 127.0.0.1:8025 &
        sleep 1
        echo -e "${GREEN}✅ MailHog started${NC}"
    elif command_exists brew; then
        echo -e "${BLUE}Starting MailHog via Homebrew...${NC}"
        brew services start mailhog 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ MailHog started${NC}"
    else
        echo -e "${RED}⚠️  MailHog not found - emails won't be captured${NC}"
        echo -e "${YELLOW}   Install with: brew install mailhog${NC}"
    fi
fi

# =========================================
# 4. Start Backend
# =========================================
echo ""
echo -e "${YELLOW}🔧 Starting Backend...${NC}"

if port_in_use 4000; then
    echo -e "${GREEN}✅ Backend already running on port 4000${NC}"
else
    cd "$SCRIPT_DIR/lineup-backend"
    
    # Install deps if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Start backend in background
    echo -e "${BLUE}Starting NestJS backend...${NC}"
    npm run start:dev > /tmp/lineup-backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    echo -e "${BLUE}Waiting for backend to start...${NC}"
    for i in {1..30}; do
        if port_in_use 4000; then
            echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
            break
        fi
        sleep 1
    done
fi

# =========================================
# 5. Start Frontend
# =========================================
echo ""
echo -e "${YELLOW}🎨 Starting Frontend...${NC}"

if port_in_use 3000; then
    echo -e "${GREEN}✅ Frontend already running on port 3000${NC}"
else
    cd "$SCRIPT_DIR/lineup-frontend"
    
    # Install deps if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start frontend in background
    echo -e "${BLUE}Starting Next.js frontend...${NC}"
    npm run dev > /tmp/lineup-frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    echo -e "${BLUE}Waiting for frontend to start...${NC}"
    for i in {1..30}; do
        if port_in_use 3000; then
            echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
            break
        fi
        sleep 1
    done
fi

# =========================================
# 6. Summary
# =========================================
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}   ✅ Lineup is ready!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "🌐 Frontend:    ${GREEN}http://localhost:3000${NC}"
echo -e "🔌 Backend API: ${GREEN}http://localhost:4000${NC}"
echo -e "📧 MailHog:     ${GREEN}http://localhost:8025${NC}"
echo ""
echo -e "📝 Login: ${YELLOW}admin@mintskill.com${NC} / ${YELLOW}password123${NC}"
echo ""
echo -e "📋 Logs:"
echo -e "   Backend:  tail -f /tmp/lineup-backend.log"
echo -e "   Frontend: tail -f /tmp/lineup-frontend.log"
echo ""

# Open browser
if command_exists open; then
    sleep 2
    open http://localhost:3000
fi

echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running and cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    pkill -f "lineup-backend" 2>/dev/null || true
    pkill -f "lineup-frontend" 2>/dev/null || true
    echo -e "${GREEN}Done!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait forever
while true; do
    sleep 1
done
