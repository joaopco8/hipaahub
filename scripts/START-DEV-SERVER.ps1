# Script para iniciar o servidor Next.js corretamente
# Execute: .\scripts\START-DEV-SERVER.ps1

Write-Host "🛑 Parando processos Node existentes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "🧹 Limpando cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cache .next removido" -ForegroundColor Green
}

Write-Host "🚀 Iniciando servidor Next.js..." -ForegroundColor Green
Write-Host "Aguarde a mensagem 'Ready' antes de acessar http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Iniciar servidor
pnpm dev
