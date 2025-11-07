const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpiar-tareas')
        .setDescription('Elimina TODAS las tareas del servidor (¡cuidado!)')
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

            const deletedCount = await tasksSystem.clearAllTasks(interaction.guild.id);

            if (deletedCount === 0) {
                await interaction.editReply({
                    content: '📋 No había tareas para eliminar.'
                });
            } else {
                await interaction.editReply({
                    content: `✅ **${deletedCount} tareas eliminadas correctamente**\n\n` +
                            `El servidor ahora no tiene tareas registradas.`
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
