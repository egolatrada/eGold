const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('añadir-streamer')
        .setDescription('📱 [SOCIAL] Añade un streamer para recibir notificaciones automáticas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('plataforma')
                .setDescription('Plataforma de streaming')
                .setRequired(true)
                .addChoices(
                    { name: '🎮 Twitch', value: 'twitch' },
                    { name: '⚡ Kick', value: 'kick' },
                    { name: '📺 YouTube', value: 'youtube' }
                ))
        .addStringOption(option =>
            option.setName('link_o_usuario')
                .setDescription('Link del canal o nombre de usuario (ej: twitch.tv/canal o canal)')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('discord')
                .setDescription('Usuario de Discord vinculado (opcional)')
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
            const platform = interaction.options.getString('plataforma');
            const username = interaction.options.getString('link_o_usuario');
            const user = interaction.options.getUser('discord');
            
            const notificationChannelId = '1425955813645881404';
            
            const result = socialLinksSystem.addLink(
                user?.id || 'no_user',
                platform,
                username,
                notificationChannelId
            );
            
            if (result.success) {
                const platformEmojis = {
                    twitch: '🎮',
                    kick: '⚡',
                    youtube: '📺'
                };
                
                const discordInfo = user ? `\n💬 **Discord:** ${user}` : '';
                
                await interaction.reply({
                    content: `✅ **Streamer añadido correctamente**\n\n${platformEmojis[platform]} **Plataforma:** ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n👤 **Canal:** ${username}${discordInfo}\n\n*Se enviará una notificación automática cuando ${username} esté en directo.*`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `❌ Error: ${result.error}`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error en /añadir-streamer:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al añadir el streamer.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
