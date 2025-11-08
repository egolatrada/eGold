const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-tickets')
        .setDescription('🎫 Crea o actualiza el panel de tickets')
        .addStringOption(option =>
            option
                .setName('tipo')
                .setDescription('Tipo de panel a crear')
                .setRequired(true)
                .addChoices(
                    { name: 'Whitelist', value: 'whitelist' },
                    { name: 'No Whitelist', value: 'no_whitelist' }
                )
        )
        .addStringOption(option =>
            option
                .setName('mensaje_id')
                .setDescription('ID del mensaje donde actualizar el panel (opcional - si no se proporciona, crea uno nuevo)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, context) {
        try {
            const tipoPanel = interaction.options.getString('tipo');
            const mensajeId = interaction.options.getString('mensaje_id');

            // Configuraciones de los paneles
            const panelConfigs = {
                whitelist: {
                    title: '🎫 Sistema de Tickets — Strangers RP',
                    description: 'Antes de abrir un ticket, asegúrate de seleccionar la categoría correcta, ya que nos ayudará a atenderte más rápido y mantener el orden dentro del servidor. 🎭\n\n📌 El staff revisará tu caso lo antes posible. • <t:' + Math.floor(Date.now() / 1000) + ':R>',
                    categories: [
                        'soporte-dudas',
                        'bugs-fallos',
                        'donaciones',
                        'playmakers',
                        'ck',
                        'reportes-publicos',
                        'ticket-apelacion',
                        'ticket-devoluciones',
                        'creador-contenido',
                        'peds',
                        'ems',
                        'lspd-sapd',
                        'org-criminales',
                        'comercios'
                    ]
                },
                no_whitelist: {
                    title: '🎫 Panel de Acceso — Strangers RP',
                    description: '¡Bienvenido a Strangers RP! Selecciona el tipo de ticket según tu situación:\n\n📋 **Convalidar Whitelist**: Si vienes de otro servidor autorizado\n❓ **Dudas**: Preguntas generales sobre el servidor\n\n📌 El staff te atenderá lo antes posible.',
                    categories: [
                        'convalidar-whitelist',
                        'dudas-generales'
                    ]
                }
            };

            const panelConfig = panelConfigs[tipoPanel];
            
            if (!panelConfig) {
                return await interaction.reply({
                    content: '❌ Tipo de panel no válido.',
                    ephemeral: true
                });
            }

            // Crear opciones del menú
            const selectOptions = [];
            for (const categoryKey of panelConfig.categories) {
                const category = config.tickets.categories[categoryKey];
                if (category) {
                    selectOptions.push(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(category.name)
                            .setDescription(category.menuDescription || category.channelDescription)
                            .setValue(categoryKey)
                            .setEmoji(category.emoji)
                    );
                }
            }

            if (selectOptions.length === 0) {
                return await interaction.reply({
                    content: '❌ No se encontraron categorías válidas para este panel en config.json',
                    ephemeral: true
                });
            }

            // Crear el embed
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(panelConfig.title)
                .setDescription(panelConfig.description)
                .setTimestamp();

            // Crear el menú desplegable
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_category_select')
                .setPlaceholder('Selecciona el tipo de ticket')
                .addOptions(selectOptions);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Si se proporcionó un ID de mensaje, actualizarlo
            if (mensajeId) {
                try {
                    const mensaje = await interaction.channel.messages.fetch(mensajeId);
                    await mensaje.edit({
                        embeds: [embed],
                        components: [row]
                    });

                    await interaction.reply({
                        content: `✅ Panel de tickets **${tipoPanel}** actualizado correctamente en el mensaje ${mensajeId}`,
                        ephemeral: true
                    });

                    logger.success(`Panel de tickets ${tipoPanel} actualizado por ${interaction.user.tag} en mensaje ${mensajeId}`);
                } catch (error) {
                    logger.error('Error al actualizar mensaje del panel', error);
                    return await interaction.reply({
                        content: `❌ No se pudo encontrar o editar el mensaje con ID: ${mensajeId}. Asegúrate de que el mensaje existe en este canal.`,
                        ephemeral: true
                    });
                }
            } else {
                // Crear un nuevo mensaje
                await interaction.channel.send({
                    embeds: [embed],
                    components: [row]
                });

                await interaction.reply({
                    content: `✅ Panel de tickets **${tipoPanel}** creado correctamente`,
                    ephemeral: true
                });

                logger.success(`Panel de tickets ${tipoPanel} creado por ${interaction.user.tag}`);
            }

        } catch (error) {
            logger.error('Error al crear/actualizar panel de tickets', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al crear/actualizar el panel de tickets.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
