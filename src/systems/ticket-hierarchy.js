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
        const soporteRoleId = hierarchyRoles.soporte?.roleId;
        const moderadorRoleId = hierarchyRoles.moderador?.roleId;
        const administradorRoleId = hierarchyRoles.administrador?.roleId;
        const directivaRoleId = hierarchyRoles.directiva?.roleId;

        const hasSoporteRole = soporteRoleId && member.roles.cache.has(soporteRoleId);
        const hasModeradorRole = moderadorRoleId && member.roles.cache.has(moderadorRoleId);
        const hasAdministradorRole = administradorRoleId && member.roles.cache.has(administradorRoleId);
        const hasDirectivaRole = directivaRoleId && member.roles.cache.has(directivaRoleId);

        const isStaff = hasSoporteRole || hasModeradorRole || hasAdministradorRole || hasDirectivaRole;
        
        if (!isStaff) return;

        let ticketData = this.activeTickets.get(channel.id);

        if (!ticketData) {
            // Determinar el rol del staff que está respondiendo (nivel más bajo primero)
            let staffRole = null;
            if (hasSoporteRole) staffRole = 'soporte';
            else if (hasModeradorRole) staffRole = 'moderador';
            else if (hasAdministradorRole) staffRole = 'administrador';
            else if (hasDirectivaRole) staffRole = 'directiva';

            if (staffRole) {
                await this.lockTicketForRole(channel, member.id, staffRole);
                logger.info(`🔒 Ticket ${channel.name} bloqueado por ${staffRole}: ${member.user.tag}`);
            }
        } else {
            // Determinar el rol del staff que escribe
            let writerRole = null;
            let writerLevel = 0;
            
            if (hasSoporteRole) {
                writerRole = 'soporte';
                writerLevel = 1;
            } else if (hasModeradorRole) {
                writerRole = 'moderador';
                writerLevel = 2;
            } else if (hasAdministradorRole) {
                writerRole = 'administrador';
                writerLevel = 3;
            } else if (hasDirectivaRole) {
                writerRole = 'directiva';
                writerLevel = 4;
            }

            const currentHandlingRole = ticketData.role;
            const currentHandlingLevel = this.getRoleLevel(currentHandlingRole);

            // Si es un nivel superior que ya fue escalado, toma el control del ticket
            if (writerLevel > currentHandlingLevel && ticketData.escalatedTo.includes(writerRole)) {
                // Actualizar el control del ticket al nuevo nivel
                ticketData.handledBy = member.id;
                ticketData.role = writerRole;
                this.saveHierarchyData();
                
                logger.info(`📈 Control del ticket ${channel.name} transferido de ${currentHandlingRole} a ${writerRole} (${member.user.tag})`);
            }
            // BLOQUEO ENTRE MISMO NIVEL: Si otro usuario del mismo nivel intenta escribir
            else if (writerRole === currentHandlingRole && ticketData.handledBy !== member.id) {
                // Verificar si este usuario fue desbloqueado específicamente
                const isUnlocked = ticketData.unlockedSameLevelUsers && ticketData.unlockedSameLevelUsers.includes(member.id);
                
                if (!isUnlocked) {
                    // Bloquear a este usuario específico del mismo nivel
                    await channel.permissionOverwrites.edit(member.id, {
                        ViewChannel: true,
                        SendMessages: false,
                        ReadMessageHistory: true,
                    });
                    
                    await message.delete().catch(() => {});
                    await member.send(`⛔ **Ticket bloqueado**: El ticket \`${channel.name}\` ya está siendo manejado por otro ${currentHandlingRole}. Si necesitas ayuda, menciona a un compañero específico o al rango superior.`).catch(() => {});
                    
                    logger.info(`🚫 ${member.user.tag} (${writerRole}) bloqueado - ticket ya manejado por ${ticketData.handledBy}`);
                    return;
                }
                // Si está desbloqueado, puede escribir libremente
                logger.info(`✅ ${member.user.tag} (${writerRole}) puede escribir - fue desbloqueado específicamente`);
            }

            await this.handleRoleMentions(message, channel, ticketData);
        }
    }

    async lockTicketForRole(channel, userId, role) {
        const hierarchyRoles = config.tickets.hierarchy;
        const soporteRoleId = hierarchyRoles.soporte?.roleId;
        const moderadorRoleId = hierarchyRoles.moderador?.roleId;
        const administradorRoleId = hierarchyRoles.administrador?.roleId;
        const directivaRoleId = hierarchyRoles.directiva?.roleId;

        try {
            // Determinar qué roles bloquear según quién esté manejando el ticket
            if (role === 'soporte') {
                // Soporte maneja → bloquear Moderador, Administrador y Directiva
                if (moderadorRoleId) {
                    await channel.permissionOverwrites.edit(moderadorRoleId, {
                        ViewChannel: true,
                        SendMessages: false,
                        ReadMessageHistory: true,
                    });
                }
                if (administradorRoleId) {
                    await channel.permissionOverwrites.edit(administradorRoleId, {
                        ViewChannel: true,
                        SendMessages: false,
                        ReadMessageHistory: true,
                    });
                }
                if (directivaRoleId) {
                    await channel.permissionOverwrites.edit(directivaRoleId, {
                        ViewChannel: true,
                        SendMessages: false,
                        ReadMessageHistory: true,
                    });
                }
            } else if (role === 'moderador') {
                // Moderador maneja → bloquear Administrador y Directiva
                if (administradorRoleId) {
                    await channel.permissionOverwrites.edit(administradorRoleId, {
                        ViewChannel: true,
                        SendMessages: false,
                        ReadMessageHistory: true,
                    });
                }
                if (directivaRoleId) {
                    await channel.permissionOverwrites.edit(directivaRoleId, {
                        ViewChannel: true,
                        SendMessages: false,
                        ReadMessageHistory: true,
                    });
                }
            } else if (role === 'administrador') {
                // Administrador maneja → bloquear solo Directiva
                if (directivaRoleId) {
                    await channel.permissionOverwrites.edit(directivaRoleId, {
                        ViewChannel: true,
                        SendMessages: false,
                        ReadMessageHistory: true,
                    });
                }
            }
            // Si es directiva, no hay nadie por encima para bloquear

            this.activeTickets.set(channel.id, {
                handledBy: userId,
                role: role,
                escalatedTo: [],
                unlockedSameLevelUsers: [],
                timestamp: Date.now(),
            });
            
            this.saveHierarchyData();

            logger.info(`🔐 Permisos actualizados para ${role}: rangos superiores en solo lectura`);
        } catch (error) {
            logger.error(`Error al bloquear ticket para ${role}`, error);
        }
    }

    async handleRoleMentions(message, channel, ticketData) {
        const hierarchyRoles = config.tickets.hierarchy;
        const soporteRoleId = hierarchyRoles.soporte?.roleId;
        const moderadorRoleId = hierarchyRoles.moderador?.roleId;
        const administradorRoleId = hierarchyRoles.administrador?.roleId;
        const directivaRoleId = hierarchyRoles.directiva?.roleId;

        const mentionedModeradorRole = moderadorRoleId && message.mentions.roles.has(moderadorRoleId);
        const mentionedAdministradorRole = administradorRoleId && message.mentions.roles.has(administradorRoleId);
        const mentionedDirectivaRole = directivaRoleId && message.mentions.roles.has(directivaRoleId);

        const member = message.member;
        const hasSoporteRole = soporteRoleId && member.roles.cache.has(soporteRoleId);
        const hasModeradorRole = moderadorRoleId && member.roles.cache.has(moderadorRoleId);
        const hasAdministradorRole = administradorRoleId && member.roles.cache.has(administradorRoleId);
        const hasDirectivaRole = directivaRoleId && member.roles.cache.has(directivaRoleId);

        // Lógica de escalación según el rol que maneja el ticket
        const handlingRole = ticketData.role;

        // NUEVO: Detectar menciones de usuarios específicos del mismo nivel para colaboración
        await this.handleSameLevelUnlock(message, channel, ticketData, {
            soporteRoleId,
            moderadorRoleId,
            administradorRoleId,
            directivaRoleId
        });

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

        // Moderador puede escalar a Administrador
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

        // Administrador puede escalar a Directiva
        if (mentionedDirectivaRole && hasAdministradorRole && (handlingRole === 'soporte' || handlingRole === 'moderador' || handlingRole === 'administrador')) {
            if (!ticketData.escalatedTo.includes('directiva')) {
                await this.grantWritePermission(channel, directivaRoleId, 'Directiva');
                ticketData.escalatedTo.push('directiva');
                this.saveHierarchyData();
                
                await message.reply({
                    content: `✅ **Directiva** ahora puede escribir en este ticket.`,
                    allowedMentions: { parse: [] }
                });
                
                logger.info(`📈 Ticket ${channel.name} escalado a Directiva por ${member.user.tag}`);
            }
        }
    }

    async handleSameLevelUnlock(message, channel, ticketData, roleIds) {
        const { soporteRoleId, moderadorRoleId, administradorRoleId, directivaRoleId } = roleIds;
        const member = message.member;
        const handlingRole = ticketData.role;
        
        // Obtener el rol que maneja el ticket actualmente
        let currentRoleId = null;
        if (handlingRole === 'soporte') currentRoleId = soporteRoleId;
        else if (handlingRole === 'moderador') currentRoleId = moderadorRoleId;
        else if (handlingRole === 'administrador') currentRoleId = administradorRoleId;
        else if (handlingRole === 'directiva') currentRoleId = directivaRoleId;

        if (!currentRoleId) return;

        // Verificar si el que escribe tiene el rol que maneja el ticket
        const writerHasHandlingRole = member.roles.cache.has(currentRoleId);
        if (!writerHasHandlingRole) return;

        // Detectar menciones de usuarios específicos
        const mentionedUsers = message.mentions.members;
        if (!mentionedUsers || mentionedUsers.size === 0) return;

        // Inicializar array si no existe
        if (!ticketData.unlockedSameLevelUsers) {
            ticketData.unlockedSameLevelUsers = [];
        }

        let unlockedCount = 0;
        for (const [userId, mentionedMember] of mentionedUsers) {
            // Verificar si el usuario mencionado tiene el MISMO rol que maneja el ticket
            const hasSameRole = mentionedMember.roles.cache.has(currentRoleId);
            
            if (hasSameRole && userId !== ticketData.handledBy) {
                // Verificar si ya está desbloqueado
                if (!ticketData.unlockedSameLevelUsers.includes(userId)) {
                    // Desbloquear a este usuario específico
                    await channel.permissionOverwrites.edit(userId, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true,
                    });
                    
                    ticketData.unlockedSameLevelUsers.push(userId);
                    unlockedCount++;
                    
                    logger.info(`🔓 ${mentionedMember.user.tag} desbloqueado por ${member.user.tag} (mismo nivel: ${handlingRole})`);
                }
            }
        }

        if (unlockedCount > 0) {
            this.saveHierarchyData();
            
            const unlockedNames = Array.from(mentionedUsers.values())
                .filter(m => ticketData.unlockedSameLevelUsers.includes(m.id))
                .map(m => m.user.tag)
                .join(', ');

            await message.reply({
                content: `🤝 **Colaboración activada**: ${unlockedNames} ahora puede${unlockedCount > 1 ? 'n' : ''} escribir en este ticket.`,
                allowedMentions: { parse: [] }
            });
        }
    }

    getRoleLevel(roleName) {
        const hierarchyRoles = config.tickets.hierarchy;
        if (hierarchyRoles[roleName]) {
            return hierarchyRoles[roleName].level;
        }
        return 0;
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
