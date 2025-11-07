const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../utils/logger');
const { version } = require('../../../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-info')
        .setDescription('📚 Muestra toda la información y comandos del bot'),
    
    async execute(interaction, context) {
        try {
            const client = interaction.client;
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);

            const mainEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🤖 eGold - Bot de Discord')
                .setDescription('Bot todo-en-uno para gestión completa de servidores de roleplay')
                .addFields(
                    { name: '📊 Versión', value: `\`${version}\``, inline: true },
                    { name: '⏰ Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
                    { name: '📡 Ping', value: `${client.ws.ping}ms`, inline: true },
                    { name: '👥 Servidores', value: `${client.guilds.cache.size}`, inline: true },
                    { name: '💬 Comandos', value: `${context.commands.size}`, inline: true },
                    { name: '🔧 Node.js', value: process.version, inline: true }
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'Desarrollado por egolatrada' })
                .setTimestamp();

            const ticketsEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('🎫 Sistema de Tickets')
                .setDescription('Sistema completo de gestión de tickets con jerarquía y categorías')
                .addFields(
                    { 
                        name: '📋 Comandos de Tickets', 
                        value: '`/setup-panel` - Crear panel de tickets\n' +
                            '`/crear-ticket` - Crear ticket para un usuario\n' +
                            '`/añadir-usuario` - Añadir usuario a ticket\n' +
                            '`/añadir-rol` - Añadir rol a ticket\n' +
                            '`/eliminar-usuario` - Remover usuario de ticket\n' +
                            '`/eliminar-rol` - Remover rol de ticket\n' +
                            '`/renombrar` - Renombrar ticket con prioridad\n' +
                            '`/mantener-activo` - Evitar cierre automático\n' +
                            '`/add-ticket-menu` - Añadir menú a mensaje',
                        inline: false 
                    },
                    {
                        name: '⚙️ Funcionalidades',
                        value: '• 14 categorías personalizables\n' +
                            '• Sistema jerárquico (Soporte → Moderador → Admin)\n' +
                            '• Inactividad automática (6h staff, 7h usuario)\n' +
                            '• Canales de voz temporales\n' +
                            '• Transcripciones automáticas\n' +
                            '• Sistema de prioridades con colores',
                        inline: false
                    }
                );

            const moderationEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🛡️ Moderación y Administración')
                .setDescription('Herramientas completas de moderación y gestión')
                .addFields(
                    {
                        name: '⚔️ Comandos de Moderación',
                        value: '`/kick` - Expulsar usuario\n' +
                            '`/ban` - Banear usuario\n' +
                            '`/unban` - Desbanear usuario\n' +
                            '`/clear` - Eliminar mensajes (1-100)',
                        inline: false
                    },
                    {
                        name: '🔧 Comandos de Administración',
                        value: '`/restart` - Reiniciar el bot\n' +
                            '`/status` - Estado del sistema\n' +
                            '`/rol-id` - Obtener ID de rol',
                        inline: false
                    },
                    {
                        name: '🤖 Moderación Automática',
                        value: '• Detección de contenido NSFW con IA\n' +
                            '• Verificación de enlaces peligrosos\n' +
                            '• Anti-spam y anti-duplicados\n' +
                            '• Timeouts automáticos',
                        inline: false
                    }
                );

            const suggestionsEmbed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('💡 Sistema de Sugerencias')
                .setDescription('Sistema completo de votación y discusión de sugerencias')
                .addFields(
                    {
                        name: '📋 Comandos de Sugerencias',
                        value: '`/sugerir` - Enviar nueva sugerencia\n' +
                            '`/sug-aprobada` - Aprobar sugerencia (Admin)\n' +
                            '`/sug-rechazada` - Rechazar sugerencia (Admin)',
                        inline: false
                    },
                    {
                        name: '⚙️ Funcionalidades',
                        value: '• Votación con ✅ y ❌\n' +
                            '• Hilos de discusión automáticos\n' +
                            '• Sistema de aprobación/rechazo\n' +
                            '• Tracking de votos en tiempo real',
                        inline: false
                    }
                );

            const utilityEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🔧 Utilidades y Extras')
                .setDescription('Herramientas adicionales y sistemas especiales')
                .addFields(
                    {
                        name: '📝 Comandos Personalizados',
                        value: '`/crear-comando` - Gestionar comandos personalizados\n' +
                            '`/comandos` - Ver lista de comandos\n' +
                            '`!comando` - Ejecutar comando personalizado',
                        inline: false
                    },
                    {
                        name: '📱 Redes Sociales',
                        value: '`/social-link` - Gestionar vinculaciones\n' +
                            'Soporte: Twitch, YouTube, Instagram, TikTok, etc.',
                        inline: false
                    },
                    {
                        name: '💼 Servicios',
                        value: '`/solicitar-bot` - Información de servicios\n' +
                            '`/donar` - Información de donaciones\n' +
                            '`/panel-embed` - Crear embeds personalizados',
                        inline: false
                    },
                    {
                        name: '📊 Sistemas Adicionales',
                        value: '• Sistema de verificación automático\n' +
                            '• Logs completos (mensajes, voz, roles, etc.)\n' +
                            '• Tracking de invitaciones\n' +
                            '• Sistema de heartbeat\n' +
                            '• Auto-restart y watchdog',
                        inline: false
                    }
                );

            const infoEmbed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('ℹ️ Información Adicional')
                .setDescription('Detalles técnicos y de desarrollo')
                .addFields(
                    {
                        name: '👨‍💻 Desarrollador',
                        value: '**egolatrada**\nDesarrollo de bots de Discord personalizados',
                        inline: false
                    },
                    {
                        name: '🔗 Enlaces',
                        value: '• Discord: `egolatrada`\n' +
                            '• Servicios: `/solicitar-bot`\n' +
                            '• Soporte: Ticket en el servidor',
                        inline: false
                    },
                    {
                        name: '📝 Última Actualización',
                        value: new Date().toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                        }),
                        inline: false
                    },
                    {
                        name: '💎 Características Premium',
                        value: '• Código 100% modular y escalable\n' +
                            '• Base de datos PostgreSQL\n' +
                            '• Sistema de persistencia completo\n' +
                            '• Uptime 99.9% garantizado\n' +
                            '• Soporte y actualizaciones constantes',
                        inline: false
                    }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('📞 Solicitar Servicios')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/users/1234567890'),
                new ButtonBuilder()
                    .setLabel('💖 Donar')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://paypal.me/ejemplo')
            );

            await interaction.reply({
                embeds: [mainEmbed, ticketsEmbed, moderationEmbed, suggestionsEmbed, utilityEmbed, infoEmbed],
                components: [row],
                ephemeral: false
            });

            logger.info(`📚 ${interaction.user.tag} consultó la información del bot`);

        } catch (error) {
            logger.error('Error al mostrar información del bot', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al mostrar la información del bot.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
