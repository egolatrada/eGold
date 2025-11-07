const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-panel')
        .setDescription('🎫 Crea el panel de tickets con menú desplegable'),
    
    async execute(interaction, context) {
        // TODO: Migrar desde index.js antiguo
        await interaction.reply({
            content: '⚠️ Comando en proceso de migración. Usa el comando antiguo por ahora.',
            ephemeral: true
        });
    }
};
