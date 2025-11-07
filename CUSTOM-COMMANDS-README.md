# 📝 Sistema de Comandos Personalizados

Sistema completo para crear respuestas rápidas y plantillas personalizadas usando comandos con prefijo `!`.

## ✨ Características

- **Gestión 100% por comandos** - Sin necesidad de editar archivos
- **Prefijo `!` limpio** - Solo comandos con `!` (ej: !ayuda, !reglas, !info)
- **Triggers efímeros** - El mensaje del comando se borra automáticamente
- **Embeds personalizados** - Control total sobre título, descripción, color, campos, imágenes
- **Almacenamiento persistente** - Guardado automático en `custom-commands-data.json`
- **Sistema activación/desactivación** - Pausa comandos sin eliminarlos
- **Estadísticas de uso** - Tracking de cuántas veces se usa cada comando
- **Lista pública** - Comando `/comandos` para que todos vean los comandos disponibles
- **Perfecto para tickets** - Respuestas rápidas para staff en canales de soporte

## 🎮 Comandos Disponibles

### `/crear-comando nuevo`
Inicia el asistente para crear un nuevo comando personalizado.

**Proceso:**
1. Haces clic en "📝 Crear Comando"
2. Se abre un formulario con:
   - Nombre del comando (debe empezar con !, ej: !ayuda, !info)
   - Título del embed
   - Descripción
   - Color (HEX)
   - Footer
3. El comando se crea y puedes añadir campos e imágenes adicionales

**Ejemplo:**
```
/crear-comando nuevo
```

### `/comandos`
Lista todos los comandos personalizados disponibles.

**Características:**
- Disponible para todos los usuarios
- Muestra solo comandos activos
- Incluye descripción breve de cada comando
- Se ordena alfabéticamente

**Ejemplo:**
```
/comandos
```

### `/crear-comando editar`
Edita un comando existente.

**Parámetros:**
- `comando` - Nombre del comando a editar (sin necesidad del prefijo !)

**Ejemplo:**
```
/crear-comando editar comando:ck1
```

**Opciones de edición:**
- ✏️ **Editar Info Básica** - Cambiar título, descripción, color, footer
- 📋 **Gestionar Campos** - Añadir campos personalizados al embed
- 🖼️ **Añadir Imágenes** - Establecer imagen principal y thumbnail
- 👁️ **Vista Previa** - Ver cómo se ve el comando
- 🗑️ **Eliminar** - Borrar el comando permanentemente

### `/crear-comando eliminar`
Elimina un comando personalizado.

**Parámetros:**
- `comando` - Nombre del comando a eliminar

**Ejemplo:**
```
/crear-comando eliminar comando:ck1
```

### `/crear-comando listar`
Muestra todos los comandos personalizados creados.

**Ejemplo:**
```
/crear-comando listar
```

**Información mostrada:**
- Estado (🟢 Activo / 🔴 Desactivado)
- Nombre del comando
- Título
- Número de usos
- ID del comando

### `/crear-comando toggle`
Activa o desactiva un comando sin eliminarlo.

**Parámetros:**
- `comando` - Nombre del comando

**Ejemplo:**
```
/crear-comando toggle comando:ck1
```

## 💡 Casos de Uso

### 1. Respuesta rápida de soporte
**Comando:** `!ck1`
```
Título: 📞 Información de Soporte
Descripción: Gracias por contactar con soporte. Un miembro del equipo estará contigo pronto.
Campos:
  - Horario: Lunes a Viernes, 9AM - 6PM
  - Tiempo de espera: Aproximadamente 5-10 minutos
```

### 2. Reglas del servidor
**Comando:** `!ckreglas`
```
Título: 📜 Reglas del Servidor
Descripción: Por favor, lee y respeta las siguientes reglas...
Campos:
  - 1. Respeto: No toleramos el acoso ni el lenguaje ofensivo
  - 2. Spam: No envíes mensajes repetitivos
  - 3. NSFW: Contenido inapropiado está prohibido
```

### 3. Plantilla de bienvenida
**Comando:** `!ckbienvenida`
```
Título: 🎉 ¡Bienvenido al Servidor!
Descripción: Estamos encantados de tenerte aquí. Aquí tienes información útil...
Imagen: URL del logo del servidor
```

### 4. Información de verificación
**Comando:** `!ckverificar`
```
Título: ✅ Proceso de Verificación
Descripción: Para acceder a todos los canales, completa estos pasos...
Campos:
  - Paso 1: Lee las reglas en #reglas
  - Paso 2: Completa el formulario de verificación
  - Paso 3: Espera la aprobación del staff
```

### 5. Plantilla de reportes
**Comando:** `!ckreporte`
```
Título: ⚠️ Cómo Reportar un Problema
Descripción: Si necesitas reportar algo, incluye la siguiente información...
Campos:
  - Usuario involucrado: @usuario o ID
  - Evidencia: Capturas de pantalla o enlaces
  - Descripción: Detalles del incidente
```

## 📋 Estructura de un Comando

Un comando personalizado puede incluir:

```javascript
{
  name: "!ck1",                    // Nombre del comando
  title: "Título del Embed",       // Título (máx. 256 caracteres)
  description: "Descripción...",   // Descripción principal (máx. 4000 caracteres)
  color: "#5865F2",                // Color en formato HEX
  footer: "Texto del footer",      // Footer opcional (máx. 256 caracteres)
  fields: [                        // Array de campos (máx. 25)
    {
      name: "Campo 1",             // Nombre del campo
      value: "Valor del campo",    // Valor del campo
      inline: false                // Si va en línea o no
    }
  ],
  image: "URL",                    // Imagen grande del embed
  thumbnail: "URL",                // Thumbnail (imagen pequeña)
  enabled: true,                   // Estado (activado/desactivado)
  usageCount: 5,                   // Número de veces usado
  lastUsed: 1699999999999,        // Timestamp del último uso
  createdBy: "ID_USUARIO",         // Quién lo creó
  createdAt: 1699999999999        // Cuándo se creó
}
```

## 🎨 Personalización Avanzada

### Colores recomendados

| Color | HEX | Uso |
|-------|-----|-----|
| Azul Discord | `#5865F2` | Información general |
| Verde | `#57F287` | Éxito / Confirmación |
| Rojo | `#ED4245` | Advertencia / Error |
| Amarillo | `#FEE75C` | Atención |
| Morado | `#9B59B6` | Premium / Especial |
| Naranja | `#E67E22` | Alertas |

### Campos inline vs no inline

- **inline: false** - El campo ocupa toda la fila (perfecto para texto largo)
- **inline: true** - Permite hasta 3 campos en la misma fila (perfecto para listas)

### Límites de Discord

- **Título:** Máximo 256 caracteres
- **Descripción:** Máximo 4000 caracteres
- **Campos:** Máximo 25 por embed
- **Nombre de campo:** Máximo 256 caracteres
- **Valor de campo:** Máximo 1024 caracteres
- **Footer:** Máximo 2048 caracteres (el sistema limita a 256)
- **Total del embed:** Máximo 6000 caracteres combinados

## 🔧 Gestión de Comandos

### Crear un comando básico

1. Ejecuta `/crear-comando nuevo`
2. Haz clic en "📝 Crear Comando"
3. Completa el formulario:
   - **Nombre:** `ck1`
   - **Título:** `Información de Soporte`
   - **Descripción:** `Gracias por abrir un ticket...`
   - **Color:** `#5865F2`
   - **Footer:** `Equipo de Soporte - Strangers RP`
4. El comando queda creado como `!ck1`

### Añadir campos a un comando

1. Después de crear el comando, haz clic en "➕ Añadir Campos"
2. O usa `/crear-comando editar comando:ck1` → "📋 Gestionar Campos"
3. Completa el modal:
   - **Nombre del campo:** `Horarios`
   - **Valor del campo:** `Lunes a Viernes: 9AM - 6PM`
4. Puedes añadir hasta 25 campos

### Añadir imágenes

1. Edita el comando: `/crear-comando editar comando:ck1`
2. Haz clic en "🖼️ Añadir Imágenes"
3. Proporciona URLs de imágenes:
   - **Imagen grande:** URL de la imagen principal
   - **Thumbnail:** URL de la imagen pequeña (esquina superior derecha)

### Ver vista previa

1. Edita el comando: `/crear-comando editar comando:ck1`
2. Haz clic en "👁️ Vista Previa"
3. Verás exactamente cómo se verá el comando cuando lo uses

## 📊 Estadísticas

Cada comando registra automáticamente:
- **Número de usos** - Cuántas veces se ha ejecutado
- **Último uso** - Cuándo fue usado por última vez
- **Último usuario** - Quién lo usó

Consulta estas estadísticas con `/crear-comando listar`

## 🔒 Permisos

Por defecto, el comando `/crear-comando` requiere el permiso **"Gestionar Mensajes"**.

Sin embargo, **cualquier usuario** puede ejecutar los comandos personalizados (ej: `!ck1`) si están activados.

## 💾 Almacenamiento

Los comandos se guardan en `custom-commands-data.json`:

```json
{
  "commands": {
    "!ck1": {
      "name": "!ck1",
      "title": "Información de Soporte",
      "description": "...",
      "color": "#5865F2",
      "fields": [],
      "enabled": true,
      "usageCount": 10,
      "createdBy": "123456789",
      "createdAt": 1699999999999
    }
  },
  "lastUpdate": 1699999999999
}
```

## 🚀 Ejemplos Prácticos

### Comando de FAQ
```
Nombre: !ckfaq
Título: ❓ Preguntas Frecuentes
Descripción: Aquí están las respuestas a las preguntas más comunes
Campos:
  - ¿Cómo me verifico?: Ve a #verificación y haz clic en el botón
  - ¿Cuándo abren tickets?: Lunes a Viernes, 9AM-6PM
  - ¿Cómo reporto un bug?: Abre un ticket en #soporte
```

### Comando de información de roles
```
Nombre: !ckroles
Título: 🎭 Información de Roles
Descripción: Sistema de roles del servidor
Campos:
  - @Verificado: Usuarios verificados
  - @Premium: Usuarios con beneficios premium
  - @Staff: Equipo de moderación
```

### Comando de links útiles
```
Nombre: !cklinks
Título: 🔗 Enlaces Útiles
Descripción: Enlaces importantes del servidor
Campos:
  - Website: https://ejemplo.com
  - Discord: https://discord.gg/ejemplo
  - Twitter: https://twitter.com/ejemplo
```

## ⚠️ Notas Importantes

1. **Los comandos solo funcionan con el prefijo !ck**
   - ✅ Correcto: `!ck1`, `!ck2`, `!ckayuda`
   - ❌ Incorrecto: `ck1`, `comando1`, `!ayuda`

2. **El nombre del comando debe ser único**
   - No puedes tener dos comandos con el mismo nombre

3. **Los comandos desactivados no responden**
   - Usa `/crear-comando toggle` para activarlos/desactivarlos

4. **Los datos se guardan automáticamente**
   - No necesitas hacer nada especial para guardar cambios

5. **Los comandos persisten entre reinicios**
   - El archivo `custom-commands-data.json` mantiene todos los datos

## 🎯 Mejores Prácticas

1. **Nombra los comandos de forma descriptiva**
   - Mejor: `!ckayuda`, `!ckreglas`, `!ckverificar`
   - Peor: `!ck1`, `!ck2`, `!ck3`

2. **Usa colores consistentes**
   - Mantén un esquema de colores para diferentes tipos de comandos
   - Ejemplo: Verde para éxito, Rojo para advertencias

3. **Mantén las descripciones concisas**
   - La información debe ser clara y al punto
   - Usa campos para organizar contenido extenso

4. **Actualiza los comandos regularmente**
   - Revisa y actualiza la información según sea necesario
   - Elimina comandos obsoletos

5. **Prueba antes de usar en producción**
   - Usa la vista previa para verificar cómo se ve
   - Prueba el comando en un canal de pruebas primero
