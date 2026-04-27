const express = require('express');
const userRoutes = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Hash function (same as frontend)
function hashPwd(pwd) {
    return crypto.createHash('sha256').update(pwd + '_cowa_salt_2026').digest('hex');
}

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
        const [existing] = await db.query('SELECT id_users FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ erro: 'E-mail já cadastrado' });
        }
        const hashedSenha = hashPwd(senha);
        const [result] = await db.query(
            'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, hashedSenha]
        );
        res.status(201).json({ id: result.insertId, nome, email });
    } catch (error) {
        console.error('Erro ao criar usuário: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

// LOGIN
userRoutes.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    try {
        const hashedSenha = hashPwd(senha);
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND senha = ?', [email, hashedSenha]);
        if (users.length === 0) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }
        const user = users[0];
        res.json({ mensagem: 'Login bem-sucedido', user: { id: user.id_users, nome: user.nome, email: user.email } });
    } catch (error) {
        console.error('Erro ao fazer login: ', error.message);
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
        const hashedSenha = hashPwd(senha);
        const [result] = await db.query(
            'UPDATE users SET nome = ?, email = ?, senha = ? WHERE id_users = ?',
            [nome, email, hashedSenha, id]
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