#!/usr/bin/env pwsh
# ================================================================
#    ⚡ INICIANDO POKÉPULSE TCG & BATTLE ARENA (WINDOWS)
# ================================================================

$ErrorActionPreference = "Stop"
$DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $DIR

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   ⚡ INICIANDO POKEPULSE TCG & BATTLE ARENA (LOCALHOST)        " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Verificar Docker
Write-Host "`n🐋 Verificando Docker..." -ForegroundColor Cyan
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker no parece estar en ejecucion. Inicia Docker Desktop y reintenta." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker activo." -ForegroundColor Green

# 2. Levantar Base de Datos PostgreSQL
Write-Host "`n📦 [1/3] Levantando PostgreSQL 16 con Docker en puerto 5434..." -ForegroundColor Cyan
docker compose up -d

Write-Host "⏳ Esperando disponibilidad de PostgreSQL..." -ForegroundColor Yellow
$maxWait = 30
$waited = 0
do {
    Start-Sleep -Seconds 1
    $waited++
    $result = docker exec pokemon-postgres pg_isready -U pokemon_user -d pokemon_db 2>&1
    if ($LASTEXITCODE -eq 0) { break }
} while ($waited -lt $maxWait)

if ($waited -ge $maxWait) {
    Write-Host "❌ PostgreSQL no respondio a tiempo. Revisa Docker." -ForegroundColor Red
    exit 1
}
Write-Host "✅ PostgreSQL listo en localhost:5434 (Base de datos: pokemon_db)" -ForegroundColor Green

# 3. Levantar Backend Spring Boot
Write-Host "`n☕ [2/3] Levantando Backend Spring Boot en puerto 8089..." -ForegroundColor Cyan

$pidFile = Join-Path $DIR ".backend.pid"
$jarPath = Join-Path $DIR "backend\target\pokepulse-backend-1.0.0.jar"

if (-not (Test-Path $jarPath)) {
    Write-Host "⚠️  JAR no encontrado. Compilando backend con Maven..." -ForegroundColor Yellow
    Set-Location (Join-Path $DIR "backend")
    mvn package -DskipTests
    Set-Location $DIR
}

$backendRunning = $false
if (Test-Path $pidFile) {
    $oldPid = Get-Content $pidFile
    $proc = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "ℹ️  Backend ya esta corriendo con PID $oldPid." -ForegroundColor Blue
        $backendRunning = $true
    } else {
        Remove-Item $pidFile
    }
}

if (-not $backendRunning) {
    $logPath = Join-Path $DIR "backend.log"
    $process = Start-Process -FilePath "java" -ArgumentList "-jar", "`"$jarPath`"" `
        -RedirectStandardOutput $logPath -RedirectStandardError $logPath `
        -NoNewWindow -PassThru
    $process.Id | Out-File $pidFile -Encoding UTF8
    Write-Host "⏳ Esperando inicializacion del backend (PID $($process.Id))..." -ForegroundColor Yellow

    $backendReady = $false
    for ($i = 1; $i -le 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:8089/api/trainer/profile" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.StatusCode -lt 500) {
                $backendReady = $true
                break
            }
        } catch { }
    }
    if ($backendReady) {
        Write-Host "✅ Backend Spring Boot iniciado con exito." -ForegroundColor Green
    } else {
        Write-Host "⚠️  El backend puede tardar unos segundos mas. Revisa backend.log si hay errores." -ForegroundColor Yellow
    }
}

# 4. Resumen de accesos
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🎉 ¡SERVICIOS ACTIVOS EN LOCALHOST!" -ForegroundColor Green
Write-Host "----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "🌐 Frontend (React + TS)  : http://localhost:3001" -ForegroundColor White
Write-Host "⚙️  Backend (Spring Boot)  : http://localhost:8089" -ForegroundColor White
Write-Host "📖 API Swagger UI         : http://localhost:8089/swagger-ui.html" -ForegroundColor White
Write-Host "🗄️  PostgreSQL 16          : localhost:5434 (user: pokemon_user)" -ForegroundColor White
Write-Host "----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "💡 Para detener todos los servicios ejecuta: .\stop.ps1" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 5. Iniciar Frontend (Vite) — bloquea la terminal en foreground
Write-Host "⚛️  [3/3] Iniciando servidor de desarrollo Frontend (Vite)..." -ForegroundColor Cyan
Set-Location (Join-Path $DIR "frontend")
npm run dev
