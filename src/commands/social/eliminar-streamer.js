const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar-streamer')
        .setDescription('🗑️ Elimina un streamer de las notificaciones automáticas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID del streamer (obtén la lista con /lista-streamer)')
                .setRequired(true)),
    
    async execute(interaction, context) {
        const { socialLinksSystem } = context;
        
        if (!socialLinksSystem) {
            return await interaction.reply({
                content: '❌ El sistema de streamers no está disponible.',
                ephemeral: true
            });
        }
        
        try {
            const linkId = interaction.options.getString('id');
            
            const result = socialLinksSystem.removeLink(linkId);
            
            if (result.success) {
                await interaction.reply({
                    content: `✅ **Streamer eliminado correctamente**\n\nYa no se enviarán notificaciones para este streamer.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `❌ Error: ${result.error}\n\n*Usa /lista-streamer para ver los IDs disponibles.*`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error en /eliminar-streamer:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al eliminar el streamer.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
