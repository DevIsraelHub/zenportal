import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

// Test 1: Simple Button Component Test
describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders button with different variants', () => {
    render(<Button variant="outline">Outline Button</Button>);
    expect(screen.getByText('Outline Button')).toBeInTheDocument();
  });
});
