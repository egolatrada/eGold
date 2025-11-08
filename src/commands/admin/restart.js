const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const ALLOWED_ROLE_ID = '1425955458526740540'; // Rol Fundador
const ALLOWED_USER_ID = '1064937728896159814'; // egolatrada

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

        console.log('🔄 Reinicio manual solicitado por', interaction.user.tag);
        setTimeout(() => process.exit(0), 1000);
    }
};
