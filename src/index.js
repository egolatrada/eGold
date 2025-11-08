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

// Changelog de la versión actual - Actualizar aquí cuando hagas cambios
const RECENT_CHANGES = [
    'Jerarquía de tickets ampliada: Soporte → Moderador → Admin → **Directiva** (4 niveles)',
    'Bloqueo entre mismo nivel: Si Soporte A maneja ticket, Soporte B solo puede leer',
    '🤝 **Colaboración entre compañeros**: Menciona a @usuario del mismo nivel para desbloquearlo',
    'Sistema de escalación mejorado: Menciona @rol superior para escalar sin desbloquear mismo nivel',
    'Niveles superiores se mantienen bloqueados al colaborar entre mismo nivel'
];

// Sistema de changelog incremental
const fs = require('fs').promises;
const path = require('path');
const CHANGELOG_FILE = path.join(__dirname, '../data/last-changelog.json');

async function loadLastChangelog() {
    try {
        const data = await fs.readFile(CHANGELOG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveLastChangelog(changes) {
    try {
        const dataDir = path.dirname(CHANGELOG_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(CHANGELOG_FILE, JSON.stringify(changes, null, 2), 'utf8');
    } catch (error) {
        logger.error('Error al guardar changelog', error);
    }
}

function getNewChanges(currentChanges, lastChanges) {
    return currentChanges.filter(change => !lastChanges.includes(change));
}

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
                color: Colors.Green,
                emoji: '✅',
                title: 'Bot Activo',
                description: 'El bot se ha iniciado correctamente y está funcionando sin problemas.'
            },
            error: {
                color: Colors.Red,
                emoji: '❌',
                title: 'Bot Detenido por Errores',
                description: 'El bot encontró errores críticos durante la inicialización y se detuvo.'
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
                { name: '🔄 Uptime', value: '<t:' + Math.floor(Date.now() / 1000) + ':R>', inline: true }
            );
            
            // Obtener solo cambios nuevos desde el último reinicio
            const lastChangelog = await loadLastChangelog();
            const newChanges = getNewChanges(RECENT_CHANGES, lastChangelog);
            
            if (newChanges && newChanges.length > 0) {
                const changesList = newChanges.map((change, index) => `${index + 1}. ${change}`).join('\n');
                embed.addFields({
                    name: '📋 Cambios Recientes',
                    value: changesList,
                    inline: false
                });
                
                await saveLastChangelog(RECENT_CHANGES);
            }
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

// Exportar cliente y sistemas para uso externo
module.exports = { client, ticketsSystem, healthSystem };
