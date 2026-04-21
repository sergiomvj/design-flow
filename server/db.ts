import { randomUUID } from 'crypto';
import { Pool, type PoolConfig } from 'pg';

type UserRole = 'ADMIN' | 'DESIGNER' | 'CLIENT';

type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
};

type UpsertAdminInput = {
  email: string;
  password: string;
  name: string;
};

type ProjectFilters = {
  requesterId?: string;
  designerId?: string;
};

type CommentRecord = {
  id: string;
  text: string;
  createdAt: unknown;
  userId: string;
  projectId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type ProjectRecord = Record<string, unknown> & {
  requesterId: string;
  designerId: string | null;
  comments?: CommentRecord[];
};

const projectFieldMap = {
  jobNumber: 'job_number',
  status: 'status',
  requesterId: 'requester_id',
  company: 'company',
  requesterEmail: 'requester_email',
  phone: 'phone',
  internalSalesRep: 'internal_sales_rep',
  department: 'department',
  contactMethod: 'contact_method',
  projectType: 'project_type',
  category: 'category',
  objective: 'objective',
  nature: 'nature',
  description: 'description',
  usage: 'usage',
  mainMessage: 'main_message',
  headline: 'headline',
  requiredText: 'required_text',
  mandatoryInfo: 'mandatory_info',
  dimensions: 'dimensions',
  unit: 'unit',
  material: 'material',
  quantity: 'quantity',
  colors: 'colors',
  brandGuidelines: 'brand_guidelines',
  finishing: 'finishing',
  logoUrl: 'logo_url',
  fileUrls: 'file_urls',
  photoUrls: 'photo_urls',
  referenceLinks: 'reference_links',
  likes: 'likes',
  dislikes: 'dislikes',
  deadline: 'deadline',
  isRush: 'is_rush',
  rushReason: 'rush_reason',
  eventDate: 'event_date',
  approverName: 'approver_name',
  approverContact: 'approver_contact',
  reviewerCount: 'reviewer_count',
  revisionCount: 'revision_count',
  additionalChargesAware: 'additional_charges_aware',
  designerId: 'designer_id',
  priority: 'priority',
  internalNotes: 'internal_notes',
  isConfirmed: 'is_confirmed',
  briefingAware: 'briefing_aware',
  validationAware: 'validation_aware',
} as const;

const bootstrapStatements = [
  'CREATE EXTENSION IF NOT EXISTS pgcrypto',
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CLIENT',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'DESIGNER', 'CLIENT'))
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_number TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'RECEIVED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      requester_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      company TEXT NOT NULL,
      requester_email TEXT NOT NULL,
      phone TEXT NOT NULL,
      internal_sales_rep TEXT,
      department TEXT NOT NULL,
      contact_method TEXT NOT NULL,
      project_type TEXT NOT NULL,
      category TEXT NOT NULL,
      objective TEXT NOT NULL,
      nature TEXT NOT NULL,
      description TEXT NOT NULL,
      usage TEXT NOT NULL,
      main_message TEXT NOT NULL,
      headline TEXT,
      required_text TEXT,
      mandatory_info TEXT,
      dimensions TEXT NOT NULL,
      unit TEXT NOT NULL,
      material TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      colors TEXT NOT NULL,
      brand_guidelines TEXT,
      finishing TEXT,
      logo_url TEXT,
      file_urls TEXT,
      photo_urls TEXT,
      reference_links TEXT,
      likes TEXT,
      dislikes TEXT,
      deadline TIMESTAMPTZ,
      is_rush BOOLEAN NOT NULL DEFAULT FALSE,
      rush_reason TEXT,
      event_date TIMESTAMPTZ,
      approver_name TEXT,
      approver_contact TEXT,
      reviewer_count INTEGER DEFAULT 1,
      revision_count INTEGER NOT NULL DEFAULT 1,
      additional_charges_aware BOOLEAN NOT NULL DEFAULT FALSE,
      designer_id UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
      priority TEXT DEFAULT 'MEDIUM',
      internal_notes TEXT,
      is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
      briefing_aware BOOLEAN NOT NULL DEFAULT FALSE,
      validation_aware BOOLEAN NOT NULL DEFAULT FALSE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `,
  'CREATE INDEX IF NOT EXISTS idx_projects_requester_id ON projects(requester_id)',
  'CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON projects(designer_id)',
  'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
  'CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id)',
];

const projectSelectSql = `
  SELECT
    p.*,
    requester.id AS requester_user_id,
    requester.name AS requester_user_name,
    requester.email AS requester_user_email,
    requester.role AS requester_user_role,
    designer.id AS designer_user_id,
    designer.name AS designer_user_name,
    designer.email AS designer_user_email,
    designer.role AS designer_user_role
  FROM projects p
  JOIN users requester ON requester.id = p.requester_id
  LEFT JOIN users designer ON designer.id = p.designer_id
`;

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

function getConnectionString() {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Set SUPABASE_DB_URL or DATABASE_URL before starting the server.');
  }

  return connectionString;
}

function buildPoolConfig(): PoolConfig {
  const rawConnectionString = getConnectionString();
  const connectionUrl = new URL(rawConnectionString);
  const sslMode = (connectionUrl.searchParams.get('sslmode') ?? process.env.PGSSLMODE ?? '').toLowerCase();
  const normalizedSslMode = sslMode === 'no-verify' ? 'require' : sslMode;
  const shouldUseSsl =
    connectionUrl.hostname.includes('supabase') ||
    ['require', 'prefer', 'verify-ca', 'verify-full'].includes(normalizedSslMode);

  // node-postgres lets SSL query params in the URL override the `ssl` object.
  // Strip them so we control TLS behavior explicitly here.
  connectionUrl.searchParams.delete('sslmode');
  connectionUrl.searchParams.delete('sslcert');
  connectionUrl.searchParams.delete('sslkey');
  connectionUrl.searchParams.delete('sslrootcert');

  return {
    connectionString: connectionUrl.toString(),
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
  };
}

function getPool() {
  if (!pool) {
    pool = new Pool(buildPoolConfig());
  }

  return pool;
}

function mapUser(row: any) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPublicUser(row: any) {
  const user = mapUser(row);

  if (!user) {
    return null;
  }

  const { password: _password, ...publicUser } = user;
  return publicUser;
}

function mapProjectRow(row: any): ProjectRecord | null {
  if (!row) {
    return null;
  }

  const project: ProjectRecord = {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requesterId: row.requester_id,
    designerId: row.designer_id,
  };

  for (const [camelKey, snakeKey] of Object.entries(projectFieldMap)) {
    project[camelKey] = row[snakeKey];
  }

  project.requester = row.requester_user_id
    ? {
        id: row.requester_user_id,
        name: row.requester_user_name,
        email: row.requester_user_email,
        role: row.requester_user_role,
      }
    : null;

  project.designer = row.designer_user_id
    ? {
        id: row.designer_user_id,
        name: row.designer_user_name,
        email: row.designer_user_email,
        role: row.designer_user_role,
      }
    : null;

  return project;
}

function mapCommentRow(row: any): CommentRecord {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.created_at,
    userId: row.user_id,
    projectId: row.project_id,
    user: {
      id: row.comment_user_id,
      name: row.comment_user_name,
      email: row.comment_user_email,
      role: row.comment_user_role,
    },
  };
}

function buildProjectFilters(filters: ProjectFilters) {
  const values: string[] = [];
  const clauses: string[] = [];

  if (filters.requesterId) {
    values.push(filters.requesterId);
    clauses.push(`p.requester_id = $${values.length}`);
  }

  if (filters.designerId) {
    values.push(filters.designerId);
    clauses.push(`p.designer_id = $${values.length}`);
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
}

function mapProjectInput(input: Record<string, unknown>) {
  const mapped: Record<string, unknown> = {};

  for (const [camelKey, snakeKey] of Object.entries(projectFieldMap)) {
    if (Object.prototype.hasOwnProperty.call(input, camelKey)) {
      mapped[snakeKey] = input[camelKey];
    }
  }

  return mapped;
}

export async function initializeDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      const db = getPool();

      for (const statement of bootstrapStatements) {
        await db.query(statement);
      }
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

export async function healthcheck() {
  await initializeDatabase();
  await getPool().query('SELECT 1');
}

export async function createUser(input: CreateUserInput) {
  const id = randomUUID();
  const role = input.role ?? 'CLIENT';

  const { rows } = await getPool().query(
    `
      INSERT INTO users (id, email, password, name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [id, input.email, input.password, input.name, role],
  );

  return mapPublicUser(rows[0]);
}

export async function upsertAdminUser(input: UpsertAdminInput) {
  const id = randomUUID();

  const { rows } = await getPool().query(
    `
      INSERT INTO users (id, email, password, name, role)
      VALUES ($1, $2, $3, $4, 'ADMIN')
      ON CONFLICT (email)
      DO UPDATE SET
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        role = 'ADMIN',
        updated_at = NOW()
      RETURNING *
    `,
    [id, input.email, input.password, input.name],
  );

  return mapPublicUser(rows[0]);
}

export async function findUserByEmail(email: string) {
  const { rows } = await getPool().query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return mapUser(rows[0]);
}

export async function findUserById(id: string) {
  const { rows } = await getPool().query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return mapPublicUser(rows[0]);
}

export async function listUsers() {
  const { rows } = await getPool().query('SELECT * FROM users ORDER BY name ASC');
  return rows.map(mapPublicUser);
}

export async function updateUserRole(id: string, role: UserRole) {
  const { rows } = await getPool().query(
    `
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [role, id],
  );

  return mapPublicUser(rows[0]);
}

export async function createProject(input: Record<string, unknown>) {
  const mappedInput = mapProjectInput(input);
  const id = randomUUID();
  const columns = ['id', ...Object.keys(mappedInput)];
  const values = [id, ...Object.values(mappedInput)];
  const placeholders = columns.map((_, index) => `$${index + 1}`);

  await getPool().query(
    `
      INSERT INTO projects (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
    `,
    values,
  );

  return findProjectById(id);
}

export async function listProjects(filters: ProjectFilters = {}) {
  const scope = buildProjectFilters(filters);
  const { rows } = await getPool().query(
    `
      ${projectSelectSql}
      ${scope.clause}
      ORDER BY p.created_at DESC
    `,
    scope.values,
  );

  return rows.map(mapProjectRow);
}

export async function findProjectById(id: string): Promise<ProjectRecord | null> {
  const { rows } = await getPool().query(
    `
      ${projectSelectSql}
      WHERE p.id = $1
      LIMIT 1
    `,
    [id],
  );

  const project = mapProjectRow(rows[0]);

  if (!project) {
    return null;
  }

  const { rows: commentRows } = await getPool().query(
    `
      SELECT
        c.*,
        u.id AS comment_user_id,
        u.name AS comment_user_name,
        u.email AS comment_user_email,
        u.role AS comment_user_role
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.project_id = $1
      ORDER BY c.created_at ASC
    `,
    [id],
  );

  return {
    ...project,
    comments: commentRows.map(mapCommentRow),
  };
}

export async function updateProject(id: string, input: Record<string, unknown>) {
  const mappedInput = mapProjectInput(input);
  const entries = Object.entries(mappedInput);

  if (entries.length === 0) {
    return findProjectById(id);
  }

  const setClause = entries.map(([column], index) => `${column} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);

  await getPool().query(
    `
      UPDATE projects
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length + 1}
    `,
    [...values, id],
  );

  return findProjectById(id);
}

export async function getDashboardStats(filters: ProjectFilters = {}) {
  const scope = buildProjectFilters(filters);
  const { rows } = await getPool().query(
    `
      SELECT
        COUNT(*)::int AS total_projects,
        COUNT(*) FILTER (WHERE status <> 'COMPLETED')::int AS active_projects,
        COUNT(*) FILTER (WHERE status = 'WAITING_APPROVAL')::int AS waiting_approval,
        COUNT(*) FILTER (WHERE status = 'IN_PRODUCTION')::int AS in_production,
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed_projects
      FROM projects p
      ${scope.clause}
    `,
    scope.values,
  );

  const stats = rows[0];

  return {
    totalProjects: stats?.total_projects ?? 0,
    activeProjects: stats?.active_projects ?? 0,
    waitingApproval: stats?.waiting_approval ?? 0,
    inProduction: stats?.in_production ?? 0,
    completedProjects: stats?.completed_projects ?? 0,
  };
}
