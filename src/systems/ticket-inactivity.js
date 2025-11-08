const { EmbedBuilder } = require('discord.js');
const { readJSONLegacy, writeJSONLegacy } = require('../services/storage');
const { config } = require('../config');
const logger = require('../utils/logger');

class TicketInactivity {
    constructor(client) {
        this.client = client;
        this.ticketActivity = new Map();
        this.ACTIVITY_DATA_FILE = './src/data/ticket-activity.json';
        this.checkInterval = null;
        
        // Tiempos de inactividad
        this.SUPPORT_INACTIVITY_TIME = 6 * 60 * 60 * 1000; // 6 horas
        this.USER_WARNING_TIME = 6 * 60 * 60 * 1000; // 6 horas
        this.USER_CLOSE_TIME = 7 * 60 * 60 * 1000; // 7 horas
    }

    loadActivityData() {
        try {
            const data = readJSONLegacy(this.ACTIVITY_DATA_FILE);
            if (data) {
                Object.entries(data).forEach(([channelId, activityData]) => {
                    this.ticketActivity.set(channelId, activityData);
                });
                logger.success(`${this.ticketActivity.size} tickets con tracking de actividad cargados`);
            }
        } catch (error) {
            logger.error('Error al cargar datos de actividad de tickets', error);
        }
    }

    saveActivityData() {
        try {
            const data = {};
            for (const [channelId, activityData] of this.ticketActivity.entries()) {
                data[channelId] = activityData;
            }
            writeJSONLegacy(this.ACTIVITY_DATA_FILE, data);
        } catch (error) {
            logger.error('Error al guardar datos de actividad de tickets', error);
        }
    }

    /**
     * Registra un nuevo ticket
     */
    trackTicket(channelId, creatorId, category, creatorType = 'usuario') {
        const now = Date.now();
        this.ticketActivity.set(channelId, {
            channelId,
            creatorId,
            creatorType,
            category,
            createdAt: now,
            lastStaffResponse: null,
            lastStaffRoleId: null,
            lastUserResponse: now,
            userWarned: false,
            supportNotified: false,
            keepActive: false,
            keepActiveUntil: null
        });
        this.saveActivityData();
        logger.info(`🕒 Tracking de actividad iniciado para ticket ${channelId}`);
    }

    /**
     * Actualiza actividad cuando el staff responde
     */
    updateStaffActivity(channelId, userId, staffRoleId = null) {
        const activity = this.ticketActivity.get(channelId);
        if (!activity) return;

        activity.lastStaffResponse = Date.now();
        activity.lastStaffRoleId = staffRoleId;
        activity.supportNotified = false; // Reset notificación
        this.saveActivityData();
    }

    /**
     * Actualiza actividad cuando el usuario responde
     */
    async updateUserActivity(channelId, userId, member = null) {
        const activity = this.ticketActivity.get(channelId);
        if (!activity) return;

        let isCreator = false;

        if (activity.creatorType === 'usuario') {
            // Ticket creado para un usuario específico
            isCreator = (userId === activity.creatorId);
        } else if (activity.creatorType === 'rol') {
            // Ticket creado para un rol - verificar si el usuario tiene ese rol
            if (member && member.roles.cache.has(activity.creatorId)) {
                isCreator = true;
            }
        }

        if (isCreator) {
            activity.lastUserResponse = Date.now();
            activity.userWarned = false; // Reset advertencia
            activity.supportNotified = false; // Reset notificación al staff
            this.saveActivityData();
        }
    }

    /**
     * Marca un ticket como "mantener activo" permanentemente
     * Si hours es null, se marca como permanente (sin expiración)
     */
    setKeepActive(channelId, hours = null) {
        const activity = this.ticketActivity.get(channelId);
        if (!activity) return false;

        activity.keepActive = true;
        
        // Si hours es null, se marca como permanente
        if (hours === null) {
            activity.keepActiveUntil = null; // Permanente
            logger.info(`🔒 Ticket ${channelId} marcado como activo PERMANENTEMENTE`);
        } else {
            activity.keepActiveUntil = Date.now() + (hours * 60 * 60 * 1000);
            logger.info(`🔒 Ticket ${channelId} marcado como activo por ${hours} horas`);
        }
        
        this.saveActivityData();
        return true;
    }

    /**
     * Verifica si un ticket debe mantenerse activo
     */
    shouldKeepActive(activity) {
        if (!activity.keepActive) return false;
        
        // Si keepActiveUntil es null → Permanente (solo cierre manual)
        if (activity.keepActiveUntil === null) {
            return true; // Mantener activo permanentemente
        }
        
        // Si tiene tiempo de expiración y no ha expirado
        if (activity.keepActiveUntil && Date.now() < activity.keepActiveUntil) {
            return true;
        }
        
        // Expiró el tiempo de mantener activo
        // CRÍTICO: Resetear los timers para dar al usuario 6/7 horas DESPUÉS de la expiración
        const now = Date.now();
        activity.keepActive = false;
        activity.keepActiveUntil = null;
        activity.lastStaffResponse = now; // Resetear baseline
        activity.lastUserResponse = now; // Resetear baseline
        activity.userWarned = false; // Resetear advertencia
        this.saveActivityData();
        
        logger.info(`⏰ Período "mantener activo" expirado para ticket ${activity.channelId} - Timer reseteado`);
        return false;
    }

    /**
     * Inicia el chequeo periódico de inactividad
     */
    startInactivityCheck() {
        // Verificar cada 5 minutos
        this.checkInterval = setInterval(() => {
            this.checkAllTickets();
        }, 5 * 60 * 1000);
        
        logger.success('🕒 Sistema de inactividad de tickets iniciado (verificación cada 5 minutos)');
    }

    /**
     * Detiene el chequeo periódico
     */
    stopInactivityCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Verifica todos los tickets activos
     */
    async checkAllTickets() {
        const now = Date.now();
        
        for (const [channelId, activity] of this.ticketActivity.entries()) {
            // Si está marcado como "mantener activo", saltar
            if (this.shouldKeepActive(activity)) {
                continue;
            }

            try {
                const channel = await this.client.channels.fetch(channelId).catch(() => null);
                if (!channel) {
                    // Canal no existe, limpiar tracking
                    this.ticketActivity.delete(channelId);
                    this.saveActivityData();
                    continue;
                }

                // Verificar inactividad del soporte
                await this.checkSupportInactivity(channel, activity, now);

                // Verificar inactividad del usuario
                await this.checkUserInactivity(channel, activity, now);

            } catch (error) {
                logger.error(`Error al verificar inactividad del ticket ${channelId}`, error);
            }
        }
    }

    /**
     * Verifica inactividad del soporte
     */
    async checkSupportInactivity(channel, activity, now) {
        // Si el soporte nunca respondió, calcular desde creación del ticket
        const referenceTime = activity.lastStaffResponse || activity.createdAt;
        const timeSinceLastResponse = now - referenceTime;

        // Si han pasado 6 horas sin respuesta del soporte
        if (timeSinceLastResponse >= this.SUPPORT_INACTIVITY_TIME && !activity.supportNotified) {
            await this.notifySupport(channel, activity);
            activity.supportNotified = true;
            this.saveActivityData();
        }
    }

    /**
     * Notifica al soporte y desbloquea el ticket
     */
    async notifySupport(channel, activity) {
        try {
            const category = config.tickets.categories[activity.category];
            if (!category) return;

            const allowedRoles = category.allowedRoles || [];
            let roleMentions = '';
            
            if (allowedRoles.length > 0) {
                roleMentions = allowedRoles.map(roleId => `<@&${roleId}>`).join(' ');
            } else {
                roleMentions = `<@&${config.tickets.staffRoleId}>`;
            }

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⏰ Ticket sin respuesta del soporte')
                .setDescription(`${roleMentions}\n\nHan pasado **6 horas** sin respuesta del equipo de soporte.\n\nEl ticket ha sido desbloqueado para que cualquier miembro del equipo pueda responder.`)
                .setTimestamp();

            await channel.send({
                content: roleMentions,
                embeds: [embed]
            });

            // Desbloquear permisos para que cualquier soporte pueda escribir
            // (esto se maneja en el sistema de jerarquía)
            const hierarchyRoles = config.tickets.hierarchy;
            if (hierarchyRoles && config.tickets.hierarchyEnabled) {
                // Dar permisos de escritura a todos los roles de soporte
                const soporteRoleId = hierarchyRoles.soporte.roleId;
                await channel.permissionOverwrites.edit(soporteRoleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                });
            }

            logger.info(`⏰ Soporte notificado por inactividad en ticket ${channel.name}`);
        } catch (error) {
            logger.error('Error al notificar soporte', error);
        }
    }

    /**
     * Verifica inactividad del usuario y del staff
     */
    async checkUserInactivity(channel, activity, now) {
        // CRÍTICO: Solo verificar inactividad si el soporte YA respondió al menos una vez
        if (!activity.lastStaffResponse) {
            return; // Soporte nunca respondió, solo notificar en checkSupportInactivity
        }

        // Caso 1: Usuario escribió último → Es turno del staff de responder
        if (activity.lastUserResponse && activity.lastUserResponse > activity.lastStaffResponse) {
            const timeSinceUserResponse = now - activity.lastUserResponse;
            
            // 6 horas sin respuesta del staff → Notificar al rol específico
            if (timeSinceUserResponse >= this.SUPPORT_INACTIVITY_TIME && !activity.supportNotified) {
                await this.warnUser(channel, activity); // Esta función ahora maneja ambos casos
                activity.supportNotified = true;
                this.saveActivityData();
            }
            return;
        }

        // Caso 2: Staff escribió último → Es turno del usuario de responder
        const timeSinceStaffResponse = now - activity.lastStaffResponse;

        // 6 horas → Advertencia al usuario
        if (timeSinceStaffResponse >= this.USER_WARNING_TIME && !activity.userWarned) {
            await this.warnUser(channel, activity);
            activity.userWarned = true;
            this.saveActivityData();
        }

        // 7 horas → Cierre automático
        if (timeSinceStaffResponse >= this.USER_CLOSE_TIME && activity.userWarned) {
            await this.autoCloseTicket(channel, activity);
        }
    }

    /**
     * Advierte al usuario sobre la inactividad
     * Si el último mensaje fue del usuario, menciona al rol del staff que estaba respondiendo
     * Si el último mensaje fue del staff, menciona al usuario creador del ticket
     */
    async warnUser(channel, activity) {
        try {
            // Si el último mensaje fue del staff, advertir al usuario
            if (activity.lastUserResponse && activity.lastUserResponse > activity.lastStaffResponse) {
                // Usuario escribió último → Mencionar al rol específico del staff
                let roleMention = '';
                if (activity.lastStaffRoleId) {
                    roleMention = `<@&${activity.lastStaffRoleId}>`;
                } else {
                    // Fallback: usar todos los roles permitidos
                    const category = config.tickets.categories[activity.category];
                    const allowedRoles = category?.allowedRoles || [];
                    roleMention = allowedRoles.length > 0 
                        ? allowedRoles.map(roleId => `<@&${roleId}>`).join(' ')
                        : `<@&${config.tickets.staffRoleId}>`;
                }

                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⏰ Usuario esperando respuesta')
                    .setDescription(`${roleMention}\n\nEl usuario lleva **6 horas** esperando respuesta en este ticket.\n\n⏱️ Por favor, responde lo antes posible.`)
                    .setTimestamp();

                await channel.send({
                    content: roleMention,
                    embeds: [embed]
                });

                logger.info(`⏰ Rol de staff notificado por inactividad en ticket ${channel.name}`);
            } else {
                // Staff escribió último → Advertir al usuario
                const userMention = activity.creatorType === 'usuario' 
                    ? `<@${activity.creatorId}>`
                    : `<@&${activity.creatorId}>`;

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⚠️ Advertencia de inactividad')
                    .setDescription(`Hola ${userMention},\n\nHan pasado **6 horas** sin respuesta de tu parte en este ticket.\n\n⏱️ Si no respondes en **1 hora más**, el ticket será cerrado automáticamente por inactividad.`)
                    .setTimestamp();

                await channel.send({
                    content: userMention,
                    embeds: [embed]
                });

                logger.info(`⚠️ Usuario advertido por inactividad en ticket ${channel.name}`);
            }
        } catch (error) {
            logger.error('Error al advertir usuario', error);
        }
    }

    /**
     * Cierra automáticamente el ticket por inactividad
     */
    async autoCloseTicket(channel, activity) {
        try {
            const creatorMention = activity.creatorType === 'usuario' 
                ? `<@${activity.creatorId}>`
                : `<@&${activity.creatorId}>`;

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Ticket cerrado por inactividad')
                .setDescription(`${creatorMention}\n\nEste ticket ha sido cerrado automáticamente debido a **7 horas de inactividad** por parte del usuario.\n\nSe guardará una transcripción completa del ticket.`)
                .setTimestamp();

            await channel.send({ 
                content: creatorMention,
                embeds: [embed] 
            });

            // Esperar un momento antes de generar transcripción y cerrar
            setTimeout(async () => {
                try {
                    const ticketsSystem = this.client.ticketsSystem;
                    if (!ticketsSystem) {
                        logger.error('Sistema de tickets no disponible para cierre automático');
                        return;
                    }

                    // Obtener metadata del ticket
                    const metadata = ticketsSystem.getTicketMetadata(channel.id);
                    if (!metadata) {
                        logger.error(`No se encontró metadata para el ticket ${channel.name}`);
                        await channel.delete();
                        return;
                    }

                    // Fetch todos los mensajes del ticket
                    let allMessages = [];
                    let lastMessageId = null;

                    while (true) {
                        const options = { limit: 100 };
                        if (lastMessageId) {
                            options.before = lastMessageId;
                        }

                        const fetchedMessages = await channel.messages.fetch(options);
                        if (fetchedMessages.size === 0) break;

                        allMessages.push(...fetchedMessages.values());
                        lastMessageId = fetchedMessages.last().id;

                        if (fetchedMessages.size < 100) break;
                    }

                    const sortedMessages = allMessages.reverse();
                    const category = config.tickets.categories[metadata.type];

                    if (!category || !category.transcriptChannelId) {
                        logger.error(`Categoría o canal de transcripciones no configurado para ${metadata.type}`);
                        await channel.delete();
                        return;
                    }

                    const transcriptChannel = await channel.guild.channels.fetch(category.transcriptChannelId).catch(() => null);
                    if (!transcriptChannel) {
                        logger.error(`Canal de transcripciones no encontrado: ${category.transcriptChannelId}`);
                        await channel.delete();
                        return;
                    }

                    // Generar lista de participantes
                    const participantIds = new Set();
                    sortedMessages.forEach((msg) => {
                        if (!msg.author.bot) {
                            participantIds.add(msg.author.id);
                        }
                    });

                    const participantMentions = Array.from(participantIds)
                        .map((id) => `<@${id}>`)
                        .join(", ");

                    // Crear embed de transcripción
                    const transcriptEmbed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle(`📋 Transcripción de Ticket - ${channel.name} (Cerrado por Inactividad)`)
                        .setDescription(
                            `**Creador:** ${metadata.creatorTag} (<@${metadata.creator}>)\n\n` +
                            `**Creado:** <t:${Math.floor(metadata.createdAt / 1000)}:F>\n` +
                            `**Cerrado:** <t:${Math.floor(Date.now() / 1000)}:F>\n` +
                            `**Motivo:** Inactividad del usuario (7 horas)\n\n` +
                            `**Participantes:** ${participantMentions}`
                        );

                    // Generar transcripción completa en texto
                    let fullTranscript = `=== TRANSCRIPCIÓN COMPLETA ===\n`;
                    fullTranscript += `Tipo: ${metadata.categoryName}\n`;
                    fullTranscript += `Canal: ${channel.name}\n`;
                    fullTranscript += `Creador: ${metadata.creatorTag} (${metadata.creator})\n`;
                    fullTranscript += `Número: #${metadata.ticketNumber}\n`;
                    fullTranscript += `Cerrado por: Inactividad automática (7 horas)\n`;
                    fullTranscript += `Fecha de cierre: ${new Date().toLocaleString("es-ES")}\n`;
                    fullTranscript += `${"=".repeat(50)}\n\n`;

                    for (const msg of sortedMessages) {
                        const timestamp = msg.createdAt.toLocaleString("es-ES");
                        const author = `${msg.author.tag} (${msg.author.id})`;
                        fullTranscript += `[${timestamp}] ${author}:\n${msg.content}\n`;

                        if (msg.embeds.length > 0) {
                            fullTranscript += `  [Embed: ${msg.embeds[0].title || "Sin título"}]\n`;
                        }

                        if (msg.attachments.size > 0) {
                            msg.attachments.forEach((att) => {
                                fullTranscript += `  [Adjunto: ${att.url}]\n`;
                            });
                        }

                        fullTranscript += "\n";
                    }

                    // Enviar transcripción al canal correspondiente
                    const buffer = Buffer.from(fullTranscript, "utf-8");
                    await transcriptChannel.send({
                        embeds: [transcriptEmbed],
                        files: [
                            {
                                attachment: buffer,
                                name: `${channel.name}_inactivity_${Date.now()}.txt`,
                            },
                        ],
                    });

                    logger.success(`✅ Transcripción guardada para ticket ${channel.name} (${sortedMessages.length} mensajes) - Cerrado por inactividad`);
                    
                    // Limpiar tracking
                    this.ticketActivity.delete(channel.id);
                    this.saveActivityData();

                    // Eliminar metadata del ticket
                    ticketsSystem.deleteTicketMetadata(channel.id);
                    
                    // Eliminar canal
                    await channel.delete();
                    logger.info(`🔒 Ticket ${channel.name} cerrado automáticamente por inactividad`);

                } catch (error) {
                    logger.error('Error al generar transcripción y cerrar ticket', error);
                    // Intentar eliminar el canal de todos modos
                    try {
                        await channel.delete();
                    } catch (deleteError) {
                        logger.error('Error al eliminar canal después de fallo en transcripción', deleteError);
                    }
                }
            }, 5000);

        } catch (error) {
            logger.error('Error al cerrar ticket automáticamente', error);
        }
    }

    /**
     * Elimina el tracking de un ticket
     */
    removeTicket(channelId) {
        this.ticketActivity.delete(channelId);
        this.saveActivityData();
        logger.info(`🗑️ Tracking de actividad removido para ticket ${channelId}`);
    }
}

module.exports = TicketInactivity;
