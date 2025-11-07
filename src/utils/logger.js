// Sistema de logging centralizado

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        'info': '✅',
        'warn': '⚠️',
        'error': '❌',
        'debug': '🔍',
        'success': '🎉'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} ${message}`);
}

function info(message) {
    log(message, 'info');
}

function warn(message) {
    log(message, 'warn');
}

function error(message, err = null) {
    log(message, 'error');
    if (err) {
        console.error(err);
    }
}

function debug(message) {
    if (process.env.DEBUG === 'true') {
        log(message, 'debug');
    }
}

function success(message) {
    log(message, 'success');
}

module.exports = {
    log,
    info,
    warn,
    error,
    debug,
    success
};
