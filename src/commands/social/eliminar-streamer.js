const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar-streamer')
        .setDescription('🗑️ Elimina un streamer de las notificaciones automáticas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('streamer')
                .setDescription('Selecciona el streamer a eliminar')
                .setRequired(true)
                .setAutocomplete(true))
        .addUserOption(option =>
            option.setName('discord')
                .setDescription('Filtrar por usuario de Discord (opcional)')
                .setRequired(false)),
    
    async execute(interaction, context) {
        const { socialLinksSystem } = context;
        
        if (!socialLinksSystem) {
            return await interaction.reply({
                content: '❌ El sistema de streamers no está disponible.',
                ephemeral: true
            });
        }
        
        try {
            const linkId = interaction.options.getString('streamer');
            const user = interaction.options.getUser('discord');
            
            const link = socialLinksSystem.getAllLinks().find(l => l.linkId === linkId);
            
            if (!link) {
                return await interaction.reply({
                    content: `❌ No se encontró el streamer seleccionado.`,
                    ephemeral: true
                });
            }
            
            if (user && link.userId !== user.id) {
                return await interaction.reply({
                    content: `❌ El streamer seleccionado no pertenece a ${user}.`,
                    ephemeral: true
                });
            }
            
            const result = socialLinksSystem.removeLink(linkId);
            
            if (result.success) {
                const platformEmojis = {
                    twitch: '🎮',
                    kick: '⚡',
                    youtube: '📺'
                };
                
                await interaction.reply({
                    content: `✅ **Streamer eliminado correctamente**\n\n${platformEmojis[link.platform]} **Plataforma:** ${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}\n👤 **Usuario:** ${link.username}\n💬 **Discord:** ${user}\n\nYa no se enviarán notificaciones para este streamer.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `❌ Error: ${result.error}`,
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
