const { Pool } = require('pg');
const { EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

class SimpleTasksSystem {
    constructor(client) {
        this.client = client;
        this.pool = null;
        this.aiSystem = null;
        this.taskMessages = new Map(); // guildId:messageId -> taskData
    }

    /**
     * Inicializa la conexión a la base de datos
     */
    async initialize(aiSystem) {
        this.aiSystem = aiSystem;
        
        try {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
            });

            // Crear tabla simplificada
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS simple_tasks (
                    id SERIAL PRIMARY KEY,
                    guild_id VARCHAR(32) NOT NULL,
                    channel_id VARCHAR(32) NOT NULL,
                    message_id VARCHAR(32),
                    category VARCHAR(100) NOT NULL,
                    task_text TEXT NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP
                )
            `);

            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_simple_tasks_guild 
                ON simple_tasks(guild_id, completed)
            `);

            logger.success('✅ Sistema de tareas simplificado inicializado');
        } catch (error) {
            logger.error('Error al inicializar sistema de tareas', error);
            throw error;
        }
    }

    /**
     * Parsea un bloque de texto y extrae las tareas individuales
     * Detecta formatos: "1.", "1)", "- ", "• ", etc.
     * También divide líneas largas como "1. Tarea A 2. Tarea B 3. Tarea C"
     */
    parseTaskList(text) {
        let normalizedText = text;
        
        // PASO 1: Dividir números consecutivos en la misma línea
        // Solo divide si hay un espacio ANTES del número (para no romper "Versión 2.5")
        // Busca: espacio + número + punto/paréntesis + espacio
        // "1. Tarea A 2. Tarea B" → "1. Tarea A\n2. Tarea B"
        normalizedText = normalizedText.replace(/(\s+)(\d+[\.\)])\s+/g, '$1\n$2 ');
        
        // PASO 2: Dividir por saltos de línea
        const lines = normalizedText.split('\n').map(line => line.trim()).filter(line => line);
        const tasks = [];
        
        // Patrones para detectar inicio de tarea
        const patterns = [
            /^(\d+)[\.\)]\s*(.+)$/,      // 1. tarea o 1) tarea
            /^[-•\*]\s*(.+)$/,            // - tarea o • tarea o * tarea
            /^([a-z])[\.\)]\s*(.+)$/i,   // a) tarea o a. tarea
        ];

        for (const line of lines) {
            let matched = false;
            
            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    const taskText = match[2] || match[1]; // Captura el texto sin el prefijo
                    if (taskText && taskText.trim().length > 0) {
                        tasks.push(taskText.trim());
                        matched = true;
                        break;
                    }
                }
            }
            
            // Si no coincide con ningún patrón pero tiene texto, considéralo tarea
            if (!matched && line.length > 0) {
                tasks.push(line);
            }
        }

        return tasks;
    }

    /**
     * Categoriza una tarea usando IA
     */
    async categorizeTask(taskText) {
        if (!this.aiSystem) {
            return 'General';
        }

        try {
            const prompt = `Clasifica la siguiente tarea en UNA de estas categorías EXACTAS (responde SOLO con el nombre de la categoría):

Discord - Tareas relacionadas con Discord (bots, canales, roles, moderación de Discord)
Scripts GTA - Scripts, recursos, configuración de FiveM/GTA roleplay (origen police, admin menu, etc)
Desarrollo - Programación, código, features nuevas
Configuración - Configuración de servidor, ajustes, setup
Eventos - Organización de eventos, actividades
Marketing - Promoción, redes sociales, publicidad
Soporte - Ayuda a usuarios, tickets, atención
Bugs - Corrección de errores, problemas técnicos
Contenido - Creación de contenido, documentación
Administración - Gestión general, tareas administrativas
General - Otras tareas que no encajan en las categorías anteriores

Tarea: "${taskText}"

Ejemplos:
- "Eliminar bots innecesarios" → Discord
- "Configurar origen police" → Scripts GTA
- "Configurar admin menu" → Scripts GTA
- "Hacer de betatester" → Soporte
- "Leer un libro" → General

Categoría:`;

            const response = await this.aiSystem.generateResponse(prompt, []);
            const category = response.trim();
            
            const validCategories = [
                'Discord', 'Scripts GTA', 'Desarrollo', 'Configuración', 'Eventos', 
                'Marketing', 'Soporte', 'Bugs', 'Contenido', 
                'Administración', 'General'
            ];

            return validCategories.includes(category) ? category : 'General';
        } catch (error) {
            logger.error('Error al categorizar con IA', error);
            return 'General';
        }
    }

    /**
     * Categoriza múltiples tareas en lote usando IA
     */
    async categorizeTasks(tasks) {
        if (!this.aiSystem) {
            return tasks.map(() => 'General');
        }

        try {
            const tasksList = tasks.map((task, i) => `${i + 1}. ${task}`).join('\n');
            
            const prompt = `Clasifica cada tarea en UNA de estas categorías:
Discord, Scripts GTA, Desarrollo, Configuración, Eventos, Marketing, Soporte, Bugs, Contenido, Administración, General

Guía de categorías:
- Discord: Bots, canales, roles, moderación de Discord
- Scripts GTA: Scripts FiveM/GTA (origen police, admin menu, recursos roleplay)
- Configuración: Setup, configuración de servidor
- Soporte: Ayuda, tickets, betatester
- General: Tareas personales (leer, etc)

Tareas:
${tasksList}

Responde en formato: número|categoría (ejemplo: "1|Discord")
Una línea por tarea, en orden:`;

            const response = await this.aiSystem.generateResponse(prompt, []);
            const lines = response.trim().split('\n');
            
            const categories = [];
            for (let i = 0; i < tasks.length; i++) {
                if (lines[i]) {
                    const parts = lines[i].split('|');
                    if (parts.length === 2) {
                        const cat = parts[1].trim();
                        const validCategories = [
                            'Discord', 'Scripts GTA', 'Desarrollo', 'Configuración', 'Eventos', 
                            'Marketing', 'Soporte', 'Bugs', 'Contenido', 
                            'Administración', 'General'
                        ];
                        categories.push(validCategories.includes(cat) ? cat : 'General');
                    } else {
                        categories.push('General');
                    }
                } else {
                    categories.push('General');
                }
            }
            
            return categories;
        } catch (error) {
            logger.error('Error al categorizar tareas en lote', error);
            return tasks.map(() => 'General');
        }
    }

    /**
     * Procesa texto de tareas, las categoriza y las guarda
     */
    async processTaskList(guildId, channelId, text, manualCategory = null, messageIds = []) {
        const tasks = this.parseTaskList(text);
        
        if (tasks.length === 0) {
            return { success: false, error: 'No se detectaron tareas en el texto proporcionado.' };
        }

        let categories;
        if (manualCategory) {
            // Usar categoría manual para todas
            categories = tasks.map(() => manualCategory);
        } else {
            // Usar IA para categorizar
            categories = await this.categorizeTasks(tasks);
        }

        // Guardar en base de datos
        const savedTasks = [];
        for (let i = 0; i < tasks.length; i++) {
            const result = await this.pool.query(
                `INSERT INTO simple_tasks (guild_id, channel_id, task_text, category) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`,
                [guildId, channelId, tasks[i], categories[i]]
            );
            savedTasks.push(result.rows[0]);
        }

        // Agrupar por categoría
        const tasksByCategory = {};
        for (const task of savedTasks) {
            if (!tasksByCategory[task.category]) {
                tasksByCategory[task.category] = [];
            }
            tasksByCategory[task.category].push(task);
        }

        logger.info(`📝 ${tasks.length} tareas añadidas en ${Object.keys(tasksByCategory).length} categorías`);
        
        return { 
            success: true, 
            tasksByCategory,
            totalTasks: tasks.length,
            categories: Object.keys(tasksByCategory).length
        };
    }

    /**
     * Genera embeds organizados por categoría con colores distintivos
     */
    generateTaskEmbeds(tasksByCategory) {
        const embeds = [];
        
        const categoryEmojis = {
            'Discord': '💬',
            'Scripts GTA': '🎮',
            'Desarrollo': '💻',
            'Moderación': '🛡️',
            'Configuración': '⚙️',
            'Eventos': '🎉',
            'Marketing': '📢',
            'Soporte': '🎫',
            'Bugs': '🐛',
            'Contenido': '📝',
            'Administración': '👑',
            'General': '📋'
        };

        const categoryColors = {
            'Discord': '#5865F2',    // Azul Discord
            'Scripts GTA': '#00D9FF', // Cyan (GTA V)
            'Desarrollo': '#57F287', // Verde
            'Moderación': '#ED4245', // Rojo
            'Configuración': '#FEE75C', // Amarillo
            'Eventos': '#EB459E',    // Rosa
            'Marketing': '#FF6B6B',  // Coral
            'Soporte': '#5DADEC',    // Azul claro
            'Bugs': '#FF5733',       // Naranja rojizo
            'Contenido': '#9B59B6',  // Púrpura
            'Administración': '#FFD700', // Dorado
            'General': '#95A5A6'     // Gris
        };

        for (const [category, tasks] of Object.entries(tasksByCategory)) {
            const emoji = categoryEmojis[category] || '📌';
            const color = categoryColors[category] || '#5865F2';
            
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`${emoji} ${category}`)
                .setTimestamp();

            let description = '';
            tasks.forEach((task, index) => {
                const status = task.completed ? '~~' : '';
                const number = index + 1;
                description += `${number}. ${status}${task.task_text}${status}\n`;
            });

            embed.setDescription(description || 'No hay tareas');
            
            const completedCount = tasks.filter(t => t.completed).length;
            const totalCount = tasks.length;
            embed.setFooter({ 
                text: `${completedCount}/${totalCount} completadas • Copia y pega la tarea en el chat para tacharla` 
            });

            embeds.push(embed);
        }

        return embeds;
    }

    /**
     * Obtiene todas las tareas de un servidor agrupadas por categoría
     */
    async getTasksByCategory(guildId) {
        const result = await this.pool.query(
            `SELECT * FROM simple_tasks WHERE guild_id = $1 ORDER BY category, created_at`,
            [guildId]
        );

        const tasksByCategory = {};
        for (const task of result.rows) {
            if (!tasksByCategory[task.category]) {
                tasksByCategory[task.category] = [];
            }
            tasksByCategory[task.category].push(task);
        }

        return tasksByCategory;
    }

    /**
     * Busca una tarea por texto (para copiar/pegar)
     * Usa búsqueda EXACTA para evitar marcar múltiples tareas
     */
    async findTaskByText(guildId, searchText) {
        // Limpiar texto de búsqueda
        const cleanText = searchText.trim().toLowerCase();
        
        // BÚSQUEDA EXACTA primero (case-insensitive)
        let result = await this.pool.query(
            `SELECT * FROM simple_tasks 
             WHERE guild_id = $1 
             AND LOWER(task_text) = $2
             AND completed = false
             ORDER BY created_at DESC
             LIMIT 1`,
            [guildId, cleanText]
        );

        // Si no encuentra coincidencia exacta, buscar que el texto pegado CONTENGA la tarea completa
        // Usa LOWER en ambos lados para case-insensitive
        if (result.rows.length === 0) {
            result = await this.pool.query(
                `SELECT * FROM simple_tasks 
                 WHERE guild_id = $1 
                 AND LOWER($2) LIKE CONCAT('%', LOWER(task_text), '%')
                 AND completed = false
                 ORDER BY LENGTH(task_text) DESC
                 LIMIT 1`,
                [guildId, cleanText]
            );
        }

        return result.rows[0] || null;
    }

    /**
     * Marca una tarea como completada
     */
    async completeTask(taskId) {
        const result = await this.pool.query(
            `UPDATE simple_tasks 
             SET completed = true, completed_at = CURRENT_TIMESTAMP
             WHERE id = $1 
             RETURNING *`,
            [taskId]
        );

        if (result.rows.length > 0) {
            logger.info(`✅ Tarea ${taskId} completada: "${result.rows[0].task_text}"`);
        }

        return result.rows[0] || null;
    }

    /**
     * Elimina todas las tareas de un servidor
     */
    async clearAllTasks(guildId) {
        const result = await this.pool.query(
            `DELETE FROM simple_tasks WHERE guild_id = $1 RETURNING *`,
            [guildId]
        );

        logger.info(`🗑️ ${result.rowCount} tareas eliminadas del servidor ${guildId}`);
        return result.rowCount;
    }

    /**
     * Elimina los embeds antiguos de tareas antes de enviar nuevos
     */
    async deleteOldTaskEmbeds(guildId, channel) {
        try {
            // Obtener IDs de mensajes antiguos
            const result = await this.pool.query(
                `SELECT DISTINCT message_id FROM simple_tasks 
                 WHERE guild_id = $1 AND message_id IS NOT NULL
                 LIMIT 1`,
                [guildId]
            );

            if (result.rows.length > 0 && result.rows[0].message_id) {
                const messageIds = result.rows[0].message_id.split(',');
                
                for (const msgId of messageIds) {
                    try {
                        const message = await channel.messages.fetch(msgId);
                        if (message) {
                            await message.delete();
                            logger.info(`🗑️ Embed antiguo eliminado: ${msgId}`);
                        }
                    } catch (error) {
                        // Ignorar si el mensaje ya no existe
                    }
                }
            }
        } catch (error) {
            logger.error('Error al eliminar embeds antiguos', error);
        }
    }

    /**
     * Asocia mensajes de embeds con tareas del servidor
     */
    async saveTaskMessages(guildId, channelId, messageIds) {
        try {
            // Actualizar todas las tareas de este guild con los IDs de mensajes
            await this.pool.query(
                `UPDATE simple_tasks 
                 SET message_id = $1, channel_id = $2
                 WHERE guild_id = $3`,
                [messageIds.join(','), channelId, guildId]
            );
            
            logger.info(`💾 ${messageIds.length} mensajes asociados a tareas`);
        } catch (error) {
            logger.error('Error al guardar IDs de mensajes', error);
        }
    }

    /**
     * Actualiza los IDs de mensajes después de reemplazar embeds
     */
    async updateMessageIds(guildId, channelId, newMessageIds) {
        try {
            await this.pool.query(
                `UPDATE simple_tasks 
                 SET message_id = $1
                 WHERE guild_id = $2 AND channel_id = $3`,
                [newMessageIds.join(','), guildId, channelId]
            );
            
            logger.info(`💾 IDs de mensajes actualizados (${newMessageIds.length} nuevos)`);
        } catch (error) {
            logger.error('Error al actualizar IDs de mensajes', error);
        }
    }

    /**
     * Actualiza los embeds de tareas en Discord
     * Elimina los mensajes antiguos y envía nuevos actualizados
     */
    async updateTaskEmbeds(guild, channelId, messageIds, updatedTasksByCategory) {
        try {
            const channel = await guild.channels.fetch(channelId);
            if (!channel) {
                logger.warn('Canal no encontrado al actualizar embeds');
                return null;
            }

            // Generar nuevos embeds
            const allEmbeds = this.generateTaskEmbeds(updatedTasksByCategory);
            
            // PASO 1: Intentar eliminar mensajes antiguos
            let deletionSuccess = true;
            const deletedMessages = [];
            
            for (const msgId of messageIds) {
                try {
                    const message = await channel.messages.fetch(msgId);
                    if (message) {
                        await message.delete();
                        deletedMessages.push(msgId);
                        logger.info(`🗑️ Mensaje ${msgId} eliminado`);
                    }
                } catch (error) {
                    logger.warn(`No se pudo eliminar mensaje ${msgId}: ${error.message}`);
                    deletionSuccess = false;
                }
            }
            
            // PASO 2: Solo si se eliminaron TODOS los mensajes viejos, enviar nuevos
            if (deletionSuccess && deletedMessages.length === messageIds.length) {
                const newMessageIds = [];
                
                // Enviar nuevos mensajes (máximo 10 embeds por mensaje)
                for (let i = 0; i < allEmbeds.length; i += 10) {
                    const embedBatch = allEmbeds.slice(i, i + 10);
                    
                    try {
                        const newMessage = await channel.send({ embeds: embedBatch });
                        newMessageIds.push(newMessage.id);
                        logger.info(`📨 Nuevo mensaje enviado con ${embedBatch.length} embeds`);
                    } catch (error) {
                        logger.error('Error al enviar nuevo mensaje:', error.message);
                        return null; // Falló el envío
                    }
                }
                
                logger.success(`✏️ Embeds reemplazados (${newMessageIds.length} mensajes nuevos)`);
                return newMessageIds;
                
            } else {
                // FALLBACK: Si no se pudieron eliminar todos, editar los existentes
                logger.warn('No se pudieron eliminar todos los mensajes, editando existentes...');
                
                let messageIndex = 0;
                for (let i = 0; i < allEmbeds.length; i += 10) {
                    const embedBatch = allEmbeds.slice(i, i + 10);
                    
                    if (messageIndex < messageIds.length) {
                        try {
                            const message = await channel.messages.fetch(messageIds[messageIndex]);
                            if (message) {
                                await message.edit({ embeds: embedBatch });
                                logger.info(`✏️ Mensaje ${messageIndex + 1} editado`);
                            }
                        } catch (error) {
                            logger.error(`Error al editar mensaje ${messageIds[messageIndex]}:`, error.message);
                        }
                    }
                    messageIndex++;
                }
                
                logger.info('✏️ Embeds actualizados (editados)');
                return messageIds; // Retornar los IDs originales
            }
            
        } catch (error) {
            logger.error('Error al actualizar embeds', error);
            return null;
        }
    }

    /**
     * Cierra la conexión
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            logger.info('🔌 Conexión a base de datos de tareas cerrada');
        }
    }
}

module.exports = SimpleTasksSystem;
