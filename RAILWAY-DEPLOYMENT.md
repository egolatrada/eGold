# 🚂 Guía de Deployment en Railway (GRATIS 24/7)

## ¿Qué es Railway?
Railway es una plataforma que te da **$5 de crédito mensual GRATIS** - más que suficiente para mantener tu bot de Discord online 24/7.

---

## 📋 Pasos para Deploy

### 1️⃣ **Crear cuenta en Railway**
1. Ve a: https://railway.app/
2. Haz clic en **"Start a New Project"**
3. Conecta con tu cuenta de **GitHub** (recomendado)

### 2️⃣ **Subir tu código a GitHub**
Si aún no tienes el código en GitHub:

```bash
# En tu terminal de Replit o local
git init
git add .
git commit -m "Initial commit - Discord Bot"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

O simplemente:
1. Ve a https://github.com/new
2. Crea un nuevo repositorio
3. Descarga este proyecto de Replit (Download as ZIP)
4. Sube los archivos a GitHub

### 3️⃣ **Crear proyecto en Railway**
1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Autoriza a Railway para acceder a tu GitHub
4. Selecciona el repositorio de tu bot

### 4️⃣ **Configurar Variables de Entorno** 🔑
En Railway, ve a la pestaña **Variables**:

**Variables OBLIGATORIAS:**
```
DISCORD_BOT_TOKEN = tu_token_aqui
SESSION_SECRET = cualquier_texto_secreto_aqui
```

**Variables OPCIONALES (si usas IA):**
```
OPENAI_API_KEY = tu_api_key_de_openai
GEMINI_API_KEY = tu_api_key_de_gemini
```

### 5️⃣ **Configurar el Deployment**
Railway debería detectar automáticamente que es un proyecto Node.js y usar:
```
npm install
npm start
```

Si no lo detecta:
1. Ve a **Settings** → **Deploy**
2. Build Command: `npm install`
3. Start Command: `npm start`

### 6️⃣ **Deploy! 🚀**
1. Railway comenzará a deployar automáticamente
2. Espera 2-3 minutos
3. Verifica los logs en la pestaña **"Deployments"**
4. Si todo está bien, verás: `🎉 Bot iniciado como Ego Bot#7624`

---

## ✅ **Verificar que funciona**

1. Ve a Discord
2. Tu bot debería aparecer **ONLINE** 
3. Prueba un comando: `/status`
4. ¡Listo! Tu bot está corriendo 24/7 gratis

---

## 🔧 **Actualizar el bot**

Cada vez que hagas cambios:
1. Sube los cambios a GitHub:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push
   ```
2. Railway detectará el cambio y re-deployará automáticamente

---

## 📊 **Monitorear uso de créditos**

1. Ve al Dashboard de Railway
2. Verás cuánto crédito has usado
3. Un bot de Discord básico usa **~$2-3/mes** del crédito de $5
4. ¡Tienes espacio de sobra!

---

## ⚠️ **Troubleshooting**

### Bot no se conecta:
- Verifica que `DISCORD_BOT_TOKEN` esté correctamente configurado
- Revisa los logs en Railway → Deployments

### Bot se desconecta:
- Railway NUNCA duerme los deployments (a diferencia de Replit)
- Revisa los logs para ver si hay errores

### Sin crédito:
- Railway te avisa por email cuando te queda poco crédito
- Puedes agregar una tarjeta para continuar (solo pagas lo que uses)

---

## 💰 **Costos**

- **Gratis**: $5/mes de crédito
- **Tu bot usa**: ~$2-3/mes
- **Sobra**: $2-3/mes para otros proyectos
- **Si se acaba el crédito**: Solo pagas $0.000231/GB-hr extra

---

## 🎉 **¡Eso es todo!**

Tu bot ahora está corriendo 24/7 sin que tengas que hacer nada. Railway se encarga de:
- ✅ Mantenerlo siempre online
- ✅ Reiniciarlo si se cae
- ✅ Actualizarlo cuando hagas cambios
- ✅ Darte logs en tiempo real

**¿Preguntas?** Revisa: https://docs.railway.app/
