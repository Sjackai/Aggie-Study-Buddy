const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('Aggies2026', 10)

  // Main account
  const stanley = await prisma.user.create({
    data: {
      name: 'Stanley E. Jackai',
      email: 'sjackai27@gmail.com',
      passwordHash: await bcrypt.hash('Aggies2026', 10),
      major: 'Computer Science',
      year: 'Junior',
      bio: 'CS junior who loves building things. Always down to study COMP courses!',
      isPrivate: false
    }
  })

  // Computer Science students
  const cs1 = await prisma.user.create({
    data: {
      name: 'Marcus Williams',
      email: 'mwilliams@aggies.ncat.edu',
      passwordHash,
      major: 'Computer Science',
      year: 'Sophomore',
      bio: 'Trying to survive COMP 285. Need all the study groups I can get lol',
      isPrivate: false
    }
  })

  const cs2 = await prisma.user.create({
    data: {
      name: 'Aaliyah Thompson',
      email: 'athompson@aggies.ncat.edu',
      passwordHash,
      major: 'Computer Science',
      year: 'Junior',
      bio: 'Junior CS student. Currently taking Data Structures and Networks.',
      isPrivate: false
    }
  })

  const cs3 = await prisma.user.create({
    data: {
      name: 'Jordan Pierce',
      email: 'jpierce@aggies.ncat.edu',
      passwordHash,
      major: 'Computer Science',
      year: 'Senior',
      bio: 'Senior finishing up my CS degree. Looking for study partners for my last few classes.',
      isPrivate: false
    }
  })

  const cs4 = await prisma.user.create({
    data: {
      name: 'Destiny Hall',
      email: 'dhall@aggies.ncat.edu',
      passwordHash,
      major: 'Computer Science',
      year: 'Freshman',
      bio: 'First year CS student still figuring things out. Study groups help a lot!',
      isPrivate: false
    }
  })

  // Electrical Engineering students
  const ee1 = await prisma.user.create({
    data: {
      name: 'Darius Johnson',
      email: 'djohnson@aggies.ncat.edu',
      passwordHash,
      major: 'Electrical Engineering',
      year: 'Junior',
      bio: 'EE junior drowning in circuits. Always looking for people to study with.',
      isPrivate: false
    }
  })

  const ee2 = await prisma.user.create({
    data: {
      name: 'Imani Davis',
      email: 'idavis@aggies.ncat.edu',
      passwordHash,
      major: 'Electrical Engineering',
      year: 'Sophomore',
      bio: 'Second year EE student. ECEN 202 is no joke.',
      isPrivate: false
    }
  })

  // Mechanical Engineering students
  const me1 = await prisma.user.create({
    data: {
      name: 'Tyler Brooks',
      email: 'tbrooks@aggies.ncat.edu',
      passwordHash,
      major: 'Mechanical Engineering',
      year: 'Junior',
      bio: 'ME junior. Thermodynamics study groups are my lifeline.',
      isPrivate: false
    }
  })

  const me2 = await prisma.user.create({
    data: {
      name: 'Jasmine Carter',
      email: 'jcarter@aggies.ncat.edu',
      passwordHash,
      major: 'Mechanical Engineering',
      year: 'Senior',
      bio: 'Senior ME student. Almost done!',
      isPrivate: false
    }
  })

  // Business students
  const biz1 = await prisma.user.create({
    data: {
      name: 'Kevin Anderson',
      email: 'kanderson@aggies.ncat.edu',
      passwordHash,
      major: 'Business Administration',
      year: 'Sophomore',
      bio: 'Business sophomore. Finance and accounting are tough but we get through it together.',
      isPrivate: false
    }
  })

  const biz2 = await prisma.user.create({
    data: {
      name: 'Brianna Moore',
      email: 'bmoore@aggies.ncat.edu',
      passwordHash,
      major: 'Marketing',
      year: 'Junior',
      bio: 'Marketing junior. Group projects are my thing.',
      isPrivate: false
    }
  })

  // Biology students
  const bio1 = await prisma.user.create({
    data: {
      name: 'Alexis Washington',
      email: 'awashington@aggies.ncat.edu',
      passwordHash,
      major: 'Biology',
      year: 'Sophomore',
      bio: 'Bio sophomore pre-med. Ochem is rough, need study partners!',
      isPrivate: false
    }
  })

  const bio2 = await prisma.user.create({
    data: {
      name: 'Noah Green',
      email: 'ngreen@aggies.ncat.edu',
      passwordHash,
      major: 'Biology',
      year: 'Junior',
      bio: 'Junior biology student. Always down to study for exams.',
      isPrivate: false
    }
  })

  // Math students
  const math1 = await prisma.user.create({
    data: {
      name: 'Zoe Robinson',
      email: 'zrobinson@aggies.ncat.edu',
      passwordHash,
      major: 'Mathematics',
      year: 'Junior',
      bio: 'Math junior. Calculus and linear algebra study groups welcome!',
      isPrivate: false
    }
  })

  // Psychology students
  const psy1 = await prisma.user.create({
    data: {
      name: 'Maya Jenkins',
      email: 'mjenkins@aggies.ncat.edu',
      passwordHash,
      major: 'Psychology',
      year: 'Senior',
      bio: 'Psych senior writing my thesis. Looking for people to bounce ideas off.',
      isPrivate: false
    }
  })

  // Nursing students
  const nur1 = await prisma.user.create({
    data: {
      name: 'Kayla Foster',
      email: 'kfoster@aggies.ncat.edu',
      passwordHash,
      major: 'Nursing',
      year: 'Junior',
      bio: 'Nursing junior. Clinical rotations are wild but study groups keep me sane.',
      isPrivate: false
    }
  })

  console.log('Created users!')

  // Add preferences for seed users
  const allUsers = [cs1, cs2, cs3, cs4, ee1, ee2, me1, me2, biz1, biz2, bio1, bio2, math1, psy1, nur1]

  const coursesByMajor = {
    'Computer Science': ['COMP 163', 'COMP 280', 'COMP 285', 'COMP 333', 'COMP 350'],
    'Electrical Engineering': ['ECEN 202', 'ECEN 301', 'ECEN 350', 'MATH 232'],
    'Mechanical Engineering': ['MEEN 261', 'MEEN 340', 'MEEN 351', 'MATH 232'],
    'Business Administration': ['ACCT 221', 'BUSI 301', 'FINA 311', 'MGMT 301'],
    'Marketing': ['MKTG 301', 'MKTG 350', 'BUSI 301'],
    'Biology': ['BIOL 201', 'BIOL 301', 'CHEM 201', 'CHEM 301'],
    'Mathematics': ['MATH 232', 'MATH 333', 'MATH 435'],
    'Psychology': ['PSYC 201', 'PSYC 301', 'PSYC 401'],
    'Nursing': ['NURS 301', 'BIOL 201', 'CHEM 201']
  }

  for (const user of allUsers) {
    const courses = coursesByMajor[user.major] || []
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        courses,
        studyStyle: ['small', 'medium', 'any'][Math.floor(Math.random() * 3)],
        studyTime: ['morning', 'afternoon', 'evening', 'latenight'][Math.floor(Math.random() * 4)],
        goals: 'find_partners,exam_prep'
      }
    })
  }

  console.log('Created preferences!')

  // Create some upcoming sessions
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const inTwoDays = new Date(today)
  inTwoDays.setDate(inTwoDays.getDate() + 2)
  const inThreeDays = new Date(today)
  inThreeDays.setDate(inThreeDays.getDate() + 3)

  const formatDate = (d) => d.toISOString().split('T')[0]

  const sessions = [
    {
      hostId: cs1.id,
      courseCode: 'COMP 285',
      courseName: 'Data Structures',
      date: formatDate(tomorrow),
      time: '14:00',
      location: 'Bluford Library',
      description: 'Going over trees and graphs for the upcoming exam',
      maxParticipants: 5,
      tags: ['#examreview', '#studysession']
    },
    {
      hostId: cs2.id,
      courseCode: 'COMP 163',
      courseName: 'Intro to Computer Science',
      date: formatDate(inTwoDays),
      time: '10:00',
      location: 'McNair Hall',
      description: 'Working through the homework assignments together',
      maxParticipants: 4,
      tags: ['#homework', '#groupwork']
    },
    {
      hostId: ee1.id,
      courseCode: 'ECEN 202',
      courseName: 'Circuit Analysis',
      date: formatDate(inThreeDays),
      time: '16:00',
      location: 'Martin Sr. Engineering Complex',
      description: 'Practice problems for the midterm',
      maxParticipants: 6,
      tags: ['#testprep', '#practiceproblems']
    },
    {
      hostId: me1.id,
      courseCode: 'MEEN 261',
      courseName: 'Engineering Mechanics',
      date: formatDate(nextWeek),
      time: '13:00',
      location: 'Price Hall',
      description: 'Statics and dynamics review session',
      maxParticipants: 5,
      tags: ['#studysession', '#examreview']
    },
    {
      hostId: bio1.id,
      courseCode: 'CHEM 201',
      courseName: 'Organic Chemistry I',
      date: formatDate(tomorrow),
      time: '18:00',
      location: 'Crosby Hall',
      description: 'Reaction mechanisms study group',
      maxParticipants: 4,
      tags: ['#intense', '#examreview']
    },
    {
      hostId: math1.id,
      courseCode: 'MATH 232',
      courseName: 'Calculus III',
      date: formatDate(inTwoDays),
      time: '15:00',
      location: 'Bluford Library',
      description: 'Working through multivariable calculus problems',
      maxParticipants: 6,
      tags: ['#practiceproblems', '#homework']
    },
    {
      hostId: cs3.id,
      courseCode: 'COMP 350',
      courseName: 'Software Engineering',
      date: formatDate(inThreeDays),
      time: '17:00',
      location: 'McNair Hall',
      description: 'Project planning and design patterns discussion',
      maxParticipants: 5,
      tags: ['#projectwork', '#discussion']
    },
    {
      hostId: biz1.id,
      courseCode: 'ACCT 221',
      courseName: 'Financial Accounting',
      date: formatDate(nextWeek),
      time: '11:00',
      location: 'Merrick Hall',
      description: 'Balance sheets and income statements review',
      maxParticipants: 4,
      tags: ['#studysession', '#testprep']
    }
  ]

  for (const sessionData of sessions) {
    const session = await prisma.session.create({ data: sessionData })

    const expiresAt = new Date(sessionData.date)
    expiresAt.setDate(expiresAt.getDate() + 1)

    const groupChat = await prisma.groupChat.create({
      data: {
        name: `${sessionData.courseCode} Study Session`,
        sessionId: session.id,
        expiresAt
      }
    })

    await prisma.groupChatMember.create({
      data: { groupChatId: groupChat.id, userId: sessionData.hostId }
    })

    await prisma.groupChatMessage.create({
      data: {
        groupChatId: groupChat.id,
        senderId: sessionData.hostId,
        text: `Group chat created for ${sessionData.courseCode} Study Session`,
        isSystem: true
      }
    })
  }

  console.log('Created sessions!')
  console.log('✅ Seed complete!')
  console.log('Main account: sjackai27@gmail.com / Aggies2026')
  console.log('All seed accounts password: Aggies2026')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())