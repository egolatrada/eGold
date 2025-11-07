const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { config, messages } = require('../../../config');
const logger = require('../../../utils/logger');

async function handleTicketCategorySelect(interaction, context) {
    if (!interaction.guild) {
        return await interaction.reply({
            content: "❌ Este comando solo puede usarse en un servidor.",
            ephemeral: true,
        });
    }

    const ticketType = interaction.values[0];
    const category = config.tickets.categories[ticketType];
    const guild = interaction.guild;
    const member = interaction.member;
    const { ticketsSystem, ticketInactivity } = context;

    if (!category) {
        return await interaction.reply({
            content: "❌ Categoría de ticket no válida.",
            ephemeral: true,
        });
    }

    if (!category.transcriptChannelId) {
        return await interaction.reply({
            content: `❌ Error de configuración: No se ha configurado el canal de transcripciones (\`transcriptChannelId\`) para la categoría "${category.name}" en config.json.`,
            ephemeral: true,
        });
    }

    try {
        await guild.channels.fetch(category.transcriptChannelId);
    } catch (error) {
        return await interaction.reply({
            content: `❌ Error: El canal de transcripciones configurado (ID: ${category.transcriptChannelId}) no existe o no es accesible.`,
            ephemeral: true,
        });
    }

    try {
        const { channel, ticketNumber } = await ticketsSystem.createTicket(guild, member.user, category);

        const ticketMetadata = {
            type: ticketType,
            categoryName: category.name,
            ticketNumber: ticketNumber,
            creator: member.id,
            creatorTag: member.user.tag,
            createdAt: Date.now()
        };

        const channelTopic = `${category.channelDescription || `Ticket de ${category.name}`}`;
        const channelTopicWithMetadata = `${channelTopic} | Metadata: ${JSON.stringify(ticketMetadata)}`;
        await channel.setTopic(channelTopicWithMetadata);

        const welcomeDescription = messages.ticketWelcome.description
            .replace('{emoji}', category.emoji)
            .replace('{user}', member.toString())
            .replace(/\{categoryName\}/g, category.name);

        const welcomeTitle = messages.ticketWelcome.title
            .replace('{emoji}', category.emoji)
            .replace('{categoryName}', category.name);

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(welcomeTitle)
            .setDescription(welcomeDescription)
            .setFooter({ text: `Ticket #${ticketNumber}` })
            .setTimestamp();

        const ticketButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`voice_support:${guild.id}:${ticketNumber}:${member.id}`)
                .setLabel('🔰 Subir a Soporte')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel(messages.buttons.closeTicket)
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger),
        );

        const allowedRoles = category.allowedRoles || [];
        let roleMentions = '';
        
        if (allowedRoles.length > 0) {
            roleMentions = allowedRoles.map(roleId => `<@&${roleId}>`).join(' ');
        } else {
            roleMentions = `<@&${config.tickets.staffRoleId}>`;
        }

        await channel.send({
            content: `${member} | ${roleMentions}`,
            embeds: [welcomeEmbed],
            components: [ticketButtons],
        });

        const successMessage = messages.success.ticketCreated.replace(
            '{channel}',
            channel.toString(),
        );

        // Registrar ticket en sistema de inactividad
        if (ticketInactivity) {
            ticketInactivity.trackTicket(channel.id, member.id, ticketType);
        }

        await interaction.reply({
            content: successMessage,
            ephemeral: true,
        });

        logger.success(`Ticket #${ticketNumber} creado para ${member.user.tag} en categoría ${category.name}`);
    } catch (error) {
        logger.error('Error al crear canal de ticket', error);
        await interaction.reply({
            content: messages.errors.creationError,
            ephemeral: true,
        });
    }
}

module.exports = {
    handleTicketCategorySelect
};
