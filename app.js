const express = require('express');
const app = express();

app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Rotas de usuário
const userRoutes = require('./routes/user');
const corredoresRoutes = require('./routes/corredores');
const voltasRoutes = require('./routes/voltas');
const rankingRoutes = require('./routes/ranking');

app.use('/users', userRoutes);
app.use('/corredores', corredoresRoutes);
app.use('/voltas', voltasRoutes);
app.use('/ranking', rankingRoutes);

module.exports = app;