const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const titles = ['Frontend Engineer', 'Backend Engineer', 'Fullstack Developer', 'DevOps Engineer', 'Mobile Developer', 'Data Scientist', 'Product Manager', 'UI/UX Designer', 'QA Engineer', 'Security Specialist', 'Cloud Architect', 'Systems Administrator', 'Machine Learning Engineer', 'Blockchain Developer', 'Game Developer'];
const companies = ['Alpha Tech', 'Beta Apps', 'Gamma Cloud', 'Delta Systems', 'Epsilon Data', 'Zeta Corp', 'Eta Solutions', 'Theta Inc', 'Iota Soft', 'Kappa Labs', 'Lambda Services', 'Mu Networks', 'Nu Digital', 'Xi Dynamics', 'Omicron Ventures'];
const locations = ['Cape Town, South Africa', 'Johannesburg, South Africa', 'Pretoria, South Africa', 'Durban, South Africa', 'Remote', 'Stellenbosch, South Africa', 'Sandton, South Africa'];
const skillSets = [
  ['React', 'Node', 'TypeScript'],
  ['Python', 'Django', 'SQL'],
  ['Java', 'Spring', 'AWS'],
  ['C#', '.NET', 'Azure'],
  ['Go', 'Kubernetes', 'Docker'],
  ['Swift', 'iOS', 'Objective-C'],
  ['Kotlin', 'Android', 'Jetpack Compose'],
  ['Flutter', 'Dart', 'Firebase'],
  ['PHP', 'Laravel', 'MySQL'],
  ['Ruby', 'Rails', 'Postgres']
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateJobs(count, recruiterId) {
  const jobs = [];
  for (let i = 0; i < count; i++) {
    jobs.push({
      title: getRandom(titles),
      company: getRandom(companies),
      location: getRandom(locations),
      salaryMax: 40000 + Math.floor(Math.random() * 160000),
      skills: JSON.stringify(getRandom(skillSets)),
      logoUrl: `https://picsum.photos/600/300?random=${i}`,
      urgencyLevel: Math.floor(Math.random() * 4),
      boosted: Math.random() > 0.8,
      postedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      recruiterId: recruiterId,
      views: Math.floor(Math.random() * 1000),
      applicantsCount: Math.floor(Math.random() * 100),
      description: 'Exciting opportunity to work with a great team on cutting-edge technologies.'
    });
  }
  return jobs;
}

function generateCandidates(count) {
  const candidates = [];
  for (let i = 0; i < count; i++) {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Jessica', 'Daniel', 'Ashley', 'James', 'Amanda', 'Robert', 'Jennifer', 'William', 'Elizabeth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
    
    candidates.push({
      id: `c${i + 100}`, // Avoid collision with static IDs if any
      email: `candidate${i + 100}@example.com`,
      name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
      role: 'candidate',
      location: getRandom(locations),
      logoUrl: `https://picsum.photos/200/200?random=${i + 100}`,
      title: getRandom(titles),
      experience: 1 + Math.floor(Math.random() * 15),
      skills: JSON.stringify(getRandom(skillSets)),
      employmentStatus: Math.random() > 0.5 ? 'Open to work' : 'Actively seeking',
      boosted: Math.random() > 0.9
    });
  }
  return candidates;
}

async function main() {
  console.log('Seeding massive data...');
  
  // Clean up first
  // Note: Delete order matters due to foreign keys
  await prisma.swipe.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // Create default recruiter
  const recruiter = await prisma.user.create({
    data: {
      id: 'r1',
      email: 'recruiter@example.com',
      name: 'Default Recruiter',
      role: 'recruiter',
      location: 'Johannesburg',
      company: 'Tech Corp',
    }
  });

  // Create default candidate for login
  await prisma.user.create({
    data: {
      id: 'c1',
      email: 'ahmed@example.com',
      name: 'Ahmed Hamza',
      role: 'candidate',
      location: 'Cape Town',
      title: 'Senior React Dev',
      experience: 6,
      skills: JSON.stringify(['React', 'RN']),
      logoUrl: 'https://picsum.photos/200/200?c1'
    }
  });

  console.log('Generating jobs...');
  const jobs = generateJobs(200, recruiter.id); // Generate 200 jobs
  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  console.log('Generating candidates...');
  const candidates = generateCandidates(200); // Generate 200 candidates
  for (const candidate of candidates) {
    await prisma.user.create({ data: candidate });
  }

  console.log('Generating applications...');
  const createdCandidates = await prisma.user.findMany({ where: { role: 'candidate' } });
  const createdJobs = await prisma.job.findMany({ where: { recruiterId: recruiter.id } });

  for (let i = 0; i < 60; i++) {
     const c = getRandom(createdCandidates);
     const j = getRandom(createdJobs);
     await prisma.application.create({
       data: {
         candidateId: c.id,
         jobId: j.id,
         status: ['pending', 'reviewed', 'accepted', 'rejected'][Math.floor(Math.random() * 4)],
         message: 'I am very interested in this role. Please consider my application.',
         resumeUrl: Math.random() > 0.3 ? 'https://example.com/resume.pdf' : null,
         createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000))
       }
     });
  }
  
  console.log('Seeding done. Created 200 jobs, 200 candidates, and 60 applications.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
