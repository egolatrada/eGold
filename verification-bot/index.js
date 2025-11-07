const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "config.json");
let config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", async () => {
    console.log(`✅ Bot de verificación iniciado como ${client.user.tag}`);
    console.log(`🔐 Servidor configurado: ${config.guildId}`);

    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
        console.error("❌ No se encontró el servidor con el ID configurado");
        return;
    }

    if (config.existingMessageId && config.existingMessageId !== "ID_DEL_MENSAJE_AQUI") {
        await addButtonToExistingMessage();
    } else {
        await setupVerificationMessage();
    }
});

async function addButtonToExistingMessage() {
    try {
        const guild = client.guilds.cache.get(config.guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(config.channels.verification);
        if (!channel) {
            console.error("❌ Canal de verificación no encontrado");
            return;
        }

        const message = await channel.messages.fetch(config.existingMessageId);
        if (!message) {
            console.error("❌ No se encontró el mensaje con el ID proporcionado");
            return;
        }

        const button = new ButtonBuilder()
            .setCustomId("verify_user")
            .setLabel(config.messages.buttonLabel)
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        await message.edit({
            components: [row],
        });

        console.log("✅ Botón de verificación añadido al mensaje existente");
    } catch (error) {
        console.error("❌ Error al añadir botón al mensaje:", error);
    }
}

async function setupVerificationMessage() {
    try {
        const guild = client.guilds.cache.get(config.guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(config.channels.verification);
        if (!channel) {
            console.error("❌ Canal de verificación no encontrado");
            return;
        }

        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessages = messages.filter(
            (m) => m.author.id === client.user.id,
        );

        if (botMessages.size > 0) {
            console.log("✅ Mensaje de verificación ya existe");
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(config.messages.embedTitle)
            .setDescription(config.messages.embedDescription)
            .setColor(config.messages.embedColor)
            .setFooter({ text: "Strangers RP - Sistema de Verificación" })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId("verify_user")
            .setLabel(config.messages.buttonLabel)
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

client.on("guildMemberAdd", async (member) => {
    if (member.guild.id !== config.guildId) return;

    try {
        const unverifiedRoleId = config.roles.unverified;

        if (!unverifiedRoleId || unverifiedRoleId === "ID_ROL_NO_VERIFICADO") {
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
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.guild.id !== config.guildId) return;

    if (interaction.customId === "verify_user") {
        await handleVerification(interaction);
    }
});

async function handleVerification(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.member;
        const unverifiedRoleId = config.roles.unverified;
        const sinWhitelistRoleId = config.roles.sinWhitelist;

        if (!sinWhitelistRoleId || sinWhitelistRoleId === "ID_ROL_SIN_WHITELIST") {
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
                content: config.messages.alreadyVerifiedMessage,
            });
            return;
        }

        if (unverifiedRoleId && unverifiedRoleId !== "ID_ROL_NO_VERIFICADO") {
            const unverifiedRole = interaction.guild.roles.cache.get(unverifiedRoleId);
            if (unverifiedRole && member.roles.cache.has(unverifiedRoleId)) {
                await member.roles.remove(unverifiedRole);
            }
        }

        await member.roles.add(sinWhitelistRole);

        await interaction.editReply({
            content: `✅ ${config.messages.verifiedMessage}`,
        });

        console.log(`✅ Usuario verificado: ${member.user.tag} - Rol "Sin Whitelist" asignado`);
    } catch (error) {
        console.error("❌ Error al verificar usuario:", error);

        try {
            if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({
                    content: config.messages.errorMessage,
                });
            } else if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: config.messages.errorMessage,
                    ephemeral: true,
                });
            }
        } catch (replyError) {
            console.error("❌ No se pudo enviar mensaje de error:", replyError);
        }
    }
}

process.on("unhandledRejection", (error) => {
    console.error("Error no manejado:", error);
});

client.login(config.botToken);
