const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const user = await p.user.findUnique({ where: { email: 'sjackai27@gmail.com' } })
  console.log('User found:', !!user)
  console.log('Email:', user?.email)
  const match = await bcrypt.compare('Aggies2026', user.passwordHash)
  console.log('Password match:', match)
}

main().catch(console.error).finally(() => p.$disconnect())