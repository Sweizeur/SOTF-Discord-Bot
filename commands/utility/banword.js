const { SlashCommandBuilder } = require('discord.js');
const { adminID } = process.env;
const embeds = require('../../embeds/embeds').embeds;
const pool = require('../../database/database');

function banword_add(ctx, word, connection) {
	connection.query('INSERT INTO banwords (value) SELECT ? WHERE NOT EXISTS (SELECT * FROM banwords WHERE value = ?)', [word.toLowerCase(), word.toLowerCase()], (err, result) => {if (err) throw err;});
	ctx.reply({ embeds: [embeds['banword'].banword_embed(
		"Le mot ci-dessous a été ajouté à la liste des mots bannis.",
		word,
		"#78ff66"
	)], ephemeral: true });
}

function banword_remove(ctx, word, connection) {
	connection.query('DELETE FROM banwords WHERE LOWER(value) = ?', [word.toLowerCase()], (err, result) => {if (err) throw err;});
	ctx.reply({ embeds: [embeds['banword'].banword_embed(
		"Le mot ci-dessous a été retiré de la liste des mots bannis.",
		word,
		"#78ff66"
	)], ephemeral: true });
}

function banword_setrole(ctx, word, connection) {
	const banrole = ctx.guild.roles.cache.get(word);
	if (!banrole) {
		ctx.reply({ embeds: [embeds['error'].error_embed(
			"Ce rôle n'existe pas."
			)] , ephemeral: true
		});
	} else {
		connection.query('UPDATE configbanwords SET value = ? WHERE name = "role"', [banrole.id], (err, result) => {if (err) throw err;});
		ctx.reply({ embeds: [embeds['banword'].banword_embed(
			"Le rôle ci dessous a été défini comme rôle des mots bannis.",
			banrole.name,
			"#78ff66"
			)] , ephemeral: true
		});
	}
}

function banword_setchannel(ctx, word, connection) {
	const banchannel = ctx.guild.channels.cache.get(word);
	if (!banchannel) {
		ctx.reply({ embeds: [embeds['error'].error_embed(
			"Ce salon n'existe pas."
			)] , ephemeral: true
		});
	} else {
		connection.query('UPDATE configbanwords SET value = ? WHERE name = "channel"', [banchannel.id], (err, result) => {if (err) throw err;});
		ctx.reply({ embeds: [embeds['banword'].banword_embed(
			"Le salon ci dessous a été défini comme salon des mots bannis.",
			banchannel.name,
			"#78ff66"
			)] , ephemeral: true
		});
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banword')
		.setDescription('Gère la liste des mots bannis.')
		.addStringOption(option =>
			option.setName('action')
				.setDescription('Action à effectuer.')
				.setRequired(true)
				.addChoices(
					{ name: 'add', value: 'add' },
					{ name: 'remove', value: 'remove' },
					{ name: 'setrole', value: 'setrole' },
					{ name: 'setchannel', value: 'setchannel' },
				),
			)
		.addStringOption(option =>
			option.setName('word')
				.setDescription('Mot à ajouter ou retirer de la liste des mots bannis.')
				.setRequired(true)
		),
	async execute(ctx) {
		const action = ctx.options.getString('action');
		const word = ctx.options.getString('word');
		try {
			const connection = await pool.getConnection();
			const [banrole, fields] = await connection.query('SELECT value FROM configbanwords WHERE name = "role"');
			if (ctx.member.roles.cache.get(banrole[0].value) || ctx.member.id === adminID) {
				try {
					await connection.connect();
					if (action === "add")
						banword_add(ctx, word, connection);
					if (action === "remove")
						banword_remove(ctx, word, connection);
					if (action === "setrole")
						banword_setrole(ctx, word, connection);
					if (action === "setchannel")
						banword_setchannel(ctx, word, connection);
				} finally {
					connection.release();
				}
			} else {
				ctx.reply({ embeds: [embeds['error'].error_embed(
					"Vous n'avez pas la permission d'utiliser cette commande."
					)] , ephemeral: true
				});
			}
		} catch (error) {
			console.error('An error occurred while connecting to the database:', error);
		}
	},
};