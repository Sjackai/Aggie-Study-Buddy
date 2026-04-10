const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  const result = await prisma.session.updateMany({
    where: { courseCode: 'MATH 131' },
    data: { date: yesterdayStr }
  })
  console.log('Updated:', result.count, 'to', yesterdayStr)
}

main()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())