const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crear-comando')
        .setDescription('⚡ Gestiona comandos personalizados')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('nuevo')
                .setDescription('Crea un nuevo comando personalizado'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('editar')
                .setDescription('Edita un comando existente')
                .addStringOption(option =>
                    option.setName('comando')
                        .setDescription('Nombre del comando a editar')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('eliminar')
                .setDescription('Elimina un comando')
                .addStringOption(option =>
                    option.setName('comando')
                        .setDescription('Nombre del comando a eliminar')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('listar')
                .setDescription('Lista todos los comandos personalizados')),
    
    async execute(interaction, context) {
        // Delegar al sistema de comandos personalizados
        await context.customCommandsSystem.handleSlashCommand(interaction);
    }
};
