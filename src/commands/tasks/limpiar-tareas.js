const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpiar-tareas')
        .setDescription('✅ [TAREAS] Elimina TODAS las tareas del servidor (¡cuidado!)')
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
            await interaction.deferReply({ ephemeral: true });

            // PASO 1: Eliminar los embeds antiguos de tareas
            await tasksSystem.deleteOldTaskEmbeds(interaction.guild.id, interaction.channel);

            // PASO 2: Eliminar todas las tareas de la base de datos
            const deletedCount = await tasksSystem.clearAllTasks(interaction.guild.id);

            if (deletedCount === 0) {
                await interaction.editReply({
                    content: '📋 No había tareas para eliminar.'
                });
            } else {
                await interaction.editReply({
                    content: `✅ **${deletedCount} tareas eliminadas correctamente**\n\n` +
                            `Los embeds y las tareas del servidor han sido eliminados completamente.`
                });
            }

        } catch (error) {
            console.error('Error al limpiar tareas:', error);
            await interaction.editReply({
                content: '❌ Hubo un error al eliminar las tareas.'
            });
        }
    },
};
