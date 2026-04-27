const mysql = require('mysql2/promise');
require('dotenv').config();

const testConnection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        console.log('✅ Conexão com MySQL bem-sucedida!');
        await connection.end();
    } catch (error) {
        console.error('❌ Erro ao conectar com MySQL:', error.message);
        console.log('\nVerifique as variáveis no .env:');
        console.log(`DB_HOST: ${process.env.DB_HOST}`);
        console.log(`DB_USER: ${process.env.DB_USER}`);
        console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD}`);
        console.log(`DB_NAME: ${process.env.DB_NAME}`);
        console.log(`DB_PORT: ${process.env.DB_PORT}`);
    }
};

testConnection();
