const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lista-streamer')
        .setDescription('📋 Lista todos los streamers configurados')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Filtrar por usuario de Discord')
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
            const user = interaction.options.getUser('usuario');
            
            let links;
            if (user) {
                links = socialLinksSystem.getUserLinks(user.id);
            } else {
                links = socialLinksSystem.getAllLinks();
            }
            
            if (links.length === 0) {
                return await interaction.reply({
                    content: user 
                        ? `ℹ️ ${user} no tiene streamers configurados.`
                        : 'ℹ️ No hay streamers configurados.\n\n*Usa `/añadir-streamer` para añadir uno.*',
                    ephemeral: true
                });
            }
            
            const platformEmojis = {
                twitch: '🎮',
                kick: '⚡',
                youtube: '📺'
            };
            
            const platformColors = {
                twitch: '#9146FF',
                kick: '#53FC18',
                youtube: '#FF0000'
            };
            
            const embed = new EmbedBuilder()
                .setTitle('📺 Streamers Configurados')
                .setColor('#5865F2')
                .setDescription(user ? `Mostrando streamers de ${user}` : `Total: **${links.length}** streamer${links.length !== 1 ? 's' : ''}`)
                .setTimestamp();
            
            links.forEach((link, index) => {
                const status = link.enabled ? '✅ Activo' : '❌ Inactivo';
                const emoji = platformEmojis[link.platform] || '📱';
                const platformName = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                
                embed.addFields({
                    name: `${emoji} ${platformName} - ${link.username}`,
                    value: `${status}\n👤 Discord: <@${link.userId}>\n📢 Canal: <#${link.notificationChannelId}>\n🆔 ID: \`${link.linkId}\``,
                    inline: false
                });
            });
            
            embed.setFooter({ 
                text: 'Las notificaciones se envían automáticamente cuando el streamer esté en directo' 
            });
            
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            console.error('Error en /lista-streamer:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al listar los streamers.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
