const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rol-id')
        .setDescription('🔍 Obtiene el ID de un rol')
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('Rol del cual obtener el ID')
                .setRequired(true)
        ),
    
    async execute(interaction, context) {
        try {
            const targetRole = interaction.options.getRole('rol');

            const embed = new EmbedBuilder()
                .setColor(targetRole.color || '#5865F2')
                .setTitle('🔍 ID de Rol')
                .addFields(
                    { name: '🏷️ Nombre', value: targetRole.name, inline: false },
                    { name: '🆔 ID', value: `\`${targetRole.id}\``, inline: false },
                    { name: '🎨 Color', value: targetRole.hexColor, inline: true },
                    { name: '👥 Miembros', value: `${targetRole.members.size}`, inline: true }
                )
                .setTimestamp();

            const copyButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`copy_role_id_${targetRole.id}`)
                    .setLabel('📋 Copiar ID')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.reply({
                embeds: [embed],
                components: [copyButton],
                ephemeral: true
            });

            logger.info(`🔍 ${interaction.user.tag} consultó ID del rol ${targetRole.name} (${targetRole.id})`);

        } catch (error) {
            logger.error('Error al obtener ID de rol', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al obtener la información del rol.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
