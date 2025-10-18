import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '@/app/dashboard/profile/page';
import { useUser } from '@auth0/nextjs-auth0';

jest.mock('@auth0/nextjs-auth0');

describe('Auth Profile Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoading: true, user: null });
    render(<Profile />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('shows user email when authenticated', () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoading: false,
      user: { email: 'user@example.com', name: 'John Doe' },
    });
    render(<Profile />);
    expect(screen.getAllByText(/user@example.com/i).length).toBeGreaterThan(0);
  });

  it('renders nothing when unauthenticated', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoading: false, user: null });
    const { container } = render(<Profile />);
    expect(container).toBeEmptyDOMElement();
  });
});
