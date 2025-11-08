# 🏆 eGold Bot - Discord Bot para Strangers RP

Bot de Discord profesional con sistema de tickets, moderación, verificación, sistema de advertencias, bienvenidas personalizadas y gestión completa para servidores de roleplay.

**Total de comandos: 39 comandos**  
**Última actualización: 2025-11-08**

---

## ✨ Características Principales

### 🎫 Sistema de Tickets Avanzado
- Panel interactivo con menú desplegable integrado
- Creación de tickets para usuarios individuales o roles completos
- Organización automática en categorías específicas
- Sistema de permisos (solo creador + staff)
- **Sistema de jerarquía de tickets** con roles de soporte escalonados
- **Sistema de inactividad inteligente** con notificaciones bidireccionales
- **Canales de voz temporales** con botón "Subir a soporte"
- Guardado automático de transcripciones elegantes en Discord
- Numeración persistente de tickets

### 👋 Sistema de Bienvenidas
- **Canal predefinido**: `1425955729541697688` (configurable)
- Mensajes personalizables con variables dinámicas
- Avatar del usuario mostrado automáticamente
- Color de embed personalizable
- Imagen de fondo opcional
- Base de datos PostgreSQL para persistencia
- 3 comandos: `/bienvenida-setup`, `/bienvenida-editar`, `/bienvenida-test`

### ⚠️ Sistema de Advertencias (Warns)
- Sistema completo de gestión de advertencias
- 3 categorías: Leve, Moderada, Grave
- Auto-revocación automática por tiempo configurado
- Revocación manual con razón
- Historial completo de advertencias por usuario
- Comandos: `/warn`, `/unwarn`, `/warns`, `/warn-historial`

### 📋 Sistema de Tareas
- Gestión de tareas organizadas por categorías
- Creación, visualización y eliminación de tareas
- Persistencia en base de datos PostgreSQL
- Comandos: `/tarea-crear`, `/tarea-ver`, `/tarea-borrar`

### 🔐 Sistema de Verificación
- Verificación automática con botón
- Asignación automática de roles al verificarse
- Panel de verificación personalizable

### 🎨 Panel de Embeds Anónimos
- Comando `/panel-embed` para crear embeds 100% anónimos
- Editor interactivo con todos los campos editables
- Panel privado reutilizable
- Sin rastros de quién creó el embed
- Control de permisos por roles

### 📊 Sistema de Logs Completo
- **Mensajes**: Eliminados, editados (con contenido original)
- **Canales**: Creados, eliminados, threads
- **Miembros**: Entradas, salidas, kicks, bans, cambios de nickname y roles
- **Roles**: Creados, eliminados, actualizados
- **Voz**: Entradas, salidas, movimientos
- **Comandos**: Tracking de comandos (admin y roles específicos)
- **Bots**: Actividad de bots
- **Invitaciones**: Creación + hilos con tracking de usos

### 🎥 Monitoreo de Streamers
- Notificaciones automáticas cuando streamers van en vivo
- Soporte para Twitch y YouTube
- Configuración de canales de notificación
- Comandos: `/streamer-añadir`, `/streamer-eliminar`, `/streamer-lista`

### 🛡️ Sistema de Moderación
- Detección automática de contenido NSFW/gore con IA (Gemini)
- Verificación de seguridad de enlaces (phishing, malware)
- Auto-moderación configurable

### 💬 Sistema de Comandos Personalizados
- Crear comandos personalizados sin programar
- Gestión completa de comandos
- Comandos: `/cmd-crear`, `/cmd-eliminar`, `/cmd-lista`, `/cmd-editar`

### 💡 Sistema de Sugerencias
- Canal dedicado para sugerencias
- Sistema de respuesta con estado (Aprobada/Rechazada)
- Comandos: `/sug-responder`

### 📝 Sistema de Changelog
- Registro de cambios del servidor
- Envío directo a canal de Discord

### 🔗 Integración de Redes Sociales
- Enlaces a redes sociales del servidor
- Comandos para gestionar links sociales

### 💓 Sistema de Monitoreo y Salud
- Health checks automáticos cada 5 minutos
- Auto-restart en caso de errores críticos
- Watchdog externo opcional para máxima disponibilidad
- Comandos: `/status`, `/restart` (solo admins)

---

## 📋 Lista Completa de Comandos (39 Total)

### 🎫 Tickets (7 comandos)
1. `/setup-panel` - Crear panel de tickets
2. `/ticket-crear` - Crear ticket para usuario o rol
3. `/ticket-añadir` - Añadir usuario a ticket
4. `/ticket-eliminar` - Eliminar usuario de ticket
5. `/ticket-cerrar` - Cerrar ticket actual
6. `/ticket-renombrar` - Renombrar ticket
7. `/ticket-transcripción` - Obtener transcripción manual

### 👋 Bienvenidas (3 comandos)
8. `/bienvenida-setup` - Configurar sistema de bienvenidas
9. `/bienvenida-editar` - Editar configuración existente
10. `/bienvenida-test` - Probar mensaje de bienvenida

### ⚠️ Advertencias (4 comandos)
11. `/warn` - Advertir a un usuario
12. `/unwarn` - Revocar advertencia
13. `/warns` - Ver advertencias activas de un usuario
14. `/warn-historial` - Ver historial completo de advertencias

### 📋 Tareas (3 comandos)
15. `/tarea-crear` - Crear nueva tarea
16. `/tarea-ver` - Ver tareas pendientes
17. `/tarea-borrar` - Borrar tarea completada

### ⚙️ Configuración (5 comandos)
18. `/panel-embed` - Crear embeds anónimos
19. `/mensaje-boton` - Editar mensaje con botón
20. `/clear` - Limpiar mensajes (1-100)
21. `/config-tickets` - Ver configuración actual
22. `/changelog` - Publicar cambios del servidor

### 🎥 Streamers (3 comandos)
23. `/streamer-añadir` - Añadir streamer a monitoreo
24. `/streamer-eliminar` - Eliminar streamer
25. `/streamer-lista` - Ver streamers monitoreados

### 💬 Comandos Personalizados (4 comandos)
26. `/cmd-crear` - Crear comando personalizado
27. `/cmd-eliminar` - Eliminar comando personalizado
28. `/cmd-lista` - Ver todos los comandos personalizados
29. `/cmd-editar` - Editar comando existente

### 💡 Sugerencias (1 comando)
30. `/sug-responder` - Responder a sugerencia (Aprobada/Rechazada)

### 🔗 Social (2 comandos)
31. `/social-añadir` - Añadir enlace de red social
32. `/social-eliminar` - Eliminar enlace de red social

### ℹ️ Información (3 comandos)
33. `/bot-info` - Información completa del bot
34. `/comandos` - Lista todos los comandos organizados
35. `/server-stats` - Estadísticas del servidor

### 🛡️ Administración (4 comandos)
36. `/status` - Estado de salud del bot
37. `/restart` - Reiniciar el bot
38. `/ban` - Banear usuario
39. `/kick` - Expulsar usuario

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno (.env)

```env
# Discord
DISCORD_BOT_TOKEN=tu_token_aqui
DISCORD_DEV_BOT_TOKEN=tu_dev_token_aqui (opcional)

# Base de Datos
DATABASE_URL=postgresql://usuario:password@host:5432/database

# Seguridad
SESSION_SECRET=un_secreto_aleatorio_fuerte

# Opcional - Solo si usas IA
OPENAI_API_KEY=tu_key_aqui
GEMINI_API_KEY=tu_key_aqui

# Opcional - Solo si usas monitoreo de streams
TWITCH_CLIENT_ID=tu_client_id
TWITCH_ACCESS_TOKEN=tu_token
YOUTUBE_API_KEY=tu_key
```

### 2. Configurar config.json

El archivo `config.json` está organizado en secciones:

#### 🎫 Tickets
```json
{
  "tickets": {
    "staffRoleId": "TU_ROL_STAFF_ID",
    "ticketChannelId": "CANAL_PANEL_ID",
    "categories": {
      "general": {
        "name": "Soporte Técnico",
        "categoryId": "ID_CATEGORIA_DISCORD",
        "transcriptChannelId": "ID_CANAL_TRANSCRIPTS",
        "emoji": "🔧",
        "channelDescription": "Canal de soporte técnico"
      }
    }
  }
}
```

#### 📋 Logs
```json
{
  "logs": {
    "enabled": true,
    "channels": {
      "messages": "ID_CANAL",
      "channels": "ID_CANAL",
      "members": "ID_CANAL",
      "roles": "ID_CANAL",
      "voice": "ID_CANAL",
      "commands": "ID_CANAL",
      "bots": "ID_CANAL",
      "invites": "ID_CANAL"
    },
    "logAllCommands": false,
    "trackedRoles": ["ID_ROL_1", "ID_ROL_2"]
  }
}
```

**Opciones de configuración:**
- Un canal para todo: usa el mismo ID en todos los tipos
- Canales separados: usa IDs diferentes por categoría
- Solo algunos logs: deja vacío (`""`) los que no quieras

#### 🎨 Embeds
```json
{
  "embed": {
    "defaultColor": "0099ff",
    "allowedRoleId": "",
    "allowedChannelId": "",
    "maxTitleLength": 256,
    "maxDescriptionLength": 4000
  }
}
```

### 3. Permisos Necesarios del Bot

El bot necesita estos permisos en Discord:
- ✅ Gestionar canales
- ✅ Gestionar roles
- ✅ Enviar mensajes
- ✅ Gestionar mensajes
- ✅ Insertar enlaces
- ✅ Leer historial de mensajes
- ✅ Usar comandos de aplicación
- ✅ Adjuntar archivos
- ✅ Ver registro de auditoría
- ✅ Administrador (recomendado)

### 4. Obtener IDs en Discord

1. Activa **Modo Desarrollador** en Discord:
   - Configuración → Avanzado → Modo Desarrollador ✅

2. Haz clic derecho sobre:
   - **Canales**: Clic derecho → "Copiar ID del canal"
   - **Roles**: Configuración del Servidor → Roles → Clic derecho → "Copiar ID del rol"
   - **Categorías**: Clic derecho → "Copiar ID de categoría"
   - **Usuarios**: Clic derecho → "Copiar ID del usuario"

---

## 📖 Uso de Características Principales

### 🎫 Sistema de Tickets

**Crear panel:**
```
/setup-panel
```

**Crear ticket para un usuario específico:**
```
/ticket-crear usuario:@usuario
```

**Crear ticket para un rol completo:**
```
/ticket-crear rol:@rol
```

**Dentro del ticket:**
- Botón "Cerrar Ticket" → Cierra y guarda transcripción
- Botón "Subir a soporte" → Crea canal de voz temporal

### 👋 Sistema de Bienvenidas

**Configuración rápida (usa canal predefinido):**
```
/bienvenida-setup mensaje:"Bienvenido {usuario} a {servidor}! 🎉"
```

**Configuración completa:**
```
/bienvenida-setup canal:#bienvenidas mensaje:"Tu mensaje" color:#5865F2 imagen:URL
```

**Variables disponibles:**
- `{usuario}` - Mención del usuario
- `{nombre}` - Nombre del usuario
- `{tag}` - Tag completo (nombre#0000)
- `{servidor}` - Nombre del servidor
- `{miembros}` - Cantidad de miembros
- `{id}` - ID del usuario

**Probar antes de publicar:**
```
/bienvenida-test
```

### ⚠️ Sistema de Advertencias

**Advertir usuario:**
```
/warn usuario:@usuario categoria:Leve razon:"Razón de la advertencia"
```

**Categorías disponibles:**
- `Leve` - 7 días hasta auto-revocación
- `Moderada` - 14 días hasta auto-revocación
- `Grave` - 30 días hasta auto-revocación

**Ver advertencias activas:**
```
/warns usuario:@usuario
```

**Revocar advertencia:**
```
/unwarn id:123 razon:"Razón de revocación"
```

### 📋 Sistema de Tareas

**Crear tarea:**
```
/tarea-crear categoria:"Desarrollo" tarea:"Implementar nueva funcionalidad"
```

**Ver tareas:**
```
/tarea-ver categoria:"Desarrollo"
```

**Borrar tarea:**
```
/tarea-borrar id:123
```

### 🎨 Embeds Anónimos

**Crear embed 100% anónimo:**
```
/panel-embed canal:#anuncios
```

Aparecerá un panel privado con botón "✨ Crear Embed". Al hacer clic:
1. Se abre formulario interactivo
2. Completas los campos (todos opcionales)
3. El embed se envía sin que nadie sepa quién lo creó

**Características:**
- ✅ 100% Anónimo - sin rastros
- ✅ Panel reutilizable
- ✅ Todas las confirmaciones privadas

### 📊 Logs de Invitaciones

El sistema registra automáticamente:
1. Cuando se crea una invitación → Embed con detalles
2. Cuando alguien la usa → Hilo en ese embed mostrando quién se unió
3. Cada nuevo uso → Se añade al mismo hilo

**Perfecto para tracking de invitaciones** 📈

### 🗑️ Limpiar Mensajes

```
/clear cantidad:50
```

**Sistema de logs automáticos:**
- **> 20 mensajes**: Crea archivo .txt con transcripción completa
- **≤ 20 mensajes**: Embed con lista de mensajes eliminados

### 🎥 Monitoreo de Streamers

**Añadir streamer:**
```
/streamer-añadir plataforma:Twitch usuario:nombre_usuario canal:#notificaciones
```

**Ver lista:**
```
/streamer-lista
```

El bot verificará cada 2 minutos y enviará notificación cuando vayan en vivo.

---

## 🚀 Deployment en VPS (Producción)

### Entornos Duales

- **Desarrollo**: Replit (testing y desarrollo)
- **Producción**: VPS Digital Ocean con PM2 (99.99% uptime)

### Guía Completa

Consulta **`DEPLOYMENT.md`** para instrucciones completas de deployment en VPS, que incluye:

✅ Configuración de VPS Ubuntu 20.04+  
✅ Instalación de Node.js 18+, PM2 y PostgreSQL  
✅ Script automatizado de deployment (`deploy-vps.sh`)  
✅ Configuración de variables de entorno  
✅ Comandos PM2 para gestión del bot  
✅ Seguridad, monitoreo y troubleshooting  

### Deployment Rápido

```bash
# En el VPS, ejecuta:
./deploy-vps.sh
```

Este script automáticamente:
1. Detiene el proceso anterior
2. Actualiza el código desde Git
3. Instala dependencias
4. Inicia con PM2 configurado

---

## 🎨 Personalización

### Editar Mensajes del Bot

**TODOS** los mensajes se personalizan en `messages.json`:

```json
{
  "panel": {
    "title": "🎫 Sistema de Tickets",
    "description": "Selecciona el tipo de ticket",
    "footer": "El staff te atenderá pronto"
  },
  "ticketWelcome": {
    "title": "{emoji} Ticket de {categoryName}",
    "description": "Describe tu problema aquí"
  },
  "logs": {
    "messages": {
      "deleted": "🗑️ Mensaje Eliminado",
      "edited": "✏️ Mensaje Editado"
    }
  }
}
```

### Variables Disponibles

En mensajes de tickets:
- `{emoji}` - Emoji de la categoría
- `{categoryName}` - Nombre de la categoría
- `{user}` - Mención del usuario
- `{channel}` - Mención del canal
- `{serverName}` - Nombre del servidor

---

## 📊 Estructura del Proyecto

```
egold-discord-bot/
├── src/
│   ├── commands/          # Comandos slash organizados por categoría
│   │   ├── admin/
│   │   ├── configuracion/
│   │   ├── custom/
│   │   ├── info/
│   │   ├── moderation/
│   │   ├── social/
│   │   ├── tasks/
│   │   └── tickets/
│   ├── systems/           # Sistemas modulares
│   │   ├── changelog-system.js
│   │   ├── custom-commands-system.js
│   │   ├── health.js
│   │   ├── invites-system.js
│   │   ├── logs-system.js
│   │   ├── moderation-system.js
│   │   ├── server-stats.js
│   │   ├── simple-tasks-system.js
│   │   ├── social-links-system.js
│   │   ├── social-media-monitor-system.js
│   │   ├── stream-monitor-system.js
│   │   ├── suggestions-system.js
│   │   ├── ticket-hierarchy.js
│   │   ├── ticket-inactivity.js
│   │   ├── tickets.js
│   │   ├── verification-system.js
│   │   ├── warns-system.js
│   │   └── welcome-system.js
│   ├── handlers/          # Manejadores de eventos y comandos
│   ├── utils/             # Utilidades
│   ├── data/              # Datos persistentes (JSON)
│   ├── client.js          # Configuración del cliente Discord
│   ├── config.js          # Carga de configuración
│   └── index.js           # Punto de entrada principal
├── config.json            # Configuración del servidor
├── messages.json          # Mensajes personalizables
├── watchdog.js            # Sistema de monitoreo y auto-restart
├── deploy-vps.sh          # Script de deployment VPS
├── package.json           # Dependencias del proyecto
├── DEPLOYMENT.md          # Guía de deployment VPS
└── README.md              # Este archivo
```

---

## 🔧 Solución de Problemas

### El bot no responde
1. Verifica que el bot esté online en Discord
2. Revisa los logs del workflow/PM2
3. Ejecuta `/status` para ver el estado

### No se crean los canales
1. Verifica que los `categoryId` sean correctos
2. Asegúrate de que el bot tenga permisos de administrador
3. Verifica que las categorías existan

### Error al guardar transcripciones
1. Verifica que los `transcriptChannelId` sean correctos
2. Asegúrate de que el bot tenga permisos en esos canales

### Los comandos slash no aparecen
1. Espera unos minutos (pueden tardar en sincronizarse)
2. Echa al bot y vuelve a invitarlo
3. Verifica que el bot tenga permiso "Usar comandos de aplicación"

### Sistema de bienvenidas no funciona
1. Verifica que el canal esté configurado con `/bienvenida-setup`
2. Usa `/bienvenida-test` para probar
3. Revisa los logs del bot

### Advertencias no se auto-revocan
1. Verifica que el bot esté corriendo continuamente
2. El sistema verifica cada 1 minuto
3. Revisa los logs para errores de base de datos

---

## 📝 Dependencias

```json
{
  "discord.js": "^14.14.1",
  "dotenv": "^16.6.1",
  "pg": "^8.16.3",
  "rss-parser": "^3.13.0"
}
```

**Requisitos:**
- Node.js 18.0.0 o superior
- PostgreSQL (para sistemas persistentes)
- PM2 (para producción VPS)

---

## 🛡️ Seguridad y Privacidad

- ✅ Tokens almacenados en variables de entorno
- ✅ Transcripciones privadas solo para staff
- ✅ Embeds anónimos sin rastros
- ✅ Datos sensibles en base de datos segura
- ✅ Permisos por roles configurables
- ✅ Logs de auditoría completos

---

## 📈 Estado del Proyecto

**Última actualización**: 2025-11-08  
**Versión**: 2.0.0  
**Estado**: ✅ Producción  
**Tamaño**: 229MB (optimizado)  
**Comandos**: 39 comandos activos  
**Sistemas**: 18 sistemas modulares  

### Recientes Mejoras (Nov 2025)

✅ Sistema de bienvenidas con canal predefinido  
✅ Sistema completo de advertencias con auto-revocación  
✅ Sistema de tareas simplificado  
✅ Limpieza masiva del proyecto (~50MB recuperados)  
✅ Scripts de deployment automatizados para VPS  
✅ Estructura optimizada y documentación consolidada  

---

## 🆘 Soporte

**Monitoreo del Bot:**
```
/status
```

**Reiniciar el Bot:**
```
/restart
```

**Información del Bot:**
```
/bot-info
```

Si tienes problemas:
1. Revisa los logs (Replit console o `pm2 logs`)
2. Verifica permisos del bot en Discord
3. Asegúrate de que los IDs en `config.json` sean correctos
4. Consulta `DEPLOYMENT.md` para deployment VPS
5. Usa `/status` para diagnóstico rápido

---

## 📜 Licencia

ISC License

---

**Desarrollado para Strangers RP** 🎮  
**Bot profesional con 99.99% uptime en VPS** 🚀
