// Event handlers setup
const logger = require('../../utils/logger');

function setupEventHandlers(client, context) {
    // Interaction Create - Maneja comandos slash, botones, modales, selects
    client.on('interactionCreate', async (interaction) => {
        try {
            context.healthSystem.incrementCommandCount();
            
            // Importar handlers específicos
            const { handleInteractionCreate } = require('./interaction-create');
            await handleInteractionCreate(interaction, context);
        } catch (error) {
            logger.error('Error en interactionCreate', error);
            context.healthSystem.incrementErrorCount();
        }
    });
    
    // Message Create - Maneja comandos personalizados, moderación y detección de tareas
    client.on('messageCreate', async (message) => {
        try {
            if (message.author.bot) return;
            
            // Sistema de detección de tareas (copiar/pegar para completar)
            const { handleMessageCreate } = require('./message-create');
            await handleMessageCreate(message, context);
            
            // Q&A System (si el mensaje menciona al bot en canal específico)
            // Custom Commands
            await context.customCommandsSystem.handleMessage(message);
            
            // Moderación
            await context.moderationSystem.handleMessage(message);
        } catch (error) {
            logger.error('Error en messageCreate', error);
            context.healthSystem.incrementErrorCount();
        }
    });
    
    // Guild Member Add
    client.on('guildMemberAdd', async (member) => {
        try {
            await context.logsSystem.handleMemberJoin(member);
            await context.invitesSystem.handleMemberJoin(member);
            await context.verificationSystem.assignUnverifiedRole(member);
            if (context.welcomeSystem) {
                await context.welcomeSystem.sendWelcome(member);
            }
            if (context.serverStatsSystem) {
                await context.serverStatsSystem.handleMemberUpdate();
            }
        } catch (error) {
            logger.error('Error en guildMemberAdd', error);
        }
    });
    
    // Guild Member Remove
    client.on('guildMemberRemove', async (member) => {
        try {
            await context.logsSystem.handleMemberLeave(member);
            if (context.serverStatsSystem) {
                await context.serverStatsSystem.handleMemberUpdate();
            }
        } catch (error) {
            logger.error('Error en guildMemberRemove', error);
        }
    });
    
    // Guild Member Update
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        try {
            await context.logsSystem.handleMemberUpdate(oldMember, newMember);
            if (context.serverStatsSystem) {
                await context.serverStatsSystem.handleMemberUpdate();
            }
        } catch (error) {
            logger.error('Error en guildMemberUpdate', error);
        }
    });
    
    // Voice State Update
    client.on('voiceStateUpdate', async (oldState, newState) => {
        try {
            await context.logsSystem.handleVoiceStateUpdate(oldState, newState);
            
            // Manejar canales de voz de tickets
            const { ticketsSystem, logsSystem } = context;
            
            // Cuando alguien ENTRA a un canal de voz de ticket, registrarlo
            // Detectar cuando alguien se une a un canal de ticket (desde cualquier estado)
            if (newState.channelId && newState.channelId !== oldState.channelId) {
                const newChannel = newState.channel;
                if (newChannel && newChannel.name.startsWith("🔰 Ticket")) {
                    const ticketMatch = newChannel.name.match(/Ticket (\d+)/);
                    if (ticketMatch) {
                        const ticketNumber = ticketMatch[1];
                        const voiceKey = `${newState.guild.id}:${ticketNumber}`;
                        const data = ticketsSystem.getVoiceSupportData(voiceKey);
                        
                        if (data) {
                            if (!data.participants) {
                                data.participants = [];
                            }
                            // Asegurar que participants es un array
                            if (!Array.isArray(data.participants)) {
                                data.participants = [];
                            }
                            // Agregar participante si no está ya en la lista
                            if (!data.participants.includes(newState.member.user.id)) {
                                data.participants.push(newState.member.user.id);
                                ticketsSystem.setVoiceSupportData(voiceKey, data);
                            }
                        }
                    }
                }
            }
            
            // Cuando alguien SALE de un canal de voz
            if (oldState.channelId && oldState.channelId !== newState.channelId) {
                const oldChannel = oldState.channel;
                if (oldChannel && oldChannel.name.startsWith("🔰 Ticket")) {
                    // Buscar el ticket asociado
                    for (const [voiceKey, data] of ticketsSystem.getAllVoiceSupportEntries()) {
                        if (data.voiceChannelId === oldChannel.id) {
                            // Si el canal quedó vacío, eliminarlo
                            if (oldChannel.members.size === 0) {
                                // Cancelar timer si existe
                                if (data.timeoutId) {
                                    clearTimeout(data.timeoutId);
                                    data.timeoutId = null;
                                }
                                
                                try {
                                    // Registrar log ANTES de eliminar el canal
                                    const ticketMatch = oldChannel.name.match(/Ticket (\d+)/);
                                    const ticketNumber = ticketMatch ? ticketMatch[1] : 'Desconocido';
                                    
                                    // Buscar el canal de ticket asociado para obtener participantes
                                    const ticketChannel = data.ticketChannelId ? 
                                        await oldChannel.guild.channels.fetch(data.ticketChannelId).catch(() => null) : null;
                                    
                                    const { EmbedBuilder, Colors } = require('discord.js');
                                    
                                    // Usar el logsSystem del context para enviar el log
                                    if (logsSystem && logsSystem.config.logs?.enabled && logsSystem.config.logs.channels?.channels) {
                                        const logChannel = await oldChannel.guild.channels.fetch(logsSystem.config.logs.channels.channels);
                                        
                                        const embed = new EmbedBuilder()
                                            .setColor('#FF6B6B')
                                            .setTitle('🔴 Canal de Voz de Ticket Eliminado')
                                            .setDescription('Canal de soporte por voz eliminado automáticamente');
                                        
                                        // Obtener quien eliminó (audit logs)
                                        let eliminadoPor = 'Sistema (Auto-eliminación)';
                                        try {
                                            const { AuditLogEvent } = require('discord.js');
                                            const auditLogs = await oldChannel.guild.fetchAuditLogs({
                                                type: AuditLogEvent.ChannelDelete,
                                                limit: 1,
                                            });
                                            const deleteLog = auditLogs.entries.first();
                                            if (deleteLog && deleteLog.target.id === oldChannel.id && Date.now() - deleteLog.createdTimestamp < 3000) {
                                                eliminadoPor = `${deleteLog.executor}`;
                                            }
                                        } catch (error) {
                                            // Ignorar error de audit logs
                                        }
                                        
                                        embed.addFields(
                                            { name: 'Canal de Voz', value: oldChannel.name, inline: true },
                                            { name: 'Ticket Asociado', value: ticketChannel ? `${ticketChannel}` : `Ticket #${ticketNumber}`, inline: true }
                                        );
                                        
                                        embed.addFields({ name: 'ID Canal Voz', value: oldChannel.id, inline: false });
                                        
                                        embed.addFields(
                                            { name: 'Eliminado por', value: eliminadoPor, inline: true },
                                            { name: 'Ticket #', value: ticketNumber, inline: true }
                                        );
                                        
                                        // Registrar información del creador y tiempo
                                        if (data.startTime) {
                                            const duration = Date.now() - data.startTime;
                                            const minutes = Math.floor(duration / 60000);
                                            const seconds = Math.floor((duration % 60000) / 1000);
                                            
                                            embed.setFooter({ text: `⏱️ Duración: ${minutes}m ${seconds}s • Canal vacío - Auto eliminación` });
                                        } else {
                                            embed.setFooter({ text: '⏱️ Canal vacío - Auto eliminación' });
                                        }
                                        
                                        // Mostrar lista de participantes
                                        if (data.participants && data.participants.length > 0) {
                                            const participantMentions = data.participants
                                                .map(id => `<@${id}>`)
                                                .join(', ');
                                            embed.setDescription(
                                                `Canal de soporte por voz eliminado automáticamente\n\n` +
                                                `**👥 Participantes (${data.participants.length}):** ${participantMentions.substring(0, 900)}`
                                            );
                                        }
                                        
                                        embed.setTimestamp();
                                        
                                        await logChannel.send({ embeds: [embed] });
                                    }
                                    
                                    await oldChannel.delete();
                                    data.voiceChannelId = null;
                                    data.timeoutId = null;
                                    ticketsSystem.setVoiceSupportData(voiceKey, data);
                                    
                                    logger.info(`🎤 Canal de voz del ticket ${ticketNumber} eliminado (canal vacío)`);
                                } catch (error) {
                                    logger.error('Error al eliminar canal de voz vacío', error);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('Error en voiceStateUpdate', error);
        }
    });
    
    // Message Delete
    client.on('messageDelete', async (message) => {
        try {
            await context.logsSystem.handleMessageDelete(message);
        } catch (error) {
            logger.error('Error en messageDelete', error);
        }
    });
    
    // Message Update
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        try {
            await context.logsSystem.handleMessageUpdate(oldMessage, newMessage);
        } catch (error) {
            logger.error('Error en messageUpdate', error);
        }
    });
    
    // Channel Create
    client.on('channelCreate', async (channel) => {
        try {
            await context.logsSystem.handleChannelCreate(channel);
        } catch (error) {
            logger.error('Error en channelCreate', error);
        }
    });
    
    // Channel Delete
    client.on('channelDelete', async (channel) => {
        try {
            await context.logsSystem.handleChannelDelete(channel);
        } catch (error) {
            logger.error('Error en channelDelete', error);
        }
    });
    
    // Thread Create
    client.on('threadCreate', async (thread) => {
        try {
            await context.logsSystem.handleThreadCreate(thread);
        } catch (error) {
            logger.error('Error en threadCreate', error);
        }
    });
    
    // Thread Delete
    client.on('threadDelete', async (thread) => {
        try {
            await context.logsSystem.handleThreadDelete(thread);
        } catch (error) {
            logger.error('Error en threadDelete', error);
        }
    });
    
    // Guild Ban Add
    client.on('guildBanAdd', async (ban) => {
        try {
            await context.logsSystem.handleBanAdd(ban);
        } catch (error) {
            logger.error('Error en guildBanAdd', error);
        }
    });
    
    // Guild Ban Remove
    client.on('guildBanRemove', async (ban) => {
        try {
            await context.logsSystem.handleBanRemove(ban);
        } catch (error) {
            logger.error('Error en guildBanRemove', error);
        }
    });
    
    // Role Create
    client.on('roleCreate', async (role) => {
        try {
            await context.logsSystem.handleRoleCreate(role);
        } catch (error) {
            logger.error('Error en roleCreate', error);
        }
    });
    
    // Role Delete
    client.on('roleDelete', async (role) => {
        try {
            await context.logsSystem.handleRoleDelete(role);
        } catch (error) {
            logger.error('Error en roleDelete', error);
        }
    });
    
    // Role Update
    client.on('roleUpdate', async (oldRole, newRole) => {
        try {
            await context.logsSystem.handleRoleUpdate(oldRole, newRole);
        } catch (error) {
            logger.error('Error en roleUpdate', error);
        }
    });
    
    logger.success('Event handlers configurados correctamente');
}

module.exports = { setupEventHandlers };
