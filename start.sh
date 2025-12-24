#!/bin/bash

# ===========================================
# MZC LMS Frontend - Nginx + React 실행
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONF="$SCRIPT_DIR/nginx/nginx.conf"
PID_FILE="/tmp/nginx-frontend.pid"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   MZC LMS Frontend (5-Tier Arch)      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""

# 1. 기존 Nginx 종료
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo -e "${YELLOW}▶ 기존 Nginx 종료...${NC}"
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
    fi
fi

# 2. Nginx 시작
echo -e "${YELLOW}▶ Nginx 시작 (3000 → 5173)...${NC}"
nginx -c "$NGINX_CONF"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx 시작 완료${NC}"
else
    echo -e "${RED}✗ Nginx 시작 실패${NC}"
    exit 1
fi

# 3. React (Vite) 실행
echo -e "${YELLOW}▶ React 개발 서버 시작...${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  http://localhost:3000 (Nginx → React)${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

cd "$SCRIPT_DIR"
npm run dev
