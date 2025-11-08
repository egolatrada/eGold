# 📝 Sistema de Changelog Automático

Sistema que envía automáticamente los changelogs al canal de Discord cada vez que el bot se reinicia.

## ✨ Características

- ✅ **Envío automático**: Los changelogs se envían automáticamente al iniciar el bot
- ✅ **Persistencia**: Los changelogs se guardan en archivo JSON
- ✅ **Sin intervención manual**: No necesitas recordar enviar los changelogs
- ✅ **Múltiples changelogs**: Puedes agregar varios changelogs que se enviarán en el próximo reinicio
- ✅ **Sistema robusto**: Sobrevive reinicios y errores

## 🚀 Cómo Funciona

1. **Agregas changelogs pendientes** usando el script `add-changelog.js`
2. **Se guardan** en `src/data/pending-changelogs.json`
3. **Al reiniciar el bot**, se envían automáticamente al Discord
4. **Se limpian** del archivo después de enviarse

## 📋 Uso del Script Helper

### Opción 1: Script Interactivo (Recomendado)

```bash
node add-changelog.js
```

El script te pedirá:
- **Emoji** del cambio (✨/🔧/🔄/🔒/⚡/🗑️)
- **Título** del cambio
- **Descripción** detallada (usa `\n` para saltos de línea)

Puedes agregar múltiples cambios en una sola sesión.

### Opción 2: Editar Archivo Manualmente

Edita `src/data/pending-changelogs.json`:

```json
[
  {
    "timestamp": 1731067200000,
    "changes": [
      {
        "emoji": "✨",
        "title": "Nueva Funcionalidad",
        "description": "Descripción detallada\nCon múltiples líneas"
      },
      {
        "emoji": "🔧",
        "title": "Corrección de Bug",
        "description": "Se corrigió el problema X"
      }
    ]
  }
]
```

## 🎨 Tipos de Emojis Disponibles

- `✨` - Nueva funcionalidad
- `🔧` - Corrección de errores
- `🔄` - Actualización/mejora
- `🔒` - Seguridad
- `⚡` - Rendimiento
- `🗑️` - Eliminación de funcionalidad

## 📊 Ejemplo Completo

```bash
$ node add-changelog.js

╔═══════════════════════════════════════════════════════╗
║   📝 Agregar Changelog Pendiente para Próximo Reinicio  ║
╚═══════════════════════════════════════════════════════╝

📋 Agregar nuevo cambio:

Emoji (✨/🔧/🔄/🔒/⚡/🗑️): ✨
Título del cambio: Sistema de Tareas Mejorado
Descripción (usa \n para saltos de línea): Nuevo sistema de tareas con categorías\n• Soporte para múltiples categorías\n• Ordenamiento automático\n• Interfaz mejorada

¿Agregar otro cambio? (s/n): n

✅ Changelog guardado exitosamente!
📊 Total de changelogs pendientes: 1

🔄 Se enviará automáticamente al Discord en el próximo reinicio del bot.
```

## 🔄 Flujo Completo

1. **Realizas cambios** en el código del bot
2. **Ejecutas** `node add-changelog.js`
3. **Describes** los cambios realizados
4. **Reinicias** el bot (automático o manual)
5. **El bot envía** los changelogs al Discord
6. **Los usuarios ven** las actualizaciones en el canal 🦋・servidor

## 📁 Archivos del Sistema

- `src/systems/changelog-system.js` - Sistema principal
- `src/data/pending-changelogs.json` - Changelogs pendientes (se crea automáticamente)
- `add-changelog.js` - Script helper para agregar changelogs
- Canal de Discord: `1435847630176653312` (🦋・servidor)

## 🛠️ Integración Técnica

El sistema se inicializa automáticamente en `src/index.js`:

```javascript
changelogSystem = new ChangelogSystem(client);
await changelogSystem.initialize();
```

Al inicializar:
1. Conecta al canal de Discord
2. Carga changelogs pendientes
3. Los envía automáticamente
4. Limpia el archivo

## ✅ Ventajas

- ✅ **Nunca olvidas** enviar changelogs
- ✅ **Automático y transparente**
- ✅ **Puedes agregar múltiples** changelogs antes de reiniciar
- ✅ **Historial persistente** antes del envío
- ✅ **Fácil de usar** con script interactivo

## 📝 Notas

- Los changelogs se envían en el orden en que fueron agregados
- Hay un delay de 1 segundo entre changelogs para evitar rate limits
- El archivo se limpia automáticamente después del envío exitoso
- Si el bot falla al enviar, los changelogs se mantienen para el próximo intento

## 🎯 Recomendación

**Usa el script `add-changelog.js` cada vez que hagas cambios importantes** en el bot. Así tus usuarios siempre estarán informados de las actualizaciones.
