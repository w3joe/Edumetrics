import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create school
  const school = await prisma.school.create({
    data: {
      name: 'Lincoln High School',
      timezone: 'America/New_York',
    },
  });
  
  // Create teacher
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@lincoln.edu',
      name: 'Ms. Johnson',
      role: 'teacher',
      schoolId: school.id,
    },
  });
  
  // Create classes
  const class1 = await prisma.class.create({
    data: {
      name: 'Algebra I - Period 1',
      schoolId: school.id,
      teacherId: teacher.id,
    },
  });
  
  const class2 = await prisma.class.create({
    data: {
      name: 'Algebra I - Period 2',
      schoolId: school.id,
      teacherId: teacher.id,
    },
  });
  
  const class3 = await prisma.class.create({
    data: {
      name: 'Geometry - Period 3',
      schoolId: school.id,
      teacherId: teacher.id,
    },
  });
  
  // Create students for class 1
  const students1 = await Promise.all([
    prisma.student.create({
      data: { classId: class1.id, name: 'Alice Smith', email: 'alice@example.com' },
    }),
    prisma.student.create({
      data: { classId: class1.id, name: 'Bob Jones', email: 'bob@example.com' },
    }),
    prisma.student.create({
      data: { classId: class1.id, name: 'Charlie Brown', email: 'charlie@example.com' },
    }),
    prisma.student.create({
      data: { classId: class1.id, name: 'Diana Prince', email: 'diana@example.com' },
    }),
    prisma.student.create({
      data: { classId: class1.id, name: 'Eve Wilson', email: 'eve@example.com' },
    }),
  ]);
  
  // Create students for class 2
  const students2 = await Promise.all([
    prisma.student.create({
      data: { classId: class2.id, name: 'Frank Miller', email: 'frank@example.com' },
    }),
    prisma.student.create({
      data: { classId: class2.id, name: 'Grace Lee', email: 'grace@example.com' },
    }),
    prisma.student.create({
      data: { classId: class2.id, name: 'Henry Davis', email: 'henry@example.com' },
    }),
    prisma.student.create({
      data: { classId: class2.id, name: 'Ivy Chen', email: 'ivy@example.com' },
    }),
  ]);
  
  // Create students for class 3
  const students3 = await Promise.all([
    prisma.student.create({
      data: { classId: class3.id, name: 'Jack Taylor', email: 'jack@example.com' },
    }),
    prisma.student.create({
      data: { classId: class3.id, name: 'Kate Anderson', email: 'kate@example.com' },
    }),
    prisma.student.create({
      data: { classId: class3.id, name: 'Liam O\'Brien', email: 'liam@example.com' },
    }),
    prisma.student.create({
      data: { classId: class3.id, name: 'Mia Rodriguez', email: 'mia@example.com' },
    }),
    prisma.student.create({
      data: { classId: class3.id, name: 'Noah Kim', email: 'noah@example.com' },
    }),
    prisma.student.create({
      data: { classId: class3.id, name: 'Olivia White', email: 'olivia@example.com' },
    }),
  ]);
  
  // Create assignments
  const now = new Date();
  const assignments1 = await Promise.all([
    prisma.assignment.create({
      data: {
        classId: class1.id,
        title: 'Linear Equations Practice',
        topic: 'Linear Equations',
        dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeEstimateMin: 30,
      },
    }),
    prisma.assignment.create({
      data: {
        classId: class1.id,
        title: 'Quadratic Functions Quiz',
        topic: 'Quadratic Functions',
        dueAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeEstimateMin: 20,
      },
    }),
  ]);
  
  // Create submissions
  await Promise.all([
    prisma.submission.create({
      data: {
        assignmentId: assignments1[0].id,
        studentId: students1[0].id,
        scorePct: 95.5,
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }),
    prisma.submission.create({
      data: {
        assignmentId: assignments1[0].id,
        studentId: students1[1].id,
        scorePct: 87.0,
        completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }),
    prisma.submission.create({
      data: {
        assignmentId: assignments1[0].id,
        studentId: students1[2].id,
        scorePct: 72.5,
        completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }),
  ]);
  
  // Create practice sessions
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  
  await Promise.all([
    prisma.practiceSession.create({
      data: {
        studentId: students1[0].id,
        startedAt: threeDaysAgo.toISOString(),
        durationMin: 25,
        accuracyPct: 92.0,
      },
    }),
    prisma.practiceSession.create({
      data: {
        studentId: students1[0].id,
        startedAt: oneDayAgo.toISOString(),
        durationMin: 30,
        accuracyPct: 95.0,
      },
    }),
    prisma.practiceSession.create({
      data: {
        studentId: students1[1].id,
        startedAt: twoDaysAgo.toISOString(),
        durationMin: 20,
        accuracyPct: 85.0,
      },
    }),
    prisma.practiceSession.create({
      data: {
        studentId: students1[2].id,
        startedAt: oneDayAgo.toISOString(),
        durationMin: 15,
        accuracyPct: 70.0,
      },
    }),
  ]);
  
  // Create mood checks
  await Promise.all([
    prisma.moodCheck.create({
      data: {
        studentId: students1[0].id,
        date: oneDayAgo.toISOString().split('T')[0],
        moodScore: 4,
      },
    }),
    prisma.moodCheck.create({
      data: {
        studentId: students1[1].id,
        date: oneDayAgo.toISOString().split('T')[0],
        moodScore: 3,
      },
    }),
    prisma.moodCheck.create({
      data: {
        studentId: students1[2].id,
        date: twoDaysAgo.toISOString().split('T')[0],
        moodScore: 2,
      },
    }),
    prisma.moodCheck.create({
      data: {
        studentId: students1[3].id,
        date: oneDayAgo.toISOString().split('T')[0],
        moodScore: 5,
      },
    }),
  ]);
  
  console.log('Database seeded successfully!');
  console.log(`Teacher email: ${teacher.email}`);
  console.log('Password: (any password works for MVP)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

