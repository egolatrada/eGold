const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('social-link')
        .setDescription('📱 Gestiona vinculaciones de redes sociales')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Añade una vinculación')
                .addStringOption(option =>
                    option.setName('plataforma')
                        .setDescription('Plataforma de red social')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Twitch', value: 'twitch' },
                            { name: 'Kick', value: 'kick' },
                            { name: 'YouTube', value: 'youtube' },
                            { name: 'Instagram', value: 'instagram' },
                            { name: 'Twitter/X', value: 'twitter' }
                        ))
                .addStringOption(option =>
                    option.setName('link')
                        .setDescription('URL del perfil o canal')
                        .setRequired(true))
                .addUserOption(option =>
                    option.setName('discord')
                        .setDescription('Usuario de Discord')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde anunciar')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Elimina una vinculación')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID de la vinculación')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lista todas las vinculaciones')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Filtrar por usuario')
                        .setRequired(false))),
    
    async execute(interaction, context) {
        const subcommand = interaction.options.getSubcommand();
        const { socialLinksSystem } = context;
        
        if (!socialLinksSystem) {
            return await interaction.reply({
                content: '❌ El sistema de redes sociales no está disponible.',
                ephemeral: true
            });
        }
        
        try {
            if (subcommand === 'add') {
                const platform = interaction.options.getString('plataforma');
                const link = interaction.options.getString('link');
                const user = interaction.options.getUser('discord');
                const channel = interaction.options.getChannel('canal');
                
                const result = socialLinksSystem.addLink(
                    user.id,
                    platform,
                    link,
                    channel.id
                );
                
                if (result.success) {
                    await interaction.reply({
                        content: `✅ Vinculación añadida correctamente.\n\n**Usuario:** ${user}\n**Plataforma:** ${platform}\n**Link:** ${link}\n**Canal de anuncios:** ${channel}\n**ID:** \`${result.linkId}\``,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `❌ Error: ${result.error}`,
                        ephemeral: true
                    });
                }
            }
            else if (subcommand === 'remove') {
                const linkId = interaction.options.getString('id');
                
                const result = socialLinksSystem.removeLink(linkId);
                
                if (result.success) {
                    await interaction.reply({
                        content: `✅ Vinculación eliminada correctamente.`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `❌ Error: ${result.error}`,
                        ephemeral: true
                    });
                }
            }
            else if (subcommand === 'list') {
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
                            ? `ℹ️ ${user} no tiene vinculaciones registradas.`
                            : 'ℹ️ No hay vinculaciones registradas.',
                        ephemeral: true
                    });
                }
                
                const linksList = links.map(l => {
                    const status = l.enabled ? '✅' : '❌';
                    return `${status} **${l.platform}** - <@${l.userId}>\n└ Link: ${l.username}\n└ Canal: <#${l.notificationChannelId}>\n└ ID: \`${l.linkId}\``;
                }).join('\n\n');
                
                await interaction.reply({
                    content: `📱 **Vinculaciones de Redes Sociales**${user ? ` de ${user}` : ''}:\n\n${linksList}`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error en /social-link:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al procesar el comando.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
