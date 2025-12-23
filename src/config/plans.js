import colors from '../theme/colors';

export const PLANS = {
  candidate: [
    {
      id: 'free',
      name: 'Free',
      price: 'R0',
      period: '/month',
      features: [
        '50 Swipes per day',
        '1 Super Like per day',
        'Basic Profile Visibility',
        'Who liked you: Locked 🔒'
      ],
      color: colors.muted
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R99',
      period: '/month',
      features: [
        'Unlimited Swipes',
        '5 Super Likes per day',
        'Profile Boost (2x Visibility)',
        'See who liked you ✅'
      ],
      color: colors.primary,
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R399',
      period: '/month',
      features: [
        'Unlimited Swipes',
        'Unlimited Super Likes',
        'Profile Boost (10x Visibility)',
        'Priority Message with Like'
      ],
      color: '#8b5cf6'
    }
  ],
  recruiter: [
    {
      id: 'free',
      name: 'Free',
      price: 'R0',
      period: '/month',
      features: [
        '1 Active Job Post',
        '50 Candidate Swipes per day',
        'Standard Job Visibility',
        'See interested candidates: Locked 🔒'
      ],
      color: colors.muted
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R99',
      period: '/month',
      features: [
        '3 Active Job Posts',
        'Unlimited Swipes',
        '5 Super Likes per day',
        'Boosted Jobs (2x Visibility)',
        'See interested candidates ✅'
      ],
      color: colors.primary,
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R399',
      period: '/month',
      features: [
        'Unlimited Job Posts',
        'Unlimited Swipes',
        'Unlimited Super Likes',
        'Featured Jobs (10x Visibility)',
        'Advanced Filtering'
      ],
      color: '#8b5cf6'
    }
  ]
};

export const PLAN_LIMITS = {
  recruiter: {
    free: { jobs: 1, boost: false, viewCandidates: false },
    pro: { jobs: 3, boost: true, viewCandidates: true },
    enterprise: { jobs: 9999, boost: true, viewCandidates: true }
  },
  candidate: {
    free: { swipes: 50, superLikes: 1 },
    pro: { swipes: 9999, superLikes: 5 },
    enterprise: { swipes: 9999, superLikes: 9999 }
  }
};
