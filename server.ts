import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  app.use(express.json());

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.post('/api/admin/update-user-role', async (req, res) => {
    // ... logic ...
    res.json({ success: true });
  });

  app.listen(3000, () => console.log('Server running on port 3000'));
}

startServer();
