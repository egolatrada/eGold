const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

/**
 * Carga todos los comandos de la carpeta commands
 */
function loadCommands() {
    const commands = new Collection();
    const commandsPath = path.join(__dirname, '..', 'commands');
    
    // Función recursiva para cargar comandos de subdirectorios
    function loadCommandsFromDir(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                loadCommandsFromDir(itemPath);
            } else if (item.endsWith('.js')) {
                try {
                    const command = require(itemPath);
                    if (command.data && command.execute) {
                        commands.set(command.data.name, command);
                        logger.debug(`Comando cargado: ${command.data.name}`);
                    }
                } catch (error) {
                    logger.error(`Error al cargar comando en ${itemPath}`, error);
                }
            }
        }
    }
    
    loadCommandsFromDir(commandsPath);
    logger.success(`${commands.size} comandos cargados correctamente`);
    return commands;
}

/**
 * Registra los comandos en Discord
 */
async function registerCommands(client, guildId) {
    try {
        const commands = loadCommands();
        const commandData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());
        
        if (guildId) {
            // Primero intentar obtener del caché
            let guild = client.guilds.cache.get(guildId);
            
            // Si no está en caché, intentar fetch
            if (!guild) {
                logger.info(`Servidor no encontrado en caché, intentando fetch...`);
                try {
                    guild = await client.guilds.fetch(guildId);
                } catch (error) {
                    logger.error(`No se pudo acceder al servidor ${guildId}. ¿El bot está invitado?`);
                    throw error;
                }
            }
            
            await guild.commands.set(commandData);
            logger.success(`Comandos registrados SOLO en: ${guild.name}`);
        } else {
            // Registrar en todos los servidores
            for (const guild of client.guilds.cache.values()) {
                await guild.commands.set(commandData);
                logger.success(`Comandos registrados en: ${guild.name}`);
            }
        }
        
        return commands;
    } catch (error) {
        logger.error('Error al registrar comandos', error);
        throw error;
    }
}

module.exports = {
    loadCommands,
    registerCommands
};
