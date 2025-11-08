const { PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { config, messages } = require('../../../config');
const logger = require('../../../utils/logger');

// Map para almacenar procesos de cierre pendientes
const pendingCloseProcesses = new Map();

async function handleCloseTicketButton(interaction, context) {
    const channel = interaction.channel;

    if (!channel.name.startsWith("ticket-")) {
        return await interaction.reply({
            content: messages.errors.notTicketChannel,
            ephemeral: true,
        });
    }

    // Crear botón para cancelar cierre
    const cancelButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`cancel_close_${channel.id}`)
            .setLabel('❌ Cancelar Cierre')
            .setStyle(ButtonStyle.Danger)
    );

    // Guardar el proceso de cierre como pendiente
    pendingCloseProcesses.set(channel.id, {
        interactionId: interaction.id,
        timestamp: Date.now()
    });

    await interaction.reply({
        content: messages.ticketClose.processingMessage,
        components: [cancelButton],
        ephemeral: true
    });

    try {
        const { ticketsSystem, ticketHierarchy, ticketInactivity } = context;
        let ticketData = {
            type: "desconocido",
            categoryName: "Desconocido",
            ticketNumber: "N/A",
            creator: "Desconocido",
            creatorTag: "Desconocido",
        };

        // Obtener metadata del sistema en lugar del topic
        const metadata = ticketsSystem.getTicketMetadata(channel.id);
        if (metadata) {
            ticketData = metadata;
        } else {
            // Fallback: intentar leer del topic (para tickets antiguos)
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
        }

        // Normalizar campo creator/creatorId para compatibilidad con tickets antiguos
        if (!ticketData.creator && ticketData.creatorId) {
            ticketData.creator = ticketData.creatorId;
        }

        if (ticketData.ticketNumber) {
            const voiceKey = `${channel.guild.id}:${ticketData.ticketNumber}`;
            const voiceData = ticketsSystem.getVoiceSupportData(voiceKey);
            
            if (voiceData) {
                if (voiceData.timeoutId) {
                    clearTimeout(voiceData.timeoutId);
                    voiceData.timeoutId = null;
                }

                if (voiceData.voiceChannelId) {
                    try {
                        const voiceChannel = await channel.guild.channels
                            .fetch(voiceData.voiceChannelId)
                            .catch(() => null);
                        if (voiceChannel) {
                            await voiceChannel.delete();
                            logger.info(`🎤 Canal de voz del ticket ${ticketData.ticketNumber} eliminado (ticket cerrado)`);
                        }
                    } catch (error) {
                        logger.error('Error al eliminar canal de voz al cerrar ticket', error);
                    }
                }
                
                // NO eliminar el voiceSupportData, solo limpiar el canal activo
                // Mantener el contador de uses para que el límite de 2 canales persista
                voiceData.voiceChannelId = null;
                voiceData.timeoutId = null;
                ticketsSystem.setVoiceSupportData(voiceKey, voiceData);
                logger.info(`🔒 Ticket ${ticketData.ticketNumber} cerrado - Contador de canales de voz: ${voiceData.uses}/2 (permanente)`);
            }
        }

        // Limpiar datos de jerarquía de tickets
        if (ticketHierarchy) {
            await ticketHierarchy.removeTicket(channel.id);
        }

        // Limpiar tracking de inactividad
        if (ticketInactivity) {
            ticketInactivity.removeTicket(channel.id);
        }

        let allMessages = [];
        let lastMessageId = null;

        while (true) {
            const options = { limit: 100 };
            if (lastMessageId) {
                options.before = lastMessageId;
            }

            const fetchedMessages = await channel.messages.fetch(options);
            if (fetchedMessages.size === 0) break;

            allMessages.push(...fetchedMessages.values());
            lastMessageId = fetchedMessages.last().id;

            if (fetchedMessages.size < 100) break;
        }

        const sortedMessages = allMessages.reverse();
        const category = config.tickets.categories[ticketData.type];

        if (!category) {
            await channel.send(`❌ Error: Tipo de ticket "${ticketData.type}" no encontrado en la configuración.`);
            logger.error(`Categoría de ticket no encontrada: ${ticketData.type}`);
            return;
        }

        if (!category.transcriptChannelId) {
            await channel.send(`❌ No se ha configurado un canal de transcripciones para la categoría "${category.name}". Por favor, configura el \`transcriptChannelId\` en config.json.`);
            logger.error(`Canal de transcripciones no configurado para categoría: ${category.name}`);
            return;
        }

        let transcriptChannel;
        try {
            transcriptChannel = await channel.guild.channels.fetch(category.transcriptChannelId);
        } catch (error) {
            await channel.send(`❌ Error: El canal de transcripciones configurado (ID: ${category.transcriptChannelId}) no existe o no es accesible.`);
            logger.error(`Canal de transcripciones no encontrado: ${category.transcriptChannelId}`, error);
            return;
        }

        if (!transcriptChannel) {
            await channel.send(`❌ El canal de transcripciones configurado no existe. Verifica el ID en config.json.`);
            logger.error(`Canal de transcripciones inválido para ${category.name}`);
            return;
        }

        const participantIds = new Set();
        sortedMessages.forEach((msg) => {
            if (!msg.author.bot) {
                participantIds.add(msg.author.id);
            }
        });

        const participantMentions = Array.from(participantIds)
            .map((id) => `<@${id}>`)
            .join(", ");

        const transcriptEmbed = new EmbedBuilder()
            .setColor("#3498db")
            .setTitle(`📋 Transcripción de Ticket - ${channel.name}`)
            .setDescription(
                `**Creador:** ${ticketData.creatorTag} (<@${ticketData.creator}>)\n\n` +
                `**Creado:** <t:${Math.floor(ticketData.createdAt / 1000)}:F>\n` +
                `**Cerrado:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                `**Participantes:** ${participantMentions}`
            );

        let fullTranscript = `=== TRANSCRIPCIÓN COMPLETA ===\n`;
        fullTranscript += `Tipo: ${ticketData.categoryName}\n`;
        fullTranscript += `Canal: ${channel.name}\n`;
        fullTranscript += `Creador: ${ticketData.creatorTag} (${ticketData.creator})\n`;
        fullTranscript += `Número: #${ticketData.ticketNumber}\n`;
        fullTranscript += `Fecha de cierre: ${new Date().toLocaleString("es-ES")}\n`;
        fullTranscript += `${"=".repeat(50)}\n\n`;

        for (const msg of sortedMessages) {
            const timestamp = msg.createdAt.toLocaleString("es-ES");
            const author = `${msg.author.tag} (${msg.author.id})`;
            fullTranscript += `[${timestamp}] ${author}:\n${msg.content}\n`;

            if (msg.embeds.length > 0) {
                fullTranscript += `  [Embed: ${msg.embeds[0].title || "Sin título"}]\n`;
            }

            if (msg.attachments.size > 0) {
                msg.attachments.forEach((att) => {
                    fullTranscript += `  [Adjunto: ${att.url}]\n`;
                });
            }

            fullTranscript += "\n";
        }

        const buffer = Buffer.from(fullTranscript, "utf-8");
        await transcriptChannel.send({
            embeds: [transcriptEmbed],
            files: [
                {
                    attachment: buffer,
                    name: `${channel.name}_${Date.now()}.txt`,
                },
            ],
        });

        const closeEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle(messages.ticketClose.title)
            .setDescription(messages.ticketClose.description)
            .addFields(
                { name: "Tipo", value: ticketData.categoryName, inline: true },
                {
                    name: "Mensajes guardados",
                    value: sortedMessages.length.toString(),
                    inline: true,
                },
            )
            .setTimestamp();

        await channel.send({ embeds: [closeEmbed] });

        logger.success(`Ticket #${ticketData.ticketNumber} cerrado con ${sortedMessages.length} mensajes guardados`);

        const timeoutId = setTimeout(async () => {
            try {
                // Verificar si el proceso sigue pendiente (no fue cancelado)
                if (!pendingCloseProcesses.has(channel.id)) {
                    logger.info(`Cierre del ticket ${channel.name} fue cancelado, no se eliminará el canal`);
                    return;
                }
                
                // Eliminar metadata del ticket antes de eliminar el canal
                ticketsSystem.deleteTicketMetadata(channel.id);
                // Limpiar proceso pendiente de cierre
                pendingCloseProcesses.delete(channel.id);
                await channel.delete();
            } catch (error) {
                logger.error('Error al eliminar canal', error);
            }
        }, 5000);

        // Actualizar el proceso pendiente con el timeoutId
        if (pendingCloseProcesses.has(channel.id)) {
            const processData = pendingCloseProcesses.get(channel.id);
            processData.timeoutId = timeoutId;
            pendingCloseProcesses.set(channel.id, processData);
        }
    } catch (error) {
        logger.error('Error al cerrar ticket', error);
        await channel.send(messages.errors.transcriptError);
    }
}

async function handleReopenTicketButton(interaction, context) {
    await interaction.reply({ content: 'Función de reabrir ticket en migración', ephemeral: true });
}

async function handleTranscriptButton(interaction, context) {
    await interaction.reply({ content: 'Función de transcript en migración', ephemeral: true });
}

async function handleVoiceSupportButton(interaction, context) {
    const [_, guildId, ticketNumber, creatorId] = interaction.customId.split(":");
    const voiceKey = `${guildId}:${ticketNumber}`;
    const { ticketsSystem } = context;

    if (interaction.user.id !== creatorId) {
        return await interaction.reply({
            content: "❌ Solo el creador del ticket puede usar este botón.",
            ephemeral: true,
        });
    }

    let ticketData = ticketsSystem.getVoiceSupportData(voiceKey);
    
    if (!ticketData) {
        ticketData = {
            uses: 0,
            voiceChannelId: null,
            timeoutId: null,
            creatorId: creatorId,
            ticketChannelId: interaction.channelId,
            guildId: guildId,
            ticketNumber: ticketNumber,
            startTime: null,
        };
        ticketsSystem.setVoiceSupportData(voiceKey, ticketData);
    }

    if (!ticketData.creatorId) {
        ticketData.creatorId = creatorId;
    }
    if (!ticketData.ticketChannelId) {
        ticketData.ticketChannelId = interaction.channelId;
    }

    if (ticketData.uses >= 2) {
        return await interaction.reply({
            content: "❌ Has alcanzado el límite de 2 canales de voz para este ticket.",
            ephemeral: true,
        });
    }

    if (ticketData.voiceChannelId) {
        const existingChannel = await interaction.guild.channels
            .fetch(ticketData.voiceChannelId)
            .catch(() => null);
        if (existingChannel) {
            return await interaction.reply({
                content: `❌ Ya existe un canal de voz activo: ${existingChannel}`,
                ephemeral: true,
            });
        } else {
            ticketData.voiceChannelId = null;
        }
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        const category = interaction.channel.parent;
        const voiceChannel = await interaction.guild.channels.create({
            name: `🔰 Ticket ${ticketNumber}`,
            type: ChannelType.GuildVoice,
            parent: category,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: creatorId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                    ],
                },
                {
                    id: config.tickets.staffRoleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                    ],
                },
            ],
        });

        ticketData.uses++;
        ticketData.voiceChannelId = voiceChannel.id;
        ticketData.startTime = Date.now();
        ticketData.participants = []; // Inicializar array de participantes
        ticketsSystem.setVoiceSupportData(voiceKey, ticketData);

        ticketsSystem.scheduleVoiceChannelDeletion(voiceKey, 15 * 60 * 1000, interaction.guild, voiceChannel.id, ticketNumber);

        if (config.logs && config.logs.enabled && config.logs.channels.channels) {
            try {
                const logChannel = await interaction.guild.channels.fetch(config.logs.channels.channels);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor("#00ff00")
                        .setTitle("🎤 Canal de Voz Creado")
                        .setDescription(`Canal de soporte por voz creado`)
                        .addFields(
                            { name: "Canal de Voz", value: `${voiceChannel}`, inline: true },
                            { name: "Ticket Asociado", value: `<#${interaction.channelId}>`, inline: true },
                            { name: "ID Canal Voz", value: voiceChannel.id, inline: false },
                            { name: "Creado por", value: `${interaction.user}`, inline: true },
                            { name: "Ticket #", value: ticketNumber, inline: true },
                        )
                        .setFooter({ text: "⏱️ Timer de 15 min iniciado" })
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            } catch (logError) {
                logger.error('Error al enviar log de canal de voz', logError);
            }
        }

        await interaction.editReply({
            content: `✅ Canal de voz creado: ${voiceChannel}\n⏱️ El canal se eliminará automáticamente en 15 minutos.\n📊 Usos: ${ticketData.uses}/2`,
        });
        
        logger.success(`Canal de voz creado para ticket ${ticketNumber} (uso ${ticketData.uses}/2)`);
    } catch (error) {
        logger.error('Error al crear canal de voz', error);
        await interaction.editReply({
            content: "❌ Error al crear el canal de voz. Inténtalo de nuevo.",
        });
    }
}

async function handleCancelCloseButton(interaction, context) {
    const channelId = interaction.customId.split('_')[2];

    if (!pendingCloseProcesses.has(channelId)) {
        return await interaction.update({
            content: '❌ Este proceso de cierre ya finalizó o fue cancelado.',
            components: []
        });
    }

    // Obtener el proceso y cancelar el timeout
    const processData = pendingCloseProcesses.get(channelId);
    if (processData.timeoutId) {
        clearTimeout(processData.timeoutId);
    }

    // Eliminar el proceso pendiente
    pendingCloseProcesses.delete(channelId);

    await interaction.update({
        content: '✅ Cierre de ticket cancelado exitosamente. El ticket permanece abierto.',
        components: []
    });

    logger.info(`🔄 Cierre de ticket cancelado por ${interaction.user.tag} en ${interaction.channel.name}`);
}

module.exports = {
    handleCloseTicketButton,
    handleReopenTicketButton,
    handleTranscriptButton,
    handleVoiceSupportButton,
    handleCancelCloseButton
};
