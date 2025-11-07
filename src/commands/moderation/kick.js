const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👢 Expulsa a un usuario del servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a expulsar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo de la expulsión')
                .setRequired(false)),
    
    async execute(interaction, context) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'No especificado';
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({
                content: '❌ No se pudo encontrar ese usuario en el servidor.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: '❌ No puedo expulsar a este usuario (permisos insuficientes o jerarquía superior).',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            await member.kick(reason);
            await interaction.reply({
                content: `✅ **${targetUser.tag}** ha sido expulsado.\n**Motivo:** ${reason}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error al expulsar usuario:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al intentar expulsar al usuario.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
