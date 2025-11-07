const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('renombrar')
        .setDescription('✏️ Renombra el ticket actual según prioridad')
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

            const isTicketChannel = channel.name.includes('ticket-');
            if (!isTicketChannel) {
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
            const ticketNumber = channel.name.match(/ticket-(\d+)/)?.[1] || '0000';
            
            let newName;
            if (customName) {
                const sanitizedName = customName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                newName = `${emoji}-${sanitizedName}-${ticketNumber}`;
            } else {
                newName = `${emoji}-ticket-${ticketNumber}`;
            }

            const oldName = channel.name;
            await channel.setName(newName);

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle('✏️ Ticket Renombrado')
                .setDescription(`Este ticket ha sido renombrado con prioridad **${emoji} ${priority.toUpperCase()}**`)
                .addFields(
                    { name: 'Nombre Anterior', value: `\`${oldName}\``, inline: true },
                    { name: 'Nombre Nuevo', value: `\`${newName}\``, inline: true },
                    { name: 'Renombrado por', value: `${interaction.user}`, inline: false }
                )
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
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
