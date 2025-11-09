const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ALLOWED_ROLE_ID = '1425955458526740540'; // Rol Fundador
const ALLOWED_USER_ID = '1064937728896159814'; // egolatrada
const RESTART_DATA_PATH = path.join(__dirname, '../../data/restart-pending.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('🔧 [ADMIN] Reinicia el bot (solo fundadores)'),
    
    async execute(interaction, context) {
        // Verificar si el usuario tiene el rol de fundador o es egolatrada
        const hasFounderRole = interaction.member.roles.cache.has(ALLOWED_ROLE_ID);
        const isOwner = interaction.user.id === ALLOWED_USER_ID;

        if (!hasFounderRole && !isOwner) {
            return interaction.reply({
                content: '❌ No tienes permisos para usar este comando. Solo los fundadores pueden reiniciar el bot.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: '🔄 Reiniciando el bot...',
            flags: MessageFlags.Ephemeral
        });

        // Guardar información del reinicio para enviar confirmación después
        const restartData = {
            channelId: interaction.channelId,
            userId: interaction.user.id,
            username: interaction.user.tag,
            timestamp: Date.now()
        };

        try {
            fs.writeFileSync(RESTART_DATA_PATH, JSON.stringify(restartData, null, 2));
            console.log('🔄 Reinicio manual solicitado por', interaction.user.tag);
            console.log('📝 Datos de reinicio guardados para confirmación');
        } catch (error) {
            console.error('❌ Error al guardar datos de reinicio:', error);
        }

        setTimeout(() => process.exit(0), 1000);
    }
};
