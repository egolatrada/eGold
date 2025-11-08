const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solicitar-bot')
        .setDescription('ℹ️ [INFO] Solicita los servicios de configuración y mantenimiento de Discord - Egolatrada'),
    
    async execute(interaction, context) {
        try {
            const user = interaction.user;

            const servicesEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🤖 Servicios de Configuración y Mantenimiento de Discord — Egolatrada')
                .setDescription(
                    'Gracias por confiar en nuestros servicios profesionales de configuración, optimización y mantenimiento integral de servidores de Discord.\n\n' +
                    'Cada paquete incluye **asistencia mensual 24/7**, donde **egolatrada estará presente configurando, ajustando y solucionando cualquier problema al gusto del creador del servidor**.\n\n' +
                    'Los servicios permanecerán activos **hasta la rescisión del acuerdo**.'
                )
                .addFields(
                    {
                        name: '📦 Paquetes Mensuales Disponibles',
                        value: '```' +
                            '┌─────────────────────────────────────┐\n' +
                            '│ 🥉 BÁSICO       — 40 € / mes       │\n' +
                            '│ 🥈 INTERMEDIO   — 70 € / mes       │\n' +
                            '│ 🥇 AVANZADO     — 110 € / mes      │\n' +
                            '│ 💎 PREMIUM      — 150 € / mes      │\n' +
                            '└─────────────────────────────────────┘' +
                            '```',
                        inline: false
                    },
                    {
                        name: '🥉 Paquete Básico (40 € / mes)',
                        value: '*Ideal para servidores nuevos o comunidades pequeñas.*\n\n' +
                            '• Sistema de tickets completo con logs básicos\n' +
                            '• Roles, permisos y canales configurados\n' +
                            '• Sistema de bienvenida y verificación inicial\n' +
                            '• Hasta **10 comandos personalizados**\n' +
                            '• Configuración limpia, estable y optimizada\n' +
                            '• Soporte técnico básico incluido',
                        inline: false
                    },
                    {
                        name: '🥈 Paquete Intermedio (70 € / mes)',
                        value: '*Perfecto para servidores en crecimiento.*\n\n' +
                            'Incluye todo lo del Básico, más:\n' +
                            '• Sistema de tickets avanzado con **13 categorías configurables**\n' +
                            '• Sistema de **verificación con captcha o botón**\n' +
                            '• Sistema de **sugerencias con votaciones y hilos automáticos**\n' +
                            '• Logs completos (mensajes, miembros, roles, canales y voz)\n' +
                            '• Moderación automática y anti-spam\n' +
                            '• Comandos personalizados **ilimitados**\n' +
                            '• **Actualizaciones mensuales y mejoras continuas**',
                        inline: false
                    },
                    {
                        name: '🥇 Paquete Avanzado (110 € / mes)',
                        value: '*Pensado para servidores grandes o comunidades con múltiples roles y departamentos.*\n\n' +
                            'Incluye todo lo del Intermedio, más:\n' +
                            '• **IA integrada** para respuestas automáticas (Q&A)\n' +
                            '• Sistema de **moderación con IA** (detección de contenido, NSFW, spam, etc.)\n' +
                            '• **Jerarquía de tickets automatizada** (Soporte → Moderador → Admin)\n' +
                            '• **Sistema de estadísticas de staff y usuarios activos**\n' +
                            '• **Sistema de inactividad y tickets permanentes**\n' +
                            '• **Voice Support** con canales de voz temporales para tickets\n' +
                            '• Panel de **Embeds anónimos y personalizables**\n' +
                            '• Revisión y mantenimiento del servidor cada semana',
                        inline: false
                    },
                    {
                        name: '💎 Paquete Premium (150 € / mes)',
                        value: '*El servicio más completo y personalizado.*\n\n' +
                            'Incluye todo lo del Avanzado, más:\n' +
                            '• **Sistemas a medida** según las necesidades del servidor\n' +
                            '• Integraciones con **APIs externas o bases de datos**\n' +
                            '• Sistema de **economía, niveles o puntos**\n' +
                            '• **Dashboard web opcional** para control completo del bot\n' +
                            '• Integración de redes sociales (Twitch, YouTube, Kick, etc.)\n' +
                            '• Mantenimiento, seguridad y optimización continua\n' +
                            '• **Soporte prioritario y atención inmediata 24/7**\n' +
                            '• Configuración visual y funcional personalizada 100%',
                        inline: false
                    },
                    {
                        name: '📞 Contacto y Pago',
                        value: '> **Discord:** @egolatrada\n' +
                            '> **Métodos de pago:** PayPal / Transferencia / Bizum / Revolut\n' +
                            '> **Configuración:** 2–5 días según paquete\n' +
                            '> **Servicio:** Mensualmente activo con soporte y atención directa',
                        inline: false
                    },
                    {
                        name: '📋 Información Adicional',
                        value: '• Todos los bots incluyen **configuración completa y documentación**\n' +
                            '• Deploy en **Replit** o **VPS** incluido\n' +
                            '• Personalización total de mensajes, embeds y comandos\n' +
                            '• **Actualizaciones y mantenimiento permanentes**\n' +
                            '• **@egolatrada** estará disponible en todo momento para ajustar, reparar o mejorar el servidor **24/7** mientras dure la suscripción',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'Egolatrada • Configuración y Mantenimiento Profesional de Discord', 
                    iconURL: interaction.guild.iconURL() 
                })
                .setTimestamp();

            try {
                await user.send({ embeds: [servicesEmbed] });
                
                await interaction.reply({
                    content: '✅ Te he enviado la información de los servicios por mensaje privado.',
                    ephemeral: true
                });

                logger.info(`🤖 ${user.tag} solicitó información de servicios de bot`);

            } catch (dmError) {
                await interaction.reply({
                    content: '❌ No pude enviarte un mensaje privado. Por favor, activa los mensajes directos de miembros del servidor y vuelve a intentarlo.\n\n' +
                        '**Contacto directo:** @egolatrada en Discord',
                    ephemeral: true
                });
            }

        } catch (error) {
            logger.error('Error al enviar información de servicios', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al procesar tu solicitud.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
