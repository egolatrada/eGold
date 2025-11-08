const { EmbedBuilder } = require('discord.js');
const logger = require('../../../utils/logger');

async function handleSuggestionButtons(interaction, context) {
    const { suggestionsSystem } = context;

    if (!suggestionsSystem) {
        return await interaction.reply({
            content: '❌ El sistema de sugerencias no está disponible.',
            ephemeral: true
        });
    }

    const messageId = interaction.message.id;
    const suggestionData = suggestionsSystem.getSuggestion(messageId);

    if (!suggestionData) {
        return await interaction.reply({
            content: '❌ No se encontraron datos de esta sugerencia.',
            ephemeral: true
        });
    }

    if (suggestionData.status !== 'pending') {
        return await interaction.reply({
            content: '❌ Esta sugerencia ya ha sido resuelta y no se puede votar.',
            ephemeral: true
        });
    }

    try {
        if (interaction.customId === 'suggestion-upvote') {
            const currentVote = suggestionsSystem.hasVoted(messageId, interaction.user.id);
            
            if (currentVote === 'up') {
                suggestionsSystem.removeVote(messageId, interaction.user.id);
                await interaction.reply({
                    content: '🔄 Has retirado tu voto a favor.',
                    ephemeral: true
                });
            } else {
                suggestionsSystem.addVote(messageId, interaction.user.id, 'up');
                await interaction.reply({
                    content: '✅ Has votado a favor de esta sugerencia.',
                    ephemeral: true
                });
            }

        } else if (interaction.customId === 'suggestion-downvote') {
            const currentVote = suggestionsSystem.hasVoted(messageId, interaction.user.id);
            
            if (currentVote === 'down') {
                suggestionsSystem.removeVote(messageId, interaction.user.id);
                await interaction.reply({
                    content: '🔄 Has retirado tu voto en contra.',
                    ephemeral: true
                });
            } else {
                suggestionsSystem.addVote(messageId, interaction.user.id, 'down');
                await interaction.reply({
                    content: '❌ Has votado en contra de esta sugerencia.',
                    ephemeral: true
                });
            }

        } else if (interaction.customId === 'suggestion-thread') {
            if (interaction.message.hasThread) {
                return await interaction.reply({
                    content: `💬 Ya existe un hilo para esta sugerencia: ${interaction.message.thread}`,
                    ephemeral: true
                });
            }

            const thread = await interaction.message.startThread({
                name: `💬 Discusión: ${suggestionData.suggestion.substring(0, 50)}...`,
                autoArchiveDuration: 1440,
                reason: `Hilo de discusión creado por ${interaction.user.tag}`
            });

            await thread.send(`💬 **Hilo de discusión abierto**\n\nComenta con respeto. El staff decidirá aprobar o denegar la sugerencia.`);

            await interaction.reply({
                content: `💬 He creado un hilo para discutir esta sugerencia: ${thread}`,
                ephemeral: true
            });

            logger.info(`💬 ${interaction.user.tag} creó hilo para sugerencia ${messageId}`);
            return;
        }

        const votes = suggestionsSystem.getVoteCounts(messageId);
        const oldEmbed = interaction.message.embeds[0];

        const updatedEmbed = EmbedBuilder.from(oldEmbed)
            .setFields(
                { name: '✅ A Favor', value: `\`${votes.upvotes}\``, inline: true },
                { name: '❌ En Contra', value: `\`${votes.downvotes}\``, inline: true },
                { name: '📊 Estado', value: '⏳ Pendiente', inline: true }
            );

        await interaction.message.edit({
            embeds: [updatedEmbed]
        });

    } catch (error) {
        logger.error('Error al procesar voto de sugerencia', error);
        await interaction.reply({
            content: '❌ Ocurrió un error al procesar tu voto.',
            ephemeral: true
        }).catch(() => {});
    }
}

module.exports = { handleSuggestionButtons };
