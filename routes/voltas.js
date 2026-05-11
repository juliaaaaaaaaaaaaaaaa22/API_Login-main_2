const express = require('express');
const router = express.Router();
const db = require('../db');

// LISTAR TODAS AS VOLTAS
router.get('/', async (req, res) => {
    try {
        const [voltas] = await db.query(`
            SELECT v.*, c.nome AS corredor_nome, c.email AS corredor_email, c.turma, c.equipe
            FROM voltas v
            LEFT JOIN corredores c ON v.corredores_id = c.id
            ORDER BY v.data DESC
        `);
        res.json(voltas);
    } catch (error) {
        console.error('Erro ao buscar voltas: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

// CRIAR VOLTA
router.post('/', async (req, res) => {
    const { id_corredor, numero_volta, tempo } = req.body;

    if (!id_corredor || !numero_volta || !tempo) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO voltas (corredores_id, numero_volta, tempo, data) VALUES (?, ?, ?, NOW())',
            [id_corredor, numero_volta, tempo]
        );

        res.status(201).json({ 
            id: result.insertId, 
            id_corredor, 
            numero_volta, 
            tempo,
            data: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao criar volta: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

// OBTER VOLTA POR ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [volta] = await db.query('SELECT * FROM voltas WHERE id = ?', [id]);
        if (volta.length === 0) {
            return res.status(404).json({ erro: 'Volta não encontrada' });
        }
        res.json(volta[0]);
    } catch (error) {
        console.error('Erro ao buscar volta: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

// DELETAR VOLTA
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM voltas WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Volta não encontrada' });
        }
        res.json({ mensagem: 'Volta deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar volta: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

module.exports = router;