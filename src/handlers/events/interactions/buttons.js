// Handler para interacciones de botones
const logger = require('../../../utils/logger');

async function handleButtonInteraction(interaction, context) {
    const customId = interaction.customId;
    
    try {
        // Botón de verificación
        if (customId === 'verify_user') {
            await context.verificationSystem.handleVerification(interaction);
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
        // Botón de cancelar cierre de ticket
        else if (customId.startsWith('cancel_close_')) {
            const { handleCancelCloseButton } = require('./ticket-buttons');
            await handleCancelCloseButton(interaction, context);
        }
        // Botón de copiar ID de rol
        else if (customId.startsWith('copy_role_id_')) {
            const roleId = customId.split('_')[3];
            await interaction.reply({
                content: `📋 **ID del Rol:**\n\n\`\`\`\n${roleId}\n\`\`\`\n\n💡 **Cómo copiar:**\n• **Móvil:** Mantén presionado el ID de arriba y selecciona "Copiar texto"\n• **PC:** Haz clic en el ID de arriba para copiarlo automáticamente`,
                ephemeral: true
            });
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
