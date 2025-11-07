require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');

const HEALTH_CHECK_INTERVAL = 60000;
const MAX_RESTARTS_PER_HOUR = 5;
const RESTART_COOLDOWN = 720000;
const HEARTBEAT_TIMEOUT = 120000;
const HEARTBEAT_FILE = './src/data/bot-heartbeat.json';

let botProcess = null;
let restartHistory = [];
let consecutiveFailures = 0;

function readHeartbeat() {
    try {
        if (!fs.existsSync(HEARTBEAT_FILE)) {
            return null;
        }
        const data = fs.readFileSync(HEARTBEAT_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('⚠️ Error al leer heartbeat:', error.message);
        return null;
    }
}

function cleanOldRestarts() {
    const oneHourAgo = Date.now() - 3600000;
    restartHistory = restartHistory.filter(time => time > oneHourAgo);
}

function canRestart() {
    cleanOldRestarts();
    
    if (restartHistory.length >= MAX_RESTARTS_PER_HOUR) {
        console.error('🔴 CRÍTICO: Demasiados reinicios en la última hora. Deteniendo watchdog.');
        console.error('   Por favor, revisa los logs y reinicia manualmente cuando el problema esté resuelto.');
        return false;
    }
    
    const lastRestart = restartHistory[restartHistory.length - 1] || 0;
    if (Date.now() - lastRestart < RESTART_COOLDOWN) {
        console.log('⏳ Esperando periodo de cooldown antes de reiniciar...');
        return false;
    }
    
    return true;
}

function startBot() {
    if (botProcess) {
        console.log('⚠️ Proceso existente detectado, terminando...');
        try {
            botProcess.kill();
        } catch (error) {
            console.error('Error al terminar proceso anterior:', error.message);
        }
    }

    console.log('🚀 Iniciando bot de Discord...');
    
    botProcess = spawn('node', ['src/index.js'], {
        stdio: 'inherit',
        env: process.env
    });

    botProcess.on('exit', (code, signal) => {
        console.log(`⚠️ Bot detenido - Código: ${code}, Señal: ${signal}`);
        botProcess = null;
        
        if (code === 0) {
            console.log('✅ Salida limpia detectada. Reiniciando...');
            setTimeout(() => startBot(), 3000);
            return;
        }
        
        consecutiveFailures++;
        
        if (consecutiveFailures >= 3) {
            console.error('🔴 CRÍTICO: 3 fallos consecutivos detectados.');
            
            if (!canRestart()) {
                console.error('🔴 No se puede reiniciar. Watchdog detenido.');
                process.exit(1);
                return;
            }
        }
        
        console.log(`🔄 Reiniciando bot en 5 segundos... (Fallo ${consecutiveFailures})`);
        restartHistory.push(Date.now());
        
        setTimeout(() => {
            startBot();
        }, 5000);
    });

    botProcess.on('error', (error) => {
        console.error('❌ Error al iniciar bot:', error);
        botProcess = null;
        
        setTimeout(() => {
            if (canRestart()) {
                startBot();
            } else {
                process.exit(1);
            }
        }, 10000);
    });
    
    consecutiveFailures = 0;
}

let degradedCount = 0;

setInterval(() => {
    const heartbeat = readHeartbeat();
    
    if (!heartbeat) {
        console.warn('⚠️ No se pudo leer heartbeat del bot');
        return;
    }
    
    const timeSinceLastBeat = Date.now() - heartbeat.lastBeat;
    
    if (timeSinceLastBeat > HEARTBEAT_TIMEOUT) {
        console.error(`🔴 Bot no responde! Último heartbeat hace ${Math.floor(timeSinceLastBeat / 1000)}s`);
        console.error('🔄 Reiniciando bot colgado...');
        
        if (canRestart()) {
            if (botProcess) {
                console.log('⚠️ Terminando proceso colgado...');
                try {
                    botProcess.kill('SIGKILL');
                } catch (error) {
                    console.error('Error al terminar proceso:', error.message);
                }
            }
            consecutiveFailures++;
            restartHistory.push(Date.now());
            setTimeout(() => startBot(), 3000);
        } else {
            console.error('🔴 No se puede reiniciar. Watchdog detenido.');
            process.exit(1);
        }
        return;
    }
    
    if (heartbeat.status === "critical") {
        console.error(`🔴 Bot en estado CRÍTICO! Esperando auto-restart del bot...`);
        degradedCount = 0;
        return;
    }
    
    if (heartbeat.status === "degraded") {
        degradedCount++;
        console.warn(`⚠️ Bot DEGRADADO (${degradedCount}/3) - Ping: ${heartbeat.ping}ms, Memoria: ${heartbeat.memory}MB, Errores: ${heartbeat.errors}`);
        
        if (degradedCount >= 3) {
            console.error('🔴 Bot degradado por 3 checks consecutivos. Reiniciando...');
            if (canRestart()) {
                if (botProcess) {
                    botProcess.kill();
                }
                degradedCount = 0;
                consecutiveFailures++;
                restartHistory.push(Date.now());
                setTimeout(() => startBot(), 3000);
            }
        }
        return;
    }
    
    degradedCount = 0;
    
    if (botProcess && botProcess.killed) {
        console.warn('⚠️ Proceso del bot marcado como terminado inesperadamente');
        if (canRestart()) {
            startBot();
        }
        return;
    }
    
    console.log(`💚 Bot ${heartbeat.status.toUpperCase()} - Ping: ${heartbeat.ping}ms, Memoria: ${heartbeat.memory}MB, Errores: ${heartbeat.errors}`);
}, HEALTH_CHECK_INTERVAL);

process.on('SIGINT', () => {
    console.log('\n🛑 Watchdog detenido por usuario');
    if (botProcess) {
        botProcess.kill();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Watchdog terminado');
    if (botProcess) {
        botProcess.kill();
    }
    process.exit(0);
});

console.log('👁️ Watchdog iniciado');
console.log(`   - Health check cada ${HEALTH_CHECK_INTERVAL / 1000}s`);
console.log(`   - Máximo ${MAX_RESTARTS_PER_HOUR} reinicios por hora`);
console.log(`   - Cooldown de ${RESTART_COOLDOWN / 1000}s entre reinicios`);
console.log('');

startBot();
