const { EmbedBuilder, Colors } = require("discord.js");
const fs = require("fs");

class SocialLinksSystem {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.dataFile = "./social-links-data.json";
        this.links = new Map();
        this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, "utf-8"));
                this.links = new Map(Object.entries(data.links || {}));
                console.log(`📱 ${this.links.size} vinculaciones de redes sociales cargadas`);
            }
        } catch (error) {
            console.error("Error al cargar vinculaciones de redes sociales:", error);
        }
    }

    saveData() {
        try {
            const data = {
                links: Object.fromEntries(this.links),
                lastUpdate: Date.now()
            };
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error al guardar vinculaciones de redes sociales:", error);
        }
    }

    getSupportedPlatforms() {
        return {
            twitch: { name: "Twitch", icon: "🎮", color: "#9146FF", urlPattern: "twitch.tv/" },
            kick: { name: "Kick", icon: "⚡", color: "#53FC18", urlPattern: "kick.com/" },
            youtube: { name: "YouTube", icon: "📺", color: "#FF0000", urlPattern: "youtube.com/" },
            instagram: { name: "Instagram", icon: "📷", color: "#E4405F", urlPattern: "instagram.com/" },
            twitter: { name: "X (Twitter)", icon: "🐦", color: "#1DA1F2", urlPattern: "twitter.com/" },
            x: { name: "X (Twitter)", icon: "✖️", color: "#000000", urlPattern: "x.com/" },
            threads: { name: "Threads", icon: "🧵", color: "#000000", urlPattern: "threads.net/" },
            tiktok: { name: "TikTok", icon: "🎵", color: "#000000", urlPattern: "tiktok.com/" },
            facebook: { name: "Facebook", icon: "👥", color: "#1877F2", urlPattern: "facebook.com/" },
            discord: { name: "Discord", icon: "💬", color: "#5865F2", urlPattern: "discord.gg/" }
        };
    }

    addLink(userId, platform, username, notificationChannel) {
        const platforms = this.getSupportedPlatforms();
        
        if (!platforms[platform.toLowerCase()]) {
            return { success: false, error: "Plataforma no soportada" };
        }

        const linkId = `${userId}_${platform}_${Date.now()}`;
        
        this.links.set(linkId, {
            userId,
            platform: platform.toLowerCase(),
            username,
            notificationChannelId: notificationChannel,
            createdAt: Date.now(),
            enabled: true
        });

        this.saveData();
        return { success: true, linkId };
    }

    removeLink(linkId) {
        if (!this.links.has(linkId)) {
            return { success: false, error: "Vinculación no encontrada" };
        }

        this.links.delete(linkId);
        this.saveData();
        return { success: true };
    }

    getUserLinks(userId) {
        const userLinks = [];
        for (const [linkId, link] of this.links.entries()) {
            if (link.userId === userId) {
                userLinks.push({ linkId, ...link });
            }
        }
        return userLinks;
    }

    getAllLinks() {
        return Array.from(this.links.entries()).map(([linkId, link]) => ({
            linkId,
            ...link
        }));
    }

    toggleLink(linkId) {
        const link = this.links.get(linkId);
        if (!link) {
            return { success: false, error: "Vinculación no encontrada" };
        }

        link.enabled = !link.enabled;
        this.links.set(linkId, link);
        this.saveData();
        
        return { success: true, enabled: link.enabled };
    }

    async sendNotification(linkId, notificationData) {
        const link = this.links.get(linkId);
        if (!link || !link.enabled) return;

        const platforms = this.getSupportedPlatforms();
        const platformInfo = platforms[link.platform];

        try {
            const channel = await this.client.channels.fetch(link.notificationChannelId);
            if (!channel || !channel.isTextBased()) return;

            const user = await this.client.users.fetch(link.userId);

            const embed = new EmbedBuilder()
                .setColor(platformInfo.color)
                .setAuthor({
                    name: `${platformInfo.icon} ${platformInfo.name}`,
                    iconURL: user.displayAvatarURL()
                })
                .setTitle(notificationData.title || "Nueva actividad")
                .setDescription(notificationData.description || "")
                .addFields(
                    { name: "Usuario", value: `${user} (@${link.username})`, inline: true },
                    { name: "Plataforma", value: platformInfo.name, inline: true }
                )
                .setTimestamp();

            if (notificationData.url) {
                embed.setURL(notificationData.url);
            }

            if (notificationData.thumbnail) {
                embed.setThumbnail(notificationData.thumbnail);
            }

            if (notificationData.image) {
                embed.setImage(notificationData.image);
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Error al enviar notificación de ${link.platform}:`, error);
        }
    }
}

module.exports = SocialLinksSystem;
