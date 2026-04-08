console.log('Script started')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Aggies2026', 10)
  const user = await prisma.user.update({
    where: { email: 'Sjackai27@gmail.com' },
    data: { passwordHash: hash }
  })
  console.log('Password reset for:', user.email)
  console.log('New password: Aggies2026')
}

main()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())