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

const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = Number(process.env.PORT || 3001);
const distPath = path.join(__dirname, '../dist');

type AppRole = 'ADMIN' | 'DESIGNER' | 'CLIENT';

interface AuthRequest extends express.Request {
  userId?: string;
  userRole?: AppRole;
}

function isPrivileged(role?: string) {
  return role === 'ADMIN' || role === 'DESIGNER';
}

function projectWhereForRole(userId: string, role: AppRole) {
  if (role === 'CLIENT') {
    return { requesterId: userId };
  }

  return {};
}

function canAccessProject(
  requesterId: string,
  _designerId: string | null,
  userId: string,
  role: AppRole,
) {
  if (role === 'ADMIN' || role === 'DESIGNER') {
    return true;
  }

  return requesterId === userId;
}

function authenticate(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: AppRole };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

app.use(cors());
app.use(express.json());
app.use(express.static(distPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CLIENT',
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered' });
    }

    console.error('[AUTH] Registration failed:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AUTH] Login failed:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

app.get('/api/users', authenticate, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json(users);
});

app.get('/api/auth/team', authenticate, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json(users);
});

app.get('/api/dashboard/stats', authenticate, async (req: AuthRequest, res) => {
  const where = projectWhereForRole(req.userId!, req.userRole!);
  const grouped = await prisma.project.groupBy({
    by: ['status'],
    where,
    _count: { _all: true },
  });

  const counts = Object.fromEntries(grouped.map((item) => [item.status, item._count._all]));
  const totalProjects = grouped.reduce((sum, item) => sum + item._count._all, 0);

  res.json({
    totalProjects,
    activeProjects:
      (counts.RECEIVED || 0) +
      (counts.IN_CREATION || 0) +
      (counts.WAITING_APPROVAL || 0),
    waitingApproval: counts.WAITING_APPROVAL || 0,
    inProduction: counts.IN_PRODUCTION || 0,
    completedProjects: counts.COMPLETED || 0,
  });
});

app.get('/api/projects', authenticate, async (req: AuthRequest, res) => {
  const projects = await prisma.project.findMany({
    where: projectWhereForRole(req.userId!, req.userRole!),
    include: {
      requester: { select: { id: true, name: true, email: true } },
      designer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(projects);
});

app.get('/api/projects/:id', authenticate, async (req: AuthRequest, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      designer: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!canAccessProject(project.requesterId, project.designerId, req.userId!, req.userRole!)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(project);
});

app.post('/api/projects', authenticate, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        requesterId: req.userId!,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('[PROJECTS] Create failed:', error);
    return res.status(400).json({ error: 'Project creation failed' });
  }
});

async function loadProjectForWrite(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      requesterId: true,
      designerId: true,
    },
  });
}

app.put('/api/projects/:id', authenticate, async (req: AuthRequest, res) => {
  const project = await loadProjectForWrite(req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!isPrivileged(req.userRole)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json(updated);
});

app.patch('/api/projects/:id', authenticate, async (req: AuthRequest, res) => {
  const project = await loadProjectForWrite(req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!isPrivileged(req.userRole)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json(updated);
});

app.get('/api/projects/:id/comments', authenticate, async (req: AuthRequest, res) => {
  const project = await loadProjectForWrite(req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!canAccessProject(project.requesterId, project.designerId, req.userId!, req.userRole!)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const comments = await prisma.comment.findMany({
    where: { projectId: req.params.id },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json(comments);
});

app.post('/api/projects/:id/comments', authenticate, async (req: AuthRequest, res) => {
  const project = await loadProjectForWrite(req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!canAccessProject(project.requesterId, project.designerId, req.userId!, req.userRole!)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!req.body.text?.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const comment = await prisma.comment.create({
    data: {
      text: req.body.text.trim(),
      userId: req.userId!,
      projectId: req.params.id,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
  });

  res.status(201).json(comment);
});

app.patch('/api/projects/:id/assign', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const project = await loadProjectForWrite(req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { designerId } = req.body;

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      designerId: designerId || null,
      status: designerId ? 'IN_CREATION' : 'RECEIVED',
    },
  });

  res.json(updated);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

async function main() {
  await prisma.$connect();
  console.log(`[SERVER] Listening on port ${PORT}`);
  app.listen(PORT, '0.0.0.0');
}

async function shutdown(signal: string) {
  console.log(`[SERVER] Received ${signal}, shutting down...`);
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

main().catch(async (error) => {
  console.error('[SERVER] Fatal startup error:', error);
  await prisma.$disconnect().catch(() => undefined);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
