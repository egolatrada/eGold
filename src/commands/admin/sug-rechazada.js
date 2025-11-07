const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

const ADMIN_ROLE_ID = '1425955470236975186';
const SUGGESTIONS_CHANNEL_ID = '1425955815885504646';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sug-rechazada')
        .setDescription('❌ Marca una sugerencia como rechazada')
        .addStringOption(option =>
            option
                .setName('mensaje-id')
                .setDescription('ID del mensaje de la sugerencia')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón del rechazo (opcional)')
                .setRequired(false)
        ),
    
    async execute(interaction, context) {
        try {
            const { suggestionsSystem } = context;

            if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
                return await interaction.reply({
                    content: '❌ Solo los administradores pueden rechazar sugerencias.',
                    ephemeral: true
                });
            }

            if (!suggestionsSystem) {
                return await interaction.reply({
                    content: '❌ El sistema de sugerencias no está disponible.',
                    ephemeral: true
                });
            }

            const messageId = interaction.options.getString('mensaje-id');
            const reason = interaction.options.getString('razon');

            const suggestionsChannel = await interaction.guild.channels.fetch(SUGGESTIONS_CHANNEL_ID).catch(() => null);
            
            if (!suggestionsChannel) {
                return await interaction.reply({
                    content: '❌ No se pudo encontrar el canal de sugerencias.',
                    ephemeral: true
                });
            }

            const message = await suggestionsChannel.messages.fetch(messageId).catch(() => null);
            
            if (!message) {
                return await interaction.reply({
                    content: '❌ No se pudo encontrar el mensaje de la sugerencia.',
                    ephemeral: true
                });
            }

            const suggestionData = suggestionsSystem.getSuggestion(messageId);
            
            if (!suggestionData) {
                return await interaction.reply({
                    content: '❌ No se encontraron datos de esta sugerencia.',
                    ephemeral: true
                });
            }

            suggestionsSystem.resolveSuggestion(messageId, 'rejected', interaction.user.id);

            const oldEmbed = message.embeds[0];
            const votes = suggestionsSystem.getVoteCounts(messageId);

            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setColor('#ED4245')
                .setFields(
                    { name: '✅ A Favor', value: `\`${votes.upvotes}\``, inline: true },
                    { name: '❌ En Contra', value: `\`${votes.downvotes}\``, inline: true },
                    { name: '📊 Estado', value: '❌ **RECHAZADA**', inline: true }
                );

            if (reason) {
                newEmbed.addFields({ 
                    name: '📝 Razón', 
                    value: reason, 
                    inline: false 
                });
            }

            newEmbed.addFields({
                name: '👤 Rechazada por',
                value: `${interaction.user}`,
                inline: false
            });

            await message.edit({
                embeds: [newEmbed],
                components: []
            });

            await interaction.reply({
                content: `❌ Sugerencia marcada como **RECHAZADA**.`,
                ephemeral: true
            });

            logger.info(`❌ ${interaction.user.tag} rechazó la sugerencia ${messageId}`);

        } catch (error) {
            logger.error('Error al rechazar sugerencia', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al rechazar la sugerencia.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
