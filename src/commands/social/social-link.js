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
        // Delegar al sistema de social links
        const subcommand = interaction.options.getSubcommand();
        const { socialLinksSystem } = context;
        
        // TODO: Implementar handlers por subcommand
        await interaction.reply({
            content: '⚠️ Comando en proceso de migración. Usa el comando antiguo por ahora.',
            ephemeral: true
        });
    }
};
