const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const today = new Date().toISOString().split('T')[0]
  const result = await prisma.session.updateMany({
    where: { courseCode: 'MATH 131' },
    data: { date: today }
  })
  console.log('Updated:', result.count)
}

main()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())