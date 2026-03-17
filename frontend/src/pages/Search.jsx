import { useState, useCallback } from 'react';
import api from '../api/axios';
import SongCard from '../components/SongCard';
import toast from 'react-hot-toast';

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Indie', 'Metal', 'Lo-fi'];
const MOODS  = ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Focused', 'Party', 'Chill'];

const SearchIconLarge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const Search = () => {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!query.trim() && !genre && !mood) {
      toast.error('Enter a search term or pick a filter');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (genre) params.set('genre', genre);
      if (mood) params.set('mood', mood);
      const { data } = await api.get(`/search?${params.toString()}`);
      setResults(data);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [query, genre, mood]);

  const handleGenreToggle = (g) => {
    const next = genre === g ? '' : g;
    setGenre(next);
  };

  const handleMoodToggle = (m) => {
    const next = mood === m ? '' : m;
    setMood(next);
  };

  return (
    <div>
      <div className="page-hero" style={{ marginBottom: 28 }}>
        <div className="page-hero-label">Discover</div>
        <div className="page-hero-title">Search</div>
        <div className="page-hero-sub">Find any song, artist, or genre</div>
      </div>

      <form onSubmit={handleSearch}>
        <div className="search-bar-wrap">
          <SearchIconLarge />
          <input
            id="search-input"
            className="search-input"
            type="text"
            placeholder="Search songs, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="nav-label" style={{ padding: '0 0 8px' }}>Genre</div>
          <div className="filter-chips">
            {GENRES.map((g) => (
              <button key={g} type="button" className={`chip${genre === g ? ' active' : ''}`} onClick={() => handleGenreToggle(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="nav-label" style={{ padding: '0 0 8px' }}>Mood</div>
          <div className="filter-chips">
            {MOODS.map((m) => (
              <button key={m} type="button" className={`chip${mood === m ? ' active' : ''}`} onClick={() => handleMoodToggle(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <button id="search-btn" type="submit" className="btn-primary" style={{ marginBottom: 32 }}>
          Search
        </button>
      </form>

      {loading && <div className="spinner" />}

      {!loading && searched && (
        results.length === 0 ? (
          <div className="empty-state">
            <SearchIconLarge />
            <h3>No results found</h3>
            <p>Try a different search term or filter</p>
          </div>
        ) : (
          <>
            <div className="section-header">
              <h2 className="section-title">{results.length} Results</h2>
            </div>
            <div className="songs-grid">
              {results.map((song) => (
                <SongCard key={song._id} song={song} queue={results} />
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default Search;
