import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Serve the single automated ADB installation script
  app.get('/update.apk.sh', (req, res) => {
    res.setHeader('Content-Type', 'text/x-shellscript');
    res.sendFile(path.join(process.cwd(), 'update.apk.sh'));
  });

  // Statically serve Cypress HTML reports
  app.use('/cypress-report', express.static(path.join(process.cwd(), 'cypress', 'reports')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/demo', (req, res) => {
      res.sendFile(path.join(distPath, 'demo', 'index.html'));
    });
    app.get('/demo/*', (req, res) => {
      res.sendFile(path.join(distPath, 'demo', 'index.html'));
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
