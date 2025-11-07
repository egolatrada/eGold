const fs = require('fs');
const path = require('path');

// Cargar configuración
const config = require(path.join(process.cwd(), 'config.json'));
const messages = require(path.join(process.cwd(), 'messages.json'));

// Validar configuración crítica
function validateConfig() {
    if (!config.allowedGuildId && !config.guildId) {
        console.warn('⚠️ Advertencia: No se especificó guildId/allowedGuildId en config.json');
    }
    if (!config.channels) {
        console.warn('⚠️ Advertencia: config.channels no está definido');
    }
    console.log('✅ Configuración cargada');
}

module.exports = {
    config,
    messages,
    validateConfig
};
