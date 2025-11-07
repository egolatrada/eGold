const { readJSONLegacy, writeJSONLegacy } = require('../services/storage');
const logger = require('../utils/logger');

class SuggestionsSystem {
    constructor() {
        this.suggestions = new Map();
        this.SUGGESTIONS_FILE = './src/data/suggestions-data.json';
    }

    loadSuggestions() {
        try {
            const data = readJSONLegacy(this.SUGGESTIONS_FILE);
            if (data) {
                Object.entries(data).forEach(([messageId, suggestionData]) => {
                    this.suggestions.set(messageId, suggestionData);
                });
                logger.success(`${this.suggestions.size} sugerencias cargadas desde archivo`);
            }
        } catch (error) {
            logger.error('Error al cargar datos de sugerencias', error);
        }
    }

    saveSuggestions() {
        try {
            const data = {};
            for (const [messageId, suggestionData] of this.suggestions.entries()) {
                data[messageId] = suggestionData;
            }
            writeJSONLegacy(this.SUGGESTIONS_FILE, data);
        } catch (error) {
            logger.error('Error al guardar datos de sugerencias', error);
        }
    }

    createSuggestion(messageId, userId, username, suggestion) {
        this.suggestions.set(messageId, {
            messageId,
            userId,
            username,
            suggestion,
            upvotes: [],
            downvotes: [],
            status: 'pending',
            createdAt: Date.now(),
            resolvedAt: null,
            resolvedBy: null
        });
        this.saveSuggestions();
    }

    getSuggestion(messageId) {
        return this.suggestions.get(messageId);
    }

    addVote(messageId, userId, voteType) {
        const suggestion = this.suggestions.get(messageId);
        if (!suggestion) return false;

        // Remover voto anterior si existe
        suggestion.upvotes = suggestion.upvotes.filter(id => id !== userId);
        suggestion.downvotes = suggestion.downvotes.filter(id => id !== userId);

        // Añadir nuevo voto
        if (voteType === 'up') {
            suggestion.upvotes.push(userId);
        } else if (voteType === 'down') {
            suggestion.downvotes.push(userId);
        }

        this.saveSuggestions();
        return true;
    }

    removeVote(messageId, userId) {
        const suggestion = this.suggestions.get(messageId);
        if (!suggestion) return false;

        suggestion.upvotes = suggestion.upvotes.filter(id => id !== userId);
        suggestion.downvotes = suggestion.downvotes.filter(id => id !== userId);

        this.saveSuggestions();
        return true;
    }

    resolveSuggestion(messageId, status, resolvedBy) {
        const suggestion = this.suggestions.get(messageId);
        if (!suggestion) return false;

        suggestion.status = status;
        suggestion.resolvedAt = Date.now();
        suggestion.resolvedBy = resolvedBy;

        this.saveSuggestions();
        return true;
    }

    getVoteCounts(messageId) {
        const suggestion = this.suggestions.get(messageId);
        if (!suggestion) return { upvotes: 0, downvotes: 0 };

        return {
            upvotes: suggestion.upvotes.length,
            downvotes: suggestion.downvotes.length
        };
    }

    hasVoted(messageId, userId) {
        const suggestion = this.suggestions.get(messageId);
        if (!suggestion) return null;

        if (suggestion.upvotes.includes(userId)) return 'up';
        if (suggestion.downvotes.includes(userId)) return 'down';
        return null;
    }
}

module.exports = SuggestionsSystem;
