# 🏆 eGold Bot - Discord Bot para Strangers RP

Bot de Discord profesional con sistema de tickets, moderación, verificación y gestión completa para servidores de roleplay.

## ✨ Características

- 🎯 Panel de tickets interactivo con menú desplegable integrado
- 📋 Selección directa de tipo de ticket sin mensajes adicionales
- 📁 Organización automática en categorías específicas
- 🔒 Sistema de permisos (solo creador + staff)
- 💾 Guardado automático de transcripciones en canales de Discord
- 📝 Todos los mensajes son personalizables desde `messages.json`
- 🎨 Embeds elegantes con timestamps de Discord
- 🎉 Mensaje de bienvenida automático al añadir el bot a un servidor
- 📩 DM al administrador con instrucciones de configuración
- 🔐 Información sobre privacidad y confidencialidad del bot
- 🔒 Comando `/panel-embed` para crear embeds **100% anónimos** sin dejar rastro
- ✨ Sistema de embeds con panel privado reutilizable
- 🖌️ Editor interactivo de embeds con todos los campos editables
- 👥 Control de permisos por roles para funciones de staff
- 🤖 Sistema de Q&A automático con IA (responde preguntas basándose en un canal de información)
- 🧵 Respuestas en hilos para mantener conversaciones organizadas
- 💡 Usa IA para generar respuestas precisas basadas en tu contenido
- 📋 **Sistema completo de logs** - Registra toda la actividad del servidor
- 🗑️ Logs de mensajes (eliminados, editados)
- 👥 Logs de miembros (entradas, salidas, kicks, bans, cambios de nickname)
- 🎭 Logs de roles (creados, eliminados, actualizados)
- 🔊 Logs de voz (entradas, salidas, movimientos entre canales, mutes, ensordecimientos)
- ⚡ Logs de comandos (separando admin y roles específicos)
- 🤖 Logs de actividad de bots
- 🔗 Logs de invitaciones (creación + hilos automáticos con usos)

## 🚀 Configuración Inicial

### 1. Añadir el Bot a tu Servidor

Cuando añadas el bot a tu servidor de Discord:

**📩 Recibirás un DM automático** con:
- Mensaje de bienvenida personalizado
- Instrucciones sobre configuración inicial
- Información sobre la confidencialidad y privacidad del bot
- Guía de primeros pasos

**📢 El bot enviará un mensaje al servidor** en:
- Canal de sistema (si está configurado), o
- Te dará opciones para elegir dónde recibir notificaciones

### 2. Configurar el Bot en Discord

El bot ya está conectado con tu token. Asegúrate de que tenga estos permisos en tu servidor:
- ✅ Gestionar canales
- ✅ Enviar mensajes
- ✅ Gestionar mensajes
- ✅ Insertar enlaces
- ✅ Leer historial de mensajes
- ✅ Usar comandos de aplicación
- ✅ Adjuntar archivos
- ✅ Ver registro de auditoría (para detectar quién añadió el bot)

### 3. Crear Canales de Transcripciones

Crea un canal (o varios) donde se guardarán las transcripciones de los tickets. Por ejemplo:
- `#transcripts-soporte`
- `#transcripts-reportes`
- `#transcripts-general`

Puedes usar un mismo canal para todas las categorías o canales separados.

### 4. Obtener los IDs necesarios

Para obtener IDs en Discord, primero activa el "Modo Desarrollador":
- Configuración de Usuario → Avanzado → Modo de Desarrollador

Luego haz clic derecho sobre:
- **Categorías**: Clic derecho en la categoría → "Copiar ID de categoría"
- **Roles**: Configuración del Servidor → Roles → Clic derecho en el rol → "Copiar ID del rol"
- **Canales**: Clic derecho en el canal → "Copiar ID del canal"

### 5. Editar config.json

El `config.json` está **organizado en 3 secciones claramente separadas**:

#### 🎫 Sección: TICKETS
```json
"tickets": {
  "staffRoleId": "TU_ROL_STAFF_ID",
  "ticketChannelId": "CANAL_PANEL_ID",
  "categories": { ... }
}
```

#### 🎨 Sección: EMBED
```json
"embed": {
  "defaultColor": "0099ff",
  "allowedRoles": [],
  "maxTitleLength": 256,
  "maxDescriptionLength": 4000
}
```

#### 🤖 Sección: Q&A CON IA
```json
"qaSystem": {
  "enabled": false,
  "infoChannelId": "CANAL_INFO_ID",
  "questionsChannelId": "CANAL_PREGUNTAS_ID",
  "responseModel": "gpt-4o-mini",
  "maxKnowledgeMessages": 100,
  "threadAutoArchiveDuration": 60
}
```

📖 **[Ver guía completa de configuración en CONFIG_GUIDE.md](CONFIG_GUIDE.md)**

**Ejemplo de configuración completa:**

```json
{
  "tickets": {
    "staffRoleId": "TU_STAFF_ROLE_ID",
    "ticketChannelId": "TU_TICKET_CHANNEL_ID",
    "categories": {
      "general": {
        "name": "Soporte Técnico",
        "categoryId": "TU_CATEGORY_ID",
        "transcriptChannelId": "TU_CANAL_TRANSCRIPTS_ID",
        "emoji": "🔧",
        "channelDescription": "Canal de soporte técnico"
      },
      "Soporte": {
        "name": "Soporte General",
        "categoryId": "TU_CATEGORY_ID",
        "transcriptChannelId": "TU_CANAL_TRANSCRIPTS_ID",
        "emoji": "💬",
        "channelDescription": "Canal de soporte general"
      }
    }
  },
  "embed": {
    "defaultColor": "0099ff",
    "allowedRoles": [],
    "maxTitleLength": 256,
    "maxDescriptionLength": 4000
  },
  "qaSystem": {
    "enabled": false,
    "infoChannelId": "CANAL_INFO_ID_AQUI",
    "questionsChannelId": "CANAL_PREGUNTAS_ID_AQUI",
    "responseModel": "gpt-4o-mini",
    "maxKnowledgeMessages": 100,
    "threadAutoArchiveDuration": 60
  }
}
```

**📌 Campos importantes:**
- **tickets.staffRoleId**: Rol que puede ver todos los tickets (OBLIGATORIO)
- **tickets.ticketChannelId**: Canal donde aparecerá el panel de tickets
- **tickets.categories.*.categoryId**: Categoría donde se crearán los canales
- **tickets.categories.*.transcriptChannelId**: Canal de transcripciones (OBLIGATORIO)
- **qaSystem.enabled**: `true` para activar el sistema Q&A, `false` para desactivar

## 📖 Uso

### Crear el Panel de Tickets

1. Ve al canal donde quieres el panel de tickets
2. Usa el comando: `/setup-panel`
3. El panel aparecerá con el menú desplegable integrado

### Crear un Ticket

1. Selecciona el tipo de ticket del menú desplegable del panel
2. Se creará automáticamente un canal privado
3. Solo tú y el staff podrán ver el canal

### Cerrar un Ticket

1. Dentro del canal del ticket, haz clic en **"Cerrar Ticket"**
2. La transcripción se enviará al canal de transcripciones configurado
3. El canal se eliminará después de 5 segundos

### Crear Embeds Personalizados (100% Anónimo)

El bot incluye un sistema **completamente anónimo** para crear embeds sin dejar rastro:

#### 🔒 **Método Recomendado: `/panel-embed` (Anónimo Total)**

Este método es **100% invisible** - nadie sabrá quién creó el embed:

1. Usa el comando: `/panel-embed` (opcionalmente selecciona un canal específico)
2. Aparecerá un **panel privado que solo tú puedes ver**
3. Haz clic en el botón **"✨ Crear Embed"**
4. Se abrirá un formulario interactivo con los siguientes campos:
   - **Título**: El título del embed
   - **Descripción**: Contenido principal del embed
   - **Color**: Color en formato hexadecimal (ej: 0099ff)
   - **Footer**: Texto al pie del embed
   - **Autor**: Nombre del autor
5. Completa los campos que quieras (todos son opcionales)
6. El embed se enviará al canal seleccionado **sin que nadie sepa quién lo creó**

**✨ Ventajas de `/panel-embed`:**
- ✅ **100% Anónimo** - Sin mensajes públicos de "ha utilizado /panel-embed"
- ✅ **Reutilizable** - Puedes usar el mismo panel múltiples veces
- ✅ **Privado** - Solo tú ves el panel de control
- ✅ **Sin rastros** - El embed aparece como si lo hubiera enviado el bot
- ✅ **Mensajes efímeros** - Todas las confirmaciones son privadas y solo las ves tú

### Eliminar Mensajes con `/clear` 🗑️

El bot incluye un comando para eliminar mensajes de manera eficiente con logs automáticos:

**Uso del comando:**
1. Usa el comando: `/clear cantidad:50` (puedes elegir de 1 a 100 mensajes)
2. El bot eliminará la cantidad especificada de mensajes
3. Recibirás una confirmación privada

**Sistema de Logs Automáticos:**

**Si eliminas más de 20 mensajes:**
- 📄 Se crea una **transcripción completa** en archivo `.txt`
- 🔴 Embed con color **rojo** indicando eliminación masiva
- 📋 El archivo incluye: usuario, timestamp, contenido y archivos adjuntos de cada mensaje
- 📨 Se envía al canal de logs de mensajes

**Si eliminas 20 o menos mensajes:**
- 📝 Embed con **lista de mensajes** eliminados
- 🟠 Color **naranja** para eliminaciones normales
- 👤 Muestra autor y contenido de cada mensaje (truncado a 100 caracteres)
- 📨 Se envía al canal de logs de mensajes

**Registro del comando:**
- ⚡ Se registra el uso del comando en el **canal de logs de comandos**
- 👤 Muestra quién ejecutó el comando
- 📊 Cantidad de mensajes eliminados
- 📍 Canal donde se eliminaron

**Características:**
- ✅ Límite de 1-100 mensajes por comando
- ✅ Solo funciona con mensajes de menos de 14 días (limitación de Discord)
- ✅ Requiere permiso de "Gestionar Mensajes"
- ✅ Respuestas privadas (solo tú ves el resultado)
- ✅ Logs automáticos en canales configurados

**🔐 Restricciones de Seguridad (Configurables en config.json):**

Puedes controlar **quién** y **dónde** se puede usar el comando:

**`allowedRoleId`**: Restringe el comando a un rol específico
```json
"embed": {
  "allowedRoleId": "1234567890123456"
}
```
- **Vacío (`""`)**: Cualquier usuario con permiso "Gestionar Mensajes" puede usarlo
- **Con ID de rol**: Solo usuarios con ese rol específico pueden usarlo

**`allowedChannelId`**: Restringe el comando a un canal específico
```json
"embed": {
  "allowedChannelId": "9876543210987654"
}
```
- **Vacío (`""`)**: El comando funciona en cualquier canal
- **Con ID de canal**: El comando **solo** funciona en ese canal

**💡 Ejemplo completo de restricción:**
```json
"embed": {
  "allowedRoleId": "1234567890123456",
  "allowedChannelId": "9876543210987654"
}
```
Con esta configuración, **solo** el rol `1234567890123456` podrá usar `/panel-embed` y **solo** en el canal `9876543210987654`.

### Sistema de Q&A Automático con IA 🤖

El bot incluye un sistema inteligente de preguntas y respuestas que usa IA para responder automáticamente basándose en la información de tu servidor.

**Cómo funciona:**
1. Tienes un **Canal de Información** donde pones todo el contenido informativo (reglas, guías, FAQs, etc.)
2. Los usuarios hacen preguntas en el **Canal de Preguntas**
3. El bot lee la información del canal de contenido
4. Usa IA para generar una respuesta precisa basada en esa información
5. Responde automáticamente en un hilo para mantener todo organizado

**Configuración en config.json:**
```json
{
  "qaSystem": {
    "enabled": true,
    "infoChannelId": "ID_DEL_CANAL_DE_INFORMACION",
    "questionsChannelId": "ID_DEL_CANAL_DE_PREGUNTAS",
    "responseModel": "gpt-4o-mini"
  }
}
```

**Parámetros:**
- `enabled`: `true` para activar, `false` para desactivar
- `infoChannelId`: ID del canal donde está toda la información
- `questionsChannelId`: ID del canal donde los usuarios harán preguntas
- `responseModel`: Modelo de IA a usar (opciones: `"gpt-4o-mini"`, `"gpt-4o"`, `"gpt-5-mini"`)

**Características:**
- ✅ Lee hasta 100 mensajes del canal de información
- ✅ Responde solo basándose en la información disponible
- ✅ Crea hilos automáticamente para cada pregunta
- ✅ Respuestas en español
- ✅ Indicador de "escribiendo..." mientras genera la respuesta

**Nota importante:** Este sistema usa **Replit AI Integrations**, que proporciona acceso a OpenAI sin necesitar tu propia API key. Los costos se cargan a tus créditos de Replit.

### Sistema de Logs Completo 📋

El bot incluye un **sistema modular de logs** que registra toda la actividad del servidor. Puedes activar solo los tipos de logs que necesites.

**Tipos de logs disponibles:**

1. **🗑️ Mensajes** - Mensajes eliminados y editados (con contenido original)
2. **🏗️ Canales** - Canales creados, eliminados y threads
3. **👥 Miembros** - Entradas, salidas, kicks, bans, unbans, cambios de nickname, cambios de roles
4. **🎭 Roles** - Roles creados, eliminados y actualizados (nombre, color, permisos)
5. **🔊 Voz** - Entradas, salidas y movimientos entre canales de voz
6. **⚡ Comandos** - Tracking de comandos usados (separando admins y roles específicos)
7. **🤖 Bots** - Actividad de bots (mensajes automáticos, respuestas a comandos)

**Configuración en config.json:**
```json
{
  "logs": {
    "enabled": true,
    "channels": {
      "messages": "ID_CANAL_LOGS_MENSAJES",
      "channels": "ID_CANAL_LOGS_CANALES",
      "members": "ID_CANAL_LOGS_MIEMBROS",
      "roles": "ID_CANAL_LOGS_ROLES",
      "voice": "ID_CANAL_LOGS_VOZ",
      "commands": "ID_CANAL_LOGS_COMANDOS",
      "bots": "ID_CANAL_LOGS_BOTS",
      "invites": "ID_CANAL_LOGS_INVITACIONES"
    },
    "logAllCommands": false,
    "trackedRoles": ["ID_ROL_1", "ID_ROL_2"]
  }
}
```

**Opciones de configuración:**
- **Un canal para todo**: Usa el mismo ID en todos los tipos de logs
- **Canales separados**: Usa IDs diferentes para organizar los logs por categoría
- **Solo algunos logs**: Deja vacío (`""`) los tipos que no quieras registrar
- **`logAllCommands`**: `false` = solo admins y roles específicos, `true` = todos los comandos
- **`trackedRoles`**: Array de IDs de roles cuyos comandos quieres registrar

**Características:**
- ✅ Embeds elegantes con colores por tipo de evento
- ✅ Información completa (usuario, canal, razón, moderador, etc.)
- ✅ Timestamps de Discord
- ✅ Detección automática de moderadores usando Audit Logs
- ✅ Completamente modular - activa solo lo que necesites

#### 🔗 Logs de Invitaciones (invites)

El sistema de logs incluye un **subsistema de tracking de invitaciones** que registra quién crea invitaciones y quién las usa.

**Cómo funciona:**

1. **Cuando se crea una invitación** → El bot registra un embed con:
   - Quién la creó
   - Código de la invitación
   - Fecha y hora de creación
   - Usos máximos (si tiene límite)
   - Cuándo expira (si tiene expiración)
   - Canal al que invita

2. **Cuando alguien usa la invitación** → El bot crea un hilo automático en el embed original mostrando:
   - Quién usó la invitación
   - ID del usuario
   - Cuándo se unió
   - Foto de perfil
   - Número de uso de esa invitación

**Configuración:** Añade el ID del canal en `logs.channels.invites`:
```json
{
  "logs": {
    "enabled": true,
    "channels": {
      "invites": "ID_DEL_CANAL_DE_INVITACIONES"
    }
  }
}
```

**Características:**
- ✅ Registro automático de todas las invitaciones creadas
- ✅ Hilos automáticos por cada invitación mostrando todos sus usos
- ✅ Tracking completo de usos por invitación
- ✅ Información completa del usuario que se unió (avatar, ID, fecha)
- ✅ Integrado en el sistema de logs
- ✅ Mensajes personalizables desde `messages.json` (sección `logs.invites`)

**Ejemplo de uso:**

1. Un moderador crea una invitación → Aparece un embed en el canal de logs:
   ```
   🔗 Invitación Creada
   
   👤 Creado por: @Moderador
   📅 Fecha: 5 nov 2025, 6:15 AM
   🔗 Código: abc123
   📊 Usos máximos: 10
   📍 Canal: #general
   ```

2. Alguien usa esa invitación → Se crea un hilo en ese embed:
   ```
   @NuevoUsuario usó la invitación abc123 (Uso #1)
   
   👤 Usuario: @NuevoUsuario
   🆔 ID: 123456789
   📅 Se unió: hace 2 segundos
   ```

3. Otro usuario usa la misma invitación → Se añade al mismo hilo:
   ```
   @OtroUsuario usó la invitación abc123 (Uso #2)
   
   👤 Usuario: @OtroUsuario
   🆔 ID: 987654321
   📅 Se unió: hace 5 minutos
   ```

¡Perfecto para hacer tracking de qué invitación trae más gente a tu servidor! 📊

📖 **Ver [CONFIG_GUIDE.md](CONFIG_GUIDE.md) para más ejemplos de configuración de logs**

## 📋 Formato de Transcripciones

Las transcripciones se envían a Discord con:
- **Embed informativo** con:
  - Nombre del ticket
  - Creador del ticket (con mención)
  - Fechas de creación y cierre (formato Discord)
  - Lista de participantes (menciones de todos los que escribieron)
- **Archivo .txt expandible** con toda la conversación completa
  - Se puede expandir directamente en Discord sin descargar
  - Incluye timestamps, autores, y contenido de todos los mensajes
  - Registra archivos adjuntos y embeds

## 🎨 Personalización

### Editar Mensajes del Bot

**TODOS** los mensajes del bot se pueden personalizar en `messages.json`, incluyendo:

#### 📝 Mensajes de Tickets
```json
{
  "panel": {
    "title": "🎫 Sistema de Tickets",
    "description": "Tu descripción personalizada",
    "footer": "Tu footer personalizado"
  },
  "ticketWelcome": {
    "title": "{emoji} Ticket de {categoryName}",
    "description": "Tu mensaje de bienvenida"
  }
}
```

#### 📋 Mensajes de Logs (¡NUEVO!)
Ahora puedes personalizar **todos los títulos de los logs**:

```json
{
  "logs": {
    "messages": {
      "deleted": "🗑️ Mensaje Eliminado",
      "edited": "✏️ Mensaje Editado"
    },
    "channels": {
      "created": "➕ Canal Creado",
      "deleted": "➖ Canal Eliminado",
      "threadCreated": "🧵 Thread Creado",
      "threadDeleted": "🧵 Thread Eliminado"
    },
    "members": {
      "joined": "👋 Miembro Unido",
      "left": "👋 Miembro Salió",
      "kicked": "🦶 Miembro Expulsado (Kick)",
      "nicknameChanged": "📝 Nickname Cambiado",
      "banned": "🔨 Miembro Baneado",
      "unbanned": "🔓 Miembro Desbaneado"
    },
    "roles": {
      "created": "➕ Rol Creado",
      "deleted": "➖ Rol Eliminado",
      "updated": "🔄 Rol Actualizado",
      "memberRolesUpdated": "🎭 Roles de Miembro Actualizados"
    },
    "voice": {
      "joined": "🔊 Usuario Entró a Canal de Voz",
      "left": "🔇 Usuario Salió de Canal de Voz",
      "moved": "🔀 Usuario Movido entre Canales de Voz"
    },
    "commands": {
      "admin": "⚡ Comando Usado (Admin)",
      "regular": "💬 Comando Usado"
    },
    "bots": {
      "activity": "🤖 Actividad de Bot"
    }
  }
}
```

💡 **Puedes cambiar cualquier emoji, texto o estilo** a tu gusto. Solo edita `messages.json` y reinicia el bot.

**Variables disponibles en mensajes de tickets:**
- `{emoji}` - El emoji de la categoría
- `{categoryName}` - Nombre de la categoría
- `{user}` - Mención del usuario
- `{channel}` - Mención del canal
- `{serverName}` - Nombre del servidor (en mensajes de bienvenida)

### Personalizar Mensajes de Bienvenida

Cuando añades el bot a un nuevo servidor, se envían mensajes automáticos. Puedes personalizarlos en `messages.json`:

```json
{
  "welcome": {
    "dmTitle": "🎉 ¡Gracias por añadir el Bot de Tickets!",
    "dmDescription": "Tu mensaje personalizado aquí. Usa {serverName} para el nombre del servidor.",
    "serverTitle": "🤖 Bot de Tickets Añadido",
    "serverDescription": "Mensaje que aparece en el canal de sistema del servidor"
  }
}
```

Este mensaje incluye automáticamente:
- 🔒 Información sobre confidencialidad y privacidad
- 📝 Instrucciones de configuración inicial
- 🛡️ Permisos necesarios

### Agregar más tipos de tickets

Edita `config.json` y agrega nuevas entradas en `tickets.categories`:

```json
{
  "tickets": {
    "staffRoleId": "TU_STAFF_ROLE_ID",
    "ticketChannelId": "TU_TICKET_CHANNEL_ID",
    "categories": {
      "general": { ... },
      "nuevo_tipo": {
        "name": "Nombre Visible",
        "categoryId": "ID_DE_LA_CATEGORIA",
        "transcriptChannelId": "ID_CANAL_TRANSCRIPTS",
        "emoji": "🎉",
        "channelDescription": "Descripción del canal"
      }
    }
  }
}
```

**📖 Consulta [CONFIG_GUIDE.md](CONFIG_GUIDE.md) para más detalles**

### Cambiar colores de los embeds

En `index.js`, busca `.setColor()` y cambia el valor hexadecimal:
- `#0099ff` - Azul (panel de tickets)
- `#00ff00` - Verde (ticket creado)
- `#3498db` - Azul claro (transcripción)
- `#ff0000` - Rojo (ticket cerrado)

## 🔧 Solución de Problemas

### El bot no responde
- Verifica que el bot esté online en Discord
- Revisa los logs del workflow en Replit

### No se crean los canales
- Asegúrate de que los `categoryId` en `config.json` sean correctos
- Verifica que el bot tenga permisos de administrador o "Gestionar Canales"

### Error al guardar transcripciones
- Verifica que los `transcriptChannelId` sean correctos
- Asegúrate de que el bot tenga permisos para enviar mensajes y archivos en esos canales

### Los comandos slash no aparecen
- Espera unos minutos (pueden tardar en sincronizarse)
- Echa al bot del servidor y vuelve a invitarlo

## 📝 Archivos de Configuración

### config.json
Configuración de categorías, roles y canales de Discord.

### messages.json
Todos los mensajes que el bot envía. Personaliza aquí el texto.

### index.js
Código principal del bot. Solo edita si necesitas cambios avanzados.

## 🆘 Soporte

Si tienes problemas o preguntas, revisa:
1. Los logs del workflow
2. Los permisos del bot en Discord
3. Que los IDs en config.json sean correctos
4. Que los canales de transcripciones existan y sean accesibles
