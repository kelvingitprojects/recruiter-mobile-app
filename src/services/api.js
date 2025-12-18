import { QueryClient } from '@tanstack/react-query';
import { GRAPHQL_URL } from '../config/env';

export const mockJobs = [
  { id: 'j1', title: 'Frontend Engineer', company: 'Alpha Tech', location: 'Cape Town, South Africa', employmentType: 'Full-time', experienceLevel: 'Mid-Senior', workSetting: 'Hybrid', industry: 'Software', postedAt: '2025-11-28', applicantsCount: 34, views: 820, salaryMax: 90000, salaryCurrency: 'R', benefits: ['Medical aid', 'Retirement plan', 'Remote stipend'], responsibilities: ['Build and ship UI features', 'Collaborate with product and design', 'Write unit and e2e tests'], qualifications: ['5+ years React', 'TypeScript proficiency', 'CSS-in-JS'], preferredQualifications: ['GraphQL', 'React Native', 'CI/CD'], skills: ['React', 'TypeScript'], description: 'Lead development of web experiences used by millions. Work with a high-performance team and deliver quality.', logoUrl: 'https://picsum.photos/600/300?1', urgencyLevel: 2, boosted: true },
  { id: 'j2', title: 'Mobile Engineer', company: 'Beta Apps', location: 'Johannesburg, South Africa', employmentType: 'Contract', experienceLevel: 'Associate', workSetting: 'Remote', industry: 'Mobile', postedAt: '2025-11-30', applicantsCount: 12, views: 240, salaryMax: 95000, salaryCurrency: 'R', benefits: ['Flexible hours', 'Equipment budget'], responsibilities: ['Own RN features', 'Improve performance', 'Automate builds'], qualifications: ['2+ years React Native', 'TypeScript', 'Android/iOS tooling'], preferredQualifications: ['Expo', 'Native Modules'], skills: ['React Native'], description: 'Help us deliver delightful mobile experiences across iOS and Android.', logoUrl: 'https://picsum.photos/600/300?2', urgencyLevel: 0 },
  { id: 'j3', title: 'Backend Engineer', company: 'Gamma Cloud', location: 'Pretoria, South Africa', employmentType: 'Full-time', experienceLevel: 'Senior', workSetting: 'On-site', industry: 'Cloud', postedAt: '2025-11-20', applicantsCount: 56, views: 1400, salaryMax: 100000, salaryCurrency: 'R', benefits: ['Bonus', 'Upskilling budget'], responsibilities: ['Design REST/GraphQL APIs', 'Own database schema', 'Ensure reliability and observability'], qualifications: ['5+ years Node.js', 'SQL/Postgres', 'Docker'], preferredQualifications: ['Kubernetes', 'AWS'], skills: ['Node', 'Postgres'], description: 'Build scalable backend services powering mission-critical systems.', logoUrl: 'https://picsum.photos/600/300?3' },

  // ↓ 20 JOBS WITH COMPANY ADDED
  { id: 'j4', title: 'DevOps Engineer', company: 'OpsForge', salaryMax: 110000, skills: ['AWS', 'Docker', 'CI/CD'], logoUrl: 'https://picsum.photos/600/300?7', urgencyLevel: 3 },
  { id: 'j5', title: 'Fullstack Developer', company: 'StackLabs', salaryMax: 95000, skills: ['React', 'Node'], logoUrl: 'https://picsum.photos/600/300?8', urgencyLevel: 1 },
  { id: 'j6', title: 'Data Scientist', company: 'DeepMind SA', salaryMax: 120000, skills: ['Python', 'TensorFlow'], logoUrl: 'https://picsum.photos/600/300?9', boosted: true },
  { id: 'j7', title: 'UI/UX Designer', company: 'DesignHive', salaryMax: 85000, skills: ['Figma'], logoUrl: 'https://picsum.photos/600/300?10' },
  { id: 'j8', title: 'QA Engineer', company: 'Quality Labs', salaryMax: 80000, skills: ['Selenium', 'Cypress'], logoUrl: 'https://picsum.photos/600/300?11', urgencyLevel: 2 },
  { id: 'j9', title: 'Cloud Architect', company: 'Nimbus Cloud', salaryMax: 140000, skills: ['AWS', 'Kubernetes'], logoUrl: 'https://picsum.photos/600/300?12' },
  { id: 'j10', title: 'Security Specialist', company: 'ShieldSec', salaryMax: 130000, skills: ['PenTesting', 'OWASP'], logoUrl: 'httpsum.photos/600/300?13', urgencyLevel: 3 },
  { id: 'j11', title: 'AI Engineer', company: 'NeuroTech', salaryMax: 150000, skills: ['Machine Learning', 'PyTorch'], logoUrl: 'https://picsum.photos/600/300?14', boosted: true },
  { id: 'j12', title: 'Systems Engineer', company: 'InfraCore', salaryMax: 90000, skills: ['Linux', 'Networking'], logoUrl: 'https://picsum.photos/600/300?15' },
  { id: 'j13', title: 'Solutions Architect', company: 'BuildSphere', salaryMax: 125000, skills: ['Cloud', 'Microservices'], logoUrl: 'https://picsum.photos/600/300?16', urgencyLevel: 1 },
  { id: 'j14', title: 'Product Manager', company: 'VisionFlow', salaryMax: 115000, skills: ['Agile', 'Roadmapping'], logoUrl: 'https://picsum.photos/600/300?17' },
  { id: 'j15', title: 'Software Engineer Intern', company: 'FutureDev', salaryMax: 35000, skills: ['JavaScript'], logoUrl: 'https://picsum.photos/600/300?18' },
  { id: 'j16', title: 'Machine Learning Engineer', company: 'ML Innovations', salaryMax: 145000, skills: ['Python', 'ML'], logoUrl: 'https://picsum.photos/600/300?19', boosted: true },
  { id: 'j17', title: 'Database Administrator', company: 'DataNest', salaryMax: 95000, skills: ['SQL', 'Postgres'], logoUrl: 'https://picsum.photos/600/300?20' },
  { id: 'j18', title: 'React Native Lead', company: 'MobileWorks', salaryMax: 120000, skills: ['React Native', 'TypeScript'], logoUrl: 'https://picsum.photos/600/300?21', urgencyLevel: 2 },
  { id: 'j19', title: 'API Engineer', company: 'API Factory', salaryMax: 105000, skills: ['Fastify', 'GraphQL'], logoUrl: 'https://picsum.photos/600/300?22' },
  { id: 'j20', title: 'Blockchain Developer', company: 'ChainLab', salaryMax: 130000, skills: ['Solidity', 'Web3'], logoUrl: 'https://picsum.photos/600/300?23', boosted: true },
  { id: 'j21', title: 'Game Developer', company: 'PixelForge', salaryMax: 90000, skills: ['Unity', 'C#'], logoUrl: 'https://picsum.photos/600/300?24' },
  { id: 'j22', title: 'IT Support Tech', company: 'HelpDesk Pro', salaryMax: 60000, skills: ['Networking', 'Helpdesk'], logoUrl: 'https://picsum.photos/600/300?25', urgencyLevel: 1 },
  { id: 'j23', title: 'Cloud Support Engineer', company: 'SkyNet Solutions', salaryMax: 100000, skills: ['AWS', 'Linux'], logoUrl: 'https://picsum.photos/600/300?26' }
];



export const mockCandidates = [
  { id: 'c1', name: 'Ahmed Hamza', title: 'Senior React Dev', experience: 6, skills: ['React', 'RN'], logoUrl: 'https://picsum.photos/600/300?4', employmentStatus: 'Open to work' },
  { id: 'c2', name: 'Lerato Mokoena', title: 'Fullstack JS', experience: 4, skills: ['Node', 'React'], logoUrl: 'https://picsum.photos/600/300?5', boosted: true, employmentStatus: 'Actively seeking' },
  { id: 'c3', name: 'Thabo Nkosi', title: 'Mobile Specialist', experience: 5, skills: ['React Native'], logoUrl: 'https://picsum.photos/600/300?6', employmentStatus: 'Available for freelance' },

  // ↓ 20 NEW CANDIDATES
  { id: 'c4', name: 'Naledi Khumalo', title: 'DevOps Specialist', experience: 7, skills: ['AWS', 'Kubernetes'], logoUrl: 'https://picsum.photos/600/300?27' },
  { id: 'c5', name: 'Peter Smith', title: 'Junior Frontend Dev', experience: 1, skills: ['React'], logoUrl: 'https://picsum.photos/600/300?28' },
  { id: 'c6', name: 'Zanele Dlamini', title: 'Backend Node Dev', experience: 3, skills: ['Node', 'Postgres'], logoUrl: 'https://picsum.photos/600/300?29', boosted: true },
  { id: 'c7', name: 'David Brown', title: 'Machine Learning Student', experience: 1, skills: ['Python'], logoUrl: 'https://picsum.photos/600/300?30' },
  { id: 'c8', name: 'Ayanda Ndlovu', title: 'UI Designer', experience: 4, skills: ['Figma'], logoUrl: 'https://picsum.photos/600/300?31' },
  { id: 'c9', name: 'Kabelo Maseko', title: 'Senior RN Engineer', experience: 7, skills: ['React Native', 'TypeScript'], logoUrl: 'https://picsum.photos/600/300?32' },
  { id: 'c10', name: 'Priya Patel', title: 'Data Analyst', experience: 3, skills: ['SQL', 'Python'], logoUrl: 'https://picsum.photos/600/300?33' },
  { id: 'c11', name: 'Sibusiso Zulu', title: 'Cloud Engineer', experience: 5, skills: ['AWS'], logoUrl: 'https://picsum.photos/600/300?34' },
  { id: 'c12', name: 'Anika Naidoo', title: 'Pentester', experience: 6, skills: ['Security', 'OWASP'], logoUrl: 'https://picsum.photos/600/300?35' },
  { id: 'c13', name: 'Michael Green', title: 'Junior Software Dev', experience: 1, skills: ['JavaScript'], logoUrl: 'https://picsum.photos/600/300?36' },
  { id: 'c14', name: 'Nandi Molefe', title: 'AI Engineer', experience: 4, skills: ['PyTorch', 'ML'], logoUrl: 'https://picsum.photos/600/300?37', boosted: true },
  { id: 'c15', name: 'Jason Lee', title: 'Solutions Architect', experience: 8, skills: ['Cloud', 'Microservices'], logoUrl: 'https://picsum.photos/600/300?38' },
  { id: 'c16', name: 'Boitumelo Seabi', title: 'Product Manager', experience: 6, skills: ['Agile'], logoUrl: 'https://picsum.photos/600/300?39' },
  { id: 'c17', name: 'Chantel Erasmus', title: 'C# Game Dev', experience: 5, skills: ['Unity', 'C#'], logoUrl: 'https://picsum.photos/600/300?40' },
  { id: 'c18', name: 'Ethan Wright', title: 'Blockchain Developer', experience: 4, skills: ['Solidity'], logoUrl: 'https://picsum.photos/600/300?41' },
  { id: 'c19', name: 'Khaya Mhlongo', title: 'Database Admin', experience: 5, skills: ['Postgres', 'SQL'], logoUrl: 'https://picsum.photos/600/300?42' },
  { id: 'c20', name: 'Julia Adams', title: 'API Developer', experience: 3, skills: ['Fastify', 'GraphQL'], logoUrl: 'https://picsum.photos/600/300?43' },
  { id: 'c21', name: 'Sipho Dube', title: 'Cloud Support', experience: 2, skills: ['Linux', 'AWS'], logoUrl: 'https://picsum.photos/600/300?44' },
  { id: 'c22', name: 'Aisha Khan', title: 'React Native Intern', experience: 0.5, skills: ['React Native'], logoUrl: 'https://picsum.photos/600/300?45' },
  { id: 'c23', name: 'Gugu Mbatha', title: 'SRE Engineer', experience: 6, skills: ['Docker', 'CI/CD'], logoUrl: 'https://picsum.photos/600/300?46', boosted: true }
];


export const queryClient = new QueryClient();

export const fetchJobs = async (candidateId) => {
  const g = await import('./graphql');
  if (candidateId) return g.fetchJobStackGql(candidateId);
  return g.fetchJobsGql();
};

export const loginAuth = async (email, password) => {
  const g = await import('./graphql');
  const res = await g.loginGql(email, password);
  g.setAuthToken(res.token);
  return res;
};

export const signupAuth = async (email, password, name, role) => {
  const g = await import('./graphql');
  const res = await g.signupGql(email, password, name, role);
  g.setAuthToken(res.token);
  return res;
};

export const requestPasswordReset = async (email) => {
  const g = await import('./graphql');
  return g.requestPasswordResetGql(email);
};

export const resetPassword = async (token, password) => {
  const g = await import('./graphql');
  return g.resetPasswordGql(token, password);
};
export const fetchCandidates = async (recruiterId) => {
  const g = await import('./graphql');
  if (recruiterId) return g.fetchCandidateStackGql(recruiterId);
  return g.fetchCandidatesGql();
};
export const fetchJobById = async (id) => {
  const g = await import('./graphql');
  const list = await g.fetchJobsGql();
  return list.find(j => j.id === id) || null;
};
export const fetchCandidateById = async (id) => {
  const g = await import('./graphql');
  const list = await g.fetchCandidatesGql();
  return list.find(c => c.id === id) || null;
};

export const swipeRight = async (target, swiperId) => {
  const g = await import('./graphql');
  return g.recordSwipeGql({ direction: 'right', targetId: target.id, targetType: target.name ? 'candidate' : 'job', swiperId });
};
export const swipeLeft = async (target, swiperId) => {
  const g = await import('./graphql');
  return g.recordSwipeGql({ direction: 'left', targetId: target.id, targetType: target.name ? 'candidate' : 'job', swiperId });
};
export const swipeUp = async (target, swiperId) => {
  const g = await import('./graphql');
  return g.recordSwipeGql({ direction: 'up', targetId: target.id, targetType: target.name ? 'candidate' : 'job', swiperId });
};

export const applyToJob = async (jobId, candidateId, message) => {
  const g = await import('./graphql');
  return g.applyToJobGql(jobId, candidateId, message);
};

export const fetchApplications = async (recruiterId, skip, take) => {
  const g = await import('./graphql');
  return g.fetchApplicationsGql(recruiterId, skip, take);
};

export const updateApplicationStatus = async (id, status, feedback) => {
  const g = await import('./graphql');
  return g.updateApplicationStatusGql(id, status, feedback);
};

export const fetchNotifications = async (userId) => {
  const g = await import('./graphql');
  return g.fetchNotificationsGql(userId);
};

export const markNotificationRead = async (id) => {
  const g = await import('./graphql');
  return g.markNotificationReadGql(id);
};

export const upgradePlan = async (userId, plan) => {
  const g = await import('./graphql');
  return g.upgradePlanGql(userId, plan);
};

export const fetchMe = async (id) => {
  const g = await import('./graphql');
  return g.fetchMeGql(id);
};

export const fetchMyJobs = async (recruiterId) => {
  const g = await import('./graphql');
  return g.fetchMyJobsGql(recruiterId);
};

export const createJob = async (recruiterId, input) => {
  const g = await import('./graphql');
  return g.createJobGql(recruiterId, input);
};

export const updateJob = async (id, input) => {
  const g = await import('./graphql');
  return g.updateJobGql(id, input);
};

export const updateProfile = async (id, input) => {
  const g = await import('./graphql');
  return g.updateProfileGql(id, input);
};

// ---------- Ranking & Stack ----------
const cityRegions = {
  'Johannesburg': 'Gauteng',
  'Pretoria': 'Gauteng',
  'Midrand': 'Gauteng',
  'Centurion': 'Gauteng',
  'Cape Town': 'Western Cape',
  'Stellenbosch': 'Western Cape',
  'Durban': 'KZN',
  'Umhlanga': 'KZN'
};
const getRegion = city => {
  if (!city) return 'Other';
  for (const [k, v] of Object.entries(cityRegions)) {
    if (city.includes(k)) return v;
  }
  return 'Other';
};

const jaccard = (a = [], b = []) => {
  const A = new Set(a.map(s => s.toLowerCase()));
  const B = new Set(b.map(s => s.toLowerCase()));
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
};

const normalize = (v, min, max) => {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (v - min) / (max - min)));
};

const asDate = d => (d ? new Date(d) : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000));

// In-memory swipe stats to simulate training data
const swipeStatsCandidates = {};
const swipeStatsJobs = {};
// In-memory user preference learning
const learnedSkills = {};

export function resetAlgorithm() {
  for (const k in swipeStatsCandidates) delete swipeStatsCandidates[k];
  for (const k in swipeStatsJobs) delete swipeStatsJobs[k];
  for (const k in learnedSkills) delete learnedSkills[k];
}

export function recordSwipeLocal({ direction, targetId, targetType }) {
  const right = direction === 'right' || direction === 'up';
  
  // Update global stats
  if (targetType === 'candidate') {
    const s = swipeStatsCandidates[targetId] || { right: 0, total: 0, lastActive: Date.now() };
    s.total += 1;
    if (right) s.right += 1;
    s.lastActive = Date.now();
    swipeStatsCandidates[targetId] = s;
  } else {
    const s = swipeStatsJobs[targetId] || { right: 0, total: 0, lastActive: Date.now() };
    s.total += 1;
    if (right) s.right += 1;
    s.lastActive = Date.now();
    swipeStatsJobs[targetId] = s;
  }

  // Update user preferences (learning)
  if (right) {
    let target;
    if (targetType === 'candidate') target = mockCandidates.find(c => c.id === targetId);
    else target = mockJobs.find(j => j.id === targetId);

    if (target && target.skills) {
      target.skills.forEach(skill => {
        learnedSkills[skill] = (learnedSkills[skill] || 0) + 1;
      });
    }
  }

  return { ok: true };
}

export function getCandidateStack({ recruiterCity, preferredSkills = [], minScore = 0, subscription = false } = {}, base = mockCandidates) {
  const now = Date.now();
  
  // Merge explicit preferences with learned preferences
  const topLearned = Object.entries(learnedSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);
  const effectiveSkills = [...new Set([...(preferredSkills || []), ...topLearned])];

  const enriched = base.map(c => ({
    ...c,
    location: c.location || ['Cape Town','Johannesburg','Pretoria','Durban'][Math.floor(Math.random()*4)],
    lastActive: c.lastActive || asDate(c.lastActive),
    ...(swipeStatsCandidates[c.id] ? { swipesRight: swipeStatsCandidates[c.id].right, swipesTotal: swipeStatsCandidates[c.id].total, lastActive: new Date(swipeStatsCandidates[c.id].lastActive) } : {}),
    swipesRight: (swipeStatsCandidates[c.id]?.right ?? c.swipesRight ?? Math.floor(Math.random() * 50)),
    swipesTotal: (swipeStatsCandidates[c.id]?.total ?? c.swipesTotal ?? Math.floor(50 + Math.random() * 200)),
  }));
  const maxExp = Math.max(...enriched.map(c => c.experience || 0), 1);
  const scored = enriched.map(c => {
    const desirability = normalize(((c.swipesRight / Math.max(1, c.swipesTotal)) || 0) + (c.boosted ? 0.2 : 0) + ((c.experience || 0) / maxExp) * 0.3, 0, 1);
    
    const rRegion = getRegion(recruiterCity);
    const cRegion = getRegion(c.location);
    const sameCity = recruiterCity && c.location && c.location.includes(recruiterCity);
    const sameRegion = rRegion === cRegion && rRegion !== 'Other';
    const locFit = sameCity ? 1 : (sameRegion ? 0.8 : 0.4);

    const skillsFit = jaccard(c.skills || [], effectiveSkills);
    const activity = normalize(now - asDate(c.lastActive).getTime(), 0, 7 * 24 * 60 * 60 * 1000);
    const activityFit = 1 - activity; // recent -> higher
    const proBoost = subscription ? 1.5 : 1;
    const score = (0.4 * desirability + 0.25 * locFit + 0.2 * skillsFit + 0.1 * activityFit) * proBoost;
    return { ...c, matchScore: score };
  }).filter(c => c.matchScore >= minScore - 0.1);
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}

export function getJobStack({ candidateCity, skills = [], subscription = false } = {}, base = mockJobs) {
  const now = Date.now();
  
  // Merge explicit preferences with learned preferences
  const topLearned = Object.entries(learnedSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);
  const effectiveSkills = [...new Set([...(skills || []), ...topLearned])];

  const enriched = base.map(j => ({
    ...j,
    location: j.location || ['Cape Town, South Africa','Johannesburg, South Africa','Durban, South Africa'][Math.floor(Math.random()*3)],
    lastActive: j.postedAt || asDate(j.postedAt),
    ...(swipeStatsJobs[j.id] ? { views: (j.views ?? 0) + swipeStatsJobs[j.id].total, applicantsCount: (j.applicantsCount ?? 0) + swipeStatsJobs[j.id].right, lastActive: new Date(swipeStatsJobs[j.id].lastActive) } : {}),
    views: (j.views ?? Math.floor(200 + Math.random() * 1500)),
    applicantsCount: (j.applicantsCount ?? Math.floor(Math.random() * 120)),
  }));
  const scored = enriched.map(j => {
    const desirability = normalize((j.views ? j.applicantsCount / Math.max(1, j.views) : 0) + (j.boosted ? 0.2 : 0), 0, 1);
    
    const cRegion = getRegion(candidateCity);
    const jRegion = getRegion(j.location);
    const sameCity = candidateCity && j.location && j.location.includes(candidateCity);
    const sameRegion = cRegion === jRegion && cRegion !== 'Other';
    const locFit = sameCity ? 1 : (sameRegion ? 0.8 : 0.4);

    const skillsFit = jaccard(j.skills || [], effectiveSkills);
    const activity = normalize(now - asDate(j.lastActive).getTime(), 0, 14 * 24 * 60 * 60 * 1000);
    const activityFit = 1 - activity;
    const proBoost = subscription ? 1.2 : 1;
    const score = (0.4 * desirability + 0.25 * locFit + 0.2 * skillsFit + 0.1 * activityFit) * proBoost + (j.urgencyLevel ? 0.05 * j.urgencyLevel : 0);
    return { ...j, matchScore: score };
  });
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}
