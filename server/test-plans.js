
const { resolvers } = require('./resolvers');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Plan & Quota Tests...');

  // 1. Create a test recruiter
  const email = `test-recruiter-${Date.now()}@example.com`;
  const recruiter = await prisma.user.create({
    data: {
      name: 'Test Recruiter',
      email,
      password: 'hashedpassword',
      role: 'recruiter',
      plan: 'free' // Start with free
    }
  });
  console.log(`Created test recruiter: ${recruiter.email} (${recruiter.id})`);

  const context = { prisma, userId: recruiter.id };

  try {
    // 2. Create 1st Job (Should succeed)
    console.log('Attempting to create 1st job...');
    await resolvers.Mutation.createJob(null, {
      recruiterId: recruiter.id,
      input: {
        title: 'Job 1',
        company: 'Test Co',
        location: 'Johannesburg',
        salaryMax: 300000,
        description: 'Test Description',
        skills: ["Node.js"]
      }
    }, context);
    console.log('✅ 1st Job created successfully.');

    // 3. Create 2nd Job (Should fail on FREE plan)
    console.log('Attempting to create 2nd job (Should fail)...');
    try {
      await resolvers.Mutation.createJob(null, {
        recruiterId: recruiter.id,
        input: {
          title: 'Job 2',
          company: 'Test Co',
          location: 'Johannesburg',
          salaryMax: 300000,
          description: 'Test Description',
          skills: ["React"]
        }
      }, context);
      console.error('❌ 2nd Job created but should have failed!');
    } catch (e) {
      console.log(`✅ Expected error: ${e.message}`);
      if (!e.message.includes('limit reached')) {
        console.warn('⚠️ Warning: Error message might not be about limits.');
      }
    }

    // 4. Upgrade to PRO
    console.log('Upgrading to PRO plan...');
    await resolvers.Mutation.upgradePlan(null, { userId: recruiter.id, plan: 'pro' }, context);
    console.log('✅ Upgraded to PRO.');

    // 5. Create 2nd Job (Should succeed on PRO)
    console.log('Attempting to create 2nd job again (Should succeed)...');
    await resolvers.Mutation.createJob(null, {
      recruiterId: recruiter.id,
      input: {
        title: 'Job 2',
        company: 'Test Co',
        location: 'Johannesburg',
        salaryMax: 300000,
        description: 'Test Description',
        skills: ["React"]
      }
    }, context);
    console.log('✅ 2nd Job created successfully.');

    // 6. Create 3rd Job (Should succeed on PRO - Limit is 3)
    console.log('Attempting to create 3rd job...');
    await resolvers.Mutation.createJob(null, {
      recruiterId: recruiter.id,
      input: {
        title: 'Job 3',
        company: 'Test Co',
        location: 'Johannesburg',
        salaryMax: 300000,
        description: 'Test Description',
        skills: ["Vue"]
      }
    }, context);
    console.log('✅ 3rd Job created successfully.');

    // 7. Create 4th Job (Should fail on PRO)
    console.log('Attempting to create 4th job (Should fail)...');
    try {
      await resolvers.Mutation.createJob(null, {
        recruiterId: recruiter.id,
        input: {
          title: 'Job 4',
          company: 'Test Co',
          location: 'Johannesburg',
          salaryMax: 300000,
          description: 'Test Description',
          skills: ["Angular"]
        }
      }, context);
      console.error('❌ 4th Job created but should have failed!');
    } catch (e) {
      console.log(`✅ Expected error: ${e.message}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    // Cleanup
    console.log('Cleaning up...');
    await prisma.job.deleteMany({ where: { recruiterId: recruiter.id } });
    await prisma.user.delete({ where: { id: recruiter.id } });
    await prisma.$disconnect();
  }
}

main();
