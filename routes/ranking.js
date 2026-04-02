const express = require('express');
const router = express.Router();
const db = require('../db');

// ==================== RANKING POR GP ====================
// Retorna o ranking de corredores para cada GP
// Métrica: melhor volta (tempo mínimo) em cada GP
router.get('/por-gp', (req, res) => {
  const query = `
    SELECT 
      DATE(v.data_hora_inicio) AS data_gp,
      c.id,
      c.nome,
      MIN(v.tempo_volta_ms) AS melhor_tempo_ms,
      COUNT(v.id_volta) AS total_voltas
    FROM voltas v
    INNER JOIN corredores c ON v.id_corredor = c.id
    WHERE v.status = 'finalizada' AND v.tempo_volta_ms IS NOT NULL
    GROUP BY DATE(v.data_hora_inicio), c.id
    ORDER BY data_gp DESC, melhor_tempo_ms ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar ranking por GP:', err);
      return res.status(500).json({ erro: 'Erro ao buscar ranking por GP' });
    }

    // Formatar resultados agrupados por GP
    const rankingPorGp = {};
    let posicao = {};

    results.forEach((row) => {
      const dataGp = row.data_gp;

      if (!rankingPorGp[dataGp]) {
        rankingPorGp[dataGp] = [];
        posicao[dataGp] = 1;
      }

      rankingPorGp[dataGp].push({
        posicao: posicao[dataGp],
        id_corredor: row.id,
        nome: row.nome,
        melhor_tempo_ms: row.melhor_tempo_ms,
        total_voltas: row.total_voltas,
        melhor_tempo_formatado: formatarTempo(row.melhor_tempo_ms)
      });

      posicao[dataGp]++;
    });

    // Converter objeto para array de GPs
    const resposta = Object.entries(rankingPorGp).map(([dataGp, corredores]) => ({
      gp: dataGp,
      corredores
    }));

    res.json({
      sucesso: true,
      total_gps: resposta.length,
      gps: resposta
    });
  });
});

// ==================== RANKING DE UM GP ESPECÍFICO ====================
// Retorna o ranking de corredores para um GP específico
router.get('/por-gp/:data_gp', (req, res) => {
  const { data_gp } = req.params;

  const query = `
    SELECT 
      c.id,
      c.nome,
      MIN(v.tempo_volta_ms) AS melhor_tempo_ms,
      COUNT(v.id_volta) AS total_voltas,
      AVG(v.tempo_volta_ms) AS tempo_medio_ms
    FROM voltas v
    INNER JOIN corredores c ON v.id_corredor = c.id
    WHERE DATE(v.data_hora_inicio) = ? 
      AND v.status = 'finalizada' 
      AND v.tempo_volta_ms IS NOT NULL
    GROUP BY c.id
    ORDER BY melhor_tempo_ms ASC
  `;

  db.query(query, [data_gp], (err, results) => {
    if (err) {
      console.error('Erro ao buscar ranking:', err);
      return res.status(500).json({ erro: 'Erro ao buscar ranking' });
    }

    if (results.length === 0) {
      return res.json({ 
        sucesso: true, 
        gp: data_gp,
        corredores: [],
        mensagem: 'Nenhuma volta finalizada neste GP' 
      });
    }

    const corredores = results.map((row, index) => ({
      posicao: index + 1,
      id_corredor: row.id,
      nome: row.nome,
      melhor_tempo_ms: row.melhor_tempo_ms,
      tempo_medio_ms: Math.round(row.tempo_medio_ms),
      total_voltas: row.total_voltas,
      melhor_tempo_formatado: formatarTempo(row.melhor_tempo_ms),
      tempo_medio_formatado: formatarTempo(Math.round(row.tempo_medio_ms))
    }));

    res.json({
      sucesso: true,
      gp: data_gp,
      total_corredores: corredores.length,
      corredores
    });
  });
});

// ==================== RANKING GERAL (TODOS OS TEMPOS) ====================
// Retorna o melhor tempo geral de cada corredor (de todos os GPs)
router.get('/geral', (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.nome,
      MIN(v.tempo_volta_ms) AS melhor_tempo_ms,
      COUNT(v.id_volta) AS total_voltas,
      AVG(v.tempo_volta_ms) AS tempo_medio_ms,
      COUNT(DISTINCT DATE(v.data_hora_inicio)) AS total_gps
    FROM voltas v
    INNER JOIN corredores c ON v.id_corredor = c.id
    WHERE v.status = 'finalizada' AND v.tempo_volta_ms IS NOT NULL
    GROUP BY c.id
    ORDER BY melhor_tempo_ms ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar ranking geral:', err);
      return res.status(500).json({ erro: 'Erro ao buscar ranking geral' });
    }

    if (results.length === 0) {
      return res.json({ 
        sucesso: true, 
        corredores: [],
        mensagem: 'Nenhuma volta finalizada' 
      });
    }

    const corredores = results.map((row, index) => ({
      posicao: index + 1,
      id_corredor: row.id,
      nome: row.nome,
      melhor_tempo_ms: row.melhor_tempo_ms,
      tempo_medio_ms: Math.round(row.tempo_medio_ms),
      total_voltas: row.total_voltas,
      total_gps: row.total_gps,
      melhor_tempo_formatado: formatarTempo(row.melhor_tempo_ms),
      tempo_medio_formatado: formatarTempo(Math.round(row.tempo_medio_ms))
    }));

    res.json({
      sucesso: true,
      total_corredores: corredores.length,
      corredores
    });
  });
});

// ==================== FUNÇÃO AUXILIAR: FORMATAR TEMPO ====================
function formatarTempo(tempoMs) {
  if (!tempoMs) return '00:00.000';
  
  const minutos = Math.floor(tempoMs / 60000);
  const segundos = Math.floor((tempoMs % 60000) / 1000);
  const milis = tempoMs % 1000;

  return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milis.toString().padStart(3, '0')}`;
}

module.exports = router;
