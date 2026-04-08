const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.session.updateMany({
    data: { date: '2026-04-15' }
  })
  console.log('Updated sessions:', result.count)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())