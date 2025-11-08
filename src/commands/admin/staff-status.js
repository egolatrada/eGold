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
                    { name: 'Últimas 6 Horas', value: '6h' },
                    { name: 'Últimas 12 Horas', value: '12h' },
                    { name: 'Últimas 24 Horas', value: '24h' },
                    { name: 'Últimos 3 Días', value: '3d' },
                    { name: 'Última Semana', value: '7d' },
                    { name: 'Últimas 2 Semanas', value: '14d' },
                    { name: 'Último Mes', value: '30d' }
                )
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('rol')
                .setDescription('Filtrar por rol específico')
                .addChoices(
                    { name: 'Todos', value: 'todos' },
                    { name: 'Directiva', value: 'directiva' },
                    { name: 'Administrador', value: 'admin' },
                    { name: 'Moderador', value: 'mod' },
                    { name: 'Soporte', value: 'soporte' }
                )
                .setRequired(false)
        )
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Ver estadísticas de un usuario específico')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('top')
                .setDescription('Número de usuarios a mostrar en el ranking')
                .addChoices(
                    { name: 'Top 1', value: 1 },
                    { name: 'Top 3', value: 3 },
                    { name: 'Top 5', value: 5 },
                    { name: 'Top 10', value: 10 }
                )
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName('inactivos')
                .setDescription('Mostrar usuarios menos activos en lugar de más activos')
                .setRequired(false)
        ),
    
    async execute(interaction, context) {
        try {
            const period = interaction.options.getString('periodo') || '24h';
            const roleFilter = interaction.options.getString('rol') || 'todos';
            const targetUser = interaction.options.getUser('usuario');
            const topLimit = interaction.options.getInteger('top') || 10;
            const showInactive = interaction.options.getBoolean('inactivos') || false;
            const guild = interaction.guild;

            await interaction.deferReply({ ephemeral: false });

            const periodMs = {
                '1h': 60 * 60 * 1000,
                '6h': 6 * 60 * 60 * 1000,
                '12h': 12 * 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '3d': 3 * 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '14d': 14 * 24 * 60 * 60 * 1000,
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

            // Recopilar miembros del staff según filtro de rol
            for (const [roleName, roleId] of Object.entries(staffRoles)) {
                // Si hay filtro de rol y no coincide, saltar
                if (roleFilter !== 'todos' && roleFilter !== roleName) continue;

                const role = guild.roles.cache.get(roleId);
                if (!role) continue;

                for (const member of role.members.values()) {
                    // Si hay filtro de usuario y no coincide, saltar
                    if (targetUser && member.id !== targetUser.id) continue;

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

            // SOLO contar actividad en canales de tickets (todas las categorías)
            const ticketCategories = Object.values(config.tickets.categories).map(cat => cat.categoryId);
            const ticketChannels = guild.channels.cache.filter(ch => {
                // Verificar si el canal está en alguna categoría de tickets
                return ticketCategories.includes(ch.parentId) || 
                       ch.name.startsWith('ticket-') || 
                       ch.name.includes('┃');
            });

            for (const channel of ticketChannels.values()) {
                try {
                    // Solo procesar canales de texto (ignorar categorías y canales de voz)
                    if (!channel.isTextBased()) continue;
                    
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

            // Ordenar según si se quieren activos o inactivos
            const sortedStaff = Array.from(staffActivity.values());
            
            if (showInactive) {
                // Ordenar de menos a más activos
                sortedStaff.sort((a, b) => (a.messages + a.ticketsHelped * 5) - (b.messages + b.ticketsHelped * 5));
            } else {
                // Ordenar de más a menos activos (default)
                sortedStaff.sort((a, b) => (b.messages + b.ticketsHelped * 5) - (a.messages + a.ticketsHelped * 5));
            }

            const periodNames = {
                '1h': 'Última Hora',
                '6h': 'Últimas 6 Horas',
                '12h': 'Últimas 12 Horas',
                '24h': 'Últimas 24 Horas',
                '3d': 'Últimos 3 Días',
                '7d': 'Última Semana',
                '14d': 'Últimas 2 Semanas',
                '30d': 'Último Mes'
            };

            const roleNames = {
                directiva: 'Directiva',
                admin: 'Administrador',
                mod: 'Moderador',
                soporte: 'Soporte',
                todos: 'Todos los roles'
            };

            const roleEmojis = {
                directiva: '👑',
                admin: '🔰',
                mod: '🛡️',
                soporte: '💬'
            };

            let title = `📊 Estadísticas de Staff - ${periodNames[period]}`;
            let description = showInactive ? 
                `Top ${topLimit} miembros del staff menos activos` : 
                `Top ${topLimit} miembros del staff más activos`;

            if (targetUser) {
                title = `📊 Estadísticas de ${targetUser.username}`;
                description = `Período: ${periodNames[period]}`;
            } else if (roleFilter !== 'todos') {
                description += ` (${roleNames[roleFilter]})`;
            }

            const embed = new EmbedBuilder()
                .setColor(showInactive ? '#ED4245' : '#57F287')
                .setTitle(title)
                .setDescription(description)
                .setTimestamp();

            if (sortedStaff.length === 0) {
                embed.setDescription('No hay actividad de staff en este período.');
            } else if (targetUser) {
                // Mostrar estadísticas del usuario específico
                const userActivity = sortedStaff.find(a => a.member.id === targetUser.id);
                if (userActivity) {
                    const emoji = roleEmojis[userActivity.role] || '👤';
                    embed.addFields(
                        { name: '👤 Usuario', value: `${emoji} ${targetUser}`, inline: true },
                        { name: '🎖️ Rol Principal', value: roleNames[userActivity.role], inline: true },
                        { name: '💬 Mensajes', value: `${userActivity.messages}`, inline: true },
                        { name: '🎫 Tickets Atendidos', value: `${userActivity.ticketsHelped}`, inline: true },
                        { name: '📊 Puntuación', value: `${userActivity.messages + userActivity.ticketsHelped * 5}`, inline: true }
                    );
                } else {
                    embed.setDescription(`${targetUser} no tiene actividad en este período.`);
                }
            } else {
                const topStaff = sortedStaff.slice(0, topLimit);
                let ranking = '';
                
                topStaff.forEach((activity, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    const emoji = roleEmojis[activity.role] || '👤';
                    const roleName = roleNames[activity.role];
                    
                    ranking += `${medal} ${emoji} **${activity.member.user.username}** (${roleName})\n`;
                    ranking += `   └ 💬 ${activity.messages} mensajes | 🎫 ${activity.ticketsHelped} tickets\n\n`;
                });

                embed.addFields({ name: '🏆 Ranking', value: ranking || 'Sin datos', inline: false });

                const totalMessages = sortedStaff.reduce((sum, a) => sum + a.messages, 0);
                const totalTickets = sortedStaff.reduce((sum, a) => sum + a.ticketsHelped, 0);
                const activeStaff = sortedStaff.filter(a => a.messages > 0 || a.ticketsHelped > 0).length;

                embed.addFields(
                    { name: '📈 Estadísticas Generales', value: ' ', inline: false },
                    { name: '👥 Staff Activo', value: `${activeStaff}`, inline: true },
                    { name: '💬 Total Mensajes', value: `${totalMessages}`, inline: true },
                    { name: '🎫 Total Tickets', value: `${totalTickets}`, inline: true }
                );
            }

            embed.setFooter({ text: `Solicitado por ${interaction.user.tag} | Solo actividad en tickets` });

            await interaction.editReply({ embeds: [embed] });

            logger.info(`📊 ${interaction.user.tag} consultó estadísticas de staff (${period}, ${roleFilter}, top ${topLimit})`);

        } catch (error) {
            logger.error('Error al generar estadísticas de staff', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al generar las estadísticas.'
            }).catch(() => {});
        }
    }
};
