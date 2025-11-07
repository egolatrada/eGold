const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-embed')
        .setDescription('📝 Panel privado para crear embeds anónimos')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde enviar el embed')
                .setRequired(true)),
    
    async execute(interaction, context) {
        // TODO: Migrar desde index.js antiguo
        await interaction.reply({
            content: '⚠️ Comando en proceso de migración. Usa el comando antiguo por ahora.',
            ephemeral: true
        });
    }
};
