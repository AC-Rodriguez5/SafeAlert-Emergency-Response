import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage (replace with database in production)
const alerts: any[] = [];

// Create Alert (from user app)
router.post('/', (req, res) => {
  try {
    const { type, description, location, userId, userName, userPhone } = req.body;

    if (!type || !location) {
      return res.status(400).json({ error: 'Type and location are required' });
    }

    const alert = {
      id: uuidv4(),
      type,
      description: description || `${type} emergency reported`,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || 'Location not specified',
      },
      userId,
      userName: userName || 'Anonymous',
      userPhone: userPhone || 'Not provided',
      priority: type === 'SOS' ? 'high' : 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    alerts.unshift(alert);

    res.status(201).json({
      message: 'Alert created successfully',
      alert,
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Alerts (for responder dashboard)
router.get('/', (req, res) => {
  try {
    const { status, type } = req.query;
    
    let filteredAlerts = [...alerts];

    if (status) {
      filteredAlerts = filteredAlerts.filter(a => a.status === status);
    }

    if (type) {
      filteredAlerts = filteredAlerts.filter(a => a.type === type);
    }

    res.json({
      alerts: filteredAlerts,
      total: filteredAlerts.length,
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Alert by ID
router.get('/:id', (req, res) => {
  try {
    const alert = alerts.find(a => a.id === req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ alert });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Alert Status (for responders)
router.patch('/:id/status', (req, res) => {
  try {
    const { status, responderId, responderName } = req.body;
    const alertIndex = alerts.findIndex(a => a.id === req.params.id);

    if (alertIndex === -1) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alerts[alertIndex] = {
      ...alerts[alertIndex],
      status,
      responderId,
      responderName,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      message: 'Alert status updated',
      alert: alerts[alertIndex],
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
