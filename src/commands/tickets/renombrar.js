const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('renombrar')
        .setDescription('✏️ [TICKETS] Renombra el ticket (mantiene el emoji original)')
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('Nuevo nombre para el ticket (sin emoji ni separador)')
                .setRequired(true)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const newName = interaction.options.getString('nombre');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede renombrar tickets.',
                    ephemeral: true
                });
            }

            // Extraer el emoji, separador y número del nombre actual
            // Formato esperado: (emoji)┃(nombre)-(número)
            const emojiSeparatorMatch = channel.name.match(/^(.+?)┃(.+)-(\d+)$/);
            const legacyFormatMatch = channel.name.match(/^ticket-(\d+)/);
            
            let emojiPart, ticketNumber;
            
            if (emojiSeparatorMatch) {
                // Formato nuevo con emoji: 🔧┃soporte-dudas-12
                emojiPart = emojiSeparatorMatch[1]; // 🔧
                ticketNumber = emojiSeparatorMatch[3]; // 12
            } else if (legacyFormatMatch) {
                // Formato legacy sin emoji: ticket-0012
                emojiPart = null;
                ticketNumber = legacyFormatMatch[1];
            } else {
                return await interaction.reply({
                    content: '❌ Este comando solo funciona en canales de tickets.',
                    ephemeral: true
                });
            }

            // Función de sanitización para nombres de canales
            const sanitizeName = (name) => {
                return name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
                    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
            };
            
            const sanitizedNewName = sanitizeName(newName);
            
            // Construir el nuevo nombre preservando el emoji original
            let finalName;
            if (emojiPart) {
                // Mantener emoji y separador original
                finalName = `${emojiPart}┃${sanitizedNewName}-${ticketNumber}`;
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
