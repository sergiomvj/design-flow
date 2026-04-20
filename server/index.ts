import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });


console.log('[DATABASE] Initializing Prisma with SQLite adapter...');
prisma.$connect()
  .then(() => console.log('[DATABASE] Connection successful.'))
  .catch(err => console.error('[DATABASE] Connection failed:', err));

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

app.use(cors());
app.use(express.json());

// --- Static Files ---
// In production, the backend serves the frontend from the 'dist' folder
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// --- Request Logger ---
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path}`);
  next();
});

// --- Root Diagnostic Route ---
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Design Flow API Server is running',
    status: 'Operational'
  });
});

// --- Authentication Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  console.log(`[AUTH] Registration attempt for: ${email}`);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });
    console.log(`[AUTH] User created successfully: ${user.id}`);
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err: any) {
    console.error('[AUTH] Registration error:', err);
    res.status(400).json({ error: 'User already exists or database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt for: ${email}`);
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[AUTH] Login failed: User not found (${email})`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Password mismatch (${email})`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    console.log(`[AUTH] Login successful: ${user.email}`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err: any) {
    console.error('[AUTH] Login internal error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res: any) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

app.get('/api/auth/team', authenticate, async (req: any, res: any) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  res.json(users);
});

// --- Project Routes ---
app.post('/api/projects', authenticate, async (req: any, res: any) => {
  try {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        requesterId: req.userId,
      },
    });
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects', authenticate, async (req: any, res: any) => {
  let where = {};
  if (req.userRole === 'CLIENT') {
    where = { requesterId: req.userId };
  }
  
  const projects = await prisma.project.findMany({
    where,
    include: { requester: { select: { name: true } }, designer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
});

app.get('/api/projects/:id', authenticate, async (req: any, res: any) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { requester: true, designer: true, comments: { include: { user: true } } },
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.patch('/api/projects/:id', authenticate, async (req: any, res: any) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Dashboard Stats ---
app.get('/api/dashboard/stats', authenticate, async (req: any, res: any) => {
  const stats = await prisma.project.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  res.json(stats);
});

// --- SPA Fallback ---
// Handle React Router paths by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
