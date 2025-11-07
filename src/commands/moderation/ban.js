const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Banea a un usuario del servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a banear')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo del baneo')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('dias')
                .setDescription('Días de mensajes a eliminar (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)),
    
    async execute(interaction, context) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'No especificado';
        const deleteMessageDays = interaction.options.getInteger('dias') || 0;
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (member && !member.bannable) {
            return interaction.reply({
                content: '❌ No puedo banear a este usuario (permisos insuficientes o jerarquía superior).',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            await interaction.guild.members.ban(targetUser.id, {
                reason: reason,
                deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
            });

            await interaction.reply({
                content: `✅ **${targetUser.tag}** ha sido baneado.\n**Motivo:** ${reason}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error al banear usuario:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al intentar banear al usuario.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
