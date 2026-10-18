import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.routes.js';
import { getFalkorClient } from './config/falkordb.js';
import { initGraphSchema } from './graph/schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../frontend/dist');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static frontend build if present
app.use(express.static(distPath));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FalkorBrain Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// SPA fallback for frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Boot Server
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`  FalkorBrain Context Engine running on port ${PORT}`);
  console.log(`  Targeting WeMakeDevs x FalkorDB Hackathon (Team 7vengers)`);
  console.log(`=======================================================`);

  try {
    await getFalkorClient();
    await initGraphSchema();
    console.log('[Startup] Connected to FalkorDB and initialized schema.');
  } catch (err) {
    console.warn('[Startup] FalkorDB connection pending: ' + err.message);
    console.warn('[Startup] Run "docker run -d -p 6379:6379 --name falkordb falkordb/falkordb" to start the local database.');
  }
});
