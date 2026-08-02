import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Somchai', 'Somying', 'Wichai', 'Anan', 'Kanya', 'Chaiwat', 'Narin', 'Pimchanok',
  'Thanawat', 'Sarin', 'Nattapong', 'Pitchaya', 'Kittisak', 'Siriporn', 'Warapon',
  'Bhudis', 'Chutima', 'Danai', 'Ekkachai', 'Fonthip', 'Jakkrit', 'Kamonwan',
  'Lalita', 'Manop', 'Nipon', 'Orathai', 'Prapas', 'Rattana', 'Sakda', 'Teerapat',
  'Uraiwan', 'Viroj', 'Wanna', 'Yothin', 'Zulpha', 'Alex', 'Benjamin', 'Chloe',
  'Daniel', 'Emily', 'Frank', 'Grace', 'Hannah', 'Isaac', 'Jessica', 'Kevin',
  'Laura', 'Michael', 'Natalie', 'Oliver', 'Penelope', 'Quentin', 'Rachel', 'Samuel'
];

const LAST_NAMES = [
  'Jaidee', 'Raksuk', 'Reandee', 'Srikhaev', 'Tongsuwan', 'Pattanakul', 'Wongsuwan',
  'Boonmee', 'Chaimongkol', 'Saelim', 'Phungprasert', 'Charoensuk', 'Suksamran',
  'Ratanaporn', 'Kaewmanee', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
  'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

async function main() {
  console.log('🌱 Seeding database with 50+ student records...');

  const studentPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dorm.com' },
    update: { type: 'staff' },
    create: {
      email: 'admin@dorm.com',
      password: adminPassword,
      name: 'Manager Admin',
      role: 'manager',
      type: 'staff',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Rooms
  const buildings = ['A', 'B', 'C', 'D'];
  const floors = [1, 2, 3, 4, 5];
  const roomsPerFloor = 4;
  const createdRooms: Array<{ id: string; roomNumber: string }> = [];

  for (const building of buildings) {
    for (const floor of floors) {
      for (let r = 1; r <= roomsPerFloor; r++) {
        const roomNum = `${building}-${floor}0${r}`;
        const room = await prisma.room.upsert({
          where: { roomNumber: roomNum },
          update: {},
          create: {
            roomNumber: roomNum,
            building,
            floor,
            capacity: 2,
            status: r % 4 === 0 ? 'maintenance' : 'occupied',
          },
        });
        createdRooms.push(room);
      }
    }
  }
  console.log(`✅ ${createdRooms.length} rooms created/updated`);

  // 3. Create 55 Student Records
  const TOTAL_STUDENTS = 55;
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const fnIndex = (i - 1) % FIRST_NAMES.length;
    const lnIndex = (i * 7) % LAST_NAMES.length;
    const fullName = `${FIRST_NAMES[fnIndex]} ${LAST_NAMES[lnIndex]}`;
    const email = `student${i}@dorm.com`;
    const studentIdStr = `STU-${(100 + i).toString()}`;
    const roomObj = createdRooms[(i - 1) % createdRooms.length];

    // Calculate deterministic dorm score between 50 and 100
    // Give some variance so we have scores ranging from 0 to 100
    let score = 100 - ((i * 13) % 45);
    if (i === 7) score = 35; // One student with low score
    if (i === 14) score = 0;  // One student with minimum score

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        type: 'student',
        name: fullName,
      },
      create: {
        email,
        password: studentPassword,
        name: fullName,
        role: 'student',
        type: 'student',
      },
    });

    await prisma.student.upsert({
      where: { userId: user.id },
      update: {
        studentId: studentIdStr,
        name: fullName,
        roomId: roomObj.id,
        dormScore: score,
      },
      create: {
        userId: user.id,
        studentId: studentIdStr,
        name: fullName,
        roomId: roomObj.id,
        dormScore: score,
      },
    });
  }

  console.log(`✅ ${TOTAL_STUDENTS} student records created with type="student"`);

  // Create sample repair request and score history for first student
  const sampleStudent = await prisma.student.findFirst({
    include: { room: true },
  });

  if (sampleStudent) {
    await prisma.repair.createMany({
      data: [
        {
          studentId: sampleStudent.id,
          roomId: sampleStudent.roomId,
          category: 'plumbing',
          priority: 'high',
          description: 'Bathroom sink leaking water',
          status: 'pending',
        },
        {
          studentId: sampleStudent.id,
          roomId: sampleStudent.roomId,
          category: 'electrical',
          priority: 'medium',
          description: 'Bedside outlet not functioning',
          status: 'in_progress',
        },
      ],
    });

    await prisma.scoreHistory.createMany({
      data: [
        {
          studentId: sampleStudent.id,
          studentName: sampleStudent.name,
          previousScore: 100,
          newScore: sampleStudent.dormScore,
          reason: 'Initial score evaluation',
          changedBy: 'Manager Admin',
        },
      ],
    });
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`Total students generated: ${TOTAL_STUDENTS}`);
  console.log('Sample account: student1@dorm.com / password123');
  console.log('Admin account: admin@dorm.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });