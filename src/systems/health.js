const { writeJSONLegacy } = require('../services/storage');
const logger = require('../utils/logger');

class HealthSystem {
    constructor(client) {
        this.client = client;
        this.botHealth = {
            startTime: Date.now(),
            lastError: null,
            errorCount: 0,
            commandsExecuted: 0,
            restartCount: 0,
            lastHealthCheck: Date.now(),
        };
        this.HEARTBEAT_FILE = './src/data/bot-heartbeat.json';
    }

    /**
     * Evalúa el estado de salud del bot
     */
    evaluateHealth() {
        const pingMs = this.client.ws.ping;
        const memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const errors = this.botHealth.errorCount;

        if (errors > 100 || pingMs > 2000 || memoryMB > 500) {
            return 'critical';
        } else if (errors > 50 || pingMs > 1000 || memoryMB > 400) {
            return 'degraded';
        } else {
            return 'healthy';
        }
    }

    /**
     * Escribe el heartbeat al archivo
     */
    writeHeartbeat() {
        try {
            const status = this.evaluateHealth();
            const heartbeatData = {
                lastBeat: Date.now(),
                status,
                ping: this.client.ws.ping,
                memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                errors: this.botHealth.errorCount,
                uptime: Date.now() - this.botHealth.startTime,
            };
            writeJSONLegacy(this.HEARTBEAT_FILE, heartbeatData);

            if (status === 'critical') {
                logger.error('🔴 Estado CRÍTICO detectado. Reiniciando...');
                setTimeout(() => process.exit(1), 3000);
            }
        } catch (error) {
            logger.error('Error al escribir heartbeat', error);
        }
    }

    /**
     * Incrementa el contador de errores
     */
    incrementErrorCount() {
        this.botHealth.errorCount++;
        this.botHealth.lastError = new Date().toISOString();
    }

    /**
     * Incrementa el contador de comandos ejecutados
     */
    incrementCommandCount() {
        this.botHealth.commandsExecuted++;
    }

    /**
     * Obtiene estadísticas del bot
     */
    getStats() {
        return {
            ...this.botHealth,
            uptime: Date.now() - this.botHealth.startTime,
            health: this.evaluateHealth(),
            ping: this.client.ws.ping,
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        };
    }

    /**
     * Inicia el intervalo de heartbeat
     */
    start() {
        this.writeHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            this.writeHeartbeat();
        }, 30000);
        logger.success('💓 Sistema de heartbeat iniciado (cada 30s)');
    }

    /**
     * Detiene el intervalo de heartbeat
     */
    stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}

module.exports = HealthSystem;
