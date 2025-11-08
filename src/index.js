// Ego Bot - Discord Bot para Strangers RP
// Autor: @egolatrada
// Versión modular optimizada

// Cargar variables de entorno
require('dotenv').config();

const { createClient } = require('./client');
const { config, messages, validateConfig } = require('./config');
const { registerCommands } = require('./handlers/command-loader');
const logger = require('./utils/logger');

// Sistemas
const TicketsSystem = require('./systems/tickets');
const TicketHierarchy = require('./systems/ticket-hierarchy');
const TicketInactivity = require('./systems/ticket-inactivity');
const HealthSystem = require('./systems/health');
// const AISystem = require('./systems/ai'); // DESHABILITADO - No se usa en producción
const LogsSystem = require('./systems/logs-system');
const InvitesSystem = require('./systems/invites-system');
const ModerationSystem = require('./systems/moderation-system');
const VerificationSystem = require('./systems/verification-system');
const SocialLinksSystem = require('./systems/social-links-system');
const StreamMonitorSystem = require('./systems/stream-monitor-system');
const SocialMediaMonitorSystem = require('./systems/social-media-monitor-system');
const CustomCommandsSystem = require('./systems/custom-commands-system');
const SuggestionsSystem = require('./systems/suggestions-system');
const ChangelogSystem = require('./systems/changelog-system');
const ServerStatsSystem = require('./systems/server-stats');
const TasksSystem = require('./systems/tasks/simple-tasks-system');
const WarnsSystem = require('./systems/warns/warns-system');
const WelcomeSystem = require('./systems/welcome/welcome-system');

// Handlers de eventos
const { setupEventHandlers } = require('./handlers/events');

// Inicializar cliente
const client = createClient();

// Sistemas globales
let ticketsSystem;
let ticketHierarchy;
let ticketInactivity;
let healthSystem;
// let aiSystem; // DESHABILITADO - Sistema de IA removido
let logsSystem;
let invitesSystem;
let moderationSystem;
let verificationSystem;
let socialLinksSystem;
let streamMonitorSystem;
let socialMediaMonitorSystem;
let customCommandsSystem;
let suggestionsSystem;
let changelogSystem;
let serverStatsSystem;
let tasksSystem;
let warnsSystem;
let welcomeSystem;
let commands;

// Map para selecciones de roles en embeds
const embedRoleSelections = new Map();

// Evento Ready
client.once('ready', async () => {
    logger.success(`Bot iniciado como ${client.user.tag}`);
    
    try {
        // Inicializar sistemas
        ticketsSystem = new TicketsSystem(client, config, messages);
        ticketHierarchy = new TicketHierarchy(client);
        ticketInactivity = new TicketInactivity(client);
        healthSystem = new HealthSystem(client);
        logsSystem = new LogsSystem(client, config);
        invitesSystem = new InvitesSystem(client, config);
        moderationSystem = new ModerationSystem(client, config, messages);
        verificationSystem = new VerificationSystem(client, config);
        socialLinksSystem = new SocialLinksSystem(client, config);
        streamMonitorSystem = new StreamMonitorSystem(client, config, socialLinksSystem);
        socialMediaMonitorSystem = new SocialMediaMonitorSystem(client);
        customCommandsSystem = new CustomCommandsSystem(client, config);
        suggestionsSystem = new SuggestionsSystem();
        changelogSystem = new ChangelogSystem(client);
        serverStatsSystem = new ServerStatsSystem(client);
        tasksSystem = new TasksSystem(client);
        warnsSystem = new WarnsSystem(client);
        welcomeSystem = new WelcomeSystem(client);
        
        // Cargar datos persistentes
        ticketsSystem.loadTicketCounters();
        await ticketsSystem.loadVoiceSupportData();
        ticketsSystem.loadTicketMetadata();
        ticketHierarchy.loadHierarchyData();
        ticketInactivity.loadActivityData();
        suggestionsSystem.loadSuggestions();
        await changelogSystem.initialize();
        await serverStatsSystem.init();
        
        // Exponer ticketsSystem en el cliente para uso en otros módulos
        client.ticketsSystem = ticketsSystem;
        
        // Inicializar sistema de tareas (sin IA)
        await tasksSystem.initialize(null);
        client.tasksSystem = tasksSystem;
        
        // Inicializar sistema de advertencias
        await warnsSystem.initialize();
        client.warnsSystem = warnsSystem;
        
        // Inicializar sistema de bienvenidas
        await welcomeSystem.initialize();
        client.welcomeSystem = welcomeSystem;
        
        // Registrar comandos
        const guildId = config.guildId || config.allowedGuildId;
        commands = await registerCommands(client, guildId);
        logger.success('Comandos slash registrados');
        
        // Inicializar sistemas que requieren init()
        verificationSystem.init();
        await verificationSystem.setupVerificationMessage();
        
        // Cargar comandos personalizados
        customCommandsSystem.loadCommands();
        logger.success('Sistema de comandos personalizados iniciado correctamente');
        
        // Social links system se carga automáticamente en constructor
        logger.info('Sistema de redes sociales iniciado correctamente');
        
        // Iniciar sistema de monitoreo de streams
        streamMonitorSystem.start();
        
        // Iniciar sistema de monitoreo de redes sociales
        // await socialMediaMonitorSystem.init(); // DESACTIVADO - Enviaba notificaciones cada 2 min
        
        // Setup event handlers
        setupEventHandlers(client, {
            ticketsSystem,
            ticketHierarchy,
            ticketInactivity,
            healthSystem,
            // aiSystem, // DESHABILITADO - Sistema de IA removido
            logsSystem,
            invitesSystem,
            moderationSystem,
            verificationSystem,
            socialLinksSystem,
            streamMonitorSystem,
            socialMediaMonitorSystem,
            customCommandsSystem,
            suggestionsSystem,
            changelogSystem,
            serverStatsSystem,
            tasksSystem,
            warnsSystem,
            welcomeSystem,
            embedRoleSelections,
            commands
        });
        
        // Iniciar heartbeat
        healthSystem.start();
        
        // Iniciar verificación de inactividad de tickets
        ticketInactivity.startInactivityCheck();
        
        // Enviar mensaje de estado del bot después de inicialización exitosa
        await sendBotStatusMessage(client, 'success', null, commands, ticketsSystem);
        
    } catch (error) {
        logger.error('Error durante la inicialización', error);
        await sendBotStatusMessage(client, 'error', error, null, null).catch(() => {});
        process.exit(1);
    }
});

// Sistema de changelog removido - Los changelogs se envían directamente a Discord sin archivos

// Función para enviar mensaje de estado del bot
async function sendBotStatusMessage(client, status, error = null, commandsMap = null, ticketsSys = null) {
    try {
        const botLogsChannelId = config.logs?.channels?.bots;
        if (!botLogsChannelId) return;

        const channel = await client.channels.fetch(botLogsChannelId);
        if (!channel || !channel.isTextBased()) return;

        const { EmbedBuilder, Colors } = require('discord.js');
        
        const statusConfig = {
            success: {
                color: '#5865F2',
                emoji: '✅',
                title: 'Mantenimiento Realizado',
                description: 'Mantenimiento realizado por **egolatrada** - Estado: **EXITOSO**'
            },
            error: {
                color: Colors.Red,
                emoji: '❌',
                title: 'Mantenimiento Realizado',
                description: 'Mantenimiento realizado por **egolatrada** - Estado: **FALLO**'
            },
            stopped: {
                color: Colors.Orange,
                emoji: '⏸️',
                title: 'Bot Detenido',
                description: 'El bot se detuvo de manera controlada.'
            }
        };

        const config_status = statusConfig[status] || statusConfig.stopped;

        const embed = new EmbedBuilder()
            .setColor(config_status.color)
            .setTitle(`${config_status.emoji} ${config_status.title}`)
            .setDescription(config_status.description)
            .setTimestamp();

        if (status === 'success') {
            const commandCount = commandsMap ? commandsMap.size : 0;
            const ticketCount = (ticketsSys && ticketsSys.activeTickets) ? ticketsSys.activeTickets.size : 0;
            
            embed.addFields(
                { name: '📝 Comandos', value: `${commandCount} comandos cargados`, inline: true },
                { name: '🎫 Tickets', value: `${ticketCount} tickets activos`, inline: true },
                { name: '🔄 Reinicio', value: '<t:' + Math.floor(Date.now() / 1000) + ':R>', inline: true }
            );
        }

        if (error) {
            embed.addFields({
                name: '⚠️ Error',
                value: `\`\`\`${error.message.substring(0, 1000)}\`\`\``,
                inline: false
            });
        }

        await channel.send({ embeds: [embed] });
    } catch (err) {
        logger.error('Error al enviar mensaje de estado del bot', err);
    }
}

// Login
client.login(process.env.DISCORD_DEV_BOT_TOKEN).catch(error => {
    logger.error('Error al iniciar sesión', error);
    process.exit(1);
});

// Cleanup al detener el bot
async function gracefulShutdown(signal) {
    logger.info(`⏹️ Señal ${signal} recibida, cerrando bot de manera limpia...`);
    
    try {
        if (warnsSystem) {
            await warnsSystem.cleanup();
            logger.info('✅ Sistema de advertencias cerrado');
        }
        
        if (tasksSystem && tasksSystem.pool) {
            await tasksSystem.pool.end();
            logger.info('✅ Pool de tareas cerrado');
        }
        
        if (healthSystem) {
            healthSystem.stop();
        }
        
        if (ticketInactivity) {
            ticketInactivity.stopInactivityCheck();
        }
        
        if (client) {
            client.destroy();
            logger.info('✅ Cliente de Discord desconectado');
        }
        
        logger.success('👋 Bot cerrado correctamente');
        process.exit(0);
    } catch (error) {
        logger.error('Error durante el cierre', error);
        process.exit(1);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Exportar cliente y sistemas para uso externo
module.exports = { client, ticketsSystem, healthSystem };
