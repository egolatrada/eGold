const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bienvenida-test')
        .setDescription('🧪 [DIRECTIVA] Probar el mensaje de bienvenida')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, context) {
        const directivaRoleId = config.directivaRoleId;

        if (directivaRoleId && !interaction.member.roles.cache.has(directivaRoleId)) {
            return await interaction.reply({
                content: '❌ Solo el rol de **Directiva** puede probar el sistema de bienvenidas.',
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

        await interaction.deferReply({ ephemeral: true });

        try {
            const currentConfig = await welcomeSystem.getConfig(interaction.guildId);

            if (!currentConfig || !currentConfig.channel_id) {
                return await interaction.editReply({
                    content: '❌ Debes configurar un canal de bienvenidas primero usando `/bienvenida-setup`.'
                });
            }

            const channel = await interaction.guild.channels.fetch(currentConfig.channel_id).catch(() => null);
            
            if (!channel || !channel.isTextBased()) {
                return await interaction.editReply({
                    content: '❌ El canal de bienvenidas configurado no existe o no es un canal de texto.'
                });
            }

            const message = welcomeSystem.parseMessage(currentConfig.message, interaction.member);

            const embed = new EmbedBuilder()
                .setColor(currentConfig.embed_color || '#5865F2')
                .setDescription(message)
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 256 })
                })
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `Miembro #${interaction.guild.memberCount} | 🧪 PRUEBA` })
                .setTimestamp();

            await channel.send({ 
                content: `${interaction.member} **[PRUEBA]**`,
                embeds: [embed] 
            });

            const confirmEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Mensaje de Prueba Enviado')
                .setDescription(`El mensaje de bienvenida de prueba ha sido enviado a ${channel}.`)
                .addFields(
                    { name: '📢 Canal', value: `${channel}`, inline: true },
                    { name: '👤 Avatar', value: 'Se muestra el icono del usuario automáticamente', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmEmbed] });

            logger.info(`🧪 ${interaction.user.tag} probó el mensaje de bienvenida`);

        } catch (error) {
            logger.error('Error al probar mensaje de bienvenida', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al enviar el mensaje de prueba. Por favor, inténtalo de nuevo.'
            });
        }
    }
};
