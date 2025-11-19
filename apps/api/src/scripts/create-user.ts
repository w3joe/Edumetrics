import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: tsx src/scripts/create-user.ts <email> <name> <role> [schoolId]');
    console.log('Example: tsx src/scripts/create-user.ts teacher2@school.edu "John Doe" teacher');
    console.log('\nRoles: teacher, admin');
    process.exit(1);
  }

  const [email, name, role, schoolIdArg] = args;

  if (role !== 'teacher' && role !== 'admin') {
    console.error('Error: Role must be either "teacher" or "admin"');
    process.exit(1);
  }

  try {
    let schoolId = schoolIdArg;

    // If no schoolId provided, use the first school or create a default one
    if (!schoolId) {
      const existingSchool = await prisma.school.findFirst();
      if (existingSchool) {
        schoolId = existingSchool.id;
        console.log(`Using existing school: ${existingSchool.name}`);
      } else {
        const newSchool = await prisma.school.create({
          data: {
            name: 'Default School',
            timezone: 'UTC',
          },
        });
        schoolId = newSchool.id;
        console.log(`Created new school: ${newSchool.name}`);
      }
    } else {
      // Verify school exists
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
      });
      if (!school) {
        console.error(`Error: School with ID ${schoolId} not found`);
        process.exit(1);
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        schoolId,
      },
    });

    console.log('\n✅ User created successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`School ID: ${user.schoolId}`);
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: (any password works for MVP)`);
    console.log('\n⚠️  Note: This is mock authentication. In production, implement password hashing.');
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

