const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

const WARN_CHANNELS = ['1436824228279357580', '1370611084574326784'];

const TIME_UNITS = {
    'minutos': 60000,
    'horas': 3600000,
    'días': 86400000,
    'semanas': 604800000,
    'meses': 2592000000
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('⚠️ [MODERACIÓN] Advertir a un usuario')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a advertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoría de la advertencia')
                .setRequired(true)
                .addChoices(
                    { name: '🔴 Grave', value: 'grave' },
                    { name: '🟠 Moderado', value: 'moderado' },
                    { name: '🟡 Suave', value: 'suave' }
                ))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo de la advertencia')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duracion')
                .setDescription('Duración de la advertencia')
                .setRequired(true)
                .addChoices(
                    { name: '🔒 Permanente', value: 'permanente' },
                    { name: '⏰ Temporal', value: 'temporal' }
                ))
        .addIntegerOption(option =>
            option.setName('auto_revocar_cantidad')
                .setDescription('Cantidad de tiempo para auto-revocar (solo si es temporal)')
                .setRequired(false)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('auto_revocar_unidad')
                .setDescription('Unidad de tiempo para auto-revocar (solo si es temporal)')
                .setRequired(false)
                .addChoices(
                    { name: 'Minutos', value: 'minutos' },
                    { name: 'Horas', value: 'horas' },
                    { name: 'Días', value: 'días' },
                    { name: 'Semanas', value: 'semanas' },
                    { name: 'Meses', value: 'meses' }
                )),
    
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
        const category = interaction.options.getString('categoria');
        const reason = interaction.options.getString('motivo');
        const duracion = interaction.options.getString('duracion');
        const autoRevokeAmount = interaction.options.getInteger('auto_revocar_cantidad');
        const autoRevokeUnit = interaction.options.getString('auto_revocar_unidad');

        if (targetUser.bot) {
            return await interaction.reply({
                content: '❌ No puedes advertir a bots.',
                ephemeral: true
            });
        }

        if (targetUser.id === interaction.user.id) {
            return await interaction.reply({
                content: '❌ No puedes advertirte a ti mismo.',
                ephemeral: true
            });
        }

        let expiresIn = null;
        let expiresText = 'Permanente';

        if (duracion === 'temporal') {
            if (!autoRevokeAmount || !autoRevokeUnit) {
                return await interaction.reply({
                    content: '❌ Para advertencias temporales debes especificar tanto la **cantidad** como la **unidad** de tiempo.',
                    ephemeral: true
                });
            }
            expiresIn = autoRevokeAmount * TIME_UNITS[autoRevokeUnit];
            expiresText = `${autoRevokeAmount} ${autoRevokeUnit}`;
        }

        await interaction.deferReply();

        try {
            const warning = await warnsSystem.addWarning(
                interaction.guildId,
                targetUser.id,
                targetUser.tag,
                interaction.user.id,
                interaction.user.tag,
                category,
                reason,
                expiresIn
            );

            const categoryName = warnsSystem.getCategoryName(category);
            const categoryColor = warnsSystem.getCategoryColor(category);

            const dmEmbed = new EmbedBuilder()
                .setColor(categoryColor)
                .setTitle('⚠️ Has recibido una advertencia')
                .setDescription(`Has sido advertido en **${interaction.guild.name}**`)
                .addFields(
                    { name: '📋 Categoría', value: categoryName, inline: true },
                    { name: '👤 Moderador', value: interaction.user.tag, inline: true },
                    { name: '📅 Fecha', value: `<t:${Math.floor(new Date(warning.created_at).getTime() / 1000)}:F>`, inline: false },
                    { name: '📝 Motivo', value: reason, inline: false }
                )
                .setFooter({ text: `ID de advertencia: ${warning.id}` })
                .setTimestamp();

            if (expiresIn) {
                const expiresAt = new Date(Date.now() + expiresIn);
                dmEmbed.addFields({
                    name: '⏰ Se revocará automáticamente',
                    value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R> (${expiresText})`,
                    inline: false
                });
            } else {
                dmEmbed.addFields({
                    name: '🔒 Duración',
                    value: 'Permanente',
                    inline: false
                });
            }

            await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
                logger.warn(`No se pudo enviar DM de advertencia a ${targetUser.tag}`);
            });

            const publicEmbed = new EmbedBuilder()
                .setColor(categoryColor)
                .setTitle('⚠️ Advertencia Registrada')
                .addFields(
                    { name: '👤 Usuario advertido', value: `${targetUser} (${targetUser.tag})`, inline: false },
                    { name: '📋 Categoría', value: categoryName, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                    { name: '📅 Fecha', value: `<t:${Math.floor(new Date(warning.created_at).getTime() / 1000)}:F>`, inline: false },
                    { name: '📝 Motivo', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${warning.id}` })
                .setTimestamp();

            if (expiresIn) {
                const expiresAt = new Date(Date.now() + expiresIn);
                publicEmbed.addFields({
                    name: '⏰ Auto-revocación',
                    value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R> (${expiresText})`,
                    inline: false
                });
            } else {
                publicEmbed.addFields({
                    name: '🔒 Duración',
                    value: '**Permanente** - No se revocará automáticamente',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [publicEmbed] });

            logger.info(`⚠️ ${interaction.user.tag} advirtió a ${targetUser.tag} - Categoría: ${category} - Duración: ${expiresText} - ID: ${warning.id}`);

        } catch (error) {
            logger.error('Error al crear advertencia', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al crear la advertencia. Por favor, inténtalo de nuevo.'
            });
        }
    }
};
