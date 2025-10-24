import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import repositoryRoutes from './routes/repositories';
import analyticsRoutes from './routes/analytics';
import mlRoutes from './routes/ml';

dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`GitFlow Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
