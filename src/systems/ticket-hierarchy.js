const { PermissionFlagsBits } = require('discord.js');
const { readJSONLegacy, writeJSONLegacy } = require('../services/storage');
const { config } = require('../config');
const logger = require('../utils/logger');

class TicketHierarchy {
    constructor(client) {
        this.client = client;
        this.activeTickets = new Map();
        this.HIERARCHY_DATA_FILE = './src/data/ticket-hierarchy.json';
    }

    loadHierarchyData() {
        try {
            const data = readJSONLegacy(this.HIERARCHY_DATA_FILE);
            if (data) {
                Object.entries(data).forEach(([channelId, ticketData]) => {
                    this.activeTickets.set(channelId, ticketData);
                });
                logger.success(`${this.activeTickets.size} tickets activos cargados desde archivo`);
            }
        } catch (error) {
            logger.error('Error al cargar datos de jerarquía de tickets', error);
        }
    }

    saveHierarchyData() {
        try {
            const data = {};
            for (const [channelId, ticketData] of this.activeTickets.entries()) {
                data[channelId] = ticketData;
            }
            writeJSONLegacy(this.HIERARCHY_DATA_FILE, data);
        } catch (error) {
            logger.error('Error al guardar datos de jerarquía de tickets', error);
        }
    }

    async handleMessage(message) {
        if (!config.tickets?.hierarchyEnabled) return;
        if (message.author.bot) return;
        if (!message.channel.name?.startsWith('ticket-')) return;

        const channel = message.channel;
        const member = message.member;
        
        const hierarchyRoles = config.tickets.hierarchy;
        const soporteRoleId = hierarchyRoles.soporte.roleId;
        const moderadorRoleId = hierarchyRoles.moderador.roleId;
        const administradorRoleId = hierarchyRoles.administrador.roleId;

        const hasSoporteRole = member.roles.cache.has(soporteRoleId);
        const hasModeradorRole = member.roles.cache.has(moderadorRoleId);
        const hasAdministradorRole = member.roles.cache.has(administradorRoleId);

        const isStaff = hasSoporteRole || hasModeradorRole || hasAdministradorRole;
        
        if (!isStaff) return;

        let ticketData = this.activeTickets.get(channel.id);

        if (!ticketData) {
            // Determinar el rol del staff que está respondiendo
            let staffRole = null;
            if (hasSoporteRole) staffRole = 'soporte';
            else if (hasModeradorRole) staffRole = 'moderador';
            else if (hasAdministradorRole) staffRole = 'administrador';

            if (staffRole) {
                await this.lockTicketForRole(channel, member.id, staffRole);
                logger.info(`🔒 Ticket ${channel.name} bloqueado por ${staffRole}: ${member.user.tag}`);
            }
        } else {
            await this.handleRoleMentions(message, channel, ticketData);
        }
    }

    async lockTicketForRole(channel, userId, role) {
        const hierarchyRoles = config.tickets.hierarchy;
        const soporteRoleId = hierarchyRoles.soporte.roleId;
        const moderadorRoleId = hierarchyRoles.moderador.roleId;
        const administradorRoleId = hierarchyRoles.administrador.roleId;

        try {
            // Determinar qué roles bloquear según quién esté manejando el ticket
            if (role === 'soporte') {
                // Soporte maneja → bloquear Moderador y Administrador
                await channel.permissionOverwrites.edit(moderadorRoleId, {
                    ViewChannel: true,
                    SendMessages: false,
                    ReadMessageHistory: true,
                });
                await channel.permissionOverwrites.edit(administradorRoleId, {
                    ViewChannel: true,
                    SendMessages: false,
                    ReadMessageHistory: true,
                });
            } else if (role === 'moderador') {
                // Moderador maneja → bloquear solo Administrador
                await channel.permissionOverwrites.edit(administradorRoleId, {
                    ViewChannel: true,
                    SendMessages: false,
                    ReadMessageHistory: true,
                });
            }
            // Si es administrador, no hay nadie por encima para bloquear

            this.activeTickets.set(channel.id, {
                handledBy: userId,
                role: role,
                escalatedTo: [],
                timestamp: Date.now(),
            });
            
            this.saveHierarchyData();

            logger.info(`🔐 Permisos actualizados: Moderador y Administrador solo lectura`);
        } catch (error) {
            logger.error('Error al bloquear ticket para soporte', error);
        }
    }

    async handleRoleMentions(message, channel, ticketData) {
        const hierarchyRoles = config.tickets.hierarchy;
        const soporteRoleId = hierarchyRoles.soporte.roleId;
        const moderadorRoleId = hierarchyRoles.moderador.roleId;
        const administradorRoleId = hierarchyRoles.administrador.roleId;

        const mentionedModeradorRole = message.mentions.roles.has(moderadorRoleId);
        const mentionedAdministradorRole = message.mentions.roles.has(administradorRoleId);

        const member = message.member;
        const hasSoporteRole = member.roles.cache.has(soporteRoleId);
        const hasModeradorRole = member.roles.cache.has(moderadorRoleId);
        const hasAdministradorRole = member.roles.cache.has(administradorRoleId);

        // Lógica de escalación según el rol que maneja el ticket
        const handlingRole = ticketData.role;

        // Soporte puede escalar a Moderador
        if (mentionedModeradorRole && hasSoporteRole && handlingRole === 'soporte') {
            if (!ticketData.escalatedTo.includes('moderador')) {
                await this.grantWritePermission(channel, moderadorRoleId, 'Moderador');
                ticketData.escalatedTo.push('moderador');
                this.saveHierarchyData();
                
                await message.reply({
                    content: `✅ **Moderador** ahora puede escribir en este ticket.`,
                    allowedMentions: { parse: [] }
                });
                
                logger.info(`📈 Ticket ${channel.name} escalado a Moderador por ${member.user.tag}`);
            }
        }

        // Moderador puede escalar a Administrador (tanto si maneja el ticket como si ya fue escalado)
        if (mentionedAdministradorRole && hasModeradorRole && (handlingRole === 'soporte' || handlingRole === 'moderador')) {
            if (!ticketData.escalatedTo.includes('administrador')) {
                await this.grantWritePermission(channel, administradorRoleId, 'Administrador');
                ticketData.escalatedTo.push('administrador');
                this.saveHierarchyData();
                
                await message.reply({
                    content: `✅ **Administrador** ahora puede escribir en este ticket.`,
                    allowedMentions: { parse: [] }
                });
                
                logger.info(`📈 Ticket ${channel.name} escalado a Administrador por ${member.user.tag}`);
            }
        }
    }

    async grantWritePermission(channel, roleId, roleName) {
        try {
            await channel.permissionOverwrites.edit(roleId, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            });
            
            logger.info(`✅ ${roleName} ahora tiene permisos de escritura en ${channel.name}`);
        } catch (error) {
            logger.error(`Error al otorgar permisos a ${roleName}`, error);
        }
    }

    async removeTicket(channelId) {
        this.activeTickets.delete(channelId);
        this.saveHierarchyData();
        logger.info(`🗑️ Ticket ${channelId} removido del sistema de jerarquía`);
    }

    isTicketLocked(channelId) {
        return this.activeTickets.has(channelId);
    }

    getTicketData(channelId) {
        return this.activeTickets.get(channelId);
    }
}

module.exports = TicketHierarchy;
