import express from 'express';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { pool } from './db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const router = express.Router();

// Paso 1: Redirige a Google
router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// Paso 2: Callback de Google
router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('No code provided');

  // Intercambia el code por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  const id_token = tokenData.id_token;
  if (!id_token) return res.status(400).send('No id_token');

  // Decodifica el id_token
  const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
  const email = payload.email;
  const google_id = payload.sub;
  const username = (payload.name || email?.split('@')[0] || '').substring(0, 50);
  if (!email || !google_id) return res.status(400).send('Token inválido');

  // Busca o crea usuario
  let user = (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
  if (!user) {
    const result = await pool.query(
      'INSERT INTO users (email, username, google_id, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, username, google_id, '']
    );
    user = result.rows[0];
  } else if (!user.google_id) {
    await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [google_id, user.id]);
    user.google_id = google_id;
  }

  // Genera tu propio JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  // Redirige al frontend con el JWT
  res.redirect(`https://finlog-green.vercel.app/?jwt=${token}`);
});

export default router;
