const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-tickets')
        .setDescription('🎫 [TICKETS] Crea o actualiza el panel de tickets')
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

            // Definir qué categorías mostrar en cada tipo de panel
            // Todas las demás categorías del config.json se incluyen automáticamente en "whitelist"
            const panelCategoryFilters = {
                whitelist: {
                    title: '🎫 Sistema de Tickets — Strangers RP',
                    description: 'Antes de abrir un ticket, asegúrate de seleccionar la categoría correcta, ya que nos ayudará a atenderte más rápido y mantener el orden dentro del servidor. 🎭',
                    footer: 'El staff revisará tu caso lo antes posible.',
                    excludeCategories: ['convalidar-whitelist', 'dudas-generales'] // Excluir categorías de no-whitelist
                },
                no_whitelist: {
                    title: '🎫 Sistema de Acceso — Strangers RP',
                    description: '¡Bienvenido a Strangers RP! Selecciona el tipo de ticket según tu situación:\n\n📋 **Convalidar Whitelist**: Si vienes de otro servidor autorizado\n❓ **Dudas**: Preguntas generales sobre el servidor',
                    footer: 'El staff te atenderá lo antes posible.',
                    includeCategories: ['convalidar-whitelist', 'dudas-generales'] // Solo estas categorías
                }
            };

            const panelConfig = panelCategoryFilters[tipoPanel];
            
            // Construir lista de categorías dinámicamente desde config.json
            const allConfigCategories = Object.keys(config.tickets.categories || {});
            let categoriesToShow = [];

            if (panelConfig.includeCategories) {
                // Modo whitelist: solo las categorías especificadas
                categoriesToShow = panelConfig.includeCategories.filter(cat => 
                    allConfigCategories.includes(cat)
                );
            } else if (panelConfig.excludeCategories) {
                // Modo normal: todas excepto las excluidas
                categoriesToShow = allConfigCategories.filter(cat => 
                    !panelConfig.excludeCategories.includes(cat)
                );
            } else {
                // Por defecto: todas las categorías
                categoriesToShow = allConfigCategories;
            }

            if (categoriesToShow.length === 0) {
                return await interaction.reply({
                    content: '❌ No se encontraron categorías válidas para este panel. Verifica el config.json.',
                    ephemeral: true
                });
            }

            // Crear opciones del menú dinámicamente
            const selectOptions = [];
            for (const categoryKey of categoriesToShow) {
                const category = config.tickets.categories[categoryKey];
                if (category && category.name) {
                    selectOptions.push(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(category.name)
                            .setDescription((category.menuDescription || category.channelDescription || 'Sin descripción').substring(0, 100))
                            .setValue(categoryKey)
                            .setEmoji(category.emoji || '🎫')
                    );
                } else {
                    logger.warn(`Categoría ${categoryKey} no encontrada o incompleta en config.json`);
                }
            }

            if (selectOptions.length === 0) {
                return await interaction.reply({
                    content: '❌ No se pudieron generar opciones de tickets. Verifica que las categorías en config.json tengan campos válidos (name, emoji, menuDescription).',
                    ephemeral: true
                });
            }

            // Crear el embed
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(panelConfig.title)
                .setDescription(panelConfig.description)
                .setFooter({ text: panelConfig.footer })
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
