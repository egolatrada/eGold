const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../utils/logger');

const SUGGESTIONS_CHANNEL_ID = '1425955815885504646';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('ℹ️ [INFO] Envía una sugerencia para mejorar el servidor')
        .addStringOption(option =>
            option
                .setName('sugerencia')
                .setDescription('Describe tu sugerencia en detalle')
                .setRequired(true)
        ),
    
    async execute(interaction, context) {
        try {
            const suggestion = interaction.options.getString('sugerencia');
            const { suggestionsSystem } = context;

            if (!suggestionsSystem) {
                return await interaction.reply({
                    content: '❌ El sistema de sugerencias no está disponible.',
                    ephemeral: true
                });
            }

            const suggestionsChannel = await interaction.guild.channels.fetch(SUGGESTIONS_CHANNEL_ID).catch(() => null);
            
            if (!suggestionsChannel) {
                return await interaction.reply({
                    content: '❌ No se pudo encontrar el canal de sugerencias.',
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setAuthor({ 
                    name: `${interaction.user.tag}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                })
                .setTitle('💡 Nueva Sugerencia')
                .setDescription(suggestion)
                .addFields(
                    { name: '✅ A Favor', value: '`0`', inline: true },
                    { name: '❌ En Contra', value: '`0`', inline: true },
                    { name: '📊 Estado', value: '⏳ Pendiente', inline: true }
                )
                .setFooter({ text: 'Vota usando los botones de abajo' })
                .setTimestamp();

            const voteRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('suggestion-upvote')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('suggestion-downvote')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('suggestion-thread')
                    .setLabel('Responder')
                    .setEmoji('💬')
                    .setStyle(ButtonStyle.Secondary)
            );

            const message = await suggestionsChannel.send({
                embeds: [embed],
                components: [voteRow]
            });

            suggestionsSystem.createSuggestion(
                message.id,
                interaction.user.id,
                interaction.user.tag,
                suggestion
            );

            await interaction.editReply({
                content: `✅ Tu sugerencia ha sido enviada al canal ${suggestionsChannel}.\n\n📊 Los miembros podrán votar y responder a tu sugerencia.`
            });

            logger.info(`💡 ${interaction.user.tag} envió una sugerencia: "${suggestion.substring(0, 50)}..."`);

        } catch (error) {
            logger.error('Error al enviar sugerencia', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al enviar tu sugerencia.'
            }).catch(() => {});
        }
    }
};
