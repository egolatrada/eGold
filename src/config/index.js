const fs = require('fs');
const path = require('path');

// Rutas de configuración
const configPath = path.join(process.cwd(), 'config.json');
const messagesPath = path.join(process.cwd(), 'messages.json');
const exampleConfigPath = path.join(process.cwd(), 'config.example.json');

// Función para cargar configuración con fallbacks
function loadConfig() {
    if (!fs.existsSync(configPath)) {
        console.error('❌ ERROR: config.json no encontrado');
        if (fs.existsSync(exampleConfigPath)) {
            console.log('💡 Pista: Copia config.example.json a config.json y configúralo');
        }
        process.exit(1);
    }
    return require(configPath);
}

function loadMessages() {
    if (!fs.existsSync(messagesPath)) {
        console.warn('⚠️ Advertencia: messages.json no encontrado, usando configuración mínima');
        return {};
    }
    return require(messagesPath);
}

// Cargar configuración
const config = loadConfig();
const messages = loadMessages();

// Validar configuración crítica
function validateConfig() {
    if (!config.allowedGuildId && !config.guildId) {
        console.warn('⚠️ Advertencia: No se especificó guildId/allowedGuildId en config.json');
    }
    if (!config.channels) {
        console.warn('⚠️ Advertencia: config.channels no está definido');
    }
    console.log('✅ Configuración cargada correctamente');
}

module.exports = {
    config,
    messages,
    validateConfig
};
