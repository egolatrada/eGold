// Sistema de monitoreo de redes sociales (YouTube, TikTok, Twitter)
const fs = require('fs').promises;
const path = require('path');
const { EmbedBuilder } = require('discord.js');

class SocialMediaMonitorSystem {
    constructor(client) {
        this.client = client;
        this.dataFile = path.join(__dirname, '../../data/social-media-accounts.json');
        this.accounts = [];
        this.lastChecked = new Map();
        this.checkInterval = 2 * 60 * 1000; // 2 minutos
        this.notificationChannelId = '1427179199336284210';
    }

    async init() {
        await this.loadAccounts();
        this.startMonitoring();
        console.log('✅ Sistema de monitoreo de redes sociales iniciado correctamente');
    }

    async loadAccounts() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf-8');
            this.accounts = JSON.parse(data);
            console.log(`📱 ${this.accounts.length} cuenta(s) de redes sociales cargadas`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.accounts = [];
                await this.saveAccounts();
            } else {
                console.error('Error al cargar cuentas de redes sociales:', error);
                this.accounts = [];
            }
        }
    }

    async saveAccounts() {
        try {
            const dir = path.dirname(this.dataFile);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(this.dataFile, JSON.stringify(this.accounts, null, 2));
        } catch (error) {
            console.error('Error al guardar cuentas de redes sociales:', error);
        }
    }

    addAccount(platform, username, url) {
        const accountId = `${platform}_${username.toLowerCase()}`;
        
        const existingIndex = this.accounts.findIndex(acc => acc.id === accountId);
        if (existingIndex !== -1) {
            return { success: false, error: 'Esta cuenta ya está siendo monitoreada' };
        }

        const account = {
            id: accountId,
            platform,
            username,
            url,
            addedAt: new Date().toISOString()
        };

        this.accounts.push(account);
        this.saveAccounts();

        return { success: true, account };
    }

    removeAccount(accountId) {
        const index = this.accounts.findIndex(acc => acc.id === accountId);
        if (index === -1) {
            return { success: false, error: 'Cuenta no encontrada' };
        }

        const removed = this.accounts.splice(index, 1)[0];
        this.saveAccounts();
        this.lastChecked.delete(accountId);

        return { success: true, account: removed };
    }

    getAllAccounts() {
        return this.accounts;
    }

    startMonitoring() {
        console.log('🎥 Iniciando monitoreo de redes sociales...');
        console.log(`🔍 Verificando ${this.accounts.length} cuenta(s)...`);
        
        setInterval(async () => {
            await this.checkAllAccounts();
        }, this.checkInterval);

        // Primera verificación inmediata
        setTimeout(() => this.checkAllAccounts(), 5000);
    }

    async checkAllAccounts() {
        for (const account of this.accounts) {
            try {
                await this.checkAccount(account);
            } catch (error) {
                console.error(`Error verificando ${account.platform}/${account.username}:`, error.message);
            }
        }
    }

    async checkAccount(account) {
        let newPosts = [];

        switch (account.platform) {
            case 'youtube':
                newPosts = await this.checkYouTube(account);
                break;
            case 'tiktok':
                newPosts = await this.checkTikTok(account);
                break;
            case 'twitter':
                newPosts = await this.checkTwitter(account);
                break;
        }

        for (const post of newPosts) {
            await this.sendNotification(account, post);
        }
    }

    async checkYouTube(account) {
        try {
            const Parser = require('rss-parser');
            const parser = new Parser();
            
            const channelId = account.channelId || this.extractYouTubeChannelId(account.url);
            if (!channelId) {
                console.error(`No se pudo obtener el channel ID para ${account.username}`);
                return [];
            }

            const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
            const feed = await parser.parseURL(feedUrl);

            if (!feed.items || feed.items.length === 0) {
                return [];
            }

            const lastChecked = this.lastChecked.get(account.id);
            const newPosts = [];

            for (const item of feed.items) {
                const publishedDate = new Date(item.pubDate);
                
                if (!lastChecked || publishedDate > lastChecked) {
                    newPosts.push({
                        title: item.title,
                        url: item.link,
                        publishedAt: publishedDate,
                        thumbnail: item['media:group']?.['media:thumbnail']?.[0]?.$.url || null,
                        description: item['content:encoded'] || item.contentSnippet || ''
                    });
                }
            }

            if (newPosts.length > 0) {
                this.lastChecked.set(account.id, new Date());
            }

            return newPosts;
        } catch (error) {
            console.error(`Error en checkYouTube para ${account.username}:`, error.message);
            return [];
        }
    }

    async checkTikTok(account) {
        try {
            if (!account.rssFeedUrl) {
                console.log(`⏳ TikTok RSS feed no configurado para ${account.username}`);
                return [];
            }

            const Parser = require('rss-parser');
            const parser = new Parser();
            const feed = await parser.parseURL(account.rssFeedUrl);

            if (!feed.items || feed.items.length === 0) {
                return [];
            }

            const lastChecked = this.lastChecked.get(account.id);
            const newPosts = [];

            for (const item of feed.items) {
                const publishedDate = new Date(item.pubDate || item.isoDate);
                
                if (!lastChecked || publishedDate > lastChecked) {
                    newPosts.push({
                        title: item.title || 'Nuevo video en TikTok',
                        url: item.link,
                        publishedAt: publishedDate,
                        description: item.contentSnippet || ''
                    });
                }
            }

            if (newPosts.length > 0) {
                this.lastChecked.set(account.id, new Date());
            }

            return newPosts;
        } catch (error) {
            console.error(`Error en checkTikTok para ${account.username}:`, error.message);
            return [];
        }
    }

    async checkTwitter(account) {
        try {
            if (!account.rssFeedUrl) {
                console.log(`⏳ Twitter RSS feed no configurado para ${account.username}`);
                return [];
            }

            const Parser = require('rss-parser');
            const parser = new Parser();
            const feed = await parser.parseURL(account.rssFeedUrl);

            if (!feed.items || feed.items.length === 0) {
                return [];
            }

            const lastChecked = this.lastChecked.get(account.id);
            const newPosts = [];

            for (const item of feed.items) {
                const publishedDate = new Date(item.pubDate || item.isoDate);
                
                if (!lastChecked || publishedDate > lastChecked) {
                    newPosts.push({
                        title: item.title || 'Nuevo tweet',
                        url: item.link,
                        publishedAt: publishedDate,
                        description: item.contentSnippet || item.content || ''
                    });
                }
            }

            if (newPosts.length > 0) {
                this.lastChecked.set(account.id, new Date());
            }

            return newPosts;
        } catch (error) {
            console.error(`Error en checkTwitter para ${account.username}:`, error.message);
            return [];
        }
    }

    extractYouTubeChannelId(url) {
        const match = url.match(/channel\/([\w-]+)/);
        return match ? match[1] : null;
    }

    async sendNotification(account, post) {
        try {
            const channel = await this.client.channels.fetch(this.notificationChannelId);
            
            const platformData = {
                youtube: {
                    titleEmoji: '🎬',
                    name: 'YOUTUBE',
                    color: 0xFF0000,
                    subtitle: '🚨 Strangers RP tiene contenido fresco para la comunidad.',
                    videoEmoji: '🎥',
                    descriptionText: '🕹️ Descubre el nuevo contenido que preparamos para ti.',
                    watchText: '📺 **Míralo aquí:**',
                    cta: '📢 ¡Comparte tu opinión en los comentarios y dinos qué te pareció!',
                    closingMessage: '🔥 Cada video nos acerca más al estreno oficial del servidor. ¿Estás listo para formar parte de la historia?',
                    accountUrl: `https://youtube.com/@StrangersRP`
                },
                tiktok: {
                    titleEmoji: '🎵',
                    name: 'TIKTOK',
                    color: 0x000000,
                    subtitle: '🚨 Strangers RP tiene nuevo contenido en TikTok.',
                    videoEmoji: '📱',
                    descriptionText: '🕹️ No te pierdas lo último del servidor.',
                    watchText: '🔗 **Míralo aquí:**',
                    cta: '💬 ¡Comenta y comparte con tu crew!',
                    closingMessage: '🔥 El roleplay más épico de FiveM te espera. ¿Estás listo?',
                    accountUrl: `https://tiktok.com/@${account.username}`
                },
                twitter: {
                    titleEmoji: '🐦',
                    name: 'TWITTER/X',
                    color: 0x1DA1F2,
                    subtitle: '🚨 Nueva actualización de Strangers RP.',
                    videoEmoji: '📢',
                    descriptionText: '🕹️ Mantente informado sobre las novedades del servidor.',
                    watchText: '🔗 **Lee el tweet:**',
                    cta: '💬 ¡Interactúa y comparte tu opinión!',
                    closingMessage: '🔥 La comunidad de roleplay más activa te espera. ¿Te unes?',
                    accountUrl: `https://x.com/${account.username}`
                }
            };

            const platform = platformData[account.platform];
            
            // Formatear fecha
            const fecha = new Date(post.publishedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Construir descripción del embed
            let description = `${platform.subtitle}\n\n`;
            description += `${platform.videoEmoji} ${post.title}\n`;
            description += `${platform.descriptionText}\n\n`;
            description += `${platform.watchText} [Ver publicación](${post.url})\n`;
            description += `${platform.cta}\n\n`;
            description += `🕒 **Publicado el:** ${fecha}\n`;
            description += `📱 **Canal oficial:** [@StrangersRP](${platform.accountUrl})`;

            const embed = new EmbedBuilder()
                .setColor(platform.color)
                .setDescription(description)
                .setFooter({ text: platform.closingMessage })
                .setTimestamp(post.publishedAt);

            if (post.thumbnail) {
                embed.setImage(post.thumbnail);
            }

            // Enviar mensaje con título separado + embed
            await channel.send({
                content: `${platform.titleEmoji} **¡NUEVA PUBLICACIÓN DE ${platform.name}!**`,
                embeds: [embed]
            });
            console.log(`📤 Notificación enviada: ${account.platform}/${account.username} - ${post.title}`);
        } catch (error) {
            console.error(`Error enviando notificación:`, error);
        }
    }
}

module.exports = SocialMediaMonitorSystem;
