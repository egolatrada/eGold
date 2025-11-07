# 📋 Comando `/transcript` - Documentación Completa

## 📖 Descripción General

El comando `/transcript` permite al staff generar transcripciones manuales de tickets sin necesidad de cerrarlos. Las transcripciones se envían automáticamente al canal de logs de la categoría correspondiente del ticket.

---

## ⚙️ Especificaciones Técnicas

### Permisos Requeridos
- 🔐 **Gestionar Mensajes** (Manage Messages)
- Solo usuarios con este permiso pueden ejecutar el comando

### Ubicación
- ✅ **Solo funciona en canales de tickets**
- ❌ Bloqueado en cualquier otro tipo de canal

### Parámetros

| Parámetro | Tipo | Requerido | Rango | Por Defecto | Descripción |
|-----------|------|-----------|-------|-------------|-------------|
| `cantidad` | Integer | No | 1-50 | 50 | Cantidad de mensajes a incluir en la transcripción |

---

## 🎯 Uso del Comando

### Sintaxis Básica
```
/transcript
```
Genera transcripción de los últimos 50 mensajes del ticket.

### Con Cantidad Personalizada
```
/transcript cantidad:20
```
Genera transcripción de los últimos 20 mensajes del ticket.

### Ejemplos de Uso
```
/transcript cantidad:10   → Últimos 10 mensajes
/transcript cantidad:25   → Últimos 25 mensajes
/transcript cantidad:50   → Últimos 50 mensajes (máximo)
/transcript              → Últimos 50 mensajes (por defecto)
```

---

## 📄 Contenido de la Transcripción

### Información del Ticket
El archivo `.txt` generado incluye automáticamente:

```
═══════════════════════════════════════════════════════════════
   TRANSCRIPCIÓN DE TICKET
═══════════════════════════════════════════════════════════════

📍 Canal: #ticket-1-usuario
🆔 ID del Canal: 1234567890
📂 Tipo: Soporte/dudas
🎫 Número: #1
👤 Creador: Usuario#1234 (ID)
📊 Total de mensajes: 50
📅 Generado: 7 de noviembre de 2024, 01:30:00
👥 Solicitado por: StaffMember#5678 (ID)

═══════════════════════════════════════════════════════════════
```

### Formato de Mensajes

Cada mensaje incluye:

```
┌─ [07/11/2024, 01:25:30]
├─ 👤 Usuario#1234 (ID)
└─ Contenido del mensaje aquí

   📎 Embed: (si hay embeds)
      Título: Ejemplo
      Descripción: Contenido...
      URL: https://...

   📁 Archivo 1: imagen.png
      URL: https://cdn.discordapp.com/...
      Tamaño: 125.50 KB

   🎨 Sticker: nombre_del_sticker
```

### Elementos Capturados

| Elemento | Capturado | Detalles |
|----------|-----------|----------|
| 📝 Texto del mensaje | ✅ | Contenido completo |
| 👤 Autor | ✅ | Tag + ID (🤖 para bots) |
| ⏰ Timestamp | ✅ | Formato español DD/MM/YYYY HH:MM:SS |
| 📎 Embeds | ✅ | Título, descripción (200 chars), URL |
| 📁 Archivos adjuntos | ✅ | Nombre, URL descarga, tamaño |
| 🎨 Stickers | ✅ | Nombre del sticker |
| 👥 Participantes | ✅ | Lista completa de usuarios (sin bots) |

---

## 📤 Envío Automático

### Canal Destino
- La transcripción se envía automáticamente al **canal de transcripciones** configurado para la categoría del ticket
- El canal destino se define en `config.json` → `tickets.categories.[tipo].transcriptChannelId`

### Embed de Resumen
Junto con el archivo, se envía un embed con:

```yaml
📋 Transcripción de Ticket - ticket-1-usuario

Tipo: Soporte/dudas 🔧
Número: #1

Creador: Usuario#1234 (@Usuario)
Solicitado por: StaffMember#5678 (@StaffMember)

Creado: <timestamp Discord>
Transcripción generada: <timestamp Discord>

Mensajes guardados: 50
Participantes: @Usuario1, @Usuario2, @Usuario3
```

### Confirmación al Usuario
El staff que ejecuta el comando recibe (efímero):

```
✅ Transcripción generada con éxito

📋 Mensajes incluidos: 50
📁 Enviado a: #transcripts-soporte
🎫 Ticket: ticket-1-usuario
```

---

## 🔍 Validaciones del Comando

### Validación 1: Canal de Ticket
```
❌ Este comando solo funciona en canales de tickets.
```
**Causa**: Comando ejecutado fuera de un canal de ticket  
**Solución**: Ejecutar el comando dentro de un canal con nombre `ticket-*`

### Validación 2: Tipo de Ticket
```
❌ Error: Tipo de ticket "desconocido" no encontrado en la configuración.
```
**Causa**: No se pudo leer la metadata del ticket desde el topic del canal  
**Solución**: El ticket debe haber sido creado con el sistema actualizado

### Validación 3: Canal de Transcripciones
```
❌ No se ha configurado un canal de transcripciones para la categoría "X".
```
**Causa**: Falta `transcriptChannelId` en config.json para esa categoría  
**Solución**: Configurar el canal en `config.json`

### Validación 4: Canal Inexistente
```
❌ El canal de transcripciones configurado no existe o no es accesible.
```
**Causa**: El canal configurado fue eliminado o el bot no tiene acceso  
**Solución**: Verificar que el canal existe y el bot tiene permisos

### Validación 5: Sin Mensajes
```
❌ No hay mensajes en este canal para transcribir.
```
**Causa**: El canal está vacío  
**Solución**: Solo se puede generar transcripción si hay mensajes

---

## 💡 Casos de Uso Prácticos

### 1. Backup Preventivo
**Situación**: Antes de realizar cambios importantes en un ticket  
**Acción**: `/transcript cantidad:50`  
**Beneficio**: Guardas el estado actual por seguridad

### 2. Evidencia Parcial
**Situación**: Necesitas documentar solo una parte de la conversación  
**Acción**: `/transcript cantidad:15`  
**Beneficio**: Registro específico sin cerrar el ticket

### 3. Reportes Internos
**Situación**: El ticket sigue activo pero necesitas reportar a supervisores  
**Acción**: `/transcript cantidad:30`  
**Beneficio**: Informe del progreso sin interrumpir el ticket

### 4. Documentación de Decisiones
**Situación**: Se tomó una decisión importante en el ticket  
**Acción**: `/transcript cantidad:20`  
**Beneficio**: Registro de la conversación clave

### 5. Handover de Staff
**Situación**: Cambio de turno y otro staff tomará el ticket  
**Acción**: `/transcript`  
**Beneficio**: El nuevo staff puede revisar rápidamente el contexto

---

## 🔄 Diferencias con Cierre de Ticket

| Aspecto | `/transcript` | Cerrar Ticket (🔒) |
|---------|--------------|-------------------|
| **Canal del ticket** | ✅ Se mantiene activo | ❌ Se elimina |
| **Cantidad de mensajes** | 🔢 Configurable (1-50) | ♾️ Todos los mensajes |
| **Permisos requeridos** | 🔐 Gestionar Mensajes | 👮 Rol de Staff |
| **Propósito** | 📋 Backup/documentación | 🔒 Finalizar ticket |
| **Canal de voz** | ✅ No afecta | ❌ Se elimina si existe |
| **Cuándo usar** | Durante el ticket | Al finalizar |

---

## 🛠️ Configuración Necesaria

### En config.json
Cada categoría de ticket debe tener configurado su canal de transcripciones:

```json
{
  "tickets": {
    "categories": {
      "soporte-dudas": {
        "name": "Soporte/dudas",
        "categoryId": "1234567890",
        "transcriptChannelId": "9876543210",  ← OBLIGATORIO
        "emoji": "🔧"
      }
    }
  }
}
```

### Permisos del Bot en Canal de Transcripciones
El bot debe tener en el canal destino:
- ✅ Ver Canal
- ✅ Enviar Mensajes
- ✅ Adjuntar Archivos
- ✅ Incrustar Enlaces

---

## 📊 Logs del Sistema

### Logs Generados
Cada uso del comando genera logs en la consola:

```
📋 Usuario#1234 solicitó transcript de ticket-1-usuario (50 mensajes)
📋 Transcripción generada: ticket-1-usuario - 50 mensajes → transcripts-soporte
```

### Información en Logs
- 👤 Usuario que ejecutó el comando
- 📁 Canal donde se ejecutó
- 🔢 Cantidad de mensajes solicitados
- ✅ Confirmación de envío al canal destino

---

## ⚡ Rendimiento y Límites

| Aspecto | Límite | Razón |
|---------|--------|-------|
| **Mensajes máximos** | 50 | Optimización de rendimiento |
| **Tamaño del archivo** | Variable | Depende del contenido de mensajes |
| **Tiempo de ejecución** | ~2-5 segundos | Para 50 mensajes con archivos |
| **Cooldown** | Ninguno | Sin límite de uso |
| **Mensajes antiguos** | Sin límite | Funciona con mensajes de cualquier fecha |

---

## ❓ Preguntas Frecuentes

### ¿Puedo generar transcripción de más de 50 mensajes?
❌ No, el límite es 50 mensajes por razones de rendimiento. Para obtener todos los mensajes, cierra el ticket (🔒), lo cual genera transcripción completa.

### ¿Se puede usar en canales normales?
❌ No, solo funciona en canales de tickets. Para otros canales, considera otras herramientas de logging.

### ¿Los usuarios normales pueden usar este comando?
❌ No, requiere permiso de "Gestionar Mensajes", típicamente solo disponible para staff.

### ¿Se notifica a los participantes del ticket?
❌ No, la respuesta es efímera (solo la ve quien ejecuta el comando). Los participantes no reciben notificación.

### ¿Qué pasa si el ticket no tiene metadata?
⚠️ El comando intenta usar datos por defecto, pero es mejor que los tickets tengan metadata. Los tickets creados con el sistema actualizado siempre tienen metadata.

### ¿Se pueden recuperar mensajes eliminados?
❌ No, solo se capturan los mensajes que existen actualmente en el canal.

### ¿El comando elimina mensajes del ticket?
❌ No, el comando solo **lee** mensajes, nunca los elimina.

---

## 🔧 Troubleshooting

### Error: "Este comando solo funciona en canales de tickets"
**Problema**: Ejecutado fuera de un ticket  
**Solución**: Usar el comando solo en canales con formato `ticket-*`

### Error: "No se ha configurado un canal de transcripciones"
**Problema**: Falta configuración en config.json  
**Solución**: 
1. Abrir `config.json`
2. Buscar la categoría del ticket
3. Añadir/verificar `transcriptChannelId`
4. Reiniciar el bot

### No se envía al canal correcto
**Problema**: Configuración incorrecta del canal destino  
**Solución**:
1. Verificar el `transcriptChannelId` en config.json
2. Asegurar que el canal existe
3. Verificar permisos del bot en ese canal

### El archivo está vacío
**Problema**: No hay mensajes en el canal o todos son muy recientes  
**Solución**: Verificar que el ticket tiene mensajes y volver a intentar

---

## 📝 Registro de Cambios

### Versión Actual
- ✅ Validación mejorada de canales de tickets
- ✅ Lectura de metadata desde topic del canal
- ✅ Envío automático al canal de transcripciones de la categoría
- ✅ Embed con información completa del ticket
- ✅ Formato profesional de transcripción
- ✅ Manejo robusto de errores
- ✅ Soporte para embeds, archivos y stickers
- ✅ Lista de participantes automática

---

## 🎓 Ejemplos Completos de Flujo

### Ejemplo 1: Backup Rutinario
```
1. Staff abre ticket existente: ticket-5-usuario
2. Ejecuta: /transcript
3. Bot genera archivo con últimos 50 mensajes
4. Archivo enviado a #transcripts-soporte
5. Staff recibe confirmación efímera
6. Ticket sigue activo y funcional
```

### Ejemplo 2: Documentación Específica
```
1. Usuario reporta bug en ticket-12-jugador
2. Staff investiga y encuentra solución en últimos 15 mensajes
3. Ejecuta: /transcript cantidad:15
4. Bot genera archivo con esos 15 mensajes
5. Archivo enviado a #transcripts-bugs
6. Staff puede compartir solución con equipo técnico
```

### Ejemplo 3: Evidencia Legal
```
1. Apelación de ban en ticket-8-apelante
2. Conversación importante sobre evidencias
3. Staff ejecuta: /transcript cantidad:30
4. Bot genera registro de la discusión
5. Archivo enviado a #transcripts-apelaciones
6. Evidencia guardada antes de continuar proceso
```

---

## 🔐 Seguridad y Privacidad

### Privacidad
- ✅ Respuesta efímera: Solo quien ejecuta el comando ve la confirmación
- ✅ Los participantes del ticket NO son notificados
- ✅ Solo staff con permisos puede generar transcripciones

### Datos Sensibles
- ⚠️ Las transcripciones contienen todo el contenido del ticket
- ⚠️ Configurar permisos adecuados en canales de transcripciones
- ⚠️ Solo staff autorizado debe tener acceso a esos canales

### Almacenamiento
- 📁 Archivos almacenados en Discord (no en servidor externo)
- 🔒 Sujeto a permisos de Discord
- ♾️ Sin límite de tiempo de almacenamiento (mientras exista el canal)

---

## 📞 Soporte

Para problemas con el comando `/transcript`:

1. **Verificar logs del bot** para errores específicos
2. **Revisar config.json** para configuración correcta
3. **Verificar permisos** del bot en canales relevantes
4. **Revisar documentación** de tickets si el problema persiste

---

**Última actualización**: Noviembre 2024  
**Versión del bot**: v2.1.0  
**Comando agregado**: v2.1.0
