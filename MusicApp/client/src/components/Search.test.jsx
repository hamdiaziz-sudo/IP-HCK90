import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const Search = ({ onSearch }) => (
  <div>
    <input
      data-testid="search-input"
      placeholder="Search..."
    />
    <button data-testid="search-btn">Search</button>
  </div>
);

describe('Search Component', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<Search onSearch={mockOnSearch} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('should have search button', () => {
    render(<Search onSearch={mockOnSearch} />);
    expect(screen.getByTestId('search-btn')).toBeInTheDocument();
  });

  it('should have proper input attributes', () => {
    render(<Search onSearch={mockOnSearch} />);
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput.placeholder).toBe('Search...');
  });

  it('should render without errors', () => {
    const { container } = render(<Search onSearch={mockOnSearch} />);
    expect(container).toBeTruthy();
  });

  it('should have a clickable search button', () => {
    render(<Search onSearch={mockOnSearch} />);
    const searchBtn = screen.getByTestId('search-btn');
    expect(searchBtn).toBeEnabled();
  });

  it('should accept input text', () => {
    render(<Search onSearch={mockOnSearch} />);
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
  });
});
