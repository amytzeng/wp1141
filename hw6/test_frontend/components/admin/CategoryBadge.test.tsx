// Tests for CategoryBadge component
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryBadge from '@/components/admin/CategoryBadge';

describe('CategoryBadge', () => {
  it('should render main category name', () => {
    render(<CategoryBadge mainCategory="humanities" />);
    expect(screen.getByText('文史哲')).toBeInTheDocument();
  });

  it('should render subcategory name when provided', () => {
    render(<CategoryBadge mainCategory="humanities" subCategory="chinese_literature" />);
    expect(screen.getByText('中國文學')).toBeInTheDocument();
  });

  it('should render count when provided', () => {
    render(<CategoryBadge mainCategory="business" count={5} />);
    expect(screen.getByText('商管經濟 (5)')).toBeInTheDocument();
  });

  it('should render main category and count together', () => {
    render(<CategoryBadge mainCategory="stem" count={10} />);
    expect(screen.getByText('數理科學 (10)')).toBeInTheDocument();
  });

  it('should render subcategory and count together', () => {
    render(
      <CategoryBadge
        mainCategory="business"
        subCategory="economics"
        count={3}
      />
    );
    expect(screen.getByText('經濟學 (3)')).toBeInTheDocument();
  });

  it('should handle all main categories', () => {
    const { rerender } = render(<CategoryBadge mainCategory="humanities" />);
    expect(screen.getByText('文史哲')).toBeInTheDocument();

    rerender(<CategoryBadge mainCategory="business" />);
    expect(screen.getByText('商管經濟')).toBeInTheDocument();

    rerender(<CategoryBadge mainCategory="stem" />);
    expect(screen.getByText('數理科學')).toBeInTheDocument();

    rerender(<CategoryBadge mainCategory="life_sciences" />);
    expect(screen.getByText('生物醫學')).toBeInTheDocument();

    rerender(<CategoryBadge mainCategory="others" />);
    expect(screen.getByText('其他')).toBeInTheDocument();
  });

  it('should handle unknown category gracefully', () => {
    render(<CategoryBadge mainCategory="unknown_category" />);
    expect(screen.getByText('unknown_category')).toBeInTheDocument();
  });

  it('should not display count when undefined', () => {
    render(<CategoryBadge mainCategory="humanities" />);
    expect(screen.getByText('文史哲')).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });
});

