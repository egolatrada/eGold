const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-eliminar')
        .setDescription('🚫 [TICKETS] Elimina un usuario o rol del ticket actual')
        .addStringOption(option =>
            option
                .setName('tipo')
                .setDescription('¿Qué deseas eliminar?')
                .setRequired(true)
                .addChoices(
                    { name: 'Usuario', value: 'usuario' },
                    { name: 'Rol', value: 'rol' }
                )
        )
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario a eliminar del ticket')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('Rol a eliminar del ticket')
                .setRequired(false)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const tipo = interaction.options.getString('tipo');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede eliminar usuarios o roles de tickets.',
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

            // Lógica según el tipo seleccionado
            if (tipo === 'usuario') {
                const targetUser = interaction.options.getUser('usuario');
                
                if (!targetUser) {
                    return await interaction.reply({
                        content: '❌ Debes especificar un usuario cuando seleccionas "Usuario".',
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
                        logger.warn('No se pudo parsear metadata del topic en eliminar usuario');
                    }
                }

                // Verificar si el usuario es el creador
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

            } else if (tipo === 'rol') {
                const targetRole = interaction.options.getRole('rol');
                
                if (!targetRole) {
                    return await interaction.reply({
                        content: '❌ Debes especificar un rol cuando seleccionas "Rol".',
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
            }

        } catch (error) {
            logger.error('Error al eliminar del ticket', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al eliminar del ticket.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
