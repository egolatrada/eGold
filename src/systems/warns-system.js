const { Pool } = require('pg');
const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

const WARN_CHANNELS = ['1436824228279357580', '1370611084574326784'];

class WarnsSystem {
    constructor(client) {
        this.client = client;
        this.pool = null;
        this.autoRevokeCheckInterval = null;
        this.warnChannels = WARN_CHANNELS;
    }

    async initialize() {
        try {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
            });

            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS warnings (
                    id SERIAL PRIMARY KEY,
                    guild_id VARCHAR(32) NOT NULL,
                    user_id VARCHAR(32) NOT NULL,
                    username VARCHAR(255) NOT NULL,
                    moderator_id VARCHAR(32) NOT NULL,
                    moderator_username VARCHAR(255) NOT NULL,
                    category VARCHAR(20) NOT NULL,
                    reason TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    revoked_at TIMESTAMP,
                    revoked_by VARCHAR(32),
                    revoked_reason TEXT
                )
            `);

            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_warnings_user 
                ON warnings(guild_id, user_id, revoked_at)
            `);

            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_warnings_expires 
                ON warnings(expires_at, revoked_at)
            `);

            logger.success('✅ Sistema de advertencias inicializado');
            
            this.startAutoRevokeCheck();
        } catch (error) {
            logger.error('Error al inicializar sistema de advertencias', error);
            throw error;
        }
    }

    async addWarning(guildId, userId, username, moderatorId, moderatorUsername, category, reason, expiresIn = null) {
        try {
            let expiresAt = null;
            if (expiresIn) {
                expiresAt = new Date(Date.now() + expiresIn);
            }

            const result = await this.pool.query(
                `INSERT INTO warnings (guild_id, user_id, username, moderator_id, moderator_username, category, reason, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id, created_at`,
                [guildId, userId, username, moderatorId, moderatorUsername, category, reason, expiresAt]
            );

            logger.info(`⚠️ Advertencia creada: ID ${result.rows[0].id} - Usuario ${username} por ${moderatorUsername}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error al crear advertencia', error);
            throw error;
        }
    }

    async getUserWarnings(guildId, userId, includeRevoked = false) {
        try {
            let query = `
                SELECT * FROM warnings 
                WHERE guild_id = $1 AND user_id = $2
            `;
            
            if (!includeRevoked) {
                query += ` AND revoked_at IS NULL`;
            }
            
            query += ` ORDER BY created_at DESC`;

            const result = await this.pool.query(query, [guildId, userId]);
            return result.rows;
        } catch (error) {
            logger.error('Error al obtener advertencias del usuario', error);
            throw error;
        }
    }

    async getAllWarnings(guildId, includeRevoked = false) {
        try {
            let query = `
                SELECT * FROM warnings 
                WHERE guild_id = $1
            `;
            
            if (!includeRevoked) {
                query += ` AND revoked_at IS NULL`;
            }
            
            query += ` ORDER BY created_at DESC`;

            const result = await this.pool.query(query, [guildId]);
            return result.rows;
        } catch (error) {
            logger.error('Error al obtener todas las advertencias', error);
            throw error;
        }
    }

    async revokeWarning(warningId, revokedBy, reason = null) {
        try {
            const result = await this.pool.query(
                `UPDATE warnings 
                 SET revoked_at = CURRENT_TIMESTAMP, revoked_by = $1, revoked_reason = $2
                 WHERE id = $3 AND revoked_at IS NULL
                 RETURNING *`,
                [revokedBy, reason, warningId]
            );

            if (result.rows.length > 0) {
                logger.info(`✅ Advertencia ${warningId} revocada por ${revokedBy}`);
                return result.rows[0];
            }
            return null;
        } catch (error) {
            logger.error('Error al revocar advertencia', error);
            throw error;
        }
    }

    async getWarningById(warningId) {
        try {
            const result = await this.pool.query(
                `SELECT * FROM warnings WHERE id = $1`,
                [warningId]
            );
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error al obtener advertencia por ID', error);
            throw error;
        }
    }

    async autoRevokeExpiredWarnings() {
        try {
            const result = await this.pool.query(
                `UPDATE warnings 
                 SET revoked_at = CURRENT_TIMESTAMP, 
                     revoked_by = 'SYSTEM', 
                     revoked_reason = 'Auto-revocación por expiración de tiempo'
                 WHERE expires_at IS NOT NULL 
                   AND expires_at <= CURRENT_TIMESTAMP 
                   AND revoked_at IS NULL
                 RETURNING *`
            );

            if (result.rows.length > 0) {
                logger.info(`🔄 ${result.rows.length} advertencia(s) auto-revocada(s) por expiración`);
                
                for (const warning of result.rows) {
                    try {
                        const guild = await this.client.guilds.fetch(warning.guild_id);
                        const user = await this.client.users.fetch(warning.user_id).catch(() => null);
                        const categoryName = this.getCategoryName(warning.category);
                        const createdAt = Math.floor(new Date(warning.created_at).getTime() / 1000);
                        
                        if (user) {
                            const dmEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('✅ Advertencia Revocada Automáticamente')
                                .setDescription('Una de tus advertencias ha sido revocada automáticamente por expiración del tiempo.')
                                .addFields(
                                    { name: '📋 Categoría', value: categoryName, inline: true },
                                    { name: '📅 Fecha de advertencia', value: `<t:${createdAt}:F>`, inline: false },
                                    { name: '📝 Motivo original', value: warning.reason, inline: false }
                                )
                                .setFooter({ text: `Servidor: ${guild.name} | ID: ${warning.id}` })
                                .setTimestamp();

                            await user.send({ embeds: [dmEmbed] }).catch(() => {
                                logger.warn(`No se pudo enviar DM de auto-revocación a ${warning.username}`);
                            });
                        }

                        for (const channelId of this.warnChannels) {
                            try {
                                const channel = await guild.channels.fetch(channelId).catch(() => null);
                                if (channel && channel.isTextBased()) {
                                    const publicEmbed = new EmbedBuilder()
                                        .setColor('#00FF00')
                                        .setTitle('⏰ Advertencia Auto-revocada')
                                        .setDescription('Una advertencia ha sido revocada automáticamente por expiración del tiempo configurado.')
                                        .addFields(
                                            { name: '👤 Usuario', value: user ? `${user} (${warning.username})` : warning.username, inline: false },
                                            { name: '🆔 ID de advertencia', value: `${warning.id}`, inline: true },
                                            { name: '📋 Categoría', value: categoryName, inline: true },
                                            { name: '📅 Fecha de advertencia', value: `<t:${createdAt}:F>`, inline: false },
                                            { name: '📝 Motivo original', value: warning.reason, inline: false },
                                            { name: '⏰ Revocada automáticamente', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                                        )
                                        .setFooter({ text: 'Sistema de Auto-revocación' })
                                        .setTimestamp();

                                    await channel.send({ embeds: [publicEmbed] });
                                    logger.info(`✅ Mensaje de auto-revocación enviado al canal ${channel.name} (${channelId})`);
                                    break;
                                }
                            } catch (channelError) {
                                logger.warn(`No se pudo enviar mensaje al canal ${channelId}:`, channelError.message);
                            }
                        }
                    } catch (error) {
                        logger.error(`Error al notificar auto-revocación de warning ${warning.id}`, error);
                    }
                }
            }

            return result.rows;
        } catch (error) {
            logger.error('Error al auto-revocar advertencias expiradas', error);
            throw error;
        }
    }

    startAutoRevokeCheck() {
        this.autoRevokeCheckInterval = setInterval(async () => {
            await this.autoRevokeExpiredWarnings();
        }, 60000);
        
        logger.info('🔄 Sistema de auto-revocación de advertencias iniciado (cada 1 minuto)');
    }

    getCategoryName(category) {
        const categories = {
            'grave': '🔴 Grave',
            'moderado': '🟠 Moderado',
            'suave': '🟡 Suave'
        };
        return categories[category] || category;
    }

    getCategoryColor(category) {
        const colors = {
            'grave': '#FF0000',
            'moderado': '#FFA500',
            'suave': '#FFFF00'
        };
        return colors[category] || '#808080';
    }

    async cleanup() {
        if (this.autoRevokeCheckInterval) {
            clearInterval(this.autoRevokeCheckInterval);
        }
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = WarnsSystem;
