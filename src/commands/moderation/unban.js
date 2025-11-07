const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('🔓 Desbanea a un usuario')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('usuario_id')
                .setDescription('ID del usuario a desbanear')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo del desbaneo')
                .setRequired(false)),
    
    async execute(interaction, context) {
        const userId = interaction.options.getString('usuario_id');
        const reason = interaction.options.getString('motivo') || 'No especificado';

        try {
            await interaction.guild.members.unban(userId, reason);
            await interaction.reply({
                content: `✅ Usuario con ID **${userId}** ha sido desbaneado.\n**Motivo:** ${reason}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error al desbanear usuario:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al intentar desbanear al usuario. Verifica que el ID sea correcto y que el usuario esté baneado.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
