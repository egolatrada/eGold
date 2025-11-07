// TODO: Migrar handlers de botones de embed del index.js antiguo

async function handleEmbedSendButton(interaction, context) {
    await interaction.reply({ content: 'Función de enviar embed en migración', ephemeral: true });
}

async function handleEmbedCancelButton(interaction, context) {
    await interaction.reply({ content: 'Función de cancelar embed en migración', ephemeral: true });
}

module.exports = {
    handleEmbedSendButton,
    handleEmbedCancelButton
};
