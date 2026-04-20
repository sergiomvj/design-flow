import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[SERVER] Starting...');
console.log('[SERVER] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const dbUrl = process.env.DATABASE_URL;
let prisma: any;

if (dbUrl) {
  try {
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    console.log('[DATABASE] Connecting...');
    prisma.$connect()
      .then(() => console.log('[DATABASE] OK'))
      .catch((err: any) => console.error('[DATABASE] ERROR:', err.message));
  } catch (err: any) {
    console.error('[DATABASE] INIT ERROR:', err.message);
    prisma = null;
  }
} else {
  console.warn('[DATABASE] No URL, skipping Prisma');
  prisma = null;
}

const app = express();
const PORT = process.env.PORT || 3001;
console.log('[SERVER] PORT:', PORT);

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'CLIENT' },
    });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err: any) {
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
    const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res: any) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
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

app.post('/api/projects', authenticate, async (req: any, res: any) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const data = { ...req.body, requesterId: req.userId };
  const project = await prisma.project.create({ data });
  res.json(project);
});

app.put('/api/projects/:id', authenticate, async (req: any, res: any) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(project);
});

app.get('/api/projects/:id/comments', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const comments = await prisma.comment.findMany({
    where: { projectId: req.params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(comments);
});

app.post('/api/projects/:id/comments', authenticate, async (req: any, res: any) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const comment = await prisma.comment.create({
    data: { text: req.body.text, userId: req.userId, projectId: req.params.id },
  });
  res.json(comment);
});

app.patch('/api/projects/:id/assign', authenticate, async (req: any, res: any) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const { designerId } = req.body;
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { designerId, status: 'IN_CREATION' },
  });
  res.json(project);
});

app.get('/api/users', authenticate, async (_req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  res.json(users);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

console.log('[SERVER] Listening on port', PORT);
app.listen(Number(PORT), '0.0.0.0');