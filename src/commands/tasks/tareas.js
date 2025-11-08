const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tareas')
        .setDescription('Crea una lista de tareas organizadas por categoría')
        .addStringOption(option =>
            option.setName('lista')
                .setDescription('Lista de tareas (usa 1., 2., - o • al inicio de cada tarea)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoría para TODAS las tareas (obligatorio)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const tasksSystem = interaction.client.tasksSystem;
        
        if (!tasksSystem) {
            return interaction.reply({
                content: '❌ El sistema de tareas no está disponible.',
                ephemeral: true
            });
        }

        const lista = interaction.options.getString('lista');
        const categoria = interaction.options.getString('categoria');

        try {
            await interaction.deferReply();

            const result = await tasksSystem.processTaskList(
                interaction.guild.id,
                interaction.channel.id,
                lista,
                categoria
            );

            if (!result.success) {
                return interaction.editReply({
                    content: `❌ ${result.error}\n\n` +
                            `💡 **Formatos válidos:**\n` +
                            `\`\`\`\n` +
                            `1. Primera tarea\n` +
                            `2. Segunda tarea\n` +
                            `3. Tercera tarea\n\n` +
                            `Ó\n\n` +
                            `- Tarea uno\n` +
                            `- Tarea dos\n` +
                            `- Tarea tres\n` +
                            `\`\`\``
                });
            }

            // PASO 1: Eliminar embeds antiguos si existen
            await tasksSystem.deleteOldTaskEmbeds(interaction.guild.id, interaction.channel);

            // PASO 2: Generar embeds actualizados de TODAS las categorías
            const allTasks = await tasksSystem.getTasksByCategory(interaction.guild.id);
            const embeds = tasksSystem.generateTaskEmbeds(allTasks);

            // PASO 3: Enviar nuevos embeds separados por categoría
            const reply = await interaction.editReply({
                content: `✅ **${result.totalTasks} tareas añadidas a la categoría "${result.category}"**`,
                embeds: embeds.slice(0, 10) // Máximo 10 embeds por mensaje
            });

            // Guardar IDs de mensajes para actualizar después
            const messageIds = [reply.id];

            // Si hay más de 10 categorías, enviar el resto en mensajes separados
            if (embeds.length > 10) {
                for (let i = 10; i < embeds.length; i += 10) {
                    const followUp = await interaction.followUp({
                        embeds: embeds.slice(i, i + 10)
                    });
                    messageIds.push(followUp.id);
                }
            }

            // Guardar IDs de mensajes en la base de datos
            await tasksSystem.saveTaskMessages(
                interaction.guild.id,
                interaction.channel.id,
                messageIds
            );

        } catch (error) {
            console.error('Error al procesar tareas:', error);
            await interaction.editReply({
                content: '❌ Hubo un error al procesar las tareas. Por favor, inténtalo de nuevo.'
            });
        }
    },
};
