# ✅ Checklist de Deployment - Railway.app

Sigue estos pasos en orden y marca cada uno cuando lo completes.

---

## 📋 FASE 1: Preparación (5 minutos)

- [ ] **Paso 1.1**: Crear cuenta en Railway.app
  - Ve a: https://railway.app
  - Haz clic en "Login" o "Start New Project"
  - Conecta con GitHub

- [ ] **Paso 1.2**: Verificar que tienes tu token de Discord
  - Si no lo tienes, ve a: https://discord.com/developers/applications
  - Selecciona tu aplicación → Bot → Copy Token
  - **NO LO COMPARTAS CON NADIE**

- [ ] **Paso 1.3**: Tener cuenta de GitHub
  - Si no tienes: https://github.com/join
  - Es gratis y rápido

---

## 📦 FASE 2: Subir Código a GitHub (3 minutos)

**Opción A - Desde Replit (RECOMENDADO):**

- [ ] **Paso 2.1**: En Replit, haz clic en el icono de Git (lado izquierdo)
- [ ] **Paso 2.2**: Conecta tu GitHub si aún no lo has hecho
- [ ] **Paso 2.3**: Crea un nuevo repositorio
  - Nombre sugerido: `ego-discord-bot`
  - Visibilidad: Público o Privado (ambos funcionan)
- [ ] **Paso 2.4**: Haz commit y push

**Opción B - Manual:**

- [ ] **Paso 2.1**: Ve a https://github.com/new
- [ ] **Paso 2.2**: Crea repositorio: `ego-discord-bot`
- [ ] **Paso 2.3**: Descarga este proyecto (Download as ZIP)
- [ ] **Paso 2.4**: Sube archivos a GitHub (drag & drop en la web)

---

## 🚂 FASE 3: Deploy en Railway (5 minutos)

- [ ] **Paso 3.1**: En Railway, clic en "New Project"
- [ ] **Paso 3.2**: Selecciona "Deploy from GitHub repo"
- [ ] **Paso 3.3**: Autoriza a Railway para acceder a GitHub
- [ ] **Paso 3.4**: Selecciona el repositorio `ego-discord-bot`
- [ ] **Paso 3.5**: Railway comenzará a detectar el proyecto

---

## 🔐 FASE 4: Configurar Variables (2 minutos)

- [ ] **Paso 4.1**: En Railway, ve a la pestaña "Variables"
- [ ] **Paso 4.2**: Haz clic en "New Variable"
- [ ] **Paso 4.3**: Agrega `DISCORD_BOT_TOKEN`
  - Nombre: `DISCORD_BOT_TOKEN` (exacto)
  - Valor: Tu token de Discord
- [ ] **Paso 4.4**: Agrega `SESSION_SECRET`
  - Nombre: `SESSION_SECRET` (exacto)
  - Valor: Cualquier texto aleatorio (ej: `mi-secreto-super-seguro-123`)

**Opcional (solo si usas IA):**

- [ ] **Paso 4.5**: Agrega `OPENAI_API_KEY` (si usas OpenAI)
- [ ] **Paso 4.6**: Agrega `GEMINI_API_KEY` (si usas Google Gemini)

---

## 🎯 FASE 5: Verificar Deployment (3 minutos)

- [ ] **Paso 5.1**: Railway empezará a deployar automáticamente
- [ ] **Paso 5.2**: Ve a la pestaña "Deployments"
- [ ] **Paso 5.3**: Haz clic en el deployment activo
- [ ] **Paso 5.4**: Haz clic en "View Logs"
- [ ] **Paso 5.5**: Espera a ver: `🎉 Bot iniciado como Ego Bot#...`

---

## ✅ FASE 6: Confirmar que Funciona (1 minuto)

- [ ] **Paso 6.1**: Abre Discord
- [ ] **Paso 6.2**: Verifica que el bot está **ONLINE** (punto verde)
- [ ] **Paso 6.3**: Prueba el comando `/status`
- [ ] **Paso 6.4**: Si responde, ¡FUNCIONA! 🎉

---

## 🎊 ¡COMPLETADO!

Si marcaste todos los checkboxes, tu bot está corriendo 24/7 gratis en Railway.

### 📊 Monitorear el bot:

- **Logs en tiempo real**: Railway → Deployments → View Logs
- **Uso de créditos**: Railway → Dashboard (verás $5.00 - $X usado)
- **Estado del bot**: En Discord con `/status`

### 🔄 Hacer cambios al bot:

1. Edita el código en Replit (o tu editor)
2. Haz commit y push a GitHub
3. Railway re-deployará automáticamente
4. ¡Listo!

---

## ⚠️ Troubleshooting

**Bot no aparece online:**
- Verifica `DISCORD_BOT_TOKEN` en Variables
- Revisa logs en Railway para errores
- Asegúrate que el bot esté invitado a tu servidor

**Error al deployar:**
- Verifica que `package.json` existe en el repositorio
- Asegúrate que `watchdog.js` y `src/` estén en GitHub
- Revisa logs de deployment en Railway

**Bot se desconecta:**
- Railway NUNCA duerme el bot (a diferencia de Replit)
- Si se desconecta, revisa logs para ver errores
- Verifica que no se acabó el crédito ($5/mes)

---

## 💰 Créditos de Railway

Tu bot usa aproximadamente **$2-3/mes** de los **$5 gratis**.

Puedes ver el uso en tiempo real en:
Railway → Project Settings → Usage

---

**¿Necesitas ayuda?**
Lee `RAILWAY-DEPLOYMENT.md` para más detalles.

---

🎉 **¡Felicidades! Tu bot está 24/7 online!**
