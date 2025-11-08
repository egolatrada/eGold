const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-renombrar')
        .setDescription('✏️ [TICKETS] Renombra el ticket actual según prioridad')
        .addStringOption(option =>
            option
                .setName('prioridad')
                .setDescription('Nivel de prioridad del ticket')
                .setRequired(true)
                .addChoices(
                    { name: '🔴 Urgente', value: 'urgente' },
                    { name: '🟠 Medio Urgente', value: 'medio' },
                    { name: '🟡 Sin Mucha Prisa', value: 'baja' },
                    { name: '🟢 No Corre Prisa', value: 'ninguna' }
                )
        )
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('Nombre personalizado para el ticket (opcional)')
                .setRequired(false)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const priority = interaction.options.getString('prioridad');
            const customName = interaction.options.getString('nombre');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede renombrar tickets.',
                    ephemeral: true
                });
            }

            // Extraer el número y categoría del nombre actual
            // Soportar formato nuevo: (emoji)┃(categoría)-(número)
            // Y formato legacy: ticket-(número)-usuario
            let ticketCategory, ticketNumber;
            
            const newFormatMatch = channel.name.match(/┃(.+)-(\d+)$/);
            const legacyFormatMatch = channel.name.match(/ticket-(\d+)/);
            
            if (newFormatMatch) {
                // Formato nuevo
                ticketCategory = newFormatMatch[1];
                ticketNumber = newFormatMatch[2];
            } else if (legacyFormatMatch) {
                // Formato legacy
                ticketNumber = legacyFormatMatch[1];
                ticketCategory = 'ticket'; // Categoría por defecto para legacy
            } else {
                return await interaction.reply({
                    content: '❌ Este comando solo funciona en canales de tickets.',
                    ephemeral: true
                });
            }

            const priorityConfig = {
                urgente: { emoji: '🔴', color: '#ED4245' },
                medio: { emoji: '🟠', color: '#F26522' },
                baja: { emoji: '🟡', color: '#FEE75C' },
                ninguna: { emoji: '🟢', color: '#57F287' }
            };

            const { emoji, color } = priorityConfig[priority];
            
            // Función de sanitización para nombres de canales
            const sanitizeName = (name) => {
                return name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
                    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
            };
            
            let newName;
            if (customName) {
                // Si hay nombre personalizado, sanitizarlo y reemplazar la parte después de ┃
                const sanitizedCustomName = sanitizeName(customName);
                newName = `${emoji}┃${sanitizedCustomName}-${ticketNumber}`;
            } else {
                // Si no hay nombre personalizado, sanitizar y mantener la categoría original
                const sanitizedCategory = sanitizeName(ticketCategory);
                newName = `${emoji}┃${sanitizedCategory}-${ticketNumber}`;
            }

            const oldName = channel.name;
            await channel.setName(newName);

            // Confirmar acción sin mensaje público
            await interaction.reply({
                content: `✅ Ticket renombrado a **${newName}** con prioridad ${emoji}`,
                ephemeral: true
            });

            if (config.logs?.enabled && config.logs.channels?.tickets) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.tickets);
                    
                    const logEmbed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle('✏️ Ticket Renombrado con Prioridad')
                        .addFields(
                            { name: 'Ticket', value: `${channel}`, inline: false },
                            { name: 'Nombre Anterior', value: `\`${oldName}\``, inline: true },
                            { name: 'Nombre Nuevo', value: `\`${newName}\``, inline: true },
                            { name: 'Prioridad', value: `${emoji} ${priority.toUpperCase()}`, inline: true },
                            { name: 'Renombrado por', value: `${interaction.user} (${interaction.user.tag})`, inline: false },
                            { name: 'Canal ID', value: channel.id, inline: false }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    logger.error('Error al enviar log de renombrar ticket', logError);
                }
            }

            logger.info(`✏️ ${interaction.user.tag} renombró ticket de "${oldName}" a "${newName}" con prioridad ${priority}`);

        } catch (error) {
            logger.error('Error al renombrar ticket', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al renombrar el ticket.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
