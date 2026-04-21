import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[SERVER] Starting simple server...');

const app = express();
const PORT = process.env.PORT || 3001;
console.log('[SERVER] PORT:', PORT);

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

console.log('[SERVER] Listening on', PORT);
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('[SERVER] ✓ Ready on port', PORT);
});