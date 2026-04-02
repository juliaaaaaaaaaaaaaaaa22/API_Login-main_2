const express = require('express');
const corredoresRoutes = express.Router();
const db = require('../db');

corredoresRoutes.get('/', (req, res) => {
    db.query('SELECT * FROM corredores', (err, results) => {
        if (err) {
            console.error('Error fetching corredores:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json(results);
        }
    });
});

corredoresRoutes.post('/', (req, res) => {
    const { nome, email, senha, turma } = req.body;
    db.query('INSERT INTO corredores (nome, email, senha, turma) VALUES (?, ?, ?, ?)', [nome, email, senha, turma], (err, result) => {
        if (err) {
            console.error('Error adding piloto:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(201).json({ id: result.insertId, nome, email, senha, turma });
        }
    });
});

corredoresRoutes.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, turma } = req.body;
    db.query('UPDATE corredores SET nome = ?, email = ?, senha = ?, turma = ? WHERE id = ?', [nome, email, senha, turma, id], (err, result) => {
        if (err) {
            console.error('Error updating piloto:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ id, nome, email, senha, turma });
        }
    });
});

corredoresRoutes.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM corredores WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting piloto:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ message: 'Piloto deletado com sucesso' });
        }
    });
});

module.exports = corredoresRoutes;