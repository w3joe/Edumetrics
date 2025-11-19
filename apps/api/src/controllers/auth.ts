import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Mock authentication - in production, verify password hash
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // For MVP, accept any password for existing users
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      schoolId: user.schoolId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ token });
}

