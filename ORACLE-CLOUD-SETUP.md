# 🚀 Guía Completa: Oracle Cloud VPS para Bot de Discord 24/7 GRATIS

Esta guía te llevará paso a paso para configurar tu bot de Discord en Oracle Cloud **gratis para siempre** con uptime 24/7 real.

---

## 📋 Tabla de Contenido

1. [Requisitos Previos](#requisitos-previos)
2. [Crear Cuenta en Oracle Cloud](#paso-1-crear-cuenta-en-oracle-cloud)
3. [Crear VPS (Compute Instance)](#paso-2-crear-vps-compute-instance)
4. [Conectarse por SSH](#paso-3-conectarse-por-ssh)
5. [Configurar Ubuntu](#paso-4-configurar-ubuntu)
6. [Instalar Node.js](#paso-5-instalar-nodejs)
7. [Instalar PostgreSQL](#paso-6-instalar-postgresql)
8. [Subir Código del Bot](#paso-7-subir-código-del-bot)
9. [Configurar Variables de Entorno](#paso-8-configurar-variables-de-entorno)
10. [Instalar PM2 (Mantener Bot Activo)](#paso-9-instalar-pm2)
11. [Configurar Firewall](#paso-10-configurar-firewall)
12. [Verificación Final](#paso-11-verificación-final)
13. [Comandos Útiles](#comandos-útiles)
14. [Solución de Problemas](#solución-de-problemas)

---

## ⚙️ Requisitos Previos

Antes de empezar, asegúrate de tener:

- ✅ **Cuenta de correo electrónico** (Gmail, Outlook, etc.)
- ✅ **Tarjeta de crédito/débito** (solo para verificación, **NO se cobrará nada**)
- ✅ **Código del bot en GitHub** (ya lo tienes)
- ✅ **Discord Bot Token** (de Discord Developer Portal)
- ✅ **Datos de la base de datos PostgreSQL** (si usas la de Replit, necesitarás migrar)

**Herramientas que necesitarás instalar en tu PC:**
- Windows: **PuTTY** o **Windows Terminal**
- Mac/Linux: Terminal (ya incluido)
- Opcional: **FileZilla** (para transferir archivos vía SFTP)

---

## 🔐 PASO 1: Crear Cuenta en Oracle Cloud

### **1.1 Ir al sitio de Oracle Cloud**

Abre tu navegador y ve a:
```
https://www.oracle.com/cloud/free/
```

Haz clic en **"Start for free"** o **"Empieza gratis"**

---

### **1.2 Registrarse**

Completa el formulario con:
- **Email:** Tu correo electrónico
- **País:** Tu país de residencia
- **Nombre:** Tu nombre completo

Haz clic en **"Verify my email"**

---

### **1.3 Verificar Email**

Revisa tu correo y haz clic en el enlace de verificación.

---

### **1.4 Completar Información de Cuenta**

Llena estos datos:
- **Password:** Contraseña segura (guárdala bien)
- **Cloud Account Name:** Nombre único (ejemplo: `mibot-discord-2025`)
- **Home Region:** Elige la región más cercana a ti
  - **Recomendado para Latinoamérica:** `Brazil East (Sao Paulo)`
  - **Recomendado para España:** `Germany Central (Frankfurt)` o `UK South (London)`

---

### **1.5 Verificación de Identidad**

Oracle pedirá:
- **Tarjeta de crédito/débito** (para verificación)
- **Te harán un cargo de $1 USD** (se devuelve automáticamente)

**IMPORTANTE:** Oracle **NO te cobrará** si solo usas los servicios del **Always Free Tier**.

---

### **1.6 Completar Registro**

Haz clic en **"Start my free trial"** o **"Comenzar prueba gratuita"**

Espera unos minutos mientras Oracle activa tu cuenta.

---

## 💻 PASO 2: Crear VPS (Compute Instance)

### **2.1 Acceder al Dashboard**

Una vez dentro, ve al menú hamburguesa (☰) arriba a la izquierda.

Navega a:
```
Compute → Instances → Create Instance
```

---

### **2.2 Configurar la Instancia**

**Nombre:**
```
discord-bot-vps
```

**Placement:**
- Deja los valores por defecto

**Image and Shape:**
- **Image:** Ubuntu 22.04 (Canonical Ubuntu)
- **Shape:** VM.Standard.E2.1.Micro (Always Free)
  - 1 vCPU
  - 1 GB RAM

**IMPORTANTE:** Si no ves la opción **E2.1.Micro**, haz clic en **"Change Shape"** y busca la categoría **"Specialty and previous generation"**.

---

### **2.3 Configurar SSH Keys**

Oracle necesita una clave SSH para acceso seguro.

**Opción 1 (Recomendada): Generar nuevas claves**

Haz clic en **"Generate a key pair for me"**

**IMPORTANTE:** Descarga ambos archivos:
- **Private Key** (`.key`) - Guárdalo en un lugar seguro
- **Public Key** (`.pub`) - Oracle lo usará

**NUNCA COMPARTAS TU CLAVE PRIVADA CON NADIE**

**Opción 2 (Avanzado): Usar tus propias claves SSH**

Si ya tienes claves SSH, pega tu **Public Key** aquí.

---

### **2.4 Configurar Red (Networking)**

**Primary VNIC Information:**
- **Create in compartment:** root
- **Virtual cloud network:** Deja el default o crea uno nuevo
- **Subnet:** Public Subnet
- **Assign a public IPv4 address:** ✅ **ACTIVADO** (IMPORTANTE)

---

### **2.5 Configurar Almacenamiento (Boot Volume)**

Deja los valores por defecto:
- **Boot volume size:** 47 GB (gratis)

---

### **2.6 Crear la Instancia**

Haz clic en **"Create"** abajo.

Espera 2-3 minutos mientras Oracle provisiona tu VPS.

---

### **2.7 Obtener IP Pública**

Una vez que el estado sea **"RUNNING"** (verde), verás:

```
Public IP: XXX.XXX.XXX.XXX
Private IP: 10.X.X.X
```

**Copia la IP Pública** y guárdala (la necesitarás para conectarte).

---

## 🔑 PASO 3: Conectarse por SSH

### **Opción A: Windows (usando PuTTY)**

#### **3.1 Descargar PuTTY**

Si no lo tienes instalado:
```
https://www.putty.org/
```

Descarga **PuTTY** y **PuTTYgen**.

---

#### **3.2 Convertir Clave SSH**

Oracle genera claves en formato OpenSSH, pero PuTTY necesita formato `.ppk`.

1. Abre **PuTTYgen**
2. Haz clic en **"Load"**
3. Selecciona tu **Private Key** (`.key`) descargada de Oracle
4. Cambia el filtro de archivos a **"All Files (*.*)"** si no la ves
5. Haz clic en **"Save private key"**
6. Guárdala como `oracle-bot.ppk`

---

#### **3.3 Conectarse con PuTTY**

1. Abre **PuTTY**
2. En **Host Name**, escribe:
   ```
   ubuntu@TU_IP_PUBLICA
   ```
   Ejemplo: `ubuntu@129.80.123.45`

3. Puerto: `22` (default)
4. Connection type: **SSH**

5. En el menú izquierdo, ve a:
   ```
   Connection → SSH → Auth → Credentials
   ```

6. En **"Private key file for authentication"**, haz clic en **Browse** y selecciona tu archivo `.ppk`

7. Vuelve a **Session** (arriba), escribe un nombre en **"Saved Sessions"** (ejemplo: `Oracle Bot`), y haz clic en **"Save"**

8. Haz clic en **"Open"**

9. Aparecerá un mensaje de seguridad: **"Accept"**

10. ¡Deberías estar dentro! Verás algo como:
    ```
    ubuntu@discord-bot-vps:~$
    ```

---

### **Opción B: Mac/Linux (usando Terminal)**

#### **3.1 Configurar Permisos de la Clave**

Abre Terminal y ejecuta:

```bash
chmod 400 ~/Downloads/ssh-key-*.key
```

(Reemplaza la ruta con donde guardaste tu clave)

---

#### **3.2 Conectarse**

```bash
ssh -i ~/Downloads/ssh-key-*.key ubuntu@TU_IP_PUBLICA
```

Ejemplo:
```bash
ssh -i ~/Downloads/ssh-key-2025.key ubuntu@129.80.123.45
```

Si aparece un mensaje de seguridad, escribe `yes` y presiona Enter.

¡Deberías estar dentro!

---

### **Opción C: Windows 10/11 (usando PowerShell)**

Windows 10+ incluye SSH nativo.

```powershell
ssh -i "C:\ruta\a\tu\clave.key" ubuntu@TU_IP_PUBLICA
```

---

## 🛠️ PASO 4: Configurar Ubuntu

Una vez conectado por SSH, ejecuta estos comandos:

### **4.1 Actualizar Sistema**

```bash
sudo apt update && sudo apt upgrade -y
```

Esto tardará 2-5 minutos. Presiona Enter si pregunta algo.

---

### **4.2 Instalar Herramientas Básicas**

```bash
sudo apt install -y curl wget git nano ufw
```

---

### **4.3 Configurar Zona Horaria (Opcional)**

Para que los logs tengan la hora correcta:

```bash
sudo timedatectl set-timezone America/Mexico_City
```

Cambia `America/Mexico_City` por tu zona horaria:
- España: `Europe/Madrid`
- Argentina: `America/Argentina/Buenos_Aires`
- Colombia: `America/Bogota`
- Chile: `America/Santiago`

Lista completa: `timedatectl list-timezones`

---

## 📦 PASO 5: Instalar Node.js

Tu bot necesita Node.js versión 18 o superior.

### **5.1 Instalar Node.js 20 (LTS)**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### **5.2 Verificar Instalación**

```bash
node --version
npm --version
```

Deberías ver:
```
v20.x.x
10.x.x
```

---

## 🗄️ PASO 6: Instalar PostgreSQL

Tu bot usa PostgreSQL para la base de datos.

### **6.1 Instalar PostgreSQL**

```bash
sudo apt install -y postgresql postgresql-contrib
```

---

### **6.2 Iniciar Servicio**

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### **6.3 Crear Base de Datos y Usuario**

```bash
sudo -u postgres psql
```

Esto abrirá el shell de PostgreSQL. Ejecuta estos comandos uno por uno:

```sql
CREATE DATABASE discord_bot;
CREATE USER botuser WITH PASSWORD 'tu_password_seguro_123';
GRANT ALL PRIVILEGES ON DATABASE discord_bot TO botuser;
\q
```

(Cambia `tu_password_seguro_123` por una contraseña segura)

---

### **6.4 Configurar Acceso Local**

Edita el archivo de configuración:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Busca esta línea (usa las flechas del teclado):
```
local   all             all                                     peer
```

Cámbiala a:
```
local   all             all                                     md5
```

Guarda con `Ctrl+O`, Enter, y sal con `Ctrl+X`.

---

### **6.5 Reiniciar PostgreSQL**

```bash
sudo systemctl restart postgresql
```

---

### **6.6 Probar Conexión**

```bash
psql -U botuser -d discord_bot -h localhost
```

Te pedirá la contraseña. Si funciona, verás:
```
discord_bot=>
```

Escribe `\q` para salir.

---

## 📤 PASO 7: Subir Código del Bot

### **Opción A: Desde GitHub (Recomendado)**

#### **7.1 Clonar Repositorio**

En tu VPS, ejecuta:

```bash
cd ~
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

Ejemplo:
```bash
git clone https://github.com/juanperez/strangers-rp-bot.git
cd strangers-rp-bot
```

---

#### **7.2 Instalar Dependencias**

```bash
npm install
```

Esto instalará todas las librerías necesarias (discord.js, openai, pg, etc.).

---

### **Opción B: Subir Archivos Manualmente (FileZilla)**

Si prefieres subir archivos desde tu PC:

#### **7.1 Descargar FileZilla**

```
https://filezilla-project.org/
```

---

#### **7.2 Conectarse**

1. Abre FileZilla
2. Ve a **Edit → Settings → SFTP**
3. Haz clic en **"Add key file"** y selecciona tu clave privada `.ppk` (o `.key`)
4. Configura la conexión:
   - **Host:** `sftp://TU_IP_PUBLICA`
   - **Username:** `ubuntu`
   - **Port:** `22`
5. Haz clic en **"Quickconnect"**

---

#### **7.3 Subir Archivos**

Arrastra tu carpeta del bot desde tu PC (panel izquierdo) a `/home/ubuntu/` (panel derecho).

Luego en SSH:
```bash
cd ~/nombre-carpeta-bot
npm install
```

---

## 🔐 PASO 8: Configurar Variables de Entorno

### **8.1 Crear Archivo .env**

```bash
cd ~/TU_REPOSITORIO
nano .env
```

---

### **8.2 Agregar Variables**

Pega esto (reemplaza con tus valores reales):

```env
# Discord
DISCORD_BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4.ABCDEF.XyZ123abc456def789

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://botuser:tu_password_seguro_123@localhost:5432/discord_bot
PGHOST=localhost
PGPORT=5432
PGUSER=botuser
PGPASSWORD=tu_password_seguro_123
PGDATABASE=discord_bot

# OpenAI (para categorización de tareas)
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456789

# Gemini (si lo usas)
GEMINI_API_KEY=AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq

# Otros
SESSION_SECRET=un_secreto_muy_aleatorio_123456789
```

**IMPORTANTE:** Reemplaza **TODOS** los valores con tus datos reales.

Guarda con `Ctrl+O`, Enter, `Ctrl+X`.

---

### **8.3 Verificar .env**

```bash
cat .env
```

Asegúrate de que todo esté correcto.

---

## 🔄 PASO 9: Instalar PM2 (Mantener Bot Activo)

PM2 es un gestor de procesos que mantendrá tu bot corriendo 24/7 y lo reiniciará automáticamente si se cae.

### **9.1 Instalar PM2 Globalmente**

```bash
sudo npm install -g pm2
```

---

### **9.2 Iniciar Bot con PM2**

```bash
cd ~/TU_REPOSITORIO
pm2 start watchdog.js --name discord-bot
```

(Si tu archivo principal es `index.js`, usa ese en lugar de `watchdog.js`)

---

### **9.3 Verificar Estado**

```bash
pm2 status
```

Deberías ver:
```
┌─────┬──────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ mode    │ status  │ restart │ uptime   │
├─────┼──────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ discord-bot  │ fork    │ online  │ 0       │ 5s       │
└─────┴──────────────┴─────────┴─────────┴─────────┴──────────┘
```

**Status:** `online` = ✅ Funcionando

---

### **9.4 Ver Logs en Tiempo Real**

```bash
pm2 logs discord-bot
```

Presiona `Ctrl+C` para salir.

---

### **9.5 Configurar Auto-inicio al Reiniciar VPS**

```bash
pm2 startup
```

Copiará un comando que empieza con `sudo env...`. **Cópialo y pégalo en la terminal** y presiona Enter.

Luego ejecuta:

```bash
pm2 save
```

Esto guardará la configuración actual.

---

### **9.6 Probar Auto-inicio**

Reinicia el VPS:

```bash
sudo reboot
```

Espera 1-2 minutos y reconéctate por SSH.

Ejecuta:
```bash
pm2 status
```

Si ves tu bot `online`, ¡funciona perfectamente! 🎉

---

## 🔥 PASO 10: Configurar Firewall

### **10.1 Configurar UFW (Ubuntu Firewall)**

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw enable
```

Confirma con `y` cuando pregunte.

---

### **10.2 Verificar Estado**

```bash
sudo ufw status
```

Deberías ver:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
```

---

### **10.3 Configurar Firewall de Oracle Cloud**

Oracle tiene su propio firewall además del de Ubuntu.

1. Ve al **Oracle Cloud Dashboard**
2. **Compute → Instances → Tu instancia**
3. En **Primary VNIC**, haz clic en **Subnet**
4. Haz clic en **Default Security List**
5. Haz clic en **Add Ingress Rules**

Agrega esta regla:
- **Source CIDR:** `0.0.0.0/0`
- **IP Protocol:** `TCP`
- **Source Port Range:** All
- **Destination Port Range:** `22`
- **Description:** `SSH Access`

Haz clic en **"Add Ingress Rules"**

**NOTA:** Esta regla ya debería estar por defecto, pero verifica que exista.

---

## ✅ PASO 11: Verificación Final

### **11.1 Verificar Bot en Discord**

Ve a Discord y verifica que tu bot:
- ✅ Aparece **online** (verde)
- ✅ Responde a comandos (`/tareas`, `/ver-tareas`, etc.)
- ✅ Sistema de tickets funciona
- ✅ Base de datos guarda información

---

### **11.2 Verificar Logs**

```bash
pm2 logs discord-bot --lines 50
```

Busca:
```
✅ Bot iniciado como Ego Bot#7624
✅ Sistema de tareas simplificado inicializado
✅ Comandos registrados
```

---

### **11.3 Verificar Base de Datos**

```bash
psql -U botuser -d discord_bot -h localhost
```

Ejecuta:
```sql
\dt
```

Deberías ver tus tablas:
```
simple_tasks
tickets
logs
etc.
```

Escribe `\q` para salir.

---

### **11.4 Verificar PM2**

```bash
pm2 status
pm2 info discord-bot
```

Asegúrate de que:
- **Status:** online
- **Restarts:** 0 (o muy bajo)
- **Uptime:** incrementando

---

## 🛠️ Comandos Útiles

### **Gestión de PM2:**

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs discord-bot

# Ver últimas 100 líneas de logs
pm2 logs discord-bot --lines 100

# Reiniciar bot
pm2 restart discord-bot

# Detener bot
pm2 stop discord-bot

# Eliminar bot de PM2
pm2 delete discord-bot

# Ver información detallada
pm2 info discord-bot

# Monitorear recursos (CPU, RAM)
pm2 monit
```

---

### **Actualizar Código del Bot:**

```bash
# Si usas GitHub
cd ~/TU_REPOSITORIO
git pull
npm install
pm2 restart discord-bot
pm2 logs discord-bot

# Ver cambios
pm2 logs discord-bot --lines 50
```

---

### **Ver Uso de Recursos:**

```bash
# CPU y RAM
htop

# Espacio en disco
df -h

# Memoria
free -h
```

---

### **Gestión de PostgreSQL:**

```bash
# Acceder a base de datos
psql -U botuser -d discord_bot -h localhost

# Hacer backup
pg_dump -U botuser -d discord_bot -h localhost > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U botuser -d discord_bot -h localhost < backup_20250106.sql

# Ver tablas
psql -U botuser -d discord_bot -h localhost -c "\dt"

# Ver tareas en la base de datos
psql -U botuser -d discord_bot -h localhost -c "SELECT * FROM simple_tasks;"
```

---

## 🐛 Solución de Problemas

### **❌ Error: "Cannot find module 'discord.js'"**

**Solución:**
```bash
cd ~/TU_REPOSITORIO
npm install
pm2 restart discord-bot
```

---

### **❌ Bot aparece offline en Discord**

**Verificar:**

1. Token correcto en `.env`:
   ```bash
   cat .env | grep DISCORD_BOT_TOKEN
   ```

2. Logs de PM2:
   ```bash
   pm2 logs discord-bot --lines 50
   ```

3. Reiniciar bot:
   ```bash
   pm2 restart discord-bot
   ```

---

### **❌ Error: "ECONNREFUSED" en PostgreSQL**

**Solución:**

1. Verificar que PostgreSQL esté corriendo:
   ```bash
   sudo systemctl status postgresql
   ```

2. Si no está corriendo:
   ```bash
   sudo systemctl start postgresql
   ```

3. Verificar `DATABASE_URL` en `.env`:
   ```bash
   cat .env | grep DATABASE_URL
   ```

---

### **❌ Bot se reinicia constantemente**

**Verificar logs:**
```bash
pm2 logs discord-bot --lines 100
```

Busca el error y corrígelo. Luego:
```bash
pm2 restart discord-bot
```

---

### **❌ No puedo conectarme por SSH**

**Verificar:**

1. IP pública correcta:
   - Ve a Oracle Cloud Dashboard
   - Verifica la IP de tu instancia

2. Clave SSH correcta:
   - Usa la clave privada que descargaste de Oracle

3. Firewall de Oracle:
   - Verifica que el puerto 22 esté abierto (Security List)

---

### **❌ "Permission denied" al hacer git pull**

**Solución:**

Si el repositorio es privado:
```bash
git config credential.helper store
git pull
```

Te pedirá usuario y contraseña (o Personal Access Token de GitHub).

---

### **❌ VPS se queda sin espacio**

**Ver espacio:**
```bash
df -h
```

**Limpiar logs:**
```bash
pm2 flush
sudo journalctl --vacuum-time=7d
```

**Limpiar paquetes:**
```bash
sudo apt autoremove -y
sudo apt clean
```

---

### **❌ VPS muy lenta**

**Ver procesos:**
```bash
htop
```

Presiona `F10` para salir.

**Reiniciar VPS:**
```bash
sudo reboot
```

---

## 🎉 ¡Felicidades!

Tu bot de Discord ahora está corriendo 24/7 en Oracle Cloud **gratis para siempre**.

### **Resumen de lo que lograste:**

✅ **VPS gratis** con 1GB RAM y 1 vCPU  
✅ **PostgreSQL** configurado y funcionando  
✅ **Bot activo 24/7** con PM2  
✅ **Auto-reinicio** si el bot se cae  
✅ **Auto-inicio** al reiniciar VPS  
✅ **Firewall** configurado y seguro  
✅ **Sistema de tareas** funcionando perfectamente  

---

## 🔄 Mantenimiento Recomendado

### **Semanal:**
```bash
# Ver estado del bot
pm2 status

# Ver logs recientes
pm2 logs discord-bot --lines 50
```

### **Mensual:**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Reiniciar VPS
sudo reboot

# Verificar que todo esté online después de reiniciar
pm2 status
```

### **Cuando actualices el código:**
```bash
cd ~/TU_REPOSITORIO
git pull
npm install
pm2 restart discord-bot
pm2 logs discord-bot
```

---

## 📊 Monitoreo del Bot

### **Ver estadísticas en tiempo real:**

```bash
pm2 monit
```

Esto muestra:
- CPU usage
- Memory usage
- Logs en tiempo real

Presiona `Ctrl+C` para salir.

---

### **Configurar alertas (Opcional):**

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

Esto rotará los logs automáticamente para no llenar el disco.

---

## 🚀 Próximos Pasos (Opcional)

### **Agregar dominio personalizado:**

Si quieres acceder a tu VPS con un dominio (ejemplo: `bot.tudominio.com`):

1. Compra un dominio (Namecheap, GoDaddy, etc.)
2. Agrega un registro **A** apuntando a tu IP pública de Oracle
3. Espera 24h para propagación DNS

---

### **Instalar panel de monitoreo:**

```bash
npm install pm2-web -g
pm2 web
```

Accede desde: `http://TU_IP_PUBLICA:9615`

---

### **Hacer backups automáticos:**

Crea un script de backup:

```bash
nano ~/backup.sh
```

Pega esto:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U botuser -d discord_bot -h localhost > ~/backups/backup_$DATE.sql
find ~/backups -type f -mtime +7 -delete
```

Guarda con `Ctrl+O`, Enter, `Ctrl+X`.

Hazlo ejecutable:
```bash
chmod +x ~/backup.sh
mkdir ~/backups
```

Configura cron para ejecutarlo diariamente:
```bash
crontab -e
```

Agrega esta línea:
```
0 3 * * * /home/ubuntu/backup.sh
```

Esto hará backups automáticos a las 3 AM todos los días.

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs:**
   ```bash
   pm2 logs discord-bot --lines 100
   ```

2. **Busca el error en Google** o en Stack Overflow

3. **Consulta la documentación:**
   - Discord.js: https://discord.js.org/
   - PM2: https://pm2.keymetrics.io/
   - PostgreSQL: https://www.postgresql.org/docs/

---

## 🎊 ¡Disfruta de tu Bot 24/7!

Tu bot ahora corre de forma **gratuita y permanente** en Oracle Cloud.

**Características finales:**
- ✅ Uptime 24/7 real
- ✅ Auto-reinicio automático
- ✅ Base de datos PostgreSQL propia
- ✅ Sistema de tareas con IA
- ✅ Todo gratis para siempre

**¡Feliz administración de tu servidor de Discord!** 🎉

---

**Guía creada para: Strangers RP Bot**  
**Versión:** 1.0  
**Última actualización:** Noviembre 2025  
**Compatible con:** Ubuntu 22.04 LTS, Node.js 20.x, PostgreSQL 14
