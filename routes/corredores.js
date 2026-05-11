const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Hash function (same as frontend)
function hashPwd(pwd) {
    return crypto.createHash('sha256').update(pwd + '_cowa_salt_2026').digest('hex');
}

// LISTAR TODOS OS CORREDORES COM ESTATÍSTICAS
router.get('/', async (req, res) => {
    try {
        const [corredores] = await db.query(`
            SELECT c.*,
                   COUNT(v.id) AS total_voltas,
                   MIN(v.tempo) AS melhor_tempo,
                   AVG(v.tempo) AS tempo_medio,
                   SUM(v.tempo) AS tempo_total
            FROM corredores c
            LEFT JOIN voltas v ON c.id = v.corredores_id
            GROUP BY c.id
            ORDER BY c.nome
        `);
        res.json(corredores);
    } catch (error) {
        console.error('Erro ao buscar corredores: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

// CRIAR CORREDOR
router.post('/', async (req, res) => {
    const { nome, email, senha, turma, equipe } = req.body;

    if (!nome || !email || !senha || !turma || !equipe) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM corredores WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ erro: 'E-mail já cadastrado' });
        }

        const hashedSenha = hashPwd(senha);
        const [result] = await db.query(
            'INSERT INTO corredores (nome, email, senha, turma, equipe) VALUES (?, ?, ?, ?, ?)',
            [nome, email, hashedSenha, turma, equipe]
        );

        res.status(201).json({ id: result.insertId, nome, email, turma, equipe });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});


// OBTER CORREDOR POR ID COM VOLTAS
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [corredor] = await db.query(`
            SELECT c.*,
                   COUNT(v.id) AS total_voltas,
                   MIN(v.tempo) AS melhor_tempo,
                   AVG(v.tempo) AS tempo_medio,
                   SUM(v.tempo) AS tempo_total
            FROM corredores c
            LEFT JOIN voltas v ON c.id = v.corredores_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [id]);

        if (corredor.length === 0) {
            return res.status(404).json({ erro: 'Corredor não encontrado' });
        }

        const [voltas] = await db.query('SELECT * FROM voltas WHERE corredores_id = ? ORDER BY numero_volta', [id]);

        res.json({ ...corredor[0], voltas });
    } catch (error) {
        console.error('Erro ao buscar corredor: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, turma, equipe } = req.body;

    if (!nome || !email || !turma || !equipe) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    try {
        const hashedSenha = senha ? hashPwd(senha) : undefined;
        const query = hashedSenha
            ? 'UPDATE corredores SET nome = ?, email = ?, senha = ?, turma = ?, equipe = ? WHERE id = ?'
            : 'UPDATE corredores SET nome = ?, email = ?, turma = ?, equipe = ? WHERE id = ?';
        
        const params = hashedSenha
            ? [nome, email, hashedSenha, turma, equipe, id]
            : [nome, email, turma, equipe, id];

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Corredor não encontrado' });
        }

        res.json({ mensagem: 'Corredor atualizado com sucesso' });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// DELETAR CORREDOR
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM corredores WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Corredor não encontrado' });
        }
        res.json({ mensagem: 'Corredor deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar corredor: ', error.message);
        res.status(500).json({ erro: error.message });
    }
});

module.exports = router;