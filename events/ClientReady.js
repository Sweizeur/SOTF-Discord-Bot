const { Events } = require('discord.js');
const pool = require('../database/database');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		try {
			const connection = await pool.getConnection();
			try {
				await connection.query('CREATE TABLE IF NOT EXISTS banwords (value VARCHAR(255))');
				await connection.query('CREATE TABLE IF NOT EXISTS configbanwords (name VARCHAR(255), value VARCHAR(255))');
				//insert default values if they don't exist
				await connection.query('INSERT INTO configbanwords (name, value) SELECT * FROM (SELECT "role", "1186832853577773186") AS tmp WHERE NOT EXISTS (SELECT name FROM configbanwords WHERE name = "role")');
				await connection.query('INSERT INTO configbanwords (name, value) SELECT * FROM (SELECT "channel", "1218730578271277236") AS tmp WHERE NOT EXISTS (SELECT name FROM configbanwords WHERE name = "channel")');
			} finally {
				connection.release();
			}
		} catch (error) {
			console.error('An error occurred while connecting to the database:', error);
		}
	},
};