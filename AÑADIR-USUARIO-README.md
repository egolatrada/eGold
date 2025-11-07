# 👥 Comando `/añadir-usuario` - Guía Rápida

## 📖 Descripción

El comando `/añadir-usuario` permite al staff añadir usuarios adicionales a tickets específicos, facilitando la colaboración y participación de múltiples personas en la resolución de tickets.

---

## ✨ Características Principales

- ✅ **Solo staff**: Solo miembros con el rol de staff pueden ejecutar el comando
- ✅ **Solo en tickets**: Funciona únicamente dentro de canales de tickets
- ✅ **Permisos automáticos**: Otorga permisos de visualización y escritura al usuario
- ✅ **Logging completo**: Registra todas las acciones en el canal de logs
- ✅ **Validaciones**: Previene duplicados y errores comunes
- ✅ **Feedback visual**: Embed de confirmación verde con información detallada

---

## 🎯 Cómo Usar

### Sintaxis Básica

```
/añadir-usuario usuario:@NombreUsuario
```

### Ejemplo

1. Estás en un ticket: `🎫│ticket-5-usuario123`
2. Necesitas añadir a otro moderador para ayudar
3. Ejecutas: `/añadir-usuario usuario:@ModeradorJuan`
4. El bot:
   - ✅ Verifica que seas staff
   - ✅ Verifica que estés en un ticket
   - ✅ Añade permisos al usuario mencionado
   - ✅ Muestra embed de confirmación
   - ✅ Registra la acción en logs

---

## 🔒 Requisitos y Validaciones

### Permisos Necesarios

- **Ejecutor**: Debe tener el rol de staff configurado en `config.json` (`staffRoleId`)
- **Bot**: Debe tener permiso de "Gestionar Canales" y "Gestionar Permisos"

### Validaciones del Comando

| Validación | Mensaje de Error |
|------------|------------------|
| **No es staff** | ❌ Solo el staff puede añadir usuarios a tickets. |
| **No es canal de ticket** | ❌ Este comando solo funciona en canales de tickets. |
| **Usuario no encontrado** | ❌ No se pudo encontrar al usuario en este servidor. |
| **Usuario ya tiene acceso** | ⚠️ @Usuario ya tiene acceso a este ticket. |

---

## 📋 Casos de Uso

### 1. Colaboración entre Staff

**Escenario:** Un ticket es complejo y requiere dos moderadores

```
Moderador1: /añadir-usuario usuario:@Moderador2
```

**Resultado:** Ambos moderadores pueden ver y responder en el ticket

---

### 2. Incluir Testigos en Reportes

**Escenario:** Un usuario reporta a otro y hay un testigo

```
Staff: /añadir-usuario usuario:@Testigo
```

**Resultado:** El testigo puede ver el ticket y proporcionar su versión

---

### 3. Supervisión de Tickets de Apelación

**Escenario:** Un moderador junior maneja una apelación, pero necesita supervisión

```
ModeradorJunior: /añadir-usuario usuario:@ModeradorSenior
```

**Resultado:** El senior puede supervisar sin tener que crear un nuevo ticket

---

### 4. Soporte Técnico Especializado

**Escenario:** Ticket de bug que requiere un desarrollador

```
Soporte: /añadir-usuario usuario:@Desarrollador
```

**Resultado:** El desarrollador puede investigar el bug directamente en el ticket

---

## 🎨 Respuesta Visual

Cuando el comando se ejecuta exitosamente, el bot envía un embed verde:

```
┌─────────────────────────────────────┐
│ ✅ Usuario Añadido al Ticket        │
├─────────────────────────────────────┤
│ @Usuario ha sido añadido a este     │
│ ticket por @Staff                   │
│                                     │
│ 🕒 6 de noviembre de 2025, 19:30   │
└─────────────────────────────────────┘
```

---

## 📊 Logging

Cada vez que se añade un usuario, se registra en el canal de logs de tickets:

```
┌──────────────────────────────────────┐
│ 👥 Usuario Añadido a Ticket          │
├──────────────────────────────────────┤
│ Ticket: #ticket-5-usuario123         │
│ Usuario Añadido: @Usuario (Tag)     │
│ Añadido por: @Staff (Tag)            │
│ Canal ID: 1234567890123456789        │
│                                      │
│ 🕒 6 de noviembre de 2025, 19:30    │
└──────────────────────────────────────┘
```

---

## 🔧 Permisos Otorgados

Al añadir un usuario al ticket, se le otorgan los siguientes permisos:

- ✅ **Ver Canal** (`ViewChannel`)
- ✅ **Enviar Mensajes** (`SendMessages`)
- ✅ **Leer Historial** (`ReadMessageHistory`)
- ✅ **Adjuntar Archivos** (`AttachFiles`)
- ✅ **Insertar Enlaces** (`EmbedLinks`)

**NOTA:** El usuario NO obtiene permisos de gestión del ticket (cerrar, eliminar, etc.)

---

## ⚙️ Configuración Necesaria

En `config.json`, asegúrate de tener configurado:

```json
{
  "tickets": {
    "staffRoleId": "1234567890123456789",  // ID del rol de staff
    "categories": {
      // ... configuración de categorías
    }
  },
  "logs": {
    "enabled": true,
    "channels": {
      "tickets": "1234567890123456789"  // Canal de logs de tickets
    }
  }
}
```

---

## 🔍 Identificación de Tickets

El comando identifica canales de tickets de dos formas:

1. **Nombre del canal contiene**: `ticket-`
2. **Formato típico**: `🎫│ticket-[número]-[usuario]`

**Ejemplos válidos:**
- ✅ `ticket-5-usuario123`
- ✅ `🎫│ticket-10-juan`
- ✅ `ticket-support-user456`

**Ejemplos inválidos:**
- ❌ `soporte-general`
- ❌ `chat-staff`
- ❌ `admin-meeting`

---

## 💡 Tips y Mejores Prácticas

### ✅ Recomendado

- Añade usuarios solo cuando sea necesario para mantener la privacidad del ticket
- Informa al usuario añadido sobre su rol en el ticket
- Usa el comando antes de mencionar al usuario para evitar que vea mensajes anteriores sin contexto

### ❌ Evitar

- No añadas usuarios a tickets sensibles sin permiso del creador del ticket
- No añadas múltiples usuarios innecesarios (mantén los tickets privados)
- No uses este comando como sustituto de canales de discusión general del staff

---

## 🆘 Solución de Problemas

### Problema: "Solo el staff puede añadir usuarios a tickets"

**Causa:** No tienes el rol de staff configurado

**Solución:**
1. Contacta un administrador
2. Verifica que tengas el rol configurado en `staffRoleId`
3. Usa `/status` para verificar tu rol

---

### Problema: "Este comando solo funciona en canales de tickets"

**Causa:** Estás ejecutando el comando fuera de un ticket

**Solución:**
1. Ve a un canal de ticket (nombre contiene `ticket-`)
2. Ejecuta el comando desde allí

---

### Problema: "No se pudo encontrar al usuario"

**Causa:** El usuario no está en el servidor o salió

**Solución:**
1. Verifica que el usuario esté en el servidor
2. Intenta mencionar al usuario manualmente para confirmar
3. Si salió del servidor, no podrás añadirlo

---

### Problema: "Ya tiene acceso a este ticket"

**Causa:** El usuario ya fue añadido previamente

**Solución:**
1. El usuario ya puede ver el ticket
2. No es necesario volver a añadirlo
3. Puedes verificar los permisos del canal manualmente

---

## 📚 Comandos Relacionados

- **`/setup-ticket-panel`** - Crea el panel de tickets
- **`/add-ticket-menu`** - Añade menú a mensaje existente

---

## 🔐 Seguridad

- ✅ Solo staff puede ejecutar el comando
- ✅ Registra todas las acciones en logs
- ✅ Previene duplicados automáticamente
- ✅ No permite añadir usuarios fuera de tickets
- ✅ Validación de permisos antes de ejecutar

---

## 📞 Soporte

Si encuentras problemas con este comando:

1. Verifica que el bot tenga permisos de "Gestionar Canales"
2. Revisa que `staffRoleId` esté correctamente configurado en `config.json`
3. Verifica los logs del bot con `/status` (si está disponible)
4. Consulta `BOT-FUNCIONALIDADES-COMPLETAS.md` para más información

---

**Versión:** 1.0.0  
**Fecha:** 6 de noviembre de 2025  
**Estado:** ✅ Producción
