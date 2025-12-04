import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/connection';
import userRoutes from './routes/userRoutes';
import clientRoutes from './routes/clientRoutes';
import userProfileRoutes from './routes/userProfileRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api', clientRoutes);
app.use('/user', userProfileRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Entity Application API is running' });
});

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
