const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar-comando')
        .setDescription('🗑️ Elimina un comando personalizado')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Nombre del comando a eliminar')
                .setRequired(true)
                .setAutocomplete(true)),
    
    async execute(interaction, context) {
        const commandName = interaction.options.getString('comando');
        await context.customCommandsSystem.deleteCommand(interaction, commandName);
    }
};
