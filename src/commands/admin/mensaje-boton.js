const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mensaje-boton')
        .setDescription('🔧 [ADMIN] Añade un botón a un mensaje existente')
        .addStringOption(option =>
            option
                .setName('mensaje_id')
                .setDescription('ID del mensaje a editar')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('texto_boton')
                .setDescription('Texto del botón')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('canal_destino')
                .setDescription('Canal al que dirigirá el botón')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, context) {
        try {
            const mensajeId = interaction.options.getString('mensaje_id');
            const textoBoton = interaction.options.getString('texto_boton');
            const canal = interaction.options.getChannel('canal_destino');

            // El canal ya viene validado por Discord
            if (!canal) {
                return await interaction.reply({
                    content: `❌ No se pudo obtener el canal seleccionado`,
                    ephemeral: true
                });
            }

            // Buscar el mensaje
            const mensaje = await interaction.channel.messages.fetch(mensajeId).catch(() => null);
            if (!mensaje) {
                return await interaction.reply({
                    content: `❌ No se encontró el mensaje con ID: ${mensajeId} en este canal`,
                    ephemeral: true
                });
            }

            // Crear el botón con customId que incluye el canal destino
            const boton = new ButtonBuilder()
                .setCustomId(`navegar_canal:${canal.id}`)
                .setLabel(textoBoton)
                .setStyle(ButtonStyle.Primary);

            // Obtener componentes existentes del mensaje
            const componentesExistentes = mensaje.components.map(row => 
                ActionRowBuilder.from(row)
            );

            // Crear nueva fila con el botón
            const nuevaFila = new ActionRowBuilder().addComponents(boton);

            // Añadir la nueva fila a los componentes existentes
            componentesExistentes.push(nuevaFila);

            // Editar el mensaje
            await mensaje.edit({
                components: componentesExistentes
            });

            await interaction.reply({
                content: `✅ Botón "${textoBoton}" añadido al mensaje correctamente. El botón dirigirá a ${canal}`,
                ephemeral: true
            });

            logger.success(`${interaction.user.tag} añadió botón "${textoBoton}" al mensaje ${mensajeId} dirigiendo a canal ${canal.id}`);

        } catch (error) {
            logger.error('Error al editar mensaje con botón', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al añadir el botón al mensaje.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
