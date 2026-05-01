import express from 'express';
import { pool } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Configura tu CLIENT_ID de Google
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'TU_CLIENT_ID.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const router = express.Router();

// Login/registro con Google
router.post('/google', async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) {
    return res.status(400).json({ error: 'Falta id_token' });
  }
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const google_id = payload?.sub;
    const username = (payload?.name || email?.split('@')[0] || '').substring(0, 50);
    if (!email || !google_id) {
      return res.status(400).json({ error: 'Token de Google inválido' });
    }
    // Buscar usuario por email
    let user = (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
    if (!user) {
      // Crear usuario si no existe
      const result = await pool.query(
        'INSERT INTO users (email, username, google_id, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, username, google_id, '']
      );
      user = result.rows[0];
    } else if (!user.google_id) {
      // Si existe pero no tiene google_id, lo actualiza
      await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [google_id, user.id]);
      user.google_id = google_id;
    }
    // Generar token JWT propio
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token de Google inválido' });
  }
});



// Registro de usuario
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
      [email, username, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'El email o usuario ya existe' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

export default router;
