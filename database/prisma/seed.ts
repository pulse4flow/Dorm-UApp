import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const studentPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  // Create Users
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@test.com' },
    update: {},
    create: {
      email: 'student1@test.com',
      password: studentPassword,
      name: 'สมชาย ใจดี',
      role: 'student',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@test.com' },
    update: {},
    create: {
      email: 'student2@test.com',
      password: studentPassword,
      name: 'สมหญิง รักสุข',
      role: 'student',
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'student3@test.com' },
    update: {},
    create: {
      email: 'student3@test.com',
      password: studentPassword,
      name: 'วิชัย เรียนดี',
      role: 'student',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dorm.com' },
    update: {},
    create: {
      email: 'admin@dorm.com',
      password: adminPassword,
      name: '管理员 สมศักดิ์',
      role: 'manager',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@dorm.com' },
    update: {},
    create: {
      email: 'staff@dorm.com',
      password: staffPassword,
      name: 'เจ้าหน้าที่ สมหญิง',
      role: 'manager',
    },
  });

  console.log('✅ Users created');

  // Create Rooms
  const roomA101 = await prisma.room.upsert({
    where: { roomNumber: 'A-101' },
    update: {},
    create: {
      roomNumber: 'A-101',
      building: 'A',
      floor: 1,
      capacity: 2,
      status: 'occupied',
    },
  });

  const roomA102 = await prisma.room.upsert({
    where: { roomNumber: 'A-102' },
    update: {},
    create: {
      roomNumber: 'A-102',
      building: 'A',
      floor: 1,
      capacity: 2,
      status: 'occupied',
    },
  });

  const roomA201 = await prisma.room.upsert({
    where: { roomNumber: 'A-201' },
    update: {},
    create: {
      roomNumber: 'A-201',
      building: 'A',
      floor: 2,
      capacity: 2,
      status: 'available',
    },
  });

  const roomA202 = await prisma.room.upsert({
    where: { roomNumber: 'A-202' },
    update: {},
    create: {
      roomNumber: 'A-202',
      building: 'A',
      floor: 2,
      capacity: 2,
      status: 'available',
    },
  });

  const roomB101 = await prisma.room.upsert({
    where: { roomNumber: 'B-101' },
    update: {},
    create: {
      roomNumber: 'B-101',
      building: 'B',
      floor: 1,
      capacity: 2,
      status: 'occupied',
    },
  });

  const roomB102 = await prisma.room.upsert({
    where: { roomNumber: 'B-102' },
    update: {},
    create: {
      roomNumber: 'B-102',
      building: 'B',
      floor: 1,
      capacity: 2,
      status: 'maintenance',
    },
  });

  console.log('✅ Rooms created');

  // Create Students
  const student1Profile = await prisma.student.upsert({
    where: { userId: student1.id },
    update: {},
    create: {
      userId: student1.id,
      studentId: 'STU-001',
      name: 'สมชาย ใจดี',
      roomId: roomA101.id,
      dormScore: 95,
    },
  });

  const student2Profile = await prisma.student.upsert({
    where: { userId: student2.id },
    update: {},
    create: {
      userId: student2.id,
      studentId: 'STU-002',
      name: 'สมหญิง รักสุข',
      roomId: roomA102.id,
      dormScore: 88,
    },
  });

  const student3Profile = await prisma.student.upsert({
    where: { userId: student3.id },
    update: {},
    create: {
      userId: student3.id,
      studentId: 'STU-003',
      name: 'วิชัย เรียนดี',
      roomId: roomB101.id,
      dormScore: 100,
    },
  });

  console.log('✅ Students created');

  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.scoreHistory.deleteMany(),
    prisma.repair.deleteMany(),
  ]);

  // Create Repairs
  await prisma.repair.createMany({
    data: [
      {
        studentId: student1Profile.id,
        roomId: roomA101.id,
        category: 'plumbing',
        priority: 'high',
        description: 'น้ำไม่ไหลในห้องน้ำ',
        status: 'pending',
      },
      {
        studentId: student2Profile.id,
        roomId: roomA102.id,
        category: 'electrical',
        priority: 'medium',
        description: 'ไฟดับเฉพาะปลั๊กข้างเตียง',
        status: 'in_progress',
      },
      {
        studentId: student3Profile.id,
        roomId: roomB101.id,
        category: 'furniture',
        priority: 'low',
        description: 'เก้าอี้ขาหัก',
        status: 'resolved',
      },
      {
        studentId: student1Profile.id,
        roomId: roomA101.id,
        category: 'hvac',
        priority: 'urgent',
        description: 'แอร์ไม่เย็น มีเสียงดัง',
        status: 'pending',
      },
      {
        studentId: student2Profile.id,
        roomId: roomA102.id,
        category: 'cleaning',
        priority: 'low',
        description: 'ขอทำความสะอาดห้อง',
        status: 'resolved',
      },
    ],
  });

  console.log('✅ Repairs created');

  // Create Score History
  await prisma.scoreHistory.createMany({
    data: [
      {
        studentId: student1Profile.id,
        studentName: 'สมชาย ใจดี',
        previousScore: 100,
        newScore: 95,
        reason: 'ทำความสะอาดห้องไม่เรียบร้อย',
        changedBy: '管理员 สมศักดิ์',
      },
      {
        studentId: student2Profile.id,
        studentName: 'สมหญิง รักสุข',
        previousScore: 100,
        newScore: 88,
        reason: 'ส่งเสียงดังหลัง 22:00 น.',
        changedBy: '管理员 สมศักดิ์',
      },
      {
        studentId: student3Profile.id,
        studentName: 'วิชัย เรียนดี',
        previousScore: 95,
        newScore: 100,
        reason: 'ช่วยทำความสะอาดพื้นที่ส่วนกลาง',
        changedBy: 'เจ้าหน้าที่ สมหญิง',
      },
    ],
  });

  console.log('✅ Score history created');

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: 'แจ้งซ่อมได้รับการตอบรับ',
        message: 'แจ้งซ่อมน้ำไม่ไหลของคุณอยู่ระหว่างดำเนินการ',
        type: 'repair',
        link: '/repairs',
      },
      {
        userId: student2.id,
        title: 'คะแนนหอพักลดลง',
        message: 'คะแนนหอพักของคุณลดลง 12 คะแนน',
        type: 'score',
        link: '/score',
      },
    ],
  });

  console.log('✅ Notifications created');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📋 Demo Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍🎓 นักศึกษา:');
  console.log('   student1@test.com / password123');
  console.log('   student2@test.com / password123');
  console.log('   student3@test.com / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 ผู้ดูแล:');
  console.log('   admin@dorm.com / admin123');
  console.log('   staff@dorm.com / staff123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });