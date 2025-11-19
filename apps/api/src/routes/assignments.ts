import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createAssignment } from '../controllers/assignments';

export const assignmentsRouter = Router();

assignmentsRouter.post('/', authenticate, createAssignment);

