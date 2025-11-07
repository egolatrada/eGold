# 🔐 Bot de Verificación para Discord

Bot simple y editable para verificar usuarios en tu servidor de Discord.

## 📋 Características

- ✅ Asigna automáticamente rol "No Verificado" cuando alguien entra al servidor
- ✅ Embed con botón de verificación en canal específico
- ✅ Al verificarse, cambia el rol a "Whitelisted/Verificado"
- ✅ Completamente configurable mediante `config.json`
- ✅ Solo visible para usuarios no verificados

## 🛠️ Configuración

### 1. Instalar dependencias
```bash
cd verification-bot
npm install
```

### 2. Configurar el bot

Tienes **2 opciones** para crear el mensaje de verificación:

#### **Opción A: Usar tu propio embed (RECOMENDADO)**
1. Crea el embed manualmente usando el comando `/panel-embed` del bot principal
2. Copia el ID del mensaje (clic derecho → Copiar ID del mensaje)
3. Edita `config.json` y pega el ID en `existingMessageId`:

```json
{
  "existingMessageId": "1234567890123456789",
  "channels": {
    "verification": "ID_CANAL_VERIFICACION"
  }
}
```

El bot **añadirá automáticamente el botón** a tu embed existente.

#### **Opción B: Dejar que el bot cree el embed**
Si prefieres que el bot cree el embed automáticamente, deja `existingMessageId` como está:

```json
{
  "existingMessageId": "ID_DEL_MENSAJE_AQUI",
}

```json
{
  "botToken": "TU_TOKEN_DEL_BOT_AQUI",
  "guildId": "1268867413814939680",
  
  "roles": {
    "unverified": "ID_ROL_NO_VERIFICADO",
    "verified": "ID_ROL_WHITELISTED"
  },
  
  "channels": {
    "verification": "ID_CANAL_VERIFICACION"
  }
}
```

**Cómo obtener los IDs:**
1. Activa el "Modo desarrollador" en Discord (Configuración → Avanzado → Modo desarrollador)
2. Clic derecho en el rol/canal → "Copiar ID"

### 3. Configurar permisos del bot

El bot necesita estos permisos en Discord:
- ✅ Gestionar roles
- ✅ Ver canales
- ✅ Enviar mensajes
- ✅ Insertar enlaces

**Enlace de invitación:**
```
https://discord.com/api/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=268435456&scope=bot
```

### 4. Configurar permisos del canal

En el **canal de verificación**:
- ✅ Rol "No Verificado": Puede ver y leer
- ❌ Rol "Whitelisted": No puede ver
- ✅ @everyone: No puede ver

### 5. Ejecutar el bot

```bash
npm start
```

## 📝 Personalización

Todos los mensajes son editables en `config.json`:

```json
"messages": {
  "embedTitle": "🔐 Verificación del Servidor",
  "embedDescription": "Tu descripción personalizada...",
  "embedColor": "#5865F2",
  "buttonLabel": "✅ Verificarme",
  "verifiedMessage": "¡Has sido verificado!",
  "alreadyVerifiedMessage": "Ya estás verificado.",
  "errorMessage": "Error al verificarte..."
}
```

## 🎯 Flujo de Verificación

1. Usuario entra al servidor → Recibe rol "No Verificado"
2. Usuario solo ve el canal de verificación
3. Usuario hace clic en "✅ Verificarme"
4. Bot quita rol "No Verificado" y añade "Whitelisted"
5. Usuario ahora puede ver todos los canales configurados para "Whitelisted"

## ⚠️ Notas Importantes

- El bot debe estar **por encima** de los roles que gestiona en la jerarquía del servidor
- Asegúrate de configurar correctamente los permisos del canal de verificación
- El mensaje de verificación se crea automáticamente al iniciar el bot
