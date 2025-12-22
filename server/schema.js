const { buildSchema } = require('graphql');

const schema = `
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    location: String
    bio: String
    logoUrl: String
    coverUrl: String
    resumeUrl: String
    createdAt: String
    lastActive: String
    title: String
    experience: Int
    skills: [String]
    employmentStatus: String
    hourlyRate: Float
    company: String
    industry: String
    matchScore: Float
    boosted: Boolean
    plan: String
    swipeCount: Int
    superLikeCount: Int
    notifications: [Notification]
  }

  type Notification {
    id: ID!
    type: String
    title: String
    body: String
    data: String
    read: Boolean
    createdAt: String
  }

  type Job {
    id: ID!
    title: String
    company: String
    location: String
    salaryMax: Int
    skills: [String]
    logoUrl: String
    urgencyLevel: Int
    boosted: Boolean
    postedAt: String
    matchScore: Float
    description: String
    applicantsCount: Int
  }

  type ApplicationLog {
    id: ID!
    action: String
    oldStatus: String
    newStatus: String
    note: String
    createdAt: String
  }

  type Application {
    id: ID!
    job: Job
    candidate: User
    message: String
    status: String
    feedback: String
    resumeUrl: String
    createdAt: String
    updatedAt: String
    logs: [ApplicationLog]
  }

  type Conversation {
    id: ID!
    userAId: ID!
    userBId: ID!
    createdAt: String
    participants: [User]
    lastMessage: Message
  }

  type Message {
    id: ID!
    conversationId: ID!
    senderId: ID!
    text: String!
    createdAt: String
    readAt: String
    sender: User
  }

  input SwipeInput {
    direction: String!
    targetId: ID!
    targetType: String!
    swiperId: ID!
  }

  type SwipeResponse {
    ok: Boolean!
  }

  input JobInput {
    title: String!
    company: String!
    location: String!
    salaryMax: Int
    skills: [String]
    urgencyLevel: Int
    boosted: Boolean
  }

  input ProfileInput {
    name: String
    email: String
    title: String
    skills: [String]
    company: String
    cultureTags: [String]
    bio: String
    location: String
    hourlyRate: Float
    logoUrl: String
    coverUrl: String
    resumeUrl: String
    employmentStatus: String
  }

  type Query {
    jobs: [Job]
    candidates: [User]
    candidateStack(recruiterId: ID!): [User]
    jobStack(candidateId: ID!): [Job]
    me(id: ID!): User
    myJobs(recruiterId: ID!): [Job]
    myApplications(recruiterId: ID!, skip: Int, take: Int): [Application]
    myCandidateApplications(candidateId: ID!): [Application]
    myNotifications(userId: ID!): [Notification]
    myConversations(userId: ID!): [Conversation]
    conversationMessages(conversationId: ID!, skip: Int, take: Int): [Message]
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload
    signup(email: String!, password: String!, name: String, role: String): AuthPayload
    requestPasswordReset(email: String!): Boolean
    resetPassword(token: String!, password: String!): Boolean
    swipe(input: SwipeInput!): SwipeResponse
    createJob(recruiterId: ID!, input: JobInput!): Job
    updateJob(id: ID!, input: JobInput!): Job
    updateProfile(id: ID!, input: ProfileInput!): User
    apply(jobId: ID!, candidateId: ID!, message: String): Boolean
    updateApplicationStatus(id: ID!, status: String!, feedback: String): Application
    markNotificationRead(id: ID!): Boolean
    markAllNotificationsRead(userId: ID!): Boolean
    upgradePlan(userId: ID!, plan: String!): User
    startConversation(withUserId: ID!): Conversation
    sendMessage(conversationId: ID!, text: String!): Message
    markConversationRead(conversationId: ID!): Boolean
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

module.exports = { schema };
