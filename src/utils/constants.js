const path = require('path');

// Archivos de datos
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const TICKET_DATA_FILE = path.join(DATA_DIR, 'ticket-data.json');
const VOICE_SUPPORT_FILE = path.join(DATA_DIR, 'voice-support-data.json');
const HEARTBEAT_FILE = path.join(DATA_DIR, 'bot-heartbeat.json');

// Configuración de tickets
const TICKET_CATEGORIES = [
    { value: 'soporte-tecnico', label: 'Soporte Técnico', emoji: '🛠️' },
    { value: 'consulta-general', label: 'Consulta General', emoji: '❓' },
    { value: 'reporte-bug', label: 'Reporte de Bug', emoji: '🐛' },
    { value: 'sugerencia', label: 'Sugerencia', emoji: '💡' },
    { value: 'queja', label: 'Queja', emoji: '😠' },
    { value: 'moderacion', label: 'Moderación', emoji: '🛡️' },
    { value: 'partnership', label: 'Partnership', emoji: '🤝' },
    { value: 'donacion', label: 'Donación', emoji: '💰' },
    { value: 'otro', label: 'Otro', emoji: '📝' },
    { value: 'apelacion', label: 'Apelación', emoji: '⚖️' },
    { value: 'staff', label: 'Aplicación Staff', emoji: '👔' },
    { value: 'dudas-evento', label: 'Dudas sobre Evento', emoji: '🎉' },
    { value: 'problema-rol', label: 'Problema con Rol', emoji: '🎭' }
];

module.exports = {
    DATA_DIR,
    TICKET_DATA_FILE,
    VOICE_SUPPORT_FILE,
    HEARTBEAT_FILE,
    TICKET_CATEGORIES
};
