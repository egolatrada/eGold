const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comando-crear')
        .setDescription('📝 [COMANDOS] Crea un nuevo comando personalizado')
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
                content: '❌ No tienes permisos para crear comandos personalizados.',
                ephemeral: true
            });
            return;
        }

        await context.customCommandsSystem.showCreatePanel(interaction);
    }
};
