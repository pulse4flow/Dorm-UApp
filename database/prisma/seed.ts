import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Somchai', 'Somying', 'Wichai', 'Anan', 'Kanya', 'Chaiwat', 'Narin', 'Pimchanok',
  'Thanawat', 'Sarin', 'Nattapong', 'Pitchaya', 'Kittisak', 'Siriporn', 'Warapon',
  'Bhudis', 'Chutima', 'Danai', 'Ekkachai', 'Fonthip', 'Jakkrit', 'Kamonwan',
  'Lalita', 'Manop', 'Nipon', 'Orathai', 'Prapas', 'Rattana', 'Sakda', 'Teerapat',
  'Uraiwan', 'Viroj', 'Wanna', 'Yothin', 'Alex', 'Benjamin', 'Chloe', 'Daniel',
  'Emily', 'Frank', 'Grace', 'Hannah', 'Isaac', 'Jessica', 'Kevin', 'Laura',
  'Michael', 'Natalie', 'Oliver', 'Penelope', 'Quentin', 'Rachel', 'Samuel'
];

const LAST_NAMES = [
  'Jaidee', 'Raksuk', 'Reandee', 'Srikhaev', 'Tongsuwan', 'Pattanakul', 'Wongsuwan',
  'Boonmee', 'Chaimongkol', 'Saelim', 'Phungprasert', 'Charoensuk', 'Suksamran',
  'Ratanaporn', 'Kaewmanee', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
  'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson'
];

async function main() {
  console.log('🌱 Recreating database sample records...');

  const studentPassword = await bcrypt.hash('password123', 10);
  const managerPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Manager Accounts (3-5 records, type="manager", role="manager", NO Student relation)
  const managerData = [
    { email: 'admin@dorm.com', name: 'Manager Admin' },
    { email: 'manager1@dorm.com', name: 'Manager Sarah Jenkins' },
    { email: 'manager2@dorm.com', name: 'Manager David Miller' },
    { email: 'manager3@dorm.com', name: 'Manager Robert Taylor' },
  ];

  const managers = [];
  for (const mgr of managerData) {
    const m = await prisma.user.upsert({
      where: { email: mgr.email },
      update: {
        type: 'manager',
        role: 'manager',
        name: mgr.name,
      },
      create: {
        email: mgr.email,
        password: managerPassword,
        name: mgr.name,
        role: 'manager',
        type: 'manager',
      },
    });
    managers.push(m);
  }
  console.log(`✅ Created ${managers.length} manager accounts (type="manager", role="manager")`);

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
  console.log(`✅ Created/verified ${createdRooms.length} rooms`);

  // 3. Create 55 Student Records
  const TOTAL_STUDENTS = 55;
  const studentRecords = [];

  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const fnIndex = (i - 1) % FIRST_NAMES.length;
    const lnIndex = (i * 7) % LAST_NAMES.length;
    const fullName = `${FIRST_NAMES[fnIndex]} ${LAST_NAMES[lnIndex]}`;
    const email = `student${i}@dorm.com`;
    const studentIdStr = `STU-${(100 + i).toString()}`;
    const roomObj = createdRooms[(i - 1) % createdRooms.length];

    let score = 100 - ((i * 11) % 40);
    if (i === 5) score = 40;
    if (i === 12) score = 0;
    if (i === 20) score = 85;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        type: 'student',
        role: 'student',
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

    const student = await prisma.student.upsert({
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
      include: { room: true },
    });
    studentRecords.push(student);
  }
  console.log(`✅ Created ${TOTAL_STUDENTS} student records (type="student", role="student")`);

  // 4. Create Sample Repair Requests across statuses (pending, in_progress, completed, rejected)
  const repairCategories = ['plumbing', 'electrical', 'furniture', 'aircon', 'other'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['pending', 'in_progress', 'completed', 'rejected'];

  const repairData = [
    {
      category: 'plumbing',
      priority: 'high',
      status: 'pending',
      description: 'Bathroom sink pipe leaking water on floor',
    },
    {
      category: 'electrical',
      priority: 'medium',
      status: 'in_progress',
      description: 'Bedside outlet sparking when plugged in',
    },
    {
      category: 'aircon',
      priority: 'high',
      status: 'completed',
      description: 'Air conditioner blowing warm air only',
    },
    {
      category: 'furniture',
      priority: 'low',
      status: 'rejected',
      description: 'Request additional study chair (duplicate request)',
    },
    {
      category: 'plumbing',
      priority: 'urgent',
      status: 'pending',
      description: 'Toilet bowl water overflowing',
    },
    {
      category: 'electrical',
      priority: 'high',
      status: 'in_progress',
      description: 'Main room ceiling light flickering constantly',
    },
    {
      category: 'aircon',
      priority: 'medium',
      status: 'completed',
      description: 'Air conditioner filter cleaning required',
    },
    {
      category: 'furniture',
      priority: 'medium',
      status: 'completed',
      description: 'Wardrobe door hinge loose',
    },
    {
      category: 'other',
      priority: 'low',
      status: 'rejected',
      description: 'Window screen mesh torn (not covered)',
    },
    {
      category: 'plumbing',
      priority: 'medium',
      status: 'pending',
      description: 'Shower head water pressure very low',
    },
  ];

  await prisma.repair.deleteMany({});
  for (let idx = 0; idx < repairData.length; idx++) {
    const item = repairData[idx];
    const student = studentRecords[idx % studentRecords.length];
    await prisma.repair.create({
      data: {
        studentId: student.id,
        roomId: student.roomId,
        category: item.category,
        priority: item.priority,
        status: item.status,
        description: item.description,
      },
    });
  }
  console.log(`✅ Created ${repairData.length} repair requests across pending, in_progress, completed, rejected statuses`);

  // 5. Create Sample Score History Records
  await prisma.scoreHistory.deleteMany({});
  const scoreReasons = [
    { change: -10, reason: 'Late night noise violation warning', manager: 'Manager Admin' },
    { change: +5, reason: 'Clean dorm room inspection reward', manager: 'Manager Sarah Jenkins' },
    { change: -15, reason: 'Unauthorized guest staying overnight', manager: 'Manager David Miller' },
    { change: +10, reason: 'Dorm community service volunteer work', manager: 'Manager Admin' },
    { change: -5, reason: 'Improper trash disposal in hallway', manager: 'Manager Robert Taylor' },
  ];

  let scoreEntries = 0;
  for (let idx = 0; idx < 15; idx++) {
    const student = studentRecords[idx % studentRecords.length];
    const item = scoreReasons[idx % scoreReasons.length];
    const prevScore = student.dormScore;
    const newScore = Math.min(100, Math.max(0, prevScore + item.change));

    await prisma.scoreHistory.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        previousScore: prevScore,
        newScore: newScore,
        reason: item.reason,
        changedBy: item.manager,
      },
    });
    scoreEntries++;
  }
  console.log(`✅ Created ${scoreEntries} score history logs`);

  // 6. Create Sample Notifications
  await prisma.notification.deleteMany({});
  let notificationCount = 0;
  for (let idx = 0; idx < Math.min(10, studentRecords.length); idx++) {
    const studentRec = studentRecords[idx];
    if (studentRec.userId) {
      await prisma.notification.create({
        data: {
          userId: studentRec.userId,
          title: 'Welcome to DormDash',
          message: 'Welcome to your dormitory dashboard! Keep track of your score and submit repair requests anytime.',
          type: 'system',
          isRead: false,
          link: '/',
        },
      });
      notificationCount++;
    }
  }
  console.log(`✅ Created ${notificationCount} initial sample notifications`);

  console.log('\n🎉 Seeding finished successfully!');
  console.log('====================================');
  console.log('Sample Accounts Overview:');
  console.log('Students (55 total):');
  console.log('  Login: STU-101 / password123 (or student1@dorm.com / password123)');
  console.log('  Login: STU-102 / password123');
  console.log('Managers (4 total):');
  console.log('  Login: admin@dorm.com / admin123');
  console.log('  Login: manager1@dorm.com / admin123');
  console.log('====================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });