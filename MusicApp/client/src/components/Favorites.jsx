import { useState, useEffect } from 'react';
import { favoriteAPI, playlistAPI } from '../api/endpoints';
import { useYouTubePlayer } from '../context/YouTubePlayerContext';

export const Favorites = () => {
  const { playTrack } = useYouTubePlayer();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmSongId, setConfirmSongId] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsWithSongs, setPlaylistsWithSongs] = useState(new Map());

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 3000);
  };

  useEffect(() => {
    fetchFavorites();
    fetchPlaylists();
  }, []);

  // Listen for favorite updates and refetch
  useEffect(() => {
    const handleFavoriteUpdate = async () => {
      console.log('📢 Favorite updated event received in Favorites, refetching...');
      try {
        const response = await favoriteAPI.getAll();
        setFavorites(response.data.data || []);
        console.log('✅ Favorites refreshed in Favorites component');
      } catch (err) {
        console.error('❌ Failed to refetch favorites:', err);
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getAll();
      const playlistsList = response.data.data || [];
      setPlaylists(playlistsList);

      // Check which playlists contain each favorite song
      const playlistMap = new Map();
      for (const playlist of playlistsList) {
        const songs = playlist.Songs || [];
        for (const song of songs) {
          if (!playlistMap.has(song.id)) {
            playlistMap.set(song.id, []);
          }
          playlistMap.get(song.id).push(playlist.id);
        }
      }
      setPlaylistsWithSongs(playlistMap);
    } catch (err) {
      console.error('Failed to load playlists:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteAPI.getAll();
      setFavorites(response.data.data || []);
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (songId) => {
    setConfirmSongId(songId);
    setShowConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!confirmSongId) return;
    try {
      await favoriteAPI.remove(confirmSongId);
      showToast('Removed from favorites!', 'success');
      setShowConfirm(false);
      setConfirmSongId(null);
      await fetchFavorites();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to remove favorite';
      showToast(errorMsg, 'error');
      console.error(err);
    }
  };

  const handlePlayTrack = (track) => {
    // Use global YouTube player
    playTrack(track, favorites);
  };

  const handleAddRemovePlaylist = async (songId, playlistId) => {
    try {
      const songPlaylistIds = playlistsWithSongs.get(songId) || [];
      
      if (songPlaylistIds.includes(playlistId)) {
        // Remove from playlist
        await playlistAPI.removeSong(playlistId, songId);
        const newMap = new Map(playlistsWithSongs);
        const updatedIds = newMap.get(songId).filter(id => id !== playlistId);
        newMap.set(songId, updatedIds);
        setPlaylistsWithSongs(newMap);
        showToast('❌ Removed from playlist', 'success');
      } else {
        // Add to playlist
        const song = favorites.find(s => s.id === songId);
        if (song) {
          await playlistAPI.addSong(playlistId, song);
          const newMap = new Map(playlistsWithSongs);
          const currentIds = newMap.get(songId) || [];
          currentIds.push(playlistId);
          newMap.set(songId, currentIds);
          setPlaylistsWithSongs(newMap);
          showToast('✅ Added to playlist!', 'success');
        }
      }
    } catch (err) {
      showToast('Failed to update playlist', 'error');
      console.error(err);
    }
  };

  if (loading) return <div className="container py-4"><p>Loading...</p></div>;

  return (
    <div className="container py-4">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`} 
             role="alert"
             style={{
               top: '80px',
               right: '20px',
               zIndex: 9999,
               minWidth: '300px'
             }}>
          {toast.message}
          <button type="button" className="btn-close" onClick={() => setToast({ ...toast, visible: false })}></button>
        </div>
      )}

      <h2 className="mb-4">❤️ My Favorites</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="alert alert-info">No favorite songs yet. Add some!</div>
      ) : (
        <div className="row">
          {favorites.map((song) => (
            <div key={song.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                {song.imageUrl && (
                  <img src={song.imageUrl} className="card-img-top" alt={song.title} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{song.title}</h5>
                  <p className="card-text text-muted">{song.artists?.join(', ')}</p>
                </div>
                {song.previewUrl && (
                  <div className="card-body">
                    <audio controls className="w-100" style={{ height: '32px' }}>
                      <source src={song.previewUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
                <div className="card-footer bg-light">
                  <div className="d-flex gap-2 mb-2">
                    <button
                      className="btn btn-sm btn-warning flex-grow-1"
                      onClick={() => handlePlayTrack(song)}
                      title="Play"
                    >
                      ▶️ Play
                    </button>
                    <div className="dropdown flex-grow-1">
                      <button
                        className="btn btn-sm btn-info w-100 dropdown-toggle"
                        type="button"
                        id={`playlist-${song.id}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="Add/Remove Playlist"
                      >
                        📋
                      </button>
                      <ul className="dropdown-menu" aria-labelledby={`playlist-${song.id}`}>
                        {playlists.length > 0 ? (
                          playlists.map((playlist) => {
                            const isInPlaylist = (playlistsWithSongs.get(song.id) || []).includes(playlist.id);
                            return (
                              <li key={playlist.id}>
                                <button
                                  className={`dropdown-item ${isInPlaylist ? 'text-danger' : ''}`}
                                  onClick={() => handleAddRemovePlaylist(song.id, playlist.id)}
                                >
                                  {isInPlaylist ? '✓ ' : '+ '}{playlist.name}
                                </button>
                              </li>
                            );
                          })
                        ) : (
                          <li><span className="dropdown-item disabled">No playlists</span></li>
                        )}
                      </ul>
                    </div>
                    <button
                      className="btn btn-sm btn-danger flex-grow-1"
                      onClick={() => handleRemoveClick(song.id)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    className="btn btn-sm btn-success w-100"
                    onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + (song.artists?.[0] || ''))}`, '_blank')}
                    title="Open in Spotify"
                  >
                    ▶️ Spotify
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Remove</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to remove this song from favorites?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmRemove}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
