const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const { config } = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff-status')
        .setDescription('🔧 [ADMIN] Muestra estadísticas de actividad del staff')
        .addStringOption(option =>
            option
                .setName('unidad')
                .setDescription('Unidad de tiempo')
                .addChoices(
                    { name: 'Horas', value: 'horas' },
                    { name: 'Días', value: 'días' },
                    { name: 'Semanas', value: 'semanas' },
                    { name: 'Meses', value: 'meses' }
                )
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('cantidad')
                .setDescription('Cantidad de tiempo (ejemplo: 24 horas, 7 días)')
                .setMinValue(1)
                .setMaxValue(90)
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
            const unidad = interaction.options.getString('unidad') || 'horas';
            
            // Valores por defecto dinámicos según la unidad elegida
            const defaultCantidad = {
                'horas': 24,
                'días': 7,
                'semanas': 1,
                'meses': 1
            };
            
            const cantidad = interaction.options.getInteger('cantidad') || defaultCantidad[unidad] || 24;
            const roleFilter = interaction.options.getString('rol') || 'todos';
            const targetUser = interaction.options.getUser('usuario');
            const topLimit = interaction.options.getInteger('top') || 10;
            const showInactive = interaction.options.getBoolean('inactivos') || false;
            const guild = interaction.guild;

            await interaction.deferReply({ ephemeral: false });

            // Calcular período en milisegundos dinámicamente
            const unidadMs = {
                'horas': 60 * 60 * 1000,
                'días': 24 * 60 * 60 * 1000,
                'semanas': 7 * 24 * 60 * 60 * 1000,
                'meses': 30 * 24 * 60 * 60 * 1000
            };

            // Validar que la unidad sea válida
            if (!unidadMs[unidad]) {
                return await interaction.editReply({
                    content: '❌ Unidad de tiempo no válida. Usa: horas, días, semanas o meses.',
                    ephemeral: true
                });
            }

            const periodMs = unidadMs[unidad] * cantidad;
            
            // Validar rango mínimo (1 hora) y máximo (90 días)
            const MIN_PERIOD = 60 * 60 * 1000; // 1 hora
            const MAX_PERIOD = 90 * 24 * 60 * 60 * 1000; // 90 días
            
            if (periodMs < MIN_PERIOD || periodMs > MAX_PERIOD) {
                return await interaction.editReply({
                    content: '❌ El período debe estar entre 1 hora y 90 días.',
                    ephemeral: true
                });
            }

            const timeLimit = Date.now() - periodMs;

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

            // Contar actividad en canales de tickets con paginación
            for (const channel of ticketChannels.values()) {
                try {
                    // Solo procesar canales de texto (ignorar categorías y canales de voz)
                    if (!channel.isTextBased()) continue;
                    
                    let allMessages = [];
                    let lastMessageId = null;
                    let fetchedCount = 0;
                    const maxMessages = 500; // Máximo de mensajes a procesar por canal
                    
                    // Fetch con paginación para obtener más mensajes
                    while (fetchedCount < maxMessages) {
                        const options = { limit: 100 };
                        if (lastMessageId) {
                            options.before = lastMessageId;
                        }
                        
                        const messages = await channel.messages.fetch(options);
                        if (messages.size === 0) break;
                        
                        // Filtrar mensajes recientes
                        const recentMessages = messages.filter(m => m.createdTimestamp > timeLimit);
                        if (recentMessages.size === 0) break; // Ya no hay mensajes recientes
                        
                        allMessages.push(...recentMessages.values());
                        fetchedCount += messages.size;
                        lastMessageId = messages.last().id;
                        
                        // Si no trajimos todos los mensajes solicitados, ya terminamos
                        if (messages.size < 100) break;
                    }

                    // Contar mensajes por usuario
                    for (const msg of allMessages) {
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
                    logger.error(`Error al procesar canal ${channel.name}:`, err.message);
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

            // Generar nombre del período dinámicamente con pluralización correcta
            let periodName;
            if (cantidad === 1) {
                // Singular: "Última hora", "Último día", "Última semana", "Último mes"
                const singularMap = {
                    'horas': 'Última hora',
                    'días': 'Último día',
                    'semanas': 'Última semana',
                    'meses': 'Último mes'
                };
                periodName = singularMap[unidad];
            } else {
                // Plural: "Últimas X horas", "Últimos X días", "Últimas X semanas", "Últimos X meses"
                const genero = (unidad === 'horas' || unidad === 'semanas') ? 'Últimas' : 'Últimos';
                periodName = `${genero} ${cantidad} ${unidad}`;
            }

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

            let title = `📊 Estadísticas de Staff - ${periodName}`;
            let description = showInactive ? 
                `Top ${topLimit} miembros del staff menos activos` : 
                `Top ${topLimit} miembros del staff más activos`;

            if (targetUser) {
                title = `📊 Estadísticas de ${targetUser.username}`;
                description = `Período: ${periodName}`;
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

            logger.info(`📊 ${interaction.user.tag} consultó estadísticas de staff (${periodName}, ${roleFilter}, top ${topLimit})`);

        } catch (error) {
            logger.error('Error al generar estadísticas de staff', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al generar las estadísticas.'
            }).catch(() => {});
        }
    }
};
