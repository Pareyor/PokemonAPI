#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "================================================================"
echo "   ⚡ INICIANDO POKÉPULSE TCG & BATTLE ARENA (LOCALHOST)       "
echo "================================================================"

# 1. Verificar Docker
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker no parece estar en ejecución. Inicia Docker Desktop y reintenta."
    exit 1
fi

# 2. Levantar Base de Datos PostgreSQL
echo "📦 [1/3] Levantando PostgreSQL 16 con Docker en puerto 5434..."
docker compose up -d

echo "⏳ Esperando disponibilidad de PostgreSQL..."
until docker exec pokemon-postgres pg_isready -U pokemon_user -d pokemon_db >/dev/null 2>&1; do
    sleep 1
done
echo "✅ PostgreSQL listo en localhost:5434 (Base de datos: pokemon_db)"

# 3. Levantar Backend Spring Boot
echo "☕ [2/3] Levantando Backend Spring Boot en puerto 8089..."
if [ -f "$DIR/.backend.pid" ]; then
    OLD_PID=$(cat "$DIR/.backend.pid")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "ℹ️  Backend ya está corriendo con PID $OLD_PID."
    else
        rm "$DIR/.backend.pid"
    fi
fi

if [ ! -f "$DIR/.backend.pid" ]; then
    nohup java -jar "$DIR/backend/target/pokepulse-backend-1.0.0.jar" > "$DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$DIR/.backend.pid"
    echo "⏳ Esperando inicialización del backend (PID $BACKEND_PID)..."
    
    for i in {1..30}; do
        if curl -s http://localhost:8089/api/trainer/profile >/dev/null 2>&1; then
            echo "✅ Backend Spring Boot iniciado con éxito."
            break
        fi
        sleep 1
    done
fi

# 4. Resumen de accesos
echo ""
echo "================================================================"
echo "🎉 ¡SERVICIOS ACTIVOS EN LOCALHOST!"
echo "----------------------------------------------------------------"
echo "🌐 Frontend (React + TS)  : http://localhost:3001"
echo "⚙️  Backend (Spring Boot)  : http://localhost:8089"
echo "📖 API Swagger UI         : http://localhost:8089/swagger-ui.html"
echo "🗄️  PostgreSQL 16          : localhost:5434 (user: pokemon_user)"
echo "----------------------------------------------------------------"
echo "💡 Para detener todos los servicios ejecuta: ./stop.sh"
echo "================================================================"
echo ""
echo "⚛️  [3/3] Iniciando servidor de desarrollo Frontend (Vite)..."
cd "$DIR/frontend"
npm run dev
