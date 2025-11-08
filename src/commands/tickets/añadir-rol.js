const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-añadir-rol')
        .setDescription('👥 [TICKETS] Añade un rol al ticket actual')
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('Rol a añadir al ticket')
                .setRequired(true)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const targetRole = interaction.options.getRole('rol');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede añadir roles a tickets.',
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

            const currentPermissions = channel.permissionOverwrites.cache.get(targetRole.id);
            if (currentPermissions?.allow.has(PermissionFlagsBits.ViewChannel)) {
                return await interaction.reply({
                    content: `⚠️ ${targetRole} ya tiene acceso a este ticket.`,
                    ephemeral: true
                });
            }

            await channel.permissionOverwrites.create(targetRole, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                EmbedLinks: true,
            });

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('✅ Rol Añadido al Ticket')
                .setDescription(`${targetRole} ha sido añadido a este ticket por ${interaction.user}`)
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });

            if (config.logs?.enabled && config.logs.channels?.tickets) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.tickets);
                    
                    const logEmbed = new EmbedBuilder()
                        .setColor('#57F287')
                        .setTitle('👥 Rol Añadido a Ticket')
                        .addFields(
                            { name: 'Ticket', value: `${channel}`, inline: true },
                            { name: 'Rol Añadido', value: `${targetRole} (${targetRole.name})`, inline: true },
                            { name: 'Añadido por', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                            { name: 'Canal ID', value: channel.id, inline: false }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    logger.error('Error al enviar log de añadir rol a ticket', logError);
                }
            }

            logger.info(`👥 ${interaction.user.tag} añadió el rol ${targetRole.name} al ticket ${channel.name}`);

        } catch (error) {
            logger.error('Error al añadir rol al ticket', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al añadir el rol al ticket.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
