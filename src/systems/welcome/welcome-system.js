const { Pool } = require('pg');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const logger = require('../../utils/logger');

class WelcomeSystem {
    constructor(client) {
        this.client = client;
        this.pool = null;
        this.config = null;
    }

    async initialize() {
        try {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
            });

            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS welcome_config (
                    guild_id VARCHAR(32) PRIMARY KEY,
                    enabled BOOLEAN DEFAULT false,
                    channel_id VARCHAR(32),
                    message TEXT DEFAULT 'Bienvenido {usuario} a **{servidor}**! 🎉',
                    image_url TEXT,
                    embed_color VARCHAR(7) DEFAULT '#5865F2',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await this.loadConfig();

            logger.success('✅ Sistema de bienvenidas inicializado');
        } catch (error) {
            logger.error('Error al inicializar sistema de bienvenidas', error);
            throw error;
        }
    }

    async loadConfig() {
        try {
            const result = await this.pool.query('SELECT * FROM welcome_config LIMIT 1');
            this.config = result.rows[0] || null;
        } catch (error) {
            logger.error('Error al cargar configuración de bienvenidas', error);
        }
    }

    async updateConfig(guildId, updates) {
        try {
            const fields = [];
            const values = [];
            let paramIndex = 1;

            for (const [key, value] of Object.entries(updates)) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }

            values.push(guildId);

            const query = `
                INSERT INTO welcome_config (guild_id, ${Object.keys(updates).join(', ')})
                VALUES ($${paramIndex}, ${Object.keys(updates).map((_, i) => `$${i + 1}`).join(', ')})
                ON CONFLICT (guild_id)
                DO UPDATE SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;

            const result = await this.pool.query(query, values);
            this.config = result.rows[0];

            logger.info(`✅ Configuración de bienvenidas actualizada para guild ${guildId}`);
            return this.config;
        } catch (error) {
            logger.error('Error al actualizar configuración de bienvenidas', error);
            throw error;
        }
    }

    async getConfig(guildId) {
        try {
            const result = await this.pool.query(
                'SELECT * FROM welcome_config WHERE guild_id = $1',
                [guildId]
            );
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error al obtener configuración de bienvenidas', error);
            return null;
        }
    }

    async setEnabled(guildId, enabled) {
        try {
            const result = await this.pool.query(
                `INSERT INTO welcome_config (guild_id, enabled)
                 VALUES ($1, $2)
                 ON CONFLICT (guild_id)
                 DO UPDATE SET enabled = $2, updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [guildId, enabled]
            );
            
            this.config = result.rows[0];
            logger.info(`✅ Sistema de bienvenidas ${enabled ? 'activado' : 'desactivado'} para guild ${guildId}`);
            return this.config;
        } catch (error) {
            logger.error('Error al cambiar estado de bienvenidas', error);
            throw error;
        }
    }

    async sendWelcome(member) {
        try {
            const config = await this.getConfig(member.guild.id);

            if (!config || !config.enabled) {
                return;
            }

            if (!config.channel_id) {
                logger.warn('⚠️ Sistema de bienvenidas activado pero sin canal configurado');
                return;
            }

            const channel = await member.guild.channels.fetch(config.channel_id).catch(() => null);
            
            if (!channel || !channel.isTextBased()) {
                logger.warn(`⚠️ Canal de bienvenidas ${config.channel_id} no encontrado o no es de texto`);
                return;
            }

            const message = this.parseMessage(config.message, member);

            const embed = new EmbedBuilder()
                .setColor(config.embed_color || '#5865F2')
                .setDescription(message)
                .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                .setFooter({ text: `Miembro #${member.guild.memberCount}` })
                .setTimestamp();

            if (config.image_url) {
                embed.setImage(config.image_url);
            }

            await channel.send({ 
                content: `${member}`,
                embeds: [embed] 
            });

            logger.info(`👋 Bienvenida enviada a ${member.user.tag} en ${member.guild.name}`);
        } catch (error) {
            logger.error('Error al enviar mensaje de bienvenida', error);
        }
    }

    parseMessage(template, member) {
        if (!template) {
            return `Bienvenido ${member} a **${member.guild.name}**! 🎉`;
        }

        return template
            .replace(/{usuario}/g, `${member}`)
            .replace(/{nombre}/g, member.user.username)
            .replace(/{tag}/g, member.user.tag)
            .replace(/{servidor}/g, member.guild.name)
            .replace(/{miembros}/g, member.guild.memberCount)
            .replace(/{id}/g, member.user.id);
    }

    async cleanup() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = WelcomeSystem;
