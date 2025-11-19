import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export async function getClasses(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const classes = await prisma.class.findMany({
    where: {
      teacherId: req.user.userId,
      schoolId: req.user.schoolId,
    },
    include: {
      _count: {
        select: {
          students: true,
          assignments: true,
        },
      },
    },
  });
  
  const result = classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    studentCount: cls._count.students,
    assignmentCount: cls._count.assignments,
  }));
  
  res.json(result);
}

export async function getClassRoster(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const classId = req.params.id;
  
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
  
  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { name: 'asc' },
  });
  
  res.json(students);
}

export async function getClassMetrics(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const classId = req.params.id;
  
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
  
  const students = await prisma.student.findMany({
    where: { classId },
    include: {
      submissions: true,
      practiceSessions: true,
      moodChecks: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const metrics = students.map((student) => {
    // Calculate avgScorePct from submissions
    const avgScorePct =
      student.submissions.length > 0
        ? student.submissions.reduce((sum, s) => sum + s.scorePct, 0) /
          student.submissions.length
        : null;
    
    // Count sessions in last 7 days
    const sessionsThisWeek = student.practiceSessions.filter((session) => {
      const sessionDate = new Date(session.startedAt);
      return sessionDate >= sevenDaysAgo;
    }).length;
    
    // Calculate avgAccuracyPct from practice sessions
    const avgAccuracyPct =
      student.practiceSessions.length > 0
        ? student.practiceSessions.reduce((sum, s) => sum + s.accuracyPct, 0) /
          student.practiceSessions.length
        : null;
    
    // Get most recent mood
    const recentMood = student.moodChecks.length > 0 ? student.moodChecks[0].moodScore : null;
    
    return {
      studentId: student.id,
      studentName: student.name,
      avgScorePct,
      sessionsThisWeek,
      avgAccuracyPct,
      recentMood,
    };
  });
  
  res.json(metrics);
}

export async function getClassAssignments(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const classId = req.params.id;
  
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
  
  const assignments = await prisma.assignment.findMany({
    where: { classId },
    orderBy: { dueAt: 'asc' },
  });
  
  res.json(assignments);
}

