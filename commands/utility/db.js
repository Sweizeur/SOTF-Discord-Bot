const { SlashCommandBuilder } = require('discord.js');
const pool = require('../../database/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('db')
        .setDescription('print database'),
    async execute(ctx) {
        try {
            const connection = await pool.getConnection();
            try {
                const [rows, fields] = await connection.query('SELECT * FROM banwords');
                const [rows1, fields1] = await connection.query('SELECT * FROM configbanwords');
                console.log(rows);
                console.log(rows1);
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('An error occurred while connecting to the database:', error);
        }
        await ctx.reply({ content: 'Check console for database output', ephemeral: true });
    }
};