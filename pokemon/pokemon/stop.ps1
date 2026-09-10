#!/usr/bin/env pwsh
# ================================================================
#   🛑 DETENIENDO POKÉPULSE TCG & BATTLE ARENA (WINDOWS)
# ================================================================

$DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $DIR

Write-Host "🛑 Deteniendo todos los servicios de PokePulse..." -ForegroundColor Yellow

# Detener backend Java
$pidFile = Join-Path $DIR ".backend.pid"
if (Test-Path $pidFile) {
    $backendPid = Get-Content $pidFile
    $proc = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $backendPid -Force
        Write-Host "✅ Backend Spring Boot detenido (PID $backendPid)." -ForegroundColor Green
    } else {
        Write-Host "ℹ️  El backend ya no estaba en ejecucion." -ForegroundColor Blue
    }
    Remove-Item $pidFile
}

# Detener contenedor Docker
Write-Host "📦 Deteniendo contenedor PostgreSQL..." -ForegroundColor Cyan
docker compose down
Write-Host "✅ PostgreSQL detenido." -ForegroundColor Green

Write-Host "`n🎉 Todos los servicios han sido detenidos." -ForegroundColor Green
