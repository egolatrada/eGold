const { PermissionFlagsBits } = require('discord.js');

/**
 * Verifica si un miembro tiene permisos de administrador
 */
function isAdmin(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator);
}

/**
 * Verifica si un miembro tiene permisos de moderador
 */
function isModerator(member) {
    return member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
           member.permissions.has(PermissionFlagsBits.KickMembers) ||
           member.permissions.has(PermissionFlagsBits.BanMembers);
}

/**
 * Verifica si un miembro puede gestionar canales
 */
function canManageChannels(member) {
    return member.permissions.has(PermissionFlagsBits.ManageChannels);
}

/**
 * Verifica si un miembro puede gestionar mensajes
 */
function canManageMessages(member) {
    return member.permissions.has(PermissionFlagsBits.ManageMessages);
}

module.exports = {
    isAdmin,
    isModerator,
    canManageChannels,
    canManageMessages
};
