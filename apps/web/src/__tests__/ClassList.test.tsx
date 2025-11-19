import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ClassesPage from '../app/classes/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    getClasses: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

describe('ClassList Component', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockNavigate,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as any);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays classes successfully', async () => {
    const { api } = await import('@/lib/api');
    const mockClasses = [
      { id: '1', name: 'Algebra I', studentCount: 25, assignmentCount: 5 },
      { id: '2', name: 'Geometry', studentCount: 22, assignmentCount: 3 },
      { id: '3', name: 'Calculus', studentCount: 28, assignmentCount: 7 },
    ];
    
    vi.mocked(api.getClasses).mockResolvedValue(mockClasses);

    render(<ClassesPage />);

    await waitFor(() => {
      expect(screen.getByText('Algebra I')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();
      expect(screen.getByText('Calculus')).toBeInTheDocument();
      expect(screen.getByText('25 students')).toBeInTheDocument();
      expect(screen.getByText('22 students')).toBeInTheDocument();
      expect(screen.getByText('28 students')).toBeInTheDocument();
      expect(screen.getByText('5 assignments')).toBeInTheDocument();
      expect(screen.getByText('3 assignments')).toBeInTheDocument();
      expect(screen.getByText('7 assignments')).toBeInTheDocument();
    });
  });
});

