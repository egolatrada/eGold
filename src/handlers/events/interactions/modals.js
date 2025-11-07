// Handler para modales
const logger = require('../../../utils/logger');

async function handleModalInteraction(interaction, context) {
    const customId = interaction.customId;
    
    try {
        // Modal de panel embed
        if (customId === 'embed_modal') {
            const { handleEmbedModal } = require('./embed-modals');
            await handleEmbedModal(interaction, context);
        }
        // Modal de comandos personalizados (nuevo, editar)
        else if (customId.startsWith('custom_command_modal_')) {
            await context.customCommandsSystem.handleModal(interaction);
        }
        else {
            logger.warn(`Modal no manejado: ${customId}`);
        }
    } catch (error) {
        logger.error(`Error al manejar modal ${customId}`, error);
        throw error;
    }
}

module.exports = { handleModalInteraction };
