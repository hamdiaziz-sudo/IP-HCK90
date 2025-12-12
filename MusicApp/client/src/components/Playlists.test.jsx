import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const Playlists = ({ playlists = [], onCreatePlaylist }) => (
  <div>
    <h1>Playlists</h1>
    <button data-testid="create-btn" onClick={onCreatePlaylist}>Create Playlist</button>
    {playlists.length === 0 ? (
      <p>No playlists</p>
    ) : (
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id} data-testid={`playlist-${playlist.id}`}>
            {playlist.name} - {playlist.songCount} songs
          </li>
        ))}
      </ul>
    )}
  </div>
);

describe('Playlists Component', () => {
  const mockOnCreatePlaylist = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render playlists heading', () => {
    render(<Playlists onCreatePlaylist={mockOnCreatePlaylist} />);
    expect(screen.getByRole('heading', { name: /playlists/i })).toBeInTheDocument();
  });

  it('should have create playlist button', () => {
    render(<Playlists onCreatePlaylist={mockOnCreatePlaylist} />);
    expect(screen.getByTestId('create-btn')).toBeInTheDocument();
  });

  it('should show message when no playlists', () => {
    render(<Playlists playlists={[]} onCreatePlaylist={mockOnCreatePlaylist} />);
    expect(screen.getByText('No playlists')).toBeInTheDocument();
  });

  it('should display playlists list', () => {
    const mockPlaylists = [
      { id: 1, name: 'Rock', songCount: 10 },
      { id: 2, name: 'Jazz', songCount: 8 },
      { id: 3, name: 'Pop', songCount: 15 }
    ];

    render(<Playlists playlists={mockPlaylists} onCreatePlaylist={mockOnCreatePlaylist} />);

    expect(screen.getByTestId('playlist-1')).toHaveTextContent('Rock');
    expect(screen.getByTestId('playlist-2')).toHaveTextContent('Jazz');
    expect(screen.getByTestId('playlist-3')).toHaveTextContent('Pop');
  });

  it('should display song count in playlist items', () => {
    const mockPlaylists = [
      { id: 1, name: 'Favorites', songCount: 25 }
    ];

    render(<Playlists playlists={mockPlaylists} onCreatePlaylist={mockOnCreatePlaylist} />);

    expect(screen.getByTestId('playlist-1')).toHaveTextContent('25 songs');
  });

  it('should handle create playlist button click', () => {
    const onCreatePlaylist = vi.fn();
    render(<Playlists onCreatePlaylist={onCreatePlaylist} />);

    const createBtn = screen.getByTestId('create-btn');
    createBtn.click();

    expect(onCreatePlaylist).toHaveBeenCalled();
  });
});
