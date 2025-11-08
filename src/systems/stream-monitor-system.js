const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

class StreamMonitorSystem {
    constructor(client, config, socialLinksSystem) {
        this.client = client;
        this.config = config;
        this.socialLinksSystem = socialLinksSystem;
        this.activeStreams = new Map();
        this.checkInterval = 2 * 60 * 1000;
        this.intervalId = null;
        this.cacheFile = "./stream-cache.json";
        
        this.loadCache();
    }

    loadCache() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                const data = JSON.parse(fs.readFileSync(this.cacheFile, "utf-8"));
                this.activeStreams = new Map(Object.entries(data.activeStreams || {}));
                console.log(`📺 ${this.activeStreams.size} streams activos en caché`);
            }
        } catch (error) {
            console.error("Error al cargar caché de streams:", error);
        }
    }

    saveCache() {
        try {
            const data = {
                activeStreams: Object.fromEntries(this.activeStreams),
                lastUpdate: Date.now()
            };
            fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error al guardar caché de streams:", error);
        }
    }

    start() {
        console.log("🎥 Iniciando sistema de monitoreo de streams...");
        
        this.checkAllStreams();
        
        this.intervalId = setInterval(() => {
            this.checkAllStreams();
        }, this.checkInterval);
        
        console.log(`✅ Sistema de monitoreo de streams iniciado (verificación cada ${this.checkInterval / 1000 / 60} minutos)`);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("🛑 Sistema de monitoreo de streams detenido");
        }
    }

    async checkAllStreams() {
        const links = this.socialLinksSystem.getAllLinks();
        const enabledLinks = links.filter(link => link.enabled);
        
        if (enabledLinks.length === 0) {
            return;
        }
        
        console.log(`🔍 Verificando ${enabledLinks.length} streamer(s)...`);
        
        for (const link of enabledLinks) {
            try {
                await this.checkStream(link);
            } catch (error) {
                console.error(`Error al verificar stream de ${link.username} en ${link.platform}:`, error);
            }
        }
    }

    async checkStream(link) {
        const { platform, username, linkId } = link;
        
        let isLive = false;
        let streamData = null;
        
        switch (platform) {
            case 'twitch':
                const twitchResult = await this.checkTwitch(username);
                isLive = twitchResult.isLive;
                streamData = twitchResult.data;
                break;
            
            case 'youtube':
                const youtubeResult = await this.checkYouTube(username);
                isLive = youtubeResult.isLive;
                streamData = youtubeResult.data;
                break;
            
            case 'kick':
                const kickResult = await this.checkKick(username);
                isLive = kickResult.isLive;
                streamData = kickResult.data;
                break;
        }
        
        const wasLive = this.activeStreams.has(linkId);
        
        if (isLive && !wasLive) {
            this.activeStreams.set(linkId, {
                startedAt: Date.now(),
                notified: true,
                ...streamData
            });
            this.saveCache();
            
            await this.sendLiveNotification(link, streamData);
            console.log(`🔴 ${username} está EN VIVO en ${platform}`);
        } 
        else if (!isLive && wasLive) {
            this.activeStreams.delete(linkId);
            this.saveCache();
            console.log(`⚫ ${username} terminó el stream en ${platform}`);
        }
    }

    async checkTwitch(username) {
        const clientId = process.env.TWITCH_CLIENT_ID;
        const accessToken = process.env.TWITCH_ACCESS_TOKEN;
        
        if (!clientId || !accessToken) {
            console.warn("⚠️ Twitch API no configurada. Necesitas TWITCH_CLIENT_ID y TWITCH_ACCESS_TOKEN");
            return { isLive: false, data: null };
        }
        
        try {
            const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!userResponse.ok) {
                console.error(`Error al obtener usuario de Twitch: ${userResponse.status}`);
                return { isLive: false, data: null };
            }
            
            const userData = await userResponse.json();
            if (!userData.data || userData.data.length === 0) {
                return { isLive: false, data: null };
            }
            
            const userId = userData.data[0].id;
            
            const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!streamResponse.ok) {
                console.error(`Error al obtener stream de Twitch: ${streamResponse.status}`);
                return { isLive: false, data: null };
            }
            
            const streamData = await streamResponse.json();
            
            if (streamData.data && streamData.data.length > 0) {
                const stream = streamData.data[0];
                return {
                    isLive: true,
                    data: {
                        title: stream.title,
                        game: stream.game_name,
                        viewers: stream.viewer_count,
                        thumbnail: stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
                        url: `https://twitch.tv/${username}`
                    }
                };
            }
            
            return { isLive: false, data: null };
        } catch (error) {
            console.error(`Error en checkTwitch para ${username}:`, error);
            return { isLive: false, data: null };
        }
    }

    async checkYouTube(channelId) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        
        if (!apiKey) {
            console.warn("⚠️ YouTube API no configurada. Necesitas YOUTUBE_API_KEY");
            return { isLive: false, data: null };
        }
        
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
            );
            
            if (!response.ok) {
                console.error(`Error al obtener stream de YouTube: ${response.status}`);
                return { isLive: false, data: null };
            }
            
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const stream = data.items[0];
                return {
                    isLive: true,
                    data: {
                        title: stream.snippet.title,
                        thumbnail: stream.snippet.thumbnails.high?.url || stream.snippet.thumbnails.default.url,
                        url: `https://youtube.com/watch?v=${stream.id.videoId}`
                    }
                };
            }
            
            return { isLive: false, data: null };
        } catch (error) {
            console.error(`Error en checkYouTube para ${channelId}:`, error);
            return { isLive: false, data: null };
        }
    }

    async checkKick(username) {
        try {
            const response = await fetch(`https://kick.com/api/v2/channels/${username}`);
            
            if (!response.ok) {
                return { isLive: false, data: null };
            }
            
            const data = await response.json();
            
            if (data.livestream && data.livestream.is_live) {
                return {
                    isLive: true,
                    data: {
                        title: data.livestream.session_title,
                        thumbnail: data.livestream.thumbnail?.url,
                        viewers: data.livestream.viewer_count,
                        url: `https://kick.com/${username}`
                    }
                };
            }
            
            return { isLive: false, data: null };
        } catch (error) {
            console.error(`Error en checkKick para ${username}:`, error);
            return { isLive: false, data: null };
        }
    }

    async sendLiveNotification(link, streamData) {
        try {
            const channel = await this.client.channels.fetch(link.notificationChannelId);
            if (!channel || !channel.isTextBased()) return;

            const user = await this.client.users.fetch(link.userId);
            
            const platforms = this.socialLinksSystem.getSupportedPlatforms();
            const platformInfo = platforms[link.platform];
            
            const embed = new EmbedBuilder()
                .setColor(platformInfo.color)
                .setAuthor({
                    name: `${platformInfo.icon} ${platformInfo.name}`,
                    iconURL: user.displayAvatarURL()
                })
                .setTitle(`🔴 ${link.username} está EN VIVO!`)
                .setURL(streamData.url)
                .addFields(
                    { name: "👤 Streamer", value: `${user}`, inline: true },
                    { name: "📺 Plataforma", value: platformInfo.name, inline: true }
                )
                .setTimestamp();
            
            if (streamData.title) {
                embed.setDescription(`**${streamData.title}**`);
            }
            
            if (streamData.game) {
                embed.addFields({ name: "🎮 Jugando", value: streamData.game, inline: true });
            }
            
            if (streamData.viewers !== undefined) {
                embed.addFields({ name: "👥 Espectadores", value: streamData.viewers.toString(), inline: true });
            }
            
            if (streamData.thumbnail) {
                embed.setImage(streamData.thumbnail);
            }
            
            await channel.send({
                embeds: [embed]
            });
            
        } catch (error) {
            console.error(`Error al enviar notificación de stream:`, error);
        }
    }
}

module.exports = StreamMonitorSystem;
