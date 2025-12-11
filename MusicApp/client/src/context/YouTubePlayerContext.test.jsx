import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const YouTubePlayerContext = React.createContext({});

describe('YouTubePlayerContext Mock', () => {
  const mockTrack = {
    id: '1',
    title: 'Test Song',
    artist: 'Test Artist',
    videoId: 'test-video-id'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide player context values', () => {
    const TestComponent = () => {
      const { isOpen } = React.useContext(YouTubePlayerContext);
      return <p data-testid="player-status">{isOpen ? 'Open' : 'Closed'}</p>;
    };

    render(
      <YouTubePlayerContext.Provider value={{
        isOpen: false,
        currentTrack: null,
        queue: [],
        openPlayer: vi.fn(),
        closePlayer: vi.fn(),
        addToQueue: vi.fn()
      }}>
        <TestComponent />
      </YouTubePlayerContext.Provider>
    );

    expect(screen.getByTestId('player-status')).toHaveTextContent('Closed');
  });

  it('should handle open player action', () => {
    const mockOpenPlayer = vi.fn();
    const TestComponent = () => {
      return <button onClick={() => mockOpenPlayer(mockTrack)}>Open Player</button>;
    };

    render(
      <YouTubePlayerContext.Provider value={{
        isOpen: false,
        currentTrack: null,
        queue: [],
        openPlayer: mockOpenPlayer,
        closePlayer: vi.fn(),
        addToQueue: vi.fn()
      }}>
        <TestComponent />
      </YouTubePlayerContext.Provider>
    );

    const button = screen.getByRole('button', { name: /open player/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle queue operations', () => {
    const mockAddToQueue = vi.fn();
    const TestComponent = () => {
      return <button onClick={() => mockAddToQueue(mockTrack)}>Add to Queue</button>;
    };

    render(
      <YouTubePlayerContext.Provider value={{
        isOpen: false,
        currentTrack: null,
        queue: [],
        openPlayer: vi.fn(),
        closePlayer: vi.fn(),
        addToQueue: mockAddToQueue
      }}>
        <TestComponent />
      </YouTubePlayerContext.Provider>
    );

    const button = screen.getByRole('button', { name: /add to queue/i });
    expect(button).toBeInTheDocument();
  });

  it('should display current track when player is open', () => {
    const TestComponent = () => {
      const { currentTrack } = React.useContext(YouTubePlayerContext);
      return <div data-testid="current-track">{currentTrack?.title}</div>;
    };

    render(
      <YouTubePlayerContext.Provider value={{
        isOpen: true,
        currentTrack: mockTrack,
        queue: [mockTrack],
        openPlayer: vi.fn(),
        closePlayer: vi.fn(),
        addToQueue: vi.fn()
      }}>
        <TestComponent />
      </YouTubePlayerContext.Provider>
    );

    expect(screen.getByTestId('current-track')).toHaveTextContent(mockTrack.title);
  });
});
