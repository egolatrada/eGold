const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comando-editar')
        .setDescription('✏️ Edita un comando personalizado existente')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Nombre del comando a editar')
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
                content: '❌ No tienes permisos para editar comandos personalizados.',
                ephemeral: true
            });
            return;
        }

        const commandName = interaction.options.getString('comando');
        await context.customCommandsSystem.showEditPanel(interaction, commandName);
    }
};
