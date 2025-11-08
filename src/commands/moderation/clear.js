const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🗑️ Elimina mensajes del canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    
    async execute(interaction, context) {
        const amount = interaction.options.getInteger('cantidad');

        try {
            // Primero, obtener los mensajes que se van a eliminar
            const messagesToDelete = await interaction.channel.messages.fetch({ limit: amount });
            
            // Eliminar los mensajes
            const deleted = await interaction.channel.bulkDelete(messagesToDelete, true);

            // Identificar mensajes que no se pudieron eliminar
            const notDeleted = Array.from(messagesToDelete.values()).filter(
                msg => !deleted.has(msg.id)
            );

            // Función auxiliar para serializar un mensaje completo
            const serializeMessage = (msg, index, status = 'eliminado') => {
                let msgText = '';
                const timestamp = msg.createdAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
                
                if (status === 'no_eliminado') {
                    msgText += `❌ [${index}] ${timestamp} - NO SE PUDO ELIMINAR (>14 días)\n`;
                } else {
                    msgText += `[${index}] ${timestamp}\n`;
                }
                
                msgText += `Autor: ${msg.author.tag} (${msg.author.id})\n`;
                
                if (msg.content) {
                    msgText += `Contenido: ${msg.content}\n`;
                }
                
                if (msg.attachments.size > 0) {
                    msgText += `Adjuntos (${msg.attachments.size}):\n`;
                    msg.attachments.forEach(attachment => {
                        msgText += `  - ${attachment.name}: ${attachment.url}\n`;
                    });
                }
                
                if (msg.embeds.length > 0) {
                    msgText += `Embeds (${msg.embeds.length}):\n`;
                    msg.embeds.forEach((embed, embedIndex) => {
                        msgText += `  Embed ${embedIndex + 1}:\n`;
                        if (embed.title) msgText += `    Título: ${embed.title}\n`;
                        if (embed.description) msgText += `    Descripción: ${embed.description}\n`;
                        if (embed.url) msgText += `    URL: ${embed.url}\n`;
                        if (embed.color) msgText += `    Color: #${embed.color.toString(16).padStart(6, '0')}\n`;
                        if (embed.timestamp) msgText += `    Timestamp: ${new Date(embed.timestamp).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}\n`;
                        if (embed.author) {
                            msgText += `    Autor: ${embed.author.name}\n`;
                            if (embed.author.icon_url || embed.author.iconURL) {
                                msgText += `      Icon: ${embed.author.icon_url || embed.author.iconURL}\n`;
                            }
                            if (embed.author.url) msgText += `      URL: ${embed.author.url}\n`;
                        }
                        if (embed.footer) {
                            msgText += `    Footer: ${embed.footer.text}\n`;
                            if (embed.footer.icon_url || embed.footer.iconURL) {
                                msgText += `      Icon: ${embed.footer.icon_url || embed.footer.iconURL}\n`;
                            }
                        }
                        if (embed.fields && embed.fields.length > 0) {
                            msgText += `    Campos (${embed.fields.length}):\n`;
                            embed.fields.forEach(field => {
                                msgText += `      - ${field.name}: ${field.value} (inline: ${field.inline})\n`;
                            });
                        }
                        if (embed.image) msgText += `    Imagen: ${embed.image.url}\n`;
                        if (embed.thumbnail) msgText += `    Thumbnail: ${embed.thumbnail.url}\n`;
                        if (embed.video) msgText += `    Video: ${embed.video.url}\n`;
                        if (embed.provider) msgText += `    Provider: ${embed.provider.name} (${embed.provider.url || 'N/A'})\n`;
                    });
                }
                
                msgText += `\n${'─'.repeat(50)}\n\n`;
                return msgText;
            };

            // Crear transcript completo
            let transcript = `═══════════════════════════════════════════════════\n`;
            transcript += `TRANSCRIPT DE MENSAJES ELIMINADOS\n`;
            transcript += `═══════════════════════════════════════════════════\n\n`;
            transcript += `Canal: #${interaction.channel.name} (${interaction.channel.id})\n`;
            transcript += `Moderador: ${interaction.user.tag} (${interaction.user.id})\n`;
            transcript += `Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}\n`;
            transcript += `Mensajes solicitados para eliminar: ${messagesToDelete.size}\n`;
            transcript += `Mensajes eliminados exitosamente: ${deleted.size}\n`;
            
            if (notDeleted.length > 0) {
                transcript += `⚠️ Mensajes NO eliminados: ${notDeleted.length} (más de 14 días de antigüedad)\n`;
            }
            
            transcript += `\n═══════════════════════════════════════════════════\n\n`;

            // Ordenar todos los mensajes solicitados del más antiguo al más reciente
            const allMessages = Array.from(messagesToDelete.values()).reverse();
            
            // Primero, mensajes eliminados
            if (deleted.size > 0) {
                transcript += `✅ MENSAJES ELIMINADOS (${deleted.size}):\n\n`;
                let deletedIndex = 1;
                allMessages.forEach(msg => {
                    if (deleted.has(msg.id)) {
                        transcript += serializeMessage(msg, deletedIndex, 'eliminado');
                        deletedIndex++;
                    }
                });
            }

            // Luego, mensajes que no se pudieron eliminar
            if (notDeleted.length > 0) {
                transcript += `\n❌ MENSAJES NO ELIMINADOS (${notDeleted.length}):\n`;
                transcript += `Estos mensajes no se pudieron eliminar porque tienen más de 14 días de antigüedad.\n\n`;
                let notDeletedIndex = 1;
                allMessages.forEach(msg => {
                    if (!deleted.has(msg.id)) {
                        transcript += serializeMessage(msg, notDeletedIndex, 'no_eliminado');
                        notDeletedIndex++;
                    }
                });
            }

            // Enviar respuesta efímera al moderador
            await interaction.reply({
                content: `✅ Se eliminaron **${deleted.size}** mensajes.`,
                flags: MessageFlags.Ephemeral
            });

            // Enviar transcript al canal de logs de comandos
            if (config.logs && config.logs.enabled && config.logs.channels && config.logs.channels.commands) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.commands);
                    
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle('🗑️ Mensajes Eliminados')
                            .setColor('#FF6B6B')
                            .addFields(
                                { name: '📍 Canal', value: `${interaction.channel}`, inline: true },
                                { name: '👤 Moderador', value: `${interaction.user}`, inline: true },
                                { name: '📊 Cantidad', value: `${deleted.size} mensajes`, inline: true }
                            )
                            .setFooter({ text: `ID del moderador: ${interaction.user.id}` })
                            .setTimestamp();

                        // Crear archivo de transcript
                        const attachment = new AttachmentBuilder(
                            Buffer.from(transcript, 'utf-8'),
                            { name: `transcript-${interaction.channel.name}-${Date.now()}.txt` }
                        );

                        await logChannel.send({ 
                            embeds: [embed], 
                            files: [attachment] 
                        });

                        logger.info(`📋 Transcript de ${deleted.size} mensajes eliminados enviado al canal de logs`);
                    }
                } catch (error) {
                    logger.error('Error al enviar transcript al canal de logs:', error);
                }
            }

        } catch (error) {
            logger.error('Error al eliminar mensajes:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al intentar eliminar los mensajes. Los mensajes más antiguos de 14 días no se pueden eliminar en masa.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
