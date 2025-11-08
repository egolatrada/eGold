const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

const ADMIN_ROLE_ID = '1425955470236975186';
const DIRECTIVA_ROLE_ID = '1435808275739181110';
const SUGGESTIONS_CHANNEL_ID = '1425955815885504646';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sug-responder')
        .setDescription('🔧 [ADMIN] Responde a una sugerencia (aprobar o rechazar)')
        .addStringOption(option =>
            option
                .setName('veredicto')
                .setDescription('Veredicto de la sugerencia')
                .setRequired(true)
                .addChoices(
                    { name: '✅ Aprobada', value: 'aprobada' },
                    { name: '❌ Rechazada', value: 'rechazada' }
                )
        )
        .addStringOption(option =>
            option
                .setName('mensaje-id')
                .setDescription('ID del mensaje de la sugerencia')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón del veredicto (opcional)')
                .setRequired(false)
        ),
    
    async execute(interaction, context) {
        try {
            const { suggestionsSystem } = context;

            const hasAdminRole = interaction.member.roles.cache.has(ADMIN_ROLE_ID);
            const hasDirectivaRole = interaction.member.roles.cache.has(DIRECTIVA_ROLE_ID);

            if (!hasAdminRole && !hasDirectivaRole) {
                return await interaction.reply({
                    content: '❌ Solo los administradores y directiva pueden responder sugerencias.',
                    ephemeral: true
                });
            }

            if (!suggestionsSystem) {
                return await interaction.reply({
                    content: '❌ El sistema de sugerencias no está disponible.',
                    ephemeral: true
                });
            }

            const veredicto = interaction.options.getString('veredicto');
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

            const isApproved = veredicto === 'aprobada';
            const status = isApproved ? 'approved' : 'rejected';
            
            suggestionsSystem.resolveSuggestion(messageId, status, interaction.user.id);

            const oldEmbed = message.embeds[0];
            const votes = suggestionsSystem.getVoteCounts(messageId);

            const color = isApproved ? '#57F287' : '#ED4245';
            const statusText = isApproved ? '✅ **APROBADA**' : '❌ **RECHAZADA**';
            const actionText = isApproved ? 'Aprobada' : 'Rechazada';

            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setColor(color)
                .setFields(
                    { name: '✅ A Favor', value: `\`${votes.upvotes}\``, inline: true },
                    { name: '❌ En Contra', value: `\`${votes.downvotes}\``, inline: true },
                    { name: '📊 Estado', value: statusText, inline: true }
                );

            if (reason) {
                newEmbed.addFields({ 
                    name: '📝 Razón', 
                    value: reason, 
                    inline: false 
                });
            }

            newEmbed.addFields({
                name: `👤 ${actionText} por`,
                value: `${interaction.user}`,
                inline: false
            });

            await message.edit({
                embeds: [newEmbed],
                components: []
            });

            const emoji = isApproved ? '✅' : '❌';
            await interaction.reply({
                content: `${emoji} Sugerencia marcada como **${actionText.toUpperCase()}**.`,
                ephemeral: true
            });

            logger.info(`${emoji} ${interaction.user.tag} ${actionText.toLowerCase()} la sugerencia ${messageId}`);

        } catch (error) {
            logger.error('Error al responder sugerencia', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al responder la sugerencia.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
