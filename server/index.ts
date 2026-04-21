import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
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
const PORT = process.env.PORT || 3005;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

console.log('[SERVER] PORT:', PORT);

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
const uploadsPath = path.join(__dirname, '../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(express.static(distPath));
app.use('/uploads', express.static(uploadsPath));

// Multer configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: !!prisma });
});

app.post('/api/auth/login', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const { email, password } = req.body;
  console.log('[AUTH] Login attempt:', email, 'Body keys:', Object.keys(req.body));

  if (!email || !password) {
    console.warn('[AUTH] Missing fields in login request');
    return res.status(400).json({ error: 'Email and password are required' });
  }

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

app.get('/api/projects', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let where = {};
    if (decoded.role === 'DESIGNER') {
      where = { designerId: decoded.userId };
    } else if (decoded.role === 'CLIENT') {
      where = { requesterId: decoded.userId };
    }

    const projects = await prisma.project.findMany({ 
      where,
      include: { requester: true, designer: true },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(projects);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const project = await prisma.project.findUnique({ 
      where: { id: req.params.id },
      include: { requester: true, designer: true, comments: { include: { user: true } } }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // ACL Check
    const isAdmin = decoded.role === 'ADMIN';
    const isRequester = project.requesterId === decoded.userId;
    const isDesigner = project.designerId === decoded.userId;

    if (!isAdmin && !isRequester && !isDesigner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/projects', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Restriction: Only ADMIN can start new jobs
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can start new jobs' });
    }

    const body = { ...req.body };
    
    // Sanitize dates: empty strings to null, valid strings to Date objects
    if (body.deadline === '') body.deadline = null;
    else if (body.deadline) body.deadline = new Date(body.deadline);
    
    if (body.eventDate === '') body.eventDate = null;
    else if (body.eventDate) body.eventDate = new Date(body.eventDate);

    const data = { ...body, requesterId: decoded.userId };
    console.log('[PROJECTS] Creating project for:', decoded.userId);
    
    const project = await prisma.project.create({ data });
    res.json(project);
  } catch (err: any) {
    console.error('[PROJECTS] Creation error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
});

app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const urls = files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (err: any) {
    console.error('[UPLOAD] Error:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let where = {};
    if (decoded.role === 'DESIGNER') {
      where = { designerId: decoded.userId };
    } else if (decoded.role === 'CLIENT') {
      where = { requesterId: decoded.userId };
    }

    const [total, active, waiting, production, completed] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.count({ where: { ...where, status: { not: 'COMPLETED' } } }),
      prisma.project.count({ where: { ...where, status: 'WAITING_APPROVAL' } }),
      prisma.project.count({ where: { ...where, status: 'IN_PRODUCTION' } }),
      prisma.project.count({ where: { ...where, status: 'COMPLETED' } }),
    ]);

    res.json({
      totalProjects: total,
      activeProjects: active,
      waitingApproval: waiting,
      inProduction: production,
      completedProjects: completed
    });
  } catch (err: any) {
    console.error('[STATS] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

app.get('/api/users', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Admin Route: Update user role
app.patch('/api/users/:id/role', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role }
    });
    res.json({ id: user.id, role: user.role });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user role' });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log(`[PROJECTS] Updating project ${req.params.id} by ${decoded.userId}`);

    const body = { ...req.body };

    // Remove relational and metadata fields that shouldn't be updated directly via query
    delete body.id;
    delete body.requester;
    delete body.designer;
    delete body.comments;
    delete body.createdAt;
    delete body.updatedAt;

    // Sanitize dates
    if (body.deadline === '') body.deadline = null;
    else if (body.deadline) body.deadline = new Date(body.deadline);
    
    if (body.eventDate === '') body.eventDate = null;
    else if (body.eventDate) body.eventDate = new Date(body.eventDate);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json(project);
  } catch (err: any) {
    console.error('[PROJECTS] Update error:', err.message);
    res.status(400).json({ error: 'Update failed', details: err.message });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

console.log('[SERVER] Ready on port', PORT);
app.listen(Number(PORT), '0.0.0.0');