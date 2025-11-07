const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('añadir-usuario')
        .setDescription('👥 Añade un usuario al ticket actual')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario a añadir al ticket')
                .setRequired(true)
        ),
    
    async execute(interaction, context) {
        try {
            const channel = interaction.channel;
            const targetUser = interaction.options.getUser('usuario');
            const staffRoleId = config.tickets?.staffRoleId;

            if (!staffRoleId || !interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: '❌ Solo el staff puede añadir usuarios a tickets.',
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

            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            if (!member) {
                return await interaction.reply({
                    content: '❌ No se pudo encontrar al usuario en este servidor.',
                    ephemeral: true
                });
            }

            const currentPermissions = channel.permissionOverwrites.cache.get(targetUser.id);
            if (currentPermissions?.allow.has(PermissionFlagsBits.ViewChannel)) {
                return await interaction.reply({
                    content: `⚠️ ${targetUser} ya tiene acceso a este ticket.`,
                    ephemeral: true
                });
            }

            await channel.permissionOverwrites.create(targetUser, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                EmbedLinks: true,
            });

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('✅ Usuario Añadido al Ticket')
                .setDescription(`${targetUser} ha sido añadido a este ticket por ${interaction.user}`)
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });

            if (config.logs?.enabled && config.logs.channels?.tickets) {
                try {
                    const logChannel = await interaction.guild.channels.fetch(config.logs.channels.tickets);
                    
                    const logEmbed = new EmbedBuilder()
                        .setColor('#57F287')
                        .setTitle('👥 Usuario Añadido a Ticket')
                        .addFields(
                            { name: 'Ticket', value: `${channel}`, inline: true },
                            { name: 'Usuario Añadido', value: `${targetUser} (${targetUser.tag})`, inline: true },
                            { name: 'Añadido por', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                            { name: 'Canal ID', value: channel.id, inline: false }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    logger.error('Error al enviar log de añadir usuario a ticket', logError);
                }
            }

            logger.info(`👥 ${interaction.user.tag} añadió a ${targetUser.tag} al ticket ${channel.name}`);

        } catch (error) {
            logger.error('Error al añadir usuario al ticket', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al añadir el usuario al ticket.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
