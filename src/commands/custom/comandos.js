const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comandos')
        .setDescription('📋 Muestra lista de comandos personalizados disponibles'),
    
    async execute(interaction, context) {
        // Delegar al sistema de comandos personalizados
        await context.customCommandsSystem.handleListCommand(interaction);
    }
};
