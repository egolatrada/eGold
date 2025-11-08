const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-eliminar-rol')
        .setDescription('🚫 [TICKETS] Elimina un rol del ticket actual')
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('Rol a eliminar del ticket')
                .setRequired(true)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const targetRole = interaction.options.getRole('rol');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede eliminar roles de tickets.',
                    ephemeral: true
                });
            }

            const isTicketChannel = channel.name.includes('ticket-');
            if (!isTicketChannel) {
                return await interaction.reply({
                    content: '❌ Este comando solo funciona en canales de tickets.',
                    ephemeral: true
                });
            }

            const currentPermissions = channel.permissionOverwrites.cache.get(targetRole.id);
            if (!currentPermissions) {
                return await interaction.reply({
                    content: `⚠️ ${targetRole} no tiene permisos específicos en este ticket.`,
                    ephemeral: true
                });
            }

            await channel.permissionOverwrites.delete(targetRole);

            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🚫 Rol Eliminado del Ticket')
                .setDescription(`${targetRole} ha sido eliminado de este ticket por ${interaction.user}`)
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });

            if (config.logs?.enabled && config.logs.channels?.tickets) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.tickets);
                    
                    const logEmbed = new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle('🚫 Rol Eliminado de Ticket')
                        .addFields(
                            { name: 'Ticket', value: `${channel}`, inline: true },
                            { name: 'Rol Eliminado', value: `${targetRole} (${targetRole.name})`, inline: true },
                            { name: 'Eliminado por', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                            { name: 'Canal ID', value: channel.id, inline: false }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    logger.error('Error al enviar log de eliminar rol de ticket', logError);
                }
            }

            logger.info(`🚫 ${interaction.user.tag} eliminó el rol ${targetRole.name} del ticket ${channel.name}`);

        } catch (error) {
            logger.error('Error al eliminar rol del ticket', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al eliminar el rol del ticket.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
