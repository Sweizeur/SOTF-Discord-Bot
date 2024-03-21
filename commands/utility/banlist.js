const { SlashCommandBuilder } = require('discord.js');
const { adminID} = process.env;
const embeds = require('../../embeds/embeds').embeds;
const pool = require('../../database/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banlist')
        .setDescription('Renvoie la liste des mots bannis.'),
    async execute(ctx) {
		try {
			const connection = await pool.getConnection();
			const [banrole, fields] = await connection.query('SELECT value FROM configbanwords WHERE name = "role"');
			if (ctx.member.roles.cache.get(banrole[0].value) || ctx.member.id === adminID) {
				try {
					const banlist = [];
					await connection.connect();
					const [rows, fields] = await connection.query('SELECT * FROM banwords');

					if (rows.length > 0 && rows[0].value !== null) {
						rows.forEach(row => {
							banlist.push(row.value);
						});
						ctx.reply({ embeds: [embeds['banlist'].banlist_embed(banlist.join(', '))], ephemeral: true });
					} else {
						ctx.reply({ embeds: [embeds['error'].error_embed(
							"Aucun mot n'a été banni."
							)] , ephemeral: true
						});
					}
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
			
    }
};