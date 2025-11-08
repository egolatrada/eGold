const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar-streamer')
        .setDescription('🗑️ Elimina un streamer de las notificaciones automáticas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('plataforma')
                .setDescription('Plataforma del streamer')
                .setRequired(true)
                .addChoices(
                    { name: '🎮 Twitch', value: 'twitch' },
                    { name: '⚡ Kick', value: 'kick' },
                    { name: '📺 YouTube', value: 'youtube' }
                ))
        .addStringOption(option =>
            option.setName('link_o_usuario')
                .setDescription('Link o nombre de usuario del streamer')
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
            const platform = interaction.options.getString('plataforma');
            const username = interaction.options.getString('link_o_usuario');
            
            const allLinks = socialLinksSystem.getAllLinks();
            const matchingLink = allLinks.find(link => 
                link.platform === platform && link.username === username
            );
            
            if (!matchingLink) {
                return await interaction.reply({
                    content: `❌ **No se encontró el streamer**\n\n**Plataforma:** ${platform}\n**Usuario:** ${username}\n\n*Verifica que el nombre sea exactamente igual al que usaste al añadirlo. Usa /lista-streamer para ver todos los streamers configurados.*`,
                    ephemeral: true
                });
            }
            
            const result = socialLinksSystem.removeLink(matchingLink.linkId);
            
            if (result.success) {
                await interaction.reply({
                    content: `✅ **Streamer eliminado correctamente**\n\n**Plataforma:** ${platform}\n**Usuario:** ${username}\n\nYa no se enviarán notificaciones para este streamer.`,
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
