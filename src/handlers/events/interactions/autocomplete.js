// Handler para autocomplete
const logger = require('../../../utils/logger');
const { config } = require('../../../config');

async function handleAutocomplete(interaction, context) {
    const commandName = interaction.commandName;
    
    try {
        // Autocomplete para crear-ticket
        if (commandName === 'crear-ticket') {
            const focusedValue = interaction.options.getFocused().toLowerCase();
            const categories = config.tickets?.categories || [];
            
            const filtered = categories
                .filter(cat => cat.label.toLowerCase().includes(focusedValue) || cat.value.toLowerCase().includes(focusedValue))
                .slice(0, 25)
                .map(cat => ({
                    name: `${cat.emoji || '🎫'} ${cat.label}`,
                    value: cat.value
                }));
            
            await interaction.respond(filtered);
        }
        // Autocomplete para comandos personalizados
        else if (commandName === 'crear-comando') {
            await context.customCommandsSystem.handleAutocomplete(interaction);
        }
        else {
            logger.warn(`Autocomplete no manejado para comando: ${commandName}`);
        }
    } catch (error) {
        logger.error(`Error en autocomplete para ${commandName}`, error);
    }
}

module.exports = { handleAutocomplete };
