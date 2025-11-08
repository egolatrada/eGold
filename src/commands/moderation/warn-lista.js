const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

const WARN_CHANNELS = ['1436824228279357580', '1370611084574326784'];

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

        const warnsSystem = context.client.warnsSystem;
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
            if (targetUser) {
                const allWarnings = await warnsSystem.getUserWarnings(interaction.guildId, targetUser.id, true);

                if (allWarnings.length === 0) {
                    const noWarningsEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`📜 Historial Completo de ${targetUser.tag}`)
                        .setDescription('✅ Este usuario no tiene ninguna advertencia registrada (ni activa ni revocada).')
                        .setThumbnail(targetUser.displayAvatarURL())
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [noWarningsEmbed] });
                }

                const activeWarnings = allWarnings.filter(w => !w.revoked_at);
                const revokedWarnings = allWarnings.filter(w => w.revoked_at);

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle(`📜 Historial Completo de ${targetUser.tag}`)
                    .setDescription(
                        `**Total de advertencias:** ${allWarnings.length}\n` +
                        `🟢 **Activas:** ${activeWarnings.length}\n` +
                        `🔴 **Revocadas:** ${revokedWarnings.length}`
                    )
                    .setThumbnail(targetUser.displayAvatarURL())
                    .setTimestamp();

                const warningsToShow = allWarnings.slice(0, 25);

                for (const warning of warningsToShow) {
                    const categoryName = warnsSystem.getCategoryName(warning.category);
                    const createdAt = Math.floor(new Date(warning.created_at).getTime() / 1000);
                    
                    let fieldValue = `**ID:** ${warning.id}\n`;
                    fieldValue += `**Categoría:** ${categoryName}\n`;
                    fieldValue += `**Moderador:** ${warning.moderator_username}\n`;
                    fieldValue += `**Fecha:** <t:${createdAt}:F> (<t:${createdAt}:R>)\n`;
                    fieldValue += `**Motivo:** ${warning.reason.substring(0, 150)}${warning.reason.length > 150 ? '...' : ''}\n`;

                    if (warning.expires_at && !warning.revoked_at) {
                        const expiresAt = Math.floor(new Date(warning.expires_at).getTime() / 1000);
                        fieldValue += `**⏰ Expira:** <t:${expiresAt}:R>\n`;
                    } else if (!warning.expires_at && !warning.revoked_at) {
                        fieldValue += `**🔒 Duración:** Permanente\n`;
                    }

                    if (warning.revoked_at) {
                        const revokedAt = Math.floor(new Date(warning.revoked_at).getTime() / 1000);
                        fieldValue += `\n**❌ REVOCADA:** <t:${revokedAt}:F> (<t:${revokedAt}:R>)\n`;
                        
                        if (warning.revoked_by === 'SYSTEM') {
                            fieldValue += `**Revocada por:** Sistema (Auto-revocación)\n`;
                        } else {
                            fieldValue += `**Revocada por:** <@${warning.revoked_by}>\n`;
                        }
                        
                        if (warning.revoked_reason) {
                            fieldValue += `**Motivo de revocación:** ${warning.revoked_reason}\n`;
                        }
                    }

                    const icon = warning.revoked_at ? '🔴' : '🟢';
                    const status = warning.revoked_at ? 'REVOCADA' : 'ACTIVA';
                    const fieldName = `${icon} ${status} - ${categoryName} (ID: ${warning.id})`;

                    embed.addFields({
                        name: fieldName,
                        value: fieldValue,
                        inline: false
                    });
                }

                if (allWarnings.length > 25) {
                    embed.setFooter({ 
                        text: `Mostrando las primeras 25 de ${allWarnings.length} advertencias totales` 
                    });
                } else {
                    embed.setFooter({ 
                        text: `Historial completo • ${allWarnings.length} advertencia(s) total(es)` 
                    });
                }

                await interaction.editReply({ embeds: [embed] });

                logger.info(`📜 ${interaction.user.tag} consultó el historial completo de advertencias de ${targetUser.tag}`);

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
