const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editar-comando')
        .setDescription('✏️ Edita un comando personalizado existente')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Nombre del comando a editar')
                .setRequired(true)
                .setAutocomplete(true)),
    
    async execute(interaction, context) {
        const commandName = interaction.options.getString('comando');
        await context.customCommandsSystem.showEditPanel(interaction, commandName);
    }
};
