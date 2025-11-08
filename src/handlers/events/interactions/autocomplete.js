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
            if (!context.socialLinksSystem) {
                await interaction.respond([]);
                return;
            }

            try {
                const focusedValue = interaction.options.getFocused().toLowerCase();
                let userId;
                
                try {
                    userId = interaction.options.get('discord')?.value;
                } catch (e) {
                    userId = null;
                }
                
                if (!userId) {
                    await interaction.respond([{
                        name: 'Por favor, selecciona primero el usuario de Discord',
                        value: 'select_user_first'
                    }]);
                    return;
                }
                
                const userLinks = context.socialLinksSystem.getUserLinks(userId);
                
                if (userLinks.length === 0) {
                    await interaction.respond([{
                        name: 'Este usuario no tiene streamers configurados',
                        value: 'no_streamers'
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
                
                await interaction.respond(filtered.length > 0 ? filtered : userLinks.slice(0, 25).map(link => ({
                    name: `${platformEmojis[link.platform]} ${link.platform.toUpperCase()} - ${link.username}`,
                    value: link.linkId
                })));
            } catch (autocompleteError) {
                logger.error('Error en autocomplete de eliminar-streamer:', autocompleteError);
                await interaction.respond([{
                    name: 'Error al cargar streamers',
                    value: 'error'
                }]);
            }
        }
        else {
            logger.warn(`Autocomplete no manejado para comando: ${commandName}`);
        }
    } catch (error) {
        logger.error(`Error en autocomplete para ${commandName}`, error);
    }
}

module.exports = { handleAutocomplete };
