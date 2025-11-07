// TODO: Migrar handlers de modales de embed del index.js antiguo

async function handleEmbedModal(interaction, context) {
    await interaction.reply({ content: 'Función de modal de embed en migración', ephemeral: true });
}

module.exports = {
    handleEmbedModal
};
