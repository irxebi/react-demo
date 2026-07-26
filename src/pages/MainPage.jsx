import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchPokemonList,
  formatPokemonName,
  getArtwork,
  getSprite
} from '../services/pokemonApi.js';

const PAGE_SIZE = 20;

export default function MainPage() {
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadPokemon() {
      try {
        const data = await fetchPokemonList();

        if (isMounted) {
          setPokemon(data);
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isMounted = false;
    };
  }, []);

  const types = useMemo(() => {
    const allTypes = pokemon.flatMap((item) =>
      item.types.map((entry) => entry.type.name)
    );

    return [...new Set(allTypes)].sort();
  }, [pokemon]);

  const filteredPokemon = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return pokemon.filter((item) => {
      const typeNames = item.types.map((entry) => entry.type.name);
      const matchesSearch =
        !normalizedSearch ||
        item.name.includes(normalizedSearch) ||
        String(item.id).includes(normalizedSearch);
      const matchesType =
        typeFilter === 'all' || typeNames.includes(typeFilter);

      return matchesSearch && matchesType;
    });
  }, [pokemon, searchTerm, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const visiblePokemon = filteredPokemon.slice(pageStart, pageEnd);
  const showingStart = filteredPokemon.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageEnd, filteredPokemon.length);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <main className="app-shell pokedex-shell">
      <nav className="navbar navbar-expand bg-white border-bottom sticky-top">
        <div className="container py-2">
          <Link className="navbar-brand fw-black text-brand" to="/pokemon">
            Pokémon Encyclopedia
          </Link>
          <button className="btn btn-outline-dark" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="pokedex-hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h1 className="hero-title text-white">Pokémon Encyclopedia</h1>
            </div>
            <div className="col-lg-4">
              <div className="featured-panel">
                <strong>{pokemon.length || '...'}</strong>
                <p>Pokémon cards available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container page-content">
        <div className="filter-panel shadow-lg" aria-label="Search and filter Pokémon">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label fw-bold" htmlFor="search">
                Search Pokémon
              </label>
              <input
                className="form-control form-control-lg"
                id="search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or Pokédex number"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold" htmlFor="type">
                Filter by type
              </label>
              <select
                className="form-select form-select-lg"
                id="type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">All types</option>
                {types.map((type) => (
                  <option value={type} key={type}>
                    {formatPokemonName(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-card shadow-sm">
            Loading...
          </div>
        )}

        {error && <div className="alert alert-danger mt-4" role="alert">{error}</div>}

        {!isLoading && !error && (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 my-4">
              <h2 className="section-title mb-0">Pokédex</h2>
              <span className="badge rounded-pill text-bg-light border">
                Showing {showingStart}-{showingEnd} of {filteredPokemon.length}
              </span>
            </div>

            <section className="row g-4" aria-label="Pokémon list">
              {visiblePokemon.map((item) => {
                const typeNames = item.types.map((entry) => entry.type.name);

                return (
                  <div className="col-sm-6 col-lg-4 col-xl-3" key={item.id}>
                    <Link className="pokemon-card shadow-sm" to={`/pokemon/${item.name}`}>
                      <div className="pokemon-card-top">
                        <span className="dex-number">#{String(item.id).padStart(3, '0')}</span>
                        <img
                          src={getSprite(item)}
                          alt={formatPokemonName(item.name)}
                          className="pokemon-sprite"
                        />
                      </div>
                      <img
                        src={getArtwork(item)}
                        alt=""
                        className="pokemon-art"
                        aria-hidden="true"
                      />
                      <h3>{formatPokemonName(item.name)}</h3>
                      <div className="type-row">
                        {typeNames.map((type) => (
                          <span className={`type-pill type-${type}`} key={type}>
                            {formatPokemonName(type)}
                          </span>
                        ))}
                      </div>
                      <span className="card-link">View profile</span>
                    </Link>
                  </div>
                );
              })}

              {filteredPokemon.length === 0 && (
                <div className="col-12">
                  <div className="alert alert-warning">No Pokémon match your filters.</div>
                </div>
              )}
            </section>

            {filteredPokemon.length > PAGE_SIZE && (
              <div className="pagination-panel mt-4">
                <button
                  className="btn btn-outline-dark"
                  type="button"
                  onClick={() => setCurrentPage((page) => page - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-brand"
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
