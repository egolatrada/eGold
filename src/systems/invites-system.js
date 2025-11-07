const { EmbedBuilder, Colors } = require("discord.js");
const messages = require("../../messages.json");
const fs = require("fs");
const path = require("path");

class InvitesSystem {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.messages = messages.logs.invites;
        this.inviteCache = new Map();
        this.inviteMessages = new Map();
        this.cacheFilePath = path.join(__dirname, "invite-cache.json");
        this.loadCacheFromFile();
        this.setupEventListeners();
    }

    loadCacheFromFile() {
        try {
            if (fs.existsSync(this.cacheFilePath)) {
                const data = JSON.parse(fs.readFileSync(this.cacheFilePath, "utf8"));
                this.inviteCache = new Map(Object.entries(data.inviteCache || {}).map(([guildId, invites]) => [
                    guildId,
                    new Map(Object.entries(invites))
                ]));
                this.inviteMessages = new Map(Object.entries(data.inviteMessages || {}));
                console.log("📦 Caché de invitaciones cargado desde archivo");
            }
        } catch (error) {
            console.log("⚠️ Error al cargar caché de invitaciones:", error.message);
        }
    }

    saveCacheToFile() {
        try {
            const data = {
                inviteCache: Object.fromEntries(
                    Array.from(this.inviteCache.entries()).map(([guildId, invites]) => [
                        guildId,
                        Object.fromEntries(invites)
                    ])
                ),
                inviteMessages: Object.fromEntries(this.inviteMessages)
            };
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.log("⚠️ Error al guardar caché de invitaciones:", error.message);
        }
    }
    
    isAllowedGuild(guildId) {
        // Si no hay restricción, permitir todos
        if (!this.config.allowedGuildId) return true;
        // Si hay restricción, solo permitir el servidor específico
        return guildId === this.config.allowedGuildId;
    }

    setupEventListeners() {
        if (!this.config.logs || !this.config.logs.enabled || !this.config.logs.channels.invites) {
            console.log("📨 Logs de invitaciones desactivados");
            return;
        }

        console.log("📨 Iniciando logs de invitaciones...");

        if (this.client.isReady()) {
            this.cacheInvites();
        } else {
            this.client.on("ready", () => this.cacheInvites());
        }
        
        this.client.on("inviteCreate", (invite) => {
            this.handleInviteCreate(invite);
        });
        this.client.on("inviteDelete", (invite) => {
            this.handleInviteDelete(invite);
        });
        this.client.on("guildMemberAdd", (member) => {
            this.handleMemberJoin(member);
        });

        console.log("✅ Logs de invitaciones iniciados correctamente");
    }

    async cacheInvites() {
        for (const guild of this.client.guilds.cache.values()) {
            // Si hay restricción de servidor, solo cachear invitaciones del servidor permitido
            if (!this.isAllowedGuild(guild.id)) continue;
            
            try {
                const invites = await guild.invites.fetch();
                this.inviteCache.set(guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));
                console.log(`✅ ${invites.size} invitaciones cacheadas para ${guild.name}`);
            } catch (error) {
                console.log(`❌ No se pudieron obtener invitaciones del servidor ${guild.name}:`, error.message);
            }
        }
        this.saveCacheToFile();
    }

    async handleInviteCreate(invite) {
        if (!invite.guild) return;
        if (!this.isAllowedGuild(invite.guild.id)) return;
        if (!this.config.logs.channels.invites) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(this.messages.created)
            .addFields(
                { name: "👤 Creado por", value: `${invite.inviter}`, inline: true },
                { name: "📅 Fecha", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: "🔗 Código", value: `\`${invite.code}\``, inline: true }
            )
            .setTimestamp();

        if (invite.maxUses) {
            embed.addFields({ name: "📊 Usos máximos", value: `${invite.maxUses}`, inline: true });
        }

        if (invite.expiresTimestamp) {
            embed.addFields({ name: "⏰ Expira", value: `<t:${Math.floor(invite.expiresTimestamp / 1000)}:R>`, inline: true });
        }

        if (invite.channel) {
            embed.addFields({ name: "📍 Canal", value: `${invite.channel}`, inline: true });
        }

        try {
            const channel = await this.client.channels.fetch(this.config.logs.channels.invites);
            const message = await channel.send({ embeds: [embed] });
            
            this.inviteMessages.set(invite.code, message.id);
            
            if (!this.inviteCache.has(invite.guild.id)) {
                this.inviteCache.set(invite.guild.id, new Map());
            }
            this.inviteCache.get(invite.guild.id).set(invite.code, 0);
            this.saveCacheToFile();
        } catch (error) {
            console.log("Error al enviar log de invitación:", error);
        }
    }

    async handleInviteDelete(invite) {
        this.inviteCache.get(invite.guild.id)?.delete(invite.code);
        this.inviteMessages.delete(invite.code);
        this.saveCacheToFile();
    }

    async handleMemberJoin(member) {
        if (!this.config.logs.channels.invites) return;

        try {
            const newInvites = await member.guild.invites.fetch();
            const oldInvites = this.inviteCache.get(member.guild.id);

            if (!oldInvites) {
                return;
            }

            const usedInvite = newInvites.find(inv => {
                const oldUses = oldInvites.get(inv.code) || 0;
                return inv.uses > oldUses;
            });

            if (usedInvite) {
                oldInvites.set(usedInvite.code, usedInvite.uses);

                try {
                    const channel = await this.client.channels.fetch(this.config.logs.channels.invites);
                    const messageId = this.inviteMessages.get(usedInvite.code);

                    const embed = new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle(this.messages.used
                            .replace("{user}", `${member.user.tag}`)
                            .replace("{code}", `\`${usedInvite.code}\``)
                            .replace("{uses}", usedInvite.uses)
                        )
                        .addFields(
                            { name: "👤 Usuario", value: `${member.user}`, inline: true },
                            { name: "🆔 ID", value: member.id, inline: true },
                            { name: "📅 Se unió", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                            { name: "🔗 Código", value: `\`${usedInvite.code}\``, inline: true },
                            { name: "📊 Total de usos", value: `${usedInvite.uses}`, inline: true }
                        )
                        .setThumbnail(member.user.displayAvatarURL())
                        .setTimestamp();

                    if (usedInvite.inviter) {
                        embed.addFields({ name: "👤 Invitación creada por", value: `${usedInvite.inviter}`, inline: true });
                    }

                    if (messageId) {
                        try {
                            const message = await channel.messages.fetch(messageId);
                            let thread;
                            if (message.hasThread) {
                                thread = message.thread;
                            } else {
                                thread = await message.startThread({
                                    name: `Usos de ${usedInvite.code}`,
                                    autoArchiveDuration: 60,
                                });
                            }
                            await thread.send({ embeds: [embed] });
                        } catch (error) {
                            console.log("⚠️ No se pudo crear hilo, enviando mensaje directo:", error.message);
                            await channel.send({ embeds: [embed] });
                        }
                    } else {
                        await channel.send({ embeds: [embed] });
                    }
                } catch (error) {
                    console.log("❌ Error al enviar log de uso de invitación:", error.message);
                }
            }

            this.inviteCache.set(member.guild.id, new Map(newInvites.map(inv => [inv.code, inv.uses])));
            this.saveCacheToFile();
        } catch (error) {
            console.log("Error al detectar invitación usada:", error);
        }
    }
}

module.exports = InvitesSystem;
