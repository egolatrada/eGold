# 🚀 Comandos Rápidos - Oracle Cloud VPS

Guía de referencia rápida para gestionar tu bot en Oracle Cloud VPS.

---

## 🔐 Conectarse al VPS

### Windows (PuTTY):
1. Abre PuTTY
2. Selecciona tu sesión guardada: `Oracle Bot`
3. Haz clic en **Open**

### Mac/Linux/PowerShell:
```bash
ssh -i ~/ruta/a/tu/clave.key ubuntu@TU_IP_PUBLICA
```

---

## 📊 Estado del Bot

### Ver si está corriendo:
```bash
pm2 status
```

### Ver logs en tiempo real:
```bash
pm2 logs discord-bot
```

### Ver últimas 100 líneas:
```bash
pm2 logs discord-bot --lines 100
```

### Monitoreo en tiempo real (CPU/RAM):
```bash
pm2 monit
```

---

## 🔄 Gestión del Bot

### Reiniciar:
```bash
pm2 restart discord-bot
```

### Detener:
```bash
pm2 stop discord-bot
```

### Iniciar:
```bash
pm2 start discord-bot
```

### Reiniciar si se cae:
```bash
pm2 resurrect
```

---

## 📥 Actualizar Código desde GitHub

```bash
cd ~/nombre-repositorio
git pull
npm install
pm2 restart discord-bot
pm2 logs discord-bot --lines 50
```

---

## 🗄️ Base de Datos PostgreSQL

### Acceder a la base de datos:
```bash
psql -U botuser -d discord_bot -h localhost
```

### Ver tablas:
```sql
\dt
```

### Ver tareas:
```sql
SELECT * FROM simple_tasks;
```

### Salir de PostgreSQL:
```sql
\q
```

### Hacer backup:
```bash
pg_dump -U botuser -d discord_bot -h localhost > backup_$(date +%Y%m%d).sql
```

### Restaurar backup:
```bash
psql -U botuser -d discord_bot -h localhost < backup_20250106.sql
```

---

## 🛠️ Mantenimiento del VPS

### Actualizar sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

### Reiniciar VPS:
```bash
sudo reboot
```

### Ver espacio en disco:
```bash
df -h
```

### Ver uso de RAM:
```bash
free -h
```

### Ver procesos (CPU/RAM por app):
```bash
htop
```
Salir: `F10`

---

## 🧹 Limpieza

### Limpiar logs de PM2:
```bash
pm2 flush
```

### Limpiar logs del sistema:
```bash
sudo journalctl --vacuum-time=7d
```

### Limpiar paquetes no usados:
```bash
sudo apt autoremove -y
sudo apt clean
```

---

## 🔥 Firewall

### Ver reglas:
```bash
sudo ufw status
```

### Permitir puerto:
```bash
sudo ufw allow NUMERO_PUERTO/tcp
```

### Denegar puerto:
```bash
sudo ufw deny NUMERO_PUERTO/tcp
```

---

## 🐛 Solución Rápida de Problemas

### Bot offline:
```bash
pm2 restart discord-bot
pm2 logs discord-bot --lines 50
```

### Error "Cannot find module":
```bash
cd ~/nombre-repositorio
npm install
pm2 restart discord-bot
```

### Base de datos no conecta:
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### VPS muy lenta:
```bash
htop
# Busca procesos que consuman mucho CPU/RAM
# Presiona F9 para matar procesos problemáticos
```

---

## 📝 Variables de Entorno

### Editar .env:
```bash
nano ~/nombre-repositorio/.env
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### Ver .env (sin mostrar valores):
```bash
cat ~/nombre-repositorio/.env | grep -v "="
```

---

## 🔄 Rutina de Mantenimiento Recomendada

### Diaria (Opcional):
```bash
pm2 status
```

### Semanal:
```bash
pm2 logs discord-bot --lines 100
```

### Mensual:
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
# Esperar 2 minutos y reconectarse
pm2 status
```

---

## 🆘 Emergencia: Bot no funciona

**Ejecuta estos comandos en orden:**

```bash
# 1. Ver estado
pm2 status

# 2. Ver logs
pm2 logs discord-bot --lines 50

# 3. Reiniciar bot
pm2 restart discord-bot

# 4. Si aún no funciona, reinstalar dependencias
cd ~/nombre-repositorio
npm install
pm2 restart discord-bot

# 5. Si aún no funciona, verificar base de datos
sudo systemctl status postgresql

# 6. Si nada funciona, reiniciar VPS
sudo reboot
```

---

## 📞 Información Importante

### IP Pública de tu VPS:
```
Copia aquí tu IP: ___________________
```

### Usuario SSH:
```
ubuntu
```

### Ubicación de archivos:
```
Código del bot: ~/nombre-repositorio/
Logs de PM2: ~/.pm2/logs/
Backups DB: ~/backups/
```

### Contraseñas importantes:
```
PostgreSQL User: botuser
PostgreSQL Password: ___________________
Discord Bot Token: (ver .env)
```

---

## 🎯 Atajos Útiles

### Ver todo el estado del sistema de un vistazo:
```bash
echo "=== BOT STATUS ===" && pm2 status && \
echo -e "\n=== LOGS RECIENTES ===" && pm2 logs discord-bot --lines 10 --nostream && \
echo -e "\n=== RECURSOS ===" && free -h && \
echo -e "\n=== DISCO ===" && df -h / && \
echo -e "\n=== POSTGRESQL ===" && sudo systemctl status postgresql --no-pager | head -3
```

### Reinicio completo (bot + base de datos):
```bash
pm2 restart discord-bot && sudo systemctl restart postgresql && pm2 logs discord-bot --lines 20
```

---

## 🔗 Enlaces Útiles

- **Oracle Cloud Dashboard:** https://cloud.oracle.com/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **Discord.js Guide:** https://discordjs.guide/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**🎉 ¡Con estos comandos puedes gestionar tu bot fácilmente!**

**Tip:** Guarda este archivo en tu PC para tenerlo siempre a mano.
