const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ver-tareas')
        .setDescription('Muestra todas las tareas actuales organizadas por categorías')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const tasksSystem = interaction.client.tasksSystem;
        
        if (!tasksSystem) {
            return interaction.reply({
                content: '❌ El sistema de tareas no está disponible.',
                ephemeral: true
            });
        }

        try {
            await interaction.deferReply();

            const tasksByCategory = await tasksSystem.getTasksByCategory(interaction.guild.id);

            if (Object.keys(tasksByCategory).length === 0) {
                return interaction.editReply({
                    content: '📋 No hay tareas registradas.\n\n' +
                            '💡 Usa `/tareas` para crear tu primera lista de tareas.\n\n' +
                            '**Ejemplo:**\n' +
                            '```\n' +
                            '/tareas lista:\n' +
                            '1. Configurar canal de anuncios\n' +
                            '2. Revisar reportes\n' +
                            '3. Actualizar reglas\n' +
                            '```'
                });
            }

            const embeds = tasksSystem.generateTaskEmbeds(tasksByCategory);

            // Contar tareas totales y completadas
            let totalTasks = 0;
            let completedTasks = 0;
            for (const tasks of Object.values(tasksByCategory)) {
                totalTasks += tasks.length;
                completedTasks += tasks.filter(t => t.completed).length;
            }

            await interaction.editReply({
                content: `📊 **Progreso Total:** ${completedTasks}/${totalTasks} tareas completadas\n\n` +
                        `💡 **Para completar:** Copia el texto de cualquier tarea y pégalo en el chat.`,
                embeds: embeds.slice(0, 10)
            });

            // Si hay más de 10 categorías
            if (embeds.length > 10) {
                for (let i = 10; i < embeds.length; i += 10) {
                    await interaction.followUp({
                        embeds: embeds.slice(i, i + 10)
                    });
                }
            }

        } catch (error) {
            console.error('Error al mostrar tareas:', error);
            await interaction.editReply({
                content: '❌ Hubo un error al cargar las tareas.'
            });
        }
    },
};
