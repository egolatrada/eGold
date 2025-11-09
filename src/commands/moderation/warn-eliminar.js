const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

const WARN_CHANNELS = ['1436824228279357580', '1370611084574326784'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-eliminar')
        .setDescription('🗑️ [MODERACIÓN] Eliminar una advertencia')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario del cual eliminar advertencia')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo de la eliminación (opcional)')
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
        const revokeReason = interaction.options.getString('motivo') || 'Sin motivo especificado';

        await interaction.deferReply({ ephemeral: true });

        try {
            const warnings = await warnsSystem.getUserWarnings(interaction.guildId, targetUser.id, false);

            if (warnings.length === 0) {
                return await interaction.editReply({
                    content: `❌ ${targetUser} no tiene advertencias activas.`
                });
            }

            if (warnings.length === 1) {
                const warning = warnings[0];
                const revokedWarning = await warnsSystem.revokeWarning(
                    warning.id,
                    interaction.user.id,
                    revokeReason
                );

                if (!revokedWarning) {
                    return await interaction.editReply({
                        content: '❌ No se pudo revocar la advertencia. Por favor, inténtalo de nuevo.'
                    });
                }

                await this.notifyAndConfirm(interaction, targetUser, warning, revokeReason, warnsSystem);
                return;
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_warn_to_delete')
                .setPlaceholder('Selecciona la advertencia a eliminar')
                .addOptions(
                    warnings.slice(0, 25).map(warn => {
                        const categoryName = warnsSystem.getCategoryName(warn.category);
                        const createdDate = new Date(warn.created_at).toLocaleDateString('es-ES');
                        const label = `ID: ${warn.id} | ${categoryName} | ${createdDate}`;
                        const description = warn.reason.substring(0, 100);
                        
                        return {
                            label: label.substring(0, 100),
                            description: description,
                            value: warn.id.toString()
                        };
                    })
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const warningsListEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(`📋 Advertencias de ${targetUser.tag}`)
                .setDescription(`${targetUser} tiene **${warnings.length}** advertencia(s) activa(s).\nSelecciona la advertencia que deseas eliminar:`)
                .setTimestamp();

            const response = await interaction.editReply({
                embeds: [warningsListEmbed],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000
            });

            collector.on('collect', async (selectInteraction) => {
                if (selectInteraction.user.id !== interaction.user.id) {
                    return await selectInteraction.reply({
                        content: '❌ Solo el moderador que ejecutó el comando puede seleccionar.',
                        ephemeral: true
                    });
                }

                const warningId = parseInt(selectInteraction.values[0]);
                const warning = warnings.find(w => w.id === warningId);

                if (!warning) {
                    return await selectInteraction.update({
                        content: '❌ Advertencia no encontrada.',
                        embeds: [],
                        components: []
                    });
                }

                const revokedWarning = await warnsSystem.revokeWarning(
                    warningId,
                    interaction.user.id,
                    revokeReason
                );

                if (!revokedWarning) {
                    return await selectInteraction.update({
                        content: '❌ No se pudo revocar la advertencia. Por favor, inténtalo de nuevo.',
                        embeds: [],
                        components: []
                    });
                }

                await selectInteraction.update({
                    content: '⏳ Procesando...',
                    embeds: [],
                    components: []
                });

                await this.notifyAndConfirmPublic(interaction.channel, targetUser, warning, revokeReason, interaction.user, warnsSystem);

                const categoryName = warnsSystem.getCategoryName(warning.category);
                
                await interaction.editReply({
                    content: `✅ Advertencia **${warningId}** (${categoryName}) eliminada correctamente.\nSe ha enviado notificación a ${targetUser} por DM y mensaje público en el canal.`,
                    embeds: [],
                    components: []
                });

                collector.stop();
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    interaction.editReply({
                        content: '❌ Tiempo de selección agotado. Usa el comando nuevamente.',
                        embeds: [],
                        components: []
                    }).catch(() => {});
                }
            });

        } catch (error) {
            logger.error('Error al eliminar advertencia', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al eliminar la advertencia. Por favor, inténtalo de nuevo.',
                embeds: [],
                components: []
            });
        }
    },

    async notifyAndConfirm(interaction, targetUser, warning, revokeReason, warnsSystem) {
        const categoryName = warnsSystem.getCategoryName(warning.category);

        const dmEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Advertencia Revocada')
            .setDescription(`Una de tus advertencias ha sido revocada en **${interaction.guild.name}**`)
            .addFields(
                { name: '📋 Categoría', value: categoryName, inline: true },
                { name: '📅 Fecha de advertencia', value: `<t:${Math.floor(new Date(warning.created_at).getTime() / 1000)}:F>`, inline: false },
                { name: '📝 Motivo original', value: warning.reason, inline: false },
                { name: '👮 Revocada por', value: interaction.user.tag, inline: true },
                { name: '📝 Motivo de revocación', value: revokeReason, inline: false }
            )
            .setFooter({ text: `ID de advertencia: ${warning.id}` })
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
            logger.warn(`No se pudo enviar DM de revocación a ${targetUser.tag}`);
        });

        const publicEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Advertencia Eliminada')
            .addFields(
                { name: '👤 Usuario', value: `${targetUser} (${targetUser.tag})`, inline: false },
                { name: '🆔 ID de advertencia', value: `${warning.id}`, inline: true },
                { name: '📋 Categoría', value: categoryName, inline: true },
                { name: '📅 Fecha original', value: `<t:${Math.floor(new Date(warning.created_at).getTime() / 1000)}:F>`, inline: false },
                { name: '📝 Motivo original', value: warning.reason, inline: false },
                { name: '👮 Eliminada por', value: interaction.user.tag, inline: true },
                { name: '📝 Motivo de eliminación', value: revokeReason, inline: false }
            )
            .setTimestamp();

        await interaction.channel.send({ embeds: [publicEmbed] });

        await interaction.editReply({
            content: `✅ Advertencia **${warning.id}** eliminada correctamente.\nSe ha enviado notificación a ${targetUser} por DM y mensaje público en el canal.`
        });

        logger.info(`✅ ${interaction.user.tag} revocó la advertencia ${warning.id} de ${targetUser.tag}`);
    },

    async notifyAndConfirmPublic(channel, targetUser, warning, revokeReason, moderator, warnsSystem) {
        const categoryName = warnsSystem.getCategoryName(warning.category);

        const dmEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Advertencia Revocada')
            .setDescription(`Una de tus advertencias ha sido revocada en **${channel.guild.name}**`)
            .addFields(
                { name: '📋 Categoría', value: categoryName, inline: true },
                { name: '📅 Fecha de advertencia', value: `<t:${Math.floor(new Date(warning.created_at).getTime() / 1000)}:F>`, inline: false },
                { name: '📝 Motivo original', value: warning.reason, inline: false },
                { name: '👮 Revocada por', value: moderator.tag, inline: true },
                { name: '📝 Motivo de revocación', value: revokeReason, inline: false }
            )
            .setFooter({ text: `ID de advertencia: ${warning.id}` })
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
            logger.warn(`No se pudo enviar DM de revocación a ${targetUser.tag}`);
        });

        const publicEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Advertencia Eliminada')
            .addFields(
                { name: '👤 Usuario', value: `${targetUser} (${targetUser.tag})`, inline: false },
                { name: '🆔 ID de advertencia', value: `${warning.id}`, inline: true },
                { name: '📋 Categoría', value: categoryName, inline: true },
                { name: '📅 Fecha original', value: `<t:${Math.floor(new Date(warning.created_at).getTime() / 1000)}:F>`, inline: false },
                { name: '📝 Motivo original', value: warning.reason, inline: false },
                { name: '👮 Eliminada por', value: moderator.tag, inline: true },
                { name: '📝 Motivo de eliminación', value: revokeReason, inline: false }
            )
            .setTimestamp();

        await channel.send({ embeds: [publicEmbed] });

        logger.info(`✅ ${moderator.tag} revocó la advertencia ${warning.id} de ${targetUser.tag}`);
    }
};
