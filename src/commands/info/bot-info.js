const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../utils/logger');
const { version } = require('../../../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-info')
        .setDescription('ℹ️ [INFO] Muestra todas las funcionalidades, usos y comandos del bot'),
    
    async execute(interaction, context) {
        try {
            const client = interaction.client;
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);

            const mainEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🤖 eGold - Bot Todo-en-Uno')
                .setDescription('Bot completo de gestión para servidores de roleplay con 36 comandos y múltiples sistemas automatizados')
                .addFields(
                    { name: '📊 Versión', value: `\`${version}\``, inline: true },
                    { name: '⏰ Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
                    { name: '📡 Ping', value: `${client.ws.ping}ms`, inline: true },
                    { name: '👥 Servidores', value: `${client.guilds.cache.size}`, inline: true },
                    { name: '💬 Comandos', value: `36 comandos`, inline: true },
                    { name: '🔧 Node.js', value: process.version, inline: true }
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'Desarrollado por egolatrada para Strangers RP' })
                .setTimestamp();

            const ticketsEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('🎫 Sistema de Tickets (8 comandos)')
                .setDescription('Sistema completo de gestión con jerarquía, categorías y automatización')
                .addFields(
                    { 
                        name: '📋 Comandos Principales', 
                        value: '`/setup-panel` - Panel de tickets con menú desplegable\n' +
                            '`/ticket-crear` - Crear ticket para **usuario o rol**\n' +
                            '`/ticket-añadir` - Añadir **usuario o rol** (dropdown)\n' +
                            '`/ticket-eliminar` - Eliminar **usuario o rol** (dropdown)\n' +
                            '`/renombrar` - Renombrar con prioridades por color\n' +
                            '`/transcript` - Genera transcripción manual\n' +
                            '`/mantener-activo` - Evita cierre automático\n' +
                            '`/embed` - Crear embed personalizado en ticket',
                        inline: false 
                    },
                    {
                        name: '⚙️ Funcionalidades Avanzadas',
                        value: '• **Jerarquía 4 niveles**: Soporte → Moderador → Admin → Directiva\n' +
                            '• **Bloqueo entre mismo nivel**: Solo 1 miembro por nivel maneja el ticket\n' +
                            '• **Colaboración**: Menciona @compañero para desbloquearlo\n' +
                            '• **Escalación**: Menciona @rol superior para escalar\n' +
                            '• **Inactividad**: 6h staff, 7h usuario (con transcripción)\n' +
                            '• **Canales de voz temporales** (15 min, máx. 2 por ticket)\n' +
                            '• **Transcripciones automáticas** en HTML\n' +
                            '• **Prioridades con colores**: 🔴 URGENTE, 🟠 MEDIA, 🟡 BAJA, 🟢 SIN PRISA',
                        inline: false
                    }
                );

            const moderationEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🛡️ Moderación y Administración (9 comandos)')
                .setDescription('Herramientas completas de moderación automática y manual')
                .addFields(
                    {
                        name: '⚔️ Comandos de Moderación',
                        value: '`/kick` - Expulsar usuario del servidor\n' +
                            '`/ban` - Banear usuario (temporal o permanente)\n' +
                            '`/unban` - Desbanear usuario por ID\n' +
                            '`/clear` - Eliminar mensajes (1-100)',
                        inline: false
                    },
                    {
                        name: '🔧 Administración del Bot',
                        value: '`/restart` - Reiniciar el bot manualmente\n' +
                            '`/mensaje-boton` - Añadir botón a mensaje existente\n' +
                            '`/rol-id` - Obtener información detallada de rol\n' +
                            '`/panel-embed` - Crear embeds 100% anónimos\n' +
                            '`/add-ticket-menu` - Añadir menú de tickets a mensaje',
                        inline: false
                    },
                    {
                        name: '🤖 Moderación Automática con IA',
                        value: '• **Detección NSFW/Gore** con Google Gemini AI\n' +
                            '• **Verificación de enlaces** peligrosos (phishing/malware)\n' +
                            '• **Anti-spam**: Max 15 mensajes en 2 minutos\n' +
                            '• **Anti-duplicados**: Detecta mensajes repetidos\n' +
                            '• **Timeouts automáticos** + DM al infractor + alerta staff\n' +
                            '• **Sistema de advertencias** acumulativas',
                        inline: false
                    }
                );

            const systemsEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🔧 Sistemas Automatizados')
                .setDescription('Sistemas que funcionan 24/7 sin intervención manual')
                .addFields(
                    {
                        name: '📋 Logs Completos',
                        value: '• **Mensajes**: Eliminados, editados\n' +
                            '• **Canales**: Creados, eliminados, modificados\n' +
                            '• **Miembros**: Entradas, salidas, kicks, bans, nicknames, roles\n' +
                            '• **Voz**: Conexiones, desconexiones, movimientos\n' +
                            '• **Invitaciones**: Tracking completo de usos\n' +
                            '• **Comandos**: Registro de uso por staff',
                        inline: false
                    },
                    {
                        name: '✅ Verificación Automática',
                        value: '• **Rol inicial**: No Verificado (al unirse)\n' +
                            '• **Rol tras verificar**: Sin Whitelist\n' +
                            '• **Botón persistente** de verificación\n' +
                            '• **DM de bienvenida** automático',
                        inline: false
                    },
                    {
                        name: '📊 Estadísticas de Servidor',
                        value: '• **Tracking de actividad** del staff\n' +
                            '• **Contadores automáticos** de tickets\n' +
                            '• **Métricas de uso** de comandos\n' +
                            '• **Sistema de heartbeat** (salud del bot)',
                        inline: false
                    }
                );

            const tasksEmbed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('✅ Sistema de Tareas (3 comandos)')
                .setDescription('Gestión de tareas del servidor')
                .addFields(
                    {
                        name: '✅ Comandos de Tareas',
                        value: '`/tarea-crear` - Crear lista de tareas por categoría\n' +
                            '`/tarea-ver` - Ver todas las tareas organizadas\n' +
                            '`/tarea-borrar` - Eliminar todas las tareas\n' +
                            '**Funciones**: Organización automática, tracking de completadas',
                        inline: false
                    }
                );

            const commandsEmbed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('📝 Comandos y Sugerencias (7 comandos)')
                .setDescription('Sistemas de comandos personalizados y gestión de sugerencias')
                .addFields(
                    {
                        name: '⚡ Comandos Personalizados',
                        value: '`/crear-comando nuevo` - Crear comando con prefijo `!`\n' +
                            '`/crear-comando editar` - Editar comando existente\n' +
                            '`/crear-comando eliminar` - Eliminar comando\n' +
                            '`/crear-comando toggle` - Activar/desactivar\n' +
                            '`/comando-lista` - Ver comandos personalizados (admin)\n' +
                            '`/comandos` - Ver **TODOS** los comandos del bot\n' +
                            '**Uso**: `!ayuda`, `!reglas`, `!info` (trigger efímero)',
                        inline: false
                    },
                    {
                        name: '💡 Sistema de Sugerencias',
                        value: '`/sugerir` - Enviar nueva sugerencia\n' +
                            '`/sug-responder` - Aprobar/rechazar con razón opcional\n' +
                            '**Funciones**: Votación ✅/❌, hilos automáticos, tracking',
                        inline: false
                    }
                );

            const infoEmbed = new EmbedBuilder()
                .setColor('#E91E63')
                .setTitle('ℹ️ Información y Servicios (6 comandos)')
                .setDescription('Comandos de información y servicios del desarrollador')
                .addFields(
                    {
                        name: '📚 Comandos de Info',
                        value: '`/bot-info` - Este menú (toda la info del bot)\n' +
                            '`/staff-status` - Estadísticas de actividad del staff\n' +
                            '`/rol-id` - Info detallada de un rol\n' +
                            '`/solicitar-bot` - Info de servicios de desarrollo\n' +
                            '`/enviar-info` - Envía info al canal configurado\n' +
                            '`/donar` - Información de donaciones',
                        inline: false
                    },
                    {
                        name: '👨‍💻 Desarrollador',
                        value: '**egolatrada**\n' +
                            'Desarrollo de bots de Discord personalizados\n' +
                            'Discord: `egolatrada`\n' +
                            'Soporte: Abre ticket en el servidor',
                        inline: false
                    },
                    {
                        name: '💎 Características Técnicas',
                        value: '• **Código 100% modular** y escalable\n' +
                            '• **Base de datos PostgreSQL** persistente\n' +
                            '• **99.9% uptime** con watchdog y auto-restart\n' +
                            '• **Dual-environment**: Desarrollo + Producción\n' +
                            '• **Actualizaciones constantes** y soporte dedicado',
                        inline: false
                    }
                );

            const usosEmbed = new EmbedBuilder()
                .setColor('#00D9FF')
                .setTitle('💡 Usos Principales del Bot')
                .setDescription('Todos los casos de uso y aplicaciones del bot en tu servidor')
                .addFields(
                    {
                        name: '🎫 Gestión de Soporte',
                        value: '• Tickets organizados por categorías\n' +
                            '• Jerarquía de staff para derivar casos\n' +
                            '• Transcripciones para historial\n' +
                            '• Soporte por voz cuando sea necesario',
                        inline: false
                    },
                    {
                        name: '🛡️ Moderación Integral',
                        value: '• Moderación automática con IA 24/7\n' +
                            '• Comandos manuales para casos especiales\n' +
                            '• Logs completos de todo el servidor\n' +
                            '• Sistema anti-spam y anti-duplicados',
                        inline: false
                    },
                    {
                        name: '📢 Comunicación',
                        value: '• Comandos personalizados para respuestas rápidas\n' +
                            '• Sistema de sugerencias con votación\n' +
                            '• Embeds anónimos para anuncios\n' +
                            '• Botones interactivos para navegación',
                        inline: false
                    },
                    {
                        name: '📊 Gestión y Organización',
                        value: '• Sistema de tareas por categorías\n' +
                            '• Tracking de invitaciones\n' +
                            '• Estadísticas de staff\n' +
                            '• Sistema de advertencias y warnings',
                        inline: false
                    },
                    {
                        name: '👥 Gestión de Comunidad',
                        value: '• Verificación automática de nuevos miembros\n' +
                            '• Sistema de bienvenida personalizado\n' +
                            '• Sistema de roles y permisos avanzado\n' +
                            '• Comandos personalizados con prefijo !',
                        inline: false
                    }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('📞 Solicitar Bot Personalizado')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('solicitar_servicios')
            );

            await interaction.reply({
                embeds: [mainEmbed, ticketsEmbed, moderationEmbed, systemsEmbed, tasksEmbed, commandsEmbed, infoEmbed, usosEmbed],
                components: [row],
                ephemeral: false
            });

            logger.info(`📚 ${interaction.user.tag} consultó la información completa del bot`);

        } catch (error) {
            logger.error('Error al mostrar información del bot', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al mostrar la información del bot.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
