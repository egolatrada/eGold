// Handler para autocomplete
const logger = require('../../../utils/logger');
const { config } = require('../../../config');

async function handleAutocomplete(interaction, context) {
    const commandName = interaction.commandName;
    
    try {
        // Autocomplete para crear-ticket
        if (commandName === 'crear-ticket') {
            const focusedValue = interaction.options.getFocused().toLowerCase();
            const categoriesObj = config.tickets?.categories || {};
            
            // Convertir el objeto de categorías en un array de opciones
            const categoriesArray = Object.entries(categoriesObj).map(([key, cat]) => ({
                label: cat.name,
                value: key,
                emoji: cat.emoji || '🎫'
            }));
            
            const filtered = categoriesArray
                .filter(cat => cat.label.toLowerCase().includes(focusedValue) || cat.value.toLowerCase().includes(focusedValue))
                .slice(0, 25)
                .map(cat => ({
                    name: `${cat.emoji} ${cat.label}`,
                    value: cat.value
                }));
            
            await interaction.respond(filtered);
        }
        // Autocomplete para comandos personalizados
        else if (commandName === 'crear-comando') {
            await context.customCommandsSystem.handleAutocomplete(interaction);
        }
        // Autocomplete para eliminar-streamer
        else if (commandName === 'eliminar-streamer') {
            const focusedValue = interaction.options.getFocused().toLowerCase();
            const userId = interaction.options.getUser('discord')?.id;
            
            if (!userId || !context.socialLinksSystem) {
                await interaction.respond([]);
                return;
            }
            
            const userLinks = context.socialLinksSystem.getUserLinks(userId);
            
            if (userLinks.length === 0) {
                await interaction.respond([{
                    name: 'No hay streamers configurados para este usuario',
                    value: 'none'
                }]);
                return;
            }
            
            const platformEmojis = {
                twitch: '🎮',
                kick: '⚡',
                youtube: '📺'
            };
            
            const filtered = userLinks
                .filter(link => 
                    link.username.toLowerCase().includes(focusedValue) ||
                    link.platform.toLowerCase().includes(focusedValue)
                )
                .slice(0, 25)
                .map(link => ({
                    name: `${platformEmojis[link.platform]} ${link.platform.toUpperCase()} - ${link.username}`,
                    value: link.linkId
                }));
            
            await interaction.respond(filtered.length > 0 ? filtered : [{
                name: 'No se encontraron resultados',
                value: 'none'
            }]);
        }
        else {
            logger.warn(`Autocomplete no manejado para comando: ${commandName}`);
        }
    } catch (error) {
        logger.error(`Error en autocomplete para ${commandName}`, error);
    }
}

module.exports = { handleAutocomplete };
