# 🔐 Configuración de Permisos - Comandos Personalizados

## 📋 Descripción General

El sistema de comandos personalizados permite configurar qué usuarios pueden crear, editar y eliminar comandos mediante un rol específico de staff.

---

## ⚙️ Configuración en config.json

### Ubicación
Busca la sección `customCommands` en tu archivo `config.json`:

```json
"customCommands": {
  "staffRoleId": ""
}
```

### Opciones de Configuración

#### Opción 1: Usar un Rol Específico (Recomendado)

Si quieres que solo un rol específico pueda gestionar comandos personalizados:

```json
"customCommands": {
  "staffRoleId": "1234567890123456789"
}
```

**¿Cómo obtener el ID del rol?**
1. En Discord, ve a **Configuración del Servidor** → **Roles**
2. Activa el **Modo Desarrollador** en Discord (Configuración de Usuario → Avanzado → Modo Desarrollador)
3. Haz clic derecho en el rol que deseas → **Copiar ID del rol**
4. Pega ese ID en `staffRoleId`

**Ejemplo:**
```json
"customCommands": {
  "staffRoleId": "1425955479737077760"
}
```

Ahora solo los usuarios con ese rol podrán usar `/crear-comando`.

#### Opción 2: Usar el Permiso de Discord (Por Defecto)

Si dejas el campo vacío, se usará el permiso de Discord "Gestionar Mensajes":

```json
"customCommands": {
  "staffRoleId": ""
}
```

Cualquier usuario con el permiso **Gestionar Mensajes** podrá usar `/crear-comando`.

---

## 🎯 Comandos Afectados

Todos los subcomandos de `/crear-comando` verifican permisos:

- `/crear-comando nuevo` - Crear nuevo comando
- `/crear-comando editar` - Editar comando existente
- `/crear-comando eliminar` - Eliminar comando
- `/crear-comando listar` - Ver todos los comandos
- `/crear-comando toggle` - Activar/desactivar comando

---

## ✅ Verificación de Permisos

### ¿Cómo funciona?

1. **Si hay un rol configurado**:
   - El bot verifica si el usuario tiene ese rol específico
   - Solo usuarios con ese rol pueden gestionar comandos
   - No importa si tienen otros permisos de administrador

2. **Si NO hay rol configurado** (campo vacío):
   - El bot verifica el permiso "Gestionar Mensajes"
   - Cualquier usuario con ese permiso puede gestionar comandos

### Mensajes de Error

Si un usuario sin permisos intenta usar el comando, verá:

**Con rol configurado:**
```
❌ No tienes permisos para gestionar comandos personalizados. 
Se requiere el rol de staff configurado.
```

**Sin rol configurado (usando permiso):**
```
❌ No tienes permisos para gestionar comandos personalizados. 
Se requiere el permiso de Gestionar Mensajes.
```

---

## 📝 Ejemplos de Configuración

### Ejemplo 1: Solo Staff Senior

```json
"customCommands": {
  "staffRoleId": "1234567890123456789"
}
```
Solo usuarios con el rol "Staff Senior" pueden gestionar comandos.

### Ejemplo 2: Solo Administradores

```json
"customCommands": {
  "staffRoleId": "9876543210987654321"
}
```
Solo usuarios con el rol "Administrador" pueden gestionar comandos.

### Ejemplo 3: Cualquiera con Gestionar Mensajes

```json
"customCommands": {
  "staffRoleId": ""
}
```
Cualquier usuario con el permiso de Discord "Gestionar Mensajes" puede gestionar comandos.

---

## 🔄 Aplicar Cambios

1. Edita el archivo `config.json`
2. Guarda los cambios
3. **Reinicia el bot**
4. Los cambios se aplicarán automáticamente

**Nota:** No necesitas volver a registrar los comandos slash, el cambio es automático.

---

## 🛡️ Recomendaciones de Seguridad

### ✅ Mejores Prácticas

1. **Usa un rol específico** en lugar del permiso general
   - Mayor control sobre quién puede crear comandos
   - Fácil de gestionar añadiendo/quitando usuarios del rol

2. **Crea un rol dedicado**
   - Ejemplo: "Gestor de Comandos"
   - Solo para usuarios de confianza

3. **No uses roles de administrador total**
   - Evita dar acceso innecesario
   - Principio de mínimo privilegio

### ⚠️ Evitar

1. No dejes el rol como `"@everyone"`
2. No uses roles que todos tengan
3. No compartas el ID del rol en chats públicos

---

## 🧪 Probar la Configuración

1. Configura el `staffRoleId` con un rol de prueba
2. Asigna ese rol a un usuario de prueba
3. Intenta usar `/crear-comando nuevo` con ese usuario
4. Debería funcionar correctamente
5. Quita el rol y vuelve a intentar
6. Debería mostrar mensaje de error

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo configurar múltiples roles?**
R: Por ahora solo se admite un rol. Si necesitas múltiples roles, usa un rol "paraguas" que agrupe a todos.

**P: ¿Los administradores del servidor pueden usar el comando sin el rol?**
R: No, el sistema verifica específicamente el rol configurado. Si quieres que los admins puedan usarlo, añádelos al rol.

**P: ¿Qué pasa si elimino el rol del servidor?**
R: El bot mostrará error. Actualiza `staffRoleId` con un nuevo rol válido o déjalo vacío.

**P: ¿Los cambios requieren reiniciar el bot?**
R: Sí, después de editar `config.json` debes reiniciar el bot para que los cambios surtan efecto.

**P: ¿Puedo usar un rol de otro servidor?**
R: No, solo funcionan roles del mismo servidor donde está el bot.

---

## 🆘 Solución de Problemas

### Problema: "No tengo permisos" pero tengo el rol

**Solución:**
1. Verifica que el ID del rol en `config.json` sea correcto
2. Reinicia el bot después de cambiar la configuración
3. Verifica que realmente tienes el rol asignado en el servidor

### Problema: El comando no aparece

**Solución:**
1. El comando `/crear-comando` está disponible para todos (se puede ver)
2. Los permisos se verifican al ejecutarlo, no al mostrarlo
3. Si no aparece, verifica que el bot esté online y los comandos registrados

### Problema: Nadie puede usar el comando

**Solución:**
1. Verifica que `staffRoleId` tenga un ID válido
2. Asegúrate de que usuarios tengan ese rol asignado
3. Si está vacío, verifica que tengan el permiso "Gestionar Mensajes"

---

**Última actualización**: 6 de noviembre de 2025
**Versión**: 1.0.0
