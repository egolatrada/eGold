const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const { config } = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff-status')
        .setDescription('📊 Muestra estadísticas de actividad del staff')
        .addStringOption(option =>
            option
                .setName('periodo')
                .setDescription('Período de tiempo a analizar')
                .addChoices(
                    { name: 'Última Hora', value: '1h' },
                    { name: 'Últimas 24 Horas', value: '24h' },
                    { name: 'Última Semana', value: '7d' },
                    { name: 'Último Mes', value: '30d' }
                )
                .setRequired(false)
        ),
    
    async execute(interaction, context) {
        try {
            const period = interaction.options.getString('periodo') || '24h';
            const guild = interaction.guild;

            await interaction.deferReply({ ephemeral: false });

            const periodMs = {
                '1h': 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000
            };

            const timeLimit = Date.now() - periodMs[period];

            const staffRoles = {
                directiva: '1435808275739181110',
                admin: '1425955470236975186',
                mod: '1425955473240363082',
                soporte: '1425955479737077760'
            };

            const staffActivity = new Map();

            for (const [roleName, roleId] of Object.entries(staffRoles)) {
                const role = guild.roles.cache.get(roleId);
                if (!role) continue;

                for (const member of role.members.values()) {
                    if (!staffActivity.has(member.id)) {
                        staffActivity.set(member.id, {
                            member: member,
                            role: roleName,
                            messages: 0,
                            ticketsHelped: 0,
                            commands: 0
                        });
                    }
                }
            }

            const ticketChannels = guild.channels.cache.filter(
                ch => ch.name.startsWith('ticket-') || ch.name.includes('ticket-')
            );

            for (const channel of ticketChannels.values()) {
                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    const recentMessages = messages.filter(m => m.createdTimestamp > timeLimit);

                    for (const msg of recentMessages.values()) {
                        if (staffActivity.has(msg.author.id)) {
                            const activity = staffActivity.get(msg.author.id);
                            activity.messages++;
                            if (!activity.ticketsActive) {
                                activity.ticketsActive = new Set();
                            }
                            activity.ticketsActive.add(channel.id);
                        }
                    }
                } catch (err) {
                    // Canal inaccesible, continuar
                }
            }

            for (const activity of staffActivity.values()) {
                if (activity.ticketsActive) {
                    activity.ticketsHelped = activity.ticketsActive.size;
                    delete activity.ticketsActive;
                }
            }

            const sortedStaff = Array.from(staffActivity.values())
                .filter(a => a.messages > 0 || a.ticketsHelped > 0)
                .sort((a, b) => (b.messages + b.ticketsHelped * 5) - (a.messages + a.ticketsHelped * 5));

            const periodNames = {
                '1h': 'Última Hora',
                '24h': 'Últimas 24 Horas',
                '7d': 'Última Semana',
                '30d': 'Último Mes'
            };

            const roleEmojis = {
                directiva: '👑',
                admin: '🔰',
                mod: '🛡️',
                soporte: '💬'
            };

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle(`📊 Estadísticas de Staff - ${periodNames[period]}`)
                .setDescription(`Top 10 miembros del staff más activos`)
                .setTimestamp();

            if (sortedStaff.length === 0) {
                embed.setDescription('No hay actividad de staff en este período.');
            } else {
                const top10 = sortedStaff.slice(0, 10);
                let ranking = '';
                
                top10.forEach((activity, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    const emoji = roleEmojis[activity.role] || '👤';
                    
                    ranking += `${medal} ${emoji} **${activity.member.user.username}**\n`;
                    ranking += `   └ 💬 ${activity.messages} mensajes | 🎫 ${activity.ticketsHelped} tickets\n\n`;
                });

                embed.addFields({ name: '🏆 Ranking', value: ranking || 'Sin datos', inline: false });

                const totalMessages = sortedStaff.reduce((sum, a) => sum + a.messages, 0);
                const totalTickets = sortedStaff.reduce((sum, a) => sum + a.ticketsHelped, 0);
                const activeStaff = sortedStaff.length;

                embed.addFields(
                    { name: '📈 Estadísticas Generales', value: ' ', inline: false },
                    { name: '👥 Staff Activo', value: `${activeStaff}`, inline: true },
                    { name: '💬 Total Mensajes', value: `${totalMessages}`, inline: true },
                    { name: '🎫 Total Tickets', value: `${totalTickets}`, inline: true }
                );
            }

            embed.setFooter({ text: `Solicitado por ${interaction.user.tag}` });

            await interaction.editReply({ embeds: [embed] });

            logger.info(`📊 ${interaction.user.tag} consultó estadísticas de staff (${period})`);

        } catch (error) {
            logger.error('Error al generar estadísticas de staff', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al generar las estadísticas.'
            }).catch(() => {});
        }
    }
};
