#!/bin/bash

# ===========================================
# MZC LMS Frontend - Nginx 종료
# ===========================================

PID_FILE="/tmp/nginx-frontend.pid"

echo "Frontend Nginx 종료 중..."

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        kill "$PID"
        rm -f "$PID_FILE"
        echo "✓ Nginx 종료 완료 (PID: $PID)"
    else
        rm -f "$PID_FILE"
        echo "이미 종료됨"
    fi
else
    echo "실행 중인 Nginx 없음"
fi
