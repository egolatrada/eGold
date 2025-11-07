const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donar')
        .setDescription('💖 Información sobre donaciones al proyecto'),
    
    async execute(interaction, context) {
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('💖 Apoya el Proyecto')
            .setDescription(
                '¡Gracias por usar nuestro bot! Tu apoyo es muy valioso y nos ayuda a seguir mejorando y manteniendo este proyecto.\n\n' +
                'Si te gusta el bot y quieres contribuir al desarrollo, puedes hacer una donación para ayudar a cubrir los costos de servidor y desarrollo continuo.'
            )
            .addFields(
                {
                    name: '✨ ¿Por qué donar?',
                    value: '• Mantenimiento 24/7 del bot\n• Nuevas funcionalidades\n• Mejoras constantes\n• Soporte dedicado',
                    inline: false
                },
                {
                    name: '🎁 Cada contribución cuenta',
                    value: 'No importa el monto, cada donación nos ayuda a seguir adelante y ofrecerte un mejor servicio.',
                    inline: false
                },
                {
                    name: '💌 Información de donación',
                    value: 'Para más información sobre cómo donar, contacta con los administradores del servidor.',
                    inline: false
                }
            )
            .setFooter({ text: '¡Gracias por tu apoyo! 💝' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
};
