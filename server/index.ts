import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import {
  createProject,
  createUser,
  findProjectById,
  findUserByEmail,
  findUserById,
  getDashboardStats,
  healthcheck,
  initializeDatabase,
  listProjects,
  listUsers,
  updateProject,
  updateUserRole,
} from './db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[SERVER] Starting...');
console.log('[SERVER] DB URL:', process.env.SUPABASE_DB_URL || process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const app = express();
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';
const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'setup-admin-2024';
const ENABLE_ADMIN_BOOTSTRAP = process.env.ENABLE_ADMIN_BOOTSTRAP === 'true';

console.log('[SERVER] PORT:', PORT);

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
const uploadsPath = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(express.static(distPath));
app.use('/uploads', express.static(uploadsPath));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

let databaseInitError: string | null = null;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

function isUniqueViolation(error: any) {
  return error?.code === '23505';
}

async function ensureDatabase(res: express.Response) {
  try {
    await initializeDatabase();
    await healthcheck();
    databaseInitError = null;
    return true;
  } catch (error) {
    databaseInitError = getErrorMessage(error);
    res.status(503).json({ error: 'Database unavailable', details: databaseInitError });
    return false;
  }
}

async function warmupDatabaseConnection() {
  try {
    await initializeDatabase();
    await healthcheck();
    databaseInitError = null;
    console.log('[DATABASE] Connected');
  } catch (error) {
    databaseInitError = getErrorMessage(error);
    console.error('[DATABASE] INIT ERROR:', databaseInitError);
  }
}

function getTokenPayload(req: express.Request, res: express.Response) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}

function sanitizeProjectBody(body: Record<string, any>) {
  const sanitized = { ...body };

  delete sanitized.id;
  delete sanitized.requester;
  delete sanitized.designer;
  delete sanitized.comments;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;

  if (sanitized.deadline === '') {
    sanitized.deadline = null;
  } else if (sanitized.deadline) {
    sanitized.deadline = new Date(sanitized.deadline);
  }

  if (sanitized.eventDate === '') {
    sanitized.eventDate = null;
  } else if (sanitized.eventDate) {
    sanitized.eventDate = new Date(sanitized.eventDate);
  }

  if (sanitized.designerId === '') {
    sanitized.designerId = null;
  }

  return sanitized;
}

app.get('/api/auth/config', (_req, res) => {
  res.json({
    enableAdminBootstrap: ENABLE_ADMIN_BOOTSTRAP,
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    await initializeDatabase();
    await healthcheck();
    databaseInitError = null;
    res.json({ status: 'ok', time: new Date().toISOString(), database: true });
  } catch (error) {
    databaseInitError = getErrorMessage(error);
    res.status(503).json({
      status: 'error',
      database: false,
      details: databaseInitError,
    });
  }
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.post('/api/admin/setup', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  if (!ENABLE_ADMIN_BOOTSTRAP) {
    return res.status(403).json({ error: 'Admin bootstrap disabled' });
  }

  const { email, password, name } = req.body;
  const secret = req.headers['x-admin-secret'];

  if (secret !== ADMIN_SETUP_SECRET) {
    return res.status(403).json({ error: 'Invalid secret' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    });

    res.json({ id: user?.id, email: user?.email, role: user?.role });
  } catch (error) {
    res.status(isUniqueViolation(error) ? 409 : 400).json({ error: getErrorMessage(error) });
  }
});

app.post('/api/auth/register', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const { email, password, name, adminSetupSecret } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const wantsAdmin = Boolean(adminSetupSecret);
  let role: 'CLIENT' | 'ADMIN' = 'CLIENT';

  if (wantsAdmin) {
    if (!ENABLE_ADMIN_BOOTSTRAP) {
      return res.status(403).json({ error: 'Admin registration is disabled' });
    }

    if (adminSetupSecret !== ADMIN_SETUP_SECRET) {
      return res.status(403).json({ error: 'Invalid admin setup secret' });
    }

    role = 'ADMIN';
  }

  console.log('[AUTH] Register:', email, 'role:', role);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    console.log('[AUTH] Created:', user?.id);
    res.json(user);
  } catch (error) {
    console.error('[AUTH] Error:', getErrorMessage(error));

    if (isUniqueViolation(error)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const { email, password } = req.body;
  console.log('[AUTH] Login attempt:', email, 'Body keys:', Object.keys(req.body));

  if (!email || !password) {
    console.warn('[AUTH] Missing fields in login request');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('[AUTH] Login error:', getErrorMessage(error));
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await findUserByEmail(email);

    res.json({
      ok: true,
      message: 'Password recovery is enabled in assisted mode. Contact an administrator to reset your access.',
    });
  } catch (error) {
    console.error('[AUTH] Forgot password error:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to process password recovery request' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  const user = await findUserById(decoded.userId);

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user);
});

app.get('/api/projects', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  const filters =
    decoded.role === 'DESIGNER'
      ? { designerId: decoded.userId }
      : decoded.role === 'CLIENT'
        ? { requesterId: decoded.userId }
        : {};

  const projects = await listProjects(filters);
  res.json(projects);
});

app.get('/api/projects/:id', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  const project = await findProjectById(req.params.id);

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const isAdmin = decoded.role === 'ADMIN';
  const isRequester = project.requesterId === decoded.userId;
  const isDesigner = project.designerId === decoded.userId;

  if (!isAdmin && !isRequester && !isDesigner) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(project);
});

app.post('/api/projects', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  try {
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can start new jobs' });
    }

    const body = sanitizeProjectBody(req.body);
    const data = { ...body, requesterId: decoded.userId };

    console.log('[PROJECTS] Creating project for:', decoded.userId);

    const project = await createProject(data);
    res.json(project);
  } catch (error: any) {
    console.error('[PROJECTS] Creation error:', getErrorMessage(error));

    if (error?.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.status(500).json({ error: 'Failed to create project', details: getErrorMessage(error) });
  }
});

app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error('[UPLOAD] Error:', getErrorMessage(error));
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  const filters =
    decoded.role === 'DESIGNER'
      ? { designerId: decoded.userId }
      : decoded.role === 'CLIENT'
        ? { requesterId: decoded.userId }
        : {};

  const stats = await getDashboardStats(filters);
  res.json(stats);
});

app.get('/api/users', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  if (decoded.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const users = await listUsers();
  res.json(users);
});

app.patch('/api/users/:id/role', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  if (decoded.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const user = await updateUserRole(req.params.id, req.body.role);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: user.id, role: user.role });
  } catch {
    res.status(400).json({ error: 'Failed to update user role' });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  if (!(await ensureDatabase(res))) return;

  const decoded = getTokenPayload(req, res);
  if (!decoded) return;

  try {
    console.log(`[PROJECTS] Updating project ${req.params.id} by ${decoded.userId}`);

    const currentProject = await findProjectById(req.params.id);

    if (!currentProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can update jobs' });
    }

    const body = sanitizeProjectBody(req.body);
    const project = await updateProject(req.params.id, body);
    res.json(project);
  } catch (error) {
    console.error('[PROJECTS] Update error:', getErrorMessage(error));
    res.status(400).json({ error: 'Update failed', details: getErrorMessage(error) });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

console.log('[SERVER] Ready on port', PORT);
app.listen(PORT, '0.0.0.0');
void warmupDatabaseConnection();
