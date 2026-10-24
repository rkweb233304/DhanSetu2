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
    const { userId, role } = req.body;
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ypeatqlvnppnwxmqkwod.supabase.co';
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MBKsFvZeZ3ayg00hkz2WKA_jMHn645L';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/auth_users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (response.ok) {
        res.json({ success: true });
      } else {
        const err = await response.text();
        res.status(response.status).json({ error: err });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  app.listen(3000, () => console.log('Server running on port 3000'));
}

startServer();
