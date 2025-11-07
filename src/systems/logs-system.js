const { EmbedBuilder, AuditLogEvent, Colors } = require("discord.js");
const messages = require("../../messages.json");

class LogsSystem {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.messages = messages.logs;
        this.commandUsageCache = new Map();
        this.setupEventListeners();
    }

    isAllowedGuild(guildId) {
        // Si no hay restricción, permitir todos
        if (!this.config.allowedGuildId) return true;
        // Si hay restricción, solo permitir el servidor específico
        return guildId === this.config.allowedGuildId;
    }

    setupEventListeners() {
        if (!this.config.logs || !this.config.logs.enabled) {
            console.log("📋 Sistema de logs desactivado");
            return;
        }

        console.log("📋 Iniciando sistema de logs...");

        console.log("✅ Sistema de logs iniciado correctamente");
    }

    async sendLog(channelId, embed) {
        if (!channelId || channelId === "1269337253101179093") return;

        try {
            const channel = await this.client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                // VERIFICACIÓN CRÍTICA: El canal debe pertenecer al servidor permitido
                if (this.config.allowedGuildId && channel.guild) {
                    if (channel.guild.id !== this.config.allowedGuildId) {
                        console.warn(
                            `⚠️ Intento de enviar log a canal de servidor no permitido (${channel.guild.name}). Log bloqueado por seguridad.`,
                        );
                        return;
                    }
                }

                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Error al enviar log: ${error.message}`);
        }
    }

    async handleMessageDelete(message) {
        if (!message.guild || message.author?.bot) return;
        if (!this.config.logs.channels.messages) return;
        if (!this.isAllowedGuild(message.guild.id)) return;

        let deletedBy = "Desconocido";
        try {
            const auditLogs = await message.guild.fetchAuditLogs({
                type: 72,
                limit: 1,
            });
            const deleteLog = auditLogs.entries.first();
            if (
                deleteLog &&
                deleteLog.target.id === message.author?.id &&
                Date.now() - deleteLog.createdTimestamp < 5000
            ) {
                deletedBy = `${deleteLog.executor}`;
            } else if (message.author) {
                deletedBy = `${message.author} (eliminó su propio mensaje)`;
            }
        } catch (error) {
            if (message.author) {
                deletedBy = `${message.author} (eliminó su propio mensaje)`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(this.messages.messages.deleted)
            .setDescription(`**Mensaje eliminado en** ${message.channel}`)
            .addFields(
                {
                    name: "👤 Autor del mensaje",
                    value: `${message.author || "Desconocido"}`,
                    inline: true,
                },
                { name: "🗑️ Eliminado por", value: deletedBy, inline: true },
                { name: "📍 Canal", value: `${message.channel}`, inline: true },
            )
            .setTimestamp();

        if (message.content) {
            embed.addFields({
                name: "💬 Contenido",
                value: message.content.substring(0, 1024),
            });
        }

        if (message.attachments.size > 0) {
            embed.addFields({
                name: "📎 Adjuntos",
                value: `${message.attachments.size} archivo(s)`,
            });
        }

        await this.sendLog(this.config.logs.channels.messages, embed);
    }

    async handleMessageUpdate(oldMessage, newMessage) {
        if (!newMessage.guild || newMessage.author?.bot) return;
        if (!this.config.logs.channels.messages) return;
        if (!this.isAllowedGuild(newMessage.guild.id)) return;
        if (oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle(this.messages.messages.edited)
            .setDescription(`**Mensaje editado en** ${newMessage.channel}`)
            .addFields(
                { name: "Autor", value: `${newMessage.author}`, inline: true },
                { name: "Canal", value: `${newMessage.channel}`, inline: true },
                {
                    name: "Mensaje",
                    value: `[Ir al mensaje](${newMessage.url})`,
                    inline: true,
                },
            )
            .setTimestamp();

        if (oldMessage.content) {
            embed.addFields({
                name: "Antes",
                value: oldMessage.content.substring(0, 1024),
            });
        }

        if (newMessage.content) {
            embed.addFields({
                name: "Después",
                value: newMessage.content.substring(0, 1024),
            });
        }

        await this.sendLog(this.config.logs.channels.messages, embed);
    }

    async handleChannelCreate(channel) {
        if (!channel.guild) return;
        if (!this.config.logs.channels.channels) return;
        if (!this.isAllowedGuild(channel.guild.id)) return;

        // No registrar canales de voz de tickets (ya tienen su propio log más completo)
        if (channel.name && channel.name.startsWith("🔰 Ticket")) {
            return;
        }
        
        // No registrar canales de tickets de texto (ya se guardan en el transcript)
        if (channel.name && channel.name.startsWith("ticket-")) {
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(this.messages.channels.created)
            .addFields(
                { name: "Canal", value: `${channel}`, inline: true },
                { name: "Tipo", value: channel.type.toString(), inline: true },
                { name: "ID", value: channel.id, inline: true },
            )
            .setTimestamp();

        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelCreate,
                limit: 1,
            });

            const createLog = auditLogs.entries.first();
            if (createLog && createLog.target.id === channel.id) {
                embed.addFields({
                    name: "Creado por",
                    value: `${createLog.executor}`,
                    inline: true,
                });
            }
        } catch (error) {
            console.log("No se pudo obtener información de creación del canal");
        }

        await this.sendLog(this.config.logs.channels.channels, embed);
    }

    async handleChannelDelete(channel) {
        if (!channel.guild) return;
        if (!this.config.logs.channels.channels) return;
        if (!this.isAllowedGuild(channel.guild.id)) return;

        // No registrar canales de voz de tickets (ya tienen su propio log completo)
        if (channel.name && channel.name.startsWith("🔰 Ticket")) {
            return;
        }
        
        // No registrar canales de tickets de texto (ya se guardan en el transcript)
        if (channel.name && channel.name.startsWith("ticket-")) {
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(this.messages.channels.deleted)
            .addFields(
                { name: "Nombre", value: channel.name, inline: true },
                { name: "Tipo", value: channel.type.toString(), inline: true },
                { name: "ID", value: channel.id, inline: true },
            )
            .setTimestamp();

        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 1,
            });

            const deleteLog = auditLogs.entries.first();
            if (deleteLog && deleteLog.target.id === channel.id) {
                embed.addFields({
                    name: "Eliminado por",
                    value: `${deleteLog.executor}`,
                    inline: true,
                });
            }
        } catch (error) {
            console.log(
                "No se pudo obtener información de eliminación del canal",
            );
        }

        await this.sendLog(this.config.logs.channels.channels, embed);
    }

    async handleThreadCreate(thread) {
        if (!thread.guild) return;
        if (!this.config.logs.channels.channels) return;
        if (!this.isAllowedGuild(thread.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(this.messages.channels.threadCreated)
            .addFields(
                { name: "Thread", value: `${thread}`, inline: true },
                {
                    name: "Canal padre",
                    value: `<#${thread.parentId}>`,
                    inline: true,
                },
                { name: "ID", value: thread.id, inline: true },
            )
            .setTimestamp();

        if (thread.ownerId) {
            try {
                const owner = await thread.guild.members.fetch(thread.ownerId);
                embed.addFields({
                    name: "Creado por",
                    value: `${owner.user}`,
                    inline: true,
                });
            } catch (error) {
                console.log("No se pudo obtener el creador del thread");
            }
        }

        await this.sendLog(this.config.logs.channels.channels, embed);
    }

    async handleThreadDelete(thread) {
        if (!thread.guild) return;
        if (!this.config.logs.channels.channels) return;
        if (!this.isAllowedGuild(thread.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(this.messages.channels.threadDeleted)
            .addFields(
                { name: "Nombre", value: thread.name, inline: true },
                {
                    name: "Canal padre",
                    value: `<#${thread.parentId}>`,
                    inline: true,
                },
                { name: "ID", value: thread.id, inline: true },
            )
            .setTimestamp();

        try {
            const auditLogs = await thread.guild.fetchAuditLogs({
                type: AuditLogEvent.ThreadDelete,
                limit: 1,
            });

            const deleteLog = auditLogs.entries.first();
            if (deleteLog && deleteLog.target.id === thread.id) {
                embed.addFields({
                    name: "Eliminado por",
                    value: `${deleteLog.executor}`,
                    inline: true,
                });
            }
        } catch (error) {
            console.log(
                "No se pudo obtener información de eliminación del thread",
            );
        }

        await this.sendLog(this.config.logs.channels.channels, embed);
    }

    async handleMemberJoin(member) {
        if (!this.config.logs.channels.memberJoins) return;
        if (!this.isAllowedGuild(member.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(this.messages.members.joined)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "Usuario", value: `${member.user}`, inline: true },
                { name: "ID", value: member.id, inline: true },
                {
                    name: "Cuenta creada",
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                    inline: true,
                },
            )
            .setFooter({
                text: `Miembros totales: ${member.guild.memberCount}`,
            })
            .setTimestamp();

        await this.sendLog(this.config.logs.channels.memberJoins, embed);
    }

    async handleMemberLeave(member) {
        if (!this.config.logs.channels.memberLeaves) return;
        if (!this.isAllowedGuild(member.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(this.messages.members.left)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "Usuario", value: `${member.user}`, inline: true },
                { name: "ID", value: member.id, inline: true },
                {
                    name: "Se unió",
                    value: member.joinedAt
                        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
                        : "Desconocido",
                    inline: true,
                },
            )
            .setFooter({
                text: `Miembros totales: ${member.guild.memberCount}`,
            })
            .setTimestamp();

        try {
            const auditLogs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberKick,
                limit: 1,
            });

            const kickLog = auditLogs.entries.first();
            if (
                kickLog &&
                kickLog.target.id === member.id &&
                Date.now() - kickLog.createdTimestamp < 5000
            ) {
                embed
                    .setTitle(this.messages.members.kicked)
                    .addFields({
                        name: "Expulsado por",
                        value: `${kickLog.executor}`,
                        inline: true,
                    });
                if (kickLog.reason) {
                    embed.addFields({ name: "Razón", value: kickLog.reason });
                }
            }
        } catch (error) {
            console.log("No se pudo verificar audit log para kick");
        }

        await this.sendLog(this.config.logs.channels.memberLeaves, embed);
    }

    async handleMemberUpdate(oldMember, newMember) {
        if (!this.isAllowedGuild(newMember.guild.id)) return;

        // Nickname changes -> memberJoins channel (miembros actuales)
        if (oldMember.nickname !== newMember.nickname) {
            if (!this.config.logs.channels.memberJoins) return;

            const embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle(this.messages.members.nicknameChanged)
                .setThumbnail(newMember.user.displayAvatarURL())
                .addFields(
                    {
                        name: "Usuario",
                        value: `${newMember.user}`,
                        inline: true,
                    },
                    {
                        name: "Antes",
                        value: oldMember.nickname || "Sin nickname",
                        inline: true,
                    },
                    {
                        name: "Después",
                        value: newMember.nickname || "Sin nickname",
                        inline: true,
                    },
                )
                .setTimestamp();

            try {
                const auditLogs = await newMember.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberUpdate,
                    limit: 1,
                });

                const updateLog = auditLogs.entries.first();
                if (
                    updateLog &&
                    updateLog.target.id === newMember.id &&
                    Date.now() - updateLog.createdTimestamp < 3000
                ) {
                    embed.addFields({
                        name: "Cambiado por",
                        value: `${updateLog.executor}`,
                        inline: true,
                    });
                }
            } catch (error) {
                console.log(
                    "No se pudo obtener información del cambio de nickname",
                );
            }

            await this.sendLog(this.config.logs.channels.memberJoins, embed);
        }

        // Role changes -> roles channel
        if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
            if (!this.config.logs.channels.roles) return;

            const addedRoles = newMember.roles.cache.filter(
                (role) => !oldMember.roles.cache.has(role.id),
            );
            const removedRoles = oldMember.roles.cache.filter(
                (role) => !newMember.roles.cache.has(role.id),
            );

            if (addedRoles.size > 0 || removedRoles.size > 0) {
                const embed = new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(this.messages.roles.memberRolesUpdated)
                    .addFields({
                        name: "Usuario",
                        value: `${newMember.user}`,
                        inline: true,
                    })
                    .setTimestamp();

                if (addedRoles.size > 0) {
                    embed.addFields({
                        name: "✅ Roles añadidos",
                        value: addedRoles.map((r) => `${r}`).join(", "),
                    });
                }

                if (removedRoles.size > 0) {
                    embed.addFields({
                        name: "❌ Roles eliminados",
                        value: removedRoles.map((r) => `${r}`).join(", "),
                    });
                }

                // Mostrar roles después del cambio (excluyendo @everyone)
                const newRolesList =
                    newMember.roles.cache
                        .filter((role) => role.name !== "@everyone")
                        .map((r) => `${r}`)
                        .join(", ") || "Ninguno";

                embed.addFields({
                    name: "📋 Roles actuales",
                    value: newRolesList.substring(0, 1024),
                });

                try {
                    const auditLogs = await newMember.guild.fetchAuditLogs({
                        type: AuditLogEvent.MemberRoleUpdate,
                        limit: 1,
                    });

                    const roleLog = auditLogs.entries.first();
                    if (
                        roleLog &&
                        roleLog.target.id === newMember.id &&
                        Date.now() - roleLog.createdTimestamp < 3000
                    ) {
                        embed.addFields({
                            name: "Modificado por",
                            value: `${roleLog.executor}`,
                            inline: true,
                        });
                    }
                } catch (error) {
                    console.log(
                        "No se pudo obtener información del cambio de roles",
                    );
                }

                await this.sendLog(this.config.logs.channels.roles, embed);
            }
        }
    }

    async handleBanAdd(ban) {
        if (!this.config.logs.channels.members) return;
        if (!this.isAllowedGuild(ban.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(this.messages.members.banned)
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields(
                { name: "Usuario", value: `${ban.user}`, inline: true },
                { name: "ID", value: ban.user.id, inline: true },
            )
            .setTimestamp();

        if (ban.reason) {
            embed.addFields({ name: "Razón", value: ban.reason });
        }

        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1,
            });

            const banLog = auditLogs.entries.first();
            if (banLog && banLog.target.id === ban.user.id) {
                embed.addFields({
                    name: "Baneado por",
                    value: `${banLog.executor}`,
                    inline: true,
                });
            }
        } catch (error) {
            console.log("No se pudo obtener información del ban");
        }

        await this.sendLog(this.config.logs.channels.members, embed);
    }

    async handleBanRemove(ban) {
        if (!this.config.logs.channels.members) return;
        if (!this.isAllowedGuild(ban.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(this.messages.members.unbanned)
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields(
                { name: "Usuario", value: `${ban.user}`, inline: true },
                { name: "ID", value: ban.user.id, inline: true },
            )
            .setTimestamp();

        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanRemove,
                limit: 1,
            });

            const unbanLog = auditLogs.entries.first();
            if (unbanLog && unbanLog.target.id === ban.user.id) {
                embed.addFields({
                    name: "Desbaneado por",
                    value: `${unbanLog.executor}`,
                    inline: true,
                });
            }
        } catch (error) {
            console.log("No se pudo obtener información del unban");
        }

        await this.sendLog(this.config.logs.channels.members, embed);
    }

    async handleRoleCreate(role) {
        if (!this.config.logs.channels.roles) return;
        if (!this.isAllowedGuild(role.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(role.color || Colors.Green)
            .setTitle(this.messages.roles.created)
            .addFields(
                { name: "Rol", value: `${role}`, inline: true },
                { name: "ID", value: role.id, inline: true },
                { name: "Color", value: role.hexColor, inline: true },
            )
            .setTimestamp();

        await this.sendLog(this.config.logs.channels.roles, embed);
    }

    async handleRoleDelete(role) {
        if (!this.config.logs.channels.roles) return;
        if (!this.isAllowedGuild(role.guild.id)) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(this.messages.roles.deleted)
            .addFields(
                { name: "Nombre", value: role.name, inline: true },
                { name: "ID", value: role.id, inline: true },
                { name: "Color", value: role.hexColor, inline: true },
            )
            .setTimestamp();

        await this.sendLog(this.config.logs.channels.roles, embed);
    }

    async handleRoleUpdate(oldRole, newRole) {
        if (!this.config.logs.channels.roles) return;
        if (!this.isAllowedGuild(newRole.guild.id)) return;

        const changes = [];

        if (oldRole.name !== newRole.name) {
            changes.push({
                name: "Nombre cambiado",
                value: `${oldRole.name} → ${newRole.name}`,
            });
        }

        if (oldRole.color !== newRole.color) {
            changes.push({
                name: "Color cambiado",
                value: `${oldRole.hexColor} → ${newRole.hexColor}`,
            });
        }

        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
            changes.push({ name: "Permisos", value: "Permisos actualizados" });
        }

        if (changes.length === 0) return;

        const embed = new EmbedBuilder()
            .setColor(newRole.color || Colors.Yellow)
            .setTitle(this.messages.roles.updated)
            .addFields({ name: "Rol", value: `${newRole}`, inline: true })
            .addFields(changes)
            .setTimestamp();

        await this.sendLog(this.config.logs.channels.roles, embed);
    }

    async handleVoiceStateUpdate(oldState, newState) {
        if (!this.config.logs.channels.voice) return;
        if (!this.isAllowedGuild(newState.guild.id)) return;

        const member = newState.member || oldState.member;

        // Usuario entró a un canal de voz
        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle(this.messages.voice.joined)
                .addFields(
                    { name: "Usuario", value: `${member.user}`, inline: true },
                    {
                        name: "Canal",
                        value: `${newState.channel}`,
                        inline: true,
                    },
                )
                .setTimestamp();

            // Detectar si es un canal de ticket
            if (newState.channel.name.startsWith("🔰 Ticket")) {
                const ticketMatch = newState.channel.name.match(/Ticket (\d+)/);
                if (ticketMatch) {
                    const ticketNumber = ticketMatch[1];
                    embed.addFields({
                        name: "🎫 Canal de Ticket",
                        value: `Este es un canal de soporte de voz para el Ticket #${ticketNumber}`,
                        inline: false,
                    });
                    embed.setColor("#FFA500"); // Color naranja para canales de ticket
                }
            }

            await this.sendLog(this.config.logs.channels.voice, embed);
        }
        // Usuario salió de un canal de voz
        else if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(this.messages.voice.left)
                .addFields(
                    { name: "Usuario", value: `${member.user}`, inline: true },
                    {
                        name: "Canal",
                        value: `${oldState.channel}`,
                        inline: true,
                    },
                )
                .setTimestamp();

            // Detectar si es un canal de ticket
            if (oldState.channel.name.startsWith("🔰 Ticket")) {
                const ticketMatch = oldState.channel.name.match(/Ticket (\d+)/);
                if (ticketMatch) {
                    const ticketNumber = ticketMatch[1];
                    embed.addFields({
                        name: "🎫 Canal de Ticket",
                        value: `Este es un canal de soporte de voz para el Ticket #${ticketNumber}`,
                        inline: false,
                    });
                    embed.setColor("#FF4500"); // Color rojo-naranja para salidas de canales de ticket
                }
            }

            await this.sendLog(this.config.logs.channels.voice, embed);
        }
        // Usuario fue muteado por servidor
        else if (oldState.serverMute !== newState.serverMute) {
            const embed = new EmbedBuilder()
                .setColor(newState.serverMute ? Colors.Orange : Colors.Green)
                .setTitle(
                    newState.serverMute
                        ? "🔇 Usuario Muteado"
                        : "🔊 Usuario Desmuteado",
                )
                .setTimestamp();

            try {
                const auditLogs = await member.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberUpdate,
                    limit: 1,
                });

                const muteLog = auditLogs.entries.first();
                if (
                    muteLog &&
                    muteLog.target.id === member.id &&
                    Date.now() - muteLog.createdTimestamp < 3000
                ) {
                    embed.setDescription(
                        `${muteLog.executor} ${newState.serverMute ? "muteó" : "desmuteó"} a ${member.user}`,
                    );
                    embed.addFields(
                        {
                            name: newState.serverMute
                                ? "Muteado por"
                                : "Desmuteado por",
                            value: `${muteLog.executor}`,
                            inline: true,
                        },
                        {
                            name: "Usuario",
                            value: `${member.user}`,
                            inline: true,
                        },
                        {
                            name: "Canal",
                            value: `${newState.channel}`,
                            inline: true,
                        },
                    );
                } else {
                    embed.addFields(
                        {
                            name: "Usuario",
                            value: `${member.user}`,
                            inline: true,
                        },
                        {
                            name: "Estado",
                            value: newState.serverMute
                                ? "Muteado"
                                : "Desmuteado",
                            inline: true,
                        },
                        {
                            name: "Canal",
                            value: `${newState.channel}`,
                            inline: true,
                        },
                    );
                }
            } catch (error) {
                embed.addFields(
                    { name: "Usuario", value: `${member.user}`, inline: true },
                    {
                        name: "Estado",
                        value: newState.serverMute ? "Muteado" : "Desmuteado",
                        inline: true,
                    },
                    {
                        name: "Canal",
                        value: `${newState.channel}`,
                        inline: true,
                    },
                );
            }

            await this.sendLog(this.config.logs.channels.voice, embed);
        }
        // Usuario fue ensorded por servidor
        else if (oldState.serverDeaf !== newState.serverDeaf) {
            const embed = new EmbedBuilder()
                .setColor(newState.serverDeaf ? Colors.Orange : Colors.Green)
                .setTitle(
                    newState.serverDeaf
                        ? "🔇 Usuario Ensordecido"
                        : "🔊 Usuario Desensordecido",
                )
                .setTimestamp();

            try {
                const auditLogs = await member.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberUpdate,
                    limit: 1,
                });

                const deafLog = auditLogs.entries.first();
                if (
                    deafLog &&
                    deafLog.target.id === member.id &&
                    Date.now() - deafLog.createdTimestamp < 3000
                ) {
                    embed.setDescription(
                        `${deafLog.executor} ${newState.serverDeaf ? "ensordecío" : "desensordecío"} a ${member.user}`,
                    );
                    embed.addFields(
                        {
                            name: newState.serverDeaf
                                ? "Ensordecido por"
                                : "Desensordecido por",
                            value: `${deafLog.executor}`,
                            inline: true,
                        },
                        {
                            name: "Usuario",
                            value: `${member.user}`,
                            inline: true,
                        },
                        {
                            name: "Canal",
                            value: `${newState.channel}`,
                            inline: true,
                        },
                    );
                } else {
                    embed.addFields(
                        {
                            name: "Usuario",
                            value: `${member.user}`,
                            inline: true,
                        },
                        {
                            name: "Estado",
                            value: newState.serverDeaf
                                ? "Ensordecido"
                                : "Desensordecido",
                            inline: true,
                        },
                        {
                            name: "Canal",
                            value: `${newState.channel}`,
                            inline: true,
                        },
                    );
                }
            } catch (error) {
                embed.addFields(
                    { name: "Usuario", value: `${member.user}`, inline: true },
                    {
                        name: "Estado",
                        value: newState.serverDeaf
                            ? "Ensordecido"
                            : "Desensordecido",
                        inline: true,
                    },
                    {
                        name: "Canal",
                        value: `${newState.channel}`,
                        inline: true,
                    },
                );
            }

            await this.sendLog(this.config.logs.channels.voice, embed);
        }
        // Usuario se movió entre canales
        else if (oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle(this.messages.voice.moved)
                .setTimestamp();

            // Intentar detectar si fue movido por otra persona
            try {
                const auditLogs = await member.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberMove,
                    limit: 1,
                });

                const moveLog = auditLogs.entries.first();
                if (
                    moveLog &&
                    moveLog.target.id === member.id &&
                    Date.now() - moveLog.createdTimestamp < 3000
                ) {
                    // Fue movido por otra persona
                    embed.setDescription(
                        `${moveLog.executor} movió a ${member.user} de ${oldState.channel} a ${newState.channel}`,
                    );
                    embed.addFields(
                        {
                            name: "Movido por",
                            value: `${moveLog.executor}`,
                            inline: true,
                        },
                        {
                            name: "Usuario movido",
                            value: `${member.user}`,
                            inline: true,
                        },
                    );
                } else {
                    // Se movió solo
                    embed.addFields(
                        {
                            name: "Usuario",
                            value: `${member.user}`,
                            inline: true,
                        },
                        {
                            name: "Desde",
                            value: `${oldState.channel}`,
                            inline: true,
                        },
                        {
                            name: "Hacia",
                            value: `${newState.channel}`,
                            inline: true,
                        },
                    );
                }
            } catch (error) {
                // Si no se puede verificar, mostrar como movimiento normal
                embed.addFields(
                    { name: "Usuario", value: `${member.user}`, inline: true },
                    {
                        name: "Desde",
                        value: `${oldState.channel}`,
                        inline: true,
                    },
                    {
                        name: "Hacia",
                        value: `${newState.channel}`,
                        inline: true,
                    },
                );
            }

            await this.sendLog(this.config.logs.channels.voice, embed);
        }
    }

    async handleCommandUsage(interaction) {
        if (!interaction.isChatInputCommand()) return;

        // Deduplicación INMEDIATA: marcar como procesado antes de cualquier otra verificación
        if (this.commandUsageCache.has(interaction.id)) {
            return;
        }
        this.commandUsageCache.set(interaction.id, Date.now());

        // Ahora sí, hacer las verificaciones
        if (!this.config.logs.channels.commands) return;
        if (!this.isAllowedGuild(interaction.guild.id)) return;

        // Ignorar /clear porque tiene su propio sistema de logging
        if (interaction.commandName === "clear") return;

        // Limpiar caché antiguo (más de 5 minutos)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        for (const [id, timestamp] of this.commandUsageCache.entries()) {
            if (timestamp < fiveMinutesAgo) {
                this.commandUsageCache.delete(id);
            }
        }

        const isAdmin = interaction.memberPermissions?.has("Administrator");
        const hasTrackedRole =
            this.config.logs.trackedRoles &&
            this.config.logs.trackedRoles.length > 0
                ? this.config.logs.trackedRoles.some((roleId) =>
                      interaction.member?.roles.cache.has(roleId),
                  )
                : false;

        if (!this.config.logs.logAllCommands && !isAdmin && !hasTrackedRole) {
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(isAdmin ? Colors.Purple : Colors.Blue)
            .setTitle(
                isAdmin
                    ? this.messages.commands.admin
                    : this.messages.commands.regular,
            )
            .addFields(
                { name: "Usuario", value: `${interaction.user}`, inline: true },
                {
                    name: "Comando",
                    value: `/${interaction.commandName}`,
                    inline: true,
                },
                {
                    name: "Canal",
                    value: `${interaction.channel}`,
                    inline: true,
                },
            )
            .setTimestamp();

        if (interaction.options.data.length > 0) {
            const options = interaction.options.data
                .map((opt) => `${opt.name}: ${opt.value}`)
                .join("\n");
            embed.addFields({ name: "Opciones", value: options });
        }

        await this.sendLog(this.config.logs.channels.commands, embed);
    }

    async handleBotActivity(message) {
        if (!message.author.bot) return;
        if (!message.guild) return;
        if (!this.config.logs.channels.bots) return;
        if (!this.isAllowedGuild(message.guild.id)) return;

        // No registrar actividad del propio bot, solo de otros bots
        if (message.author.id === this.client.user.id) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Greyple)
            .setTitle(this.messages.bots.activity)
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: "Bot", value: `${message.author}`, inline: true },
                { name: "Canal", value: `${message.channel}`, inline: true },
                {
                    name: "Tipo",
                    value: message.interaction
                        ? "Respuesta a comando"
                        : "Mensaje automático",
                    inline: true,
                },
            )
            .setTimestamp();

        if (message.content && message.content.length > 0) {
            embed.addFields({
                name: "Contenido",
                value: message.content.substring(0, 1024),
            });
        }

        if (message.embeds.length > 0) {
            embed.addFields({
                name: "Embeds",
                value: `${message.embeds.length} embed(s)`,
            });
        }

        if (message.components.length > 0) {
            embed.addFields({
                name: "Componentes",
                value: `${message.components.length} componente(s) interactivo(s)`,
            });
        }

        await this.sendLog(this.config.logs.channels.bots, embed);
    }
}

module.exports = LogsSystem;
