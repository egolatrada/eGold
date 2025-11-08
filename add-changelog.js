#!/usr/bin/env node

/**
 * Script Helper para Agregar Changelogs Pendientes
 * 
 * Este script te permite agregar changelogs que se enviarán automáticamente
 * la próxima vez que el bot se reinicie.
 * 
 * USO:
 * node add-changelog.js
 * 
 * Luego sigue las instrucciones interactivas.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PENDING_CHANGELOGS_FILE = path.join(__dirname, 'src/data/pending-changelogs.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║   📝 Agregar Changelog Pendiente para Próximo Reinicio  ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    const changes = [];
    let addMore = true;

    while (addMore) {
        console.log('\n📋 Agregar nuevo cambio:\n');

        const emoji = await question('Emoji (✨/🔧/🔄/🔒/⚡/🗑️): ');
        const title = await question('Título del cambio: ');
        const description = await question('Descripción (usa \\n para saltos de línea): ');

        changes.push({
            emoji: emoji || '📝',
            title,
            description: description.replace(/\\n/g, '\n')
        });

        const response = await question('\n¿Agregar otro cambio? (s/n): ');
        addMore = response.toLowerCase() === 's';
    }

    // Cargar changelogs existentes
    let pendingChangelogs = [];
    if (fs.existsSync(PENDING_CHANGELOGS_FILE)) {
        try {
            const data = fs.readFileSync(PENDING_CHANGELOGS_FILE, 'utf8');
            pendingChangelogs = JSON.parse(data);
        } catch (error) {
            console.error('⚠️  Error al leer archivo existente:', error.message);
        }
    }

    // Agregar nuevo changelog
    pendingChangelogs.push({
        timestamp: Date.now(),
        changes
    });

    // Guardar
    try {
        const dir = path.dirname(PENDING_CHANGELOGS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(PENDING_CHANGELOGS_FILE, JSON.stringify(pendingChangelogs, null, 2));
        console.log('\n✅ Changelog guardado exitosamente!');
        console.log(`📊 Total de changelogs pendientes: ${pendingChangelogs.length}`);
        console.log('\n🔄 Se enviará automáticamente al Discord en el próximo reinicio del bot.\n');
    } catch (error) {
        console.error('\n❌ Error al guardar changelog:', error.message);
    }

    rl.close();
}

main().catch(error => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
});
