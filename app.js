const express = require('express');
const app = express();

// CORS para permitir o frontend consumir a API
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Rotas de usuário
const userRoutes = require('./routes/user');
const corredoresRoutes = require('./routes/corredores');
const voltasRoutes = require('./routes/voltas');

app.use('/users', userRoutes);
app.use('/corredores', corredoresRoutes);
app.use('/voltas', voltasRoutes);

module.exports = app;