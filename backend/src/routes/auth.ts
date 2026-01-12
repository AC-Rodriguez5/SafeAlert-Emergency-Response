import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage (replace with database in production)
const users: Map<string, any> = new Map();
const responders: Map<string, any> = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// User Registration
router.post('/register/user', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.set(email, user);

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: user.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Responder Registration
router.post('/register/responder', async (req, res) => {
  try {
    const { name, email, password, badgeId, department } = req.body;

    if (!name || !email || !password || !badgeId || !department) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (responders.has(email)) {
      return res.status(400).json({ error: 'Responder already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const responder = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      badgeId,
      department,
      createdAt: new Date().toISOString(),
    };

    responders.set(email, responder);

    res.status(201).json({ 
      message: 'Responder registered successfully',
      responderId: responder.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
router.post('/login/user', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Responder Login
router.post('/login/responder', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const responder = responders.get(email);
    if (!responder) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, responder.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: responder.id, email: responder.email, role: 'responder' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      responder: {
        id: responder.id,
        name: responder.name,
        email: responder.email,
        badgeId: responder.badgeId,
        department: responder.department,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
