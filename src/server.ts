import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dbConnect from './lib/db';
import { ensureAdminExists } from './services/auth';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database and ensure admin user exists
dbConnect().then(() => {
  console.log('Connected to MongoDB');
  ensureAdminExists();
}).catch(console.error);

// Auth routes
app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { authenticateUser } = require('./services/auth');
    const result = await authenticateUser(email, password);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      message: error instanceof Error ? error.message : 'Authentication failed' 
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;