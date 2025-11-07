const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transcript')
        .setDescription('📋 Genera una transcripción del ticket actual (máximo 50 mensajes)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option
                .setName('cantidad')
                .setDescription('Cantidad de mensajes a incluir (máximo 50)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(50)
        ),
    
    async execute(interaction, context) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const channel = interaction.channel;
            const cantidad = interaction.options.getInteger('cantidad') || 50;

            const isTicketChannel = channel.name.includes('ticket-');
            if (!isTicketChannel) {
                return await interaction.editReply({
                    content: '❌ Este comando solo funciona en canales de tickets.'
                });
            }

            let ticketData = {
                type: "desconocido",
                categoryName: "Desconocido",
                ticketNumber: "N/A",
                creator: "Desconocido",
                creatorTag: "Desconocido",
                createdAt: Date.now()
            };

            if (channel.topic) {
                try {
                    const metadataMatch = channel.topic.match(/Metadata: ({.*})/);
                    if (metadataMatch) {
                        ticketData = JSON.parse(metadataMatch[1]);
                    }
                } catch (e) {
                    logger.warn('No se pudo parsear metadata del topic, usando datos por defecto');
                }
            }

            const category = config.tickets.categories[ticketData.type];

            if (!category) {
                return await interaction.editReply({
                    content: `❌ Error: Tipo de ticket "${ticketData.type}" no encontrado en la configuración.`
                });
            }

            if (!category.transcriptChannelId) {
                return await interaction.editReply({
                    content: `❌ No se ha configurado un canal de transcripciones para la categoría "${category.name}".`
                });
            }

            let transcriptChannel;
            try {
                transcriptChannel = await channel.guild.channels.fetch(category.transcriptChannelId);
            } catch (error) {
                return await interaction.editReply({
                    content: `❌ El canal de transcripciones configurado no existe o no es accesible.`
                });
            }

            logger.info(`📋 ${interaction.user.tag} solicitó transcript de ${channel.name} (${cantidad} mensajes)`);

            let allMessages = [];
            let lastMessageId = null;
            let fetchedCount = 0;

            while (fetchedCount < cantidad) {
                const remaining = cantidad - fetchedCount;
                const limit = Math.min(remaining, 100);
                
                const options = { limit };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }

                const fetchedMessages = await channel.messages.fetch(options);
                
                if (fetchedMessages.size === 0) break;

                allMessages.push(...fetchedMessages.values());
                fetchedCount += fetchedMessages.size;
                lastMessageId = fetchedMessages.last().id;

                if (fetchedMessages.size < limit) break;
            }

            if (allMessages.length === 0) {
                return await interaction.editReply({
                    content: '❌ No hay mensajes en este canal para transcribir.'
                });
            }

            const sortedMessages = allMessages.slice(0, cantidad).reverse();

            const participantIds = new Set();
            sortedMessages.forEach((msg) => {
                if (!msg.author.bot) {
                    participantIds.add(msg.author.id);
                }
            });

            const participantMentions = Array.from(participantIds)
                .map((id) => `<@${id}>`)
                .join(", ");

            let transcript = `═══════════════════════════════════════════════════════════════\n`;
            transcript += `   TRANSCRIPCIÓN DE TICKET\n`;
            transcript += `═══════════════════════════════════════════════════════════════\n\n`;
            transcript += `📍 Canal: #${channel.name}\n`;
            transcript += `🆔 ID del Canal: ${channel.id}\n`;
            transcript += `📂 Tipo: ${ticketData.categoryName}\n`;
            transcript += `🎫 Número: #${ticketData.ticketNumber}\n`;
            transcript += `👤 Creador: ${ticketData.creatorTag} (${ticketData.creator})\n`;
            transcript += `📊 Total de mensajes: ${sortedMessages.length}\n`;
            transcript += `📅 Generado: ${new Date().toLocaleString('es-ES', { 
                timeZone: 'Europe/Madrid',
                dateStyle: 'full',
                timeStyle: 'medium'
            })}\n`;
            transcript += `👥 Solicitado por: ${interaction.user.tag} (${interaction.user.id})\n`;
            transcript += `\n${'═'.repeat(63)}\n\n`;

            for (const msg of sortedMessages) {
                const timestamp = msg.createdAt.toLocaleString('es-ES', {
                    timeZone: 'Europe/Madrid',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                const author = msg.author.bot ? `🤖 ${msg.author.tag}` : `👤 ${msg.author.tag}`;
                const authorId = msg.author.id;

                transcript += `┌─ [${timestamp}]\n`;
                transcript += `├─ ${author} (${authorId})\n`;
                transcript += `└─ ${msg.content || '[Sin contenido de texto]'}\n`;

                if (msg.embeds.length > 0) {
                    for (const embed of msg.embeds) {
                        transcript += `   📎 Embed:\n`;
                        if (embed.title) transcript += `      Título: ${embed.title}\n`;
                        if (embed.description) {
                            const desc = embed.description.substring(0, 200);
                            transcript += `      Descripción: ${desc}${embed.description.length > 200 ? '...' : ''}\n`;
                        }
                        if (embed.url) transcript += `      URL: ${embed.url}\n`;
                    }
                }

                if (msg.attachments.size > 0) {
                    msg.attachments.forEach((attachment, index) => {
                        transcript += `   📁 Archivo ${index + 1}: ${attachment.name}\n`;
                        transcript += `      URL: ${attachment.url}\n`;
                        transcript += `      Tamaño: ${(attachment.size / 1024).toFixed(2)} KB\n`;
                    });
                }

                if (msg.stickers.size > 0) {
                    msg.stickers.forEach(sticker => {
                        transcript += `   🎨 Sticker: ${sticker.name}\n`;
                    });
                }

                transcript += `\n`;
            }

            transcript += `\n${'═'.repeat(63)}\n`;
            transcript += `FIN DE LA TRANSCRIPCIÓN\n`;
            transcript += `═══════════════════════════════════════════════════════════════\n`;

            const fileName = `transcript_${channel.name}_${Date.now()}.txt`;
            const buffer = Buffer.from(transcript, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: fileName });

            const transcriptEmbed = new EmbedBuilder()
                .setColor("#3498db")
                .setTitle(`📋 Transcripción de Ticket - ${channel.name}`)
                .setDescription(
                    `**Tipo:** ${ticketData.categoryName} ${category.emoji}\n` +
                    `**Número:** #${ticketData.ticketNumber}\n\n` +
                    `**Creador:** ${ticketData.creatorTag} (<@${ticketData.creator}>)\n` +
                    `**Solicitado por:** ${interaction.user.tag} (<@${interaction.user.id}>)\n\n` +
                    `**Creado:** <t:${Math.floor(ticketData.createdAt / 1000)}:F>\n` +
                    `**Transcripción generada:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                    `**Mensajes guardados:** ${sortedMessages.length}\n` +
                    `**Participantes:** ${participantMentions || 'Ninguno'}`
                )
                .setFooter({ text: `Ticket: ${channel.name}` })
                .setTimestamp();

            await transcriptChannel.send({
                embeds: [transcriptEmbed],
                files: [attachment]
            });

            await interaction.editReply({
                content: `✅ Transcripción generada con éxito\n\n📋 **Mensajes incluidos:** ${sortedMessages.length}\n📁 **Enviado a:** ${transcriptChannel}\n🎫 **Ticket:** ${channel.name}`
            });

            logger.success(`📋 Transcripción generada: ${channel.name} - ${sortedMessages.length} mensajes → ${transcriptChannel.name}`);

        } catch (error) {
            logger.error('Error al generar transcripción', error);
            
            const errorMessage = error.code === 50013 
                ? '❌ No tengo permisos para leer mensajes en este canal.'
                : '❌ Ocurrió un error al generar la transcripción.';

            await interaction.editReply({
                content: errorMessage
            }).catch(() => {});
        }
    }
};
