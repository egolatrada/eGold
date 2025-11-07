const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enviar-info')
        .setDescription('📋 Envía información completa del bot al canal configurado')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, context) {
        try {
            const INFO_CHANNEL_ID = '1435847630176653312';
            const infoChannel = await interaction.guild.channels.fetch(INFO_CHANNEL_ID);

            if (!infoChannel || !infoChannel.isTextBased()) {
                return await interaction.reply({
                    content: '❌ No se pudo encontrar el canal de información.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Embed 1: Funcionalidades de Ego Bot
            const embed1 = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📚 Funcionalidades de Ego Bot')
                .setDescription('**Sistema completo de gestión para Strangers RP**\n\nA continuación encontrarás todas las funcionalidades disponibles.')
                .addFields(
                    {
                        name: '🎫 Sistema de Tickets',
                        value: '• 13 categorías configurables\n• Transcripciones automáticas en HTML\n• Soporte de voz temporal (15 min)\n• Límite de 2 canales de voz por ticket\n• Botones: 🔰 Subir a Soporte | 🔒 Cerrar Ticket',
                        inline: false
                    },
                    {
                        name: '📊 Sistema de Logs Completo',
                        value: '• **Entradas:** Nuevos miembros, cambios de nickname\n• **Salidas:** Miembros que se van, expulsiones\n• **Mensajes:** Eliminados y editados\n• **Canales:** Creación, eliminación, modificación\n• **Roles:** Añadidos y removidos\n• **Voz:** Conexiones y desconexiones\n• **Comandos:** Registro de uso\n• **Invitaciones:** Rastreo completo',
                        inline: false
                    }
                )
                .setTimestamp();

            // Embed 2: Moderación y Seguridad
            const embed2 = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🛡️ Moderación y Seguridad')
                .addFields(
                    {
                        name: '🤖 Moderación con IA',
                        value: '• Detección de contenido NSFW/gore\n• Análisis de enlaces maliciosos\n• Timeout automático (10 min)\n• Notificaciones al staff\n• Logs detallados de acciones',
                        inline: true
                    },
                    {
                        name: '🚫 Anti-Spam',
                        value: '• Máx. 15 mensajes en 2 minutos\n• Detección de duplicados\n• Timeout de 2 minutos fijo\n• Elimina mensajes del usuario\n• DM automático + notificación staff',
                        inline: true
                    },
                    {
                        name: '🔇 Anti-Profanidad',
                        value: '• Filtro de palabras ofensivas\n• Contador de infracciones\n• Timeout tras 10 insultos\n• Duración: 15 minutos\n• Advertencias automáticas',
                        inline: true
                    }
                )
                .setTimestamp();

            // Embed 3: Sistemas de Usuario
            const embed3 = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('👥 Sistemas de Usuario')
                .addFields(
                    {
                        name: '✅ Sistema de Verificación',
                        value: '• Asignación automática de roles\n• Rol inicial: No Verificado\n• Rol tras verificar: Sin Whitelist\n• Botón de verificación persistente',
                        inline: false
                    },
                    {
                        name: '📱 Vinculación de Redes Sociales',
                        value: '• Plataformas: Twitch, Kick, YouTube, Instagram, Twitter\n• Comandos: `/social-link add/remove/list/check`\n• Menciones automáticas en canal configurado\n• Gestión completa de vínculos',
                        inline: false
                    },
                    {
                        name: '🔗 Sistema de Invitaciones',
                        value: '• Rastreo completo de invitaciones\n• Logs detallados: quién invitó a quién\n• Caché de invitaciones persistente\n• DM de bienvenida al usuario',
                        inline: false
                    }
                )
                .setTimestamp();

            // Embed 4: Herramientas y Utilidades
            const embed4 = new EmbedBuilder()
                .setColor('#FFC107')
                .setTitle('🛠️ Herramientas y Utilidades')
                .addFields(
                    {
                        name: '🤖 Q&A con IA',
                        value: '• Respuestas basadas en info del servidor\n• Crea threads automáticos\n• Usa GPT-4o-mini\n• Auto-archivo tras 60 min',
                        inline: true
                    },
                    {
                        name: '📝 Panel de Embeds',
                        value: '• 100% privado y anónimo\n• Selector de roles (hasta 10)\n• Personalización completa\n• Sin rastros de quién lo creó',
                        inline: true
                    },
                    {
                        name: '⚡ Comandos Personalizados',
                        value: '• Respuestas rápidas con `!comando`\n• Embeds con imágenes\n• Trigger efímero (se borra)\n• Gestión completa: crear/editar/eliminar',
                        inline: true
                    }
                )
                .setTimestamp();

            // Embed 5: Comandos de Moderación
            const embed5 = new EmbedBuilder()
                .setColor('#9C27B0')
                .setTitle('⚙️ Comandos de Moderación')
                .addFields(
                    {
                        name: '👮 Comandos Disponibles',
                        value: '• `/kick` - Expulsar usuario\n• `/ban` - Banear (temporal o permanente)\n• `/unban` - Desbanear usuario\n• `/clear` - Eliminar mensajes (1-100)\n• `/status` - Estado del bot (público, anónimo)\n• `/restart` - Reiniciar bot',
                        inline: false
                    },
                    {
                        name: '📊 Sistema de Uptime 24/7',
                        value: '• Watchdog con health checks cada 60s\n• Auto-restart en caso de fallo\n• Máx. 5 reinicios por hora\n• Cooldown de 12 minutos\n• Logs de errores y métricas',
                        inline: false
                    }
                )
                .setTimestamp();

            // Embed 6: Lista completa de comandos
            const embed6 = new EmbedBuilder()
                .setColor('#00D9FF')
                .setTitle('📋 Lista Completa de Comandos')
                .setDescription('Todos los comandos disponibles en el bot')
                .addFields(
                    {
                        name: '🎫 Gestión de Tickets',
                        value: '• `/setup-panel` - Crea el panel inicial de tickets con menú desplegable\n• `/add-ticket-menu` - Añade menú de tickets a un mensaje existente',
                        inline: false
                    },
                    {
                        name: '📝 Embeds y Mensajes',
                        value: '• `/panel-embed` - Panel privado para crear embeds anónimos con selector de roles\n• `/enviar-info` - Envía información completa del bot al canal configurado',
                        inline: false
                    },
                    {
                        name: '👮 Moderación',
                        value: '• `/kick` - Expulsa a un usuario del servidor\n• `/ban` - Banea usuario (temporal o permanente)\n• `/unban` - Desbanea a un usuario por ID\n• `/clear` - Elimina mensajes del canal (1-100)',
                        inline: false
                    },
                    {
                        name: '⚙️ Administración',
                        value: '• `/restart` - Reinicia el bot (solo admins)\n• `/status` - Muestra estado del bot (público y anónimo)',
                        inline: false
                    },
                    {
                        name: '📱 Redes Sociales',
                        value: '• `/social-link` - Gestiona vinculaciones de redes sociales (add/remove/list/check)',
                        inline: false
                    },
                    {
                        name: '⚡ Comandos Personalizados',
                        value: '• `/crear-comando` - Gestiona comandos personalizados (nuevo/editar/eliminar/listar)\n• `/comandos` - Muestra lista de comandos personalizados disponibles',
                        inline: false
                    },
                    {
                        name: '💰 Otros',
                        value: '• `/donar` - Información sobre donaciones al proyecto',
                        inline: false
                    }
                )
                .setFooter({ text: 'Bot desarrollado por @egolatrada para Strangers RP' })
                .setTimestamp();

            // Enviar todos los embeds al canal
            await infoChannel.send({ embeds: [embed1] });
            await infoChannel.send({ embeds: [embed2] });
            await infoChannel.send({ embeds: [embed3] });
            await infoChannel.send({ embeds: [embed4] });
            await infoChannel.send({ embeds: [embed5] });
            await infoChannel.send({ embeds: [embed6] });

            await interaction.reply({
                content: `✅ Información del bot enviada correctamente a ${infoChannel}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error al enviar información:', error);
            await interaction.reply({
                content: '❌ Error al enviar la información del bot.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
