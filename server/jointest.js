const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Find your user
  const user = await prisma.user.findUnique({
    where: { email: 'Sjackai27@gmail.com' }
  })
  console.log('Found user:', user.name, user.id)

  // Find a session hosted by someone else
  const session = await prisma.session.findFirst({
    where: { 
      hostId: { not: user.id },
      date: new Date().toISOString().split('T')[0]
    }
  })
  console.log('Found session:', session?.courseCode, session?.id)

  if (!session) {
    console.log('No session found for today')
    return
  }

  // Join you to that session
  await prisma.sessionMember.create({
    data: { sessionId: session.id, userId: user.id }
  })
  console.log('Joined session!')
}

main()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())