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
        else if (commandName === 'crear-comando' || commandName === 'editar-comando' || commandName === 'eliminar-comando') {
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
                
                const platformEmojis = {
                    twitch: '🎮',
                    kick: '⚡',
                    youtube: '📺'
                };
                
                let linksToShow;
                
                if (userId) {
                    linksToShow = context.socialLinksSystem.getUserLinks(userId);
                    
                    if (linksToShow.length === 0) {
                        await interaction.respond([{
                            name: 'Este usuario no tiene streamers configurados',
                            value: 'no_streamers'
                        }]);
                        return;
                    }
                } else {
                    linksToShow = context.socialLinksSystem.getAllLinks();
                    
                    if (linksToShow.length === 0) {
                        await interaction.respond([{
                            name: 'No hay streamers configurados',
                            value: 'no_streamers'
                        }]);
                        return;
                    }
                }
                
                const filtered = linksToShow
                    .filter(link => {
                        const searchText = focusedValue;
                        return link.username.toLowerCase().includes(searchText) ||
                               link.platform.toLowerCase().includes(searchText) ||
                               link.url.toLowerCase().includes(searchText);
                    })
                    .slice(0, 25)
                    .map(link => {
                        const userTag = link.userId ? ` (@usuario)` : ` (sin usuario)`;
                        return {
                            name: `${platformEmojis[link.platform]} ${link.username}${userTag}`,
                            value: link.linkId
                        };
                    });
                
                if (filtered.length > 0) {
                    await interaction.respond(filtered);
                } else {
                    const allOptions = linksToShow.slice(0, 25).map(link => {
                        const userTag = link.userId ? ` (@usuario)` : ` (sin usuario)`;
                        return {
                            name: `${platformEmojis[link.platform]} ${link.username}${userTag}`,
                            value: link.linkId
                        };
                    });
                    await interaction.respond(allOptions);
                }
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
