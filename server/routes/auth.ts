import { Router } from 'express';
import { store } from '../db/store.js';

export const authRouter = Router();

// Mock / simple functional authentication for hackathon MVP
authRouter.post('/login', (req, res) => {
  const { email } = req.body;
  const user = Array.from(store.users.values()).find(u => u.email.toLowerCase() === (email || '').toLowerCase()) ||
               Array.from(store.users.values())[0]; // fallback to first user for seamless demo login

  res.json({
    success: true,
    data: {
      token: `mock-jwt-token-${user.id}`,
      user,
    },
  });
});

authRouter.post('/register', (req, res) => {
  const { name, email, role } = req.body;
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name || 'Demo Underwriter',
    email: email || 'underwriter@lendy.finance',
    role: role || 'underwriter',
  };
  store.users.set(newUser.id, newUser);
  res.json({
    success: true,
    data: {
      token: `mock-jwt-token-${newUser.id}`,
      user: newUser,
    },
  });
});

authRouter.get('/me', (req, res) => {
  const user = Array.from(store.users.values())[0];
  res.json({
    success: true,
    data: user,
  });
});
