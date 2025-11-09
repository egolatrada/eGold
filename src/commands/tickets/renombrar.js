const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('renombrar')
        .setDescription('✏️ [TICKETS] Renombra el ticket con cualquier frase (mantiene el emoji original)')
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('Nueva descripción del ticket (puede ser una frase completa)')
                .setRequired(true)
                .setMaxLength(80)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const newName = interaction.options.getString('nombre');

            // Verificar permisos: Gestionar Mensajes o rol de staff configurado
            const hasManageMessages = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);
            const staffRoleId = config.tickets?.staffRoleId;
            const hasStaffRole = staffRoleId && interaction.member.roles.cache.has(staffRoleId);

            if (!hasManageMessages && !hasStaffRole) {
                return await interaction.reply({
                    content: '❌ Necesitas permisos de **Gestionar Mensajes** o ser miembro del staff para renombrar tickets.',
                    ephemeral: true
                });
            }

            // Verificar que estamos en un canal de ticket
            const isCommandTicket = channel.name.startsWith('ticket-');
            const ticketCategories = Object.values(config.tickets?.categories || {});
            const isPanelTicket = ticketCategories.some(cat => cat.categoryId === channel.parentId);
            
            if (!isCommandTicket && !isPanelTicket) {
                return await interaction.reply({
                    content: '❌ Este comando solo puede usarse en canales de tickets.',
                    ephemeral: true
                });
            }

            // Extraer el emoji, separador y número del nombre actual
            // Formato esperado: (emoji)(separador)(nombre)-(número)
            // Soporta varios separadores: ┃, ┊, │, |
            const emojiSeparatorMatch = channel.name.match(/^(.+?)([┃┊│|])(.+)-(\d+)$/);
            const legacyFormatMatch = channel.name.match(/^ticket-(\d+)/);
            
            let emojiPart, separatorChar, ticketNumber;
            
            if (emojiSeparatorMatch) {
                // Formato nuevo con emoji: 🔧┊soporte-dudas-14
                emojiPart = emojiSeparatorMatch[1]; // 🔧
                separatorChar = emojiSeparatorMatch[2]; // ┊
                ticketNumber = emojiSeparatorMatch[4]; // 14
            } else if (legacyFormatMatch) {
                // Formato legacy sin emoji: ticket-0012
                emojiPart = null;
                separatorChar = null;
                ticketNumber = legacyFormatMatch[1];
            } else {
                return await interaction.reply({
                    content: '❌ No se pudo detectar el formato del ticket.',
                    ephemeral: true
                });
            }

            // Función de sanitización para nombres de canales (Discord no permite espacios)
            // Convierte espacios en guiones para mantener frases legibles
            const sanitizeName = (name) => {
                return name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                    .replace(/\s+/g, '-') // Convertir espacios en guiones
                    .replace(/[^a-z0-9-]+/g, '-') // Reemplazar caracteres especiales con guiones
                    .replace(/-+/g, '-') // Evitar guiones múltiples consecutivos
                    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
                    .substring(0, 80); // Limitar longitud (Discord tiene límite de 100 chars total)
            };
            
            const sanitizedNewName = sanitizeName(newName);
            
            // Construir el nuevo nombre preservando el emoji y separador original
            let finalName;
            if (emojiPart && separatorChar) {
                // Mantener emoji y separador original
                finalName = `${emojiPart}${separatorChar}${sanitizedNewName}-${ticketNumber}`;
            } else {
                // Formato legacy
                finalName = `ticket-${ticketNumber}-${sanitizedNewName}`;
            }

            const oldName = channel.name;
            await channel.setName(finalName);

            // Confirmar acción
            await interaction.reply({
                content: `✅ Ticket renombrado a **${finalName}**`,
                ephemeral: true
            });

            if (config.logs?.enabled && config.logs.channels?.tickets) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.tickets);
                    
                    const logEmbed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('✏️ Ticket Renombrado')
                        .addFields(
                            { name: 'Ticket', value: `${channel}`, inline: false },
                            { name: 'Nombre Anterior', value: `\`${oldName}\``, inline: true },
                            { name: 'Nombre Nuevo', value: `\`${finalName}\``, inline: true },
                            { name: 'Renombrado por', value: `${interaction.user} (${interaction.user.tag})`, inline: false },
                            { name: 'Canal ID', value: channel.id, inline: false }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    logger.error('Error al enviar log de renombrar ticket', logError);
                }
            }

            logger.info(`✏️ ${interaction.user.tag} renombró ticket de "${oldName}" a "${finalName}"`);

        } catch (error) {
            logger.error('Error al renombrar ticket', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al renombrar el ticket.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
