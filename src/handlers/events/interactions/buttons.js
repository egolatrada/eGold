// Handler para interacciones de botones
const logger = require('../../../utils/logger');

async function handleButtonInteraction(interaction, context) {
    const customId = interaction.customId;
    
    try {
        // Botón de verificación
        if (customId === 'verify_button') {
            await context.verificationSystem.handleVerifyButton(interaction);
        }
        // Botones de tickets (cerrar, reabrir, transcript, voice support, etc.)
        else if (customId.startsWith('close_ticket_') || customId === 'close_ticket') {
            const { handleCloseTicketButton } = require('./ticket-buttons');
            await handleCloseTicketButton(interaction, context);
        }
        else if (customId.startsWith('reopen_ticket_')) {
            const { handleReopenTicketButton } = require('./ticket-buttons');
            await handleReopenTicketButton(interaction, context);
        }
        else if (customId.startsWith('transcript_')) {
            const { handleTranscriptButton } = require('./ticket-buttons');
            await handleTranscriptButton(interaction, context);
        }
        else if (customId.startsWith('voice_support:')) {
            const { handleVoiceSupportButton } = require('./ticket-buttons');
            await handleVoiceSupportButton(interaction, context);
        }
        // Botones de panel embed
        else if (customId === 'embed_send_button') {
            const { handleEmbedSendButton } = require('./embed-buttons');
            await handleEmbedSendButton(interaction, context);
        }
        else if (customId === 'embed_cancel_button') {
            const { handleEmbedCancelButton } = require('./embed-buttons');
            await handleEmbedCancelButton(interaction, context);
        }
        else if (customId === 'refresh_status') {
            const { handleRefreshStatus } = require('../../../commands/admin/status');
            await handleRefreshStatus(interaction, context);
        }
        // Botones de sugerencias
        else if (customId === 'suggestion-upvote' || customId === 'suggestion-downvote' || customId === 'suggestion-thread') {
            const { handleSuggestionButtons } = require('./suggestion-buttons');
            await handleSuggestionButtons(interaction, context);
        }
        else {
            logger.warn(`Botón no manejado: ${customId}`);
        }
    } catch (error) {
        logger.error(`Error al manejar botón ${customId}`, error);
        throw error;
    }
}

module.exports = { handleButtonInteraction };
