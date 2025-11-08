#!/bin/bash

# Script de deployment automático para VPS (Digital Ocean)
# eGold Discord Bot - Strangers RP

echo "🚀 Iniciando deployment en VPS..."

# Detener el proceso PM2 anterior
pm2 stop egold-bot 2>/dev/null || true
pm2 delete egold-bot 2>/dev/null || true

# Actualizar código desde Git
git pull origin main

# Instalar dependencias
npm install --production

# Iniciar con PM2
pm2 start watchdog.js --name egold-bot --max-memory-restart 400M

# Guardar configuración PM2
pm2 save

echo "✅ Deployment completado!"
echo "📊 Ver logs: pm2 logs egold-bot"
echo "📈 Ver estado: pm2 status"
