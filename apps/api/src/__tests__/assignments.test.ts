import request from 'supertest';
import express from 'express';
import { assignmentsRouter } from '../routes/assignments';
import { authenticate } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const app = express();
app.use(express.json());
app.use('/assignments', assignmentsRouter);

const prisma = new PrismaClient();

describe('POST /assignments', () => {
  let teacherToken: string;
  let teacherId: string;
  let schoolId: string;
  let classId: string;

  beforeAll(async () => {
    // Clean up any existing test data first (in reverse dependency order)
    await prisma.submission.deleteMany({});
    await prisma.practiceSession.deleteMany({});
    await prisma.moodCheck.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.school.deleteMany({});
    
    // Create test data with unique emails
    const timestamp = Date.now();
    const school = await prisma.school.create({
      data: { name: 'Test School', timezone: 'UTC' },
    });
    schoolId = school.id;

    const teacher = await prisma.user.create({
      data: {
        email: `test-teacher-${timestamp}@test.com`,
        name: 'Test Teacher',
        role: 'teacher',
        schoolId: school.id,
      },
    });
    teacherId = teacher.id;
    teacherToken = jwt.sign(
      { userId: teacher.id, role: 'teacher', schoolId: school.id },
      JWT_SECRET
    );

    const testClass = await prisma.class.create({
      data: {
        name: 'Test Class',
        schoolId: school.id,
        teacherId: teacher.id,
      },
    });
    classId = testClass.id;
  });

  afterAll(async () => {
    // Cleanup in reverse dependency order to avoid foreign key constraints
    await prisma.submission.deleteMany({});
    await prisma.practiceSession.deleteMany({});
    await prisma.moodCheck.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.school.deleteMany({});
    await prisma.$disconnect();
  });

  test('Valid assignment creation', async () => {
    const dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const response = await request(app)
      .post('/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        classId,
        title: 'Test Assignment',
        topic: 'Algebra',
        dueAt,
        timeEstimateMin: 30,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Assignment');
    expect(response.body.topic).toBe('Algebra');
  });
});

