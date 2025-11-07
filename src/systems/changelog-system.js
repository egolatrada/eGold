const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

const CHANGELOG_CHANNEL_ID = '1435847630176653312';

class ChangelogSystem {
    constructor(client) {
        this.client = client;
        this.changelogChannel = null;
    }

    async initialize() {
        try {
            for (const [guildId, guild] of this.client.guilds.cache) {
                const channel = await guild.channels.fetch(CHANGELOG_CHANNEL_ID).catch(() => null);
                if (channel) {
                    this.changelogChannel = channel;
                    logger.success(`📝 Sistema de changelog conectado al canal ${channel.name}`);
                    break;
                }
            }
        } catch (error) {
            logger.error('Error al inicializar sistema de changelog', error);
        }
    }

    async logChange(type, title, description, fields = []) {
        if (!this.changelogChannel) {
            logger.warn('Canal de changelog no encontrado, no se puede enviar actualización');
            return false;
        }

        try {
            const typeConfig = {
                'feature': { color: '#57F287', emoji: '✨', label: 'Nueva Funcionalidad' },
                'fix': { color: '#FEE75C', emoji: '🔧', label: 'Corrección' },
                'update': { color: '#5865F2', emoji: '🔄', label: 'Actualización' },
                'security': { color: '#ED4245', emoji: '🔒', label: 'Seguridad' },
                'performance': { color: '#9B59B6', emoji: '⚡', label: 'Rendimiento' },
                'removal': { color: '#95A5A6', emoji: '🗑️', label: 'Eliminación' }
            };

            const config = typeConfig[type] || typeConfig['update'];

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`${config.emoji} ${config.label}: ${title}`)
                .setDescription(description)
                .setTimestamp()
                .setFooter({ text: 'eGold Bot • Sistema de Changelog Automático' });

            if (fields.length > 0) {
                embed.addFields(fields);
            }

            await this.changelogChannel.send({ embeds: [embed] });
            logger.info(`📝 Changelog enviado: [${type}] ${title}`);
            return true;

        } catch (error) {
            logger.error('Error al enviar changelog', error);
            return false;
        }
    }

    async logFeature(title, description, details = []) {
        return await this.logChange('feature', title, description, details);
    }

    async logFix(title, description, details = []) {
        return await this.logChange('fix', title, description, details);
    }

    async logUpdate(title, description, details = []) {
        return await this.logChange('update', title, description, details);
    }

    async logSecurity(title, description, details = []) {
        return await this.logChange('security', title, description, details);
    }

    async logPerformance(title, description, details = []) {
        return await this.logChange('performance', title, description, details);
    }

    async logRemoval(title, description, details = []) {
        return await this.logChange('removal', title, description, details);
    }

    async logBulkChanges(changes) {
        if (!this.changelogChannel) {
            logger.warn('Canal de changelog no encontrado');
            return false;
        }

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📋 Actualización del Sistema')
                .setDescription('Se han realizado múltiples cambios en el bot')
                .setTimestamp()
                .setFooter({ text: 'eGold Bot • Sistema de Changelog Automático' });

            changes.forEach(change => {
                embed.addFields({
                    name: `${change.emoji || '•'} ${change.title}`,
                    value: change.description,
                    inline: false
                });
            });

            await this.changelogChannel.send({ embeds: [embed] });
            logger.info(`📝 Changelog múltiple enviado con ${changes.length} cambios`);
            return true;

        } catch (error) {
            logger.error('Error al enviar changelog múltiple', error);
            return false;
        }
    }
}

module.exports = ChangelogSystem;
