// (Eliminado: no debe haber código antes de los imports)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { pool } from './db';
import { authenticateJWT } from './authMiddleware';

import authRouter from './auth';
import authGoogleRouter from './authGoogle';

const app = express();
const allowedOrigins = [];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
const port = process.env.PORT || 3001;

app.use(express.json());

// Rutas de autenticación

app.use('/auth', authRouter);
app.use('/api/auth', authGoogleRouter);

app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Endpoint keep-alive para self-ping
app.get('/api/_app_ping', (req, res) => {
  res.status(200).send('pong');
});

// Endpoint para listar categorías
app.get('/categories', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar categorías' });
  }
});

// Endpoint para crear una categoría
app.post('/categories', authenticateJWT, async (req, res) => {
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
// Endpoint para listar movimientos (con nombre de categoría)
// Si ?historical=false, solo trae movimientos no históricos
app.get('/movements', authenticateJWT, async (req, res) => {
  try {
    const historicalFilter = req.query.historical === 'false' ? 'WHERE m.is_historical = FALSE' : '';
    const result = await pool.query(`
      SELECT m.*, c.name AS category
      FROM movements m
      LEFT JOIN categories c ON m.category_id = c.id
      ${historicalFilter}
      ORDER BY m.id ASC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar movimientos' });
  }
});

// Endpoint para crear un movimiento
app.post('/movements', authenticateJWT, async (req, res) => {
  const { type, category_id, amount, date } = req.body;
  if (!type || !category_id || amount == null || !date) {
    return res.status(400).json({ error: 'Faltan campos requeridos: type, category_id, amount, date' });
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

// Endpoint para editar un movimiento existente
app.patch('/movements/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { type, category_id, amount, date } = req.body;
  if (!type && !category_id && !amount && !date) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  // Construir consulta dinámica según los campos presentes
  const fields = [];
  const values = [];
  let idx = 1;
  if (type) { fields.push(`type = $${idx++}`); values.push(type); }
  if (category_id) { fields.push(`category_id = $${idx++}`); values.push(category_id); }
  if (amount) { fields.push(`amount = $${idx++}`); values.push(amount); }
  if (date) { fields.push(`date = $${idx++}`); values.push(date); }
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  try {
    const result = await pool.query(
      `UPDATE movements SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      [...values, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar movimiento' });
  }
});

// Endpoint para cerrar el mes actual (marca movimientos como históricos)
app.post('/months/close', authenticateJWT, async (req, res) => {
  const { year, month } = req.body;
  if (!year || !month) {
    return res.status(400).json({ error: 'Faltan year y month' });
  }
  const monthNum = parseInt(month, 10);
  try {
    const result = await pool.query(
      `UPDATE movements SET is_historical = TRUE WHERE year = $1 AND month = $2 RETURNING *`,
      [year, monthNum]
    );
    res.json({
      message: `Mes ${year}-${month} cerrado`,
      closedCount: result.rowCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cerrar mes' });
  }
});

// Endpoint para eliminar un movimiento individual
app.delete('/movements/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM movements WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }
    res.json({ message: 'Movimiento eliminado correctamente', movement: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar movimiento' });
  }
});

app.listen(port, () => {
  // Self-ping para Render Free Tier (puede ser bloqueado por Render)
  const selfUrl = process.env.API_BASE_URL;
  if (process.env.NODE_ENV === 'production' && selfUrl) {
    const interval = 14 * 60 * 1000; // 14 minutos
    setInterval(async () => {
      try {
        await fetch(`${selfUrl}/api/_app_ping`);
      } catch (err) {
        // Se puede agregar log si es necesario
      }
    }, interval);
  }
});