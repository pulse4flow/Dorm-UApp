import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with 5 users (3 students + 2 managers)...');

  const users = [
    {
      username: 'student101',
      password: 'student101',
      name: 'Somchai Jaidee',
      role: 'student',
      type: 'student',
      studentId: 'STU-101',
      roomNumber: 'A-101',
      dormScore: 92,
    },
    {
      username: 'student102',
      password: 'student102',
      name: 'Somying Raksuk',
      role: 'student',
      type: 'student',
      studentId: 'STU-102',
      roomNumber: 'A-102',
      dormScore: 78,
    },
    {
      username: 'student103',
      password: 'student103',
      name: 'Wichai Tongsuwan',
      role: 'student',
      type: 'student',
      studentId: 'STU-103',
      roomNumber: 'A-103',
      dormScore: 65,
    },
    {
      username: 'manager01',
      password: 'manager01',
      name: 'Manager One',
      role: 'manager',
      type: 'staff',
    },
    {
      username: 'manager02',
      password: 'manager02',
      name: 'Manager Two',
      role: 'manager',
      type: 'staff',
    },
  ];

  const keptUsernames = users.map((u) => u.username);
  await prisma.user.deleteMany({ where: { username: { notIn: keptUsernames } } });

  // 1. Create Rooms
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

  let sampleStudent: { id: string; roomId: string; name: string; dormScore: number } | null = null;

  for (const u of users) {
    const password = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        password,
        name: u.name,
        role: u.role,
        type: u.type,
      },
      create: {
        username: u.username,
        password,
        name: u.name,
        role: u.role,
        type: u.type,
      },
    });

    if (u.role === 'student') {
      const room = createdRooms.find((r) => r.roomNumber === u.roomNumber) ?? createdRooms[0];
      const student = await prisma.student.upsert({
        where: { userId: user.id },
        update: {
          studentId: u.studentId!,
          name: u.name,
          roomId: room.id,
          dormScore: u.dormScore,
        },
        create: {
          userId: user.id,
          studentId: u.studentId!,
          name: u.name,
          roomId: room.id,
          dormScore: u.dormScore,
        },
      });
      if (u.username === 'student101') sampleStudent = student;
    }
  }

  console.log('✅ 5 user accounts created (password = username):');
  for (const u of users) {
    console.log(`   - ${u.username} / ${u.password} (${u.role})`);
  }

  // 4. Create sample repair request and score history for student101
  if (sampleStudent) {
    // Keep the seed deterministic: remove previously seeded samples before re-inserting
    await prisma.repair.deleteMany({ where: { studentId: sampleStudent.id } });
    await prisma.scoreHistory.deleteMany({ where: { studentId: sampleStudent.id } });

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
          changedBy: 'Manager One',
        },
      ],
    });
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`Total users: ${users.length} (3 students + 2 managers)`);
  console.log('Sample student: student101 / student101');
  console.log('Manager: manager01 / manager01');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
