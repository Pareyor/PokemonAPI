#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🛑 Deteniendo servicios de PokéPulse..."

# 1. Detener Backend
if [ -f "$DIR/.backend.pid" ]; then
    PID=$(cat "$DIR/.backend.pid")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "☕ Deteniendo proceso Backend (PID $PID)..."
        kill "$PID" 2>/dev/null || true
    fi
    rm -f "$DIR/.backend.pid"
fi

PID_8089=$(lsof -ti :8089 2>/dev/null || true)
if [ -n "$PID_8089" ]; then
    kill -9 $PID_8089 2>/dev/null || true
fi

# 2. Detener Docker PostgreSQL
echo "📦 Deteniendo contenedor PostgreSQL..."
docker compose down

echo "✅ Todos los servicios de PokéPulse han sido detenidos."
