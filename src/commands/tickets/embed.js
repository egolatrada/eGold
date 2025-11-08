const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('📝 Crea un embed personalizado')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde enviar el embed')
                .setRequired(true)),
    
    async execute(interaction, context) {
        try {
            const targetChannel = interaction.options.getChannel('canal');

            // Verificar que el canal sea de texto
            if (!targetChannel.isTextBased()) {
                return await interaction.reply({
                    content: '❌ El canal seleccionado debe ser un canal de texto.',
                    ephemeral: true
                });
            }

            // Crear modal para el contenido del embed
            const modal = new ModalBuilder()
                .setCustomId(`embed_modal_${targetChannel.id}`)
                .setTitle('📝 Crear Embed');

            const titleInput = new TextInputBuilder()
                .setCustomId('embed_title')
                .setLabel('Título del embed')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(config.embed?.maxTitleLength || 256);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('embed_description')
                .setLabel('Descripción del embed')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(config.embed?.maxDescriptionLength || 4000);

            const colorInput = new TextInputBuilder()
                .setCustomId('embed_color')
                .setLabel('Color (hexadecimal, ej: #5865F2)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(config.embed?.defaultColor || '#5865F2')
                .setMaxLength(7);

            const imageInput = new TextInputBuilder()
                .setCustomId('embed_image')
                .setLabel('URL de imagen (opcional)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const footerInput = new TextInputBuilder()
                .setCustomId('embed_footer')
                .setLabel('Texto del footer (opcional)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(2048);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(descriptionInput),
                new ActionRowBuilder().addComponents(colorInput),
                new ActionRowBuilder().addComponents(imageInput),
                new ActionRowBuilder().addComponents(footerInput)
            );

            await interaction.showModal(modal);
            logger.info(`📝 ${interaction.user.tag} abrió modal de embed para canal ${targetChannel.name}`);

        } catch (error) {
            logger.error('Error al mostrar modal de embed', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al abrir el formulario del embed.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};

// Exportar manejador de modal
module.exports.handleEmbedModal = async (interaction) => {
    try {
        const channelId = interaction.customId.split('_')[2];
        const targetChannel = await interaction.guild.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return await interaction.reply({
                content: '❌ No se pudo encontrar el canal destino.',
                ephemeral: true
            });
        }

        const title = interaction.fields.getTextInputValue('embed_title') || null;
        const description = interaction.fields.getTextInputValue('embed_description');
        const colorInput = interaction.fields.getTextInputValue('embed_color') || '#5865F2';
        const imageUrl = interaction.fields.getTextInputValue('embed_image') || null;
        const footerText = interaction.fields.getTextInputValue('embed_footer') || null;

        // Validar color hexadecimal
        let color = colorInput.trim();
        if (!color.startsWith('#')) {
            color = '#' + color;
        }
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
            return await interaction.reply({
                content: '❌ El color debe ser un código hexadecimal válido (ej: #5865F2).',
                ephemeral: true
            });
        }

        // Crear embed
        const embed = new EmbedBuilder()
            .setDescription(description)
            .setColor(color)
            .setTimestamp();

        if (title) embed.setTitle(title);
        if (imageUrl) {
            try {
                new URL(imageUrl);
                embed.setImage(imageUrl);
            } catch (e) {
                return await interaction.reply({
                    content: '❌ La URL de la imagen no es válida.',
                    ephemeral: true
                });
            }
        }
        if (footerText) embed.setFooter({ text: footerText });

        // Enviar embed al canal (de forma anónima)
        await targetChannel.send({ embeds: [embed] });

        await interaction.reply({
            content: `✅ Embed enviado exitosamente a ${targetChannel}`,
            ephemeral: true
        });

        logger.info(`📝 Embed enviado a ${targetChannel.name} (anónimo, solicitado por ${interaction.user.tag})`);

    } catch (error) {
        logger.error('Error al enviar embed', error);
        await interaction.reply({
            content: '❌ Ocurrió un error al enviar el embed.',
            ephemeral: true
        }).catch(() => {});
    }
};
