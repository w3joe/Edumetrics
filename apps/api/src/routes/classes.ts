import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getClasses, getClassRoster, getClassMetrics, getClassAssignments } from '../controllers/classes';

export const classesRouter = Router();

classesRouter.get('/', authenticate, getClasses);
classesRouter.get('/:id/roster', authenticate, getClassRoster);
classesRouter.get('/:id/metrics', authenticate, getClassMetrics);
classesRouter.get('/:id/assignments', authenticate, getClassAssignments);

