const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { config } = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bienvenida-editar')
        .setDescription('✏️ [DIRECTIVA] Editar configuración de bienvenidas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde se enviarán las bienvenidas')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Mensaje de bienvenida (variables: {usuario}, {nombre}, {servidor}, {miembros})')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('imagen')
                .setDescription('URL de imagen de fondo para la bienvenida')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Color del embed en hexadecimal (ej: #5865F2)')
                .setRequired(false)),
    
    async execute(interaction, context) {
        const directivaRoleId = config.directivaRoleId;

        if (directivaRoleId && !interaction.member.roles.cache.has(directivaRoleId)) {
            return await interaction.reply({
                content: '❌ Solo el rol de **Directiva** puede editar el sistema de bienvenidas.',
                ephemeral: true
            });
        }

        const welcomeSystem = interaction.client.welcomeSystem;
        if (!welcomeSystem) {
            return await interaction.reply({
                content: '❌ El sistema de bienvenidas no está disponible.',
                ephemeral: true
            });
        }

        const canal = interaction.options.getChannel('canal');
        const mensaje = interaction.options.getString('mensaje');
        const imagen = interaction.options.getString('imagen');
        const color = interaction.options.getString('color');

        if (!canal && !mensaje && !imagen && !color) {
            return await interaction.reply({
                content: '❌ Debes especificar al menos un parámetro para editar.',
                ephemeral: true
            });
        }

        if (canal && !canal.isTextBased()) {
            return await interaction.reply({
                content: '❌ El canal debe ser un canal de texto.',
                ephemeral: true
            });
        }

        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            return await interaction.reply({
                content: '❌ El color debe estar en formato hexadecimal (ej: #5865F2).',
                ephemeral: true
            });
        }

        if (imagen) {
            try {
                const url = new URL(imagen);
                if (!url.protocol.match(/^https?:$/)) {
                    return await interaction.reply({
                        content: '❌ La URL de la imagen debe usar protocolo HTTP o HTTPS.',
                        ephemeral: true
                    });
                }
            } catch (error) {
                return await interaction.reply({
                    content: '❌ La URL de la imagen no es válida.',
                    ephemeral: true
                });
            }
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const updates = {};
            
            if (canal) updates.channel_id = canal.id;
            if (mensaje) updates.message = mensaje;
            if (imagen) updates.image_url = imagen;
            if (color) updates.embed_color = color;

            await welcomeSystem.updateConfig(interaction.guildId, updates);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Configuración de Bienvenidas Actualizada')
                .setDescription('Los siguientes parámetros han sido actualizados:')
                .setTimestamp();

            if (canal) {
                embed.addFields({ 
                    name: '📢 Canal de Bienvenidas', 
                    value: `${canal}`, 
                    inline: true 
                });
            }

            if (mensaje) {
                embed.addFields({ 
                    name: '💬 Mensaje', 
                    value: `\`\`\`${mensaje.substring(0, 1000)}\`\`\``, 
                    inline: false 
                });
                embed.addFields({
                    name: '📝 Variables disponibles',
                    value: '`{usuario}` - Mención del usuario\n`{nombre}` - Nombre del usuario\n`{tag}` - Tag completo\n`{servidor}` - Nombre del servidor\n`{miembros}` - Cantidad de miembros\n`{id}` - ID del usuario',
                    inline: false
                });
            }

            if (imagen) {
                embed.addFields({ 
                    name: '🖼️ Imagen de Fondo', 
                    value: `[Ver imagen](${imagen})`, 
                    inline: true 
                });
            }

            if (color) {
                embed.addFields({ 
                    name: '🎨 Color del Embed', 
                    value: color, 
                    inline: true 
                });
            }

            embed.addFields({
                name: 'ℹ️ Avatar del Usuario',
                value: 'El avatar del usuario se mostrará automáticamente sobre la imagen de fondo',
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });

            logger.info(`✏️ ${interaction.user.tag} editó la configuración de bienvenidas`);

        } catch (error) {
            logger.error('Error al editar configuración de bienvenidas', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al actualizar la configuración. Por favor, inténtalo de nuevo.'
            });
        }
    }
};
