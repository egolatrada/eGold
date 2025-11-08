const logger = require('../../utils/logger');
const { config } = require('../../config');

/**
 * Maneja mensajes nuevos en el servidor
 * Detecta cuando alguien copia/pega el texto de una tarea para marcarla como completada
 * Maneja sistema de jerarquía de tickets
 * Actualiza tracking de inactividad de tickets
 */
async function handleMessageCreate(message, context) {
    // Ignorar bots
    if (message.author.bot) return;

    // Solo en servidores
    if (!message.guild) return;

    const { tasksSystem, ticketHierarchy, ticketInactivity } = context;

    // Sistema de jerarquía de tickets
    if (ticketHierarchy) {
        try {
            await ticketHierarchy.handleMessage(message);
        } catch (error) {
            logger.error('Error en sistema de jerarquía de tickets', error);
        }
    }

    // Sistema de tracking de inactividad de tickets
    if (ticketInactivity && message.channel.name?.startsWith('ticket-')) {
        try {
            // Verificar si es staff o usuario
            const hierarchyRoles = config.tickets?.hierarchy;
            const member = message.member;
            
            if (hierarchyRoles && member) {
                const soporteRoleId = hierarchyRoles.soporte?.roleId;
                const moderadorRoleId = hierarchyRoles.moderador?.roleId;
                const administradorRoleId = hierarchyRoles.administrador?.roleId;
                const directivaRoleId = hierarchyRoles.directiva?.roleId;
                
                let staffRoleId = null;
                let isStaff = false;
                
                if (directivaRoleId && member.roles.cache.has(directivaRoleId)) {
                    isStaff = true;
                    staffRoleId = directivaRoleId;
                } else if (administradorRoleId && member.roles.cache.has(administradorRoleId)) {
                    isStaff = true;
                    staffRoleId = administradorRoleId;
                } else if (moderadorRoleId && member.roles.cache.has(moderadorRoleId)) {
                    isStaff = true;
                    staffRoleId = moderadorRoleId;
                } else if (soporteRoleId && member.roles.cache.has(soporteRoleId)) {
                    isStaff = true;
                    staffRoleId = soporteRoleId;
                }
                
                if (isStaff) {
                    ticketInactivity.updateStaffActivity(message.channel.id, message.author.id, staffRoleId);
                } else {
                    ticketInactivity.updateUserActivity(message.channel.id, message.author.id);
                }
            }
        } catch (error) {
            logger.error('Error en sistema de inactividad de tickets', error);
        }
    }

    // Sistema de tareas
    if (!tasksSystem) return;

    try {
        // Buscar si el mensaje coincide con alguna tarea
        const task = await tasksSystem.findTaskByText(message.guild.id, message.content);

        if (task) {
            // Marcar como completada
            await tasksSystem.completeTask(task.id);

            // ELIMINAR el mensaje del usuario (para no dejar basura en el canal)
            try {
                await message.delete();
            } catch (error) {
                // Si no se puede eliminar, solo reaccionar
                await message.react('✅').catch(() => {});
            }

            // Obtener tareas actualizadas
            const tasksByCategory = await tasksSystem.getTasksByCategory(message.guild.id);

            // Actualizar embeds originales (eliminar viejos y enviar nuevos)
            let newMessageIds = null;
            if (task.message_id && task.channel_id) {
                const oldMessageIds = task.message_id.split(',');
                newMessageIds = await tasksSystem.updateTaskEmbeds(
                    message.guild,
                    task.channel_id,
                    oldMessageIds,
                    tasksByCategory
                );

                // Solo actualizar IDs si el refresh fue exitoso
                if (newMessageIds && newMessageIds.length > 0 && 
                    newMessageIds.join(',') !== oldMessageIds.join(',')) {
                    await tasksSystem.updateMessageIds(
                        message.guild.id,
                        task.channel_id,
                        newMessageIds
                    );
                }
            }

            // No enviar ningún mensaje - solo actualizar embed silenciosamente
            logger.info(`✅ Tarea completada: "${task.task_text}" (Usuario: ${message.author.tag})`);
        }
    } catch (error) {
        logger.error('Error al procesar mensaje para tareas', error);
    }
}

module.exports = { handleMessageCreate };
