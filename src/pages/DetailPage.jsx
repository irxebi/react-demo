import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchEvolutionChain,
  fetchPokemonByName,
  fetchPokemonSpecies,
  flattenEvolutionChain,
  formatPokemonName,
  getArtwork
} from '../services/pokemonApi.js';

export default function DetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadPokemonProfile() {
      try {
        const pokemonData = await fetchPokemonByName(name);
        const speciesData = await fetchPokemonSpecies(name);
        const evolutionData = await fetchEvolutionChain(
          speciesData.evolution_chain.url
        );

        if (isMounted) {
          setPokemon(pokemonData);
          setSpecies(speciesData);
          setEvolution(flattenEvolutionChain(evolutionData.chain));
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

    loadPokemonProfile();

    return () => {
      isMounted = false;
    };
  }, [name]);

  const flavorText = useMemo(() => {
    const entry = species?.flavor_text_entries.find(
      (item) => item.language.name === 'en'
    );

    return entry?.flavor_text.replace(/\f/g, ' ') || '';
  }, [species]);

  return (
    <main className="app-shell pokedex-shell">
      <nav className="navbar navbar-expand bg-white border-bottom">
        <div className="container py-2">
          <Link className="navbar-brand fw-black text-brand" to="/pokemon">
            Pokémon Encyclopedia
          </Link>
          <button className="btn btn-outline-dark" type="button" onClick={() => navigate('/pokemon')}>
            Back
          </button>
        </div>
      </nav>

      <section className="container page-content">
        {isLoading && (
          <div className="loading-card shadow-sm">Loading...</div>
        )}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {pokemon && !isLoading && !error && (
          <article className="pokemon-profile shadow-lg">
            <div className="row g-4 align-items-center">
              <div className="col-lg-5">
                <div className="profile-art-wrap">
                  <span className="dex-number profile-number">
                    #{String(pokemon.id).padStart(3, '0')}
                  </span>
                  <img
                    src={getArtwork(pokemon)}
                    alt={formatPokemonName(pokemon.name)}
                    className="profile-art"
                  />
                </div>
              </div>
              <div className="col-lg-7">
                <p className="eyebrow">Pokémon Profile</p>
                <h1 className="display-title">{formatPokemonName(pokemon.name)}</h1>
                <p className="profile-copy">{flavorText}</p>
                <div className="type-row mb-4">
                  {pokemon.types.map((entry) => (
                    <span className={`type-pill type-${entry.type.name}`} key={entry.type.name}>
                      {formatPokemonName(entry.type.name)}
                    </span>
                  ))}
                </div>
                <div className="row g-3">
                  <ProfileMetric label="Height" value={`${pokemon.height / 10} m`} />
                  <ProfileMetric label="Weight" value={`${pokemon.weight / 10} kg`} />
                  <ProfileMetric label="Base XP" value={pokemon.base_experience} />
                </div>
              </div>
            </div>

            <div className="row g-4 mt-2">
              <div className="col-lg-7">
                <section className="profile-section">
                  <h2>Stats</h2>
                  <div className="d-grid gap-3">
                    {pokemon.stats.map((entry) => (
                      <StatBar
                        label={formatStatName(entry.stat.name)}
                        value={entry.base_stat}
                        key={entry.stat.name}
                      />
                    ))}
                  </div>
                </section>
              </div>

              <div className="col-lg-5">
                <section className="profile-section compact-section">
                  <h2>Abilities</h2>
                  <div className="ability-list">
                    {pokemon.abilities.map((entry) => (
                      <span className="ability-chip" key={entry.ability.name}>
                        {formatPokemonName(entry.ability.name)}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <section className="profile-section evolution-section mt-4">
              <h2>Evolution</h2>
              <div className="evolution-list">
                {evolution.map((stage) => (
                  <Link
                    className={`evolution-step depth-${stage.depth}`}
                    to={`/pokemon/${stage.name}`}
                    key={`${stage.name}-${stage.depth}`}
                  >
                    {formatPokemonName(stage.name)}
                  </Link>
                ))}
              </div>
            </section>
          </article>
        )}
      </section>
    </main>
  );
}

function ProfileMetric({ label, value }) {
  return (
    <div className="col-sm-4">
      <div className="profile-metric">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function StatBar({ label, value }) {
  return (
    <div>
      <div className="d-flex justify-content-between mb-1">
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="progress stat-progress" role="progressbar" aria-label={label}>
        <div
          className="progress-bar"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatStatName(name) {
  if (name === 'hp') {
    return 'HP';
  }

  return formatPokemonName(name);
}
