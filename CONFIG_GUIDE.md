# 📖 Guía de Configuración - Ego Bot

Esta guía te explica cómo configurar cada sección del `config.json`.

---

## 🎫 SISTEMA DE TICKETS

La sección `tickets` controla todo el sistema de soporte con tickets.

```json
"tickets": {
  "staffRoleId": "TU_ROL_STAFF_ID",
  "ticketChannelId": "CANAL_DONDE_PONER_PANEL_ID",
  "categories": { ... }
}
```

### Configuración principal:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `staffRoleId` | ID del rol que tendrá acceso a todos los tickets | `"1370593419897999380"` |
| `ticketChannelId` | ID del canal donde aparecerá el panel de tickets | `"1370604158243311689"` |

### Categorías de tickets:

Cada categoría representa un tipo de ticket diferente:

```json
"general": {
  "name": "Soporte Técnico",
  "categoryId": "ID_CATEGORIA_DISCORD",
  "transcriptChannelId": "ID_CANAL_TRANSCRIPCIONES",
  "emoji": "🔧",
  "channelDescription": "Canal de soporte técnico"
}
```

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre que aparecerá en el menú desplegable |
| `categoryId` | ID de la categoría de Discord donde se crearán los tickets |
| `transcriptChannelId` | Canal donde se guardarán las transcripciones |
| `emoji` | Emoji que aparecerá junto al nombre |
| `channelDescription` | 📝 **Descripción personalizable** que aparece en el canal del ticket (lo que ve el usuario en la descripción del canal de Discord) |

**💡 Ejemplos de descripciones personalizadas:**
```json
"channelDescription": "Canal de soporte técnico - Estamos aquí para ayudarte 🔧"
"channelDescription": "Reporta cualquier problema que encuentres ⚠️"
"channelDescription": "Comparte tus ideas para mejorar el servidor 💡"
```

**📝 Puedes agregar tantas categorías como quieras**, solo copia y pega el formato.

---

## 🎨 SISTEMA DE EMBEDS (100% ANÓNIMO)

La sección `embed` controla el comando `/panel-embed` para crear embeds de forma **completamente anónima**.

```json
"embed": {
  "defaultColor": "0099ff",
  "allowedRoleId": "",
  "allowedChannelId": "",
  "maxTitleLength": 256,
  "maxDescriptionLength": 4000
}
```

| Campo | Descripción | Valores |
|-------|-------------|---------|
| `defaultColor` | Color por defecto de los embeds (hexadecimal) | `"0099ff"`, `"ff0000"`, etc. |
| `allowedRoleId` | 🔒 ID del rol que puede usar `/panel-embed` (vacío = permiso "Gestionar Mensajes") | `"123456789012"` o `""` |
| `allowedChannelId` | 🔒 ID del canal donde se puede usar el comando (vacío = cualquier canal) | `"123456789012"` o `""` |
| `maxTitleLength` | Longitud máxima del título | `256` (máximo Discord) |
| `maxDescriptionLength` | Longitud máxima de la descripción | `4000` (máximo Discord) |

### 🔐 Restricciones de Seguridad

**`allowedRoleId`**: Si lo configuras, solo usuarios con ese rol podrán usar `/panel-embed`
- Vacío (`""`) = cualquier usuario con permiso "Gestionar Mensajes"
- Con ID = solo usuarios con ese rol específico

**`allowedChannelId`**: Si lo configuras, el comando solo funcionará en ese canal
- Vacío (`""`) = funciona en cualquier canal
- Con ID = solo funciona en ese canal específico

**💡 Ejemplo de uso:**
```json
"allowedRoleId": "1234567890123456",
"allowedChannelId": "9876543210987654"
```
Solo el rol `1234567890123456` podrá usar `/panel-embed` y solo en el canal `9876543210987654`

---

## 🤖 SISTEMA DE Q&A CON IA

La sección `qaSystem` controla el sistema de respuestas automáticas con IA.

```json
"qaSystem": {
  "enabled": false,
  "infoChannelId": "CANAL_INFO_ID_AQUI",
  "questionsChannelId": "CANAL_PREGUNTAS_ID_AQUI",
  "responseModel": "gpt-4o-mini",
  "maxKnowledgeMessages": 100,
  "threadAutoArchiveDuration": 60
}
```

| Campo | Descripción | Valores |
|-------|-------------|---------|
| `enabled` | Activar o desactivar el sistema | `true` / `false` |
| `infoChannelId` | Canal donde está la información base | ID del canal |
| `questionsChannelId` | Canal donde los usuarios hacen preguntas | ID del canal |
| `responseModel` | Modelo de IA a usar | `"gpt-4o-mini"`, `"gpt-4o"`, `"gpt-5-mini"` |
| `maxKnowledgeMessages` | Máximo de mensajes a leer del canal info | `100` (recomendado) |
| `threadAutoArchiveDuration` | Minutos antes de archivar hilos | `60`, `1440`, `4320`, `10080` |

### Modelos disponibles:

| Modelo | Descripción | Costo | Velocidad |
|--------|-------------|-------|-----------|
| `gpt-4o-mini` | ⭐ **Recomendado** - Rápido y económico | 💰 Bajo | ⚡ Muy rápida |
| `gpt-4o` | Más potente y preciso | 💰💰 Medio | ⚡ Rápida |
| `gpt-5-mini` | Último modelo, balance calidad/costo | 💰💰 Medio | ⚡ Rápida |

### Cómo funciona:

1. 📚 Creas un canal de información con reglas, guías, FAQs, etc.
2. 💬 Los usuarios hacen preguntas en el canal de preguntas
3. 🧠 El bot lee la información y genera una respuesta
4. 🧵 Responde automáticamente en un hilo

**💡 Tip:** Mantén el canal de información organizado y actualizado para mejores respuestas.

---

## 📋 SISTEMA DE LOGS COMPLETO

El sistema de logs registra toda la actividad del servidor en canales separados. **Completamente modular** - puedes activar solo los tipos de logs que necesites.

```json
"logs": {
  "enabled": false,
  "channels": {
    "messages": "",
    "channels": "",
    "members": "",
    "roles": "",
    "voice": "",
    "commands": "",
    "bots": ""
  },
  "logAllCommands": false,
  "trackedRoles": []
}
```

### Configuración Principal:

| Campo | Descripción | Valores |
|-------|-------------|---------|
| `enabled` | Activar o desactivar todo el sistema de logs | `true` / `false` |
| `logAllCommands` | Registrar todos los comandos o solo admin/roles específicos | `true` / `false` |
| `trackedRoles` | Array de IDs de roles cuyos comandos se registrarán | `["123456", "789012"]` |

### Canales de Logs:

Puedes usar **canales separados** para cada tipo o **el mismo canal para varios tipos**:

| Canal | Qué Registra | Ejemplos |
|-------|--------------|----------|
| `messages` | 🗑️ Mensajes eliminados<br>✏️ Mensajes editados | Contenido original, autor, canal |
| `channels` | ➕ Canales creados<br>➖ Canales eliminados<br>🧵 Threads | Nombre, tipo, categoría |
| `members` | 👋 Entradas/salidas<br>📝 Cambios de nickname<br>🦶 Kicks<br>🔨 Bans/unbans<br>🎭 Cambios de roles | Usuario, razón, moderador |
| `roles` | ➕ Roles creados<br>➖ Roles eliminados<br>🔄 Roles actualizados | Nombre, color, permisos |
| `voice` | 🔊 Entradas a canales<br>🔇 Salidas de canales<br>🔀 Movimientos entre canales | Usuario, canal origen, canal destino |
| `commands` | ⚡ Comandos de admin<br>💬 Comandos de roles específicos | Comando, usuario, opciones |
| `bots` | 🤖 Mensajes de bots<br>📨 Respuestas automáticas | Bot, contenido, tipo |

### Ejemplos de Configuración:

**Un canal para todo:**
```json
"channels": {
  "messages": "1234567890123456",
  "channels": "1234567890123456",
  "members": "1234567890123456",
  "roles": "1234567890123456",
  "voice": "1234567890123456",
  "commands": "1234567890123456",
  "bots": "1234567890123456"
}
```

**Canales separados por categoría:**
```json
"channels": {
  "messages": "1111111111111111",    // #logs-mensajes
  "channels": "2222222222222222",    // #logs-canales
  "members": "3333333333333333",     // #logs-miembros
  "roles": "4444444444444444",       // #logs-roles
  "voice": "5555555555555555",       // #logs-voz
  "commands": "6666666666666666",    // #logs-comandos
  "bots": "7777777777777777",        // #logs-bots
  "invites": "8888888888888888"      // #logs-invitaciones
}
```

**Solo logs importantes:**
```json
"channels": {
  "messages": "1234567890123456",
  "channels": "",
  "members": "1234567890123456",
  "roles": "",
  "voice": "",
  "commands": "1234567890123456",
  "bots": "",
  "invites": ""
}
```

### Tracking de Comandos:

**`logAllCommands: false`** (recomendado):
- Solo registra comandos de administradores
- Solo registra comandos de roles en `trackedRoles`
- Menos spam, solo info importante

**`logAllCommands: true`**:
- Registra TODOS los comandos de TODOS los usuarios
- Puede generar mucho spam
- Útil para servidores pequeños o debug

**Ejemplo con roles específicos:**
```json
"logAllCommands": false,
"trackedRoles": ["1234567890123456", "9876543210987654"]
```
Solo se registrarán comandos de admins y usuarios con estos 2 roles.

### 🔗 Sistema de Invitaciones:

El sistema de logs incluye tracking de invitaciones con hilos automáticos.

**Ejemplo completo:**
```json
"channels": {
  "messages": "",
  "channels": "",
  "members": "1234567890123456",      // Canal donde se registran entradas/salidas
  "roles": "",
  "voice": "",
  "commands": "",
  "bots": "",
  "invites": "1234567890123456"       // Canal donde se registran invitaciones
}
```

**¿Cómo funciona?**

1. **Cuando alguien crea una invitación** → Se registra un embed en el canal configurado:
   ```
   🔗 Invitación Creada
   
   👤 Creado por: @Moderador
   📅 Fecha: 5 nov 2025, 6:15 AM
   🔗 Código: abc123
   📊 Usos máximos: 10
   📍 Canal: #general
   ```

2. **Cuando alguien usa esa invitación** → Se crea un **hilo automático** en ese mensaje:
   ```
   @NuevoUsuario usó la invitación abc123 (Uso #1)
   
   👤 Usuario: @NuevoUsuario
   🆔 ID: 123456789
   📅 Se unió: hace 2 segundos
   ```

3. **Cada nuevo uso** → Se añade al mismo hilo, creando un historial completo de usos

**Ventajas:**
- ✅ Organización perfecta: cada invitación tiene su propio hilo
- ✅ Tracking completo de quién usa cada invitación
- ✅ Información detallada (avatar, ID, fecha de entrada)
- ✅ Ideal para saber qué invitación trae más miembros

**Para desactivarlo:**
```json
"invites": ""   // Deja el campo vacío
```

---

## 🔧 Cómo obtener IDs en Discord

1. Activa el **Modo Desarrollador** en Discord:
   - Ajustes → Avanzado → Modo Desarrollador ✅

2. **Haz clic derecho** en cualquier canal, categoría, rol o usuario

3. **Selecciona "Copiar ID"**

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas con la configuración:

1. Verifica que todos los IDs sean correctos
2. Asegúrate de que el bot tenga permisos de Administrador
3. Revisa los logs del bot para errores
4. Consulta el README.md para más información

---

**¡Listo! Tu bot está configurado y funcionando. 🎉**
