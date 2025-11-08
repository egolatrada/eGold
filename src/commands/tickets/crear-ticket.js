const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-crear')
        .setDescription('🎫 [TICKETS] Crea un ticket en nombre de un usuario o rol')
        .addStringOption(option =>
            option
                .setName('tipo')
                .setDescription('Tipo de creación (Usuario o Rol)')
                .setRequired(true)
                .addChoices(
                    { name: '👤 Usuario', value: 'usuario' },
                    { name: '👥 Rol', value: 'rol' }
                )
        )
        .addStringOption(option =>
            option
                .setName('categoria')
                .setDescription('Categoría del ticket (escribe para buscar)')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario para quien se creará el ticket')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('Rol para quien se creará el ticket')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction, context) {
        try {
            const tipo = interaction.options.getString('tipo');
            const targetUser = interaction.options.getUser('usuario');
            const targetRole = interaction.options.getRole('rol');
            let selectedCategory = interaction.options.getString('categoria');
            const { ticketCounters, ticketInactivity, ticketHierarchy } = context;

            if (!ticketCounters) {
                return await interaction.reply({
                    content: '❌ El sistema de tickets no está disponible.',
                    ephemeral: true
                });
            }

            if (tipo === 'usuario' && !targetUser) {
                return await interaction.reply({
                    content: '❌ Debes seleccionar un usuario cuando el tipo es "Usuario".',
                    ephemeral: true
                });
            }

            if (tipo === 'rol' && !targetRole) {
                return await interaction.reply({
                    content: '❌ Debes seleccionar un rol cuando el tipo es "Rol".',
                    ephemeral: true
                });
            }

            if (!selectedCategory) {
                return await interaction.editReply({
                    content: '❌ Debes proporcionar una categoría válida.'
                });
            }

            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            
            if (tipo === 'usuario') {
                const member = await guild.members.fetch(targetUser.id).catch(() => null);
                
                if (!member) {
                    return await interaction.editReply({
                        content: '❌ No se pudo encontrar al usuario en este servidor.'
                    });
                }
            }

            const categoryConfig = config.tickets?.categories?.[selectedCategory];
            if (!categoryConfig) {
                return await interaction.editReply({
                    content: '❌ Categoría no encontrada.'
                });
            }

            const ticketNumber = ticketCounters.getNextTicket(guild.id, selectedCategory);
            const ticketChannelName = `ticket-${ticketNumber.toString().padStart(4, '0')}`;

            const category = await guild.channels.fetch(categoryConfig.categoryId).catch(() => null);
            if (!category || category.type !== ChannelType.GuildCategory) {
                return await interaction.editReply({
                    content: `❌ No se pudo encontrar la categoría para **${categoryConfig.name}**.`
                });
            }

            const existingChannel = guild.channels.cache.find(
                ch => ch.name === ticketChannelName && ch.parentId === category.id
            );

            if (existingChannel) {
                return await interaction.editReply({
                    content: `⚠️ Ya existe un ticket con ese número: ${existingChannel}`
                });
            }

            let hierarchyPerms = null;
            if (config.tickets?.hierarchy?.hierarchyEnabled && ticketHierarchy) {
                hierarchyPerms = ticketHierarchy.getInitialPermissions(selectedCategory);
            }

            const permissionOverwrites = [
                {
                    id: guild.id,
                    deny: ['ViewChannel']
                }
            ];

            if (tipo === 'usuario') {
                permissionOverwrites.push({
                    id: targetUser.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks']
                });
            } else {
                permissionOverwrites.push({
                    id: targetRole.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks']
                });
            }

            if (hierarchyPerms) {
                hierarchyPerms.forEach(perm => permissionOverwrites.push(perm));
            } else {
                const staffRoleId = categoryConfig.staffRoleId || config.tickets.staffRoleId;
                if (staffRoleId) {
                    permissionOverwrites.push({
                        id: staffRoleId,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks']
                    });
                }
            }

            const ticketChannel = await guild.channels.create({
                name: ticketChannelName,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: JSON.stringify({
                    ticketType: selectedCategory,
                    creatorId: tipo === 'usuario' ? targetUser.id : targetRole.id,
                    creatorType: tipo,
                    createdAt: Date.now(),
                    ticketNumber: ticketNumber
                }),
                permissionOverwrites: permissionOverwrites
            });

            const createdForValue = tipo === 'usuario' 
                ? `${targetUser}` 
                : `<@&${targetRole.id}>`;
            const createdForIcon = tipo === 'usuario' ? '👤' : '👥';

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`${categoryConfig.emoji || '🎫'} ${categoryConfig.name}`)
                .setDescription(categoryConfig.channelDescription || `Gracias por abrir un ticket. El staff te atenderá pronto.`)
                .addFields({ name: `${createdForIcon} Creado para`, value: createdForValue, inline: true })
                .setFooter({ text: `Ticket #${ticketNumber.toString().padStart(4, '0')}` })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('voice-support')
                    .setLabel('Subir a Soporte')
                    .setEmoji('🔰')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('close-ticket')
                    .setLabel('Cerrar Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            const staffRoleId = categoryConfig.staffRoleId || config.tickets.staffRoleId;
            const mentionText = tipo === 'usuario' 
                ? `${targetUser} ${staffRoleId ? `<@&${staffRoleId}>` : ''}` 
                : `<@&${targetRole.id}> ${staffRoleId ? `<@&${staffRoleId}>` : ''}`;

            await ticketChannel.send({
                content: mentionText,
                embeds: [welcomeEmbed],
                components: [row]
            });

            if (ticketInactivity) {
                const creatorId = tipo === 'usuario' ? targetUser.id : targetRole.id;
                ticketInactivity.trackTicket(ticketChannel.id, creatorId, selectedCategory, tipo);
            }

            if (hierarchyPerms && ticketHierarchy && tipo === 'usuario') {
                ticketHierarchy.initializeTicket(ticketChannel.id, targetUser.id, selectedCategory);
            }

            const targetName = tipo === 'usuario' ? targetUser.tag : targetRole.name;
            await interaction.editReply({
                content: `✅ Ticket creado exitosamente para ${tipo === 'usuario' ? targetUser : `**@${targetRole.name}**`}: ${ticketChannel}`
            });

            logger.info(`🎫 ${interaction.user.tag} creó ticket ${ticketChannelName} para ${tipo} "${targetName}" en categoría ${selectedCategory}`);

        } catch (error) {
            logger.error('Error al crear ticket', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al crear el ticket.'
            }).catch(() => {});
        }
    }
};
