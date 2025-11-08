const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bienvenida-desactivar')
        .setDescription('🔴 [DIRECTIVA] Desactivar el sistema de bienvenidas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, context) {
        const directivaRoleId = config.directivaRoleId;

        if (directivaRoleId && !interaction.member.roles.cache.has(directivaRoleId)) {
            return await interaction.reply({
                content: '❌ Solo el rol de **Directiva** puede desactivar el sistema de bienvenidas.',
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

            if (!currentConfig || !currentConfig.enabled) {
                return await interaction.editReply({
                    content: '⚠️ El sistema de bienvenidas ya está desactivado.'
                });
            }

            await welcomeSystem.setEnabled(interaction.guildId, false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔴 Sistema de Bienvenidas Desactivado')
                .setDescription('El sistema de bienvenidas ha sido desactivado. No se enviarán mensajes de bienvenida hasta que lo reactives.')
                .addFields(
                    { name: '⚙️ Estado', value: '🔴 **Inactivo**', inline: true }
                )
                .setFooter({ text: 'Usa /bienvenida-activar para reactivarlo' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            logger.info(`🔴 ${interaction.user.tag} desactivó el sistema de bienvenidas`);

        } catch (error) {
            logger.error('Error al desactivar sistema de bienvenidas', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al desactivar el sistema. Por favor, inténtalo de nuevo.'
            });
        }
    }
};
