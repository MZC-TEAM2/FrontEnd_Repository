#!/bin/bash

# ===========================================
# MZC LMS Frontend - 개발 서버 + Nginx 실행
# ===========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/nginx-frontend.pid"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║     MZC LMS Frontend - Development Mode   ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Nginx 설정 (개발용)
NGINX_DEV_CONF="/tmp/nginx-frontend-dev.conf"

cat > "$NGINX_DEV_CONF" << 'EOF'
worker_processes auto;
error_log /tmp/nginx-frontend-error.log;
pid /tmp/nginx-frontend.pid;

events {
    worker_connections 1024;
}

http {
    include /opt/homebrew/etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log /tmp/nginx-frontend-access.log;

    server {
        listen 80;
        server_name localhost;

        # Vite 개발 서버로 프록시
        location / {
            proxy_pass http://localhost:5173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # API 프록시
        location /api/ {
            proxy_pass http://localhost:8080;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Connection '';
            proxy_buffering off;
            proxy_cache off;
            proxy_read_timeout 86400s;
        }

        # Video 서버 프록시
        location /videos/ {
            proxy_pass http://localhost:8090/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            client_max_body_size 5G;
            proxy_request_buffering off;
        }
    }
}
EOF

# 기존 Nginx 종료
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo -e "${YELLOW}기존 Nginx 프로세스 종료...${NC}"
        sudo kill "$OLD_PID" 2>/dev/null || true
        sleep 1
    fi
fi

# Nginx 시작
echo -e "${YELLOW}Nginx 시작 (80 → 5173 프록시)...${NC}"
sudo nginx -c "$NGINX_DEV_CONF"
echo -e "${GREEN}✓ Nginx 시작 완료${NC}"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Frontend:  http://localhost              ║${NC}"
echo -e "${GREEN}║  (Vite HMR 지원)                          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Vite 개발 서버 실행
cd "$SCRIPT_DIR"
npm run dev
