# 🤖 Discord Bot Completo - Strangers RP

Bot de Discord todo-en-uno con gestión de tickets, verificación automática, moderación con IA, logs completos y Q&A inteligente.

## 📋 ÚLTIMA ACTUALIZACIÓN: 2025-11-08

**Total de comandos: 39 comandos** (36 base + 3 sistema de bienvenidas optimizado)

### ✨ Cambios Implementados Hoy

#### SESIÓN 4: Limpieza Masiva y Preparación para VPS (2025-11-08)
1. **Limpieza Completa de Archivos Temporales**:
   - Eliminado directorio `attached_assets/` (47MB de imágenes temporales de prueba)
   - Eliminado directorio `verification-bot/` (bot de prueba antiguo)
   - Eliminado directorio `old-files/` (archivos antiguos)
   - Limpiados logs temporales de `/tmp/logs`
   - Total de espacio recuperado: ~50MB

2. **Optimización de Estructura de Código**:
   - Movidos sistemas de subdirectorios al directorio principal: `warns-system.js`, `simple-tasks-system.js`, `welcome-system.js`
   - Eliminados directorios vacíos: `src/systems/warns/`, `src/systems/tasks/`, `src/systems/welcome/`
   - Reorganizado `invite-cache.json` de `src/systems/` a `src/data/`
   - Actualizadas todas las rutas relativas en `index.js` y sistemas
   - Corregidas referencias de `require()` para logger después de reestructuración

3. **Simplificación de Documentación**:
   - Eliminados archivos markdown duplicados: `CONFIG_GUIDE.md`, `WATCHDOG.md`, `LEEME-IMPORTANTE.md`, `DEPLOY-INSTRUCTIONS.txt`
   - Solo quedan 4 archivos de documentación esenciales:
     - `README.md` - Documentación principal
     - `replit.md` - Estado del proyecto y memoria
     - `DEPLOYMENT.md` - Guía completa de deployment para VPS
     - `deploy-vps.sh` - Script automático de deployment

4. **Scripts de Deployment para VPS**:
   - Creado `deploy-vps.sh`: Script bash automatizado para deployment en Digital Ocean VPS
   - Creado `DEPLOYMENT.md`: Guía completa con instrucciones paso a paso para:
     - Configuración inicial del VPS (Ubuntu 20.04+)
     - Instalación de Node.js 18+ y PM2
     - Configuración de variables de entorno
     - Comandos PM2 para gestión del bot
     - Configuración de PostgreSQL local
     - Seguridad y firewall
     - Monitoreo y troubleshooting

5. **Estado Final del Proyecto**:
   - Tamaño total: 229MB (reducido de ~280MB)
   - 80 archivos JavaScript (sin contar node_modules)
   - Estructura limpia y optimizada
   - ✅ Bot funcionando correctamente después de limpieza
   - ✅ Todos los sistemas iniciados sin errores

#### SESIÓN 3: Sistema de Bienvenidas Optimizado (2025-11-08)
1. **Nuevo Sistema WelcomeSystem**: Sistema completo de bienvenidas personalizables con PostgreSQL
2. **3 Comandos Finales**:
   - `/bienvenida-setup`: Configurar canal, mensaje y color inicialmente
   - `/bienvenida-editar`: Editar configuración existente
   - `/bienvenida-test`: Enviar mensaje de prueba antes de usar
3. **Avatar Automático**: El icono del usuario que entra se muestra automáticamente en la bienvenida
4. **Siempre Activo**: No necesita activación/desactivación - Funciona automáticamente si está configurado
5. **Variables Dinámicas Disponibles**:
   - `{usuario}`: Mención del nuevo miembro
   - `{nombre}`: Nombre de usuario
   - `{tag}`: Tag completo (nombre#0000)
   - `{servidor}`: Nombre del servidor
   - `{miembros}`: Cantidad total de miembros
   - `{id}`: ID del usuario
6. **Configuración Persistente**: Base de datos PostgreSQL con tabla `welcome_config`
7. **Solo para Directiva**: Todos los comandos requieren rol de Directiva para editar
8. **Totalmente Personalizable**: Mensaje personalizado y color del embed
9. **Event Handler guildMemberAdd**: Envía bienvenidas automáticas cuando usuarios se unen

#### SESIÓN 1: Unificación y Optimización de Comandos
1. **`/ticket-crear` ampliado**: Ahora soporta creación de tickets para **usuarios Y roles** con dropdown de selección
2. **Comandos unificados optimizados**:
   - `/mensaje-boton` (renombrado de `editar-mensaje-boton`)
   - `/ticket-añadir` y `/ticket-eliminar` ya unificados desde sesión anterior
3. **`/comandos` rediseñado**: Ahora muestra **TODOS** los 33 comandos del bot organizados por categoría (no solo comandos personalizados)
4. **`/bot-info` completamente renovado**: 8 embeds con todas las funcionalidades, usos y comandos
5. **Comandos reordenados**:
   - Streamers: `/streamer-añadir`, `/streamer-eliminar`, `/streamer-lista`
   - Tareas: `/tarea-crear`, `/tarea-borrar`, `/tarea-ver`
6. **Sugerencias unificadas**: `/sug-responder` con dropdown (Aprobada/Rechazada) y razón opcional
7. **Sistema de changelog simplificado**: Envío directo a Discord sin archivos intermedios
8. **Mensaje de reinicio mejorado**: "Mantenimiento realizado por **egolatrada**" con indicador de ÉXITO/FALLO
9. **Documentación consolidada**: 16 archivos .md eliminados, manteniendo solo los esenciales:
   - `replit.md` (principal)
   - `README.md` (GitHub)
   - `CONFIG_GUIDE.md` (configuración)
   - `WATCHDOG.md` (monitoreo)
   - `LEEME-IMPORTANTE.md` (deployment)

#### SESIÓN 2: Sistema de Inactividad Mejorado
10. **Sistema de inactividad COMPLETAMENTE REDISEÑADO**:
    - ✅ **Menciones inteligentes por rol específico**: Ahora detecta y guarda el ROL EXACTO del staff que está respondiendo (soporte/moderador/administrador/directiva)
    - ✅ **Notificaciones bidireccionales**:
      - Si el último mensaje es del **usuario** → Menciona al **rol específico del staff** que estaba respondiendo (no al rol genérico)
      - Si el último mensaje es del **staff** → Menciona al **usuario/rol creador** del ticket
    - ✅ **Soporte completo para tickets de rol**: Cuando se crea un ticket con `/crear-ticket` para un rol, detecta correctamente cuando miembros de ese rol responden
    - ✅ **Detección de creador mejorada**: El sistema diferencia correctamente entre tickets creados para usuarios individuales vs tickets creados para roles completos
    - ✅ **Menciones correctas**: Usa formato `<@userid>` para usuarios y `<@&roleid>` para roles en todas las notificaciones
    - ✅ **Jerarquía de roles respetada**: Al detectar qué staff está respondiendo, prioriza el rol más alto (Directiva → Administrador → Moderador → Soporte)

11. **`/mensaje-boton` mejorado**: La opción de canal ahora usa **dropdown** en lugar de ingresar ID manualmente, mejorando la experiencia de usuario

---

## 🚀 DEPLOYMENT EN VPS (DIGITAL OCEAN)

**⚠️ PRODUCCIÓN**: Este bot está configurado para deployment dual-environment:
- **Desarrollo**: Replit (testing y desarrollo)
- **Producción**: VPS Digital Ocean con PM2 (99.99% uptime)

### 📖 Guía de Deployment

Lee la guía completa en **`DEPLOYMENT.md`** que incluye:
- ✅ Configuración completa de VPS Ubuntu 20.04+
- ✅ Instalación de Node.js 18+, PM2 y PostgreSQL
- ✅ Script automatizado de deployment (`deploy-vps.sh`)
- ✅ Configuración de variables de entorno
- ✅ Comandos PM2 para gestión del bot
- ✅ Seguridad, monitoreo y troubleshooting
- ✅ Sistema de auto-restart y logs rotativos

---

# 🎫 Bot Principal

## Descripción
Bot de Discord para gestionar un sistema de tickets con múltiples opciones, categorías personalizadas y guardado automático de transcripciones.

## Características
- Panel de tickets con botones interactivos
- Selección de opciones mediante menú desplegable
- Creación automática de canales en categorías específicas
- Sistema de permisos (solo creador y staff pueden ver el ticket)
- **Numeración persistente de tickets** - Los números se guardan en archivo JSON y sobreviven reinicios
- **Sistema "Subir a soporte"** - Botón en tickets que crea canales de voz temporales
  - Máximo 2 canales de voz por ticket
  - Timer de 15 minutos que empieza cuando el creador se une (no al crear)
  - Eliminación automática al quedar vacío o al cerrar el ticket
  - Log con vinculación al ticket padre
- Guardado de transcripciones organizadas por tipo de opción en canales de Discord
- Transcripciones con embed informativo y archivo expandible
- Lista de participantes en cada ticket
- Mensajes de bienvenida automáticos al añadir el bot a servidores
- DM al administrador con instrucciones de configuración
- Información sobre confidencialidad y privacidad incluida
- Comando `/panel-embed` para crear embeds **100% anónimos** sin rastros
- Panel privado reutilizable que solo ve el creador
- Editor interactivo con todos los campos del embed editables
- Control de permisos por roles para staff
- Sistema de Q&A automático con IA (responde preguntas en hilos)
- IA genera respuestas basadas en información del servidor
- Usa Replit AI Integrations (no requiere API key propia)
- **Sistema completo de logs** - Archivo separado (logs-system.js)
- Logs de mensajes (eliminados, editados)
- Logs de canales (creados, eliminados, threads)
- Logs de canales de voz de tickets con vinculación al ticket padre
- Logs de miembros (entradas, salidas, kicks, bans, nicknames, roles)
- Logs de roles (creados, eliminados, actualizados)
- Logs de voz (entradas, salidas, movimientos, mutes, ensordecimientos)
- Logs de comandos (admin y roles específicos)
- Logs de actividad de bots
- Logs de invitaciones (creación + hilos con tracking de usos)
- **Sistema de invitaciones** - Archivo separado (invites-system.js)
- Integrado en el sistema de logs como un tipo más
- Tracking completo de creación de invitaciones
- Hilos automáticos mostrando quién usa cada invitación
- Información detallada (avatar, ID, fecha de entrada)
- **Sistema de moderación con IA** - Archivo separado (moderation-system.js)
- Detección automática de contenido inapropiado (NSFW/gore) en imágenes/videos con Gemini AI
- Verificación de seguridad de enlaces (phishing, malware)
- Transcripción automática de videos para análisis de contenido
- Timeouts automáticos para contenido peligroso
- Comandos de moderación (/kick, /ban, /unban) con logs separados de staff
- **Sistema anti-spam y anti-duplicados**
- Detección automática de spam (muchos mensajes en poco tiempo)
- Detección de mensajes duplicados (mismo contenido repetido)
- Eliminación automática de todos los mensajes ofensivos
- Notificaciones DM al usuario infractor con advertencias personalizadas
- Alertas al canal de staff con detalles completos
- Sistema de advertencias acumulativas por usuario
- Configuración flexible de thresholds y ventanas de tiempo
- **Sistema de verificación integrado** - Archivo separado (verification-system.js)
- Asigna automáticamente "No Verificado" al unirse
- Cambia a "Sin Whitelist" al verificarse mediante botón
- Configuración completa en config.json
- Seguro (sin tokens hardcodeados)
- **Sistema de monitoreo y auto-restart** - Protección 24/7
- Comandos `/restart` y `/status` para administradores
- Health check automático cada 5 minutos
- Manejo avanzado de errores no manejados
- Watchdog externo opcional para máxima resiliencia
- Protección contra loops de reinicio infinitos
- Tracking de errores, uptime y estadísticas completas

## Configuración

El `config.json` está **organizado en 5 secciones claramente separadas**:

### 🎫 Sección: TICKETS
- `tickets.staffRoleId`: ID del rol de staff que puede ver todos los tickets
- `tickets.ticketChannelId`: ID del canal donde aparecerá el panel de tickets
- `tickets.categories`: Categorías personalizables de tickets (soporta ilimitadas)

### 🎨 Sección: EMBED (100% ANÓNIMO)
- `embed.defaultColor`: Color por defecto de los embeds (hexadecimal)
- `embed.allowedRoleId`: 🔒 ID del rol que puede usar `/panel-embed` (vacío = "Gestionar Mensajes")
- `embed.allowedChannelId`: 🔒 ID del canal donde funciona el comando (vacío = cualquier canal)
- `embed.maxTitleLength`: Longitud máxima del título del embed
- `embed.maxDescriptionLength`: Longitud máxima de la descripción

### 🤖 Sección: Q&A CON IA
- `qaSystem.enabled`: Activar/desactivar el sistema de Q&A
- `qaSystem.infoChannelId`: Canal con la información base
- `qaSystem.questionsChannelId`: Canal donde los usuarios hacen preguntas
- `qaSystem.responseModel`: Modelo de IA (gpt-4o-mini, gpt-4o, gpt-5-mini)
- `qaSystem.maxKnowledgeMessages`: Máximo de mensajes a leer del canal info
- `qaSystem.threadAutoArchiveDuration`: Minutos antes de archivar hilos

### 📋 Sección: SISTEMA DE LOGS
- `logs.enabled`: Activar/desactivar todo el sistema de logs
- `logs.channels`: Canales para cada tipo de log (messages, channels, members, roles, voice, commands, bots, invites)
- `logs.logAllCommands`: Registrar todos los comandos o solo admin/roles específicos
- `logs.trackedRoles`: Array de IDs de roles cuyos comandos se registrarán

**Logs de Invitaciones:**
- `logs.channels.invites`: Canal donde se registran las invitaciones
- Cuando alguien crea una invitación → Se crea un embed con la información
- Cuando alguien usa la invitación → Se crea un hilo automático en ese embed
- Cada nuevo uso se añade al mismo hilo → Tracking completo de usos por invitación

### 🛡️ Sección: MODERACIÓN AUTOMÁTICA
- `autoModeration.enabled`: Activar/desactivar sistema de moderación con IA
- `autoModeration.staffChannelId`: Canal donde se envían las alertas de moderación
- `autoModeration.timeoutDuration`: Duración del timeout en minutos para contenido peligroso
- **Anti-Spam y Anti-Duplicados:**
  - `antiSpam.enabled`: Activar/desactivar detección de spam/duplicados
  - `antiSpam.maxMessages`: Máximo de mensajes permitidos en la ventana de tiempo (default: 5)
  - `antiSpam.maxDuplicates`: Máximo de mensajes duplicados permitidos (default: 3)
  - `antiSpam.timeWindow`: Ventana de tiempo en segundos para análisis (default: 10)
  - `antiSpam.minMessageLength`: Longitud mínima de mensaje para análisis (default: 3)
  - `antiSpam.maxWarnings`: Máximo de advertencias antes de acción adicional (default: 3)

📖 **Ver [CONFIG_GUIDE.md](CONFIG_GUIDE.md) para detalles completos de configuración**

El bot usa la integración de Discord de Replit para autenticación

## Estructura del Proyecto
- `index.js`: Archivo principal del bot con toda la lógica de tickets, embeds, Q&A, canales de voz y monitoreo
- `logs-system.js`: **Sistema de logs completamente separado** (modular e independiente)
- `invites-system.js`: **Sistema de invitaciones** (integrado con logs, modular)
- `moderation-system.js`: **Sistema de moderación con IA** (detección NSFW, links, spam, duplicados)
- `verification-system.js`: **Sistema de verificación automática** (asignación de roles, embeds)
- `social-links-system.js`: **Sistema de vinculaciones de redes sociales** (gestión y notificaciones)
- `custom-commands-system.js`: **Sistema de comandos personalizados** (respuestas rápidas para staff)
- `watchdog.js`: **Script de monitoreo externo** (auto-restart, prevención de loops)
- `config.json`: Configuración organizada en 6 secciones (tickets, embed, qaSystem, logs, autoModeration, verification)
- `messages.json`: Todos los mensajes personalizables del bot (incluyendo logs, invites, moderación)
- `ticket-data.json`: **Persistencia de contadores de tickets** (se crea automáticamente)
- `social-links-data.json`: **Persistencia de vinculaciones de redes sociales** (se crea automáticamente)
- `custom-commands-data.json`: **Persistencia de comandos personalizados** (se crea automáticamente)
- `README.md`: Documentación completa de uso
- `CONFIG_GUIDE.md`: Guía detallada de configuración del config.json
- `WATCHDOG.md`: Documentación completa del sistema de monitoreo y auto-restart
- `SOCIAL-LINKS-README.md`: Documentación completa del sistema de redes sociales
- `CUSTOM-COMMANDS-README.md`: Documentación completa del sistema de comandos personalizados
- `package.json`: Scripts npm (`start`, `watchdog`)

## Comandos

### Gestión de Tickets
- `/setup-panel`: Crea el panel de tickets (solo administradores)

### Moderación
- `/clear`: Elimina mensajes del canal (1-100 mensajes, requiere permiso de Gestionar Mensajes)
  - Envía transcripción al log de mensajes si son >20 mensajes
  - Envía embed con lista si son ≤20 mensajes
  - Registra uso del comando en log de comandos
- `/kick`: Expulsa a un usuario del servidor (requiere permiso de Expulsar Miembros)
- `/ban`: Banea a un usuario del servidor (requiere permiso de Banear Miembros)
- `/unban`: Desbanea a un usuario (requiere permiso de Banear Miembros)

### Utilidades
- `/panel-embed`: Crea embeds de forma **100% anónima** usando un panel privado (requiere permiso de Gestionar Mensajes)

### Administración del Bot
- `/restart`: Reinicia el bot manualmente (solo administradores)
- `/status`: Muestra el estado completo de salud del bot (solo administradores)
- `/donar`: Muestra información de donación para apoyar el proyecto

### Redes Sociales
- `/social-link add`: Vincular cuenta de red social de un usuario
- `/social-link remove`: Eliminar vinculación
- `/social-link list`: Ver vinculaciones (todas o filtradas por usuario)
- `/social-link toggle`: Activar/desactivar vinculación

### Comandos Personalizados
- `/crear-comando nuevo`: Crear nuevo comando personalizado (solo !)
- `/crear-comando editar`: Editar comando existente
- `/crear-comando eliminar`: Eliminar comando
- `/crear-comando listar`: Ver todos los comandos (staff)
- `/crear-comando toggle`: Activar/desactivar comando
- `/comandos`: Lista de comandos disponibles (cualquier usuario)
- `!ayuda`, `!info`, `!reglas`, etc.: Ejecutar comando personalizado (trigger efímero)

## Botones en Tickets
- **📞 Subir a soporte**: Crea un canal de voz temporal (máx. 2 por ticket)
  - Solo el creador del ticket puede usarlo
  - Timer de 15 minutos empieza cuando el creador se une
  - Se elimina automáticamente al quedar vacío o cerrar el ticket
  - Registra la creación en el log de canales con vinculación al ticket
- **🔒 Cerrar Ticket**: Guarda la transcripción y cierra el ticket
  - Elimina también el canal de voz si existe

## Sistema de Q&A con IA
- Configurable en `config.json` → `qaSystem`
- Requiere 2 canales: uno de información y otro de preguntas
- El bot responde automáticamente preguntas basándose en el contenido del canal de información
- Respuestas en hilos para mantener conversaciones organizadas
- Usa OpenAI a través de Replit AI Integrations (se cobra a tus créditos de Replit)

## Mensajes Automáticos
- Mensaje de bienvenida por DM al administrador cuando se añade el bot
- Mensaje en el canal de sistema del servidor (o DM alternativo si no existe)
- Todos los mensajes personalizables desde `messages.json`

## Transcripciones
- Se guardan automáticamente en canales de Discord (no archivos locales)
- Formato: Embed + archivo .txt expandible
- Incluyen: creador, participantes, fechas y mensajes completos

## 📱 Sistema de Redes Sociales

Sistema completo de vinculación de cuentas de redes sociales de usuarios con notificaciones automáticas en Discord.

### Características
- ✅ Soporte para 8+ plataformas: Twitch, Kick, YouTube, Instagram, Twitter/X, Threads, TikTok, Facebook
- ✅ Gestión 100% por comandos (sin editar archivos manualmente)
- ✅ Almacenamiento persistente en `social-links-data.json`
- ✅ Sistema de activación/desactivación de vinculaciones
- ✅ Preparado para notificaciones automáticas (API webhooks)

### Comandos
- `/social-link add` - Vincular cuenta de red social de un usuario
- `/social-link remove` - Eliminar vinculación por ID
- `/social-link list` - Ver todas las vinculaciones o filtrar por usuario
- `/social-link toggle` - Activar/desactivar vinculación

📖 **Ver [SOCIAL-LINKS-README.md](SOCIAL-LINKS-README.md) para documentación completa del sistema**

## 📝 Sistema de Comandos Personalizados

Sistema de respuestas rápidas y plantillas personalizadas para staff con prefijo `!`.

### Características
- ✅ Comandos con prefijo `!` personalizable (ej: !ayuda, !reglas, !info)
- ✅ **Triggers efímeros** - El mensaje del comando se borra automáticamente
- ✅ Gestión 100% por comandos slash (`/crear-comando`)
- ✅ Embeds personalizados con título, descripción, campos, imágenes
- ✅ Almacenamiento persistente en `custom-commands-data.json`
- ✅ Sistema de activación/desactivación
- ✅ **Permisos configurables** - Rol de staff personalizable en `config.json`
  - Configura `customCommands.staffRoleId` con el ID del rol
  - Si está vacío, usa el permiso "Gestionar Mensajes"
- ✅ Estadísticas de uso automáticas
- ✅ Perfecto para respuestas rápidas en tickets

### Comandos
- `/crear-comando nuevo` - Crear nuevo comando personalizado
- `/crear-comando editar` - Editar comando existente
- `/crear-comando eliminar` - Eliminar comando
- `/crear-comando listar` - Ver todos los comandos (staff)
- `/crear-comando toggle` - Activar/desactivar comando
- `/comandos` - Lista todos los comandos disponibles (cualquier usuario)

### Uso
Una vez creado un comando con `/crear-comando nuevo`, simplemente escribe el comando en cualquier canal:
- `!ayuda` - Envía la plantilla de ayuda (el trigger se borra automáticamente)
- `!reglas` - Envía las reglas del servidor
- `!info` - Envía información
- `!soporte` - Envía plantilla de soporte

**Nota:** El mensaje del trigger `!comando` se borra automáticamente para mantener el chat limpio.

📖 **Ver [CUSTOM-COMMANDS-README.md](CUSTOM-COMMANDS-README.md) para documentación completa y ejemplos**

## 🎯 Sistema de Jerarquía de Tickets (ACTUALIZADO 2025-11-08)

Sistema jerárquico de permisos en tickets con escalación controlada entre niveles de staff y bloqueo entre usuarios del mismo nivel.

### Características
- ✅ **Jerarquía de 4 niveles**: Soporte → Moderador → Administrador → **Directiva**
- ✅ **Bloqueo entre mismo nivel**: Si Soporte A maneja el ticket, Soporte B solo puede leer
- ✅ **Transferencia de control**: Cuando un nivel superior responde después de escalación, toma el control del ticket
- ✅ **Escalación por menciones**: @Moderador, @Administrador o @Directiva desbloquea su acceso
- ✅ **Persistencia**: Tracking de quién maneja cada ticket y a qué niveles se escaló
- ✅ **Limpieza automática**: Datos se eliminan al cerrar tickets

### Configuración
Ver `config.json` → `tickets.hierarchy`:
```json
{
  "hierarchyEnabled": true,
  "soporte": { "roleId": "1425955479737077760", "level": 1 },
  "moderador": { "roleId": "1425955473240363082", "level": 2 },
  "administrador": { "roleId": "1425955470236975186", "level": 3 },
  "directiva": { "roleId": "1435808275739181110", "level": 4 }
}
```

### Flujo de Escalación con Transferencia de Control
1. **Ticket se crea** → Permisos basados en roles disponibles en categoría
2. **Soporte A responde** → Toma control del ticket, otros Soportes bloqueados (solo lectura)
3. **Soporte A menciona @Moderador** → Moderador gana permisos de escritura
4. **Moderador B responde** → **Toma control del ticket**, otros Moderadores bloqueados
5. **Moderador B menciona @Administrador** → Administrador gana permisos de escritura
6. **Administrador C responde** → **Toma control del ticket**, otros Administradores bloqueados
7. **Administrador C menciona @Directiva** → Directiva gana permisos de escritura
8. **Directiva D responde** → **Toma control del ticket**, otros miembros de Directiva bloqueados
9. **Ticket se cierra** → Datos de jerarquía se limpian

### Bloqueo Entre Mismo Nivel y Colaboración (ACTUALIZADO 2025-11-08)
- Si **Soporte A** escribe primero → **Soporte B, C, D...** solo pueden leer
- Si **Soporte B** intenta escribir → Su mensaje se elimina + recibe DM con aviso

**Para colaborar entre compañeros del mismo nivel:**
- **Soporte A** menciona a **@SoporteB** (usuario específico) → Solo Soporte B se desbloquea
- **Soporte C, D...** siguen bloqueados
- **Moderador, Admin, Directiva** siguen bloqueados (no se escala)
- Mensaje de confirmación: "🤝 **Colaboración activada**: @SoporteB ahora puede escribir en este ticket."

**Para escalar al nivel superior:**
- **Soporte A** menciona **@Moderador** (rol completo) → Todo el rol Moderador se desbloquea
- Esto ES escalación → Los niveles superiores ganan acceso

**El mismo comportamiento aplica a TODOS los niveles** (Moderador, Admin, Directiva)

### Fallback Jerárquico
- Si categoría tiene Soporte → Solo Soporte escribe inicialmente
- Si NO tiene Soporte pero tiene Moderador → Moderador escribe inicialmente
- Si solo tiene Administrador → Administrador escribe inicialmente
- Si solo tiene Directiva → Directiva escribe inicialmente

### Archivos Clave
- `config.json`: Configuración de jerarquía con 4 niveles
- `src/systems/ticket-hierarchy.js`: Sistema de tracking, permisos y transferencia de control
- `src/systems/tickets.js`: Creación de tickets con fallback
- `src/data/ticket-hierarchy.json`: Persistencia de datos (se crea automáticamente)

## ⏱️ Sistema de Inactividad de Tickets (NUEVO)

Sistema automático de gestión de inactividad con timers separados para staff y usuarios, y comando manual para prevenir cierres automáticos.

### Características
- ✅ **Inactividad de Soporte (6 horas)**: Mención automática + desbloqueo del ticket
- ✅ **Inactividad de Usuario (6h advertencia, 7h cierre)**: Advertencias y cierre automático con transcripción
- ✅ **Comando `/mantener-activo`**: Marca ticket como activo permanentemente (solo cierre manual)
- ✅ **Timers inteligentes**: Solo se activan DESPUÉS de que el soporte responde
- ✅ **Tracking persistente**: Actividad guardada en src/data/ticket-activity.json

### Flujo de Inactividad

**Inactividad de Soporte:**
1. Ticket creado → Soporte no responde en 6h
2. Se menciona al rol de soporte + se desbloquea el ticket
3. Usuario puede seguir esperando sin penalización

**Inactividad de Usuario:**
1. Ticket creado → Soporte responde
2. Usuario no responde en 6h → Advertencia automática
3. Usuario no responde en 7h → Cierre automático con transcripción

**Comando Mantener Activo:**
1. Staff ejecuta `/mantener-activo`
2. Ticket se marca como activo **permanentemente**
3. Solo se puede cerrar manualmente con el botón "Cerrar Ticket"
4. **No hay tiempo de expiración** - El ticket nunca se cierra automáticamente

### Bugs Corregidos (2025-11-07)
- ✅ **Bug #1**: Usuario ya no es penalizado si soporte nunca respondió
- ✅ **Bug #2**: Timers se basan en última respuesta del soporte (no creación del ticket)
- ✅ **Bug #3**: Timers se resetean correctamente al expirar mantener-activo

### Comandos
- `/mantener-activo`: Marca ticket como activo permanentemente (solo staff)

### Archivos Clave
- `src/systems/ticket-inactivity.js`: Lógica de verificación y timers
- `src/commands/tickets/keep-active.js`: Comando /mantener-activo
- `src/data/ticket-activity.json`: Persistencia de tracking (se crea automáticamente)

## 🆕 Nuevos Comandos (2025-11-07)

### Gestión Avanzada de Tickets
- `/crear-ticket`: Crear ticket en nombre de otro usuario con selección de categoría (autocomplete)
- `/añadir-rol`: Añadir rol a un ticket con permisos de lectura/escritura
- `/eliminar-rol`: Eliminar rol de un ticket
- `/eliminar-usuario`: Eliminar usuario de un ticket (protege al creador)
- `/renombrar`: Renombrar ticket con sistema de prioridades por color:
  - 🔴 URGENTE (rojo)
  - 🟠 MEDIA (naranja)
  - 🟡 BAJA (amarillo)
  - 🟢 SIN PRISA (verde)

### Sistema de Sugerencias
- `/sugerir`: Crear sugerencia en canal específico con sistema de votación (👍/👎)
  - Las sugerencias se publican en canal configurado (ID: 1425955815885504646)
  - Cada sugerencia genera un hilo automático para discusión
  - Los botones de votación son interactivos y actualizan el contador
- `/sug-aprobada`: Marcar sugerencia como aprobada (solo administradores)
  - Embed verde con mensaje de aprobación
  - Elimina botones de votación
- `/sug-rechazada`: Marcar sugerencia como rechazada (solo administradores)
  - Embed rojo con razón del rechazo
  - Elimina botones de votación

### Utilidades Avanzadas
- `/rol-id`: Obtener información detallada de un rol (ID, color, miembros, permisos)
- `/solicitar-bot`: Información de servicios de bot personalizado por DM
- `/staff-status`: Estadísticas de actividad del staff (tickets creados, cerrados, comandos usados)
- `/bot-info`: Documentación completa del bot con embeds informativos

## 📝 Sistema de Changelog Automático (ACTUALIZADO 2025-11-08)

Sistema que **envía automáticamente** los changelogs al canal de Discord cada vez que el bot se reinicia.

### Características
- ✅ **Envío automático al reiniciar**: Los changelogs se envían sin intervención manual
- ✅ **Persistencia**: Se guardan en archivo JSON hasta que se envíen
- ✅ **Múltiples changelogs**: Puedes agregar varios que se enviarán en el próximo reinicio
- ✅ **Script helper**: `add-changelog.js` para agregar changelogs fácilmente
- ✅ **6 categorías**: Feature, Fix, Update, Security, Performance, Removal

### Cómo Usar
```bash
# Agregar changelog pendiente (se enviará en el próximo reinicio)
node add-changelog.js

# El script te pedirá:
# - Emoji del cambio (✨/🔧/🔄/🔒/⚡/🗑️)
# - Título del cambio
# - Descripción detallada
```

### Flujo de Trabajo
1. Realizas cambios en el código
2. Ejecutas `node add-changelog.js` y describes los cambios
3. Reinicias el bot (automático o manual)
4. **El bot envía automáticamente** los changelogs al Discord
5. Los usuarios ven las actualizaciones en el canal 🦋・servidor

### Archivos Clave
- `src/systems/changelog-system.js`: Sistema principal con envío automático
- `src/data/pending-changelogs.json`: Changelogs pendientes (se crea automáticamente)
- `add-changelog.js`: Script helper para agregar changelogs
- `CHANGELOG-SYSTEM-README.md`: Documentación completa del sistema
- Canal de Discord: 1435847630176653312 (🦋・servidor)

**📖 Ver [CHANGELOG-SYSTEM-README.md](CHANGELOG-SYSTEM-README.md) para documentación completa**

## 🔄 ACTUALIZACIÓN COMANDOS (2025-11-08)

**UNIFICACIÓN Y RENOMBRADO DE COMANDOS - TOTAL: 34 COMANDOS**

### ✨ Comandos Unificados (Nuevos)
- `/ticket-añadir` - Unifica ticket-añadir-usuario + ticket-añadir-rol
  - Selección obligatoria: Usuario o Rol
  - Autocompletado inteligente
- `/ticket-eliminar` - Unifica ticket-eliminar-usuario + ticket-eliminar-rol
  - Selección obligatoria: Usuario o Rol
  - Protección al creador del ticket

### 🔄 Comandos Renombrados (Sin Prefijo "ticket-")
- `ticket-renombrar` → `/renombrar`
- `ticket-transcript` → `/transcript`
- `ticket-mantener-activo` → `/mantener-activo`
- `ticket-embed` → `/embed`

**Razón:** Comandos utilitarios no requieren prefijo. Comandos de creación/modificación mantienen "ticket-" para claridad.

### 📊 Lista Final de Comandos de Tickets (8 comandos)
1. `/ticket-crear` - Crea ticket en nombre de usuario
2. `/ticket-añadir` - Añade usuario o rol ✨ NUEVO
3. `/ticket-eliminar` - Elimina usuario o rol ✨ NUEVO
4. `/renombrar` - Renombra ticket según prioridad
5. `/transcript` - Genera transcripción del ticket
6. `/mantener-activo` - Marca ticket como permanente
7. `/embed` - Crea embed personalizado
8. `/panel-tickets` - Crea/actualiza panel de tickets

### 📈 Distribución por Categoría
- **🎫 [TICKETS]:** 8 comandos
- **🔧 [ADMIN]:** 5 comandos
- **📝 [COMANDOS]:** 5 comandos
- **ℹ️ [INFO]:** 6 comandos
- **🛡️ [MODERACIÓN]:** 4 comandos
- **📱 [SOCIAL]:** 3 comandos
- **✅ [TAREAS]:** 3 comandos

**TOTAL: 34 comandos** (reducido de 36)

## 💡 Sistema de Sugerencias (NUEVO)

Sistema completo de gestión de sugerencias con votaciones interactivas y aprobación administrativa.

### Características
- ✅ **Votaciones interactivas**: Botones 👍 y 👎 con contadores en tiempo real
- ✅ **Hilos automáticos**: Cada sugerencia genera un hilo para discusión
- ✅ **Aprobación administrativa**: Solo administradores pueden aprobar/rechazar
- ✅ **Persistencia**: Datos guardados en `src/data/suggestions-data.json`
- ✅ **Canal específico**: Sugerencias solo en canal configurado (1425955815885504646)

### Flujo de Uso
1. Usuario ejecuta `/sugerir` con su sugerencia
2. Bot publica embed con botones de votación
3. Usuarios votan con 👍 o 👎
4. Administrador aprueba con `/sug-aprobada` o rechaza con `/sug-rechazada`
5. Embed se actualiza con decisión final

### Archivos Clave
- `src/systems/suggestions-system.js`: Lógica del sistema
- `src/handlers/events/interactions/suggestion-buttons.js`: Handler de votaciones
- `src/data/suggestions-data.json`: Persistencia de datos

## 📊 Sistema de Estadísticas de Servidor (NUEVO)

Sistema automático de contadores de miembros en canales de voz, similar a ServerStats Bot pero sin comandos.

### Características
- ✅ **Actualización automática** de canales de voz con contadores de miembros
- ✅ **Sin comandos necesarios** - Completamente automático
- ✅ **Contadores personalizables** por rol o totales del servidor
- ✅ **Formato flexible** - Preserva el texto antes de ":" y solo actualiza el número
- ✅ **Rate limiting inteligente** - Respeta límites de Discord (10 minutos entre actualizaciones)
- ✅ **Sistema de cola** - Encola actualizaciones pendientes durante alta actividad

### Canales Configurados
1. **Whitelisted: X** (ID: 1436330242871525516)
   - Muestra cantidad de miembros con rol Whitelisted (1425955517510975640)
   
2. **No Whitelisted: X** (ID: 1436330369514340362)
   - Muestra suma de miembros con roles:
     - Sin Whitelist (1427116249128636456)
     - No Verificado (1435572743193104494)
   
3. **Ciudadanos: X** (ID: 1436330473688272916)
   - Muestra total de miembros del servidor

### Funcionamiento
1. **Inicio del bot** → Actualiza todos los canales inmediatamente
2. **Miembro se une/sale** → Marca canales como "pendientes de actualización"
3. **Cada 30 segundos** → Verifica qué canales necesitan actualización
4. **Si pasaron 10+ minutos** → Actualiza el contador del canal
5. **Preserva nombres personalizados** → Solo cambia el número después de ":"

### Configuración
Editar en `config.json` → `serverStats`:
```json
{
  "serverStats": {
    "enabled": true,
    "channels": [
      {
        "channelId": "ID_DEL_CANAL",
        "countType": "role",
        "roleIds": ["ID_ROL_1", "ID_ROL_2"],
        "defaultName": "Nombre Base"
      },
      {
        "channelId": "ID_DEL_CANAL",
        "countType": "total",
        "defaultName": "Total Miembros"
      }
    ]
  }
}
```

### Tipos de Contadores
- `total`: Cuenta todos los miembros del servidor
- `role`: Cuenta miembros con roles específicos (puede ser múltiples roles)

### Archivos Clave
- `src/systems/server-stats.js`: Sistema de actualización automática
- `config.json`: Configuración de canales y roles

## 👋 Sistema de Bienvenidas (NUEVO 2025-11-08)

Sistema completo de mensajes de bienvenida totalmente personalizables para nuevos miembros, editable solo por Directiva.

### Características
- ✅ **Totalmente personalizable**: Mensaje, imagen de fondo, color del embed
- ✅ **Variables dinámicas**: {usuario}, {nombre}, {tag}, {servidor}, {miembros}, {id}
- ✅ **Base de datos PostgreSQL**: Configuración persistente en tabla `welcome_config`
- ✅ **Solo para Directiva**: Todos los comandos requieren rol de Directiva (1435808275739181110)
- ✅ **Activar/Desactivar**: Control total sin perder la configuración
- ✅ **Sistema de pruebas**: Comando `/bienvenida-test` para verificar antes de activar

### Comandos (Solo Directiva - 3 comandos)
1. **`/bienvenida-setup`** - Configuración inicial del sistema
   - **canal** (opcional): Canal donde se enviarán las bienvenidas
   - **mensaje** (opcional): Texto personalizado con variables dinámicas
   - **imagen** (opcional): URL de imagen de fondo para la bienvenida
   - **color** (opcional): Color hexadecimal del embed (ej: #5865F2)
   - **Requiere al menos un parámetro**
   - Respuesta efímera solo para el ejecutor

2. **`/bienvenida-editar`** - Editar configuración existente
   - **canal** (opcional): Cambiar canal de bienvenidas
   - **mensaje** (opcional): Cambiar mensaje personalizado
   - **imagen** (opcional): Cambiar imagen de fondo
   - **color** (opcional): Cambiar color del embed
   - **Requiere al menos un parámetro**
   - Respuesta efímera solo para el ejecutor

3. **`/bienvenida-test`** - Enviar mensaje de prueba
   - Simula un mensaje de bienvenida en el canal configurado
   - Marcado claramente como "MENSAJE DE PRUEBA"
   - Usa el avatar del ejecutor para la prueba
   - Solo el ejecutor recibe confirmación efímera

### Variables Disponibles
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{usuario}` | Mención del usuario | @Nombre#0000 |
| `{nombre}` | Nombre de usuario | Nombre |
| `{tag}` | Tag completo | Nombre#0000 |
| `{servidor}` | Nombre del servidor | Strangers RP |
| `{miembros}` | Total de miembros | 1234 |
| `{id}` | ID del usuario | 123456789012345678 |

### Ejemplo de Uso
```
1. Configurar el canal y mensaje inicial:
   /bienvenida-setup canal: #bienvenidas mensaje: ¡Bienvenido {usuario} a **{servidor}**! 🎉
   
2. Configurar imagen de fondo y color:
   /bienvenida-setup imagen: https://i.imgur.com/ejemplo.png color: #5865F2

3. Probar el mensaje:
   /bienvenida-test

4. Si necesitas editar algo:
   /bienvenida-editar mensaje: ¡Hola {usuario}! Bienvenido a {servidor}. Somos {miembros} miembros.
   /bienvenida-editar imagen: https://i.imgur.com/otra-imagen.png

5. ¡Listo! El sistema funciona automáticamente cuando alguien se une.
   El avatar del usuario se mostrará sobre la imagen de fondo.
```

### Funcionamiento Automático
1. **Usuario se une al servidor** → Bot detecta evento `guildMemberAdd`
2. **Verifica configuración** → Comprueba si hay canal configurado
3. **Obtiene avatar del usuario** → Extrae el icono/avatar del nuevo miembro automáticamente
4. **Procesa variables** → Reemplaza {usuario}, {nombre}, etc. con valores reales
5. **Envía embed** → Mensaje personalizado con mención + avatar del usuario

### Base de Datos
Tabla: `welcome_config`
- **guild_id**: ID del servidor (clave primaria)
- **channel_id**: ID del canal de bienvenidas
- **message**: Texto personalizado con variables
- **image_url**: URL de imagen de fondo (opcional)
- **embed_color**: Color hexadecimal del embed
- **updated_at**: Última actualización de configuración

**Nota**: El avatar del usuario se obtiene dinámicamente y se muestra sobre la imagen de fondo

### Archivos Clave
- `src/systems/welcome/welcome-system.js`: Sistema principal con PostgreSQL y obtención de avatar
- `src/commands/configuracion/bienvenida-setup.js`: Comando de configuración inicial
- `src/commands/configuracion/bienvenida-editar.js`: Comando de edición
- `src/commands/configuracion/bienvenida-test.js`: Comando de prueba
- `src/handlers/events/guildMemberAdd.js`: Event handler para envío automático
- `config.json`: directivaRoleId configurado (1435808275739181110)

## Cambios Recientes
- 2025-11-08: **🖼️ IMAGEN DE FONDO PERSONALIZABLE** - Configura imagen de fondo + avatar del usuario encima
- 2025-11-08: Comandos actualizados con campo `imagen` para configurar fondo de bienvenidas
- 2025-11-08: Avatar del usuario se muestra automáticamente sobre la imagen de fondo
- 2025-11-08: **👋 SISTEMA DE BIENVENIDAS COMPLETO** - Sistema con avatar automático del usuario
- 2025-11-08: 3 comandos de bienvenidas (setup, editar, test) solo para Directiva
- 2025-11-08: Sistema siempre activo: No necesita activación/desactivación manual
- 2025-11-08: Variables dinámicas: {usuario}, {nombre}, {tag}, {servidor}, {miembros}, {id}
- 2025-11-08: Base de datos PostgreSQL con tabla welcome_config
- 2025-11-08: Total de 39 comandos (36 base + 3 bienvenidas optimizadas)
- 2025-11-07: **📊 SISTEMA DE ESTADÍSTICAS DE SERVIDOR** - Contadores automáticos de miembros en canales de voz (similar a ServerStats Bot)
- 2025-11-07: 3 canales de voz configurados: Whitelisted, No Whitelisted, Ciudadanos
- 2025-11-07: Rate limiting inteligente con sistema de cola (10 min entre actualizaciones)
- 2025-11-07: Actualización automática al añadir/quitar miembros o cambiar roles
- 2025-11-07: **📝 SISTEMA DE CHANGELOG AUTOMÁTICO** - Sistema de publicación automática de cambios en tiempo real
- 2025-11-07: **💡 SISTEMA DE SUGERENCIAS** - Sistema completo con votaciones interactivas y aprobación administrativa
- 2025-11-07: **🎫 12 NUEVOS COMANDOS** - Gestión avanzada de tickets, sugerencias y utilidades
- 2025-11-07: 32 comandos totales cargados correctamente (antes 20)
- 2025-11-07: Comando `/crear-ticket` con autocomplete de categorías
- 2025-11-07: Sistema de prioridades por color en `/renombrar`
- 2025-11-07: Tracking de sugerencias en src/data/suggestions-data.json
- 2025-11-07: **⏱️ SISTEMA DE INACTIVIDAD DE TICKETS** - Sistema completo de gestión automática con timers separados
- 2025-11-07: Comando `/mantener-activo` ahora marca tickets como activos permanentemente (sin expiración)
- 2025-11-07: Tickets marcados con `/mantener-activo` solo se pueden cerrar manualmente
- 2025-11-07: Corregidos 3 bugs críticos de inactividad (penalización sin respuesta, timers instantáneos, reset de mantener-activo)
- 2025-11-07: Tracking persistente de actividad en src/data/ticket-activity.json
- 2025-11-07: Verificación automática cada 5 minutos de inactividad en todos los tickets
- 2025-11-07: **🎯 SISTEMA DE JERARQUÍA DE TICKETS** - Implementado sistema completo de escalación jerárquica con fallback dinámico
- 2025-11-07: Jerarquía Soporte → Moderador → Administrador con bloqueo automático
- 2025-11-07: Escalación por menciones (@Moderador, @Administrador)
- 2025-11-07: Fallback inteligente: categorías sin Soporte usan Moderador como inicial
- 2025-11-07: Persistencia de tracking en src/data/ticket-hierarchy.json
- 2025-11-07: Permisos corregidos usando strings en lugar de PermissionFlagsBits
- 2025-11-06: **🚀 REORGANIZACIÓN COMPLETA DEL CÓDIGO** - El proyecto ha sido completamente reorganizado en una arquitectura modular profesional:
  - **Estructura src/** con directorios separados: config, commands, handlers, systems, utils, services, data
  - **Comandos modulares** organizados por categoría (admin, moderation, tickets, info, social, custom)
  - **Event handlers** separados y optimizados (interactionCreate, messageCreate, etc.)
  - **Sistemas independientes** para tickets, logs, moderación, verificación, AI, etc.
  - **Archivos de datos** centralizados en src/data/
  - **Watchdog actualizado** para usar src/index.js
  - **14 comandos** cargando correctamente
  - Código más limpio, mantenible y escalable
- 2025-11-06: **Embed de comandos añadido** - Agregado sexto embed al comando /enviar-info con la lista completa de todos los comandos disponibles
- 2025-11-06: **Comando /enviar-info** - Nuevo comando que envía 6 embeds con información resumida de todas las funcionalidades del bot
- 2025-11-06: **Comando /status público y anónimo** - El comando /status ahora envía el mensaje al chat público para que todos lo vean, pero de forma anónima (no se muestra quién ejecutó el comando). Solo el ejecutor ve una confirmación privada.
- 2025-11-06: **Menú de roles en panel-embed** - Agregado menú desplegable para seleccionar roles a mencionar directamente sin necesidad de IDs. El panel ahora muestra un selector de roles (hasta 10) que se mencionarán automáticamente al enviar el embed.
- 2025-11-06: **Logs de miembros separados** - Los logs ahora están divididos: entradas (memberJoins) en canal `1435563766300282952`, salidas (memberLeaves) en canal `1435839149692158054`. Los cambios de nickname van al canal de entradas.
- 2025-11-06: **Botón personalizado** - Cambiado texto del botón de soporte de voz a "🔰 Subir a Soporte" (sin emoji adicional)
- 2025-11-06: **FIX CRÍTICO: Error al crear tickets** - Eliminado campo addFields con valores undefined que causaba error en la creación de tickets
- 2025-11-06: **FIX: package.json** - Corregido error de sintaxis JSON con caracteres de control inválidos en la descripción
- 2025-11-06: **Documentación actualizada** - BOT-FUNCIONALIDADES-COMPLETAS.md completamente actualizado con toda la información correcta
- 2025-11-06: **ticket-data.json mejorado** - Ahora muestra el nombre del servidor al lado del ID para fácil identificación
- 2025-11-06: **FIX: messages.json** - Corregidos errores de sintaxis JSON que impedían arrancar el bot
- 2025-11-06: **Sistema antispam mejorado** - Timeout fijo de 2 minutos, elimina mensajes de últimos 2 min, DM al usuario y notificación a staff
- 2025-11-06: **Comando toggle eliminado** - Removido subcomando `/crear-comando toggle` del sistema de comandos personalizados
- 2025-11-06: **Panel de embeds 100% privado** - El comando `/panel-embed` ahora es completamente efímero (solo lo ve quien lo usa)
- 2025-11-06: **FIX CRÍTICO: Transcripciones de tickets** - Agregada metadata al topic del canal para guardar tipo de ticket correctamente
- 2025-11-06: **Rol de staff configurable para comandos personalizados** - ID `1435808275739181110` configurado en customCommands.staffRoleId
- 2025-11-06: **FIX CRÍTICO: Timers de voz ahora persisten entre reinicios** - Sistema guarda estado en voice-support-data.json
- 2025-11-06: **Descripciones personalizables en menú de tickets** - Agregado campo `menuDescription` en config.json
- 2025-11-06: **Renombrado "Ticket de ficha" → "Ticket de apelación"** - Cambio de emoji 🎫 a ⚖️
- 2025-11-06: **FIX: Canales de voz de tickets** - Ahora desconecta usuarios automáticamente tras 15 minutos
- 2025-11-06: **Comando `/add-ticket-menu` agregado** - Añade menú de tickets a mensajes existentes sin dejar rastro
- 2025-11-06: **SISTEMA DE TICKETS ACTUALIZADO** - 13 categorías de tickets configurables
- 2025-11-06: Nuevas categorías: Soporte/dudas, Bugs/Fallos, Donaciones, Playmakers, CK, Reportes Públicos, Ticket de apelación, Ticket de devoluciones, Creador de contenido, Peds, EMS, LSPD/SAPD, Organizaciones criminales
- 2025-11-06: **IDs de categorías personalizables** - Configura cada tipo de ticket en una categoría diferente
- 2025-11-06: **ACTUALIZACIÓN: Triggers efímeros** - Comandos `!` se borran automáticamente
- 2025-11-06: **Comando `/comandos` agregado** - Lista de comandos para todos los usuarios
- 2025-11-06: **Solo prefijo `!` permitido** - Eliminado soporte de `/` para evitar confusiones
- 2025-11-05: Eliminada restricción de prefijo !ck, ahora cualquier comando con ! es válido
- 2025-11-05: **Sistema de comandos personalizados** implementado (custom-commands-system.js)
- 2025-11-05: **CRITICAL FIX: Privacidad de logs entre servidores** - Bloqueados logs cruzados
- 2025-11-05: Verificación doble añadida en sendLog() para prevenir envío a canales de otros servidores
- 2025-11-05: Canal de logs de bots desactivado temporalmente (ID pertenecía a otro servidor)
- 2025-11-05: **Sistema de vinculaciones de redes sociales** implementado (social-links-system.js)
- 2025-11-05: Comandos `/social-link` (add/remove/list/toggle) añadidos
- 2025-11-05: Soporte para 8+ plataformas de redes sociales
- 2025-11-05: **FIX: Comandos /restart y /status ahora funcionan correctamente**
- 2025-11-05: Workflow actualizado a ejecutar `node watchdog.js` para auto-restart
- 2025-11-05: Actualizadas sintaxis deprecated (`ready` → `clientReady`, `ephemeral` → `MessageFlags.Ephemeral`)
- 2025-11-05: Watchdog reinicia automáticamente el bot después de `/restart`
- 2025-11-05: Creación inicial del proyecto
- 2025-11-05: Sistema de mensajes de bienvenida automáticos implementado
- 2025-11-05: Transcripciones simplificadas con embed limpio y lista de participantes
- 2025-11-05: Guardado de transcripciones en canales de Discord
- 2025-11-05: Sistema de permisos por roles implementado
- 2025-11-05: Sistema de Q&A automático con IA implementado
- 2025-11-05: Integración de OpenAI a través de Replit AI Integrations añadida
- 2025-11-05: **Reorganización del config.json en 3 secciones claramente separadas**
- 2025-11-05: Creado CONFIG_GUIDE.md con documentación detallada de configuración
- 2025-11-05: Protección contra configuraciones antiguas sin qaSystem
- 2025-11-05: Validación de variables de entorno de IA al iniciar
- 2025-11-05: **Sistema `/panel-embed` implementado para crear embeds 100% anónimos**
- 2025-11-05: Panel privado reutilizable que elimina rastros del creador
- 2025-11-05: Comandos registrados por servidor para sincronización instantánea
- 2025-11-05: Eliminada metadata JSON de la descripción de canales de tickets
- 2025-11-05: Descripciones de canales de tickets ahora son completamente personalizables
- 2025-11-05: **Sistema completo de logs implementado en archivo separado (logs-system.js)**
- 2025-11-05: Logs modulares con 7 tipos: mensajes, canales, miembros, roles, voz, comandos, bots
- 2025-11-05: Detección automática de moderadores usando Audit Logs
- 2025-11-05: Tracking de comandos con separación admin/roles específicos
- 2025-11-05: Todos los mensajes de logs ahora editables desde messages.json
- 2025-11-05: Logs de roles mejorados con estado completo antes/después + cambios añadidos/quitados
- 2025-11-05: Logs de voz con moderación: mute/unmute, deafen/undeafen con detección de moderador
- 2025-11-05: Logs de voz con detección de quién movió a quién entre canales
- 2025-11-05: Bot excluido de autologging - solo registra actividad de otros bots
- 2025-11-05: **Sistema de invitaciones implementado en archivo separado (invites-system.js)**
- 2025-11-05: Sistema de invitaciones integrado con logs como un tipo más
- 2025-11-05: Hilos automáticos por invitación mostrando todos los usos
- 2025-11-05: Tracking completo de creación y uso de invitaciones
- 2025-11-05: Información detallada de usuarios (avatar, ID, fecha) en hilos de invitaciones
- 2025-11-05: **Comando /clear implementado** para eliminar mensajes (1-100)
- 2025-11-05: Sistema de transcripciones para eliminaciones masivas (>20 mensajes)
- 2025-11-05: Embeds con lista de mensajes para eliminaciones pequeñas (≤20 mensajes)
- 2025-11-05: Registro del uso del comando /clear en logs de comandos
- 2025-11-05: Colores diferenciados: rojo para masivo, naranja para normal
- 2025-11-05: **Sistema de persistencia de tickets** implementado con ticket-data.json
- 2025-11-05: Los números de ticket ahora sobreviven reinicios del bot
- 2025-11-05: **Botón "Subir a soporte"** añadido a cada ticket
- 2025-11-05: Canales de voz temporales con límite de 2 por ticket
- 2025-11-05: Timer de 15 minutos que inicia cuando el creador se une al canal de voz
- 2025-11-05: Eliminación automática de canales de voz (vacíos, timeout, o cierre de ticket)
- 2025-11-05: Logs de canales de voz con vinculación al ticket padre
- 2025-11-05: Sistema de tracking de timeouts para cancelación automática
- 2025-11-05: **Sistema anti-spam y anti-duplicados** implementado en moderation-system.js
- 2025-11-05: Detección automática de spam (muchos mensajes en poco tiempo)
- 2025-11-05: Detección de mensajes duplicados (mismo contenido repetido)
- 2025-11-05: Eliminación automática de TODOS los mensajes ofensivos (no solo los últimos)
- 2025-11-05: DM al usuario infractor con advertencias personalizadas
- 2025-11-05: Notificaciones al canal de staff con detalles completos
- 2025-11-05: Sistema de advertencias acumulativas por usuario
- 2025-11-05: Configuración flexible en config.json (thresholds, ventanas de tiempo)
- 2025-11-05: Mensajes personalizables en messages.json para anti-spam
- 2025-11-05: Bug crítico corregido: thresholds ahora se aplican exactamente en el límite configurado
- 2025-11-05: Bug crítico corregido: todos los mensajes ofensivos se eliminan (no quedan residuos)
- 2025-11-05: **Sistema de verificación** integrado en el bot principal (verification-system.js)
- 2025-11-05: Verificación con roles configurables (No Verificado → Sin Whitelist)
- 2025-11-05: Bot de verificación separado fusionado por seguridad (eliminados tokens hardcodeados)
- 2025-11-05: **Sistema de monitoreo y auto-restart** implementado
- 2025-11-05: Comandos `/restart` y `/status` para administradores
- 2025-11-05: Health check automático cada 5 minutos
- 2025-11-05: Manejo avanzado de errores no manejados
- 2025-11-05: Watchdog externo opcional (`watchdog.js`)
- 2025-11-05: Protección contra loops de reinicio infinitos
- 2025-11-05: Sistema de tracking de errores, uptime y estadísticas

---

# 🔐 Sistema de Verificación

## Descripción
Sistema integrado de verificación automática con roles.

## Características
- ✅ Asigna automáticamente rol "No Verificado" al entrar al servidor
- ✅ Embed con botón de verificación en canal específico
- ✅ Al verificarse: quita "No Verificado" y añade "Sin Whitelist"
- ✅ Completamente configurable mediante `config.json` → `verification`
- ✅ Mensajes personalizables
- ✅ Integrado de forma segura (sin tokens hardcodeados)

## Configuración

Edita `config.json` → sección `verification`:

```json
"verification": {
  "enabled": true,
  "channelId": "ID_CANAL_VERIFICACION",
  "existingMessageId": "ID_MENSAJE_EXISTENTE",
  "roles": {
    "unverified": "ID_ROL_NO_VERIFICADO",
    "sinWhitelist": "ID_ROL_SIN_WHITELIST"
  },
  "messages": {
    "embedTitle": "🔐 Verificación del Servidor",
    "embedDescription": "¡Bienvenido! Haz clic en el botón para verificarte.",
    "buttonLabel": "✅ Verificarme",
    "verifiedMessage": "¡Has sido verificado correctamente!",
    "alreadyVerifiedMessage": "Ya estás verificado.",
    "errorMessage": "Hubo un error. Contacta a un administrador."
  }
}
```

## Flujo de Verificación
1. Usuario entra → Recibe "No Verificado"
2. Usuario solo ve canal de verificación
3. Usuario hace clic en "✅ Verificarme"
4. Bot quita "No Verificado" y añade "Sin Whitelist"
5. Usuario ahora ve más canales del servidor

---

# 🛡️ Sistema de Monitoreo y Auto-Restart

## Comandos de Administración

### `/restart` (Solo Administradores)
Reinicia el bot manualmente. El bot se reiniciará en 3 segundos.

### `/status` (Solo Administradores)
Muestra el estado completo de salud del bot:
- ⏱️ Tiempo activo
- 📡 Latencia (ping)
- 💾 Uso de memoria
- 🎮 Servidores y usuarios
- ⚡ Comandos ejecutados
- ❌ Errores registrados
- 🔄 Número de reinicios
- ⚠️ Último error

**Estados de salud:**
- 🟢 Saludable (< 10 errores)
- 🟡 Advertencia (10-50 errores)
- 🔴 Crítico (> 50 errores)

## Sistema Interno de Auto-Restart

El bot incluye protección automática contra fallos:

### ✅ Características:
1. **Health Check cada 5 minutos** - Monitorea ping y memoria
2. **Manejo de errores automático** - Captura errores no manejados
3. **Reinicio inteligente** - Auto-restart en errores críticos
4. **Tolerancia a errores de red** - Ignora errores temporales
5. **Límite de errores** - Reinicio si > 100 errores

### ⚠️ Alertas automáticas:
- Ping > 1000ms
- Memoria > 400MB
- Errores críticos

## Watchdog Externo (Opcional)

Para máxima resiliencia, usa `watchdog.js`:

### ¿Qué hace?
- Monitorea el proceso del bot desde fuera
- Reinicia automáticamente si el bot se detiene
- Previene loops de reinicio infinitos
- Registra todos los eventos

### Configuración de seguridad:
- Máximo 5 reinicios por hora
- Cooldown de 12 minutos entre reinicios
- Detección de 3 fallos consecutivos

### ¿Cómo usar?

**Opción 1:** Comando directo
```bash
npm run watchdog
```

**Opción 2:** Cambiar workflow de Replit a `node watchdog.js`

📖 **Ver [WATCHDOG.md](WATCHDOG.md) para documentación completa del sistema de monitoreo**

## VM Deployment

Tu bot está configurado con **Reserved VM Deployment**:
- ✅ 99.9% uptime garantizado
- ✅ Auto-restart en caso de crash del contenedor
- ✅ Recursos dedicados: 0.5 vCPU, 2GB RAM
- ✅ Siempre activo - No se duerme

**Con VM Deployment + Auto-Restart Interno + Watchdog Opcional = Máxima protección contra fallos** 🛡️
