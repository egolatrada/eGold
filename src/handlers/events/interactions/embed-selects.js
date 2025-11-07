// TODO: Migrar handlers de selects de embed del index.js antiguo

async function handleEmbedRoleSelect(interaction, context) {
    const { embedRoleSelections } = context;
    const selectedRoles = interaction.values;
    const key = `${interaction.user.id}:${interaction.channelId}`;
    
    embedRoleSelections.set(key, selectedRoles);
    
    await interaction.reply({
        content: `✅ ${selectedRoles.length} rol(es) seleccionado(s) para mencionar.`,
        ephemeral: true
    });
}

module.exports = {
    handleEmbedRoleSelect
};
