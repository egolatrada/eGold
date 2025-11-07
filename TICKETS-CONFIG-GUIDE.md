# 🎫 Guía de Configuración de Categorías de Tickets

Este bot ahora incluye **13 categorías de tickets** completamente configurables. Cada categoría puede tener su propia categoría de Discord donde se crearán los canales de tickets.

## 📋 Categorías Disponibles

### 1. **Soporte/dudas** 🔧
- Para consultas generales y soporte técnico
- Emoji: 🔧

### 2. **Bugs/Fallos** ⚠️
- Reportar errores del servidor
- Emoji: ⚠️

### 3. **Donaciones** 💰
- Consultas sobre donaciones y VIP
- Emoji: 💰

### 4. **Playmakers** 👥
- Tickets para el equipo de Playmakers
- Emoji: 👥

### 5. **CK** ☑️
- Tickets relacionados con Character Kill
- Emoji: ☑️

### 6. **Reportes Públicos** 💬
- Reportes públicos del servidor
- Emoji: 💬

### 7. **Ticket de apelación** ⚖️
- Apelaciones de sanciones
- Emoji: ⚖️

### 8. **Ticket de devoluciones** 🔄
- Solicitudes de devoluciones
- Emoji: 🔄

### 9. **Creador de contenido** 📹
- Para creadores de contenido del servidor
- Emoji: 📹

### 10. **Peds** 🏠
- Tickets relacionados con propiedades/peds
- Emoji: 🏠

### 11. **EMS** 🚑
- Departamento de servicios médicos
- Emoji: 🚑

### 12. **LSPD/SAPD** 👮
- Departamentos de policía
- Emoji: 👮

### 13. **Organizaciones criminales** 🔫
- Tickets para organizaciones criminales
- Emoji: 🔫

## 🔧 Cómo Configurar los IDs de Categoría

### Paso 1: Crear las Categorías en Discord

1. En tu servidor de Discord, crea las categorías que necesites para organizar los tickets
2. Por ejemplo:
   - Categoría "📋 TICKETS GENERALES" para: Soporte, Bugs, Donaciones
   - Categoría "👥 TICKETS STAFF" para: Playmakers, CK, Reportes
   - Categoría "🏛️ TICKETS FACCIÓN" para: EMS, LSPD/SAPD, Organizaciones
   - Categoría "📝 TICKETS ADMINISTRACIÓN" para: Apelaciones, Devoluciones, Contenido, Peds

### Paso 2: Obtener el ID de cada Categoría

1. Activa el **Modo Desarrollador** en Discord:
   - Configuración de Usuario → Avanzado → Modo Desarrollador: ON

2. Haz clic derecho en la categoría que creaste
3. Selecciona "Copiar ID"
4. Guarda ese ID

### Paso 3: Configurar en config.json

Abre el archivo `config.json` y busca la sección `tickets.categories`. Verás algo así:

```json
"soporte-dudas": {
  "name": "Soporte/dudas",
  "categoryId": "PON_AQUI_EL_ID_DE_LA_CATEGORIA",
  "transcriptChannelId": "1425955847716077779",
  "emoji": "🔧",
  "channelDescription": "Canal de soporte y dudas generales"
}
```

**Reemplaza** `PON_AQUI_EL_ID_DE_LA_CATEGORIA` con el ID que copiaste en el Paso 2.

### Ejemplo Completo

```json
"soporte-dudas": {
  "name": "Soporte/dudas",
  "categoryId": "1234567890123456789",  ← Tu ID aquí
  "transcriptChannelId": "1425955847716077779",
  "emoji": "🔧",
  "channelDescription": "Canal de soporte y dudas generales"
}
```

### Paso 4: Configurar Canal de Transcripciones (Opcional)

Si quieres que cada tipo de ticket guarde sus transcripciones en canales diferentes:

1. Crea un canal de texto para cada tipo de transcripción
2. Obtén el ID del canal (clic derecho → Copiar ID)
3. Reemplaza `transcriptChannelId` con ese ID

**Nota:** Puedes usar el mismo canal de transcripciones para todos los tipos de tickets si prefieres.

## 🎯 Configuración Recomendada

### Opción 1: Todas en una Categoría
Si prefieres simplicidad, puedes usar la misma categoría para todos los tickets:

```json
"categoryId": "1234567890123456789"  ← Mismo ID para todos
```

### Opción 2: Organizadas por Tipo
Para mejor organización, usa categorías diferentes:

**Tickets Generales:**
- Soporte/dudas
- Bugs/Fallos
- Donaciones

**Tickets Staff:**
- Playmakers
- CK
- Reportes Públicos

**Tickets Facción:**
- EMS
- LSPD/SAPD
- Organizaciones criminales

**Tickets Administrativos:**
- Ticket de apelación
- Ticket de devoluciones
- Creador de contenido
- Peds

## ⚙️ Después de Configurar

1. Guarda el archivo `config.json`
2. El bot se reiniciará automáticamente
3. Usa `/setup-panel` para crear/actualizar el panel de tickets
4. ¡Listo! Ahora los usuarios verán todas las opciones en el menú desplegable

## 📝 Notas Importantes

- **Permisos:** Asegúrate de que el bot tenga permisos para crear canales en las categorías configuradas
- **Límite de Discord:** Discord permite máximo 50 canales por categoría
- **Nombres automáticos:** Los canales se crean automáticamente con formato `ticket-{usuario}-{número}`
- **Cierre automático:** Los tickets se cierran con el botón "🔒 Cerrar Ticket" y se crea una transcripción

## 🆘 Solución de Problemas

**Error: "No tengo permisos para crear el canal"**
→ Verifica que el bot tenga permisos de "Gestionar Canales" en la categoría configurada

**No aparece la opción en el menú**
→ Verifica que el emoji esté correctamente configurado y que el nombre no esté vacío

**Los tickets se crean en la categoría incorrecta**
→ Revisa que hayas copiado correctamente el ID de la categoría (18 dígitos)

## 🎨 Personalización Adicional

Puedes editar:
- **emoji**: Cambia el emoji que aparece en el menú
- **name**: Cambia el nombre visible de la opción
- **channelDescription**: Descripción que aparece en el canal creado

---

## 🎮 Comandos Disponibles

### Comandos de Configuración

#### `/setup-ticket-panel`
- **Descripción**: Crea el panel de selección de tickets con menú desplegable
- **Permisos**: Administrador
- **Uso**: Ejecuta este comando en el canal donde quieres que aparezca el panel de tickets

#### `/add-ticket-menu`
- **Descripción**: Añade el menú de tickets a un mensaje existente
- **Permisos**: Administrador
- **Parámetros**: `message_id` (ID del mensaje)
- **Uso**: Útil para agregar el menú a embeds personalizados

### Comandos de Gestión de Tickets

#### `/añadir-usuario` ⭐ **NUEVO**
- **Descripción**: Añade un usuario adicional a un ticket específico
- **Permisos**: Staff (rol configurado en `staffRoleId`)
- **Ubicación**: Solo funciona dentro de canales de tickets
- **Parámetros**: `usuario` (usuario a añadir)
- **Uso**: 
  ```
  /añadir-usuario usuario:@Usuario
  ```
- **Funcionalidad**:
  - Otorga permisos de visualización y escritura al usuario mencionado
  - Permite colaboración entre staff en tickets
  - Permite incluir testigos o usuarios relacionados
  - Registra la acción en logs de tickets
  - Muestra confirmación con embed visual

**Casos de uso comunes:**
- ✅ Añadir otro miembro del staff para colaborar en un ticket complejo
- ✅ Incluir a otro usuario relacionado con el ticket (ej: testigo en un reporte)
- ✅ Permitir que un moderador senior supervise un ticket de apelación
- ✅ Añadir a un desarrollador en tickets de bugs técnicos

**Validaciones:**
- ❌ No permite ejecutar el comando fuera de canales de tickets
- ❌ Solo el staff puede usar este comando
- ⚠️ Si el usuario ya tiene acceso, muestra advertencia sin duplicar permisos

---

¡Y listo! Tu sistema de tickets está completamente configurado 🎉
