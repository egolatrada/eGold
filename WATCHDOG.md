# 🛡️ Sistema de Monitoreo y Auto-Restart

Este bot incluye múltiples sistemas de protección para garantizar disponibilidad 24/7.

## 🔧 Comandos de Administración

### `/restart`
**Solo Administradores**

Reinicia el bot manualmente. Útil después de cambios de configuración o si detectas problemas.

```
/restart
```

El bot se reiniciará automáticamente en 3 segundos.

---

### `/status`
**Solo Administradores**

Muestra el estado completo de salud del bot:

```
/status
```

**Información mostrada:**
- ⏱️ Tiempo activo
- 📡 Latencia (ping)
- 💾 Uso de memoria
- 🎮 Número de servidores
- 👥 Total de usuarios
- ⚡ Comandos ejecutados
- ❌ Errores registrados
- 🔄 Número de reinicios
- 📅 Último health check
- ⚠️ Último error (si existe)

**Estados de salud:**
- 🟢 **Saludable**: Menos de 10 errores
- 🟡 **Advertencia**: Entre 10-50 errores
- 🔴 **Crítico**: Más de 50 errores

---

## 🔄 Sistema de Auto-Restart Interno

El bot incluye protección automática contra fallos:

### ✅ Características:
1. **Health Check cada 5 minutos** - Monitorea ping y uso de memoria
2. **Manejo de errores automático** - Captura errores no manejados
3. **Reinicio inteligente** - Se reinicia automáticamente en caso de error crítico
4. **Tolerancia a errores de red** - Ignora errores temporales de conexión
5. **Límite de errores** - Se reinicia si detecta más de 100 errores

### ⚠️ Alertas automáticas:
- Ping > 1000ms
- Memoria > 400MB
- Errores críticos

---

## 👁️ Watchdog Externo (Opcional)

Para máxima resiliencia, puedes usar el script `watchdog.js`:

### ¿Qué hace?
- Monitorea el proceso del bot desde fuera
- Reinicia automáticamente si el bot se detiene
- Previene loops de reinicio infinitos
- Registra todos los eventos

### Configuración de seguridad:
- **Máximo 5 reinicios por hora** - Previene loops
- **Cooldown de 12 minutos** - Entre reinicios
- **Detección de 3 fallos consecutivos** - Alerta crítica

### ¿Cómo usar?

#### Opción 1: Comando directo
```bash
npm run watchdog
```

#### Opción 2: Cambiar workflow de Replit
En lugar de ejecutar `node index.js`, ejecuta:
```bash
node watchdog.js
```

El watchdog iniciará y monitoreará el bot automáticamente.

---

## 📊 VM Deployment (Replit)

Tu bot ya está configurado con **Reserved VM Deployment**:

- ✅ **99.9% uptime** garantizado
- ✅ **Auto-restart** en caso de crash del contenedor
- ✅ **Recursos dedicados**: 0.5 vCPU, 2GB RAM
- ✅ **Siempre activo** - No se duerme

### ¿Qué hace Replit automáticamente?
1. Reinicia el contenedor si el proceso se detiene
2. Mantiene el bot corriendo 24/7
3. Monitorea la salud de la VM

---

## 🎯 Recomendaciones

### Para uso normal:
✅ **Usa el workflow actual** (`node index.js`)
- VM Deployment + protección interna es suficiente
- Más simple y directo

### Para máxima resiliencia:
✅ **Usa el watchdog** (`npm run watchdog`)
- Protección adicional contra fallos
- Útil si el bot es crítico para tu servidor
- Monitoreo más detallado

---

## 🔍 Monitoreo Manual

### Ver logs en tiempo real:
Replit muestra los logs automáticamente en la consola.

### Health checks automáticos:
El bot imprime cada 5 minutos:
```
💚 Health Check: Ping=50ms, Memoria=85MB, Errores=0
```

### Verificar estado:
Usa `/status` en Discord para ver el estado completo.

---

## ⚡ Solución de Problemas

### El bot no responde:
1. Ejecuta `/status` - ¿Responde?
2. Si no responde, usa `/restart`
3. Revisa los logs en Replit
4. Si sigue sin funcionar, reinicia manualmente el workflow

### Muchos errores detectados:
1. Revisa `/status` para ver el último error
2. Si es un error de API, verifica las credenciales
3. Si es error de conexión, espera - se recuperará solo
4. Si es error de código, revisa los logs

### El bot se reinicia constantemente:
1. Si usas watchdog, revisa los logs - puede tener límite
2. Verifica que no haya errores de configuración
3. Usa `/status` para ver errores recurrentes
4. Si es crítico, el watchdog se detendrá automáticamente

---

## 📝 Notas Importantes

- Los comandos `/restart` y `/status` solo funcionan para administradores
- El health check interno corre cada 5 minutos
- El watchdog externo es opcional pero recomendado para producción
- VM Deployment ya ofrece alta disponibilidad por defecto
- Todos los reinicios son logged para debugging

---

**Con estos 3 sistemas combinados (VM Deployment + Auto-Restart Interno + Watchdog Opcional), tu bot tiene máxima protección contra fallos** 🛡️
