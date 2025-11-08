const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bienvenida-activar')
        .setDescription('🟢 [DIRECTIVA] Activar el sistema de bienvenidas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, context) {
        const directivaRoleId = config.directivaRoleId;

        if (directivaRoleId && !interaction.member.roles.cache.has(directivaRoleId)) {
            return await interaction.reply({
                content: '❌ Solo el rol de **Directiva** puede activar el sistema de bienvenidas.',
                ephemeral: true
            });
        }

        const welcomeSystem = context.client.welcomeSystem;
        if (!welcomeSystem) {
            return await interaction.reply({
                content: '❌ El sistema de bienvenidas no está disponible.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const currentConfig = await welcomeSystem.getConfig(interaction.guildId);

            if (!currentConfig || !currentConfig.channel_id) {
                return await interaction.editReply({
                    content: '❌ Debes configurar un canal de bienvenidas primero usando `/bienvenida-setup`.'
                });
            }

            if (currentConfig.enabled) {
                return await interaction.editReply({
                    content: '⚠️ El sistema de bienvenidas ya está activado.'
                });
            }

            await welcomeSystem.setEnabled(interaction.guildId, true);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Sistema de Bienvenidas Activado')
                .setDescription('El sistema de bienvenidas está ahora activo y enviará mensajes cuando nuevos usuarios se unan al servidor.')
                .addFields(
                    { name: '📢 Canal', value: `<#${currentConfig.channel_id}>`, inline: true },
                    { name: '⚙️ Estado', value: '🟢 **Activo**', inline: true }
                )
                .setFooter({ text: 'Usa /bienvenida-test para probar el mensaje' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            logger.info(`🟢 ${interaction.user.tag} activó el sistema de bienvenidas`);

        } catch (error) {
            logger.error('Error al activar sistema de bienvenidas', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al activar el sistema. Por favor, inténtalo de nuevo.'
            });
        }
    }
};
