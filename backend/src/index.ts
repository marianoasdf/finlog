import express from 'express';
import { pool } from './db';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Endpoint keep-alive para self-ping
app.get('/api/_app_ping', (req, res) => {
  res.status(200).send('pong');
});

// Endpoint para crear una categoría
app.post('/categories', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Falta el nombre de la categoría' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    // Manejo de error por categoría duplicada
    if (err.code === '23505') {
      res.status(409).json({ error: 'La categoría ya existe' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
});

// Endpoint para listar movimientos
app.get('/movements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movements ORDER BY date DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar movimientos' });
  }
});

// Endpoint para crear un movimiento
app.post('/movements', async (req, res) => {
  const { type, category_id, amount, date } = req.body;
  if (!type || !category_id || !amount || !date) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO movements (type, category_id, amount, date) VALUES ($1, $2, $3, $4) RETURNING *`,
      [type, category_id, amount, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear movimiento' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);

  // Self-ping para Render Free Tier (puede ser bloqueado por Render)
  const selfUrl = process.env.API_BASE_URL;
  if (process.env.NODE_ENV === 'production' && selfUrl) {
    const interval = 14 * 60 * 1000; // 14 minutos
    setInterval(async () => {
      try {
        const res = await fetch(`${selfUrl}/api/_app_ping`);
        console.log(`[keep-alive] ping ${res.status}`);
      } catch (err) {
        console.warn('[keep-alive] ping falló:', (err instanceof Error ? err.message : err));
      }
    }, interval);
    console.log(`[keep-alive] self-ping activo cada ${interval / 60000} min → ${selfUrl}api/_app_ping`);
  }
});