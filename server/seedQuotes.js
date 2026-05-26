console.log('Script starting...')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const quotes = [
  // Monday Motivation
  {
    text: "Excellence is not a destination but a continuous journey that never ends.",
    author: "Brian Tracy",
    authorTitle: "Author & Motivational Speaker",
    wikiTitle: "Brian_Tracy",
    field: "General",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Brian_Tracy"
  },
  {
    text: "We must accept finite disappointment, but never lose infinite hope.",
    author: "Martin Luther King Jr.",
    authorTitle: "Civil Rights Leader & Nobel Peace Prize Laureate",
    wikiTitle: "Martin_Luther_King_Jr.",
    field: "Leadership",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Martin_Luther_King_Jr."
  },
  {
    text: "You have to be burning with an idea, or a problem, or a wrong that you want to right.",
    author: "Steve Jobs",
    authorTitle: "Co-Founder of Apple Inc.",
    wikiTitle: "Steve_Jobs",
    field: "Technology",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Steve_Jobs"
  },
  {
    text: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington",
    authorTitle: "Educator, Author & Advisor to Presidents",
    wikiTitle: "Booker_T._Washington",
    field: "Education",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Booker_T._Washington"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    authorTitle: "Author & Humorist",
    wikiTitle: "Mark_Twain",
    field: "General",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Mark_Twain"
  },
  {
    text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X",
    authorTitle: "Human Rights Activist & Minister",
    wikiTitle: "Malcolm_X",
    field: "Education",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Malcolm_X"
  },
  {
    text: "The way to right wrongs is to turn the light of truth upon them.",
    author: "Ida B. Wells",
    authorTitle: "Investigative Journalist & Civil Rights Leader",
    wikiTitle: "Ida_B._Wells",
    field: "Leadership",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Ida_B._Wells"
  },
  {
    text: "Technology is best when it brings people together.",
    author: "Matt Mullenweg",
    authorTitle: "Co-Founder of WordPress",
    wikiTitle: "Matt_Mullenweg",
    field: "Technology",
    dayTheme: "Monday Motivation",
    wikiUrl: "https://en.wikipedia.org/wiki/Matt_Mullenweg"
  },

  // Tuesday Focus
  {
    text: "Darkness cannot drive out darkness; only light can do that.",
    author: "Martin Luther King Jr.",
    authorTitle: "Civil Rights Leader & Nobel Peace Prize Laureate",
    wikiTitle: "Martin_Luther_King_Jr.",
    field: "Leadership",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/Martin_Luther_King_Jr."
  },
  {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
    authorTitle: "Founding Father, Inventor & Diplomat",
    wikiTitle: "Benjamin_Franklin",
    field: "General",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/Benjamin_Franklin"
  },
  {
    text: "Science knows no country, because knowledge belongs to humanity.",
    author: "Louis Pasteur",
    authorTitle: "Chemist & Microbiologist",
    wikiTitle: "Louis_Pasteur",
    field: "Science",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/Louis_Pasteur"
  },
  {
    text: "The function of education is to teach one to think intensively and to think critically.",
    author: "Martin Luther King Jr.",
    authorTitle: "Civil Rights Leader & Nobel Peace Prize Laureate",
    wikiTitle: "Martin_Luther_King_Jr.",
    field: "Education",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/Martin_Luther_King_Jr."
  },
  {
    text: "We must use time as a tool, not as a couch.",
    author: "John F. Kennedy",
    authorTitle: "35th President of the United States",
    wikiTitle: "John_F._Kennedy",
    field: "Leadership",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/John_F._Kennedy"
  },
  {
    text: "We cannot solve our problems with the same thinking we used when we created them.",
    author: "Albert Einstein",
    authorTitle: "Theoretical Physicist, Nobel Prize Laureate",
    wikiTitle: "Albert_Einstein",
    field: "Science",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/Albert_Einstein"
  },
  {
    text: "I am not tragically colored. There is no great sorrow dammed up in my soul.",
    author: "Zora Neale Hurston",
    authorTitle: "Author, Anthropologist & Filmmaker",
    wikiTitle: "Zora_Neale_Hurston",
    field: "Arts",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/Zora_Neale_Hurston"
  },
  {
    text: "I am America. I am the part you won't recognize. But get used to me.",
    author: "Muhammad Ali",
    authorTitle: "World Heavyweight Boxing Champion & Activist",
    wikiTitle: "Muhammad_Ali",
    field: "General",
    dayTheme: "Tuesday Focus",
    wikiUrl: "https://en.wikipedia.org/wiki/Muhammad_Ali"
  },

  // Wednesday Wisdom
  {
    text: "The more I read, the more I acquire, the more certain I am that I know nothing.",
    author: "Voltaire",
    authorTitle: "French Enlightenment Writer & Philosopher",
    wikiTitle: "Voltaire",
    field: "Philosophy",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Voltaire"
  },
  {
    text: "In mathematics the art of proposing a question must be held of higher value than solving it.",
    author: "Georg Cantor",
    authorTitle: "Mathematician, Creator of Set Theory",
    wikiTitle: "Georg_Cantor",
    field: "Mathematics",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Georg_Cantor"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    authorTitle: "Former President of South Africa & Nobel Peace Prize Laureate",
    wikiTitle: "Nelson_Mandela",
    field: "Leadership",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Nelson_Mandela"
  },
  {
    text: "Without education, you are not going anywhere in this world.",
    author: "Malcolm X",
    authorTitle: "Human Rights Activist & Minister",
    wikiTitle: "Malcolm_X",
    field: "Education",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Malcolm_X"
  },
  {
    text: "When you learn, teach. When you get, give.",
    author: "Maya Angelou",
    authorTitle: "Poet, Memoirist & Civil Rights Activist",
    wikiTitle: "Maya_Angelou",
    field: "Education",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Maya_Angelou"
  },
  {
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    authorTitle: "Essayist, Lecturer & Philosopher",
    wikiTitle: "Ralph_Waldo_Emerson",
    field: "General",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Ralph_Waldo_Emerson"
  },
  {
    text: "The Negro needs the scientist and the inventor on the one hand, and the poet on the other.",
    author: "Alain Locke",
    authorTitle: "Philosopher & Father of the Harlem Renaissance",
    wikiTitle: "Alain_LeRoy_Locke",
    field: "Arts",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Alain_LeRoy_Locke"
  },
  {
    text: "Engineering is the art of directing the great sources of power in nature for the use and convenience of man.",
    author: "Thomas Tredgold",
    authorTitle: "British Engineer & Writer",
    wikiTitle: "Thomas_Tredgold",
    field: "Engineering",
    dayTheme: "Wednesday Wisdom",
    wikiUrl: "https://en.wikipedia.org/wiki/Thomas_Tredgold"
  },

  // Thursday Grind
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
    authorTitle: "Inventor & Businessman",
    wikiTitle: "Thomas_Edison",
    field: "Engineering",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Thomas_Edison"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    authorTitle: "Co-Founder of Apple Inc.",
    wikiTitle: "Steve_Jobs",
    field: "Technology",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Steve_Jobs"
  },
  {
    text: "Life is not measured by the number of breaths we take, but by the moments that take our breath away.",
    author: "Maya Angelou",
    authorTitle: "Poet, Memoirist & Civil Rights Activist",
    wikiTitle: "Maya_Angelou",
    field: "Arts",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Maya_Angelou"
  },
  {
    text: "Somewhere, something incredible is waiting to be known.",
    author: "Carl Sagan",
    authorTitle: "Astronomer, Cosmologist & Author",
    wikiTitle: "Carl_Sagan",
    field: "Science",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Carl_Sagan"
  },
  {
    text: "I never lose. I either win or learn.",
    author: "Nelson Mandela",
    authorTitle: "Former President of South Africa & Nobel Peace Prize Laureate",
    wikiTitle: "Nelson_Mandela",
    field: "Leadership",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Nelson_Mandela"
  },
  {
    text: "The question is not who is going to let me; it's who is going to stop me.",
    author: "Ayn Rand",
    authorTitle: "Author & Philosopher",
    wikiTitle: "Ayn_Rand",
    field: "General",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Ayn_Rand"
  },
  {
    text: "The measure of intelligence is the ability to change.",
    author: "Albert Einstein",
    authorTitle: "Theoretical Physicist, Nobel Prize Laureate",
    wikiTitle: "Albert_Einstein",
    field: "Science",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Albert_Einstein"
  },
  {
    text: "The thing always happens that you really believe in; and the belief in a thing makes it happen.",
    author: "Frank Lloyd Wright",
    authorTitle: "Architect & Designer",
    wikiTitle: "Frank_Lloyd_Wright",
    field: "Engineering",
    dayTheme: "Thursday Grind",
    wikiUrl: "https://en.wikipedia.org/wiki/Frank_Lloyd_Wright"
  },

  // Friday Energy
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    authorTitle: "Author & Theologian",
    wikiTitle: "C._S._Lewis",
    field: "General",
    dayTheme: "Friday Energy",
    wikiUrl: "https://en.wikipedia.org/wiki/C._S._Lewis"
  },
  {
    text: "The most common way people give up their power is by thinking they don't have any.",
    author: "Alice Walker",
    authorTitle: "Author & Activist, Winner of the Pulitzer Prize",
    wikiTitle: "Alice_Walker",
    field: "Arts",
    dayTheme: "Friday Energy",
    wikiUrl: "https://en.wikipedia.org/wiki/Alice_Walker"
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    authorTitle: "Blues Musician & Cultural Icon",
    wikiTitle: "B._B._King",
    field: "General",
    dayTheme: "Friday Energy",
    wikiUrl: "https://en.wikipedia.org/wiki/B._B._King"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    authorTitle: "Former Prime Minister of the United Kingdom",
    wikiTitle: "Winston_Churchill",
    field: "Leadership",
    dayTheme: "Friday Energy",
    wikiUrl: "https://en.wikipedia.org/wiki/Winston_Churchill"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    authorTitle: "Former First Lady & Human Rights Activist",
    wikiTitle: "Eleanor_Roosevelt",
    field: "General",
    dayTheme: "Friday Energy",
    wikiUrl: "https://en.wikipedia.org/wiki/Eleanor_Roosevelt"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    authorTitle: "Former President of South Africa & Nobel Peace Prize Laureate",
    wikiTitle: "Nelson_Mandela",
    field: "Leadership",
    dayTheme: "Friday Energy",
    wikiUrl: "https://en.wikipedia.org/wiki/Nelson_Mandela"
  },
  {
    text: "You can't use up creativity. The more you use, the more you have.",
    author: "Maya Angelou",
    authorTitle: "Poet, Memoirist & Civil Rights Activist",
    wikiTitle: "Maya_Angelou",
    field: "Arts",
    dayTheme: "Friday Energy",
    wikiUrl: "https://en.wikipedia.org/wiki/Maya_Angelou"
  },

  // Saturday Scholar
  {
    text: "Research is to see what everybody else has seen, and to think what nobody else has thought.",
    author: "Albert Szent-Györgyi",
    authorTitle: "Nobel Prize-Winning Biochemist",
    wikiTitle: "Albert_Szent-Gy%C3%B6rgyi",
    field: "Science",
    dayTheme: "Saturday Scholar",
    wikiUrl: "https://en.wikipedia.org/wiki/Albert_Szent-Gy%C3%B6rgyi"
  },
  {
    text: "Mathematics is the language with which God has written the universe.",
    author: "Galileo Galilei",
    authorTitle: "Astronomer, Physicist & Engineer",
    wikiTitle: "Galileo_Galilei",
    field: "Mathematics",
    dayTheme: "Saturday Scholar",
    wikiUrl: "https://en.wikipedia.org/wiki/Galileo_Galilei"
  },
  {
    text: "The advance of technology is based on making it fit in so that you don't really even notice it.",
    author: "Bill Gates",
    authorTitle: "Co-Founder of Microsoft",
    wikiTitle: "Bill_Gates",
    field: "Technology",
    dayTheme: "Saturday Scholar",
    wikiUrl: "https://en.wikipedia.org/wiki/Bill_Gates"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    authorTitle: "32nd President of the United States",
    wikiTitle: "Franklin_D._Roosevelt",
    field: "Leadership",
    dayTheme: "Saturday Scholar",
    wikiUrl: "https://en.wikipedia.org/wiki/Franklin_D._Roosevelt"
  },
  {
    text: "Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.",
    author: "Langston Hughes",
    authorTitle: "Poet, Social Activist & Harlem Renaissance Leader",
    wikiTitle: "Langston_Hughes",
    field: "Arts",
    dayTheme: "Saturday Scholar",
    wikiUrl: "https://en.wikipedia.org/wiki/Langston_Hughes"
  },
  {
    text: "Nothing in life is to be feared, it is only to be understood.",
    author: "Marie Curie",
    authorTitle: "Physicist & Chemist, First Woman to Win a Nobel Prize",
    wikiTitle: "Marie_Curie",
    field: "Science",
    dayTheme: "Saturday Scholar",
    wikiUrl: "https://en.wikipedia.org/wiki/Marie_Curie"
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    authorTitle: "Blues Musician & Cultural Icon",
    wikiTitle: "B._B._King",
    field: "General",
    dayTheme: "Saturday Scholar",
    wikiUrl: "https://en.wikipedia.org/wiki/B._B._King"
  },

  // Sunday Reset
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    authorTitle: "Author & Political Activist",
    wikiTitle: "Anne_Lamott",
    field: "General",
    dayTheme: "Sunday Reset",
    wikiUrl: "https://en.wikipedia.org/wiki/Anne_Lamott"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    authorTitle: "26th President of the United States",
    wikiTitle: "Theodore_Roosevelt",
    field: "Leadership",
    dayTheme: "Sunday Reset",
    wikiUrl: "https://en.wikipedia.org/wiki/Theodore_Roosevelt"
  },
  {
    text: "Each person must live their life as a model for others.",
    author: "Rosa Parks",
    authorTitle: "Civil Rights Activist",
    wikiTitle: "Rosa_Parks",
    field: "Leadership",
    dayTheme: "Sunday Reset",
    wikiUrl: "https://en.wikipedia.org/wiki/Rosa_Parks"
  },
  {
    text: "Every great dream begins with a dreamer.",
    author: "Harriet Tubman",
    authorTitle: "Abolitionist & Political Activist",
    wikiTitle: "Harriet_Tubman",
    field: "Leadership",
    dayTheme: "Sunday Reset",
    wikiUrl: "https://en.wikipedia.org/wiki/Harriet_Tubman"
  },
  {
    text: "Nothing in life is to be feared, it is only to be understood.",
    author: "Marie Curie",
    authorTitle: "Physicist & Chemist, First Woman to Win a Nobel Prize",
    wikiTitle: "Marie_Curie",
    field: "Science",
    dayTheme: "Sunday Reset",
    wikiUrl: "https://en.wikipedia.org/wiki/Marie_Curie"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    authorTitle: "Former First Lady & Human Rights Activist",
    wikiTitle: "Eleanor_Roosevelt",
    field: "General",
    dayTheme: "Sunday Reset",
    wikiUrl: "https://en.wikipedia.org/wiki/Eleanor_Roosevelt"
  },
  {
    text: "I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin.",
    author: "Martin Luther King Jr.",
    authorTitle: "Civil Rights Leader & Nobel Peace Prize Laureate",
    wikiTitle: "Martin_Luther_King_Jr.",
    field: "Leadership",
    dayTheme: "Sunday Reset",
    wikiUrl: "https://en.wikipedia.org/wiki/Martin_Luther_King_Jr."
  }
]

async function main() {
  console.log('Seeding quotes...')
  for (const quote of quotes) {
    await prisma.quote.create({ data: quote })
  }
  console.log(`✅ Seeded ${quotes.length} quotes!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())