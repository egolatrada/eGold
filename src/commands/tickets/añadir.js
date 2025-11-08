const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-añadir')
        .setDescription('👥 [TICKETS] Añade usuarios y/o roles al ticket actual (sin límite)')
        .addStringOption(option =>
            option
                .setName('usuarios')
                .setDescription('Menciona usuarios separados por espacios (ej: @user1 @user2 @user3)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('roles')
                .setDescription('Menciona roles separados por espacios (ej: @rol1 @rol2 @rol3)')
                .setRequired(false)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const usuariosInput = interaction.options.getString('usuarios');
            const rolesInput = interaction.options.getString('roles');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede añadir usuarios o roles a tickets.',
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

            if (!usuariosInput && !rolesInput) {
                return await interaction.reply({
                    content: '❌ Debes mencionar al menos 1 usuario o 1 rol para añadir al ticket.',
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            const addedUsers = [];
            const addedRoles = [];
            const skippedUsers = [];
            const skippedRoles = [];
            const errors = [];

            // Procesar usuarios
            if (usuariosInput) {
                const userIds = usuariosInput.match(/<@!?(\d+)>/g);
                
                if (userIds && userIds.length > 0) {
                    for (const mention of userIds) {
                        const userId = mention.replace(/<@!?(\d+)>/, '$1');
                        
                        try {
                            const user = await interaction.guild.members.fetch(userId).catch(() => null);
                            
                            if (!user) {
                                errors.push(`Usuario con ID ${userId} no encontrado`);
                                continue;
                            }

                            const currentPermissions = channel.permissionOverwrites.cache.get(userId);
                            if (currentPermissions?.allow.has(PermissionFlagsBits.ViewChannel)) {
                                skippedUsers.push(user.user.tag);
                                continue;
                            }

                            await channel.permissionOverwrites.create(userId, {
                                ViewChannel: true,
                                SendMessages: true,
                                ReadMessageHistory: true,
                                AttachFiles: true,
                                EmbedLinks: true,
                            });

                            addedUsers.push(user);
                        } catch (error) {
                            errors.push(`Error al añadir usuario ${userId}: ${error.message}`);
                            logger.error(`Error al añadir usuario ${userId}`, error);
                        }
                    }
                }
            }

            // Procesar roles
            if (rolesInput) {
                const roleIds = rolesInput.match(/<@&(\d+)>/g);
                
                if (roleIds && roleIds.length > 0) {
                    for (const mention of roleIds) {
                        const roleId = mention.replace(/<@&(\d+)>/, '$1');
                        
                        try {
                            const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
                            
                            if (!role) {
                                errors.push(`Rol con ID ${roleId} no encontrado`);
                                continue;
                            }

                            const currentPermissions = channel.permissionOverwrites.cache.get(roleId);
                            if (currentPermissions?.allow.has(PermissionFlagsBits.ViewChannel)) {
                                skippedRoles.push(role.name);
                                continue;
                            }

                            await channel.permissionOverwrites.create(roleId, {
                                ViewChannel: true,
                                SendMessages: true,
                                ReadMessageHistory: true,
                                AttachFiles: true,
                                EmbedLinks: true,
                            });

                            addedRoles.push(role);
                        } catch (error) {
                            errors.push(`Error al añadir rol ${roleId}: ${error.message}`);
                            logger.error(`Error al añadir rol ${roleId}`, error);
                        }
                    }
                }
            }

            // Construir embed de respuesta
            const embed = new EmbedBuilder()
                .setColor(addedUsers.length > 0 || addedRoles.length > 0 ? '#57F287' : '#FEE75C')
                .setTitle(addedUsers.length > 0 || addedRoles.length > 0 ? '✅ Miembros Añadidos al Ticket' : '⚠️ Ningún Miembro Añadido')
                .setTimestamp();

            let description = '';

            if (addedUsers.length > 0) {
                description += `**✅ Usuarios añadidos (${addedUsers.length}):**\n`;
                description += addedUsers.map(u => `• ${u.user} (${u.user.tag})`).join('\n');
                description += '\n\n';
            }

            if (addedRoles.length > 0) {
                description += `**✅ Roles añadidos (${addedRoles.length}):**\n`;
                description += addedRoles.map(r => `• ${r} (${r.name})`).join('\n');
                description += '\n\n';
            }

            if (skippedUsers.length > 0) {
                description += `**⚠️ Usuarios ya tenían acceso (${skippedUsers.length}):**\n`;
                description += skippedUsers.map(u => `• ${u}`).join('\n');
                description += '\n\n';
            }

            if (skippedRoles.length > 0) {
                description += `**⚠️ Roles ya tenían acceso (${skippedRoles.length}):**\n`;
                description += skippedRoles.map(r => `• ${r}`).join('\n');
                description += '\n\n';
            }

            if (errors.length > 0) {
                description += `**❌ Errores (${errors.length}):**\n`;
                description += errors.map(e => `• ${e}`).join('\n');
            }

            if (description) {
                embed.setDescription(description.trim());
            } else {
                embed.setDescription('No se pudieron procesar usuarios o roles. Asegúrate de mencionarlos correctamente.');
            }

            embed.addFields({ name: 'Acción realizada por', value: `${interaction.user} (${interaction.user.tag})`, inline: false });

            await interaction.editReply({ embeds: [embed] });

            // Enviar logs
            if ((addedUsers.length > 0 || addedRoles.length > 0) && config.logs?.enabled && config.logs.channels?.tickets) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.tickets);
                    
                    const logEmbed = new EmbedBuilder()
                        .setColor('#57F287')
                        .setTitle('👥 Miembros Añadidos a Ticket')
                        .addFields(
                            { name: 'Ticket', value: `${channel}`, inline: true },
                            { name: 'Añadido por', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                            { name: 'Canal ID', value: channel.id, inline: false }
                        )
                        .setTimestamp();

                    if (addedUsers.length > 0) {
                        logEmbed.addFields({
                            name: `✅ Usuarios añadidos (${addedUsers.length})`,
                            value: addedUsers.map(u => `• ${u.user.tag}`).join('\n').substring(0, 1024),
                            inline: false
                        });
                    }

                    if (addedRoles.length > 0) {
                        logEmbed.addFields({
                            name: `✅ Roles añadidos (${addedRoles.length})`,
                            value: addedRoles.map(r => `• ${r.name}`).join('\n').substring(0, 1024),
                            inline: false
                        });
                    }
                    
                    await logChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    logger.error('Error al enviar log de añadir miembros a ticket', logError);
                }
            }

            const totalAdded = addedUsers.length + addedRoles.length;
            if (totalAdded > 0) {
                logger.info(`👥 ${interaction.user.tag} añadió ${addedUsers.length} usuario(s) y ${addedRoles.length} rol(es) al ticket ${channel.name}`);
            }

        } catch (error) {
            logger.error('Error al añadir al ticket', error);
            const reply = {
                content: '❌ Ocurrió un error al añadir miembros al ticket.',
                ephemeral: true
            };
            
            if (interaction.deferred) {
                await interaction.editReply(reply).catch(() => {});
            } else {
                await interaction.reply(reply).catch(() => {});
            }
        }
    }
};
