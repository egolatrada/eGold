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

## 🔧 Cómo Configurar TikTok y Twitter

### **Paso 1: Crear cuenta en RSS.app**

1. Ve a: https://rss.app
2. Haz clic en "Sign Up" (es gratis)
3. Completa el registro

---

### **Paso 2: Generar RSS Feed para TikTok**

1. Una vez dentro de RSS.app, busca la opción "Create RSS Feed"
2. Selecciona "TikTok"
3. Pega el link: `https://www.tiktok.com/@strangersrp_`
4. Haz clic en "Generate Feed"
5. **Copia la URL del RSS Feed** (algo como: `https://rss.app/feeds/xxx.xml`)

---

### **Paso 3: Generar RSS Feed para Twitter**

1. En RSS.app, crea otro feed
2. Selecciona "Twitter/X"
3. Pega el link: `https://x.com/strangersrp_`
4. Haz clic en "Generate Feed"
5. **Copia la URL del RSS Feed**

---

### **Paso 4: Actualizar la Configuración del Bot**

Una vez que tengas las 2 URLs de RSS.app, edita el archivo:

**Archivo**: `data/social-media-accounts.json`

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
    "id": "tiktok_strangersrp_",
    "platform": "tiktok",
    "username": "strangersrp_",
    "url": "https://www.tiktok.com/@strangersrp_",
    "rssFeedUrl": "PEGAR_AQUI_LA_URL_DE_TIKTOK",
    "addedAt": "2025-11-08T00:00:00.000Z"
  },
  {
    "id": "twitter_strangersrp_",
    "platform": "twitter",
    "username": "strangersrp_",
    "url": "https://x.com/strangersrp_",
    "rssFeedUrl": "PEGAR_AQUI_LA_URL_DE_TWITTER",
    "addedAt": "2025-11-08T00:00:00.000Z"
  }
]
```

**Reemplaza**:
- `"PEGAR_AQUI_LA_URL_DE_TIKTOK"` → URL del RSS feed de TikTok
- `"PEGAR_AQUI_LA_URL_DE_TWITTER"` → URL del RSS feed de Twitter

---

### **Paso 5: Reiniciar el Bot**

Después de editar el archivo, simplemente espera unos segundos. El bot detectará automáticamente las nuevas configuraciones.

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
