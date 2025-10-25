import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Profile from '@/app/dashboard/profile/page';
import { useUser } from '@auth0/nextjs-auth0';

// Mock fetch globally
global.fetch = jest.fn();

jest.mock('@auth0/nextjs-auth0');

describe('Auth Profile Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  it('shows loading state initially', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoading: true, user: null });
    render(<Profile />);

    // The component shows skeleton loading elements instead of "Loading" text
    // Check for skeleton loading elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Check that the main container is rendered by looking for the space-y-6 class
    const container = document.querySelector('.space-y-6');
    expect(container).toBeInTheDocument();
  });

  it('shows user email when authenticated', async () => {
    const mockUserData = {
      user: {
        id: 'user123',
        email: 'user@example.com',
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg',
        subscription: {
          status: 'ACTIVE',
          plan: 'CORE',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          stripeCustomerId: 'cus_123'
        },
        recentUsage: []
      }
    };

    (useUser as jest.Mock).mockReturnValue({
      isLoading: false,
      user: { email: 'user@example.com', name: 'John Doe', picture: 'https://example.com/avatar.jpg' },
    });

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    render(<Profile />);

    // Wait for the component to load user data
    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });

  it('shows error message when user data fails to load', async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoading: false,
      user: { email: 'user@example.com', name: 'John Doe', picture: 'https://example.com/avatar.jpg' }
    });

    // Mock fetch to simulate a failed request
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<Profile />);

    // Wait for the component to finish loading and show error message
    await waitFor(() => {
      expect(screen.getByText('Unable to load profile data')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
