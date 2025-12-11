import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const Favorites = ({ favorites = [] }) => (
  <div>
    <h1>Favorites</h1>
    {favorites.length === 0 ? (
      <p>No favorites yet</p>
    ) : (
      <ul>
        {favorites.map(favorite => (
          <li key={favorite.id} data-testid={`favorite-${favorite.id}`}>
            {favorite.title}
          </li>
        ))}
      </ul>
    )}
  </div>
);

describe('Favorites Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render favorites heading', () => {
    render(<Favorites />);
    expect(screen.getByRole('heading', { name: /favorites/i })).toBeInTheDocument();
  });

  it('should show message when no favorites', () => {
    render(<Favorites favorites={[]} />);
    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
  });

  it('should display favorite songs', () => {
    const mockFavorites = [
      { id: 1, title: 'Song 1' },
      { id: 2, title: 'Song 2' },
      { id: 3, title: 'Song 3' }
    ];

    render(<Favorites favorites={mockFavorites} />);

    expect(screen.getByTestId('favorite-1')).toHaveTextContent('Song 1');
    expect(screen.getByTestId('favorite-2')).toHaveTextContent('Song 2');
    expect(screen.getByTestId('favorite-3')).toHaveTextContent('Song 3');
  });

  it('should render correct number of favorite items', () => {
    const mockFavorites = [
      { id: 1, title: 'Song 1' },
      { id: 2, title: 'Song 2' }
    ];

    render(<Favorites favorites={mockFavorites} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });

  it('should handle empty favorites gracefully', () => {
    const { container } = render(<Favorites favorites={[]} />);
    expect(container.querySelector('p')).toHaveTextContent('No favorites yet');
  });
});
