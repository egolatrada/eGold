const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

class VerificationSystem {
    constructor(client, config) {
        this.client = client;
        this.config = config.verification;
        this.allowedGuildId = config.allowedGuildId;
    }

    isAllowedGuild(guildId) {
        if (!this.allowedGuildId) return true;
        return guildId === this.allowedGuildId;
    }

    init() {
        if (!this.config.enabled) {
            console.log("⚠️ Sistema de verificación desactivado");
            return;
        }

        this.client.on("guildMemberAdd", (member) => this.handleMemberJoin(member));
        this.client.on("interactionCreate", (interaction) => this.handleInteraction(interaction));

        console.log("✅ Sistema de verificación iniciado correctamente");
    }

    async handleMemberJoin(member) {
        if (!this.isAllowedGuild(member.guild.id)) return;

        try {
            const unverifiedRoleId = this.config.roles.unverified;

            if (!unverifiedRoleId) {
                console.error("❌ Rol de no verificado no configurado");
                return;
            }

            const unverifiedRole = member.guild.roles.cache.get(unverifiedRoleId);
            if (!unverifiedRole) {
                console.error("❌ Rol de no verificado no encontrado");
                return;
            }

            await member.roles.add(unverifiedRole);
            console.log(`✅ Rol "No Verificado" asignado a: ${member.user.tag}`);
        } catch (error) {
            console.error(`❌ Error al asignar rol a ${member.user.tag}:`, error);
        }
    }

    async handleInteraction(interaction) {
        if (!interaction.isButton()) return;
        if (!this.isAllowedGuild(interaction.guild.id)) return;
        if (interaction.customId !== "verify_user") return;

        await this.handleVerification(interaction);
    }

    async handleVerification(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const member = interaction.member;
            const unverifiedRoleId = this.config.roles.unverified;
            const sinWhitelistRoleId = this.config.roles.sinWhitelist;

            if (!sinWhitelistRoleId) {
                await interaction.editReply({
                    content:
                        "❌ El rol de 'Sin Whitelist' no está configurado correctamente. Contacta a un administrador.",
                });
                return;
            }

            const sinWhitelistRole = interaction.guild.roles.cache.get(sinWhitelistRoleId);
            if (!sinWhitelistRole) {
                await interaction.editReply({
                    content:
                        "❌ No se encontró el rol de 'Sin Whitelist'. Contacta a un administrador.",
                });
                return;
            }

            if (member.roles.cache.has(sinWhitelistRoleId)) {
                await interaction.editReply({
                    content: this.config.messages.alreadyVerifiedMessage,
                });
                return;
            }

            if (unverifiedRoleId) {
                const unverifiedRole = interaction.guild.roles.cache.get(unverifiedRoleId);
                if (unverifiedRole && member.roles.cache.has(unverifiedRoleId)) {
                    await member.roles.remove(unverifiedRole);
                }
            }

            await member.roles.add(sinWhitelistRole);

            await interaction.editReply({
                content: `✅ ${this.config.messages.verifiedMessage}`,
            });

            console.log(`✅ Usuario verificado: ${member.user.tag} - Rol "Sin Whitelist" asignado`);
        } catch (error) {
            console.error("❌ Error al verificar usuario:", error);

            try {
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({
                        content: this.config.messages.errorMessage,
                    });
                } else if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: this.config.messages.errorMessage,
                        ephemeral: true,
                    });
                }
            } catch (replyError) {
                console.error("❌ No se pudo enviar mensaje de error:", replyError);
            }
        }
    }

    async setupVerificationMessage() {
        if (!this.config.enabled) return;
        if (!this.config.channelId) {
            console.error("❌ channelId no configurado en verification");
            return;
        }

        try {
            const channel = await this.client.channels.fetch(this.config.channelId).catch(() => null);
            if (!channel) {
                console.error("❌ Canal de verificación no encontrado");
                return;
            }

            if (this.config.existingMessageId && this.config.existingMessageId !== "ID_DEL_MENSAJE_AQUI") {
                await this.addButtonToExistingMessage(channel);
                return;
            }

            const messages = await channel.messages.fetch({ limit: 10 });
            const botMessages = messages.filter(
                (m) =>
                    m.author.id === this.client.user.id &&
                    m.embeds.length > 0 &&
                    m.embeds[0].title === this.config.messages.embedTitle
            );

            if (botMessages.size > 0) {
                console.log("✅ Mensaje de verificación ya existe");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(this.config.messages.embedTitle)
                .setDescription(this.config.messages.embedDescription)
                .setColor(this.config.messages.embedColor)
                .setFooter({ text: "Strangers RP - Sistema de Verificación" })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId("verify_user")
                .setLabel(this.config.messages.buttonLabel)
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await channel.send({
                embeds: [embed],
                components: [row],
            });

            console.log("✅ Mensaje de verificación creado correctamente");
        } catch (error) {
            console.error("❌ Error al crear mensaje de verificación:", error);
        }
    }

    async addButtonToExistingMessage(channel) {
        try {
            const message = await channel.messages.fetch(this.config.existingMessageId);
            if (!message) {
                console.error("❌ No se encontró el mensaje con el ID proporcionado");
                return;
            }

            const button = new ButtonBuilder()
                .setCustomId("verify_user")
                .setLabel(this.config.messages.buttonLabel)
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await message.edit({ components: [row] });

            console.log("✅ Botón de verificación agregado al mensaje existente");
        } catch (error) {
            console.error("❌ Error al agregar botón al mensaje:", error);
        }
    }
}

module.exports = VerificationSystem;
