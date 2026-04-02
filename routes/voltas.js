const express = require('express');
const router = express.Router();
const db = require('../db');

// ==================== INICIAR VOLTA ====================
router.post('/iniciar', async (req, res) => {
  const { id_corredor } = req.body;

  if (!id_corredor) {
    return res.status(400).json({ erro: 'id_corredor é obrigatório' });
  }

  try {
    const [result] = await db.execute(`
      INSERT INTO voltas (id_corredor, data_hora_inicio, status)
      VALUES (?, NOW(3), 'em_andamento')
    `, [id_corredor]);

    res.status(201).json({
      sucesso: true,
      id_volta: result.insertId,
      mensagem: 'Volta iniciada com sucesso!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao iniciar volta' });
  }
});

// ==================== PEGAR TEMPO ATUAL (AO VIVO) ====================
router.get('/tempo-atual/:id_corredor', async (req, res) => {
  const { id_corredor } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT 
        id_volta,
        id_corredor,
        data_hora_inicio,
        TIMESTAMPDIFF(MICROSECOND, data_hora_inicio, NOW(3)) DIV 1000 AS tempo_ms,
        status
      FROM voltas 
      WHERE id_corredor = ? 
        AND status = 'em_andamento'
      ORDER BY id_volta DESC 
      LIMIT 1
    `, [id_corredor]);

    if (rows.length === 0) {
      return res.json({ em_andamento: false, mensagem: 'Nenhuma volta em andamento' });
    }

    const volta = rows[0];
    const minutos = Math.floor(volta.tempo_ms / 60000);
    const segundos = Math.floor((volta.tempo_ms % 60000) / 1000);
    const milis = volta.tempo_ms % 1000;

    const tempo_formatado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milis.toString().padStart(3, '0')}`;

    res.json({
      em_andamento: true,
      id_volta: volta.id_volta,
      tempo_ms: volta.tempo_ms,
      tempo_formatado,
      data_hora_inicio: volta.data_hora_inicio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar tempo' });
  }
});

// ==================== FINALIZAR VOLTA ====================
router.post('/finalizar', async (req, res) => {
  const { id_volta } = req.body;

  if (!id_volta) {
    return res.status(400).json({ erro: 'id_volta é obrigatório' });
  }

  try {
    const [result] = await db.execute(`
      UPDATE voltas 
      SET data_hora_fim = NOW(3),
          tempo_volta_ms = TIMESTAMPDIFF(MICROSECOND, data_hora_inicio, NOW(3)) DIV 1000,
          status = 'finalizada'
      WHERE id_volta = ? AND status = 'em_andamento'
    `, [id_volta]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Volta não encontrada ou já finalizada' });
    }

    res.json({ sucesso: true, mensagem: 'Volta finalizada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao finalizar volta' });
  }
});

module.exports = router;