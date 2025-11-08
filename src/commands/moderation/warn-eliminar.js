const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

const WARN_CHANNEL_ID = '1309293942055710720';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-eliminar')
        .setDescription('🗑️ [MODERACIÓN] Eliminar una advertencia')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario del cual eliminar advertencia')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('id_advertencia')
                .setDescription('ID de la advertencia a eliminar')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo de la eliminación (opcional)')
                .setRequired(false)),
    
    async execute(interaction, context) {
        if (interaction.channelId !== WARN_CHANNEL_ID) {
            return await interaction.reply({
                content: `❌ Este comando solo puede ser usado en el canal <#${WARN_CHANNEL_ID}>`,
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
        const warningId = interaction.options.getInteger('id_advertencia');
        const revokeReason = interaction.options.getString('motivo') || 'Sin motivo especificado';

        await interaction.deferReply();

        try {
            const warning = await warnsSystem.getWarningById(warningId);

            if (!warning) {
                return await interaction.editReply({
                    content: `❌ No se encontró una advertencia con el ID **${warningId}**.`
                });
            }

            if (warning.user_id !== targetUser.id) {
                return await interaction.editReply({
                    content: `❌ La advertencia **${warningId}** no pertenece a ${targetUser}.`
                });
            }

            if (warning.guild_id !== interaction.guildId) {
                return await interaction.editReply({
                    content: `❌ La advertencia **${warningId}** no pertenece a este servidor.`
                });
            }

            if (warning.revoked_at) {
                return await interaction.editReply({
                    content: `❌ La advertencia **${warningId}** ya fue revocada anteriormente el <t:${Math.floor(new Date(warning.revoked_at).getTime() / 1000)}:F>.`
                });
            }

            const revokedWarning = await warnsSystem.revokeWarning(
                warningId,
                interaction.user.id,
                revokeReason
            );

            if (!revokedWarning) {
                return await interaction.editReply({
                    content: '❌ No se pudo revocar la advertencia. Por favor, inténtalo de nuevo.'
                });
            }

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
                    { name: '🆔 ID de advertencia', value: `${warningId}`, inline: true },
                    { name: '📋 Categoría', value: categoryName, inline: true },
                    { name: '📅 Fecha original', value: `<t:${Math.floor(new Date(warning.created_at).getTime() / 1000)}:F>`, inline: false },
                    { name: '📝 Motivo original', value: warning.reason, inline: false },
                    { name: '👮 Eliminada por', value: interaction.user.tag, inline: true },
                    { name: '📝 Motivo de eliminación', value: revokeReason, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [publicEmbed] });

            logger.info(`✅ ${interaction.user.tag} revocó la advertencia ${warningId} de ${targetUser.tag}`);

        } catch (error) {
            logger.error('Error al eliminar advertencia', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al eliminar la advertencia. Por favor, inténtalo de nuevo.'
            });
        }
    }
};
