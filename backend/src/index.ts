import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 API endpoints:`);
  console.log(`   - POST /api/auth/register/user`);
  console.log(`   - POST /api/auth/register/responder`);
  console.log(`   - POST /api/auth/login/user`);
  console.log(`   - POST /api/auth/login/responder`);
  console.log(`   - POST /api/alerts`);
  console.log(`   - GET  /api/alerts`);
});
