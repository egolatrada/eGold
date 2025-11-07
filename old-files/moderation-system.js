const { EmbedBuilder, Colors } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");
const https = require("https");
const http = require("http");

class ModerationSystem {
    constructor(client, config, messages) {
        this.client = client;
        this.config = config.autoModeration;
        this.logsConfig = config.logs;
        this.messages = messages.moderation;

        this.ai = new GoogleGenAI({
            apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
            httpOptions: {
                apiVersion: "",
                baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
            },
        });

        // Sistema anti-spam: Map<userId, Array<{content: string, timestamp: number, messageId: string}>>
        this.userMessages = new Map();
        this.spamWarnings = new Map(); // Map<userId, number> - contador de advertencias
        this.insultCounts = new Map(); // Map<userId, number> - contador de insultos
    }

    async init() {
        if (!this.config.enabled) return;

        this.client.on("messageCreate", (message) =>
            this.handleMessage(message),
        );

        console.log("🛡️ Sistema de moderación iniciado correctamente");
    }

    async sendStaffLog(embed) {
        const channelId = this.logsConfig.channels.staff;
        if (
            !channelId ||
            channelId.includes("1435563400439660615") ||
            channelId === "1435563400439660615"
        )
            return;

        try {
            const channel = await this.client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Error al enviar log de staff: ${error.message}`);
        }
    }

    async handleMessage(message) {
        if (!message.guild || message.author.bot) return;
        if (!this.config.enabled) return;

        const member = message.member;
        if (!member) return;

        if (this.config.excludedChannels.includes(message.channel.id)) return;

        // Sistema de filtro de insultos (PRIMERO, antes que spam)
        if (
            this.config.profanityFilter &&
            this.config.profanityFilter.enabled
        ) {
            const hasProfanity = await this.checkProfanity(message);
            if (hasProfanity) return; // Si tiene insultos y se aplicó acción, no continuar
        }

        // Sistema anti-spam y anti-duplicados
        if (this.config.antiSpam && this.config.antiSpam.enabled) {
            const isSpam = await this.checkSpamAndDuplicates(message);
            if (isSpam) return; // Si es spam, ya se procesó, no continuar
        }

        const hasLinks =
            this.config.checkLinks && this.detectLinks(message.content);
        const hasImages =
            this.config.checkImages && message.attachments.size > 0;

        if (!hasLinks && !hasImages) return;

        try {
            if (hasImages) {
                await this.checkImageAttachments(message);
            }

            if (hasLinks) {
                await this.checkLinks(message);
            }
        } catch (error) {
            console.error(`Error en moderación automática: ${error.message}`);
        }
    }

    detectLinks(content) {
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        return urlRegex.test(content);
    }

    async checkProfanity(message) {
        const content = message.content.toLowerCase();
        const userId = message.author.id;
        const user = message.author;

        // Contar insultos en el mensaje
        let insultCount = 0;
        const foundInsults = [];

        for (const insult of this.config.profanityFilter.insultWords) {
            const regex = new RegExp(`\\b${insult.toLowerCase()}\\b`, "gi");
            const matches = content.match(regex);
            if (matches) {
                insultCount += matches.length;
                if (!foundInsults.includes(insult)) {
                    foundInsults.push(insult);
                }
            }
        }

        if (insultCount === 0) return false;

        // Incrementar contador global de insultos del usuario
        const totalInsults = (this.insultCounts.get(userId) || 0) + insultCount;
        this.insultCounts.set(userId, totalInsults);

        // Si alcanza el límite, aplicar timeout
        if (
            totalInsults >= this.config.profanityFilter.maxInsultsBeforeTimeout
        ) {
            try {
                // Borrar mensaje
                await message.delete();

                // Borrar TODOS los mensajes del usuario de los últimos 2 minutos
                await this.deleteUserRecentMessages(
                    message.author,
                    message.channel,
                    120000,
                );

                // Aplicar timeout
                const timeoutDuration =
                    this.config.profanityFilter.timeoutDurationMinutes *
                    60 *
                    1000;
                await message.member.timeout(
                    timeoutDuration,
                    `Uso excesivo de lenguaje ofensivo (${totalInsults} insultos)`,
                );

                // Enviar DM al usuario
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("⚠️ Timeout aplicado - Lenguaje ofensivo")
                        .setDescription(
                            `Has recibido un timeout de **${this.config.profanityFilter.timeoutDurationMinutes} minutos** por uso excesivo de lenguaje ofensivo.`,
                        )
                        .addFields(
                            {
                                name: "📊 Insultos detectados",
                                value: `${totalInsults}`,
                                inline: true,
                            },
                            {
                                name: "🔒 Servidor",
                                value: message.guild.name,
                                inline: true,
                            },
                            {
                                name: "⏰ Duración",
                                value: `${this.config.profanityFilter.timeoutDurationMinutes} minutos`,
                                inline: true,
                            },
                        )
                        .setFooter({
                            text: "Por favor, mantén un lenguaje respetuoso en nuestra comunidad.",
                        })
                        .setTimestamp();

                    await user.send({ embeds: [dmEmbed] });
                } catch (error) {
                    console.log(
                        `No se pudo enviar DM a ${user.tag}: ${error.message}`,
                    );
                }

                // Notificar al staff
                const staffEmbed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle("🚨 Timeout aplicado - Lenguaje ofensivo")
                    .setDescription(
                        `Se aplicó timeout a ${user} por uso excesivo de lenguaje ofensivo`,
                    )
                    .addFields(
                        {
                            name: "👤 Usuario",
                            value: `${user} (${user.tag})`,
                            inline: true,
                        },
                        { name: "🆔 ID", value: user.id, inline: true },
                        {
                            name: "📊 Insultos detectados",
                            value: `${totalInsults}`,
                            inline: true,
                        },
                        {
                            name: "⏰ Duración timeout",
                            value: `${this.config.profanityFilter.timeoutDurationMinutes} minutos`,
                            inline: true,
                        },
                        {
                            name: "📍 Canal",
                            value: `${message.channel}`,
                            inline: true,
                        },
                        {
                            name: "💬 Palabras detectadas",
                            value: foundInsults.join(", ").substring(0, 200),
                            inline: false,
                        },
                    )
                    .setThumbnail(user.displayAvatarURL())
                    .setTimestamp();

                await this.sendStaffLog(staffEmbed);

                // Resetear contador
                this.insultCounts.delete(userId);

                console.log(
                    `⚠️ Timeout aplicado a ${user.tag} por ${totalInsults} insultos`,
                );
            } catch (error) {
                console.error(
                    `Error al aplicar timeout por insultos: ${error.message}`,
                );
            }

            return true;
        }

        return false;
    }

    async deleteUserRecentMessages(user, channel, timeWindow = 120000) {
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const now = Date.now();
            const userMessages = messages.filter(
                (msg) =>
                    msg.author.id === user.id &&
                    now - msg.createdTimestamp < timeWindow,
            );

            for (const msg of userMessages.values()) {
                try {
                    await msg.delete();
                    console.log(
                        `🗑️ Mensaje eliminado de ${user.tag} (limpieza de 2 minutos)`,
                    );
                } catch (error) {
                    console.log(
                        `No se pudo eliminar mensaje: ${error.message}`,
                    );
                }
            }
        } catch (error) {
            console.error(
                `Error al eliminar mensajes recientes: ${error.message}`,
            );
        }
    }

    async checkSpamAndDuplicates(message) {
        const userId = message.author.id;
        const now = Date.now();
        const content = message.content.trim().toLowerCase();

        // Ignorar mensajes vacíos o muy cortos
        if (content.length < this.config.antiSpam.minMessageLength)
            return false;

        // Obtener o crear el historial de mensajes del usuario
        if (!this.userMessages.has(userId)) {
            this.userMessages.set(userId, []);
        }

        const userHistory = this.userMessages.get(userId);

        // Limpiar mensajes antiguos (más de X segundos)
        const timeWindow = this.config.antiSpam.timeWindow * 1000;
        const recentMessages = userHistory.filter(
            (msg) => now - msg.timestamp < timeWindow,
        );

        // Agregar mensaje actual al historial ANTES de evaluar
        recentMessages.push({
            content: content,
            timestamp: now,
            messageId: message.id,
            channelId: message.channel.id,
        });

        // Detectar duplicados (ahora incluye el mensaje actual)
        const duplicateCount = recentMessages.filter(
            (msg) => msg.content === content,
        ).length;
        const isDuplicate =
            duplicateCount >= this.config.antiSpam.maxDuplicates;

        // Detectar spam (muchos mensajes en poco tiempo, ahora incluye el mensaje actual)
        const isSpam =
            recentMessages.length >= this.config.antiSpam.maxMessages;

        this.userMessages.set(userId, recentMessages);

        // Si es spam o duplicado, tomar acción
        if (isDuplicate || isSpam) {
            const spamType = isDuplicate ? "duplicate" : "spam";
            await this.handleSpamDetected(message, spamType, recentMessages);
            return true;
        }

        return false;
    }

    async handleSpamDetected(message, spamType, recentMessages) {
        const userId = message.author.id;
        const user = message.author;

        // Incrementar contador de advertencias
        const warnings = (this.spamWarnings.get(userId) || 0) + 1;
        this.spamWarnings.set(userId, warnings);

        // Borrar TODOS los mensajes del usuario de los últimos 2 minutos
        await this.deleteUserRecentMessages(user, message.channel, 120000);

        // SIEMPRE aplicar timeout de 2 minutos cuando se detecta spam
        const timeoutDuration = 2 * 60 * 1000; // 2 minutos fijos
        let timeoutApplied = false;

        try {
            await message.member.timeout(
                timeoutDuration,
                `Spam detectado (${recentMessages.length} mensajes en ${this.config.antiSpam.timeWindow}s)`,
            );
            timeoutApplied = true;
            console.log(
                `⚠️ Timeout de 2 minutos aplicado a ${user.tag} por spam (${recentMessages.length} mensajes)`,
            );
        } catch (error) {
            console.error(`Error al aplicar timeout: ${error.message}`);
        }

        // Enviar DM al usuario
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle("⚠️ Timeout aplicado - Spam detectado")
                .setDescription(
                    `Has recibido un timeout de **2 minutos** por enviar spam.\n\n` +
                        `Tus mensajes de los últimos 2 minutos han sido eliminados.`,
                )
                .addFields(
                    {
                        name: "⚠️ Advertencia",
                        value: `${warnings}/${this.config.antiSpam.maxWarnings}`,
                        inline: true,
                    },
                    {
                        name: "🔒 Servidor",
                        value: message.guild.name,
                        inline: true,
                    },
                    {
                        name: "⏰ Duración del timeout",
                        value: "2 minutos",
                        inline: true,
                    },
                    {
                        name: "🕐 Podrás volver a escribir",
                        value: `<t:${Math.floor((Date.now() + timeoutDuration) / 1000)}:R>`,
                        inline: true,
                    },
                )
                .setFooter({
                    text: "Por favor, evita enviar spam en el futuro. Respeta las normas del servidor.",
                })
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`No se pudo enviar DM a ${user.tag}: ${error.message}`);
        }

        // Enviar notificación al staff
        const staffEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("🚨 Timeout aplicado - Spam detectado")
            .setDescription(
                `Se detectó comportamiento de **${spamType === "duplicate" ? "mensajes duplicados" : "spam"}** de ${user}\n\n` +
                    `✅ **Acciones tomadas:**\n` +
                    `• Timeout de 2 minutos aplicado\n` +
                    `• Mensajes de los últimos 2 minutos eliminados\n` +
                    `• Notificación enviada al usuario por DM`,
            )
            .addFields(
                {
                    name: "👤 Usuario",
                    value: `${user} (${user.tag})`,
                    inline: true,
                },
                { name: "🆔 ID", value: user.id, inline: true },
                {
                    name: "⚠️ Advertencias",
                    value: `${warnings}/${this.config.antiSpam.maxWarnings}`,
                    inline: true,
                },
                {
                    name: "📝 Mensajes detectados",
                    value: recentMessages.length.toString(),
                    inline: true,
                },
                { name: "📍 Canal", value: `${message.channel}`, inline: true },
                {
                    name: "🕐 Hora",
                    value: `<t:${Math.floor(Date.now() / 1000)}:T>`,
                    inline: true,
                },
                {
                    name: "⏰ Timeout aplicado",
                    value: "2 minutos",
                    inline: true,
                },
                {
                    name: "🔓 Podrá escribir",
                    value: `<t:${Math.floor((Date.now() + timeoutDuration) / 1000)}:R>`,
                    inline: true,
                },
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        if (recentMessages.length > 0 && recentMessages[0].content) {
            staffEmbed.addFields({
                name: "💬 Ejemplo de contenido",
                value: recentMessages[0].content.substring(0, 200),
            });
        }

        await this.sendStaffLog(staffEmbed);

        // Limpiar historial del usuario
        this.userMessages.set(userId, []);
    }

    async checkImageAttachments(message) {
        for (const attachment of message.attachments.values()) {
            if (attachment.contentType?.startsWith("image/")) {
                await this.analyzeImage(message, attachment.url);
            } else if (
                attachment.contentType?.startsWith("video/") &&
                this.config.checkVideos
            ) {
                await this.analyzeVideo(message, attachment.url);
            }
        }
    }

    async analyzeImage(message, imageUrl) {
        try {
            const imageBuffer = await this.downloadMedia(imageUrl);
            const base64Image = imageBuffer.toString("base64");

            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Analiza esta imagen y responde en formato JSON con la siguiente estructura:
{
  "isNSFW": boolean,
  "isViolent": boolean,
  "isGore": boolean,
  "description": "descripción detallada del contenido",
  "confidence": number (0-1),
  "warnings": ["lista", "de", "advertencias"]
}

Detecta contenido NSFW (desnudez, sexual), violento, gore (sangre, mutilaciones), spam o estafas.`,
                            },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: base64Image,
                                },
                            },
                        ],
                    },
                ],
                config: {
                    responseMimeType: "application/json",
                },
            });

            const analysis = JSON.parse(response.text || "{}");

            const nsfwScore = analysis.isNSFW ? analysis.confidence : 0;
            const goreScore =
                analysis.isViolent || analysis.isGore ? analysis.confidence : 0;

            if (
                nsfwScore >= this.config.nsfwThreshold ||
                goreScore >= this.config.goreThreshold
            ) {
                await this.handleSuspiciousContent(message, "Imagen", analysis);
            }
        } catch (error) {
            console.error(`Error al analizar imagen: ${error.message}`);
        }
    }

    async analyzeVideo(message, videoUrl) {
        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Analiza este video (URL: ${videoUrl}) y genera una transcripción completa del contenido. 
Incluye:
- Transcripción del audio (si hay diálogo)
- Descripción de las escenas visuales
- Advertencias sobre contenido NSFW, violento o gore
- Nivel de confianza de las detecciones (0-1)

Responde en formato JSON:
{
  "transcription": "transcripción completa",
  "visualDescription": "descripción de lo que se ve",
  "isNSFW": boolean,
  "isViolent": boolean,
  "isGore": boolean,
  "confidence": number,
  "warnings": ["lista de advertencias"]
}`,
                            },
                        ],
                    },
                ],
                config: {
                    responseMimeType: "application/json",
                },
            });

            const analysis = JSON.parse(response.text || "{}");

            const nsfwScore = analysis.isNSFW ? analysis.confidence : 0;
            const goreScore =
                analysis.isViolent || analysis.isGore ? analysis.confidence : 0;

            if (
                nsfwScore >= this.config.nsfwThreshold ||
                goreScore >= this.config.goreThreshold
            ) {
                await this.handleSuspiciousContent(message, "Video", analysis);
            }
        } catch (error) {
            console.error(`Error al analizar video: ${error.message}`);
        }
    }

    async checkLinks(message) {
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const urls = message.content.match(urlRegex);

        if (!urls) return;

        for (const url of urls) {
            try {
                const response = await this.ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `Analiza este enlace y determina si es seguro: ${url}

Responde en formato JSON:
{
  "isSafe": boolean,
  "isNSFW": boolean,
  "isScam": boolean,
  "isMalicious": boolean,
  "description": "descripción del contenido",
  "confidence": number (0-1),
  "warnings": ["lista de advertencias"]
}`,
                                },
                            ],
                        },
                    ],
                    config: {
                        responseMimeType: "application/json",
                    },
                });

                const analysis = JSON.parse(response.text || "{}");

                if (!analysis.isSafe && analysis.confidence >= 0.6) {
                    await this.handleSuspiciousContent(
                        message,
                        "Enlace",
                        analysis,
                        url,
                    );
                }
            } catch (error) {
                console.error(`Error al analizar enlace: ${error.message}`);
            }
        }
    }

    async handleSuspiciousContent(message, contentType, analysis, url = null) {
        try {
            const timeoutMs = this.config.timeoutDuration;
            const timeoutMinutes = Math.floor(timeoutMs / 60000);

            const isOwner = message.guild.ownerId === message.author.id;
            const isStaff =
                this.config.staffRoleIds.length > 0 &&
                message.member.roles.cache.some((role) =>
                    this.config.staffRoleIds.includes(role.id),
                );

            let timeoutApplied = false;
            if (!isStaff && !isOwner) {
                try {
                    await message.member.timeout(
                        timeoutMs,
                        "Contenido sospechoso detectado por IA",
                    );
                    timeoutApplied = true;
                } catch (timeoutError) {
                    console.log(
                        `⚠️ No se pudo aplicar timeout a ${message.author.tag}: ${timeoutError.message}`,
                    );
                }
            }

            await message.delete();

            let actionText;
            if (isOwner) {
                actionText =
                    "⚠️ Dueño del servidor (sin timeout - limitación de Discord)";
            } else if (isStaff) {
                actionText = "⚠️ Advertencia al staff (sin timeout)";
            } else {
                actionText = timeoutApplied
                    ? this.messages.contentDetected.actionValue.replace(
                          "{duration}",
                          timeoutMinutes,
                      )
                    : "⚠️ Advertencia (timeout no aplicado - jerarquía de roles)";
            }

            const embedColor = isOwner || isStaff ? Colors.Yellow : Colors.Red;

            const mainEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(this.messages.contentDetected.title)
                .setDescription(this.messages.contentDetected.description)
                .addFields(
                    {
                        name: this.messages.contentDetected.userField,
                        value: `${message.author}`,
                        inline: true,
                    },
                    {
                        name: this.messages.contentDetected.contentTypeField,
                        value: contentType,
                        inline: true,
                    },
                    {
                        name: this.messages.contentDetected.detectionField,
                        value: `Confianza: ${Math.round(analysis.confidence * 100)}%`,
                        inline: true,
                    },
                    {
                        name: this.messages.contentDetected.actionField,
                        value: actionText,
                    },
                )
                .setTimestamp();

            if (isOwner) {
                mainEmbed.addFields({
                    name: "👑 Nota",
                    value: "El usuario es el dueño del servidor. Discord no permite moderarlo, pero se registró la infracción.",
                });
            } else if (isStaff) {
                mainEmbed.addFields({
                    name: "👮 Nota",
                    value: "El usuario es miembro del staff. No se aplicó timeout pero se registró la infracción.",
                });
            }

            let analysisEmbed;

            if (contentType === "Imagen") {
                analysisEmbed = new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(this.messages.imageAnalysis.title)
                    .addFields(
                        {
                            name: this.messages.imageAnalysis.contentField,
                            value: analysis.description || "N/A",
                        },
                        {
                            name: this.messages.imageAnalysis.nsfwField,
                            value: analysis.isNSFW ? "✅ Sí" : "❌ No",
                            inline: true,
                        },
                        {
                            name: this.messages.imageAnalysis.violenceField,
                            value:
                                analysis.isViolent || analysis.isGore
                                    ? "✅ Sí"
                                    : "❌ No",
                            inline: true,
                        },
                        {
                            name: this.messages.imageAnalysis.confidenceField,
                            value: `${Math.round(analysis.confidence * 100)}%`,
                            inline: true,
                        },
                    );

                if (analysis.warnings && analysis.warnings.length > 0) {
                    analysisEmbed.addFields({
                        name: "⚠️ Advertencias",
                        value: analysis.warnings.join("\n"),
                    });
                }
            } else if (contentType === "Video") {
                analysisEmbed = new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(this.messages.videoAnalysis.title)
                    .addFields(
                        {
                            name: this.messages.videoAnalysis
                                .transcriptionField,
                            value: (analysis.transcription || "N/A").substring(
                                0,
                                1024,
                            ),
                        },
                        {
                            name: this.messages.videoAnalysis.contentField,
                            value: (
                                analysis.visualDescription || "N/A"
                            ).substring(0, 1024),
                        },
                    );

                if (analysis.warnings && analysis.warnings.length > 0) {
                    analysisEmbed.addFields({
                        name: this.messages.videoAnalysis.warningField,
                        value: analysis.warnings.join("\n").substring(0, 1024),
                    });
                }
            } else if (contentType === "Enlace") {
                analysisEmbed = new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(this.messages.linkAnalysis.title)
                    .addFields(
                        {
                            name: this.messages.linkAnalysis.urlField,
                            value: url || "N/A",
                        },
                        {
                            name: this.messages.linkAnalysis.contentField,
                            value: (analysis.description || "N/A").substring(
                                0,
                                1024,
                            ),
                        },
                    );

                if (analysis.warnings && analysis.warnings.length > 0) {
                    analysisEmbed.addFields({
                        name: "⚠️ Advertencias",
                        value: analysis.warnings.join("\n"),
                    });
                }
            }

            await this.sendStaffLog(mainEmbed);
            if (analysisEmbed) {
                await this.sendStaffLog(analysisEmbed);
            }

            try {
                let dmDescription, dmTitle, dmColor, dmStatus;

                if (isOwner) {
                    dmTitle = "👑 Advertencia al dueño del servidor";
                    dmDescription = `Como dueño del servidor, has publicado contenido inapropiado que ha sido detectado automáticamente por nuestro sistema de IA. Esta es una advertencia oficial que ha sido registrada.`;
                    dmColor = Colors.Yellow;
                    dmStatus =
                        "Sin sanción (dueño del servidor - Discord no permite moderación)";
                } else if (isStaff) {
                    dmTitle = "👮 Advertencia al Staff";
                    dmDescription = `Como miembro del staff, has publicado contenido inapropiado que ha sido detectado automáticamente por nuestro sistema de IA. Esta es una advertencia oficial que ha sido registrada.`;
                    dmColor = Colors.Yellow;
                    dmStatus = "Sin sanción (miembro del staff)";
                } else {
                    dmTitle = "⚠️ Advertencia de Moderación";
                    dmDescription = `Has publicado contenido inapropiado que ha sido detectado automáticamente por nuestro sistema de IA.`;
                    dmColor = Colors.Red;
                    dmStatus = timeoutApplied
                        ? `Timeout de ${timeoutMinutes} minutos`
                        : "Advertencia registrada";
                }

                const dmEmbed = new EmbedBuilder()
                    .setColor(dmColor)
                    .setTitle(dmTitle)
                    .setDescription(dmDescription)
                    .addFields(
                        {
                            name: "📋 Tipo de contenido",
                            value: contentType,
                            inline: true,
                        },
                        {
                            name: "🔍 Detección",
                            value: `Confianza: ${Math.round(analysis.confidence * 100)}%`,
                            inline: true,
                        },
                        { name: "📊 Estado", value: dmStatus, inline: true },
                        {
                            name: "📝 Descripción",
                            value:
                                analysis.description ||
                                "Contenido inapropiado detectado",
                        },
                    )
                    .setFooter({ text: `Servidor: ${message.guild.name}` })
                    .setTimestamp();

                if (analysis.warnings && analysis.warnings.length > 0) {
                    dmEmbed.addFields({
                        name: "⚠️ Advertencias específicas",
                        value: analysis.warnings.join("\n"),
                    });
                }

                await message.author.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(
                    `No se pudo enviar DM a ${message.author.tag}: ${dmError.message}`,
                );
            }
        } catch (error) {
            console.error(
                `Error al manejar contenido sospechoso: ${error.message}`,
            );
        }
    }

    async downloadMedia(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith("https") ? https : http;

            protocol
                .get(url, (response) => {
                    const chunks = [];

                    response.on("data", (chunk) => chunks.push(chunk));
                    response.on("end", () => resolve(Buffer.concat(chunks)));
                    response.on("error", reject);
                })
                .on("error", reject);
        });
    }

    async logStaffAction(
        action,
        moderator,
        targetUser,
        reason,
        additionalFields = {},
    ) {
        const actionMessages = this.messages.staffActions[action];
        if (!actionMessages) return;

        const embed = new EmbedBuilder()
            .setColor(
                action === "kick"
                    ? Colors.Orange
                    : action === "ban"
                      ? Colors.Red
                      : Colors.Green,
            )
            .setTitle(actionMessages.title)
            .addFields(
                {
                    name: actionMessages.moderatorField,
                    value: `${moderator}`,
                    inline: true,
                },
                {
                    name: actionMessages.userField,
                    value: `${targetUser.tag}`,
                    inline: true,
                },
            )
            .setTimestamp();

        if (reason) {
            embed.addFields({
                name: actionMessages.reasonField,
                value: reason,
            });
        }

        for (const [key, value] of Object.entries(additionalFields)) {
            embed.addFields({ name: key, value: value, inline: true });
        }

        await this.sendStaffLog(embed);
    }
}

module.exports = ModerationSystem;
