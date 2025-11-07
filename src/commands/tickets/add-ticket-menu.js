const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-ticket-menu')
        .setDescription('➕ Añade menú de tickets a un mensaje existente')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('mensaje-id')
                .setDescription('ID del mensaje')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde está el mensaje')
                .setRequired(false)),
    
    async execute(interaction, context) {
        // TODO: Migrar desde index.js antiguo
        await interaction.reply({
            content: '⚠️ Comando en proceso de migración. Usa el comando antiguo por ahora.',
            ephemeral: true
        });
    }
};
