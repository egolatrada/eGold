const { EmbedBuilder } = require('discord.js');

/**
 * Crea un embed de éxito
 */
function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Crea un embed de error
 */
function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Crea un embed de información
 */
function createInfoEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Crea un embed de advertencia
 */
function createWarningEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

module.exports = {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed,
    createWarningEmbed
};
