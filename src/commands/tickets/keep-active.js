const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mantener-activo')
        .setDescription('Marca el ticket como activo permanentemente (solo se puede cerrar manualmente)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction, context) {
        const channel = interaction.channel;

        // Verificar que estamos en un canal de ticket
        if (!channel.name.startsWith('ticket-')) {
            return await interaction.reply({
                content: '❌ Este comando solo puede usarse en canales de tickets.',
                ephemeral: true
            });
        }

        const { ticketInactivity } = context;

        if (!ticketInactivity) {
            return await interaction.reply({
                content: '❌ El sistema de inactividad no está disponible.',
                ephemeral: true
            });
        }

        const success = ticketInactivity.setKeepActive(channel.id, null);

        if (success) {
            await interaction.reply({
                content: `✅ Este ticket ya no se cerrará automáticamente y únicamente podrá ser cerrado mediante el botón "Cerrar Ticket".`,
                ephemeral: true
            });
            logger.info(`🔒 Ticket ${channel.name} marcado como activo PERMANENTEMENTE por ${interaction.user.tag}`);
        } else {
            await interaction.reply({
                content: '❌ No se pudo marcar este ticket como activo. Puede que no esté siendo rastreado.',
                ephemeral: true
            });
        }
    }
};
