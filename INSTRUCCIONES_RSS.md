# 📱 Configuración de RSS Feeds para Redes Sociales

## 🎯 Estado Actual

### ✅ **YouTube - FUNCIONANDO**
- **Estado**: ✅ 100% Operativo
- **Método**: RSS nativo de YouTube
- **Cuenta**: StrangersRP
- **Verificación**: Cada 2 minutos
- **Canal de notificaciones**: `1427179199336284210`

### ⏳ **TikTok - PENDIENTE DE CONFIGURACIÓN**
- **Estado**: ⏳ Esperando configuración RSS
- **Cuenta**: @strangersrp_

### ⏳ **Twitter/X - PENDIENTE DE CONFIGURACIÓN**
- **Estado**: ⏳ Esperando configuración RSS
- **Cuenta**: @strangersrp_

---

## 🔧 Cómo Configurar Twitter y TikTok

### **📌 IMPORTANTE: SERVICIOS QUE SÍ FUNCIONAN**

#### **Para Twitter/X (100% Gratis - TwitRSS.me)** ✅
**URL**: https://www.twitrss.me

**Pasos**:
1. Ve a: **https://www.twitrss.me**
2. En el campo de texto, escribe: `strangersrp_` (sin la @)
3. Haz clic en **"Get RSS Feed"**
4. **Copia la URL completa** (será algo como: `https://www.twitrss.me/twitter_user_to_rss/?user=strangersrp_`)

**Alternativas**:
- **https://www.twitrss.org** (igual de fácil)
- **https://rss.app** (requiere cuenta pero también funciona)

---

#### **Para TikTok (Más Complejo)** ⚠️
TikTok **NO** tiene soluciones RSS gratuitas simples. Opciones:

**Opción 1: RSS.app (Requiere Suscripción)**
- URL: https://rss.app
- Requiere plan de pago
- Es la más simple pero no es gratis

**Opción 2: GitHub Actions (Gratis pero técnico)**
- Repositorio: https://github.com/conoro/tiktok-rss-flat
- Requiere configuración técnica
- Actualiza cada 4 horas
- 100% gratis

**Opción 3: Dejarlo para más adelante**
- Enfocarse solo en YouTube + Twitter por ahora
- TikTok se puede agregar manualmente cuando sea necesario

---

### **Paso Final: Actualizar la Configuración del Bot**

Una vez que tengas las URLs de los RSS feeds, edita el archivo:

**Archivo**: `data/social-media-accounts.json`

**Ejemplo de Twitter con TwitRSS.me**:
```json
[
  {
    "id": "youtube_strangersrp",
    "platform": "youtube",
    "username": "StrangersRP",
    "url": "https://www.youtube.com/channel/UCtxfmJ-MaymwVKiL4oIH3Tw",
    "channelId": "UCtxfmJ-MaymwVKiL4oIH3Tw",
    "addedAt": "2025-11-08T00:00:00.000Z"
  },
  {
    "id": "twitter_strangersrp_",
    "platform": "twitter",
    "username": "strangersrp_",
    "url": "https://x.com/strangersrp_",
    "rssFeedUrl": "https://www.twitrss.me/twitter_user_to_rss/?user=strangersrp_",
    "addedAt": "2025-11-08T00:00:00.000Z"
  },
  {
    "id": "tiktok_strangersrp_",
    "platform": "tiktok",
    "username": "strangersrp_",
    "url": "https://www.tiktok.com/@strangersrp_",
    "rssFeedUrl": "PEGAR_AQUI_LA_URL_DE_TIKTOK_CUANDO_LA_TENGAS",
    "addedAt": "2025-11-08T00:00:00.000Z"
  }
]
```

**Reemplaza**:
- La URL de Twitter si es diferente a la de ejemplo
- `"PEGAR_AQUI_LA_URL_DE_TIKTOK_CUANDO_LA_TENGAS"` → URL del RSS feed de TikTok cuando la consigas

---

### **¿Cómo Reiniciar el Bot?**

El bot se reinicia automáticamente cuando detecta cambios en los archivos. Espera unos 30 segundos después de guardar el archivo.

---

## 📊 Funcionamiento del Sistema

### **Verificación Automática**
- El bot verifica las cuentas cada **2 minutos**
- Solo notifica **posts nuevos** (no duplicados)
- Las notificaciones se envían a: `<#1427179199336284210>`

### **Formato de Notificaciones**

Las notificaciones incluyen:
- 📺 **YouTube**: Título del video, thumbnail, link directo
- 🎵 **TikTok**: Título del video, link directo
- 🐦 **Twitter**: Texto del tweet, link directo

---

## 🔍 Verificar que Funciona

1. Publica algo en TikTok o Twitter
2. Espera máximo 2-5 minutos
3. Verifica el canal de notificaciones
4. Deberías ver el embed con la publicación

---

## ❓ Solución de Problemas

### **No llegan notificaciones de TikTok/Twitter**
✅ Verifica que las URLs del RSS están correctas en el JSON
✅ Asegúrate de que las URLs empiecen con `https://`
✅ Revisa los logs del bot para ver si hay errores

### **YouTube funciona pero TikTok/Twitter no**
✅ Confirma que RSS.app generó correctamente los feeds
✅ Prueba abrir las URLs de RSS en el navegador (deberían mostrar XML)

---

## 📝 Notas Importantes

- **YouTube**: Funciona 100% gratis, sin configuración adicional
- **TikTok + Twitter**: Requieren RSS.app (tier gratuito disponible)
- **Instagram**: No implementado (no hay opción gratuita confiable)
- **Twitch**: Ya está integrado con el sistema de streamers

---

¿Necesitas ayuda? Contacta al desarrollador.
