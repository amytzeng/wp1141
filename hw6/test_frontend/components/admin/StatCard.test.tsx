// Tests for StatCard component
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '@/components/admin/StatCard';

describe('StatCard', () => {
  it('should render label and number value', () => {
    render(<StatCard label="Total Messages" value={1234} />);
    expect(screen.getByText('Total Messages')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should render string value', () => {
    render(<StatCard label="Status" value="Active" />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should format number with thousand separator', () => {
    render(<StatCard label="Total Users" value={1234567} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('should render change indicator when provided', () => {
    render(<StatCard label="Growth" value={100} change="+10%" />);
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  it('should not render change when not provided', () => {
    render(<StatCard label="Total" value={50} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/-/)).not.toBeInTheDocument();
  });

  it('should handle zero value', () => {
    render(<StatCard label="Count" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle negative numbers', () => {
    render(<StatCard label="Change" value={-100} />);
    expect(screen.getByText('-100')).toBeInTheDocument();
  });

  it('should handle decimal numbers', () => {
    render(<StatCard label="Average" value={1234.56} />);
    expect(screen.getByText('1,234.56')).toBeInTheDocument();
  });
});

