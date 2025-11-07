const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('🔄 Reinicia el bot (solo administradores)'),
    
    async execute(interaction, context) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({
                content: '❌ No tienes permisos para usar este comando.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: '🔄 Reiniciando el bot...',
            flags: MessageFlags.Ephemeral
        });

        console.log('🔄 Reinicio manual solicitado por', interaction.user.tag);
        setTimeout(() => process.exit(0), 1000);
    }
};
