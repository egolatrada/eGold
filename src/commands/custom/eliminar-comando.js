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
        if (!context.customCommandsSystem.isAllowedGuild(interaction.guild.id)) {
            await interaction.reply({
                content: '❌ Este comando no está disponible en este servidor.',
                ephemeral: true
            });
            return;
        }

        if (!context.customCommandsSystem.hasStaffPermission(interaction.member)) {
            await interaction.reply({
                content: '❌ No tienes permisos para eliminar comandos personalizados.',
                ephemeral: true
            });
            return;
        }

        const commandName = interaction.options.getString('comando');
        await context.customCommandsSystem.deleteCommand(interaction, commandName);
    }
};
