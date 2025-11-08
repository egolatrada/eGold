const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comando-lista')
        .setDescription('📝 [COMANDOS] Lista todos los comandos personalizados')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
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
                content: '❌ No tienes permisos para ver los comandos personalizados.',
                ephemeral: true
            });
            return;
        }

        await context.customCommandsSystem.listCommands(interaction);
    }
};
