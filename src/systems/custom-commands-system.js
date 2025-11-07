const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const fs = require("fs");

class CustomCommandsSystem {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.commandsFile = "./custom-commands-data.json";
        this.commands = this.loadCommands();
        this.setupListeners();
    }

    loadCommands() {
        try {
            if (fs.existsSync(this.commandsFile)) {
                const data = fs.readFileSync(this.commandsFile, "utf8");
                const parsed = JSON.parse(data);
                console.log(`📝 ${Object.keys(parsed.commands || {}).length} comandos personalizados cargados`);
                return parsed.commands || {};
            }
        } catch (error) {
            console.error("Error al cargar comandos personalizados:", error);
        }
        return {};
    }

    saveCommands() {
        try {
            const data = {
                commands: this.commands,
                lastUpdate: Date.now()
            };
            fs.writeFileSync(this.commandsFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error al guardar comandos personalizados:", error);
        }
    }

    isAllowedGuild(guildId) {
        if (!this.config.allowedGuildId) return true;
        return guildId === this.config.allowedGuildId;
    }

    hasStaffPermission(member) {
        // Si hay un rol de staff configurado, verificar si el usuario lo tiene
        if (this.config.customCommands && this.config.customCommands.staffRoleId) {
            return member.roles.cache.has(this.config.customCommands.staffRoleId);
        }
        // Si no hay rol configurado, verificar el permiso de Gestionar Mensajes (comportamiento por defecto)
        return member.permissions.has("ManageMessages");
    }

    setupListeners() {
        this.client.on("messageCreate", (message) => this.handleCustomCommand(message));
    }

    async handleCustomCommand(message) {
        if (message.author.bot) return;
        if (!message.guild) return;
        if (!this.isAllowedGuild(message.guild.id)) return;
        
        // Solo aceptar comandos que empiecen con !
        if (!message.content.startsWith("!")) return;

        const commandName = message.content.split(" ")[0].toLowerCase();
        const command = this.commands[commandName];

        if (!command) return;

        if (!command.enabled) return;

        try {
            // Borrar el mensaje del trigger para que solo se vea la respuesta
            await message.delete().catch(() => {});
            
            const embed = new EmbedBuilder()
                .setColor(command.color || "#5865F2")
                .setTimestamp();

            if (command.title) {
                embed.setTitle(command.title);
            }

            if (command.description) {
                embed.setDescription(command.description);
            }

            if (command.fields && command.fields.length > 0) {
                command.fields.forEach(field => {
                    embed.addFields({
                        name: field.name,
                        value: field.value,
                        inline: field.inline || false
                    });
                });
            }

            if (command.footer) {
                embed.setFooter({ text: command.footer });
            }

            if (command.image) {
                embed.setImage(command.image);
            }

            if (command.thumbnail) {
                embed.setThumbnail(command.thumbnail);
            }

            await message.channel.send({ embeds: [embed] });

            command.usageCount = (command.usageCount || 0) + 1;
            command.lastUsed = Date.now();
            command.lastUsedBy = message.author.id;
            this.saveCommands();

        } catch (error) {
            console.error("Error al enviar comando personalizado:", error);
        }
    }

    async handleCrearComando(interaction) {
        if (!this.isAllowedGuild(interaction.guild.id)) {
            await interaction.reply({
                content: "❌ Este comando no está disponible en este servidor.",
                flags: 64
            });
            return;
        }

        // Verificar permisos de staff
        if (!this.hasStaffPermission(interaction.member)) {
            const roleConfigured = this.config.customCommands && this.config.customCommands.staffRoleId;
            const requiredText = roleConfigured 
                ? "el rol de staff configurado" 
                : "el permiso de **Gestionar Mensajes**";
            
            await interaction.reply({
                content: `❌ No tienes permisos para gestionar comandos personalizados. Se requiere ${requiredText}.`,
                flags: 64
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "nuevo") {
            await this.showCreatePanel(interaction);
        } else if (subcommand === "editar") {
            const commandName = interaction.options.getString("comando");
            await this.showEditPanel(interaction, commandName);
        } else if (subcommand === "eliminar") {
            const commandName = interaction.options.getString("comando");
            await this.deleteCommand(interaction, commandName);
        } else if (subcommand === "listar") {
            await this.listCommands(interaction);
        }
    }

    async showCreatePanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("📝 Crear nuevo comando personalizado")
            .setDescription(
                "Los comandos personalizados se activan escribiéndolos con `!` al inicio.\n\n" +
                "**Ejemplos:**\n" +
                "• `!ayuda` - Comando de ayuda\n" +
                "• `!reglas` - Mostrar reglas\n" +
                "• `!info` - Información del servidor\n" +
                "• `!soporte` - Plantilla de soporte\n\n" +
                
                "Haz clic en el botón para crear tu comando."
            )
            .addFields(
                { name: "📋 Campos editables", value: "• Título del embed\n• Descripción\n• Color\n• Campos personalizados\n• Footer\n• Imagen/Thumbnail", inline: false },
                { name: "💡 Consejo", value: "Los comandos son perfectos para respuestas rápidas en tickets, plantillas de soporte, o mensajes repetitivos.", inline: false }
            )
            .setFooter({ text: "Solo el staff seleccionado puede crear comandos personalizados." })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("create_custom_command_step1")
                    .setLabel("📝 Crear Comando")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }

    async handleCreateStep1(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("custom_command_modal_basic")
            .setTitle("Crear comando personalizado - Información básica");

        const commandNameInput = new TextInputBuilder()
            .setCustomId("command_name")
            .setLabel("Nombre del comando comenzando con !")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("!ayuda")
            .setRequired(true)
            .setMaxLength(50);

        const titleInput = new TextInputBuilder()
            .setCustomId("command_title")
            .setLabel("Título del Embed")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ejemplo: Información de Soporte")
            .setRequired(true)
            .setMaxLength(256);

        const descriptionInput = new TextInputBuilder()
            .setCustomId("command_description")
            .setLabel("Descripción del Embed")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Escribe aquí el contenido principal del mensaje...")
            .setRequired(true)
            .setMaxLength(4000);

        const colorInput = new TextInputBuilder()
            .setCustomId("command_color")
            .setLabel("Color (HEX)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("#5865F2")
            .setRequired(false)
            .setMaxLength(7);

        const footerInput = new TextInputBuilder()
            .setCustomId("command_footer")
            .setLabel("Footer (texto inferior)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Soporte - Strangers RP")
            .setRequired(false)
            .setMaxLength(256);

        const row1 = new ActionRowBuilder().addComponents(commandNameInput);
        const row2 = new ActionRowBuilder().addComponents(titleInput);
        const row3 = new ActionRowBuilder().addComponents(descriptionInput);
        const row4 = new ActionRowBuilder().addComponents(colorInput);
        const row5 = new ActionRowBuilder().addComponents(footerInput);

        modal.addComponents(row1, row2, row3, row4, row5);

        await interaction.showModal(modal);
    }

    async handleCreateModalSubmit(interaction) {
        const commandName = interaction.fields.getTextInputValue("command_name").toLowerCase();
        const title = interaction.fields.getTextInputValue("command_title");
        const description = interaction.fields.getTextInputValue("command_description");
        const color = interaction.fields.getTextInputValue("command_color") || "#5865F2";
        const footer = interaction.fields.getTextInputValue("command_footer") || "";

        if (!commandName.startsWith("!")) {
            await interaction.reply({
                content: "❌ El nombre del comando debe empezar con `!` (ejemplo: !ayuda, !info)",
                flags: 64
            });
            return;
        }

        if (this.commands[commandName]) {
            await interaction.reply({
                content: `❌ El comando \`${commandName}\` ya existe. Usa \`/crear-comando editar\` para modificarlo.`,
                flags: 64
            });
            return;
        }

        this.commands[commandName] = {
            name: commandName,
            title: title,
            description: description,
            color: color,
            footer: footer,
            fields: [],
            image: null,
            thumbnail: null,
            enabled: true,
            createdBy: interaction.user.id,
            createdAt: Date.now(),
            usageCount: 0
        };

        this.saveCommands();

        const previewEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        if (footer) {
            previewEmbed.setFooter({ text: footer });
        }

        const confirmEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("✅ Comando creado exitosamente")
            .setDescription(
                `El comando \`${commandName}\` ha sido creado con éxito.\n\n` +
                `**Cómo usarlo:**\n` +
                `Escribe \`${commandName}\` en cualquier canal de tickets para enviar esta plantilla.\n\n` +
                `**Vista previa del comando:**`
            )
            .setTimestamp();

        const editRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`edit_command_fields:${commandName}`)
                    .setLabel("➕ Añadir campos")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`edit_command_images:${commandName}`)
                    .setLabel("🖼️ Añadir imágenes")
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ 
            embeds: [confirmEmbed, previewEmbed], 
            components: [editRow],
            flags: 64 
        });
    }

    async showEditPanel(interaction, commandName) {
        commandName = commandName.toLowerCase();
        if (!commandName.startsWith("!")) {
            commandName = "!" + commandName;
        }

        const command = this.commands[commandName];

        if (!command) {
            await interaction.reply({
                content: `❌ El comando \`${commandName}\` no existe.`,
                flags: 64
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle("✏️ Editar comando personalizado")
            .setDescription(`Editando: \`${commandName}\``)
            .addFields(
                { name: "Título", value: command.title || "Sin título", inline: true },
                { name: "Color", value: command.color || "#5865F2", inline: true },
                { name: "Campos", value: `${command.fields?.length || 0} campos`, inline: true },
                { name: "Usos", value: `${command.usageCount || 0} veces`, inline: true },
                { name: "Estado", value: command.enabled ? "🟢 Activo" : "🔴 Desactivado", inline: true }
            )
            .setTimestamp();

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`edit_command_basic:${commandName}`)
                    .setLabel("✏️ Editar info básica")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`edit_command_fields:${commandName}`)
                    .setLabel("📋 Gestionar campos")
                    .setStyle(ButtonStyle.Primary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`edit_command_images:${commandName}`)
                    .setLabel("🖼️ Añadir imágenes")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`preview_command:${commandName}`)
                    .setLabel("👁️ Vista previa")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`delete_command:${commandName}`)
                    .setLabel("🗑️ Eliminar")
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row1, row2], flags: 64 });
    }

    async deleteCommand(interaction, commandName) {
        commandName = commandName.toLowerCase();
        if (!commandName.startsWith("!")) {
            commandName = "!" + commandName;
        }

        if (!this.commands[commandName]) {
            await interaction.reply({
                content: `❌ El comando \`${commandName}\` no existe.`,
                flags: 64
            });
            return;
        }

        delete this.commands[commandName];
        this.saveCommands();

        await interaction.reply({
            content: `✅ El comando \`${commandName}\` ha sido eliminado exitosamente.`,
            flags: 64
        });
    }

    async listCommands(interaction) {
        const commandList = Object.values(this.commands);

        if (commandList.length === 0) {
            await interaction.reply({
                content: "❌ No hay comandos personalizados creados. Usa `/crear-comando nuevo` para crear uno.",
                flags: 64
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("📝 Comandos personalizados")
            .setDescription(`Total: ${commandList.length} comando(s)`)
            .setTimestamp();

        commandList.slice(0, 25).forEach(cmd => {
            const status = cmd.enabled ? "🟢" : "🔴";
            const uses = cmd.usageCount || 0;
            
            embed.addFields({
                name: `${status} ${cmd.name}`,
                value: `**Título:** ${cmd.title}\n**Usos:** ${uses} veces\n**ID:** \`${cmd.name}\``,
                inline: false
            });
        });

        if (commandList.length > 25) {
            embed.setFooter({ text: `Mostrando 25 de ${commandList.length} comandos` });
        }

        await interaction.reply({ embeds: [embed], flags: 64 });
    }

    async handleButtonInteraction(interaction) {
        const [action, ...params] = interaction.customId.split(":");
        const commandName = params.join(":");

        if (action === "create_custom_command_step1") {
            await this.handleCreateStep1(interaction);
        } else if (action === "edit_command_basic") {
            await this.showEditBasicModal(interaction, commandName);
        } else if (action === "edit_command_fields") {
            await this.showFieldsModal(interaction, commandName);
        } else if (action === "edit_command_images") {
            await this.showImagesModal(interaction, commandName);
        } else if (action === "preview_command") {
            await this.showPreview(interaction, commandName);
        } else if (action === "delete_command") {
            await this.deleteCommandFromButton(interaction, commandName);
        }
    }

    async showEditBasicModal(interaction, commandName) {
        const command = this.commands[commandName];

        const modal = new ModalBuilder()
            .setCustomId(`update_command_basic:${commandName}`)
            .setTitle("Editar información básica");

        const titleInput = new TextInputBuilder()
            .setCustomId("command_title")
            .setLabel("Título del embed")
            .setStyle(TextInputStyle.Short)
            .setValue(command.title || "")
            .setRequired(true)
            .setMaxLength(256);

        const descriptionInput = new TextInputBuilder()
            .setCustomId("command_description")
            .setLabel("Descripción del embed")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(command.description || "")
            .setRequired(true)
            .setMaxLength(4000);

        const colorInput = new TextInputBuilder()
            .setCustomId("command_color")
            .setLabel("Color (HEX)")
            .setStyle(TextInputStyle.Short)
            .setValue(command.color || "#5865F2")
            .setRequired(false)
            .setMaxLength(7);

        const footerInput = new TextInputBuilder()
            .setCustomId("command_footer")
            .setLabel("Footer")
            .setStyle(TextInputStyle.Short)
            .setValue(command.footer || "")
            .setRequired(false)
            .setMaxLength(256);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(footerInput)
        );

        await interaction.showModal(modal);
    }

    async showFieldsModal(interaction, commandName) {
        const modal = new ModalBuilder()
            .setCustomId(`add_field:${commandName}`)
            .setTitle("Añadir campo al embed");

        const fieldNameInput = new TextInputBuilder()
            .setCustomId("field_name")
            .setLabel("Nombre del campo")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ejemplo: Horarios de atención")
            .setRequired(true)
            .setMaxLength(256);

        const fieldValueInput = new TextInputBuilder()
            .setCustomId("field_value")
            .setLabel("Valor del campo")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ejemplo: Lunes a Viernes: 9AM - 6PM")
            .setRequired(true)
            .setMaxLength(1024);

        modal.addComponents(
            new ActionRowBuilder().addComponents(fieldNameInput),
            new ActionRowBuilder().addComponents(fieldValueInput)
        );

        await interaction.showModal(modal);
    }

    async showImagesModal(interaction, commandName) {
        const command = this.commands[commandName];

        const modal = new ModalBuilder()
            .setCustomId(`update_images:${commandName}`)
            .setTitle("Añadir imágenes al embed");

        const imageInput = new TextInputBuilder()
            .setCustomId("image_url")
            .setLabel("URL de la imagen grande")
            .setStyle(TextInputStyle.Short)
            .setValue(command.image || "")
            .setPlaceholder("https://ejemplo.com/imagen.png")
            .setRequired(false);

        const thumbnailInput = new TextInputBuilder()
            .setCustomId("thumbnail_url")
            .setLabel("URL del thumbnail (imagen pequeña)")
            .setStyle(TextInputStyle.Short)
            .setValue(command.thumbnail || "")
            .setPlaceholder("https://ejemplo.com/thumbnail.png")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(thumbnailInput)
        );

        await interaction.showModal(modal);
    }

    async showPreview(interaction, commandName) {
        const command = this.commands[commandName];

        const embed = new EmbedBuilder()
            .setColor(command.color || "#5865F2")
            .setTimestamp();

        if (command.title) embed.setTitle(command.title);
        if (command.description) embed.setDescription(command.description);
        if (command.footer) embed.setFooter({ text: command.footer });
        if (command.image) embed.setImage(command.image);
        if (command.thumbnail) embed.setThumbnail(command.thumbnail);

        if (command.fields && command.fields.length > 0) {
            command.fields.forEach(field => {
                embed.addFields({
                    name: field.name,
                    value: field.value,
                    inline: field.inline || false
                });
            });
        }

        await interaction.reply({ 
            content: `👁️ **Vista previa de \`${commandName}\`**`, 
            embeds: [embed], 
            flags: 64 
        });
    }

    async deleteCommandFromButton(interaction, commandName) {
        delete this.commands[commandName];
        this.saveCommands();

        await interaction.update({
            content: `✅ El comando \`${commandName}\` ha sido eliminado.`,
            embeds: [],
            components: []
        });
    }

    async handleModalSubmit(interaction) {
        const [action, ...params] = interaction.customId.split(":");
        const commandName = params.join(":");

        if (action === "custom_command_modal_basic") {
            await this.handleCreateModalSubmit(interaction);
        } else if (action === "update_command_basic") {
            await this.handleUpdateBasicModal(interaction, commandName);
        } else if (action === "add_field") {
            await this.handleAddFieldModal(interaction, commandName);
        } else if (action === "update_images") {
            await this.handleUpdateImagesModal(interaction, commandName);
        }
    }

    async handleUpdateBasicModal(interaction, commandName) {
        const command = this.commands[commandName];

        command.title = interaction.fields.getTextInputValue("command_title");
        command.description = interaction.fields.getTextInputValue("command_description");
        command.color = interaction.fields.getTextInputValue("command_color") || "#5865F2";
        command.footer = interaction.fields.getTextInputValue("command_footer") || "";

        this.saveCommands();

        await interaction.reply({
            content: `✅ Comando \`${commandName}\` actualizado correctamente.`,
            flags: 64
        });
    }

    async handleAddFieldModal(interaction, commandName) {
        const command = this.commands[commandName];

        const fieldName = interaction.fields.getTextInputValue("field_name");
        const fieldValue = interaction.fields.getTextInputValue("field_value");

        if (!command.fields) {
            command.fields = [];
        }

        command.fields.push({
            name: fieldName,
            value: fieldValue,
            inline: false
        });

        this.saveCommands();

        await interaction.reply({
            content: `✅ Campo añadido a \`${commandName}\`. Total de campos: ${command.fields.length}`,
            flags: 64
        });
    }

    async handleUpdateImagesModal(interaction, commandName) {
        const command = this.commands[commandName];

        const imageUrl = interaction.fields.getTextInputValue("image_url");
        const thumbnailUrl = interaction.fields.getTextInputValue("thumbnail_url");

        command.image = imageUrl || null;
        command.thumbnail = thumbnailUrl || null;

        this.saveCommands();

        await interaction.reply({
            content: `✅ Imágenes actualizadas para \`${commandName}\`.`,
            flags: 64
        });
    }
    async listAllCommands(interaction) {
        const commandsList = Object.values(this.commands);

        if (commandsList.length === 0) {
            await interaction.reply({
                content: "❌ No hay comandos personalizados creados aún.\n\nUsa `/crear-comando nuevo` para crear tu primer comando.",
                flags: 64
            });
            return;
        }

        // Filtrar solo comandos activos que empiecen con !
        const activeCommands = commandsList.filter(cmd => cmd.enabled && cmd.name.startsWith("!"));

        if (activeCommands.length === 0) {
            await interaction.reply({
                content: "❌ No hay comandos activos disponibles en este momento.",
                flags: 64
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("📋 Comandos personalizados disponibles")
            .setDescription(
                "Estos son todos los comandos personalizados que puedes usar en el servidor.\n" +
                "**Escribe el comando en el chat para usarlo.**\n\n"
            )
            .setFooter({ text: `${activeCommands.length} comando(s) disponible(s)` })
            .setTimestamp();

        // Agrupar comandos en un campo
        let commandsText = "";
        activeCommands
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(cmd => {
                const description = cmd.description 
                    ? (cmd.description.length > 60 ? cmd.description.substring(0, 60) + "..." : cmd.description)
                    : cmd.title || "Sin descripción";
                commandsText += `**${cmd.name}**\n${description}\n\n`;
            });

        // Discord tiene un límite de 1024 caracteres por campo
        if (commandsText.length > 1024) {
            // Dividir en múltiples campos si es necesario
            const chunks = [];
            let currentChunk = "";
            
            activeCommands.forEach(cmd => {
                const description = cmd.description 
                    ? (cmd.description.length > 60 ? cmd.description.substring(0, 60) + "..." : cmd.description)
                    : cmd.title || "Sin descripción";
                const line = `**${cmd.name}**\n${description}\n\n`;
                
                if ((currentChunk + line).length > 1024) {
                    chunks.push(currentChunk);
                    currentChunk = line;
                } else {
                    currentChunk += line;
                }
            });
            
            if (currentChunk) {
                chunks.push(currentChunk);
            }

            chunks.forEach((chunk, index) => {
                embed.addFields({
                    name: index === 0 ? "Comandos" : "\u200B",
                    value: chunk,
                    inline: false
                });
            });
        } else {
            embed.addFields({
                name: "Comandos",
                value: commandsText,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed], flags: 64 });
    }
}

module.exports = CustomCommandsSystem;
