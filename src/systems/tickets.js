const { PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readJSONLegacy, writeJSONLegacy } = require('../services/storage');
const { config, messages } = require('../config');
const logger = require('../utils/logger');

class TicketsSystem {
    constructor(client) {
        this.client = client;
        this.ticketCounters = new Map();
        this.voiceSupportUsage = new Map();
        this.ticketMetadata = new Map(); // Almacena metadata de tickets (channelId -> metadata)
        this.TICKET_DATA_FILE = './src/data/ticket-data.json';
        this.VOICE_SUPPORT_FILE = './src/data/voice-support-data.json';
        this.TICKET_METADATA_FILE = './src/data/ticket-metadata.json';
    }

    /**
     * Carga los contadores de tickets desde archivo
     */
    loadTicketCounters() {
        try {
            const data = readJSONLegacy(this.TICKET_DATA_FILE);
            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    // Soportar formato antiguo (guildId solo) y nuevo (guildId:categoryId)
                    if (key.includes(':')) {
                        // Formato nuevo: guildId:categoryId
                        this.ticketCounters.set(key, value.count || value);
                    } else {
                        // Formato antiguo: solo guildId (migrar a nuevo formato)
                        const count = typeof value === 'number' ? value : value.count;
                        this.ticketCounters.set(key, count);
                    }
                });
                logger.success('Contadores de tickets cargados desde archivo');
            }
        } catch (error) {
            logger.error('Error al cargar contadores de tickets', error);
        }
    }

    /**
     * Guarda los contadores de tickets en archivo
     */
    saveTicketCounters() {
        try {
            const data = {};
            for (const [key, count] of this.ticketCounters.entries()) {
                // key puede ser "guildId" o "guildId:categoryId"
                const guildId = key.includes(':') ? key.split(':')[0] : key;
                const guild = this.client.guilds.cache.get(guildId);
                const guildName = guild ? guild.name : 'Servidor Desconocido';
                
                if (key.includes(':')) {
                    // Formato nuevo con categoría
                    const categoryId = key.split(':')[1];
                    data[key] = {
                        name: `${guildName} - ${categoryId}`,
                        count: count,
                    };
                } else {
                    // Formato antiguo solo guild
                    data[key] = {
                        name: guildName,
                        count: count,
                    };
                }
            }
            writeJSONLegacy(this.TICKET_DATA_FILE, data);
        } catch (error) {
            logger.error('Error al guardar contadores de tickets', error);
        }
    }

    /**
     * Guarda los datos de canales de voz
     */
    saveVoiceSupportData() {
        try {
            const data = {};
            for (const [key, value] of this.voiceSupportUsage.entries()) {
                data[key] = {
                    uses: value.uses,
                    voiceChannelId: value.voiceChannelId,
                    creatorId: value.creatorId,
                    ticketChannelId: value.ticketChannelId,
                    guildId: value.guildId,
                    ticketNumber: value.ticketNumber,
                    startTime: value.startTime || Date.now(),
                    participants: value.participants || [], // Guardar participantes
                };
            }
            writeJSONLegacy(this.VOICE_SUPPORT_FILE, data);
        } catch (error) {
            logger.error('Error al guardar datos de canales de voz', error);
        }
    }

    /**
     * Carga la metadata de tickets desde archivo
     */
    loadTicketMetadata() {
        try {
            const data = readJSONLegacy(this.TICKET_METADATA_FILE);
            if (data) {
                this.ticketMetadata = new Map(Object.entries(data));
                logger.success('Metadata de tickets cargada desde archivo');
            }
        } catch (error) {
            logger.error('Error al cargar metadata de tickets', error);
        }
    }

    /**
     * Guarda la metadata de tickets en archivo
     */
    saveTicketMetadata() {
        try {
            const data = Object.fromEntries(this.ticketMetadata);
            writeJSONLegacy(this.TICKET_METADATA_FILE, data);
        } catch (error) {
            logger.error('Error al guardar metadata de tickets', error);
        }
    }

    /**
     * Obtiene la metadata de un ticket
     */
    getTicketMetadata(channelId) {
        return this.ticketMetadata.get(channelId) || null;
    }

    /**
     * Establece la metadata de un ticket
     */
    setTicketMetadata(channelId, metadata) {
        this.ticketMetadata.set(channelId, metadata);
        this.saveTicketMetadata();
    }

    /**
     * Elimina la metadata de un ticket
     */
    deleteTicketMetadata(channelId) {
        this.ticketMetadata.delete(channelId);
        this.saveTicketMetadata();
    }

    /**
     * Carga los datos de canales de voz y restaura timers
     */
    async loadVoiceSupportData() {
        try {
            const data = readJSONLegacy(this.VOICE_SUPPORT_FILE);
            if (!data) return;

            for (const [key, value] of Object.entries(data)) {
                if (value.voiceChannelId) {
                    try {
                        const guild = await this.client.guilds.fetch(value.guildId);
                        const voiceChannel = await guild.channels.fetch(value.voiceChannelId).catch(() => null);

                        if (voiceChannel) {
                            const elapsed = Date.now() - (value.startTime || Date.now());
                            const remaining = 15 * 60 * 1000 - elapsed;

                            this.voiceSupportUsage.set(key, {
                                uses: value.uses,
                                voiceChannelId: value.voiceChannelId,
                                creatorId: value.creatorId,
                                ticketChannelId: value.ticketChannelId,
                                guildId: value.guildId,
                                ticketNumber: value.ticketNumber,
                                startTime: value.startTime,
                                timeoutId: null,
                                participants: value.participants || [], // Cargar participantes
                            });

                            if (remaining > 0) {
                                this.scheduleVoiceChannelDeletion(key, remaining, guild, value.voiceChannelId, value.ticketNumber);
                                logger.info(`⏱️ Timer restaurado para ticket ${value.ticketNumber} con ${Math.round(remaining / 1000)}s restantes`);
                            } else {
                                await this.deleteVoiceChannel(guild, voiceChannel, value.ticketNumber);
                            }
                        } else {
                            this.voiceSupportUsage.set(key, {
                                uses: value.uses,
                                voiceChannelId: null,
                                creatorId: value.creatorId,
                                ticketChannelId: value.ticketChannelId,
                                guildId: value.guildId,
                                ticketNumber: value.ticketNumber,
                                startTime: value.startTime,
                                timeoutId: null,
                                participants: value.participants || [], // Cargar participantes
                            });
                        }
                    } catch (error) {
                        logger.error(`Error al cargar canal de voz para ${key}`, error);
                    }
                }
            }
            logger.success(`${this.voiceSupportUsage.size} registros de canales de voz cargados desde archivo`);
        } catch (error) {
            logger.error('Error al cargar datos de canales de voz', error);
        }
    }

    /**
     * Programa la eliminación de un canal de voz
     */
    scheduleVoiceChannelDeletion(key, delay, guild, voiceChannelId, ticketNumber) {
        const ticketData = this.voiceSupportUsage.get(key);
        if (!ticketData) return;

        ticketData.timeoutId = setTimeout(async () => {
            try {
                const channel = await guild.channels.fetch(voiceChannelId).catch(() => null);
                if (channel) {
                    await this.deleteVoiceChannel(guild, channel, ticketNumber);
                }
                ticketData.voiceChannelId = null;
                ticketData.timeoutId = null;
                this.saveVoiceSupportData();
            } catch (error) {
                logger.error('Error al eliminar canal de voz por timeout', error);
            }
        }, delay);
    }

    /**
     * Elimina un canal de voz y desconecta usuarios
     */
    async deleteVoiceChannel(guild, channel, ticketNumber) {
        try {
            const members = channel.members;
            logger.info(`👥 Desconectando ${members.size} usuario(s) del canal de voz del ticket ${ticketNumber}`);

            // Crear lista de participantes antes de desconectar
            const participantsList = Array.from(members.values())
                .map(m => `${m.user.tag} (<@${m.user.id}>)`)
                .join('\n') || 'Ninguno';

            for (const [memberId, member] of members) {
                try {
                    await member.voice.disconnect('Timer de 15 minutos finalizado');
                } catch (error) {
                    logger.error(`Error al desconectar a ${member.user.tag}`, error);
                }
            }

            // Registrar log ANTES de eliminar el canal
            const voiceKey = `${guild.id}:${ticketNumber}`;
            const data = this.getVoiceSupportData(voiceKey);
            
            try {
                const { EmbedBuilder } = require('discord.js');
                const ticketChannel = data?.ticketChannelId ? 
                    await guild.channels.fetch(data.ticketChannelId).catch(() => null) : null;
                
                if (config.logs?.enabled && config.logs.channels?.channels) {
                    const logChannel = await guild.channels.fetch(config.logs.channels.channels);
                    
                    const embed = new EmbedBuilder()
                        .setColor('#FF6B6B')
                        .setTitle('🔴 Canal de Voz de Ticket Eliminado')
                        .setDescription('Canal de soporte por voz eliminado automáticamente');
                    
                    // Obtener quien eliminó (audit logs)
                    let eliminadoPor = 'Sistema (Timer 15min)';
                    try {
                        const { AuditLogEvent } = require('discord.js');
                        const auditLogs = await guild.fetchAuditLogs({
                            type: AuditLogEvent.ChannelDelete,
                            limit: 1,
                        });
                        const deleteLog = auditLogs.entries.first();
                        if (deleteLog && deleteLog.target.id === channel.id && Date.now() - deleteLog.createdTimestamp < 3000) {
                            eliminadoPor = `${deleteLog.executor}`;
                        }
                    } catch (error) {
                        // Ignorar error de audit logs
                    }
                    
                    embed.addFields(
                        { name: 'Canal de Voz', value: channel.name, inline: true },
                        { name: 'Ticket Asociado', value: ticketChannel ? `${ticketChannel}` : `Ticket #${ticketNumber}`, inline: true }
                    );
                    
                    embed.addFields({ name: 'ID Canal Voz', value: channel.id, inline: false });
                    
                    embed.addFields(
                        { name: 'Eliminado por', value: eliminadoPor, inline: true },
                        { name: 'Ticket #', value: ticketNumber.toString(), inline: true }
                    );
                    
                    // Registrar duración si hay datos
                    if (data?.startTime) {
                        const duration = Date.now() - data.startTime;
                        const minutes = Math.floor(duration / 60000);
                        const seconds = Math.floor((duration % 60000) / 1000);
                        
                        embed.setFooter({ text: `⏱️ Duración: ${minutes}m ${seconds}s • Timer de 15 minutos expirado` });
                    } else {
                        embed.setFooter({ text: '⏱️ Timer de 15 minutos expirado' });
                    }
                    
                    // Mostrar TODOS los participantes históricos del canal
                    if (data?.participants && data.participants.length > 0) {
                        const participantMentions = data.participants
                            .map(id => `<@${id}>`)
                            .join(', ');
                        
                        let description = `Canal de soporte por voz eliminado automáticamente\n\n` +
                            `**👥 Participantes (${data.participants.length}):** ${participantMentions.substring(0, 900)}`;
                        
                        // También mostrar quiénes estaban conectados al momento de expirar
                        if (members.size > 0) {
                            description += `\n\n**⚠️ Conectados al expirar:** ${participantsList.substring(0, 200)}`;
                        }
                        
                        embed.setDescription(description);
                    } else if (members.size > 0) {
                        embed.setDescription(
                            `Canal de soporte por voz eliminado automáticamente\n\n` +
                            `**⚠️ Conectados al expirar:** ${participantsList.substring(0, 900)}`
                        );
                    }
                    
                    embed.setTimestamp();
                    
                    await logChannel.send({ embeds: [embed] });
                }
            } catch (logError) {
                logger.error('Error al enviar log de eliminación de canal de voz', logError);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            await channel.delete();
            logger.info(`🎤 Canal de voz del ticket ${ticketNumber} eliminado (15 minutos transcurridos)`);
        } catch (error) {
            logger.error('Error al eliminar canal de voz', error);
        }
    }

    /**
     * Crea un nuevo ticket
     */
    async createTicket(guild, user, category) {
        // Usar contador separado por categoría: "guildId:categoryType"
        const counterKey = `${guild.id}:${category.value}`;
        
        if (!this.ticketCounters.has(counterKey)) {
            this.ticketCounters.set(counterKey, 0);
        }

        const ticketNumber = this.ticketCounters.get(counterKey) + 1;
        this.ticketCounters.set(counterKey, ticketNumber);

        const ticketCategoryId = category.categoryId;
        const staffRoleId = config.tickets.staffRoleId;

        // Formato: (emoji)┃(categoría)-(número)
        // Sanitizar nombre de categoría para Discord (minúsculas, sin espacios, sin acentos)
        const sanitizedCategoryName = category.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
            .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
        
        let ticketName = `${category.emoji}┃${sanitizedCategoryName}-${ticketNumber}`;

        // Permisos base
        const permissionOverwrites = [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            },
        ];

        // Verificar si la categoría tiene roles específicos permitidos
        const allowedRoles = category.allowedRoles || [];
        const hierarchyRoles = config.tickets.hierarchy;
        const soporteRoleId = hierarchyRoles.soporte.roleId;
        const moderadorRoleId = hierarchyRoles.moderador.roleId;
        const administradorRoleId = hierarchyRoles.administrador.roleId;
        
        if (allowedRoles.length > 0) {
            // Determinar el rol de nivel más bajo presente (fallback jerárquico)
            const hasSupport = allowedRoles.includes(soporteRoleId);
            const hasModerator = allowedRoles.includes(moderadorRoleId);
            const hasAdministrator = allowedRoles.includes(administradorRoleId);
            
            // Rol de nivel más bajo que puede escribir
            let lowestWriterRoleId = null;
            if (hasSupport) {
                lowestWriterRoleId = soporteRoleId;
            } else if (hasModerator) {
                lowestWriterRoleId = moderadorRoleId;
            } else if (hasAdministrator) {
                lowestWriterRoleId = administradorRoleId;
            }
            
            // Usar roles específicos de la categoría
            for (const roleId of allowedRoles) {
                const isHierarchyRole = [soporteRoleId, moderadorRoleId, administradorRoleId].includes(roleId);
                
                if (isHierarchyRole) {
                    // Aplicar jerarquía: solo el rol de nivel más bajo puede escribir
                    const canWrite = (roleId === lowestWriterRoleId);
                    
                    if (canWrite) {
                        permissionOverwrites.push({
                            id: roleId,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                            ],
                        });
                    } else {
                        permissionOverwrites.push({
                            id: roleId,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.ReadMessageHistory,
                            ],
                            deny: [
                                PermissionFlagsBits.SendMessages,
                            ],
                        });
                    }
                } else {
                    // Roles no jerárquicos (Directiva, departamentos, etc.) tienen permisos completos
                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                        ],
                    });
                }
            }
            const rolesList = allowedRoles.join(', ');
            logger.info(`🔐 Ticket #${ticketNumber} (${category.name}) - Jerarquía aplicada. Rol escritor inicial: ${lowestWriterRoleId || 'ninguno'}`);
        } else {
            // Usar staffRoleId general si no hay roles específicos
            permissionOverwrites.push({
                id: staffRoleId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            });
            logger.info(`🔐 Ticket #${ticketNumber} (${category.name}) - Usando staffRoleId general: ${staffRoleId}`);
        }

        const channel = await guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: ticketCategoryId,
            permissionOverwrites: permissionOverwrites,
        });

        this.saveTicketCounters();
        
        // Inicializar datos de voz support
        const voiceKey = `${guild.id}:${ticketNumber}`;
        this.voiceSupportUsage.set(voiceKey, {
            uses: 0,
            voiceChannelId: null,
            timeoutId: null,
            creatorId: user.id,
            guildId: guild.id,
            ticketNumber: ticketNumber.toString(),
            ticketChannelId: channel.id,
            startTime: Date.now(),
        });
        this.saveVoiceSupportData();

        return { channel, ticketNumber };
    }

    /**
     * Obtiene el siguiente número de ticket
     */
    getNextTicketNumber(guildId) {
        if (!this.ticketCounters.has(guildId)) {
            this.ticketCounters.set(guildId, 0);
        }
        return this.ticketCounters.get(guildId) + 1;
    }

    /**
     * Obtiene datos de voice support por key
     */
    getVoiceSupportData(key) {
        return this.voiceSupportUsage.get(key);
    }

    /**
     * Establece datos de voice support
     */
    setVoiceSupportData(key, data) {
        this.voiceSupportUsage.set(key, data);
        this.saveVoiceSupportData();
    }

    /**
     * Elimina datos de voice support
     */
    deleteVoiceSupportData(key) {
        this.voiceSupportUsage.delete(key);
        this.saveVoiceSupportData();
    }

    /**
     * Obtiene todas las entradas de voice support
     */
    getAllVoiceSupportEntries() {
        return this.voiceSupportUsage.entries();
    }
}

module.exports = TicketsSystem;
