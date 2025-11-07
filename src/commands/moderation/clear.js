const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🗑️ Elimina mensajes del canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    
    async execute(interaction, context) {
        const amount = interaction.options.getInteger('cantidad');

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({
                content: `✅ Se eliminaron **${deleted.size}** mensajes.`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error al eliminar mensajes:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al intentar eliminar los mensajes. Los mensajes más antiguos de 14 días no se pueden eliminar en masa.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
