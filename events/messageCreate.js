const { Events } = require('discord.js');
const pool = require('../database/database');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;
        try {
            const connection = await pool.getConnection();
            try {
                await connection.connect();
                const banwords = [];
                const [rows, fields] = await connection.query('SELECT value FROM configbanwords WHERE name = "role"');
                const [rows1, fields1] = await connection.query('SELECT value FROM configbanwords WHERE name = "channel"');
                const banrole = message.guild.roles.cache.get(rows[0].value);
                const banchannel = message.guild.channels.cache.get(rows1[0].value);
                const [rows2, fields2] = await connection.query('SELECT * FROM banwords');
                if (rows2.length > 0 && rows2[0].value !== null) {
                    rows2.forEach(row2 => {
                        banwords.push(row2.value);
                    });
                }
                for (let word of banwords) {
                    if (message.content.toLowerCase().includes(word)) {
                        if (banchannel === "") {
                            if (banrole === "") {
                                await message.channel.send(`${message.author} a utilisé le mot banni:\n||${message.content}||`);
                            }
                            if (banrole !== "") {
                                await message.channel.send(`${banrole}\n${message.author} a utilisé le mot banni:\n${message.content}`);
                            }
                        }
                        if (banchannel !== "") {
                            if (banrole === "") {
                                await banchannel.send(`${message.author} a utilisé le mot banni:\n${message.content}`);
                            }
                            if (banrole !== "") {
                                await banchannel.send(`${banrole}\n${message.author} a utilisé le mot banni:\n${message.content}`);
                            }
                        }
                        message.delete();
                    }
                }
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('An error occurred while connecting to the database:', error);
        }
	},
};