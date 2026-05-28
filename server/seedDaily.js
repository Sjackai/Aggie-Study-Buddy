console.log('Script starting...')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const hbcuFacts = [
  { fact: "North Carolina A&T State University was founded in 1891 as the Agricultural and Mechanical College for the Negro Race, making it one of the oldest HBCUs in the nation.", source: "NC A&T History" },
  { fact: "NC A&T has produced more Black engineers than any other university in the United States.", source: "NACME" },
  { fact: "The Greensboro Four — NC A&T students Ezell Blair Jr., Franklin McCain, Joseph McNeil, and David Richmond — launched the Woolworth sit-in movement on February 1, 1960.", source: "NC A&T History" },
  { fact: "HBCUs represent only 3% of all colleges and universities in the U.S. but produce nearly 20% of all Black college graduates.", source: "UNCF" },
  { fact: "Howard University in Washington D.C. has produced more on-campus Black PhD graduates than any other university in the world.", source: "Howard University" },
  { fact: "Spelman College in Atlanta, GA is the #1 producer of Black women who go on to earn STEM PhDs.", source: "NSF" },
  { fact: "NC A&T's College of Engineering is the largest producer of Black engineers at the undergraduate level in the United States.", source: "ASEE" },
  { fact: "Historically Black Colleges and Universities were founded primarily in the South after the Civil War to provide education to freed enslaved people who were denied access to white institutions.", source: "HBCU History" },
  { fact: "Morehouse College in Atlanta is the only all-male HBCU in the United States and has produced notable alumni including Martin Luther King Jr. and Spike Lee.", source: "Morehouse College" },
  { fact: "NC A&T's renowned marching band, the Blue & Gold Marching Machine, is widely regarded as one of the top HBCU bands in the country.", source: "NC A&T" },
  { fact: "Tuskegee University's Airmen, the first Black military aviators in the U.S. Armed Forces, were trained at Tuskegee — an HBCU in Alabama.", source: "Tuskegee University" },
  { fact: "HBCUs award approximately 27% of all bachelor's degrees earned by Black students in the United States.", source: "UNCF" },
  { fact: "NC A&T produced astronaut Ronald McNair, who was one of the crew members of the Space Shuttle Challenger in 1986.", source: "NASA" },
  { fact: "Florida A&M University (FAMU) has one of the top pharmacy schools in the nation and is a leading producer of Black pharmacists.", source: "FAMU" },
  { fact: "The first HBCU, Cheyney University of Pennsylvania, was founded in 1837 — 28 years before the end of slavery.", source: "Cheyney University" },
  { fact: "NC A&T alumna Joann Morgan was the first woman to hold a senior engineer position in the firing room at NASA's Kennedy Space Center.", source: "NASA" },
  { fact: "Xavier University of Louisiana is the #1 producer of Black students who go on to earn medical degrees in the United States.", source: "Xavier University" },
  { fact: "NC A&T's Dr. Ayele Haile holds multiple patents in the field of nanotechnology and has been recognized as one of the top researchers in the country.", source: "NC A&T Research" },
  { fact: "There are 101 HBCUs currently accredited in the United States, located primarily in the South.", source: "U.S. Department of Education" },
  { fact: "NC A&T is home to the Joint School of Nanoscience and Nanoengineering, one of only a few such programs in the world.", source: "NC A&T" },
  { fact: "Grambling State University's football program has sent more players to the NFL than any other HBCU.", source: "GSU Athletics" },
  { fact: "NC A&T's motto is 'Aggies Do' — reflecting the university's commitment to action, service, and excellence.", source: "NC A&T" },
  { fact: "The United Negro College Fund (UNCF), founded in 1944, has provided over $5 billion in scholarships to students attending HBCUs.", source: "UNCF" },
  { fact: "NC A&T has a long tradition of producing leaders in agriculture — the university's College of Agriculture and Environmental Sciences is one of the most respected in the nation.", source: "NC A&T CAES" },
  { fact: "More than 80% of Black American judges, 50% of Black lawyers, and 40% of Black doctors earned their undergraduate degrees at HBCUs.", source: "UNCF" },
  { fact: "NC A&T's School of Business and Economics is AACSB accredited, placing it among the top business schools in the country.", source: "NC A&T SBE" },
  { fact: "Prairie View A&M University in Texas was the second public institution of higher education established in Texas, founded in 1876.", source: "PVAMU" },
  { fact: "NC A&T produces a significant number of the nation's Black aerospace engineers, with many alumni working at NASA, Boeing, and Lockheed Martin.", source: "NC A&T Engineering" },
  { fact: "Morgan State University in Baltimore was the first HBCU designated as a Doctoral Research University by the Carnegie Classification.", source: "Morgan State" },
  { fact: "NC A&T's research expenditures exceed $100 million annually, making it one of the top research universities among HBCUs.", source: "NC A&T Research" },
]

const historyEvents = [
  { date: '01-01', year: 1863, event: "The Emancipation Proclamation takes effect", significance: "President Lincoln's executive order declared that enslaved people in Confederate states were free, changing the course of American history." },
  { date: '01-15', year: 1929, event: "Martin Luther King Jr. is born in Atlanta, Georgia", significance: "MLK Jr. would go on to lead the Civil Rights Movement and earn the Nobel Peace Prize in 1964." },
  { date: '02-01', year: 1960, event: "The Greensboro Sit-Ins begin at Woolworth's lunch counter", significance: "NC A&T students Ezell Blair Jr., Franklin McCain, Joseph McNeil, and David Richmond sparked a nationwide sit-in movement." },
  { date: '02-03', year: 1870, event: "The 15th Amendment is ratified, granting Black men the right to vote", significance: "This amendment prohibited denying the right to vote based on race, color, or previous condition of servitude." },
  { date: '02-12', year: 1909, event: "The NAACP is founded", significance: "The National Association for the Advancement of Colored People was co-founded by W.E.B. Du Bois and others to fight racial inequality." },
  { date: '02-14', year: 1818, event: "Frederick Douglass is born", significance: "Douglass escaped slavery to become one of the most influential abolitionists, writers, and orators in American history." },
  { date: '02-23', year: 1868, event: "W.E.B. Du Bois is born", significance: "Du Bois became the first Black American to earn a PhD from Harvard and co-founded the NAACP." },
  { date: '03-07', year: 1965, event: "Bloody Sunday on the Edmund Pettus Bridge in Selma, Alabama", significance: "Civil rights marchers were brutally attacked by state troopers, galvanizing national support for the Voting Rights Act." },
  { date: '03-21', year: 1965, event: "The Selma to Montgomery marches conclude successfully", significance: "Over 25,000 people marched to the Alabama State Capitol, leading to the passage of the Voting Rights Act of 1965." },
  { date: '04-04', year: 1968, event: "Martin Luther King Jr. is assassinated in Memphis, Tennessee", significance: "Dr. King's assassination shocked the world and sparked protests across the United States." },
  { date: '04-09', year: 1866, event: "The Civil Rights Act of 1866 is passed", significance: "This was the first federal law to define citizenship and affirm that all citizens are equally protected by the law." },
  { date: '05-17', year: 1954, event: "Brown v. Board of Education is decided by the Supreme Court", significance: "The landmark ruling declared racial segregation in public schools unconstitutional, overturning Plessy v. Ferguson." },
  { date: '05-19', year: 1925, event: "Malcolm X is born in Omaha, Nebraska", significance: "Malcolm X became one of the most powerful voices for Black rights and self-determination in the 20th century." },
  { date: '06-19', year: 1865, event: "Juneteenth — enslaved people in Texas learn of emancipation", significance: "Two and a half years after the Emancipation Proclamation, Union soldiers arrived in Galveston, Texas to announce freedom." },
  { date: '07-02', year: 1964, event: "The Civil Rights Act of 1964 is signed into law", significance: "President Johnson signed the landmark law prohibiting discrimination based on race, color, religion, sex, or national origin." },
  { date: '07-26', year: 1948, event: "President Truman signs Executive Order 9981, desegregating the military", significance: "This order abolished racial discrimination in the U.S. Armed Forces." },
  { date: '08-06', year: 1965, event: "The Voting Rights Act is signed into law", significance: "This act prohibited discriminatory voting practices that had disenfranchised Black Americans for decades." },
  { date: '08-28', year: 1963, event: "Martin Luther King Jr. delivers 'I Have a Dream' speech at the March on Washington", significance: "Over 250,000 people gathered at the Lincoln Memorial for one of the most iconic speeches in American history." },
  { date: '08-28', year: 1955, event: "Emmett Till is murdered in Mississippi", significance: "The brutal murder of 14-year-old Emmett Till and his mother's decision to have an open casket funeral galvanized the Civil Rights Movement." },
  { date: '09-09', year: 1957, event: "The Civil Rights Act of 1957 is signed", significance: "The first civil rights legislation since Reconstruction, it established the Civil Rights Division of the Justice Department." },
  { date: '09-15', year: 1963, event: "16th Street Baptist Church bombing in Birmingham, Alabama", significance: "Four young Black girls were killed when KKK members bombed the church, shocking the nation." },
  { date: '09-25', year: 1957, event: "The Little Rock Nine integrate Central High School", significance: "Nine Black students, protected by federal troops, integrated Little Rock Central High School in Arkansas." },
  { date: '10-01', year: 1962, event: "James Meredith becomes the first Black student at the University of Mississippi", significance: "Federal marshals escorted Meredith onto campus amid violent riots, marking a major moment in the Civil Rights Movement." },
  { date: '10-16', year: 1995, event: "The Million Man March takes place in Washington D.C.", significance: "Hundreds of thousands of Black men gathered in Washington D.C. in a demonstration of unity and solidarity." },
  { date: '11-01', year: 1891, event: "North Carolina A&T State University is founded", significance: "NC A&T was established as the Agricultural and Mechanical College for the Negro Race, beginning its legacy of excellence." },
  { date: '11-02', year: 1983, event: "President Reagan signs legislation making MLK Day a federal holiday", significance: "Martin Luther King Jr. Day became a federal holiday, celebrated on the third Monday of January each year." },
  { date: '11-19', year: 1863, event: "President Lincoln delivers the Gettysburg Address", significance: "Lincoln's speech honored those who died at Gettysburg and redefined the Civil War as a fight for equality." },
  { date: '12-01', year: 1955, event: "Rosa Parks refuses to give up her seat on a Montgomery bus", significance: "Parks' act of defiance sparked the Montgomery Bus Boycott, a pivotal moment in the Civil Rights Movement." },
  { date: '12-05', year: 1955, event: "The Montgomery Bus Boycott begins", significance: "Black residents boycotted the Montgomery bus system for 381 days, leading to the desegregation of public buses." },
  { date: '12-10', year: 1964, event: "Martin Luther King Jr. receives the Nobel Peace Prize", significance: "At 35, Dr. King became the youngest person to receive the Nobel Peace Prize at that time." },
]

async function main() {
  console.log('Seeding HBCU facts...')
  for (const fact of hbcuFacts) {
    await prisma.hBCUFact.create({ data: fact })
  }
  console.log(`✅ Seeded ${hbcuFacts.length} HBCU facts!`)

  console.log('Seeding history events...')
  for (const event of historyEvents) {
    await prisma.historyEvent.create({ data: event })
  }
  console.log(`✅ Seeded ${historyEvents.length} history events!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())