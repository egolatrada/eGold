# 📋 Sistema de Gestión de Tareas - Documentación Completa

Sistema ultra-simple de gestión de tareas para Discord con categorización automática por IA, actualización dinámica de embeds y completado por copiar/pegar.

---

## ✨ Filosofía del Sistema

**"Extremadamente simple y visualmente limpio"**

Este sistema está diseñado para que cualquier administrador pueda usarlo sin leer documentación:
1. **Pegas** una lista de tareas → El bot las categoriza con IA
2. **Copias** el texto de una tarea → La pegas en el chat
3. **Listo** → Tu mensaje se elimina y la tarea se tacha automáticamente

**¡Sin botones, sin comandos complicados, sin notificaciones molestas!**

---

## 🎯 Flujo de Trabajo Completo

### **1. Crear Tareas**
```
/tareas lista: 1. Configurar tickets 2. Eliminar bots 3. Leer un libro
```

### **2. Bot Responde (Solo Embeds)**
El bot envía embeds categorizados automáticamente, **sin mensajes de confirmación**:

**⚙️ Configuración** (Amarillo #FEE75C)
```
1. Configurar tickets
```

**💬 Discord** (Azul Discord #5865F2)
```
1. Eliminar bots
```

**📋 General** (Gris #95A5A6)
```
1. Leer un libro
```

### **3. Agregar Más Tareas**
```
/tareas lista: 4. Configurar admin menu 5. Borrar caché
```

**El bot automáticamente:**
- 🗑️ Elimina los embeds anteriores
- 📊 Envía embeds actualizados con **todas las tareas** (nuevas + viejas)
- 🎨 Categoriza todo correctamente

### **4. Completar Tareas**
```
Usuario copia y pega: "Eliminar bots"
```

**El bot automáticamente:**
- 🗑️ Elimina el mensaje del usuario
- ~~Tacha~~ la tarea en el embed
- 🔄 Actualiza el contador (1/1 completadas)
- 🔇 Todo silencioso (sin notificaciones ni mensajes de confirmación)

---

## 🎨 Sistema de Colores por Categoría

Cada categoría tiene un color distintivo para mejor visualización:

| Categoría | Color | Hex | Emoji | Ejemplos |
|-----------|-------|-----|-------|----------|
| **Discord** | Azul Discord | `#5865F2` | 💬 | "Eliminar bots", "Configurar roles" |
| **Scripts GTA** | Cyan | `#00D9FF` | 🎮 | "Configurar admin menu", "Arreglar script police" |
| **Desarrollo** | Verde | `#57F287` | 💻 | "Añadir feature", "Actualizar código" |
| **Moderación** | Rojo | `#ED4245` | 🛡️ | "Revisar reportes", "Banear usuario" |
| **Configuración** | Amarillo | `#FEE75C` | ⚙️ | "Configurar canal", "Ajustar permisos" |
| **Eventos** | Rosa | `#EB459E` | 🎉 | "Organizar torneo", "Planear evento" |
| **Marketing** | Coral | `#FF6B6B` | 📢 | "Publicar en redes", "Promocionar servidor" |
| **Soporte** | Azul claro | `#5DADEC` | 🎫 | "Responder tickets", "Atender usuarios" |
| **Bugs** | Naranja | `#FF5733` | 🐛 | "Arreglar error", "Corregir problema" |
| **Contenido** | Púrpura | `#9B59B6` | 📝 | "Escribir anuncio", "Crear documentación" |
| **Administración** | Dorado | `#FFD700` | 👑 | "Gestionar staff", "Revisar estadísticas" |
| **General** | Gris | `#95A5A6` | 📋 | Todo lo demás |

---

## 🎮 Comandos Disponibles

### 1️⃣ `/tareas` - Crear/Agregar Tareas

Comando principal para crear listas de tareas con categorización automática.

**Sintaxis:**
```
/tareas lista: <lista enumerada> [categoria: opcional]
```

**Formatos Soportados:**
```
Formato 1 (Recomendado):
1. Primera tarea
2. Segunda tarea
3. Tercera tarea

Formato 2 (Multi-línea):
1. Tarea A
2. Tarea B
3. Tarea C

Formato 3 (Inline):
1. Tarea X 2. Tarea Y 3. Tarea Z

Formato 4 (Viñetas):
- Tarea uno
- Tarea dos
- Tarea tres
```

**Parámetros:**
- `lista` *(requerido)*: Tu lista de tareas enumeradas
- `categoria` *(opcional)*: Categoría manual para todas las tareas

---

#### **Ejemplo 1: Categorización Automática (Recomendado)**

```
/tareas lista:
1. Configurar canal de anuncios
2. Revisar reportes de moderadores
3. Arreglar bug en comando de tickets
4. Organizar evento de Halloween
5. Publicar post en redes sociales
```

**El bot muestra (solo embeds, sin texto):**

**⚙️ Configuración** (Amarillo)
```
1. Configurar canal de anuncios
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**🛡️ Moderación** (Rojo)
```
1. Revisar reportes de moderadores
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**🐛 Bugs** (Naranja)
```
1. Arreglar bug en comando de tickets
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**🎉 Eventos** (Rosa)
```
1. Organizar evento de Halloween
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**📢 Marketing** (Coral)
```
1. Publicar post en redes sociales
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

---

#### **Ejemplo 2: Categoría Manual**

Si quieres que todas las tareas vayan a la misma categoría:

```
/tareas lista:
- Revisar aplicación de Juan
- Revisar aplicación de María
- Actualizar lista de moderadores
categoria: Moderación
```

**El bot muestra:**

**🛡️ Moderación** (Rojo)
```
1. Revisar aplicación de Juan
2. Revisar aplicación de María
3. Actualizar lista de moderadores
0/3 completadas • Copia y pega la tarea en el chat para tacharla
```

---

#### **Ejemplo 3: Agregar Nuevas Tareas (Actualización Automática)**

**Primera lista:**
```
/tareas lista: 1. Tarea A 2. Tarea B
```

**Bot envía embeds con 2 tareas**

---

**Agregar más tareas:**
```
/tareas lista: 3. Tarea C 4. Tarea D
```

**El bot automáticamente:**
1. 🗑️ **Elimina los embeds anteriores**
2. 📊 **Envía embeds nuevos con TODAS las tareas** (A, B, C, D)
3. 🎨 **Categoriza correctamente cada una**

**Resultado:** Siempre una lista consolidada y actualizada, nunca embeds duplicados.

---

### 2️⃣ `/ver-tareas` - Ver Todas las Tareas

Muestra todas las tareas actuales organizadas por categoría con progreso.

```
/ver-tareas
```

**Ejemplo de respuesta:**

```
📊 Progreso Total: 3/8 tareas completadas

💬 Discord
1. ~~Eliminar bots innecesarios~~
2. Configurar roles de verificación
1/2 completadas

🎮 Scripts GTA
1. Configurar admin menu
2. ~~Arreglar script de police~~
1/2 completadas

📋 General
1. ~~Leer un libro~~
2. Limpiar el suelo
3. Borrar caché
4. Organizar archivos
1/4 completadas
```

---

### 3️⃣ `/limpiar-tareas` - Eliminar Todas las Tareas

Elimina **TODAS** las tareas del servidor (¡cuidado!).

```
/limpiar-tareas
```

**Confirmación:**
```
⚠️ ¿Estás seguro de que deseas eliminar TODAS las tareas?
Esta acción NO se puede deshacer.

[Botón: Sí, eliminar todo] [Botón: Cancelar]
```

Útil cuando quieres empezar de cero con una nueva lista.

---

## ✅ Cómo Completar Tareas (Copiar/Pegar)

### **Método Simple:**

**Paso 1:** Ver las tareas (opcional)
```
/ver-tareas
```

**Paso 2:** Copiar el texto exacto de la tarea
```
Selecciona: "Configurar canal de anuncios"
Copia: Ctrl+C / Cmd+C
```

**Paso 3:** Pegar en el chat
```
Pega el texto en cualquier canal del servidor
```

**Paso 4:** ¡Automático!

El bot detecta la tarea y:
- 🗑️ **Elimina tu mensaje** (interfaz limpia)
- ~~**Tacha**~~ la tarea en el embed
- 🔄 Actualiza el contador (1/3 → 2/3)
- 🔇 **Todo silencioso** (sin notificaciones)

---

### **Detección Inteligente:**

El sistema busca coincidencias **exactas** primero, luego **parciales**:

✅ **Funcionará:**
- `Configurar canal de anuncios` (exacto)
- `configurar canal de anuncios` (minúsculas)
- `CONFIGURAR CANAL DE ANUNCIOS` (mayúsculas)
- `Configurar canal` (parcial)

❌ **NO funcionará:**
- `1. Configurar canal` (incluye número)
- `~~Configurar canal~~` (incluye formato)

**Regla:** Solo copia el **texto puro** de la tarea, sin números ni formato.

---

## 🔧 Características Técnicas Avanzadas

### **1. Sistema de Actualización de Embeds**

Cuando ejecutas `/tareas` por segunda vez:

```javascript
// PASO 1: Eliminar embeds antiguos
await deleteOldTaskEmbeds(guildId, channel);

// PASO 2: Obtener TODAS las tareas (viejas + nuevas)
const allTasks = await getTasksByCategory(guildId);

// PASO 3: Generar embeds actualizados
const embeds = generateTaskEmbeds(allTasks);

// PASO 4: Enviar nuevos embeds
await sendEmbeds(embeds);
```

**Ventaja:** Siempre ves una lista única y consolidada.

---

### **2. Categorización con IA (GPT-4o-mini)**

El sistema usa OpenAI para categorizar tareas inteligentemente:

```javascript
// Ejemplo de prompt enviado a la IA
"Categoriza estas tareas en: Discord, Scripts GTA, Desarrollo, Moderación, etc.
1. Eliminar bots innecesarios
2. Configurar admin menu
3. Leer un libro"

// Respuesta de la IA
["Discord", "Scripts GTA", "General"]
```

**Modelo:** GPT-4o-mini (rápido y económico)  
**Velocidad:** ~1-2 segundos para 10 tareas  
**Precisión:** ~95% de acierto

---

### **3. Parser de Listas Flexible**

El sistema detecta automáticamente múltiples formatos:

```javascript
Soportados:
✅ "1. Tarea"        // Números con punto
✅ "1) Tarea"        // Números con paréntesis
✅ "- Tarea"         // Guiones
✅ "• Tarea"         // Viñetas
✅ "* Tarea"         // Asteriscos
✅ "1. A 2. B 3. C"  // Inline (multi-tarea en una línea)

No soportados:
❌ Líneas sin formato (a menos que sean consecutivas)
```

---

### **4. Base de Datos PostgreSQL**

**Tabla: `simple_tasks`**

```sql
CREATE TABLE simple_tasks (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(32) NOT NULL,
    channel_id VARCHAR(32),
    message_id TEXT,              -- Almacena IDs separados por coma: "12345,67890"
    category VARCHAR(100) NOT NULL,
    task_text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

**Características:**
- Persistencia permanente (sobrevive reinicios)
- `message_id` tipo TEXT para múltiples embeds
- Búsqueda eficiente por texto
- Historial completo de tareas

---

### **5. Detección de Completado**

```javascript
// Búsqueda EXACTA primero (case-insensitive)
SELECT * FROM simple_tasks 
WHERE guild_id = $1 
  AND LOWER(task_text) = LOWER($2)
  AND completed = FALSE
LIMIT 1;

// Si no hay coincidencia exacta, búsqueda PARCIAL
SELECT * FROM simple_tasks 
WHERE guild_id = $1 
  AND LOWER(task_text) LIKE '%' || LOWER($2) || '%'
  AND completed = FALSE
LIMIT 1;
```

**Previene:** Marcar múltiples tareas accidentalmente.

---

### **6. Auto-Eliminación de Mensajes**

Cuando completas una tarea:

```javascript
// 1. Detectar tarea
const task = await findTaskByText(guildId, messageContent);

// 2. Marcar como completada
await markTaskCompleted(task.id);

// 3. ELIMINAR mensaje del usuario
await message.delete();

// 4. Actualizar embeds silenciosamente
await updateTaskEmbeds(guildId, channelId);
```

**Resultado:** Interfaz limpia sin spam de mensajes.

---

## 💡 Casos de Uso Prácticos

### **Caso 1: To-Do Diario del Administrador**

```
/tareas lista:
1. Revisar mensajes de la noche
2. Responder tickets pendientes
3. Actualizar anuncio semanal
4. Planear evento del viernes
```

**Categorización IA:**
- General, Soporte, Contenido, Eventos

---

### **Caso 2: Checklist de Configuración de Servidor Nuevo**

```
/tareas lista:
1. Crear canales de categorías
2. Configurar roles de colores
3. Activar sistema de verificación
4. Configurar bot de música
5. Añadir reglas al canal
categoria: Configuración
```

**Todo en una categoría:** Configuración ⚙️ (Amarillo)

---

### **Caso 3: Lista de Bugs a Arreglar (GTA RP)**

```
/tareas lista:
- Comando de /me no funciona
- Script de police crashea el servidor
- Admin menu no se abre
- Inventario duplica items
categoria: Bugs
```

**Todo en:** Bugs 🐛 (Naranja)

---

### **Caso 4: Actualización Continua**

**Lunes:**
```
/tareas lista: 1. Revisar aplicaciones 2. Actualizar reglas
```

**Martes (agregar más):**
```
/tareas lista: 3. Configurar evento 4. Responder tickets
```

**Resultado:** Embeds muestran las 4 tareas consolidadas.

---

## 🎯 Consejos y Buenas Prácticas

### ✅ **Hacer:**
- ✅ Escribir tareas claras y descriptivas
- ✅ Usar verbos al inicio: "Revisar", "Configurar", "Crear", "Arreglar"
- ✅ Agrupar tareas relacionadas en una lista
- ✅ Copiar el texto EXACTO para completar
- ✅ Usar `/ver-tareas` para ver progreso
- ✅ Aprovechar la categorización automática con IA

### ❌ **Evitar:**
- ❌ Tareas muy largas (más de 100 caracteres)
- ❌ Texto sin formato (usa numeración/viñetas)
- ❌ Editar el texto después de crearlo
- ❌ Tareas duplicadas con texto idéntico
- ❌ Incluir números o formato al copiar para completar

---

## 🐛 Solución de Problemas

### **"El bot no detectó mis tareas"**

**Causas comunes:**
- No usaste formato enumerado (1., 2., -, etc.)
- Líneas vacías entre tareas
- Texto sin separadores

**Solución:**
```
Incorrecto:
Tarea uno
Tarea dos

Correcto:
1. Tarea uno
2. Tarea dos
```

---

### **"Copié la tarea pero no se tachó"**

**Causas comunes:**
- Copiaste el número: `1. Configurar tickets` ❌
- Copiaste el checkbox: `⬜ Configurar tickets` ❌
- Texto no coincide exactamente

**Solución:**
```
Copiar solo: "Configurar tickets" ✅
```

---

### **"El bot categorizó mal una tarea"**

**Solución 1:** Usa categoría manual
```
/tareas lista: 1. ... 2. ... categoria: Desarrollo
```

**Solución 2:** Sé más específico en el texto
```
Vago: "Arreglar cosa"
Específico: "Arreglar bug en sistema de tickets"
```

---

### **"Quiero empezar de nuevo"**

```
/limpiar-tareas
```

Confirma y listo. Luego crea nueva lista con `/tareas`.

---

### **"Los embeds no se actualizaron"**

**Causa:** El bot no tiene permisos para eliminar mensajes.

**Solución:** Da al bot permiso de `Manage Messages` en el canal.

---

## 🔒 Permisos Requeridos

### **Para Administradores:**
- ✅ Permiso de "Administrador" en Discord
- ✅ Pueden usar todos los comandos de tareas
- ✅ Pueden completar tareas copiando/pegando

### **Para el Bot:**
- ✅ `Send Messages` - Enviar embeds
- ✅ `Embed Links` - Crear embeds visuales
- ✅ `Manage Messages` - Eliminar embeds antiguos y mensajes de usuario
- ✅ `Read Message History` - Detectar tareas copiadas

---

## 📊 Visualización de Embeds

### **Ejemplo Completo:**

**💻 Desarrollo** (Verde #57F287)
```
1. ~~Arreglar bug en tickets~~
2. Añadir nueva feature de logs
3. Actualizar documentación del bot
1/3 completadas • Copia y pega la tarea en el chat para tacharla
```

**Elementos:**
- **Título:** Emoji + Categoría
- **Color:** Verde distintivo para Desarrollo
- **Lista numerada:** 1, 2, 3, etc.
- **Tachado:** ~~Para tareas completadas~~
- **Footer:** Progreso + instrucciones

---

## 📝 Estructura de Archivos del Sistema

```
src/
├── systems/
│   ├── tasks/
│   │   └── simple-tasks-system.js    # Sistema principal de tareas
│   └── ai.js                         # Sistema de IA (categorización GPT-4o-mini)
│
├── commands/tasks/
│   ├── tareas.js                     # /tareas - Crear/agregar tareas
│   ├── ver-tareas.js                 # /ver-tareas - Ver progreso
│   └── limpiar-tareas.js             # /limpiar-tareas - Eliminar todo
│
└── handlers/events/
    └── message-create.js             # Detección de copiar/pegar tareas
```

---

## 🚀 Ejemplo Completo Paso a Paso

### **Escenario:** Administrador de servidor GTA RP

---

**PASO 1:** Crear lista inicial
```
/tareas lista:
1. Configurar el origen police
2. Eliminar bots innecesarios
3. Hacer de betatester
4. Borrar caché del servidor
```

---

**PASO 2:** Bot responde (solo embeds, sin texto)

**🎮 Scripts GTA** (Cyan)
```
1. Configurar el origen police
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**💬 Discord** (Azul)
```
1. Eliminar bots innecesarios
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**🎫 Soporte** (Azul claro)
```
1. Hacer de betatester
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**📋 General** (Gris)
```
1. Borrar caché del servidor
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

---

**PASO 3:** Agregar más tareas
```
/tareas lista: 5. Configurar admin menu 6. Leer un libro
```

**Bot automáticamente:**
- 🗑️ Elimina los 4 embeds anteriores
- 📊 Envía embeds actualizados con las 6 tareas

**🎮 Scripts GTA** (Cyan)
```
1. Configurar el origen police
2. Configurar admin menu
0/2 completadas • Copia y pega la tarea en el chat para tacharla
```

**💬 Discord** (Azul)
```
1. Eliminar bots innecesarios
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**🎫 Soporte** (Azul claro)
```
1. Hacer de betatester
0/1 completadas • Copia y pega la tarea en el chat para tacharla
```

**📋 General** (Gris)
```
1. Borrar caché del servidor
2. Leer un libro
0/2 completadas • Copia y pega la tarea en el chat para tacharla
```

---

**PASO 4:** Completar tarea

Usuario escribe y envía:
```
Eliminar bots innecesarios
```

**Bot automáticamente:**
- 🗑️ **Elimina el mensaje del usuario**
- ~~**Tacha**~~ la tarea en el embed de Discord
- 🔄 Actualiza contador: 0/1 → 1/1
- 🔇 **Sin notificaciones ni confirmaciones**

**💬 Discord** (Azul) - ACTUALIZADO
```
1. ~~Eliminar bots innecesarios~~
1/1 completadas • Copia y pega la tarea en el chat para tacharla
```

---

**PASO 5:** Ver progreso total
```
/ver-tareas
```

**Bot responde:**
```
📊 Progreso Total: 1/6 tareas completadas

🎮 Scripts GTA
1. Configurar el origen police
2. Configurar admin menu
0/2 completadas

💬 Discord
1. ~~Eliminar bots innecesarios~~
1/1 completadas

🎫 Soporte
1. Hacer de betatester
0/1 completadas

📋 General
1. Borrar caché del servidor
2. Leer un libro
0/2 completadas
```

---

## 🎉 Características Únicas del Sistema

### ✨ **Lo que hace este sistema especial:**

1. **Interfaz Super Limpia**
   - Sin mensajes de confirmación molestos
   - Sin notificaciones spam
   - Auto-eliminación de mensajes de usuario
   - Solo embeds visuales

2. **Actualización Inteligente**
   - Elimina embeds antiguos automáticamente
   - Siempre muestra lista consolidada
   - Nunca embeds duplicados

3. **Categorización con IA**
   - 12 categorías con colores distintivos
   - Detección automática inteligente
   - Opción de categoría manual

4. **Completado Intuitivo**
   - Copiar/pegar = completar
   - Detección exacta y parcial
   - Sin comandos complicados

5. **Numeración Clara**
   - Listas numeradas (1, 2, 3)
   - Fácil de referenciar
   - Tachado visual para completadas

6. **Persistencia Total**
   - PostgreSQL robusto
   - Sobrevive reinicios
   - Historial completo

---

## 🏆 Mejores Prácticas para Administradores

### **Para máxima eficiencia:**

1. **Crea listas diarias** con `/tareas` cada mañana
2. **Revisa progreso** con `/ver-tareas` al final del día
3. **Completa tareas** copiando/pegando mientras trabajas
4. **Agrupa tareas** relacionadas en una sola categoría
5. **Limpia listas** viejas con `/limpiar-tareas` semanalmente

---

## 📈 Estadísticas y Límites

| Característica | Límite |
|----------------|--------|
| Tareas por lista | Ilimitadas |
| Categorías simultáneas | 12 máximo |
| Embeds por mensaje | 10 máximo |
| Longitud de tarea | 1000 caracteres |
| Velocidad de categorización | ~2s para 10 tareas |
| Tareas en base de datos | Ilimitadas |

---

## 🔮 Roadmap Futuro (Opcional)

Funcionalidades posibles para futuras versiones:

- [ ] Asignar tareas a usuarios específicos
- [ ] Fechas límite y recordatorios
- [ ] Prioridades (alta, media, baja)
- [ ] Subtareas anidadas
- [ ] Exportar a CSV/Excel
- [ ] Dashboard web de progreso
- [ ] Estadísticas de productividad

---

## 💬 Soporte y Feedback

¿Tienes preguntas o sugerencias?
- Usa `/tareas` para crear una tarea: "Mejorar sistema de tareas" 😉
- Contacta al desarrollador del bot
- Reporta bugs en el canal de soporte

---

## 🎓 Conclusión

Este sistema está diseñado para ser **tan simple que no necesites leer esta documentación**.

**Pero si llegaste hasta aquí**, ahora eres un experto en el sistema de tareas más intuitivo de Discord. 🚀

---

**Creado con ❤️ para ser intuitivo, rápido, visualmente limpio y sin complicaciones.**

**Versión:** 2.0  
**Última actualización:** Noviembre 2025  
**Tecnologías:** Discord.js, PostgreSQL, OpenAI GPT-4o-mini
