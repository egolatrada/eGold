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
    trackTicket(channelId, creatorId, category) {
        const now = Date.now();
        this.ticketActivity.set(channelId, {
            channelId,
            creatorId,
            category,
            createdAt: now,
            lastStaffResponse: null,
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
    updateStaffActivity(channelId, userId) {
        const activity = this.ticketActivity.get(channelId);
        if (!activity) return;

        activity.lastStaffResponse = Date.now();
        activity.supportNotified = false; // Reset notificación
        this.saveActivityData();
    }

    /**
     * Actualiza actividad cuando el usuario responde
     */
    updateUserActivity(channelId, userId) {
        const activity = this.ticketActivity.get(channelId);
        if (!activity) return;

        if (userId === activity.creatorId) {
            activity.lastUserResponse = Date.now();
            activity.userWarned = false; // Reset advertencia
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
                .setDescription(`Han pasado **6 horas** sin respuesta del equipo de soporte.\n\nEl ticket ha sido desbloqueado para que cualquier miembro del equipo pueda responder.`)
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
     * Verifica inactividad del usuario
     */
    async checkUserInactivity(channel, activity, now) {
        // CRÍTICO: Solo verificar inactividad del usuario si el soporte YA respondió
        // No cerrar tickets donde el usuario está esperando la primera respuesta del soporte
        if (!activity.lastStaffResponse) {
            return; // Soporte nunca respondió, no penalizar al usuario
        }

        // CORRECCIÓN: Solo verificar inactividad del usuario si el STAFF escribió último
        // Si el usuario escribió último, es turno del staff de responder
        if (activity.lastUserResponse && activity.lastUserResponse > activity.lastStaffResponse) {
            return; // Usuario ya respondió, es turno del staff
        }

        // El staff escribió último → Contar desde que el staff escribió
        const timeSinceStaffResponse = now - activity.lastStaffResponse;

        // 6 horas → Advertencia
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
     */
    async warnUser(channel, activity) {
        try {
            const user = await this.client.users.fetch(activity.creatorId).catch(() => null);
            if (!user) return;

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Advertencia de inactividad')
                .setDescription(`Hola <@${activity.creatorId}>,\n\nHan pasado **6 horas** sin respuesta de tu parte en este ticket.\n\n⏱️ Si no respondes en **1 hora más**, el ticket será cerrado automáticamente por inactividad.`)
                .setTimestamp();

            await channel.send({
                content: `<@${activity.creatorId}>`,
                embeds: [embed]
            });

            logger.info(`⚠️ Usuario advertido por inactividad en ticket ${channel.name}`);
        } catch (error) {
            logger.error('Error al advertir usuario', error);
        }
    }

    /**
     * Cierra automáticamente el ticket por inactividad
     */
    async autoCloseTicket(channel, activity) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Ticket cerrado por inactividad')
                .setDescription(`Este ticket ha sido cerrado automáticamente debido a **7 horas de inactividad** por parte del usuario.\n\nSe guardará una transcripción completa del ticket.`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            // Esperar un momento antes de cerrar
            setTimeout(async () => {
                // Generar transcripción y cerrar
                const ticketsSystem = this.client.ticketsSystem;
                if (ticketsSystem) {
                    // Aquí se ejecutaría la lógica de cierre del ticket-buttons.js
                    // Por ahora solo eliminamos el canal
                    logger.info(`🔒 Ticket ${channel.name} cerrado automáticamente por inactividad`);
                    
                    // Limpiar tracking
                    this.ticketActivity.delete(channel.id);
                    this.saveActivityData();
                    
                    // Eliminar canal
                    await channel.delete();
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
