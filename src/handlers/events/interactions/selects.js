// Handler para select menus
const logger = require('../../../utils/logger');

async function handleSelectInteraction(interaction, context) {
    const customId = interaction.customId;
    
    try {
        // Select de categoría de ticket
        if (customId === 'ticket_type') {
            const { handleTicketCategorySelect } = require('./ticket-selects');
            await handleTicketCategorySelect(interaction, context);
        }
        // Select de roles para embed
        else if (customId.startsWith('embed_role_select')) {
            const { handleEmbedRoleSelect } = require('./embed-selects');
            await handleEmbedRoleSelect(interaction, context);
        }
        else {
            logger.warn(`Select menu no manejado: ${customId}`);
        }
    } catch (error) {
        logger.error(`Error al manejar select ${customId}`, error);
        throw error;
    }
}

module.exports = { handleSelectInteraction };
