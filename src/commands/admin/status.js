const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

// Mapa para almacenar el contexto por mensaje (para poder actualizar)
const statusMessageContexts = new Map();

function createStatusEmbed(healthSystem) {
    const stats = healthSystem.getStats();

    const uptimeSeconds = Math.floor(stats.uptime / 1000);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const healthColor = {
        healthy: '#00FF00',
        degraded: '#FFA500',
        critical: '#FF0000'
    }[stats.health] || '#0099FF';

    const healthEmoji = {
        healthy: '✅',
        degraded: '⚠️',
        critical: '🔴'
    }[stats.health] || '❓';

    const embed = new EmbedBuilder()
        .setColor(healthColor)
        .setTitle(`${healthEmoji} Estado del Bot`)
        .addFields(
            { name: '🟢 Estado', value: stats.health.toUpperCase(), inline: true },
            { name: '📡 Ping', value: `${stats.ping}ms`, inline: true },
            { name: '💾 Memoria', value: `${stats.memory}MB`, inline: true },
            { name: '⏱️ Uptime', value: uptimeString, inline: true },
            { name: '📝 Comandos', value: stats.commandsExecuted.toString(), inline: true },
            { name: '❌ Errores', value: stats.errorCount.toString(), inline: true }
        )
        .setFooter({ text: '🔄 Presiona el botón para actualizar' })
        .setTimestamp();

    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('📊 Muestra el estado del bot'),
    
    async execute(interaction, context) {
        const { healthSystem } = context;

        // Crear botón para actualizar manualmente
        const updateButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('refresh_status')
                .setLabel('🔄 Actualizar')
                .setStyle(ButtonStyle.Primary)
        );

        // Responder efímeramente al usuario
        await interaction.reply({
            content: '✅ Estado del bot publicado',
            flags: MessageFlags.Ephemeral
        });

        // Enviar el embed público al canal
        const statusMessage = await interaction.channel.send({ 
            embeds: [createStatusEmbed(healthSystem)],
            components: [updateButton]
        });

        // Guardar el contexto para poder actualizar después
        statusMessageContexts.set(statusMessage.id, {
            healthSystem: healthSystem,
            channelId: interaction.channelId
        });
    }
};

// Exportar función para manejar el botón de actualizar
module.exports.handleRefreshStatus = async (interaction, context) => {
    const messageId = interaction.message.id;
    
    if (statusMessageContexts.has(messageId)) {
        const { healthSystem } = statusMessageContexts.get(messageId);
        
        await interaction.update({ 
            embeds: [createStatusEmbed(healthSystem)] 
        });
    } else {
        // Si no está en el map, usar el contexto actual
        await interaction.update({ 
            embeds: [createStatusEmbed(context.healthSystem)] 
        });
    }
};
