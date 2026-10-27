import { Router } from 'express';
import { store, UserProfile } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get current active user
router.get('/me', (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Update user preferences & dietary constraints
router.put('/profile', (req: AuthenticatedRequest, res) => {
  const { name, dietaryGoal, calorieTarget, allergies } = req.body;
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const updated: UserProfile = {
    ...req.user,
    name: name || req.user.name,
    dietaryGoal: dietaryGoal || req.user.dietaryGoal,
    calorieTarget: Number(calorieTarget) || req.user.calorieTarget,
    allergies: Array.isArray(allergies) ? allergies : req.user.allergies,
  };

  store.users.set(req.user.id, updated);
  res.json({
    success: true,
    user: updated,
    message: 'Dietary profile and targets updated successfully.',
  });
});

// Demo switch or login
router.post('/login', (req, res) => {
  const { email, name } = req.body;
  const existing = Array.from(store.users.values()).find((u) => u.email === email);
  if (existing) {
    return res.json({ success: true, token: existing.id, user: existing });
  }

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    name: name || email?.split('@')[0] || 'Food Explorer',
    email: email || 'user@foodverse.ai',
    dietaryGoal: 'Optimal Vitality',
    calorieTarget: 2100,
    allergies: [],
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  store.users.set(newUser.id, newUser);

  res.json({
    success: true,
    token: newUser.id,
    user: newUser,
  });
});

export default router;
