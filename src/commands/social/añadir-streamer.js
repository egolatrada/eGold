const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('añadir-streamer')
        .setDescription('📺 Añade un streamer para recibir notificaciones automáticas')
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
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde se enviarán las notificaciones')
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
            const channel = interaction.options.getChannel('canal');
            
            if (!channel.isTextBased()) {
                return await interaction.reply({
                    content: '❌ El canal seleccionado debe ser un canal de texto.',
                    ephemeral: true
                });
            }
            
            const result = socialLinksSystem.addLink(
                user?.id || 'no_user',
                platform,
                username,
                channel.id
            );
            
            if (result.success) {
                const platformEmojis = {
                    twitch: '🎮',
                    kick: '⚡',
                    youtube: '📺'
                };
                
                const discordInfo = user ? `\n💬 **Discord:** ${user}` : '';
                
                await interaction.reply({
                    content: `✅ **Streamer añadido correctamente**\n\n${platformEmojis[platform]} **Plataforma:** ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n👤 **Usuario:** ${username}${discordInfo}\n📢 **Canal de notificaciones:** ${channel}\n🆔 **ID:** \`${result.linkId}\`\n\n*Las notificaciones se enviarán automáticamente cuando ${username} esté en directo.*`,
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
