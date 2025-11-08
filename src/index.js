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
const CustomCommandsSystem = require('./systems/custom-commands-system');
const SuggestionsSystem = require('./systems/suggestions-system');
const ChangelogSystem = require('./systems/changelog-system');
const ServerStatsSystem = require('./systems/server-stats');
// const TasksSystem = require('./systems/tasks/simple-tasks-system');

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
let customCommandsSystem;
let suggestionsSystem;
let changelogSystem;
let serverStatsSystem;
// let tasksSystem;
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
        customCommandsSystem = new CustomCommandsSystem(client, config);
        suggestionsSystem = new SuggestionsSystem();
        changelogSystem = new ChangelogSystem(client);
        serverStatsSystem = new ServerStatsSystem(client);
        // tasksSystem = new TasksSystem(client);
        
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
        // await tasksSystem.initialize(null);
        // client.tasksSystem = tasksSystem;
        
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
            customCommandsSystem,
            suggestionsSystem,
            changelogSystem,
            serverStatsSystem,
            // tasksSystem,
            embedRoleSelections,
            commands
        });
        
        // Iniciar heartbeat
        healthSystem.start();
        
        // Iniciar verificación de inactividad de tickets
        ticketInactivity.startInactivityCheck();
        
    } catch (error) {
        logger.error('Error durante la inicialización', error);
        process.exit(1);
    }
});

// Login
client.login(process.env.DISCORD_DEV_BOT_TOKEN).catch(error => {
    logger.error('Error al iniciar sesión', error);
    process.exit(1);
});

// Exportar cliente y sistemas para uso externo
module.exports = { client, ticketsSystem, healthSystem };
