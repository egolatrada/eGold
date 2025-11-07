const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../utils/constants');

// Asegurar que el directorio de datos existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Lee datos JSON de un archivo
 */
function readJSON(filename) {
    try {
        const filepath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filepath)) {
            const data = fs.readFileSync(filepath, 'utf-8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error(`⚠️ Error al leer ${filename}:`, error);
        return null;
    }
}

/**
 * Escribe datos JSON a un archivo
 */
function writeJSON(filename, data) {
    try {
        const filepath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`❌ Error al escribir ${filename}:`, error);
        return false;
    }
}

/**
 * Lee datos desde la raíz del proyecto (para archivos legacy)
 */
function readJSONLegacy(filepath) {
    try {
        if (fs.existsSync(filepath)) {
            const data = fs.readFileSync(filepath, 'utf-8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error(`⚠️ Error al leer ${filepath}:`, error);
        return null;
    }
}

/**
 * Escribe datos en la raíz del proyecto (para archivos legacy)
 */
function writeJSONLegacy(filepath, data) {
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`❌ Error al escribir ${filepath}:`, error);
        return false;
    }
}

module.exports = {
    readJSON,
    writeJSON,
    readJSONLegacy,
    writeJSONLegacy
};
