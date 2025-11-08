# 🚀 Guía de Deployment - VPS Digital Ocean

## 📋 Requisitos Previos

- VPS con Ubuntu 20.04+ (recomendado: 2GB RAM, 1 vCPU)
- Node.js 18+ instalado
- PM2 instalado globalmente
- Git instalado
- PostgreSQL instalado (opcional, puedes usar database externo)

## 🔧 Configuración Inicial del VPS

### 1. Instalar Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verificar instalación
```

### 2. Instalar PM2

```bash
sudo npm install -g pm2
pm2 --version  # Verificar instalación
```

### 3. Clonar el Repositorio

```bash
cd /home/
git clone <TU_REPOSITORIO_GIT>
cd egold-discord-bot
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env`:

```bash
nano .env
```

Agrega las siguientes variables:

```env
DISCORD_BOT_TOKEN=tu_token_aqui
DISCORD_DEV_BOT_TOKEN=tu_dev_token_aqui
SESSION_SECRET=un_secreto_aleatorio_aqui
DATABASE_URL=postgresql://usuario:password@localhost:5432/egold_db

# Opcionales (solo si usas IA)
OPENAI_API_KEY=tu_key_aqui
GEMINI_API_KEY=tu_key_aqui

# Opcionales (solo si usas monitoreo de redes sociales)
TWITCH_CLIENT_ID=tu_client_id
TWITCH_ACCESS_TOKEN=tu_token
YOUTUBE_API_KEY=tu_key
```

Guarda con `Ctrl+X`, luego `Y`, luego `Enter`.

### 5. Instalar Dependencias

```bash
npm install --production
```

### 6. Iniciar el Bot con PM2

```bash
pm2 start watchdog.js --name egold-bot --max-memory-restart 400M
pm2 save
pm2 startup  # Configurar auto-inicio
```

## 📊 Comandos Útiles PM2

```bash
# Ver estado del bot
pm2 status

# Ver logs en tiempo real
pm2 logs egold-bot

# Ver logs específicos
pm2 logs egold-bot --lines 100

# Reiniciar el bot
pm2 restart egold-bot

# Detener el bot
pm2 stop egold-bot

# Eliminar el proceso
pm2 delete egold-bot

# Monitorear recursos
pm2 monit
```

## 🔄 Actualizar el Bot

Cada vez que hagas cambios en el código:

### Opción 1: Script Automático

```bash
./deploy-vps.sh
```

### Opción 2: Manual

```bash
git pull origin main
npm install --production
pm2 restart egold-bot
```

## 🗄️ Configuración de PostgreSQL (Opcional)

Si usas base de datos local en el VPS:

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE egold_db;
CREATE USER egold_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE egold_db TO egold_user;
\q

# Actualizar DATABASE_URL en .env
DATABASE_URL=postgresql://egold_user:tu_password@localhost:5432/egold_db
```

## 🔐 Seguridad

### 1. Configurar Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

### 2. Proteger .env

```bash
chmod 600 .env
```

### 3. Configurar Auto-Updates (Opcional)

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 📈 Monitoreo

### Ver uso de recursos:

```bash
htop  # Instalar con: sudo apt install htop
```

### Ver logs del sistema:

```bash
pm2 logs egold-bot --lines 200
```

## 🆘 Solución de Problemas

### El bot no inicia:

```bash
# Ver logs de error
pm2 logs egold-bot --err

# Verificar variables de entorno
cat .env
```

### El bot se reinicia constantemente:

```bash
# Ver logs
pm2 logs egold-bot --lines 100

# Verificar uso de memoria
pm2 monit
```

### Actualizar dependencias:

```bash
npm update
pm2 restart egold-bot
```

## 💡 Tips

- **Backups automáticos**: Configura backups diarios de la base de datos
- **Monitoreo externo**: Usa servicios como UptimeRobot para monitorear disponibilidad
- **Logs rotativos**: PM2 maneja automáticamente la rotación de logs
- **Auto-restart**: PM2 reinicia el bot automáticamente si falla

## 🔗 Enlaces Útiles

- [PM2 Documentación](https://pm2.keymetrics.io/docs/)
- [Digital Ocean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Discord.js Guía](https://discord.js.org/)

---

**¡Tu bot está listo para producción 24/7!** 🎉
