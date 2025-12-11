import { useState, useEffect } from 'react';
import { playlistAPI, favoriteAPI } from '../api/endpoints';
import { useYouTubePlayer } from '../context/YouTubePlayerContext';

export const Playlists = () => {
  const { playTrack } = useYouTubePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPlaylistId, setConfirmPlaylistId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  const [allPlaylists, setAllPlaylists] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 3000);
  };

  useEffect(() => {
    fetchPlaylists();
    fetchFavoritesAndAllPlaylists();
  }, []);

  // Listen for playlist updates and refetch
  useEffect(() => {
    const handlePlaylistUpdate = async () => {
      console.log('📢 Playlist updated event received in Playlists, refetching...');
      try {
        await fetchPlaylists();
        await fetchFavoritesAndAllPlaylists();
        console.log('✅ Playlists refreshed');
      } catch (err) {
        console.error('❌ Failed to refetch playlists:', err);
      }
    };

    window.addEventListener('playlistUpdated', handlePlaylistUpdate);
    return () => window.removeEventListener('playlistUpdated', handlePlaylistUpdate);
  }, []);

  const fetchFavoritesAndAllPlaylists = async () => {
    try {
      // Fetch favorites
      const favResponse = await favoriteAPI.getAll();
      const favSet = new Set();
      (favResponse.data.data || []).forEach(fav => {
        favSet.add(fav.id);
      });
      setFavoriteSongs(favSet);

      // Fetch all playlists
      const playResponse = await playlistAPI.getAll();
      setAllPlaylists(playResponse.data.data || []);
    } catch (err) {
      console.error('Failed to fetch favorites/playlists:', err);
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistAPI.getAll();
      setPlaylists(response.data.data || []);
    } catch (err) {
      setError('Failed to load playlists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await playlistAPI.create(formData.name, formData.description);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      showToast('Playlist created successfully!', 'success');
      await fetchPlaylists();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create playlist';
      showToast(errorMsg, 'error');
      console.error(err);
    }
  };

  const handleViewPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setPlaylistSongs(playlist.Songs || []);
    setShowViewModal(true);
  };

  const handleRemoveSongFromPlaylist = async (songId) => {
    if (!selectedPlaylist) return;
    try {
      await playlistAPI.removeSong(selectedPlaylist.id, songId);
      setPlaylistSongs(playlistSongs.filter(s => s.id !== songId));
      showToast('Song removed from playlist!', 'success');
      await fetchPlaylists();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to remove song';
      showToast(errorMsg, 'error');
      console.error(err);
    }
  };

  const handleDeleteClick = (playlistId) => {
    setConfirmPlaylistId(playlistId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmPlaylistId) return;
    try {
      await playlistAPI.delete(confirmPlaylistId);
      showToast('Playlist deleted successfully!', 'success');
      setShowConfirm(false);
      setConfirmPlaylistId(null);
      await fetchPlaylists();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete playlist';
      showToast(errorMsg, 'error');
      console.error(err);
    }
  };

  const handlePlayTrack = (track) => {
    // Use global YouTube player
    playTrack(track, playlistSongs);
  };

  const handleAddRemoveFavorite = async (track) => {
    try {
      if (favoriteSongs.has(track.id)) {
        // Remove from favorites
        await favoriteAPI.remove(track.id);
        const newSet = new Set(favoriteSongs);
        newSet.delete(track.id);
        setFavoriteSongs(newSet);
        showToast('❌ Removed from favorites', 'success');
      } else {
        // Add to favorites
        await favoriteAPI.add(track);
        const newSet = new Set(favoriteSongs);
        newSet.add(track.id);
        setFavoriteSongs(newSet);
        showToast('✅ Added to favorites!', 'success');
      }
    } catch (err) {
      showToast('Failed to update favorite', 'error');
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎵 My Playlists</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Create Playlist'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4">
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Playlist Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-success">Create Playlist</button>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="alert alert-info">No playlists yet. Create one to get started!</div>
      ) : (
        <div className="row">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div 
                  className="card-img-top bg-primary d-flex align-items-center justify-content-center"
                  style={{ height: '200px', color: 'white', fontSize: '48px' }}
                >
                  {playlist.coverImage ? (
                    <img src={playlist.coverImage} alt={playlist.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    '♪'
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{playlist.name}</h5>
                  {playlist.description && (
                    <p className="card-text" style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#495057', lineHeight: '1.4' }}>
                      ✨ {playlist.description}
                    </p>
                  )}
                  <small className="text-secondary">{playlist.Songs?.length || 0} songs</small>
                </div>
                <div className="card-footer bg-light">
                  <button 
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleViewPlaylist(playlist)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteClick(playlist.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Playlist Modal */}
      {showViewModal && selectedPlaylist && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedPlaylist.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {playlistSongs.length === 0 ? (
                  <p className="text-muted">No songs in this playlist yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Artists</th>
                          <th>Album</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playlistSongs.map((song) => (
                          <tr key={song.id}>
                            <td>{song.title}</td>
                            <td>{song.artists?.join(', ')}</td>
                            <td>{song.album}</td>
                            <td>
                              <div className="d-flex gap-1 flex-wrap">
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handlePlayTrack(song)}
                                  title="Play"
                                >
                                  ▶️
                                </button>
                                <button
                                  className={`btn btn-sm ${favoriteSongs.has(song.id) ? 'btn-danger' : 'btn-success'}`}
                                  onClick={() => handleAddRemoveFavorite(song)}
                                  title={favoriteSongs.has(song.id) ? "Remove from favorites" : "Add to favorites"}
                                >
                                  {favoriteSongs.has(song.id) ? '❌ ❤️' : '✅ ❤️'}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleRemoveSongFromPlaylist(song.id)}
                                  title="Remove from playlist"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this playlist? This action cannot be undone.</p>
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
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
