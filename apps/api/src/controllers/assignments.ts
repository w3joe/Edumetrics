import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const assignmentSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1),
  topic: z.string().min(1),
  dueAt: z.string().datetime(),
  timeEstimateMin: z.number().int().positive(),
});

export async function createAssignment(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Validate request body
  const validationResult = assignmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validationResult.error.errors,
    });
  }
  
  const { classId, title, topic, dueAt, timeEstimateMin } = validationResult.data;
  
  // Verify teacher owns this class
  const classRecord = await prisma.class.findFirst({
    where: {
      id: classId,
      teacherId: req.user.userId,
      schoolId: req.user.schoolId,
    },
  });
  
  if (!classRecord) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const assignment = await prisma.assignment.create({
    data: {
      classId,
      title,
      topic,
      dueAt,
      timeEstimateMin,
    },
  });
  
  res.status(201).json(assignment);
}

