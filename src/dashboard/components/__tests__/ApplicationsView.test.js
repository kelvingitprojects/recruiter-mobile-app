import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ApplicationsView from '../ApplicationsView';
import * as api from '../../../services/api';
import Toast from 'react-native-toast-message';
import { Linking } from 'react-native';

// Mock the API module
jest.mock('../../../services/api');

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock WebView
jest.mock('react-native-webview', () => ({
  WebView: () => null
}));

// Mock Linking
// We need to mock the native module or the method directly if possible
// For jest-expo, Linking is usually available. We can spy on it if we don't mock the whole module.
// However, to ensure we control it, let's try to mock the specific calls.

const mockProfile = { id: 'r1', companyName: 'Tech Corp' };

const mockApps = [
  {
    id: 'a1',
    status: 'pending',
    createdAt: new Date().toISOString(),
    message: 'Hello',
    job: { id: 'j1', title: 'Dev' },
    candidate: { id: 'c1', name: 'John Doe' },
    resumeUrl: 'https://example.com/resume.pdf',
    logs: [
      {
        id: 'l1',
        action: 'status_update',
        oldStatus: 'pending',
        newStatus: 'reviewed',
        note: 'Good candidate',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'a2',
    status: 'accepted',
    createdAt: new Date().toISOString(),
    message: 'Hi',
    job: { id: 'j1', title: 'Dev' },
    candidate: { id: 'c2', name: 'Jane Doe' }
  }
];

describe('ApplicationsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.fetchApplications.mockResolvedValue(mockApps);
    // Setup Linking spy
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly and loads applications', async () => {
    const { getByText } = render(<ApplicationsView profile={mockProfile} />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Doe')).toBeTruthy();
    }, { timeout: 10000 }); // Increase timeout

    expect(getByText('Candidate / Job')).toBeTruthy();
  });

  it('filters applications', async () => {
    const { getByText, queryByText } = render(<ApplicationsView profile={mockProfile} />);

    await waitFor(() => expect(getByText('John Doe')).toBeTruthy());

    fireEvent.press(getByText('Accepted'));

    expect(getByText('Jane Doe')).toBeTruthy();
    expect(queryByText('John Doe')).toBeNull();
  });

  it('opens modal on row click', async () => {
    const { getByText } = render(<ApplicationsView profile={mockProfile} />);

    await waitFor(() => expect(getByText('John Doe')).toBeTruthy());

    fireEvent.press(getByText('John Doe'));

    expect(getByText('Application Details')).toBeTruthy();
    expect(getByText('Hello')).toBeTruthy(); // Cover note
    expect(getByText('History')).toBeTruthy();
    expect(getByText(/status update/)).toBeTruthy();
  });

  it('handles resume preview', async () => {
    const { getByText } = render(<ApplicationsView profile={mockProfile} />);
    
    await waitFor(() => expect(getByText('John Doe')).toBeTruthy());
    fireEvent.press(getByText('John Doe'));
    
    const resumeBtn = getByText('View Attached Resume');
    fireEvent.press(resumeBtn);
    
    await waitFor(() => {
      expect(getByText('Resume Preview')).toBeTruthy();
    });
  });

  it('handles status update with toast', async () => {
    api.updateApplicationStatus.mockResolvedValue({ success: true });
    const { getByText } = render(<ApplicationsView profile={mockProfile} />);

    await waitFor(() => expect(getByText('John Doe')).toBeTruthy());
    fireEvent.press(getByText('John Doe'));

    const rejectBtn = getByText('Reject');
    fireEvent.press(rejectBtn);

    await waitFor(() => {
      expect(api.updateApplicationStatus).toHaveBeenCalledWith('a1', 'rejected', '');
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'success',
        text2: 'Application rejected'
      }));
    });
  });
});


