import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { pool } from './config/db.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'Backend is running', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/tasks', taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
