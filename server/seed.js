const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo users
  const password = await bcrypt.hash('Demo1234', 10)

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Sarah Johnson', email: 'sjohnson@aggies.ncat.edu', passwordHash: password, major: 'Engineering', year: 'Junior', bio: 'Love helping others with math and physics!', rating: 4.9 }}),
    prisma.user.create({ data: { name: 'Michael Chen', email: 'mchen@aggies.ncat.edu', passwordHash: password, major: 'Computer Science', year: 'Senior', bio: 'Full stack dev, happy to help with coding!', rating: 4.8 }}),
    prisma.user.create({ data: { name: 'Alexis Williams', email: 'awilliams@aggies.ncat.edu', passwordHash: password, major: 'Physics', year: 'Sophomore', bio: 'Physics tutor with 2 years experience.', rating: 4.7 }}),
    prisma.user.create({ data: { name: 'David Brown', email: 'dbrown@aggies.ncat.edu', passwordHash: password, major: 'Engineering', year: 'Senior', bio: 'Dean\'s list student, available evenings.', rating: 4.9 }}),
    prisma.user.create({ data: { name: 'Jessica Taylor', email: 'jtaylor@aggies.ncat.edu', passwordHash: password, major: 'Chemistry', year: 'Junior', bio: 'Chem major who loves study groups!', rating: 4.6 }}),
    prisma.user.create({ data: { name: 'Kevin Anderson', email: 'kanderson@aggies.ncat.edu', passwordHash: password, major: 'Computer Science', year: 'Senior', bio: 'Data structures and algorithms are my thing.', rating: 4.8 }}),
    prisma.user.create({ data: { name: 'Nia Carter', email: 'ncarter@aggies.ncat.edu', passwordHash: password, major: 'Computer Science', year: 'Junior', bio: 'Mobile and web dev enthusiast.', rating: 4.7 }}),
    prisma.user.create({ data: { name: 'Jordan Lee', email: 'jlee@aggies.ncat.edu', passwordHash: password, major: 'English', year: 'Senior', bio: 'Writing tutor and essay coach.', rating: 4.6 }}),
  ])

  console.log(`Created ${users.length} users`)

  // Create study sessions
  const sessions = await Promise.all([
    prisma.session.create({ data: { courseCode: 'MATH 131', courseName: 'Calculus I', date: '2026-04-07', time: '14:00', location: 'Bluford Library', description: 'Review for Exam 1 - Derivatives and limits', maxParticipants: 5, hostId: users[0].id }}),
    prisma.session.create({ data: { courseCode: 'COMP 285', courseName: 'Programming I', date: '2026-04-07', time: '16:30', location: 'McNair Hall', description: 'Java help - Arrays and Loops', maxParticipants: 4, hostId: users[1].id }}),
    prisma.session.create({ data: { courseCode: 'PHYS 241', courseName: 'Physics I', date: '2026-04-07', time: '18:00', location: 'Smith Hall', description: 'Kinematics practice problems', maxParticipants: 4, hostId: users[2].id }}),
    prisma.session.create({ data: { courseCode: 'ENGL 101', courseName: 'English Composition', date: '2026-04-07', time: '19:30', location: 'GCB', description: 'Essay writing workshop', maxParticipants: 8, hostId: users[7].id }}),
    prisma.session.create({ data: { courseCode: 'CHEM 101', courseName: 'General Chemistry', date: '2026-04-08', time: '13:00', location: 'Marteena Hall', description: 'Stoichiometry and lab report review', maxParticipants: 6, hostId: users[4].id }}),
    prisma.session.create({ data: { courseCode: 'COMP 350', courseName: 'Data Structures', date: '2026-04-08', time: '15:00', location: 'Merrick Hall', description: 'Binary trees and recursion', maxParticipants: 5, hostId: users[5].id }}),
    prisma.session.create({ data: { courseCode: 'COMP 200', courseName: 'Mobile App Dev', date: '2026-04-08', time: '17:00', location: 'Martin Sr. Engineering Complex', description: 'React Native UI debugging', maxParticipants: 6, hostId: users[6].id }}),
    prisma.session.create({ data: { courseCode: 'MATH 151', courseName: 'Calculus II', date: '2026-04-09', time: '13:00', location: 'Crosby Hall', description: 'Integration techniques practice', maxParticipants: 4, hostId: users[3].id }}),
  ])

  console.log(`Created ${sessions.length} sessions`)

  // Add some members to sessions
  await Promise.all([
    prisma.sessionMember.create({ data: { sessionId: sessions[0].id, userId: users[1].id }}),
    prisma.sessionMember.create({ data: { sessionId: sessions[0].id, userId: users[2].id }}),
    prisma.sessionMember.create({ data: { sessionId: sessions[1].id, userId: users[3].id }}),
    prisma.sessionMember.create({ data: { sessionId: sessions[2].id, userId: users[4].id }}),
    prisma.sessionMember.create({ data: { sessionId: sessions[2].id, userId: users[5].id }}),
    prisma.sessionMember.create({ data: { sessionId: sessions[3].id, userId: users[6].id }}),
    prisma.sessionMember.create({ data: { sessionId: sessions[4].id, userId: users[7].id }}),
  ])

  console.log('Added session members')

  // Add some connections
  await Promise.all([
    prisma.connection.create({ data: { fromUserId: users[0].id, toUserId: users[1].id, status: 'accepted' }}),
    prisma.connection.create({ data: { fromUserId: users[1].id, toUserId: users[2].id, status: 'accepted' }}),
    prisma.connection.create({ data: { fromUserId: users[2].id, toUserId: users[3].id, status: 'pending' }}),
  ])

  console.log('Added connections')
  console.log('✅ Database seeded successfully!')
  console.log('Demo login: sjohnson@aggies.ncat.edu / Demo1234')
}

console.log('Script started')

main()
  .then(() => console.log('Done!'))
  .catch(e => {
    console.error('ERROR:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })