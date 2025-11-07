# 📚 Documentación Completa de Funcionalidades - Ego Bot

## 📋 Tabla de Contenidos
- [Sistema de Tickets](#-sistema-de-tickets)
- [Sistema de Jerarquía de Tickets](#-sistema-de-jerarquía-de-tickets)
- [Sistema de Inactividad de Tickets](#-sistema-de-inactividad-de-tickets)
- [Sistema de Voice Support](#-sistema-de-voice-support)
- [Sistema de Estadísticas de Servidor](#-sistema-de-estadísticas-de-servidor)
- [Sistema de Sugerencias](#-sistema-de-sugerencias)
- [Sistema de Changelog Automático](#-sistema-de-changelog-automático)
- [Sistema de Logs](#-sistema-de-logs)
- [Sistema de Moderación con IA](#-sistema-de-moderación-con-ia)
- [Sistema de Verificación](#-sistema-de-verificación)
- [Sistema de Invitaciones](#-sistema-de-invitaciones)
- [Panel de Embeds Anónimos](#-panel-de-embeds-anónimos)
- [Sistema de Comandos Personalizados](#-sistema-de-comandos-personalizados)
- [Sistema de Vinculación de Redes Sociales](#-sistema-de-vinculación-de-redes-sociales)
- [Sistema de Anti-Spam](#-sistema-de-anti-spam)
- [Sistema de Uptime 24/7](#-sistema-de-uptime-247)

---

## 🎫 Sistema de Tickets

### Descripción General
Sistema completo de gestión de tickets con 13 categorías configurables, transcripciones automáticas, soporte de voz, jerarquía de permisos y gestión avanzada.

### Categorías Disponibles
1. **Soporte/dudas** 🔧 - Consultas generales de normativas o del servidor
2. **Bugs/Fallos** ⚠️ - Reporta errores técnicos o fallos del servidor
3. **Donaciones** 💰 - Realizar donación o consultar beneficios VIP
4. **Playmakers** 👥 - Solicitudes o consultas relacionadas con playermakers
5. **CK** ☑️ - Peticiones o revisiones de CK
6. **Reportes Públicos** 💬 - Reporta jugadores o incumplimientos del reglamento
7. **Ticket de apelación** ⚖️ - Apela una sanción o ban del servidor
8. **Ticket de devoluciones** 🔄 - Recupera objetos, dinero o vehículos perdidos por bugs
9. **Creador de contenido** 📹 - Gestión y permisos para creadores de contenido
10. **Peds** 🏠 - Solicita o modifica tu ped personalizado
11. **EMS** 🚑 - Altas, bajas, dudas o gestiones del cuerpo médico
12. **LSPD/SAPD** 👮 - Gestiones policiales: ascensos, bajas, reportes
13. **Organizaciones criminales** 🔫 - Soporte, registro o gestión de bandas criminales

### Comandos Disponibles

#### `/setup-ticket-panel`
Crea el panel de selección de tickets con menú desplegable.
- **Permisos requeridos**: Administrador
- **Ubicación**: Canal configurado en `ticketChannelId`
- **Uso**: Ejecutar en el canal donde se mostrará el panel
- **Funcionalidad**: 
  - Crea embed con menú desplegable
  - Muestra las 13 categorías con sus descripciones personalizadas
  - Permite al usuario seleccionar el tipo de ticket

#### `/add-ticket-menu`
Añade el menú de tickets a un mensaje existente.
- **Permisos requeridos**: Administrador
- **Parámetros**: `message_id` (ID del mensaje donde se agregará el menú)
- **Uso**: Para personalizar mensajes con embeds propios y añadir el selector
- **Funcionalidad**:
  - Añade el selector desplegable a cualquier mensaje
  - Confirmación efímera (solo la ve el admin)
  - Útil para mantener diseños personalizados

#### `/crear-ticket` ⭐ NUEVO
Crea un ticket en nombre de otro usuario.
- **Permisos requeridos**: Gestionar Canales (Manage Channels)
- **Parámetros**: 
  - `usuario` (requerido): Usuario para quien se creará el ticket
  - `categoria` (requerido): Categoría del ticket (con autocomplete)
- **Uso**: Staff puede abrir tickets para usuarios que lo necesiten
- **Funcionalidad**:
  - Autocomplete muestra todas las categorías disponibles con emojis
  - Valida que la categoría sea válida
  - Crea el ticket como si el usuario lo hubiera abierto
  - Notifica al usuario mencionándolo en el ticket
- **Casos de uso**:
  - Usuario no sabe cómo abrir ticket
  - Reportes urgentes que requieren atención inmediata
  - Organizar soporte de forma proactiva

#### `/añadir-usuario`
Añade un usuario adicional a un ticket específico.
- **Permisos requeridos**: Staff (rol configurado)
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Parámetros**: `usuario` (usuario a añadir al ticket)
- **Uso**: Añadir colaboradores o personas relevantes al ticket
- **Funcionalidad**:
  - Otorga permisos de visualización y escritura al usuario mencionado
  - Permite colaboración en tickets
  - Registra la acción en logs de tickets
  - Confirmación con embed visual
- **Casos de uso**:
  - Añadir otro miembro del staff para colaborar
  - Incluir a otro usuario relacionado con el ticket
  - Permitir que testigos participen en reportes

#### `/añadir-rol` ⭐ NUEVO
Añade un rol a un ticket con permisos personalizados.
- **Permisos requeridos**: Staff
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Parámetros**: 
  - `rol` (requerido): Rol a añadir
  - `permisos` (requerido): "lectura" o "escritura"
- **Uso**: Dar acceso a todo un rol al ticket
- **Funcionalidad**:
  - Lectura: Ver canal y leer historial
  - Escritura: Ver, leer y enviar mensajes
  - Confirmación visual con embed
  - Registro en logs
- **Casos de uso**:
  - Dar acceso al departamento completo
  - Permitir que todo el equipo de moderación vea reportes
  - Compartir ticket con roles específicos

#### `/eliminar-rol` ⭐ NUEVO
Elimina un rol de un ticket.
- **Permisos requeridos**: Staff
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Parámetros**: `rol` (requerido): Rol a eliminar
- **Uso**: Remover acceso de un rol al ticket
- **Funcionalidad**:
  - Elimina permisos del rol especificado
  - Confirmación con embed
  - Registro en logs
- **Casos de uso**:
  - Restringir acceso después de escalar ticket
  - Limpiar permisos innecesarios
  - Mantener privacidad cuando se resuelve el problema

#### `/eliminar-usuario` ⭐ NUEVO
Elimina un usuario de un ticket (excepto el creador).
- **Permisos requeridos**: Staff
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Parámetros**: `usuario` (requerido): Usuario a eliminar
- **Uso**: Remover usuarios que ya no necesitan acceso
- **Funcionalidad**:
  - Protege al creador del ticket (no se puede eliminar)
  - Elimina permisos del usuario especificado
  - Confirmación con embed
  - Registro en logs
- **Casos de uso**:
  - Remover usuarios añadidos por error
  - Limpiar acceso cuando ya no es necesario
  - Mantener privacidad del ticket

#### `/renombrar` ⭐ NUEVO
Renombra un ticket con sistema de prioridades por color.
- **Permisos requeridos**: Staff
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Parámetros**: 
  - `nombre` (requerido): Nuevo nombre para el ticket
  - `prioridad` (opcional): URGENTE, MEDIA, BAJA, SIN_PRISA
- **Uso**: Organizar y categorizar tickets visualmente
- **Prioridades disponibles**:
  - 🔴 **URGENTE** - Casos críticos que requieren atención inmediata
  - 🟠 **MEDIA** - Casos importantes que requieren atención pronto
  - 🟡 **BAJA** - Casos que pueden esperar
  - 🟢 **SIN PRISA** - Casos sin urgencia
- **Funcionalidad**:
  - Cambia el nombre del canal del ticket
  - Añade emoji de prioridad al inicio
  - Formato: `[emoji] nombre-del-ticket`
  - Confirmación con embed
- **Casos de uso**:
  - Organizar tickets por urgencia
  - Identificar rápidamente casos críticos
  - Mantener orden en la categoría de tickets

#### `/transcript`
Genera una transcripción manual del ticket actual.
- **Permisos requeridos**: Gestionar Mensajes (Manage Messages)
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Parámetros**: `cantidad` (opcional, 1-50 mensajes, por defecto 50)
- **Uso**: Generar backup o evidencia sin cerrar el ticket
- **Funcionalidad**:
  - Genera archivo `.txt` con transcripción completa del ticket
  - Envía automáticamente al canal de transcripciones de la categoría
  - Incluye embed con información detallada del ticket
  - Respuesta efímera confirmando el envío
- **Información incluida en la transcripción**:
  - Metadata completa del ticket (tipo, número, creador)
  - Todos los mensajes con timestamps
  - Archivos adjuntos con URLs
  - Embeds y stickers
  - Lista de participantes
- **Casos de uso**:
  - Generar backup antes de cambios importantes
  - Documentar conversaciones específicas sin cerrar el ticket
  - Crear registros parciales para reportes
  - Guardar evidencia de interacciones importantes

#### `/mantener-activo` ⭐ NUEVO
Marca un ticket como activo permanentemente.
- **Permisos requeridos**: Staff
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Uso**: Prevenir cierre automático de tickets importantes
- **Funcionalidad**:
  - Marca el ticket como activo **permanentemente**
  - **No hay tiempo de expiración** - El ticket nunca se cierra automáticamente
  - Solo se puede cerrar manualmente con el botón "🔒 Cerrar Ticket"
  - Desactiva timers de inactividad
  - Confirmación con embed
- **Casos de uso**:
  - Casos complejos que requieren seguimiento largo
  - Investigaciones que toman varios días
  - Tickets de coordinación entre departamentos
  - Casos en espera de respuesta externa

### Funcionalidades del Sistema

#### Creación de Tickets
1. Usuario selecciona categoría del menú desplegable
2. Bot crea canal privado con formato: `🎫│ticket-[número]`
3. Permisos configurados automáticamente según jerarquía:
   - Usuario creador: Ver canal, enviar mensajes, leer historial
   - Staff según jerarquía: Acceso controlado por nivel
   - @everyone: Sin acceso
4. Embed de bienvenida con:
   - Información del tipo de ticket
   - Descripción de la categoría
   - Número de ticket
   - Hora de creación
5. Botones de acción disponibles

#### Botones de Acción

**📞 Subir a soporte**
- Crea canal de voz privado para el ticket
- Permisos: Creador del ticket y staff
- Contador de usos: Máximo 2 canales de voz por ticket
- Timer automático de 15 minutos
- Nombre del canal: `🔰 Ticket-[número]`

**🔒 Cerrar Ticket**
- Solo accesible por staff (rol configurado)
- Inicia proceso de cierre:
  1. Genera transcripción completa del canal
  2. Guarda en canal de transcripciones configurado
  3. Elimina el canal del ticket
  4. Registra en logs de tickets
  5. Limpia datos de jerarquía e inactividad

#### Sistema de Transcripciones
- **Formato**: HTML con estilos de Discord
- **Contenido incluido**:
  - Todos los mensajes del canal
  - Autor, timestamp y contenido
  - Archivos adjuntos con enlaces
  - Embeds y respuestas
  - Menciones formateadas
- **Almacenamiento**: Canal específico por categoría
- **Metadata**:
  - Número de ticket
  - Categoría
  - Creador
  - Fecha de cierre
  - Total de mensajes

#### Contadores Persistentes
- Archivo: `src/data/ticket-data.json`
- Contador global por categoría
- Sobrevive a reinicios del bot
- Formato: `#1, #2, #3...`

---

## 🎯 Sistema de Jerarquía de Tickets

### Descripción General
Sistema jerárquico de permisos en tickets con escalación controlada entre niveles de staff (Soporte → Moderador → Administrador).

### Características Principales

#### Jerarquía de 3 Niveles
1. **Soporte** (Nivel 1)
   - Rol ID: 1425955479737077760
   - Primer nivel de atención
   - Responde a la mayoría de tickets

2. **Moderador** (Nivel 2)
   - Rol ID: 1425955473240363082
   - Casos más complejos
   - Requiere escalación desde Soporte

3. **Administrador** (Nivel 3)
   - Rol ID: 1425955470236975186
   - Casos críticos o decisiones finales
   - Requiere escalación desde Moderador

### Funcionamiento

#### Fallback Automático
Si una categoría no tiene Soporte asignado:
- El Moderador se convierte en el primer nivel
- Si no hay Moderador, el Administrador es el primer nivel
- Garantiza que siempre haya alguien disponible

#### Bloqueo Dinámico
Cuando un nivel responde primero en un ticket:
- Ese nivel gana permisos de **escritura**
- Niveles superiores solo tienen permisos de **lectura**
- Previene confusión con múltiples personas respondiendo

#### Escalación por Menciones
Para desbloquear un nivel superior:
- **Soporte menciona @Moderador** → Moderador gana permisos de escritura
- **Moderador menciona @Administrador** → Admin gana permisos de escritura
- Sistema detecta menciones automáticamente
- Actualiza permisos en tiempo real

### Flujo de Escalación

#### Ejemplo 1: Ticket normal
```
1. Usuario crea ticket → Soporte tiene acceso de escritura
2. Soporte responde → Moderador/Admin bloqueados (solo lectura)
3. Soporte resuelve el caso → Cierra ticket
```

#### Ejemplo 2: Escalación a Moderador
```
1. Usuario crea ticket → Soporte tiene acceso de escritura
2. Soporte revisa el caso → Es complejo
3. Soporte escribe: "@Moderador necesito ayuda con esto"
4. Sistema detecta mención → Moderador gana permisos de escritura
5. Moderador puede responder y gestionar el ticket
```

#### Ejemplo 3: Escalación a Administrador
```
1. Moderador está manejando un ticket
2. Moderador escribe: "@Administrador necesito aprobación para esto"
3. Sistema detecta mención → Admin gana permisos de escritura
4. Admin toma decisión final
```

### Persistencia
- Archivo: `src/data/ticket-hierarchy.json`
- Guarda qué nivel está manejando cada ticket
- Guarda qué niveles han sido escalados
- Se limpia automáticamente al cerrar tickets

### Casos de Uso
- **Organización clara**: Cada nivel sabe qué tickets debe atender
- **Prevención de conflictos**: Solo un nivel escribe a la vez
- **Escalación ordenada**: Proceso controlado para casos complejos
- **Distribución de carga**: Soporte maneja casos simples, liberando tiempo a niveles superiores

---

## ⏱️ Sistema de Inactividad de Tickets

### Descripción General
Sistema automático de gestión de inactividad con timers separados para staff y usuarios, y protección contra cierre automático.

### Características Principales

#### Dos Tipos de Inactividad

**1. Inactividad de Soporte (6 horas)**
- Se activa cuando el soporte NO responde después de que se crea el ticket
- Acción automática:
  - Menciona al rol de soporte en el ticket
  - Desbloquea el ticket (permite que otros niveles respondan)
  - Usuario NO es penalizado
- El usuario puede seguir esperando sin problemas

**2. Inactividad de Usuario (6h advertencia, 7h cierre)**
- Se activa SOLO DESPUÉS de que el soporte responde
- Timer de 6 horas:
  - Envía advertencia automática al usuario
  - Le recuerda que debe responder
- Timer de 7 horas:
  - Cierra el ticket automáticamente
  - Genera transcripción completa
  - Notifica al usuario

### Timers Inteligentes

#### Reglas de Activación
- ✅ Los timers solo empiezan **DESPUÉS** de que el soporte responde
- ✅ Si el soporte nunca responde, el usuario NO es penalizado
- ✅ Cada respuesta del soporte resetea el timer del usuario
- ✅ Cada respuesta del usuario resetea su propio timer

### Comando `/mantener-activo`

#### Descripción
Marca un ticket como activo permanentemente, desactivando todos los timers automáticos.

#### Uso
```
/mantener-activo
```
- **Permisos**: Solo staff
- **Ubicación**: Solo en tickets
- **Efecto**: 
  - Ticket marcado como activo **permanentemente**
  - **No hay tiempo de expiración**
  - Solo se puede cerrar manualmente con el botón "🔒 Cerrar Ticket"
  - Desactiva tanto timer de soporte como de usuario

#### Casos de Uso
- Investigaciones largas que requieren días
- Casos complejos con seguimiento prolongado
- Tickets de coordinación entre departamentos
- Casos en espera de respuesta externa

### Verificación Automática
- **Frecuencia**: Cada 5 minutos
- **Proceso**:
  1. Revisa todos los tickets activos
  2. Calcula tiempo desde última actividad
  3. Ejecuta acciones según el tipo de inactividad
  4. Actualiza archivo de persistencia

### Persistencia
- Archivo: `src/data/ticket-activity.json`
- Guarda última actividad del soporte
- Guarda última actividad del usuario
- Guarda estado de "mantener-activo"
- Sobrevive a reinicios del bot

### Bugs Corregidos
- ✅ Usuario ya no es penalizado si soporte nunca respondió
- ✅ Timers se basan en última respuesta del soporte (no creación del ticket)
- ✅ Timers se resetean correctamente con `/mantener-activo`

---

## 🎤 Sistema de Voice Support

### Descripción General
Sistema de canales de voz temporales para tickets con persistencia de timers, auto-desconexión y límite de usos.

### Características Principales

#### Creación de Canal de Voz
- **Activación**: Botón "📞 Subir a soporte" en tickets
- **Permisos**: Solo el creador del ticket puede usarlo
- **Límite**: 2 canales de voz por ticket
- **Ubicación**: Misma categoría que el ticket
- **Formato**: `🔰 Ticket-[número]`

#### Sistema de Timer Persistente
- **Duración**: 15 minutos desde que el primer usuario se conecta
- **Persistencia**: Sobrevive a reinicios del bot
- **Archivo**: `src/data/voice-support-data.json`
- **Funcionalidad**:
  1. Guarda tiempo de inicio cuando usuario se conecta
  2. Al reiniciar bot, calcula tiempo restante
  3. Programa timer con tiempo restante
  4. Si ya pasaron 15 min, elimina inmediatamente

#### Auto-Desconexión
Cuando el timer expira (15 minutos):
1. Desconecta a TODOS los usuarios del canal
2. Elimina el canal de voz
3. Actualiza el archivo de persistencia
4. Registra en logs de canales

#### Contador de Usos
- Muestra usos actuales: `📊 Usos: 1/2`
- Impide crear más de 2 canales por ticket
- Mensaje efímero al alcanzar límite

#### Manejo de Canales Vacíos
- Si el canal queda vacío (sin usuarios)
- Se elimina automáticamente
- No cuenta contra el límite de 2 usos
- Actualiza archivo de persistencia

---

## 📊 Sistema de Estadísticas de Servidor

### Descripción General
Sistema automático de contadores de miembros en canales de voz, similar a ServerStats Bot pero completamente integrado y **sin comandos necesarios**.

### Características Principales

#### Actualización Automática
- ✅ **Sin comandos** - Funciona completamente automático
- ✅ **Contadores en tiempo real** con rate limiting inteligente
- ✅ **Formato flexible** - Preserva texto personalizado antes de ":"
- ✅ **Sistema de cola** para alta actividad
- ✅ **Respeta límites de Discord** (10 min entre actualizaciones)

### Canales Configurados

#### 1. Whitelisted
- **Canal ID**: 1436330242871525516
- **Formato**: `Whitelisted: X`
- **Cuenta**: Miembros con rol Whitelisted (1425955517510975640)
- **Actualización**: Automática al añadir/quitar el rol

#### 2. No Whitelisted  
- **Canal ID**: 1436330369514340362
- **Formato**: `No Whitelisted: X`
- **Cuenta**: SUMA de miembros con roles:
  - Sin Whitelist (1427116249128636456)
  - No Verificado (1435572743193104494)
- **Actualización**: Automática al cambiar cualquiera de los dos roles

#### 3. Ciudadanos
- **Canal ID**: 1436330473688272916
- **Formato**: `Ciudadanos: X`
- **Cuenta**: Total de miembros del servidor
- **Actualización**: Automática al entrar/salir miembros

### Funcionamiento

#### Al Iniciar el Bot
1. Carga todos los miembros del servidor
2. Actualiza los 3 canales inmediatamente
3. Guarda timestamp de actualización

#### Durante Operación Normal
1. Miembro se une/sale del servidor → Marca canales como "pendientes"
2. Miembro recibe/pierde rol → Marca canales como "pendientes"
3. **Cada 30 segundos** → Verifica qué canales marcados necesitan actualización
4. **Si pasaron 10+ minutos** → Actualiza el canal
5. **Si no** → Mantiene en cola hasta cumplir intervalo

#### Preservación de Nombres
- Sistema busca el carácter ":"
- **Antes de ":"** → Se preserva (puedes cambiarlo libremente)
- **Después de ":"** → Se reemplaza con el número actualizado

**Ejemplos:**
```
"Whitelisted: 45" → "Whitelisted: 46"
"✨ Ciudadanos: 120" → "✨ Ciudadanos: 121"
"🌟 VIP Members: 12" → "🌟 VIP Members: 13"
```

### Rate Limiting Inteligente

#### Límites de Discord
- Discord permite cambiar nombre de canal **cada 10 minutos**
- Exceder este límite causa errores 429 (Too Many Requests)

#### Solución Implementada
1. **Sistema de cola**: Cambios se encolan en lugar de ejecutarse inmediatamente
2. **Verificación de intervalo**: Solo actualiza si pasaron 10+ minutos
3. **Procesamiento automático**: Cola se procesa cada 30 segundos
4. **Sin llamadas costosas**: No fetches de miembros en cada evento

### Configuración

#### En config.json
```json
"serverStats": {
  "enabled": true,
  "channels": [
    {
      "channelId": "1436330242871525516",
      "countType": "role",
      "roleIds": ["1425955517510975640"],
      "defaultName": "Whitelisted"
    },
    {
      "channelId": "1436330369514340362",
      "countType": "role",
      "roleIds": ["1427116249128636456", "1435572743193104494"],
      "defaultName": "No Whitelisted"
    },
    {
      "channelId": "1436330473688272916",
      "countType": "total",
      "defaultName": "Ciudadanos"
    }
  ]
}
```

#### Tipos de Contadores
- **`total`**: Cuenta todos los miembros del servidor
- **`role`**: Cuenta miembros con roles específicos (puede ser múltiples)

### Casos de Uso
- ✅ Mostrar estadísticas del servidor en tiempo real
- ✅ Contadores de miembros VIP, staff, verificados, etc.
- ✅ Total de miembros del servidor
- ✅ Suma de múltiples roles (ej: No verificados + Sin whitelist)
- ✅ Cualquier contador basado en roles

### Archivos del Sistema
- `src/systems/server-stats.js` - Sistema principal
- `config.json` - Configuración de canales y roles

---

## 💡 Sistema de Sugerencias

### Descripción General
Sistema completo de gestión de sugerencias con votaciones interactivas, hilos automáticos y aprobación administrativa.

### Comandos Disponibles

#### `/sugerir` ⭐ NUEVO
Crea una sugerencia para el servidor.
- **Permisos requeridos**: Todos los usuarios
- **Parámetros**: `sugerencia` (texto de la sugerencia)
- **Ubicación**: Solo funciona en canal específico (1425955815885504646)
- **Uso**: Enviar ideas o mejoras para el servidor
- **Funcionalidad**:
  - Crea embed con la sugerencia
  - Añade botones de votación (👍 / 👎)
  - Crea hilo automático para discusión
  - Guarda en base de datos para tracking
  - Muestra contador de votos en tiempo real

#### `/sug-aprobada` ⭐ NUEVO
Marca una sugerencia como aprobada.
- **Permisos requeridos**: Administrador (1425955470236975186)
- **Parámetros**: `message_id` (ID del mensaje de la sugerencia)
- **Uso**: Aprobar sugerencias que se implementarán
- **Funcionalidad**:
  - Cambia el embed a color verde
  - Añade marca de "✅ APROBADA"
  - Elimina botones de votación
  - Cierra el hilo automáticamente
  - Registra en base de datos

#### `/sug-rechazada` ⭐ NUEVO
Marca una sugerencia como rechazada.
- **Permisos requeridos**: Administrador (1425955470236975186)
- **Parámetros**: 
  - `message_id` (ID del mensaje de la sugerencia)
  - `razon` (motivo del rechazo)
- **Uso**: Rechazar sugerencias que no se implementarán
- **Funcionalidad**:
  - Cambia el embed a color rojo
  - Añade marca de "❌ RECHAZADA"
  - Muestra la razón del rechazo
  - Elimina botones de votación
  - Cierra el hilo automáticamente
  - Registra en base de datos

### Sistema de Votaciones

#### Botones Interactivos
- **👍 Upvote**: Vota a favor de la sugerencia
- **👎 Downvote**: Vota en contra de la sugerencia
- **Actualización en tiempo real**: Los contadores se actualizan al instante
- **Un voto por persona**: No se puede votar múltiples veces

#### Cambio de Voto
- Usuario puede cambiar su voto en cualquier momento
- De 👍 a 👎 o viceversa
- Contadores se ajustan automáticamente

### Hilos Automáticos

#### Creación
- Cada sugerencia genera un hilo automático
- Nombre del hilo: "💬 Discusión"
- Los usuarios pueden comentar y debatir la sugerencia
- Organiza las conversaciones

#### Cierre
- Al aprobar o rechazar la sugerencia
- El hilo se cierra automáticamente
- Los mensajes permanecen visibles pero no se pueden añadir más

### Persistencia
- Archivo: `src/data/suggestions-data.json`
- Guarda todas las sugerencias
- Tracking de votos por usuario
- Estado (pendiente, aprobada, rechazada)
- Información del autor y timestamp

### Flujo de Uso

#### 1. Usuario Crea Sugerencia
```
Usuario: /sugerir sugerencia: Añadir un canal de memes
Bot: Crea embed con votaciones y hilo
```

#### 2. Comunidad Vota
```
Usuarios votan con 👍 o 👎
Contadores se actualizan en tiempo real
Discusión en el hilo
```

#### 3. Admin Revisa
```
Admin revisa votos y comentarios
Decide aprobar o rechazar
```

#### 4a. Sugerencia Aprobada
```
Admin: /sug-aprobada message_id: [ID]
Bot: Marca como aprobada (verde ✅)
Bot: Cierra el hilo
```

#### 4b. Sugerencia Rechazada
```
Admin: /sug-rechazada message_id: [ID] razon: No encaja con nuestros planes
Bot: Marca como rechazada (rojo ❌)
Bot: Muestra la razón
Bot: Cierra el hilo
```

### Casos de Uso
- ✅ Recoger feedback de la comunidad
- ✅ Votaciones transparentes
- ✅ Organizar discusiones
- ✅ Tracking de sugerencias implementadas
- ✅ Comunicación clara de decisiones

---

## 📝 Sistema de Changelog Automático

### Descripción General
Sistema automático de registro de cambios que publica actualizaciones en tiempo real a un canal específico de Discord (ID: 1435847630176653312).

### Características Principales

#### Publicación Automática
- ✅ **Sin comandos manuales** - Los cambios se registran automáticamente
- ✅ **Embeds con colores** según el tipo de cambio
- ✅ **Emojis distintivos** para cada categoría
- ✅ **Integración transparente** con todos los sistemas del bot

### Categorías de Cambios

#### 1. Feature (✨ Verde)
- **Color**: #57F287
- **Uso**: Nuevas funcionalidades añadidas
- **Ejemplos**:
  - Nuevo comando implementado
  - Sistema nuevo agregado
  - Característica solicitada añadida

#### 2. Fix (🐛 Naranja)
- **Color**: #FEE75C
- **Uso**: Corrección de errores
- **Ejemplos**:
  - Bug corregido
  - Error de sintaxis arreglado
  - Problema de rendimiento resuelto

#### 3. Update (📝 Azul)
- **Color**: #5865F2
- **Uso**: Actualizaciones y mejoras
- **Ejemplos**:
  - Mejora de funcionalidad existente
  - Optimización de código
  - Actualización de dependencias

#### 4. Security (🔒 Rojo)
- **Color**: #ED4245
- **Uso**: Parches de seguridad
- **Ejemplos**:
  - Vulnerabilidad corregida
  - Mejora de seguridad
  - Actualización crítica

#### 5. Performance (⚡ Amarillo)
- **Color**: #FEE75C
- **Uso**: Mejoras de rendimiento
- **Ejemplos**:
  - Optimización de velocidad
  - Reducción de uso de memoria
  - Mejora de eficiencia

#### 6. Removal (🗑️ Gris)
- **Color**: #95A5A6
- **Uso**: Funciones eliminadas
- **Ejemplos**:
  - Característica obsoleta removida
  - Código innecesario eliminado
  - Dependencia removida

### Formato de Embeds

#### Estructura
```
[COLOR SEGÚN CATEGORÍA]

[EMOJI] CATEGORÍA
━━━━━━━━━━━━━━━━━━━━

📌 Cambio realizado

📅 [Timestamp]
```

### Canal de Publicación
- **Canal**: 🦋・servidor
- **ID**: 1435847630176653312
- **Visibilidad**: Público para todo el servidor
- **Frecuencia**: En tiempo real cuando se hacen cambios

### Uso en el Código

El sistema se integra en todo el bot para registrar cambios automáticamente:
```javascript
await changelogSystem.logChange(
  'feature',
  '12 nuevos comandos añadidos al sistema de tickets'
);
```

### Casos de Uso
- ✅ Mantener a la comunidad informada
- ✅ Registro histórico de cambios
- ✅ Transparencia en el desarrollo
- ✅ Documentación automática de versiones

---

## 📊 Sistema de Logs

### Descripción General
Sistema completo de registro de actividades del servidor con 9 categorías diferentes.

### Canales de Logs Configurables

#### 1. Log de Mensajes (`messages`)
**Eventos registrados:**
- **Mensajes eliminados**:
  - Autor, contenido, canal
  - Archivos adjuntos
  - Embeds
  - Timestamp
- **Mensajes editados**:
  - Contenido anterior y nuevo
  - Autor, canal
  - Diferencias resaltadas

#### 2. Log de Miembros (`memberJoins` y `memberLeaves`)
**Eventos registrados:**
- **Usuario se une** (Canal: 1435563766300282952):
  - Nombre y tag
  - ID de usuario
  - Fecha de creación de cuenta
  - Timestamp de entrada
  - Cambios de nickname
- **Usuario sale** (Canal: 1435839149692158054):
  - Nombre y tag
  - Roles que tenía
  - Tiempo en el servidor
  - Timestamp de salida

#### 3. Log de Roles (`roles`)
**Eventos registrados:**
- **Roles añadidos a usuario**:
  - Usuario afectado
  - Rol añadido
  - Quién lo añadió (si disponible)
- **Roles removidos de usuario**:
  - Usuario afectado
  - Rol removido
  - Quién lo removió (si disponible)
- **Rol creado/eliminado/actualizado**

#### 4. Log de Canales (`channels`)
**Eventos registrados:**
- **Canal creado**:
  - Nombre, tipo, categoría
  - Permisos configurados
  - Creador (si disponible)
- **Canal eliminado**:
  - Nombre, tipo
  - Última categoría
- **Canal actualizado**:
  - Cambios en nombre
  - Cambios en permisos

#### 5. Log de Voz (`voice`)
**Eventos registrados:**
- **Usuario se conecta a voz**:
  - Usuario, canal
  - Timestamp
- **Usuario se desconecta de voz**:
  - Usuario, canal anterior
  - Duración de la sesión
- **Usuario cambia de canal**:
  - Canal anterior y nuevo
  - Timestamp

#### 6. Log de Comandos (`commands`)
**Eventos registrados:**
- Comando ejecutado
- Usuario que lo ejecutó
- Canal donde se ejecutó
- Parámetros utilizados
- Resultado

#### 7. Log de Bots (`bots`)
**Eventos registrados:**
- Bot añadido al servidor
- Bot removido
- Permisos del bot
- Quién lo añadió

#### 8. Log de Invitaciones (`invites`)
**Eventos registrados:**
- **Invitación creada**:
  - Código, creador
  - Usos máximos, expiración
  - Canal de origen
- **Invitación usada**:
  - Quién se unió
  - Quién invitó
  - Código usado
  - Hilo automático con tracking

### Sistema de Caché de Invitaciones
- Archivo: `src/data/invitations-cache.json`
- Carga invitaciones al iniciar
- Compara para detectar cuál se usó
- Actualiza automáticamente

---

## 🛡️ Sistema de Moderación con IA

### Descripción General
Sistema de moderación automática usando IA para detectar contenido inapropiado (deshabilitado en producción).

**NOTA**: Este sistema está actualmente **deshabilitado** en el bot de producción. Se mantiene la documentación para referencia futura.

---

## ✅ Sistema de Verificación

### Descripción General
Sistema automático de verificación de miembros nuevos.

### Configuración
- **Canal**: 1435556297234841752
- **Mensaje**: 1435580254268952639
- **Rol No Verificado**: 1435572743193104494
- **Rol Sin Whitelist**: 1427116249128636456

### Funcionamiento

#### Al Unirse al Servidor
1. Usuario nuevo entra al servidor
2. Bot asigna automáticamente rol "No Verificado"
3. Usuario solo puede ver canal de verificación

#### Proceso de Verificación
1. Usuario hace clic en botón "✅ Verificarme"
2. Bot elimina rol "No Verificado"
3. Bot asigna rol "Sin Whitelist"
4. Usuario puede ver más canales
5. Confirmación efímera al usuario

### Roles del Sistema
- **No Verificado**: Asignado al entrar
- **Sin Whitelist**: Asignado al verificarse
- **Whitelisted**: Asignado manualmente por staff

---

## 🔗 Panel de Embeds Anónimos

### Descripción General
Sistema para crear embeds personalizados de forma 100% anónima usando un panel privado.

### Comando Principal

#### `/panel-embed`
Abre el panel de creación de embeds.
- **Permisos requeridos**: Gestionar Mensajes
- **Visibilidad**: 100% efímero (solo lo ve quien lo usa)
- **Funcionalidad**: Panel interactivo con todos los campos editables

### Características del Panel

#### Campos Configurables
- **Título**: Encabezado principal del embed
- **Descripción**: Contenido principal
- **Color**: Color del borde (hexadecimal)
- **Footer**: Texto en la parte inferior
- **Imagen**: URL de imagen grande
- **Thumbnail**: URL de miniatura pequeña
- **Campos personalizados**: Hasta 25 campos adicionales

#### Selector de Roles (Menú Desplegable)
- Permite seleccionar hasta 10 roles para mencionar
- Muestra nombres de roles en el menú
- Las menciones aparecen al enviar el embed
- No requiere IDs manuales

### Panel Privado Reutilizable
1. Usuario ejecuta `/panel-embed`
2. Bot envía panel privado (solo lo ve el usuario)
3. Usuario edita campos con botones
4. Usuario selecciona roles a mencionar (opcional)
5. Usuario hace clic en "Enviar Embed"
6. Embed aparece en el canal público (anónimo)
7. Panel privado permanece para reutilizar

### Validaciones
- Color debe ser hexadecimal válido
- URLs de imágenes deben ser válidas
- Límites de caracteres respetados
- Permisos verificados

### Casos de Uso
- Anuncios oficiales sin firma
- Información importante
- Comunicados del staff
- Mensajes de reglas
- Eventos y actualizaciones

---

## ⚙️ Sistema de Comandos Personalizados

### Descripción General
Sistema para crear comandos personalizados con triggers (prefijo `!`) que se borran automáticamente.

### Configuración
```json
"customCommands": {
  "staffRoleId": "1435808275739181110"
}
```
- Si `staffRoleId` está vacío: Requiere permiso de **Gestionar Mensajes**
- Si `staffRoleId` está configurado: Solo usuarios con ese rol pueden gestionar comandos

### Comandos de Gestión

#### `/crear-comando nuevo`
Crea un nuevo comando personalizado.
- **Permisos**: Rol configurado en `staffRoleId` (o Gestionar Mensajes)
- **Uso**: Crear respuestas rápidas para preguntas frecuentes
- **Funcionalidad**: Abre panel interactivo para crear el comando

#### `/crear-comando editar`
Modifica un comando existente.
- **Permisos**: Rol configurado
- **Parámetros**: `comando` (nombre del comando a editar)
- **Uso**: Actualizar información de comandos existentes

#### `/crear-comando eliminar`
Elimina un comando personalizado.
- **Permisos**: Rol configurado
- **Parámetros**: `comando` (nombre del comando a eliminar)
- **Uso**: Remover comandos obsoletos

#### `/crear-comando listar`
Muestra todos los comandos personalizados.
- **Permisos**: Rol configurado
- **Uso**: Ver lista completa con estadísticas de uso
- **Información mostrada**:
  - Lista completa de comandos
  - Estado (activo/inactivo)
  - Estadísticas de uso

#### `/comandos`
Lista todos los comandos disponibles para cualquier usuario.
- **Permisos**: Todos los usuarios
- **Uso**: Ver qué comandos están disponibles
- **Funcionalidad**: Muestra lista de comandos activos

### Funcionamiento

#### Uso de Comandos
Usuario escribe: `!normativa`
1. Bot detecta el trigger
2. **Elimina el mensaje del usuario automáticamente** (trigger efímero)
3. Envía el embed con la respuesta configurada
4. Chat queda limpio

#### Estructura de los Comandos
Cada comando personalizado incluye:
- **Título del embed**: Encabezado principal
- **Descripción**: Contenido principal del mensaje
- **Color**: Color personalizado en hexadecimal
- **Campos personalizados**: Campos adicionales con información
- **Footer**: Texto en la parte inferior
- **Imagen**: URL de imagen grande (opcional)
- **Thumbnail**: URL de miniatura (opcional)
- **Estadísticas de uso**: Contador automático de usos

### Persistencia
- Archivo: `src/data/custom-commands-data.json`
- Se guarda automáticamente al crear/editar/eliminar
- Carga al iniciar el bot
- Sobrevive a reinicios

### Casos de Uso
- `!normativa` - Enlace a reglas
- `!discord` - Link del Discord
- `!whitelist` - Info sobre whitelist
- `!donaciones` - Info de donaciones
- `!staff` - Lista del staff
- `!ayuda` - Comandos disponibles

---

## 🔗 Sistema de Vinculación de Redes Sociales

### Descripción General
Sistema para vincular cuentas de redes sociales de usuarios del servidor con gestión completa por comandos.

### Comandos Principales

#### `/social-link add`
Vincula una red social a un usuario.
- **Permisos**: Staff
- **Parámetros**:
  - `usuario` (requerido): Usuario a vincular
  - `plataforma` (requerido): Twitch, Kick, YouTube, Instagram, Twitter, Threads, TikTok, Facebook
  - `username` (requerido): Usuario de la plataforma
  - `url` (opcional): URL directa al perfil
- **Uso**: Registrar cuentas de redes sociales de usuarios
- **Funcionalidad**:
  - Guarda vinculación en base de datos
  - Genera ID único
  - Estado activo por defecto
  - Confirmación con embed

#### `/social-link remove`
Elimina una vinculación.
- **Permisos**: Staff
- **Parámetros**: `link_id` (ID de la vinculación)
- **Uso**: Remover vinculaciones obsoletas
- **Funcionalidad**: Elimina de base de datos

#### `/social-link list`
Lista vinculaciones con filtros opcionales.
- **Permisos**: Staff
- **Parámetros**: `usuario` (opcional): Filtrar por usuario específico
- **Uso**: Ver todas las vinculaciones registradas
- **Funcionalidad**:
  - Muestra todas las vinculaciones
  - Filtra por usuario si se especifica
  - Muestra ID, usuario, plataforma, estado

#### `/social-link toggle`
Activa o desactiva una vinculación.
- **Permisos**: Staff
- **Parámetros**: `link_id` (ID de la vinculación)
- **Uso**: Activar/desactivar sin eliminar
- **Funcionalidad**: Cambia estado activo/inactivo

### Plataformas Soportadas
- 🎮 **Twitch**
- 🎮 **Kick**
- 📹 **YouTube**
- 📷 **Instagram**
- 🐦 **Twitter/X**
- 🧵 **Threads**
- 🎵 **TikTok**
- 📘 **Facebook**

### Formato de Datos
```json
{
  "id": "uuid-generado",
  "userId": "123456789",
  "platform": "twitch",
  "username": "usuario_twitch",
  "url": "https://twitch.tv/usuario",
  "isActive": true,
  "createdAt": "2025-11-07T..."
}
```

### Persistencia
- Archivo: `src/data/social-links-data.json`
- Guarda todas las vinculaciones
- Sobrevive a reinicios
- Búsqueda eficiente por usuario

### Casos de Uso
- ✅ Registrar streamers del servidor
- ✅ Vincular creadores de contenido
- ✅ Organizar redes sociales de staff
- ✅ Preparado para notificaciones automáticas

---

## 🚫 Sistema de Anti-Spam

### Descripción General
Sistema automático de detección y prevención de spam con **timeout fijo de 2 minutos**, eliminación de mensajes recientes, notificación por DM y alerta al staff.

### Configuración
```json
"antiSpam": {
  "enabled": true,
  "maxMessages": 7,
  "timeWindow": 120,
  "applyTimeout": true
}
```

### Detección de Spam

#### Límites Configurables
- **maxMessages**: Máximo 7 mensajes en ventana de tiempo
- **timeWindow**: Ventana de 120 segundos (2 minutos)
- **Mensajes duplicados**: Detecta contenido repetido

#### Tipos de Spam Detectados
1. **Flood**: Muchos mensajes en poco tiempo
2. **Mensajes duplicados**: Mismo contenido repetido
3. **Spam de caracteres**: Mensajes muy cortos repetitivos

### Acciones Automáticas

Cuando se detecta spam:

#### 1. Eliminación de Mensajes
- Elimina **TODOS** los mensajes del usuario de los últimos 2 minutos
- Limpia el canal automáticamente

#### 2. Timeout de 2 Minutos
- Aplica timeout de exactamente 120 segundos
- El usuario no puede escribir durante ese tiempo

#### 3. Notificación por DM
Embed privado al usuario con:
- ⚠️ Aviso de timeout aplicado
- 📊 Contador de advertencias
- ⏰ Duración (2 minutos)
- 💡 Mensaje educativo

#### 4. Alerta al Staff
Embed detallado al canal de logs con:
- 👤 Usuario afectado
- ⚠️ Contador de advertencias
- 📝 Cantidad de mensajes
- 📍 Canal donde ocurrió
- ✅ Resumen de acciones tomadas

### Sistema de Tracking
- Rastrea mensajes por usuario en tiempo real
- Ventana de tiempo deslizante
- Contador de advertencias
- Se resetea después del timeout

---

## ⏰ Sistema de Uptime 24/7

### Descripción General
Sistema de monitoreo y auto-reinicio (watchdog) para mantener el bot en línea 24/7.

### Archivo Principal
`watchdog.js` - Proceso supervisor del bot

### Funcionamiento

#### Health Check
- **Frecuencia**: Cada 60 segundos
- **Verificación**: 
  - Bot está en línea
  - Bot responde a eventos
  - Conexión WebSocket activa
  - Memoria dentro de límites

#### Auto-Reinicio

**Cuando se reinicia:**
1. Bot no responde a health check
2. Bot se desconecta inesperadamente
3. Error fatal no capturado
4. Crash del proceso

**Proceso de reinicio:**
1. Detecta fallo
2. Mata proceso anterior
3. Espera cooldown (12 minutos)
4. Inicia nuevo proceso
5. Verifica que inició correctamente
6. Continúa monitoring

#### Límites de Seguridad

**Máximo reinicios por hora**: 5
- Previene loop infinito de crashes
- Si excede, espera más tiempo

**Cooldown entre reinicios**: 720 segundos (12 minutos)
- Evita reinicios muy seguidos
- Da tiempo a estabilizarse

### Logs del Watchdog
```
👁️ Watchdog iniciado
   - Health check cada 60s
   - Máximo 5 reinicios por hora
   - Cooldown de 720s entre reinicios
✅ Health check: Bot activo
⚠️ Bot no responde, reiniciando...
🔄 Reiniciando bot...
✅ Bot reiniciado exitosamente
```

### Persistencia de Datos

Antes de cada reinicio:
1. Guarda todos los datos en archivos JSON
2. Cierra conexiones limpiamente
3. Libera recursos
4. Inicia proceso limpio

Al reiniciar:
1. Carga datos de archivos
2. Reconecta a Discord
3. Restaura estado (timers, contadores, etc.)
4. Continúa operación normal

---

## 🆘 Comandos de Información y Utilidades

### `/rol-id` ⭐ NUEVO
Obtiene información detallada de un rol.
- **Permisos requeridos**: Todos los usuarios
- **Parámetros**: `rol` (rol a consultar)
- **Uso**: Obtener ID y detalles de cualquier rol
- **Información mostrada**:
  - ID del rol
  - Color en hexadecimal
  - Cantidad de miembros que tienen el rol
  - Fecha de creación
  - Posición en la jerarquía
  - Permisos principales
- **Casos de uso**:
  - Configurar el config.json
  - Verificar permisos de roles
  - Troubleshooting de problemas de roles

### `/solicitar-bot` ⭐ NUEVO
Información sobre servicios de bot personalizado.
- **Permisos requeridos**: Todos los usuarios
- **Uso**: Solicitar información sobre bots personalizados
- **Funcionalidad**:
  - Envía información por DM al usuario
  - Embed con detalles de servicios
  - Información de contacto
  - Precios y paquetes
- **Casos de uso**:
  - Usuarios interesados en bots personalizados
  - Información de servicios
  - Lead generation

### `/staff-status` ⭐ NUEVO
Estadísticas de actividad del staff.
- **Permisos requeridos**: Staff
- **Uso**: Ver métricas de actividad del equipo
- **Información mostrada**:
  - Tickets creados por categoría
  - Tickets cerrados
  - Comandos usados
  - Tiempo de respuesta promedio
  - Actividad de cada miembro del staff
- **Casos de uso**:
  - Evaluar rendimiento del equipo
  - Identificar áreas de mejora
  - Estadísticas de trabajo

### `/bot-info` ⭐ NUEVO
Documentación completa del bot con embeds informativos.
- **Permisos requeridos**: Todos los usuarios
- **Uso**: Consultar documentación del bot
- **Información mostrada**:
  - Comandos disponibles por categoría
  - Funcionalidades principales
  - Cómo usar cada sistema
  - Enlaces a documentación adicional
  - Información de soporte
- **Casos de uso**:
  - Usuarios nuevos aprendiendo a usar el bot
  - Referencia rápida de comandos
  - Documentación accesible

---

## 📌 Notas Importantes

### Archivos de Persistencia
Todos estos archivos se guardan automáticamente y sobreviven a reinicios:
- `src/data/ticket-data.json` - Contadores de tickets
- `src/data/ticket-hierarchy.json` - Datos de jerarquía
- `src/data/ticket-activity.json` - Tracking de inactividad
- `src/data/custom-commands-data.json` - Comandos personalizados
- `src/data/social-links-data.json` - Vínculos de redes sociales
- `src/data/invitations-cache.json` - Caché de invitaciones
- `src/data/voice-support-data.json` - Estado de canales de voz y timers
- `src/data/suggestions-data.json` - Sugerencias y votaciones

### Seguridad
- Todas las secrets en variables de entorno
- No se exponen tokens en código
- Logs no incluyen información sensible
- Permisos verificados en cada comando

### Rendimiento
- Caché en memoria para datos frecuentes
- Archivos JSON para persistencia
- Escritura asíncrona de archivos
- Manejo eficiente de eventos

### Privacidad
- Bot NO comparte información entre servidores
- Cada servidor tiene datos independientes
- Verificación de `guildId` en todas las operaciones
- Respuestas efímeras para comandos sensibles

### Configuración
Todo configurable en `config.json`:
- IDs de canales
- IDs de roles
- Jerarquía de staff
- Umbrales de inactividad
- Colores y textos

---

## 📚 Resumen de Comandos por Categoría

### Tickets (13 comandos)
- `/setup-ticket-panel` - Crear panel de tickets
- `/add-ticket-menu` - Añadir menú a mensaje
- `/crear-ticket` ⭐ - Crear ticket para usuario
- `/añadir-usuario` - Añadir usuario a ticket
- `/añadir-rol` ⭐ - Añadir rol a ticket
- `/eliminar-rol` ⭐ - Eliminar rol de ticket
- `/eliminar-usuario` ⭐ - Eliminar usuario de ticket
- `/renombrar` ⭐ - Renombrar con prioridades
- `/mantener-activo` ⭐ - Desactivar cierre automático
- `/transcript` - Generar transcripción manual

### Moderación (3 comandos)
- `/clear` - Eliminar mensajes
- `/kick` - Expulsar usuario
- `/ban` - Banear usuario

### Sugerencias (3 comandos) ⭐
- `/sugerir` - Crear sugerencia
- `/sug-aprobada` - Aprobar sugerencia
- `/sug-rechazada` - Rechazar sugerencia

### Información y Utilidades (4 comandos) ⭐
- `/rol-id` - Información de roles
- `/solicitar-bot` - Info de servicios
- `/staff-status` - Estadísticas del staff
- `/bot-info` - Documentación del bot

### Redes Sociales (4 comandos)
- `/social-link add` - Vincular red social
- `/social-link remove` - Eliminar vinculación
- `/social-link list` - Listar vinculaciones
- `/social-link toggle` - Activar/desactivar

### Comandos Personalizados (5 comandos)
- `/crear-comando nuevo` - Crear comando
- `/crear-comando editar` - Editar comando
- `/crear-comando eliminar` - Eliminar comando
- `/crear-comando listar` - Listar comandos
- `/comandos` - Ver comandos disponibles

### Embeds (1 comando)
- `/panel-embed` - Crear embeds anónimos

### Total: 32 comandos slash + comandos personalizados con prefijo `!`

---

**Última actualización**: 7 de noviembre de 2025
**Versión del bot**: 2.0.0
**Estado**: Producción ✅
**Sistemas activos**: 16
**Comandos totales**: 32
