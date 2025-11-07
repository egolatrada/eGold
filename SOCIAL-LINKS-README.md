# 📱 Sistema de Vinculación de Redes Sociales

Sistema completo para vincular cuentas de redes sociales de usuarios con canales de Discord para notificaciones.

## ✨ Características

- **Gestión por comandos**: Todo se configura mediante comandos, sin necesidad de editar archivos
- **Múltiples plataformas**: Twitch, Kick, YouTube, Instagram, Twitter/X, Threads, TikTok, Facebook
- **Almacenamiento persistente**: Las vinculaciones se guardan en `social-links-data.json`
- **Sistema de notificaciones**: Preparado para enviar notificaciones cuando hay actividad

## 🎮 Comandos Disponibles

### `/social-link add`
Añade una nueva vinculación de red social.

**Parámetros:**
- `plataforma` - Plataforma a vincular (Twitch, Kick, YouTube, etc.)
- `usuario` - Usuario de Discord a vincular
- `username` - Nombre de usuario en la red social
- `canal` - Canal donde se enviarán las notificaciones

**Ejemplo:**
```
/social-link add plataforma:Twitch usuario:@Juan username:JuanStreamer canal:#notificaciones-streams
```

### `/social-link remove`
Elimina una vinculación existente.

**Parámetros:**
- `id` - ID de la vinculación (obtenido con `/social-link list`)

**Ejemplo:**
```
/social-link remove id:123456789_twitch_1699999999999
```

### `/social-link list`
Muestra todas las vinculaciones o las de un usuario específico.

**Parámetros:**
- `usuario` (opcional) - Filtrar por usuario específico

**Ejemplos:**
```
/social-link list
/social-link list usuario:@Juan
```

### `/social-link toggle`
Activa o desactiva una vinculación sin eliminarla.

**Parámetros:**
- `id` - ID de la vinculación

**Ejemplo:**
```
/social-link toggle id:123456789_twitch_1699999999999
```

## 📋 Plataformas Soportadas

| Plataforma | Icono | Color |
|------------|-------|-------|
| Twitch | 🎮 | Morado |
| Kick | ⚡ | Verde neón |
| YouTube | 📺 | Rojo |
| Instagram | 📷 | Degradado |
| Twitter/X | 🐦/✖️ | Azul/Negro |
| Threads | 🧵 | Negro |
| TikTok | 🎵 | Negro |
| Facebook | 👥 | Azul |

## 🔧 Estructura de Datos

Las vinculaciones se almacenan en `social-links-data.json` con la siguiente estructura:

```json
{
  "links": {
    "userId_platform_timestamp": {
      "userId": "123456789",
      "platform": "twitch",
      "username": "StreamerName",
      "notificationChannelId": "987654321",
      "createdAt": 1699999999999,
      "enabled": true
    }
  },
  "lastUpdate": 1699999999999
}
```

## 🔔 Sistema de Notificaciones

El sistema está preparado para enviar notificaciones automáticas. Para implementar las notificaciones:

### Método `sendNotification()`

```javascript
await socialLinksSystem.sendNotification(linkId, {
    title: "¡Nuevo stream en vivo!",
    description: "Juan está en vivo ahora",
    url: "https://twitch.tv/JuanStreamer",
    thumbnail: "https://...",
    image: "https://..."
});
```

### Integración con APIs

Para implementar notificaciones automáticas, necesitarás:

1. **Twitch**: Usar EventSub Webhooks
2. **YouTube**: YouTube Data API v3
3. **Instagram**: Instagram Graph API
4. **Twitter/X**: Twitter API v2
5. **TikTok**: TikTok API

## 🎯 Casos de Uso

### Notificaciones de Streams
```javascript
// Cuando un streamer inicia transmisión en Twitch
socialLinksSystem.sendNotification(linkId, {
    title: "🔴 ¡Stream en Vivo!",
    description: `${username} está transmitiendo: "${streamTitle}"`,
    url: twitchUrl,
    thumbnail: streamThumbnail
});
```

### Nuevos Videos
```javascript
// Cuando un creador sube un video a YouTube
socialLinksSystem.sendNotification(linkId, {
    title: "📺 Nuevo Video",
    description: `${username} subió: "${videoTitle}"`,
    url: videoUrl,
    thumbnail: videoThumbnail
});
```

### Posts de Instagram
```javascript
// Cuando alguien publica en Instagram
socialLinksSystem.sendNotification(linkId, {
    title: "📷 Nueva Publicación",
    description: caption,
    url: postUrl,
    image: imageUrl
});
```

## 🔒 Permisos

Por defecto, cualquier usuario puede usar `/social-link list` para ver sus propias vinculaciones.

Para gestionar vinculaciones (add/remove/toggle), puedes configurar permisos específicos editando los comandos en `index.js` o mediante la configuración de permisos de Discord.

## 📝 Notas Importantes

1. **IDs únicos**: Cada vinculación tiene un ID único en formato `userId_platform_timestamp`
2. **Persistencia**: Los datos se guardan automáticamente en cada cambio
3. **Estado enabled**: Las vinculaciones pueden desactivarse sin eliminarlas
4. **Límites de Discord**: Los embeds muestran máximo 25 vinculaciones a la vez

## 🚀 Próximas Mejoras

- [ ] Implementar webhooks para notificaciones automáticas
- [ ] Agregar estadísticas de actividad por plataforma
- [ ] Sistema de plantillas personalizables para notificaciones
- [ ] Dashboard web para gestión visual
- [ ] Notificaciones push a usuarios específicos
- [ ] Filtros de contenido (solo ciertos tipos de posts)
