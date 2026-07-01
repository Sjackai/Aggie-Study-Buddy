const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const questions = [
  // HBCU History
  { question: "Which HBCU was the first to be established in the United States?", options: ["Howard University", "Cheyney University", "Lincoln University", "Fisk University"], correctIndex: 1, type: "multiple", category: "HBCU History", difficulty: "medium" },
  { question: "In what year was NC A&T State University founded?", options: ["1885", "1891", "1901", "1910"], correctIndex: 1, type: "multiple", category: "HBCU History", difficulty: "easy" },
  { question: "The Greensboro Four sit-in took place at which store?", options: ["Woolworth's", "Kmart", "Sears", "JCPenney"], correctIndex: 0, type: "multiple", category: "HBCU History", difficulty: "easy" },
  { question: "NC A&T is the largest producer of Black engineers in the US.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "HBCU History", difficulty: "easy" },
  { question: "Which HBCU did Martin Luther King Jr. attend for undergrad?", options: ["Howard University", "Morehouse College", "Fisk University", "Tuskegee University"], correctIndex: 1, type: "multiple", category: "HBCU History", difficulty: "easy" },
  { question: "The Tuskegee Airmen were trained at which HBCU?", options: ["Howard University", "Morehouse College", "Tuskegee University", "NC A&T"], correctIndex: 2, type: "multiple", category: "HBCU History", difficulty: "easy" },
  { question: "HBCUs represent about 3% of all US colleges but produce what percentage of Black graduates?", options: ["5%", "10%", "20%", "30%"], correctIndex: 2, type: "multiple", category: "HBCU History", difficulty: "hard" },
  { question: "Which HBCU is the only all-male HBCU in the United States?", options: ["Howard University", "Morehouse College", "Spelman College", "Fisk University"], correctIndex: 1, type: "multiple", category: "HBCU History", difficulty: "easy" },
  { question: "Spelman College is the #1 producer of Black women who go on to earn STEM PhDs.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "HBCU History", difficulty: "medium" },
  { question: "Who co-founded the NAACP and was the first Black American to earn a PhD from Harvard?", options: ["Booker T. Washington", "Frederick Douglass", "W.E.B. Du Bois", "Marcus Garvey"], correctIndex: 2, type: "multiple", category: "HBCU History", difficulty: "medium" },

  // Computer Science
  { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correctIndex: 0, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "Which data structure uses LIFO (Last In First Out)?", options: ["Queue", "Stack", "Array", "Tree"], correctIndex: 1, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correctIndex: 2, type: "multiple", category: "Computer Science", difficulty: "medium" },
  { question: "HTML stands for HyperText Markup Language.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Computer Science", difficulty: "easy" },
  { question: "Which sorting algorithm has the best average time complexity?", options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], correctIndex: 2, type: "multiple", category: "Computer Science", difficulty: "medium" },
  { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Logic", "Standard Question Language", "System Query List"], correctIndex: 0, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "Which of these is NOT a programming language?", options: ["Python", "Java", "HTML", "C++"], correctIndex: 2, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "What is RAM?", options: ["Random Access Memory", "Read Access Module", "Runtime Application Memory", "Remote Access Method"], correctIndex: 0, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "A binary tree can have at most 2 children per node.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Computer Science", difficulty: "easy" },
  { question: "What does API stand for?", options: ["Application Programming Interface", "Automated Program Integration", "Application Process Input", "Advanced Programming Index"], correctIndex: 0, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "Which protocol is used to send emails?", options: ["HTTP", "FTP", "SMTP", "SSH"], correctIndex: 2, type: "multiple", category: "Computer Science", difficulty: "medium" },
  { question: "What is the base of the binary number system?", options: ["2", "8", "10", "16"], correctIndex: 0, type: "multiple", category: "Computer Science", difficulty: "easy" },

  // Engineering
  { question: "What does CAD stand for in engineering?", options: ["Computer Aided Design", "Central Automated Drawing", "Computer Applied Drafting", "Core Architecture Design"], correctIndex: 0, type: "multiple", category: "Engineering", difficulty: "easy" },
  { question: "Ohm's Law states that V = IR. What does R represent?", options: ["Rate", "Resistance", "Reactance", "Ratio"], correctIndex: 1, type: "multiple", category: "Engineering", difficulty: "easy" },
  { question: "What is the unit of electrical power?", options: ["Volt", "Ampere", "Watt", "Ohm"], correctIndex: 2, type: "multiple", category: "Engineering", difficulty: "easy" },
  { question: "Steel is stronger than aluminum.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Engineering", difficulty: "easy" },
  { question: "What does thermodynamics study?", options: ["Motion of objects", "Heat and energy transfer", "Chemical reactions", "Electromagnetic fields"], correctIndex: 1, type: "multiple", category: "Engineering", difficulty: "medium" },
  { question: "What is the SI unit of force?", options: ["Pascal", "Newton", "Joule", "Watt"], correctIndex: 1, type: "multiple", category: "Engineering", difficulty: "easy" },
  { question: "Which type of bridge uses cables to support the deck?", options: ["Arch bridge", "Beam bridge", "Suspension bridge", "Truss bridge"], correctIndex: 2, type: "multiple", category: "Engineering", difficulty: "medium" },
  { question: "What does PCB stand for in electronics?", options: ["Printed Circuit Board", "Power Control Base", "Processor Circuit Block", "Primary Control Bus"], correctIndex: 0, type: "multiple", category: "Engineering", difficulty: "easy" },

  // Science
  { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correctIndex: 2, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "How many chromosomes do humans have?", options: ["23", "46", "48", "44"], correctIndex: 1, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "What is the speed of light approximately?", options: ["3 x 10^6 m/s", "3 x 10^8 m/s", "3 x 10^10 m/s", "3 x 10^5 m/s"], correctIndex: 1, type: "multiple", category: "Science", difficulty: "medium" },
  { question: "DNA stands for Deoxyribonucleic Acid.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Science", difficulty: "easy" },
  { question: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mars", "Mercury"], correctIndex: 3, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], correctIndex: 2, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "What is the atomic number of carbon?", options: ["6", "8", "12", "14"], correctIndex: 0, type: "multiple", category: "Science", difficulty: "medium" },
  { question: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "The Earth is approximately 4.5 billion years old.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Science", difficulty: "medium" },
  { question: "What is Newton's second law of motion?", options: ["F = ma", "E = mc²", "V = IR", "PV = nRT"], correctIndex: 0, type: "multiple", category: "Science", difficulty: "easy" },

  // Business
  { question: "What does GDP stand for?", options: ["Gross Domestic Product", "General Development Plan", "Global Distribution Process", "Government Debt Payment"], correctIndex: 0, type: "multiple", category: "Business", difficulty: "easy" },
  { question: "What is a bull market?", options: ["A market with falling prices", "A market with rising prices", "A market with stable prices", "A market with high volatility"], correctIndex: 1, type: "multiple", category: "Business", difficulty: "easy" },
  { question: "What does ROI stand for?", options: ["Rate of Interest", "Return on Investment", "Risk of Inflation", "Revenue Over Income"], correctIndex: 1, type: "multiple", category: "Business", difficulty: "easy" },
  { question: "Supply and demand is a fundamental concept in economics.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Business", difficulty: "easy" },
  { question: "What is a startup?", options: ["A large established company", "A newly established business", "A government agency", "A non-profit organization"], correctIndex: 1, type: "multiple", category: "Business", difficulty: "easy" },
  { question: "What does B2B stand for?", options: ["Business to Business", "Back to Basics", "Buy to Build", "Brand to Brand"], correctIndex: 0, type: "multiple", category: "Business", difficulty: "easy" },
  { question: "What is inflation?", options: ["Decrease in prices over time", "Increase in prices over time", "Stable prices over time", "Decrease in money supply"], correctIndex: 1, type: "multiple", category: "Business", difficulty: "easy" },
  { question: "What is a balance sheet?", options: ["A record of daily transactions", "A financial statement showing assets and liabilities", "A list of employees", "A marketing plan"], correctIndex: 1, type: "multiple", category: "Business", difficulty: "medium" },

  // Math
  { question: "What is the value of π (pi) to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], correctIndex: 1, type: "multiple", category: "Math", difficulty: "easy" },
  { question: "What is the Pythagorean theorem?", options: ["a + b = c", "a² + b² = c²", "a × b = c²", "a² - b² = c"], correctIndex: 1, type: "multiple", category: "Math", difficulty: "easy" },
  { question: "What is the derivative of x²?", options: ["x", "2x", "x²", "2x²"], correctIndex: 1, type: "multiple", category: "Math", difficulty: "medium" },
  { question: "A prime number is only divisible by 1 and itself.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Math", difficulty: "easy" },
  { question: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctIndex: 2, type: "multiple", category: "Math", difficulty: "easy" },
  { question: "What is the square root of 144?", options: ["11", "12", "13", "14"], correctIndex: 1, type: "multiple", category: "Math", difficulty: "easy" },
  { question: "What is the formula for the area of a circle?", options: ["πr", "2πr", "πr²", "2πr²"], correctIndex: 2, type: "multiple", category: "Math", difficulty: "easy" },
  { question: "What is the integral of 2x?", options: ["x", "x²", "2x²", "x² + C"], correctIndex: 3, type: "multiple", category: "Math", difficulty: "medium" },

  // Campus Life (Weekend)
  { question: "What is NC A&T's school mascot?", options: ["Bulldog", "Aggie", "Spartan", "Eagle"], correctIndex: 1, type: "multiple", category: "Campus Life", difficulty: "easy" },
  { question: "What are NC A&T's school colors?", options: ["Blue and White", "Blue and Gold", "Gold and Green", "Black and Gold"], correctIndex: 1, type: "multiple", category: "Campus Life", difficulty: "easy" },
  { question: "NC A&T's marching band is called the Blue and Gold Marching Machine.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Campus Life", difficulty: "easy" },
  { question: "Which building is the main library at NC A&T?", options: ["Crosby Hall", "Bluford Library", "McNair Hall", "Merrick Hall"], correctIndex: 1, type: "multiple", category: "Campus Life", difficulty: "easy" },
  { question: "What does A&T stand for in NC A&T?", options: ["Arts and Technology", "Agriculture and Trade", "Agriculture and Technical", "Arts and Trade"], correctIndex: 2, type: "multiple", category: "Campus Life", difficulty: "easy" },

  // Pop Culture (Weekend)
  { question: "Which streaming service created the show 'Stranger Things'?", options: ["Hulu", "HBO", "Netflix", "Disney+"], correctIndex: 2, type: "multiple", category: "Pop Culture", difficulty: "easy" },
  { question: "What year was Instagram launched?", options: ["2008", "2010", "2012", "2014"], correctIndex: 1, type: "multiple", category: "Pop Culture", difficulty: "medium" },
  { question: "TikTok was originally called Musical.ly.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Pop Culture", difficulty: "medium" },
  { question: "Which artist released the album 'Renaissance' in 2022?", options: ["Rihanna", "Beyoncé", "Adele", "Lizzo"], correctIndex: 1, type: "multiple", category: "Pop Culture", difficulty: "easy" },
  { question: "What is the name of the fictional country in Black Panther?", options: ["Zamunda", "Wakanda", "Genovia", "Latveria"], correctIndex: 1, type: "multiple", category: "Pop Culture", difficulty: "easy" },
  { question: "Which social media platform has a character limit of 280 characters per post?", options: ["Instagram", "Facebook", "Twitter/X", "Snapchat"], correctIndex: 2, type: "multiple", category: "Pop Culture", difficulty: "easy" },

  // Sports (Weekend)
  { question: "How many players are on a basketball team on the court at one time?", options: ["4", "5", "6", "7"], correctIndex: 1, type: "multiple", category: "Sports", difficulty: "easy" },
  { question: "Which country invented basketball?", options: ["USA", "Canada", "UK", "Brazil"], correctIndex: 0, type: "multiple", category: "Sports", difficulty: "medium" },
  { question: "A touchdown in American football is worth 6 points.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Sports", difficulty: "easy" },
  { question: "How many innings are in a standard baseball game?", options: ["7", "8", "9", "10"], correctIndex: 2, type: "multiple", category: "Sports", difficulty: "easy" },
  { question: "Which NC A&T sport is the team known as the Aggies?", options: ["Football", "Basketball", "Baseball", "All of the above"], correctIndex: 3, type: "multiple", category: "Sports", difficulty: "easy" },

  // Would You Rather (Weekend)
  { question: "Would you rather have unlimited food or unlimited money?", options: ["Unlimited food", "Unlimited money", "Both equally", "Neither"], correctIndex: 1, type: "multiple", category: "Would You Rather", difficulty: "easy" },
  { question: "Would you rather study alone or in a group?", options: ["Study alone", "Study in a group", "Depends on subject", "I don't study"], correctIndex: 0, type: "multiple", category: "Would You Rather", difficulty: "easy" },
  { question: "Would you rather have a 8am class or a 8pm class?", options: ["8am class", "8pm class", "Neither", "Both are fine"], correctIndex: 1, type: "multiple", category: "Would You Rather", difficulty: "easy" },
  { question: "Would you rather never have homework or never have exams?", options: ["Never have homework", "Never have exams", "Keep both", "Get rid of both"], correctIndex: 1, type: "multiple", category: "Would You Rather", difficulty: "easy" },

  // More HBCU History
  { question: "Which HBCU produced astronaut Ronald McNair?", options: ["Howard University", "NC A&T State University", "Morehouse College", "Tuskegee University"], correctIndex: 1, type: "multiple", category: "HBCU History", difficulty: "hard" },
  { question: "Rosa Parks refused to give up her seat on a bus in which city?", options: ["Birmingham", "Atlanta", "Montgomery", "Selma"], correctIndex: 2, type: "multiple", category: "HBCU History", difficulty: "easy" },
  { question: "The Civil Rights Act of 1964 was signed by which president?", options: ["John F. Kennedy", "Lyndon B. Johnson", "Richard Nixon", "Dwight Eisenhower"], correctIndex: 1, type: "multiple", category: "HBCU History", difficulty: "medium" },
  { question: "Juneteenth celebrates the emancipation of enslaved people in Texas.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "HBCU History", difficulty: "easy" },
  { question: "Which HBCU is located in Washington D.C.?", options: ["Fisk University", "Spelman College", "Howard University", "Grambling State"], correctIndex: 2, type: "multiple", category: "HBCU History", difficulty: "easy" },

  // More CS
  { question: "What does OOP stand for in programming?", options: ["Object Oriented Programming", "Output Oriented Process", "Ordered Operation Protocol", "Object Operation Programming"], correctIndex: 0, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "Which company created the Java programming language?", options: ["Microsoft", "Apple", "Sun Microsystems", "Google"], correctIndex: 2, type: "multiple", category: "Computer Science", difficulty: "medium" },
  { question: "Git is a version control system.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Computer Science", difficulty: "easy" },
  { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Process", "HyperText Terminal Program", "Host Transfer Text Protocol"], correctIndex: 0, type: "multiple", category: "Computer Science", difficulty: "easy" },
  { question: "Which data structure uses FIFO (First In First Out)?", options: ["Stack", "Queue", "Tree", "Graph"], correctIndex: 1, type: "multiple", category: "Computer Science", difficulty: "easy" },

  // More Science
  { question: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correctIndex: 2, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "What is the process by which plants make food?", options: ["Respiration", "Photosynthesis", "Fermentation", "Osmosis"], correctIndex: 1, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "Sound travels faster in water than in air.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Science", difficulty: "medium" },
  { question: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], correctIndex: 2, type: "multiple", category: "Science", difficulty: "easy" },
  { question: "Which vitamin is produced by the skin when exposed to sunlight?", options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], correctIndex: 3, type: "multiple", category: "Science", difficulty: "easy" },

  // More Math
  { question: "What is the sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correctIndex: 1, type: "multiple", category: "Math", difficulty: "easy" },
  { question: "What is 2 to the power of 10?", options: ["512", "1024", "2048", "256"], correctIndex: 1, type: "multiple", category: "Math", difficulty: "medium" },
  { question: "A negative times a negative equals a positive.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Math", difficulty: "easy" },
  { question: "What is the slope formula?", options: ["(y2-y1)/(x2-x1)", "(x2-x1)/(y2-y1)", "(y2+y1)/(x2+x1)", "(x2+x1)/(y2+y1)"], correctIndex: 0, type: "multiple", category: "Math", difficulty: "medium" },

  // More Business
  { question: "What is a monopoly?", options: ["When many companies compete", "When one company dominates a market", "When government controls a market", "When prices are regulated"], correctIndex: 1, type: "multiple", category: "Business", difficulty: "easy" },
  { question: "What does IPO stand for?", options: ["Initial Public Offering", "Internal Process Operation", "Integrated Production Output", "Investment Portfolio Option"], correctIndex: 0, type: "multiple", category: "Business", difficulty: "medium" },
  { question: "Cash flow is the movement of money in and out of a business.", options: ["True", "False"], correctIndex: 0, type: "truefalse", category: "Business", difficulty: "easy" },
  { question: "What is the purpose of marketing?", options: ["To manage employees", "To promote and sell products", "To track finances", "To handle legal issues"], correctIndex: 1, type: "multiple", category: "Business", difficulty: "easy" },
]

async function main() {
  console.log('Seeding questions...')
  for (const q of questions) {
    await prisma.gameQuestion.create({ data: q })
  }
  console.log(`✅ Seeded ${questions.length} questions!`)
}

main().catch(console.error).finally(() => prisma.$disconnect())