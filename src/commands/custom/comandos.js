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
                    value: '• `/setup-panel` - Crea el panel de tickets\n' +
                           '• `/crear-ticket` - Crea ticket para usuario o rol\n' +
                           '• `/añadir` - Añade usuario o rol al ticket\n' +
                           '• `/eliminar` - Elimina usuario o rol del ticket\n' +
                           '• `/renombrar` - Renombra ticket con prioridad\n' +
                           '• `/transcript` - Genera transcripción\n' +
                           '• `/mantener-activo` - Marca ticket permanente\n' +
                           '• `/embed` - Crea embed en ticket',
                    inline: false
                },
                {
                    name: '🔧 ADMIN (4 comandos)',
                    value: '• `/restart` - Reinicia el bot\n' +
                           '• `/staff-status` - Estadísticas del staff\n' +
                           '• `/mensaje-boton` - Añade botón a mensaje\n' +
                           '• `/sug-responder` - Aprobar/rechazar sugerencia',
                    inline: false
                },
                {
                    name: '📝 COMANDOS (5 comandos)',
                    value: '• `/comando-crear` - Crear comando personalizado\n' +
                           '• `/comando-editar` - Editar comando\n' +
                           '• `/comando-eliminar` - Eliminar comando\n' +
                           '• `/comandos` - Ver todos los comandos del bot\n' +
                           '• `/comando-lista` - Ver comandos personalizados',
                    inline: false
                },
                {
                    name: 'ℹ️ INFO (5 comandos)',
                    value: '• `/bot-info` - Información completa del bot\n' +
                           '• `/rol-id` - Info detallada de un rol\n' +
                           '• `/solicitar-bot` - Info de servicios de bot\n' +
                           '• `/enviar-info` - Envía info al canal configurado\n' +
                           '• `/donar` - Info de donaciones',
                    inline: false
                },
                {
                    name: '🛡️ MODERACIÓN (4 comandos)',
                    value: '• `/kick` - Expulsa usuario\n' +
                           '• `/ban` - Banea usuario\n' +
                           '• `/unban` - Desbanea usuario\n' +
                           '• `/clear` - Elimina mensajes (1-100)',
                    inline: false
                },
                {
                    name: '📱 SOCIAL (3 comandos)',
                    value: '• `/streamer-añadir` - Añade streamer\n' +
                           '• `/streamer-eliminar` - Elimina streamer\n' +
                           '• `/streamer-lista` - Lista streamers',
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
                    name: '💡 SUGERENCIAS (1 comando)',
                    value: '• `/sugerir` - Crear sugerencia\n' +
                           '_(Nota: Aprobación se hace con `/sug-responder` en ADMIN)_',
                    inline: false
                }
            )
            .setFooter({ text: 'Total: 33 comandos | Bot desarrollado por @egolatrada' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
