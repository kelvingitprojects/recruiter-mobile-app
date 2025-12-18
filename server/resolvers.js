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

const parseSkills = (skillsStr) => {
  if (!skillsStr) return [];
  try {
    return JSON.parse(skillsStr);
  } catch (e) {
    return skillsStr.split(',').map(s => s.trim());
  }
};

const checkQuota = async (user, type, prisma) => {
  const now = new Date();
  const lastReset = new Date(user.lastSwipeReset);
  const isSameDay = now.getDate() === lastReset.getDate() && 
                    now.getMonth() === lastReset.getMonth() && 
                    now.getFullYear() === lastReset.getFullYear();

  let updates = {};
  if (!isSameDay) {
    updates = { swipeCount: 0, superLikeCount: 0, lastSwipeReset: now };
  }

  // Define limits
  const limits = {
    free: { swipe: 50, superlike: 1, jobs: 1 },
    pro: { swipe: 999999, superlike: 5, jobs: 5 },
    enterprise: { swipe: 999999, superlike: 999999, jobs: 999999 }
  };

  const plan = user.plan || 'free';
  const limit = limits[plan] || limits.free;

  // Apply reset if needed
  if (!isSameDay) {
    await prisma.user.update({ where: { id: user.id }, data: updates });
    user.swipeCount = 0;
    user.superLikeCount = 0;
  }

  if (type === 'swipe' && user.swipeCount >= limit.swipe) {
    throw new Error('Daily swipe limit reached. Upgrade to continue.');
  }

  if (type === 'superlike' && user.superLikeCount >= limit.superlike) {
    throw new Error('Daily superlike limit reached. Upgrade to continue.');
  }

  if (type === 'job') {
    const jobCount = await prisma.job.count({
      where: { recruiterId: user.id }
    });
    if (jobCount >= limit.jobs) {
      throw new Error(`Job posting limit reached (${limit.jobs}). Upgrade to post more.`);
    }
  }

  return true;
};

const jwt = require('jsonwebtoken');

const resolvers = {
  User: {
    skills: (parent) => parseSkills(parent.skills),
    notifications: (parent, _, { prisma }) => prisma.notification.findMany({ where: { userId: parent.id }, orderBy: { createdAt: 'desc' } })
  },
  Notification: {
    createdAt: (parent) => parent.createdAt.toISOString()
  },
  Job: {
    skills: (parent) => parseSkills(parent.skills),
    postedAt: (parent) => parent.postedAt.toISOString(),
    applicantsCount: (parent, _, { prisma }) => prisma.application.count({ where: { jobId: parent.id } })
  },
  ApplicationLog: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Application: {
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
    candidate: (parent, _, { prisma }) => prisma.user.findUnique({ where: { id: parent.candidateId } }),
    job: (parent, _, { prisma }) => prisma.job.findUnique({ where: { id: parent.jobId } }),
    logs: (parent, _, { prisma }) => prisma.applicationLog.findMany({ where: { applicationId: parent.id }, orderBy: { createdAt: 'desc' } })
  },
  Query: {
    jobs: async (_, __, { prisma }) => {
      return prisma.job.findMany();
    },
    candidates: async (_, __, { prisma }) => {
      return prisma.user.findMany({ where: { role: 'candidate' } });
    },
    me: async (_, { id }, { prisma }) => {
      return prisma.user.findUnique({ where: { id } });
    },
    candidateStack: async (_, { recruiterId }, { prisma }) => {
      const recruiter = await prisma.user.findUnique({ where: { id: recruiterId } });
      if (!recruiter) throw new Error('Recruiter not found');

      // Get candidates not yet swiped
      const swipedIds = (await prisma.swipe.findMany({
        where: { swiperId: recruiterId, candidateId: { not: null } },
        select: { candidateId: true }
      })).map(s => s.candidateId);

      const candidates = await prisma.user.findMany({
        where: {
          role: 'candidate',
          id: { notIn: swipedIds }
        },
        include: {
          swipesReceived: true // To calc desirability
        }
      });

      // Learn preferences from past likes
      const likedSwipes = await prisma.swipe.findMany({
        where: { swiperId: recruiterId, direction: { in: ['right', 'up'] }, candidateId: { not: null } },
        include: { candidate: true }
      });
      
      const learnedSkillsCount = {};
      likedSwipes.forEach(s => {
        const skills = parseSkills(s.candidate?.skills);
        skills.forEach(skill => {
          learnedSkillsCount[skill] = (learnedSkillsCount[skill] || 0) + 1;
        });
      });
      
      const topLearned = Object.entries(learnedSkillsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);
        
      const preferredSkills = []; // Could add explicit recruiter prefs here if stored
      const effectiveSkills = [...new Set([...preferredSkills, ...topLearned])];

      const now = Date.now();
      const maxExp = Math.max(...candidates.map(c => c.experience || 0), 1);

      const scored = candidates.map(c => {
        const cSkills = parseSkills(c.skills);
        const swipesRight = c.swipesReceived.filter(s => ['right', 'up'].includes(s.direction)).length;
        const swipesTotal = c.swipesReceived.length;
        
        const desirability = normalize(((swipesRight / Math.max(1, swipesTotal)) || 0) + (c.boosted ? 0.2 : 0) + ((c.experience || 0) / maxExp) * 0.3, 0, 1);
        
        const rRegion = getRegion(recruiter.location);
        const cRegion = getRegion(c.location);
        const sameCity = recruiter.location && c.location && c.location.includes(recruiter.location);
        const sameRegion = rRegion === cRegion && rRegion !== 'Other';
        const locFit = sameCity ? 1 : (sameRegion ? 0.8 : 0.4);

        const skillsFit = jaccard(cSkills, effectiveSkills);
        const activity = normalize(now - new Date(c.lastActive).getTime(), 0, 7 * 24 * 60 * 60 * 1000);
        const activityFit = 1 - activity;

        const score = (0.4 * desirability + 0.25 * locFit + 0.2 * skillsFit + 0.1 * activityFit);
        return { ...c, matchScore: score };
      });

      return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 50);
    },

    jobStack: async (_, { candidateId }, { prisma }) => {
      const candidate = await prisma.user.findUnique({ where: { id: candidateId } });
      if (!candidate) throw new Error('Candidate not found');

      const swipedJobIds = (await prisma.swipe.findMany({
        where: { swiperId: candidateId, jobId: { not: null } },
        select: { jobId: true }
      })).map(s => s.jobId);

      const jobs = await prisma.job.findMany({
        where: { id: { notIn: swipedJobIds } },
        include: {
          swipesReceived: true
        }
      });

      // Learn preferences
      const likedSwipes = await prisma.swipe.findMany({
        where: { swiperId: candidateId, direction: { in: ['right', 'up'] }, jobId: { not: null } },
        include: { job: true }
      });

      const learnedSkillsCount = {};
      likedSwipes.forEach(s => {
        const skills = parseSkills(s.job?.skills);
        skills.forEach(skill => {
          learnedSkillsCount[skill] = (learnedSkillsCount[skill] || 0) + 1;
        });
      });

      const topLearned = Object.entries(learnedSkillsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);

      const candidateSkills = parseSkills(candidate.skills);
      const effectiveSkills = [...new Set([...candidateSkills, ...topLearned])];

      const now = Date.now();
      
      const scored = jobs.map(j => {
        const jSkills = parseSkills(j.skills);
        // Using stored views/applicants for desirability
        const desirability = normalize((j.views ? j.applicantsCount / Math.max(1, j.views) : 0) + (j.boosted ? 0.2 : 0), 0, 1);
        
        const cRegion = getRegion(candidate.location);
        const jRegion = getRegion(j.location);
        const sameCity = candidate.location && j.location && j.location.includes(candidate.location);
        const sameRegion = cRegion === jRegion && cRegion !== 'Other';
        const locFit = sameCity ? 1 : (sameRegion ? 0.8 : 0.4);

        const skillsFit = jaccard(jSkills, effectiveSkills);
        const activity = normalize(now - new Date(j.lastActive).getTime(), 0, 14 * 24 * 60 * 60 * 1000);
        const activityFit = 1 - activity;

        const score = (0.4 * desirability + 0.25 * locFit + 0.2 * skillsFit + 0.1 * activityFit) + (j.urgencyLevel ? 0.05 * j.urgencyLevel : 0);
        return { ...j, matchScore: score };
      });

      return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 50);
    },

    myJobs: async (_, { recruiterId }, { prisma }) => {
      return prisma.job.findMany({
        where: { recruiterId },
        orderBy: { postedAt: 'desc' }
      });
    },

    myApplications: async (_, { recruiterId, skip, take }, { prisma }) => {
      return prisma.application.findMany({
        where: {
          job: {
            recruiterId: recruiterId
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      });
    },

    myCandidateApplications: async (_, { candidateId }, { prisma }) => {
      return prisma.application.findMany({
        where: { candidateId },
        orderBy: { createdAt: 'desc' },
        include: { job: true }
      });
    },

    myNotifications: async (_, { userId }, { prisma }) => {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }
  },

  Mutation: {
    signup: async (_, { email, password, name, role }, { prisma }) => {
      const safeEmail = email.toLowerCase().trim();
      if (!safeEmail) throw new Error('Email is required');
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

      const existingUser = await prisma.user.findUnique({ where: { email: safeEmail } });
      if (existingUser) throw new Error('User already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      const safeRole = role === 'recruiter' ? 'recruiter' : 'candidate';
      const defaultName = name && name.trim() ? name.trim() : safeEmail.split('@')[0];

      const user = await prisma.user.create({
        data: {
          email: safeEmail,
          password: hashedPassword,
          name: defaultName,
          role: safeRole,
          plan: 'free',
          boosted: false,
        }
      });

      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn: '7d' });
      return { token, user };
    },

    login: async (_, { email, password }, { prisma }) => {
      const safeEmail = String(email || '').toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email: safeEmail } });
      if (!user) throw new Error('Invalid email or password');

      // If user has no password (migrated from old auth), fail for now or allow set?
      // For security, we require password. User should use reset password flow if they have no password set yet.
      if (!user.password) throw new Error('Please reset your password to login');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid email or password');

      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn: '7d' });
      return { token, user };
    },

    requestPasswordReset: async (_, { email }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (!user) return true; // Fail silently for security

      // Generate a random token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: expiry }
      });

      // MOCK EMAIL SENDING
      console.log('---------------------------------------------------');
      console.log(`PASSWORD RESET REQUEST FOR ${email}`);
      console.log(`RESET TOKEN: ${resetToken}`);
      console.log('---------------------------------------------------');

      return true;
    },

    resetPassword: async (_, { token, password }, { prisma }) => {
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() }
        }
      });

      if (!user) throw new Error('Invalid or expired token');

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return true;
    },
    createJob: async (_, { recruiterId, input }, { prisma }) => {
      const recruiter = await prisma.user.findUnique({ where: { id: recruiterId } });
      if (!recruiter) throw new Error('Recruiter not found');
      if (recruiter.role !== 'recruiter') throw new Error('Only recruiters can create jobs');
      
      await checkQuota(recruiter, 'job', prisma);

      const isBoosted = ['pro', 'enterprise'].includes(recruiter.plan);

      return prisma.job.create({
        data: {
          ...input,
          recruiterId,
          skills: JSON.stringify(input.skills || []),
          postedAt: new Date(),
          lastActive: new Date(),
          boosted: isBoosted
        }
      });
    },

    updateJob: async (_, { id, input }, { prisma }) => {
      const data = { ...input };
      if (input.skills) {
        data.skills = JSON.stringify(input.skills);
      }
      return prisma.job.update({
        where: { id },
        data: { ...data, lastActive: new Date() }
      });
    },

    updateProfile: async (_, { id, input }, { prisma }) => {
      const data = { ...input };
      if (data.name && data.name.length > 120) throw new Error('Name too long');
      if (data.email && data.email.length > 200) throw new Error('Email too long');
      if (data.bio && data.bio.length > 5000) throw new Error('Bio too long');
      if (data.title && data.title.length > 200) throw new Error('Title too long');
      if (input.skills) data.skills = JSON.stringify(input.skills);
      if (input.cultureTags) data.skills = JSON.stringify(input.cultureTags); // Store cultureTags in skills field for now as schema reuse
      // Actually schema has cultureTags field? No. Schema says:
      // Candidate: skills
      // Recruiter: company, industry. No explicit cultureTags field in User model in schema.prisma?
      // Let's check schema.prisma again.
      // schema.prisma User model:
      // skills String? // Stored as JSON string "['React', 'Node']"
      // So for Recruiter, we can reuse 'skills' field for 'cultureTags' or add a new field.
      // The prompt mentioned "cultureTags" in the frontend.
      // Let's reuse 'skills' for simplicity or add it if needed.
      // Re-reading schema.prisma:
      // model User { ... skills String? ... }
      // So yes, we reuse skills.
      
      // But wait, the Profile.js frontend sends 'cultureTags' for recruiters.
      // We should map cultureTags to skills in the database if we want to reuse it, or just use 'skills' field name in input.
      // The input has 'cultureTags' field.
      
      if (input.cultureTags) {
         data.skills = JSON.stringify(input.cultureTags);
         delete data.cultureTags;
      }
      
      return prisma.user.update({
        where: { id },
        data
      });
    },

    swipe: async (_, { input }, { prisma }) => {
      const { direction, targetId, targetType, swiperId } = input;
      
      if (!swiperId) {
        throw new Error("swiperId is required");
      }

      const swiper = await prisma.user.findUnique({ where: { id: swiperId } });
      await checkQuota(swiper, 'swipe', prisma);

      const data = {
        direction,
        swiperId,
      };

      if (targetType === 'candidate') {
        data.candidateId = targetId;
        // Update stats
        if (['right', 'up'].includes(direction)) {
           // Increment swipe count
           await prisma.user.update({ where: { id: swiperId }, data: { swipeCount: { increment: 1 } } });

           // Check for Match (Recruiter swiped Candidate)
           // Did Candidate swipe any Job posted by this Recruiter?
           // This is tricky. A "Match" in this context usually means Mutual Interest.
           // Candidate swipes Jobs. Recruiter swipes Candidates.
           // If Recruiter likes Candidate, check if Candidate liked ANY job from this recruiter.
           
           const recruiterJobs = await prisma.job.findMany({ where: { recruiterId: swiperId }, select: { id: true } });
           const jobIds = recruiterJobs.map(j => j.id);
           
           const candidateSwipe = await prisma.swipe.findFirst({
             where: {
               swiperId: targetId,
               jobId: { in: jobIds },
               direction: { in: ['right', 'up'] }
             }
           });

           if (candidateSwipe) {
             // It's a Match! Notify both.
             await prisma.notification.create({
               data: {
                 userId: swiperId,
                 type: 'match',
                 title: 'New Match!',
                 body: 'A candidate you liked has also liked one of your jobs.',
                 data: JSON.stringify({ candidateId: targetId, jobId: candidateSwipe.jobId })
               }
             });
             
             await prisma.notification.create({
               data: {
                 userId: targetId,
                 type: 'match',
                 title: 'New Match!',
                 body: 'A recruiter has liked your profile!',
                 data: JSON.stringify({ recruiterId: swiperId, jobId: candidateSwipe.jobId })
               }
             });
           }
        }
      } else {
        data.jobId = targetId;
        // Update Job stats
        if (['right', 'up'].includes(direction)) {
           await prisma.user.update({ where: { id: swiperId }, data: { swipeCount: { increment: 1 } } });

           await prisma.job.update({
             where: { id: targetId },
             data: { applicantsCount: { increment: 1 }, views: { increment: 1 }, lastActive: new Date() }
           });

           // Check for Match (Candidate swiped Job)
           // Did Recruiter swipe this Candidate?
           const job = await prisma.job.findUnique({ where: { id: targetId }, select: { recruiterId: true } });
           if (job) {
             const recruiterSwipe = await prisma.swipe.findFirst({
               where: {
                 swiperId: job.recruiterId,
                 candidateId: swiperId,
                 direction: { in: ['right', 'up'] }
               }
             });

             if (recruiterSwipe) {
                // Match!
                await prisma.notification.create({
                  data: {
                    userId: swiperId,
                    type: 'match',
                    title: 'New Match!',
                    body: 'A recruiter you liked has also liked you.',
                    data: JSON.stringify({ jobId: targetId })
                  }
                });

                await prisma.notification.create({
                  data: {
                    userId: job.recruiterId,
                    type: 'match',
                    title: 'New Match!',
                    body: 'A candidate has liked your job!',
                    data: JSON.stringify({ candidateId: swiperId, jobId: targetId })
                  }
                });
             }
           }

        } else {
           await prisma.job.update({
             where: { id: targetId },
             data: { views: { increment: 1 } }
           });
        }
      }

      await prisma.swipe.create({ data });
      
      // Update Swiper's lastActive
      await prisma.user.update({
        where: { id: swiperId },
        data: { lastActive: new Date() }
      });

      return { ok: true }; 
    },

    apply: async (_, { jobId, candidateId, message }, { prisma }) => {
      const candidate = await prisma.user.findUnique({ where: { id: candidateId } });
      if (!candidate) throw new Error('Candidate not found');
      if (candidate.role !== 'candidate') throw new Error('Only candidates can apply');

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) throw new Error('Job not found');

      await checkQuota(candidate, 'superlike', prisma);

      const safeMessage = typeof message === 'string' && message.trim().length
        ? message.trim().slice(0, 2000)
        : null;

      await prisma.application.create({
        data: {
          jobId,
          candidateId,
          message: safeMessage,
          resumeUrl: candidate.resumeUrl || null,
          status: 'pending'
        }
      });

      // Increment superlike count
      await prisma.user.update({ where: { id: candidateId }, data: { superLikeCount: { increment: 1 } } });

      // Treat apply as a super swipe
      await prisma.swipe.create({
        data: { direction: 'up', swiperId: candidateId, jobId: jobId }
      });

      await prisma.job.update({
        where: { id: jobId },
        data: { applicantsCount: { increment: 1 }, views: { increment: 1 }, lastActive: new Date() }
      });

      if (job) {
        await prisma.notification.create({
          data: {
            userId: job.recruiterId,
            type: 'superlike',
            title: 'New Application',
            body: `${candidate.name || 'Someone'} applied for ${job.title}`,
            data: JSON.stringify({ candidateId, jobId })
          }
        });
      }

      return true;
    },

    markNotificationRead: async (_, { id }, { prisma }) => {
      await prisma.notification.update({ where: { id }, data: { read: true } });
      return true;
    },

    markAllNotificationsRead: async (_, { userId }, { prisma }) => {
      await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
      return true;
    },

    upgradePlan: async (_, { userId, plan }, { prisma }) => {
      const isBoosted = ['pro', 'enterprise'].includes(plan);
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: { plan, boosted: isBoosted }
      });

      if (user.role === 'recruiter') {
          await prisma.job.updateMany({
              where: { recruiterId: userId },
              data: { boosted: isBoosted }
          });
      }

      return user;
    },

    updateApplicationStatus: async (_, { id, status, feedback }, { prisma }) => {
      const oldApp = await prisma.application.findUnique({ where: { id } });
      if (!oldApp) throw new Error('Application not found');

      const updatedApp = await prisma.application.update({
        where: { id },
        data: { status, feedback }
      });

      await prisma.applicationLog.create({
        data: {
          applicationId: id,
          action: 'status_update',
          oldStatus: oldApp.status,
          newStatus: status,
          note: feedback
        }
      });

      // Notify Candidate of status change
      if (oldApp.status !== status) {
        let title = 'Application Update';
        let body = `Your application status has been updated to ${status}`;
        let type = 'application_update';
        
        if (status === 'accepted') {
            title = "It's a Match!";
            body = "Congratulations! Your application has been accepted.";
            type = 'match';
        }

        const job = await prisma.job.findUnique({ where: { id: oldApp.jobId }, select: { title: true } });
        if (job) {
             body = `Your application for ${job.title} is now ${status}`;
             if (status === 'accepted') {
                 body = `Congratulations! You matched for ${job.title}!`;
             }
        }

        await prisma.notification.create({
            data: {
                userId: oldApp.candidateId,
                type,
                title,
                body,
                data: JSON.stringify({ applicationId: id, jobId: oldApp.jobId, status })
            }
        });
      }

      return updatedApp;
    }
  }
};

module.exports = { resolvers };
