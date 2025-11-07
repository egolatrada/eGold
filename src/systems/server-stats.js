const logger = require('../utils/logger');
const { config } = require('../config');

class ServerStatsSystem {
    constructor(client) {
        this.client = client;
        this.updateQueue = new Map();
        this.lastUpdate = new Map();
        this.updateInterval = 10 * 60 * 1000; // 10 minutos
        this.queueCheckInterval = null;
    }

    async init() {
        if (!config.serverStats?.enabled) {
            logger.info('📊 Sistema de estadísticas de servidor deshabilitado');
            return;
        }

        this.queueCheckInterval = setInterval(() => this.processQueue(), 30000);
        
        await this.initialUpdate();
        logger.info('📊 Sistema de estadísticas de servidor iniciado');
    }

    async initialUpdate() {
        if (!config.serverStats?.enabled) return;

        const guild = this.client.guilds.cache.first();
        if (!guild) {
            logger.warn('No se encontró el servidor para actualizar estadísticas');
            return;
        }

        try {
            await guild.members.fetch();

            for (const stat of config.serverStats.channels) {
                await this.performChannelUpdate(guild, stat);
            }
        } catch (error) {
            logger.error('Error al actualizar estadísticas del servidor', error);
        }
    }

    async performChannelUpdate(guild, statConfig) {
        try {
            const channel = guild.channels.cache.get(statConfig.channelId);
            if (!channel) {
                logger.warn(`Canal de estadística no encontrado: ${statConfig.channelId}`);
                return;
            }

            const count = this.calculateCount(guild, statConfig);
            const currentName = channel.name;
            const colonIndex = currentName.indexOf(':');
            
            let baseName;
            if (colonIndex !== -1) {
                baseName = currentName.substring(0, colonIndex).trim();
            } else {
                baseName = statConfig.defaultName || currentName;
            }

            const newName = `${baseName}: ${count}`;

            if (currentName === newName) {
                return;
            }

            await channel.setName(newName);
            this.lastUpdate.set(statConfig.channelId, Date.now());
            
            logger.debug(`📊 Canal actualizado: ${newName}`);
        } catch (error) {
            if (error.code === 50013) {
                logger.warn(`Sin permisos para actualizar canal: ${statConfig.channelId}`);
            } else if (error.code === 50035) {
                logger.warn(`Rate limit alcanzado para canal: ${statConfig.channelId}`);
            } else {
                logger.error(`Error al actualizar canal ${statConfig.channelId}`, error);
            }
        }
    }

    calculateCount(guild, statConfig) {
        if (statConfig.countType === 'total') {
            return guild.memberCount;
        }

        if (statConfig.countType === 'role' && statConfig.roleIds) {
            let count = 0;
            for (const roleId of statConfig.roleIds) {
                const role = guild.roles.cache.get(roleId);
                if (role) {
                    count += role.members.size;
                }
            }
            return count;
        }

        return 0;
    }

    async processQueue() {
        const now = Date.now();
        const guild = this.client.guilds.cache.first();
        if (!guild) return;

        for (const stat of config.serverStats.channels) {
            const lastUpdateTime = this.lastUpdate.get(stat.channelId) || 0;
            const timeSinceLastUpdate = now - lastUpdateTime;

            if (timeSinceLastUpdate >= this.updateInterval) {
                const needsUpdate = this.updateQueue.get(stat.channelId);
                if (needsUpdate) {
                    await this.performChannelUpdate(guild, stat);
                    this.updateQueue.delete(stat.channelId);
                }
            }
        }
    }

    async handleMemberUpdate() {
        if (!config.serverStats?.enabled) return;

        for (const stat of config.serverStats.channels) {
            this.updateQueue.set(stat.channelId, true);
        }
    }

    destroy() {
        if (this.queueCheckInterval) {
            clearInterval(this.queueCheckInterval);
        }
    }
}

module.exports = ServerStatsSystem;
