const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comandos')
        .setDescription('📋 [INFO] Muestra TODOS los comandos del bot organizados por categoría'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📋 Lista Completa de Comandos - eGold Bot')
            .setDescription('Todos los comandos disponibles organizados por categoría')
            .addFields(
                {
                    name: '🎫 TICKETS (8 comandos)',
                    value: '• `/panel-tickets` - Crea el panel de tickets (whitelist/no_whitelist)\n' +
                           '• `/crear-ticket` - Crea ticket para usuario o rol\n' +
                           '• `/ticket-añadir` - Añade usuario o rol al ticket\n' +
                           '• `/eliminar` - Elimina usuario o rol del ticket\n' +
                           '• `/renombrar` - Renombra ticket con prioridad\n' +
                           '• `/transcript` - Genera transcripción\n' +
                           '• `/mantener-activo` - Marca ticket permanente\n' +
                           '• `/embed` - Crea embed en ticket',
                    inline: false
                },
                {
                    name: '🔧 ADMIN (4 comandos)',
                    value: '• `/restart` - Reinicia el bot (solo fundadores)\n' +
                           '• `/staff-status` - Estadísticas del staff\n' +
                           '• `/mensaje-boton` - Añade botón a mensaje\n' +
                           '• `/sug-responder` - Aprobar/rechazar sugerencia',
                    inline: false
                },
                {
                    name: '📝 COMANDOS PERSONALIZADOS (5 comandos)',
                    value: '• `/comando-crear` - Crear comando personalizado\n' +
                           '• `/comando-editar` - Editar comando existente\n' +
                           '• `/comando-eliminar` - Eliminar comando\n' +
                           '• `/comandos` - Ver todos los comandos del bot\n' +
                           '• `/comando-lista` - Ver comandos personalizados',
                    inline: false
                },
                {
                    name: 'ℹ️ INFO (6 comandos)',
                    value: '• `/bot-info` - Información completa del bot\n' +
                           '• `/rol-id` - Info detallada de un rol\n' +
                           '• `/solicitar-bot` - Info de servicios de bot\n' +
                           '• `/enviar-info` - Envía info al canal configurado\n' +
                           '• `/donar` - Info de donaciones\n' +
                           '• `/sugerir` - Crear sugerencia',
                    inline: false
                },
                {
                    name: '🛡️ MODERACIÓN (7 comandos)',
                    value: '• `/kick` - Expulsa usuario del servidor\n' +
                           '• `/ban` - Banea usuario permanentemente\n' +
                           '• `/unban` - Desbanea usuario\n' +
                           '• `/clear` - Elimina mensajes (1-100)\n' +
                           '• `/warn` - Advertir a un usuario (grave/moderado/suave)\n' +
                           '• `/warn-lista` - Ver lista de advertencias (general o por usuario)\n' +
                           '• `/warn-eliminar` - Revocar advertencia por ID',
                    inline: false
                },
                {
                    name: '✅ TAREAS (3 comandos)',
                    value: '• `/tarea-crear` - Crear lista de tareas\n' +
                           '• `/tarea-borrar` - Eliminar todas las tareas\n' +
                           '• `/tarea-ver` - Ver tareas actuales',
                    inline: false
                },
                {
                    name: '🎨 BIENVENIDA (3 comandos)',
                    value: '• `/bienvenida-setup` - Configurar sistema de bienvenida\n' +
                           '• `/bienvenida-editar` - Editar mensaje de bienvenida\n' +
                           '• `/bienvenida-test` - Probar mensaje de bienvenida',
                    inline: false
                }
            )
            .setFooter({ text: 'Total: 39 comandos | Bot desarrollado por @egolatrada' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
};
