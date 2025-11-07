# 🚀 eGold Bot - Instrucciones de Despliegue

## 📦 PASO 1: Descargar el Proyecto Limpio

**EN REPLIT:**
1. Panel izquierdo (Files)
2. Buscar: `egold-bot-clean.tar.gz` (35MB)
3. Click derecho → **Download**
4. Se descarga a tu carpeta de Descargas

---

## 📤 PASO 2: Subir a GitHub

**EN POWERSHELL (Windows):**

```powershell
# 1. Ir a la carpeta de Descargas
cd $HOME\Downloads

# 2. Crear carpeta temporal
mkdir egold-temp
cd egold-temp

# 3. Extraer el proyecto
tar -xzf ..\egold-bot-clean.tar.gz

# 4. Inicializar Git
git init
git branch -M main

# 5. Configurar Git (usa TU email)
git config user.email "tu_email@ejemplo.com"
git config user.name "egolatrada"

# 6. Conectar con GitHub
git remote add origin https://github.com/egolatrada/egopro.git

# 7. Subir TODO
git add .
git commit -m "eGold Bot v2.0 - Proyecto limpio sin IA"
git push -u origin main --force
```

**NOTA:** Usa `--force` porque estás reemplazando todo el contenido anterior.

---

## 🚀 PASO 3: Desplegar en DigitalOcean

**CONECTAR AL SERVIDOR:**
```bash
ssh root@164.92.172.108
```

**INSTALAR EL BOT:**
```bash
# 1. Limpiar instalación anterior
pm2 delete eGold-bot 2>/dev/null || true
rm -rf /root/bot
mkdir /root/bot
cd /root/bot

# 2. Clonar desde GitHub
git clone https://github.com/egolatrada/egopro.git .

# 3. Instalar dependencias
npm install

# 4. Crear archivo .env
cat > .env << 'EOF'
# Discord Bot Token
DISCORD_BOT_TOKEN=TU_TOKEN_DISCORD_AQUI

# PostgreSQL Database
DATABASE_URL=postgresql://botuser:Eg010tradaSSH!8cho@localhost:5432/discord_bot
PGHOST=localhost
PGPORT=5432
PGUSER=botuser
PGPASSWORD=Eg010tradaSSH!8cho
PGDATABASE=discord_bot

# Environment
NODE_ENV=production
EOF

# 5. IMPORTANTE: Editar .env con el token real
nano .env
# Pega tu token de Discord donde dice TU_TOKEN_DISCORD_AQUI
# Guardar: Ctrl+X, Y, Enter

# 6. Iniciar bot con PM2
pm2 start watchdog.js --name eGold-bot

# 7. Configurar autostart
pm2 save
pm2 startup
# COPIAR Y EJECUTAR el comando que te da PM2

# 8. Ver logs en tiempo real
pm2 logs eGold-bot
```

---

## ✅ Verificación

Deberías ver en los logs:

```
🎉 Bot iniciado como Ego Bot#XXXX
✅ Comandos cargados: 19
🛡️ Sistema de moderación iniciado
🎫 Sistema de tickets iniciado
💚 Bot HEALTHY - Heartbeat actualizado
```

---

## 🔧 Comandos Útiles

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs eGold-bot

# Reiniciar bot
pm2 restart eGold-bot

# Detener bot
pm2 stop eGold-bot

# Actualizar desde GitHub
cd /root/bot
git pull
npm install
pm2 restart eGold-bot
```

---

## 📋 Cambios Implementados

✅ Eliminado `@google/genai` y `openai` de package.json
✅ Agregado `dotenv` para leer variables de entorno
✅ Watchdog.js ahora carga `.env` correctamente
✅ Sistema de IA completamente deshabilitado
✅ Moderación funciona sin IA
✅ Sistema de tickets con numeración por categoría
✅ Logs de staff, moderación y acciones
✅ Sistema de verificación
✅ Gestión de tareas simplificada

---

## 🆘 Solución de Problemas

**Error: Token inválido**
```bash
nano /root/bot/.env
# Verificar que DISCORD_BOT_TOKEN esté correcto
pm2 restart eGold-bot
```

**Error: Base de datos**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql
# Verificar conexión
psql -U botuser -d discord_bot -h localhost
```

**Bot no responde**
```bash
pm2 logs eGold-bot --lines 100
# Buscar errores en rojo
```

---

## 📞 Información del Servidor

- **IP:** 164.92.172.108
- **OS:** Ubuntu 22.04 LTS
- **Plan:** DigitalOcean Basic Droplet ($18/mes)
- **RAM:** 2GB
- **CPUs:** 2 vCPUs
- **Storage:** 50GB SSD

---

## 🎯 Objetivo: 99.99% Uptime

El bot usa:
- **Watchdog.js**: Reinicia automáticamente si falla
- **PM2**: Gestor de procesos con autostart
- **Health checks**: Sistema de monitoreo interno
- **PostgreSQL**: Base de datos persistente

**¡Todo listo para producción!** 🚀
