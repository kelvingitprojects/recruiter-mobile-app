import { GRAPHQL_URL } from '../config/env';
import { GraphQLClient, gql } from 'graphql-request';
import { mockJobs, mockCandidates, getCandidateStack, getJobStack, recordSwipeLocal } from './api';

let client;
let authToken = null;
export const setAuthToken = (token) => {
  authToken = token || null;
  if (client) {
    if (authToken) client.setHeader('Authorization', `Bearer ${authToken}`);
    else client.setHeaders({});
  }
};

const ensureClient = () => {
  if (!client && GRAPHQL_URL) client = new GraphQLClient(GRAPHQL_URL, authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined);
  return client;
};

export const fetchJobsGql = async () => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const query = gql`
      query Jobs {
        jobs { id title salaryMax skills logoUrl applicantsCount }
      }
    `;
    const data = await c.request(query);
    return data.jobs || [];
  } catch (e) {
    console.log('Using mock jobs (network error)');
    return mockJobs;
  }
};

export const loginGql = async (email, password) => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const mutation = gql`
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user { id email name role plan boosted logoUrl coverUrl resumeUrl }
        }
      }
    `;
    const data = await c.request(mutation, { email, password });
    return data.login;
  } catch (e) {
    throw e;
  }
};

export const signupGql = async (email, password, name, role) => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const mutation = gql`
      mutation Signup($email: String!, $password: String!, $name: String, $role: String) {
        signup(email: $email, password: $password, name: $name, role: $role) {
          token
          user { id email name role plan boosted logoUrl coverUrl resumeUrl }
        }
      }
    `;
    const data = await c.request(mutation, { email, password, name, role });
    return data.signup;
  } catch (e) {
    throw e;
  }
};

export const requestPasswordResetGql = async (email) => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const mutation = gql`
      mutation RequestReset($email: String!) {
        requestPasswordReset(email: $email)
      }
    `;
    const data = await c.request(mutation, { email });
    return data.requestPasswordReset;
  } catch (e) {
    throw e;
  }
};

export const resetPasswordGql = async (token, password) => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const mutation = gql`
      mutation ResetPassword($token: String!, $password: String!) {
        resetPassword(token: $token, password: $password)
      }
    `;
    const data = await c.request(mutation, { token, password });
    return data.resetPassword;
  } catch (e) {
    throw e;
  }
};

export const fetchCandidatesGql = async () => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const query = gql`
      query Candidates {
        candidates { id title experience skills logoUrl }
      }
    `;
    const data = await c.request(query);
    return data.candidates || [];
  } catch (e) {
    console.log('Using mock candidates (network error)');
    return mockCandidates;
  }
};

export const recordSwipeGql = async (input) => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const mutation = gql`
      mutation Swipe($input: SwipeInput!) {
        swipe(input: $input) { ok }
      }
    `;
    const data = await c.request(mutation, { input });
    return data.swipe || { ok: true };
  } catch (e) {
    return recordSwipeLocal(input);
  }
};

export const fetchCandidateStackGql = async (recruiterId) => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const query = gql`
      query CandidateStack($id: ID!) {
        candidateStack(recruiterId: $id) { id name title experience skills logoUrl matchScore }
      }
    `;
    const data = await c.request(query, { id: recruiterId });
    return data.candidateStack || [];
  } catch (e) {
    console.log('Using mock candidate stack (network error)');
    return getCandidateStack({ recruiterCity: undefined, preferredSkills: [] }, mockCandidates);
  }
};

export const fetchJobStackGql = async (candidateId) => {
  const c = ensureClient();
  try {
    if (!c) throw new Error('No client');
    const query = gql`
      query JobStack($id: ID!) {
        jobStack(candidateId: $id) { id title company skills logoUrl matchScore applicantsCount }
      }
    `;
    const data = await c.request(query, { id: candidateId });
    return data.jobStack || [];
  } catch (e) {
    console.log('Using mock job stack (network error)');
    return getJobStack({ candidateCity: undefined, skills: [] }, mockJobs);
  }
};

export const fetchApplicationsGql = async (recruiterId, skip, take) => {
  const c = ensureClient();
  const query = gql`
    query MyApplications($id: ID!, $skip: Int, $take: Int) {
      myApplications(recruiterId: $id, skip: $skip, take: $take) {
        id
        status
        createdAt
        message
        feedback
        resumeUrl
        job { id title company }
        candidate { id name email title skills logoUrl }
        logs {
          action
          oldStatus
          newStatus
          note
          createdAt
        }
      }
    }
  `;
  const data = await c.request(query, { id: recruiterId, skip, take });
  return data.myApplications;
};

export const fetchCandidateApplicationsGql = async (candidateId) => {
  const c = ensureClient();
  const query = gql`
    query MyCandidateApplications($id: ID!) {
      myCandidateApplications(candidateId: $id) {
        id
        status
        createdAt
        message
        feedback
        job { id title company logoUrl location }
      }
    }
  `;
  const data = await c.request(query, { id: candidateId });
  return data.myCandidateApplications || [];
};

export const fetchNotificationsGql = async (userId) => {
  const c = ensureClient();
  const query = gql`
    query MyNotifications($id: ID!) {
      myNotifications(userId: $id) {
        id
        type
        title
        body
        read
        createdAt
        data
      }
    }
  `;
  const data = await c.request(query, { id: userId });
  return data.myNotifications || [];
};

export const markNotificationReadGql = async (id) => {
  const c = ensureClient();
  const mutation = gql`
    mutation MarkRead($id: ID!) {
      markNotificationRead(id: $id)
    }
  `;
  await c.request(mutation, { id });
  return true;
};

export const upgradePlanGql = async (userId, plan) => {
  const c = ensureClient();
  const mutation = gql`
    mutation UpgradePlan($userId: ID!, $plan: String!) {
      upgradePlan(userId: $userId, plan: $plan) {
        id
        plan
        swipeCount
        superLikeCount
        boosted
      }
    }
  `;
  const data = await c.request(mutation, { userId, plan });
  return data.upgradePlan;
};

export const updateApplicationStatusGql = async (id, status, feedback) => {
  const c = ensureClient();
  const mutation = gql`
    mutation UpdateApplication($id: ID!, $status: String!, $feedback: String) {
      updateApplicationStatus(id: $id, status: $status, feedback: $feedback) {
        id status
      }
    }
  `;
  const data = await c.request(mutation, { id, status, feedback });
  return data.updateApplicationStatus;
};

export const fetchMyJobsGql = async (recruiterId) => {
  const c = ensureClient();
  if (!c) return [];
  const query = gql`
    query MyJobs($id: ID!) {
      myJobs(recruiterId: $id) { id title company location salaryMax skills urgencyLevel boosted postedAt }
    }
  `;
  const data = await c.request(query, { id: recruiterId });
  return data.myJobs || [];
};

export const createJobGql = async (recruiterId, input) => {
  const c = ensureClient();
  if (!c) return { id: 'temp', ...input };
  const mutation = gql`
    mutation CreateJob($id: ID!, $input: JobInput!) {
      createJob(recruiterId: $id, input: $input) { id title }
    }
  `;
  const data = await c.request(mutation, { id: recruiterId, input });
  return data.createJob;
};

export const fetchMeGql = async (id) => {
  const c = ensureClient();
  const query = gql`
    query Me($id: ID!) {
      me(id: $id) {
        id
        name
        email
        plan
        swipeCount
        superLikeCount
        company
        logoUrl
        boosted
      }
    }
  `;
  const data = await c.request(query, { id });
  return data.me;
};

export const applyToJobGql = async (jobId, candidateId, message) => {
  const c = ensureClient();
  if (!c) return true; // mock success
  const mutation = gql`
    mutation Apply($jobId: ID!, $candidateId: ID!, $message: String) {
      apply(jobId: $jobId, candidateId: $candidateId, message: $message)
    }
  `;
  const data = await c.request(mutation, { jobId, candidateId, message });
  return data.apply;
};

export const updateJobGql = async (id, input) => {
  const c = ensureClient();
  if (!c) return { id, ...input };
  const mutation = gql`
    mutation UpdateJob($id: ID!, $input: JobInput!) {
      updateJob(id: $id, input: $input) { id title }
    }
  `;
  const data = await c.request(mutation, { id, input });
  return data.updateJob;
};

export const updateProfileGql = async (id, input) => {
  const c = ensureClient();
  if (!c) return { id, ...input };
  const mutation = gql`
    mutation UpdateProfile($id: ID!, $input: ProfileInput!) {
      updateProfile(id: $id, input: $input) {
        id
        name
        email
        role
        company
        title
        bio
        skills
        logoUrl
        coverUrl
        resumeUrl
        employmentStatus
        hourlyRate
        boosted
      }
    }
  `;
  const data = await c.request(mutation, { id, input });
  return data.updateProfile;
};
