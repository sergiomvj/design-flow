import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPrisma } from '../prisma/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[SERVER] Starting...');
console.log('[SERVER] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

let prisma: any;
try {
  prisma = getPrisma();
  console.log('[DATABASE] Connecting...');
  prisma.$connect()
    .then(() => console.log('[DATABASE] ✓ Connected'))
    .catch((err: any) => console.error('[DATABASE] ERROR:', err.message));
} catch (err: any) {
  console.error('[DATABASE] INIT ERROR:', err.message);
  prisma = null;
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

console.log('[SERVER] PORT:', PORT);

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: prisma ? 'ok' : 'no-db' });
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.post('/api/admin/setup', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const { email, password, name } = req.body;
  const secret = req.headers['x-admin-secret'];
  if (secret !== 'setup-admin-2024') {
    return res.status(403).json({ error: 'Invalid secret' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: 'ADMIN' },
    });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  console.log('[AUTH] Register:', email, 'role:', role || 'CLIENT');
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'CLIENT' },
    });
    console.log('[AUTH] Created:', user.id);
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err: any) {
    console.error('[AUTH] Error:', err.message);
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err: any) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/projects', async (_req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(projects);
});

app.get('/api/projects/:id', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/projects', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const data = { ...req.body, requesterId: decoded.userId };
    const project = await prisma.project.create({ data });
    res.json(project);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(project);
  } catch {
    res.status(400).json({ error: 'Update failed' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

console.log('[SERVER] Ready on port', PORT);
app.listen(Number(PORT), '0.0.0.0');