const { MessageFlags } = require('discord.js');
const logger = require('../../utils/logger');

async function handleInteractionCreate(interaction, context) {
    const { commands, healthSystem } = context;
    
    // Comando slash
    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        
        if (!command) {
            logger.warn(`Comando no encontrado: ${interaction.commandName}`);
            return;
        }
        
        try {
            await command.execute(interaction, context);
            healthSystem.incrementCommandCount();
            logger.info(`Comando ejecutado: ${interaction.commandName} por ${interaction.user.tag}`);
        } catch (error) {
            logger.error(`Error al ejecutar comando ${interaction.commandName}`, error);
            healthSystem.incrementErrorCount();
            
            const errorMessage = {
                content: '❌ Ocurrió un error al ejecutar este comando.',
                flags: MessageFlags.Ephemeral
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
    
    // Botones
    else if (interaction.isButton()) {
        const { handleButtonInteraction } = require('./interactions/buttons');
        await handleButtonInteraction(interaction, context);
    }
    
    // Select Menus
    else if (interaction.isStringSelectMenu() || interaction.isRoleSelectMenu()) {
        const { handleSelectInteraction } = require('./interactions/selects');
        await handleSelectInteraction(interaction, context);
    }
    
    // Modales
    else if (interaction.isModalSubmit()) {
        const { handleModalInteraction } = require('./interactions/modals');
        await handleModalInteraction(interaction, context);
    }
    
    // Autocompletado
    else if (interaction.isAutocomplete()) {
        const { handleAutocomplete } = require('./interactions/autocomplete');
        await handleAutocomplete(interaction, context);
    }
}

module.exports = { handleInteractionCreate };
