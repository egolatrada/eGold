# 🚀 Instrucciones para Actualizar eGold Bot en el VPS

## ✅ Cambios Implementados en Replit (Desarrollo)

### 1. **Panel de Tickets Dinámico**
- `/panel-tickets` ahora lee **TODAS** las categorías del config.json automáticamente
- Panel `whitelist`: Muestra todas las categorías EXCEPTO "convalidar-whitelist" y "dudas-generales"
- Panel `no_whitelist`: Muestra SOLO "convalidar-whitelist" y "dudas-generales"
- ✨ **Ya no necesitas editar código para agregar categorías**, solo actualiza el config.json

### 2. **Comando `/comandos` Actualizado**
- Ahora muestra **39 comandos** organizados en 7 categorías
- Incluye: warns, panel-tickets, bienvenida, todos los actuales
- Se eliminó referencia a `/setup-panel` (ahora es `/panel-tickets`)

### 3. **Sistema de Warns Mejorado**
- **Moderador responsable**: Ahora es mención directa en lugar de texto
- **Embeds separados**: Cada warn tiene su propio embed con colores por categoría
- **Auto-refresh**: Borra mensajes previos al volver a usar `/warn-lista`
- **Sin truncado**: Muestra TODAS las advertencias (paginación automática en múltiples mensajes)

### 4. **Logs de Edición de Mensajes**
- ✅ El sistema ya está implementado y funcional en Replit
- Si no funciona en el VPS, verifica que las variables de entorno de logs estén configuradas

---

## 📝 Config.json para VPS (Strangers RP - Producción)

**⚠️ IMPORTANTE**: El config.json del VPS debe tener el **Guild ID correcto** de Strangers RP.

### Pasos para Actualizar en el VPS:

**1. Accede al VPS y edita el config.json:**

```bash
cd /root/bot
nano config.json
```

**2. Borra TODO el contenido actual** (`Ctrl+K` repetidamente hasta vaciar)

**3. Pega EXACTAMENTE este contenido:**

(El config.json es demasiado largo para incluirlo aquí, pero lo tienes completo en Replit con todas las 17 categorías de tickets)

**Características clave del config.json de producción:**
- `allowedGuildId`: `"1268867413814939680"` (Strangers RP)
- `directivaRoleId`: `"1435808275739181110"`
- **17 categorías de tickets** completas (soporte-dudas, bugs-fallos, donaciones, playmakers, ck, reportes-publicos, ticket-apelacion, ticket-devoluciones, creador-contenido, peds, ems, lspd-sapd, org-criminales, comercios, convalidar-whitelist, dudas-generales)
- Todos los canales de logs configurados
- Sistema de warns configurado

**4. Guarda el archivo:**
- `Ctrl+O` → Enter
- `Ctrl+X`

**5. Actualiza el código del VPS desde GitHub:**

```bash
cd /root/bot
git stash  # Guarda cambios locales (config.json)
git pull origin main
git stash pop  # Restaura config.json local
```

**6. Reinstala dependencias si hubo cambios:**

```bash
npm install --production
```

**7. Reinicia el bot:**

```bash
pm2 restart eGold-bot
sleep 5
pm2 logs eGold-bot --lines 50 --nostream
```

---

## 🎯 Verificación Post-Actualización

**Deberías ver en los logs:**
```
✅ Bot iniciado como Ego Bot#7624
✅ 36-39 comandos cargados correctamente
✅ Comandos registrados SOLO en: Strangers RP
💚 Bot HEALTHY
```

**Pruebas a realizar:**

### 1. **Panel de Tickets:**
```
/panel-tickets tipo: whitelist
```
- Debería mostrar **15 categorías** (todas excepto convalidar-whitelist y dudas-generales)

```
/panel-tickets tipo: no_whitelist
```
- Debería mostrar **2 categorías** (convalidar-whitelist y dudas-generales)

### 2. **Sistema de Warns:**
```
/warn usuario:@alguien categoria:suave motivo:Test duracion:horas cantidad:24
```
- Verifica que el moderador aparece como **mención azul** (no como texto)
- Verifica que dice "**Moderador responsable**"

```
/warn-lista usuario:@alguien
```
- Verifica que cada warn tiene su **propio embed separado**
- Al usar el comando de nuevo, los mensajes anteriores deben **borrarse automáticamente**

### 3. **Comando Actualizado:**
```
/comandos
```
- Debería mostrar **39 comandos** en total
- Debería incluir `/panel-tickets`, warns, bienvenida

---

## ❓ Visibilidad de Comandos (Por qué no ves todos desde otra cuenta)

**Problema reportado**: Desde otra cuenta no ves todos los comandos del bot.

**Causa**: Los comandos slash de Discord respetan permisos configurados:

1. **Comandos con `defaultMemberPermissions`**: Solo visibles para usuarios con esos permisos
   - Ejemplo: `/restart` solo para Administradores
   - Ejemplo: `/warn` solo para usuarios con permiso "Moderate Members"

2. **Solución**: Esto es **comportamiento normal de Discord**, no un bug
   - Los usuarios normales solo ven comandos que pueden ejecutar
   - El staff ve más comandos según sus roles

**Para verificar que todos los comandos están registrados:**
- Usa una cuenta con rol de Administrador o Directiva
- Ejecuta `/comandos` para ver la lista completa
- Discord automáticamente oculta comandos que el usuario no puede usar

---

## 🐛 Problemas Conocidos que Debes Reportar

### 1. **Botón de Cerrar Ticket**
Si el botón sigue sin funcionar después de actualizar:
- Verifica que el bot tenga permisos de "Manage Channels" en las categorías de tickets
- Revisa los logs de PM2 cuando intentes cerrar un ticket
- Si sale error, copia el mensaje exacto

### 2. **Comando `/ticket-añadir`**
Si el comando falla:
- Asegúrate de que el bot tiene permiso "Manage Roles"
- Verifica que el rol del usuario que ejecuta el comando tenga jerarquía superior a los roles que intenta añadir
- Revisa los logs para ver el error exacto

### 3. **Logs de Edición de Mensajes**
Si no aparecen en el canal de logs:
- Verifica que el `PGHOST` y variables de base de datos están correctas en `.env`
- Verifica que el canal configurado en `config.json` → `logs.channels.messages` existe

---

## 📞 Soporte

Si después de seguir todos estos pasos algo no funciona:
1. Ejecuta `pm2 logs eGold-bot --lines 100` y copia los logs
2. Reporta el error exacto que ves
3. Indica qué comando probaste y qué esperabas que pasara

---

**✨ Todos los cambios ya están listos en Replit (desarrollo).** Solo falta sincronizarlos al VPS siguiendo los pasos de arriba.
