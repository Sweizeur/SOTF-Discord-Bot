const { adminID, BD_HOST, BD_USER, BD_PASS, BD_NAME} = process.env;
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: BD_HOST,
    user: BD_USER,
    password: BD_PASS,
    database: BD_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;