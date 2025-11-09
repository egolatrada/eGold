const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

const WARN_CHANNELS = ['1436824228279357580', '1370611084574326784'];

// Map para rastrear mensajes previos de warn-lista por canal
// Formato: channelId => { messageIds: [array de IDs], timestamp: number }
const previousWarnListMessages = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-lista')
        .setDescription('📋 [MODERACIÓN] Ver lista o historial completo de advertencias')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario específico (muestra historial completo con activas y revocadas)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('incluir_revocadas')
                .setDescription('Solo para lista general: incluir advertencias revocadas (por defecto: solo activas)')
                .setRequired(false)),
    
    async execute(interaction, context) {
        if (!WARN_CHANNELS.includes(interaction.channelId)) {
            return await interaction.reply({
                content: `❌ Este comando solo puede ser usado en los canales autorizados de moderación.`,
                ephemeral: true
            });
        }

        const warnsSystem = interaction.client.warnsSystem;
        if (!warnsSystem) {
            return await interaction.reply({
                content: '❌ El sistema de advertencias no está disponible.',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('usuario');
        const includeRevoked = interaction.options.getBoolean('incluir_revocadas') || false;

        await interaction.deferReply();

        try {
            // Borrar mensajes previos de warn-lista en este canal (si existen)
            const channelId = interaction.channelId;
            if (previousWarnListMessages.has(channelId)) {
                const previousData = previousWarnListMessages.get(channelId);
                for (const messageId of previousData.messageIds) {
                    try {
                        const oldMessage = await interaction.channel.messages.fetch(messageId).catch(() => null);
                        if (oldMessage && oldMessage.deletable) {
                            await oldMessage.delete();
                        }
                    } catch (error) {
                        logger.warn(`No se pudo eliminar mensaje previo de warn-lista: ${messageId}`);
                    }
                }
                previousWarnListMessages.delete(channelId);
            }

            if (targetUser) {
                const allWarnings = await warnsSystem.getUserWarnings(interaction.guildId, targetUser.id, true);

                if (allWarnings.length === 0) {
                    const noWarningsEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`📜 Historial de ${targetUser.tag}`)
                        .setDescription('✅ Este usuario no tiene ninguna advertencia registrada.')
                        .setThumbnail(targetUser.displayAvatarURL())
                        .setTimestamp();

                    const reply = await interaction.editReply({ embeds: [noWarningsEmbed] });
                    previousWarnListMessages.set(channelId, { messageIds: [reply.id], timestamp: Date.now() });
                    return;
                }

                const activeWarnings = allWarnings.filter(w => !w.revoked_at);
                const revokedWarnings = allWarnings.filter(w => w.revoked_at);

                // Crear embeds separados: uno para resumen + uno por cada advertencia
                // Enviar en múltiples mensajes si hay más de 9 warns (límite de 10 embeds/mensaje)
                const messageIds = [];
                
                // Embed de resumen (siempre primero)
                const summaryEmbed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle(`📜 Historial Completo de ${targetUser.tag}`)
                    .setDescription(
                        `**Total:** ${allWarnings.length} advertencia(s)\n` +
                        `🟢 **Activas:** ${activeWarnings.length}\n` +
                        `🔴 **Revocadas:** ${revokedWarnings.length}`
                    )
                    .setThumbnail(targetUser.displayAvatarURL())
                    .setTimestamp();
                
                // Procesar advertencias en lotes de 9 (1 resumen + 9 warns = 10 embeds max por mensaje)
                const batchSize = 9;
                for (let i = 0; i < allWarnings.length; i += batchSize) {
                    const embeds = [];
                    
                    // Solo agregar resumen en el primer mensaje
                    if (i === 0) {
                        embeds.push(summaryEmbed);
                    }
                    
                    const batch = allWarnings.slice(i, i + batchSize);
                    
                    for (const warning of batch) {
                        const categoryName = warnsSystem.getCategoryName(warning.category);
                        const createdAt = Math.floor(new Date(warning.created_at).getTime() / 1000);
                        const categoryColor = warnsSystem.getCategoryColor(warning.category);
                        
                        let description = `**ID:** ${warning.id}\n`;
                        description += `**Categoría:** ${categoryName}\n`;
                        description += `**Moderador responsable:** <@${warning.moderator_id}>\n`;
                        description += `**Fecha:** <t:${createdAt}:F> (<t:${createdAt}:R>)\n\n`;
                        description += `**📝 Motivo:**\n${warning.reason}\n`;

                        if (warning.expires_at && !warning.revoked_at) {
                            const expiresAt = Math.floor(new Date(warning.expires_at).getTime() / 1000);
                            description += `\n**⏰ Auto-revocación:** <t:${expiresAt}:R>`;
                        } else if (!warning.expires_at && !warning.revoked_at) {
                            description += `\n**🔒 Duración:** Permanente`;
                        }

                        if (warning.revoked_at) {
                            const revokedAt = Math.floor(new Date(warning.revoked_at).getTime() / 1000);
                            description += `\n\n**❌ REVOCADA:** <t:${revokedAt}:F> (<t:${revokedAt}:R>)`;
                            
                            if (warning.revoked_by === 'SYSTEM') {
                                description += `\n**Revocada por:** Sistema (Auto-revocación)`;
                            } else {
                                description += `\n**Revocada por:** <@${warning.revoked_by}>`;
                            }
                            
                            if (warning.revoked_reason) {
                                description += `\n**Motivo:** ${warning.revoked_reason}`;
                            }
                        }

                        const icon = warning.revoked_at ? '🔴' : '🟢';
                        const status = warning.revoked_at ? 'REVOCADA' : 'ACTIVA';

                        const warnEmbed = new EmbedBuilder()
                            .setColor(warning.revoked_at ? '#808080' : categoryColor)
                            .setTitle(`${icon} ${status} - ${categoryName}`)
                            .setDescription(description)
                            .setFooter({ text: `Advertencia ${i + batch.indexOf(warning) + 1}/${allWarnings.length} • ID: ${warning.id}` });

                        embeds.push(warnEmbed);
                    }
                    
                    // Enviar primer mensaje como editReply, los demás como followUp
                    if (i === 0) {
                        const reply = await interaction.editReply({ embeds: embeds });
                        messageIds.push(reply.id);
                    } else {
                        const followUp = await interaction.followUp({ embeds: embeds });
                        messageIds.push(followUp.id);
                    }
                }

                previousWarnListMessages.set(channelId, { messageIds: messageIds, timestamp: Date.now() });
                logger.info(`📜 ${interaction.user.tag} consultó el historial de ${targetUser.tag} (${allWarnings.length} warns en ${messageIds.length} mensaje(s))`);

            } else {
                const warnings = await warnsSystem.getAllWarnings(interaction.guildId, includeRevoked);
                const title = '📋 Todas las Advertencias del Servidor';

                if (warnings.length === 0) {
                    const noWarningsEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(title)
                        .setDescription('✅ No hay advertencias registradas.')
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [noWarningsEmbed] });
                }

                const activeWarnings = warnings.filter(w => !w.revoked_at);
                const revokedWarnings = warnings.filter(w => w.revoked_at);

                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(title)
                    .setDescription(
                        includeRevoked 
                            ? `**Total:** ${warnings.length} advertencia(s)\n**Activas:** ${activeWarnings.length} | **Revocadas:** ${revokedWarnings.length}`
                            : `**Advertencias activas:** ${activeWarnings.length}`
                    )
                    .setTimestamp();

                const warningsToShow = warnings.slice(0, 25);

                for (const warning of warningsToShow) {
                    const categoryName = warnsSystem.getCategoryName(warning.category);
                    const createdAt = Math.floor(new Date(warning.created_at).getTime() / 1000);
                    
                    let fieldValue = `**ID:** ${warning.id}\n`;
                    fieldValue += `**Usuario:** <@${warning.user_id}> (${warning.username})\n`;
                    fieldValue += `**Categoría:** ${categoryName}\n`;
                    fieldValue += `**Moderador:** ${warning.moderator_username}\n`;
                    fieldValue += `**Fecha:** <t:${createdAt}:F>\n`;
                    fieldValue += `**Motivo:** ${warning.reason.substring(0, 100)}${warning.reason.length > 100 ? '...' : ''}\n`;

                    if (warning.expires_at && !warning.revoked_at) {
                        const expiresAt = Math.floor(new Date(warning.expires_at).getTime() / 1000);
                        fieldValue += `**Expira:** <t:${expiresAt}:R>\n`;
                    }

                    if (warning.revoked_at) {
                        const revokedAt = Math.floor(new Date(warning.revoked_at).getTime() / 1000);
                        fieldValue += `**❌ REVOCADA:** <t:${revokedAt}:F>\n`;
                        if (warning.revoked_by === 'SYSTEM') {
                            fieldValue += `**Por:** Sistema (Auto-revocación)\n`;
                        } else {
                            fieldValue += `**Por:** <@${warning.revoked_by}>\n`;
                        }
                        if (warning.revoked_reason) {
                            fieldValue += `**Motivo:** ${warning.revoked_reason}\n`;
                        }
                    }

                    const status = warning.revoked_at ? '❌ REVOCADA' : '✅ ACTIVA';
                    const fieldName = `${status} - ${categoryName}`;

                    embed.addFields({
                        name: fieldName,
                        value: fieldValue,
                        inline: false
                    });
                }

                if (warnings.length > 25) {
                    embed.setFooter({ text: `Mostrando las primeras 25 de ${warnings.length} advertencias` });
                }

                await interaction.editReply({ embeds: [embed] });

                logger.info(`📋 ${interaction.user.tag} consultó la lista de advertencias del servidor${includeRevoked ? ' (incluyendo revocadas)' : ''}`);
            }

        } catch (error) {
            logger.error('Error al obtener lista de advertencias', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al obtener la lista de advertencias. Por favor, inténtalo de nuevo.'
            });
        }
    }
};
