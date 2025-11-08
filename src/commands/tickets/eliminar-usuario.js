const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar-usuario')
        .setDescription('🚫 Elimina un usuario del ticket actual')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario a eliminar del ticket')
                .setRequired(true)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const targetUser = interaction.options.getUser('usuario');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede eliminar usuarios de tickets.',
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

            // Obtener metadata del sistema
            const { ticketsSystem } = context;
            let ticketData = ticketsSystem.getTicketMetadata(channel.id);

            // Fallback: intentar leer del topic (para tickets antiguos)
            if (!ticketData && channel.topic) {
                try {
                    const metadataMatch = channel.topic.match(/Metadata: ({.*})/);
                    if (metadataMatch) {
                        ticketData = JSON.parse(metadataMatch[1]);
                    }
                } catch (e) {
                    logger.warn('No se pudo parsear metadata del topic en eliminar-usuario');
                }
            }

            // Verificar si el usuario es el creador (soportar tanto 'creator' como 'creatorId' para compatibilidad)
            const creatorId = ticketData?.creator || ticketData?.creatorId;
            if (creatorId && creatorId === targetUser.id) {
                return await interaction.reply({
                    content: '❌ No puedes eliminar al creador del ticket. Usa el botón "Cerrar Ticket" para cerrar el ticket.',
                    ephemeral: true
                });
            }

            const currentPermissions = channel.permissionOverwrites.cache.get(targetUser.id);
            if (!currentPermissions) {
                return await interaction.reply({
                    content: `⚠️ ${targetUser} no tiene permisos específicos en este ticket.`,
                    ephemeral: true
                });
            }

            await channel.permissionOverwrites.delete(targetUser);

            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🚫 Usuario Eliminado del Ticket')
                .setDescription(`${targetUser} ha sido eliminado de este ticket por ${interaction.user}`)
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });

            if (config.logs?.enabled && config.logs.channels?.tickets) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.tickets);
                    
                    const logEmbed = new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle('🚫 Usuario Eliminado de Ticket')
                        .addFields(
                            { name: 'Ticket', value: `${channel}`, inline: true },
                            { name: 'Usuario Eliminado', value: `${targetUser} (${targetUser.tag})`, inline: true },
                            { name: 'Eliminado por', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                            { name: 'Canal ID', value: channel.id, inline: false }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    logger.error('Error al enviar log de eliminar usuario de ticket', logError);
                }
            }

            logger.info(`🚫 ${interaction.user.tag} eliminó a ${targetUser.tag} del ticket ${channel.name}`);

        } catch (error) {
            logger.error('Error al eliminar usuario del ticket', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al eliminar el usuario del ticket.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
