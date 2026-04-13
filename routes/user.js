const express = require('express');
const userRoutes = express.Router();
const db = require('../db');

// LISTAR TODOS OS USUÁRIOS
userRoutes.get('/', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários: ', error.message);
        res.status(500).json({ erro: error.message });
    }   
});

// CRIAR USUÁRIO
userRoutes.post('/', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senha]
        );
        res.status(201).json({ id: result.insertId, nome, email });
    } catch (error) {
        console.error('Erro ao criar usuário: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

// ATUALIZAR USUÁRIO
userRoutes.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    try {
        const [result] = await db.query(
            'UPDATE users SET nome = ?, email = ?, senha = ? WHERE id_users = ?',
            [nome, email, senha, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.json({ mensagem: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

// DELETAR USUÁRIO
userRoutes.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM users WHERE id_users = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.json({ mensagem: 'Usuário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir usuário: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

module.exports = userRoutes;