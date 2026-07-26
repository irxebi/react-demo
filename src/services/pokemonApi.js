const API_URL = 'https://pokeapi.co/api/v2';
const LIST_LIMIT = 151;

export async function fetchPokemonList() {
  const response = await fetch(`${API_URL}/pokemon?limit=${LIST_LIMIT}`);

  if (!response.ok) {
    throw new Error('Could not load Pokémon. Please try again.');
  }

  const data = await response.json();

  return Promise.all(
    data.results.map((pokemon) => fetchPokemonByName(pokemon.name))
  );
}

export async function fetchPokemonByName(name) {
  const response = await fetch(`${API_URL}/pokemon/${name}`);

  if (!response.ok) {
    throw new Error('Could not load Pokémon details. Please try again.');
  }

  return response.json();
}

export async function fetchPokemonSpecies(name) {
  const response = await fetch(`${API_URL}/pokemon-species/${name}`);

  if (!response.ok) {
    throw new Error('Could not load Pokémon species. Please try again.');
  }

  return response.json();
}

export async function fetchEvolutionChain(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Could not load Pokémon evolution chain. Please try again.');
  }

  return response.json();
}

export function getArtwork(pokemon) {
  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.other?.dream_world?.front_default ||
    pokemon.sprites.front_default
  );
}

export function getSprite(pokemon) {
  return pokemon.sprites.front_default || getArtwork(pokemon);
}

export function formatPokemonName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function flattenEvolutionChain(chain) {
  const stages = [];

  function walk(node, depth = 0) {
    if (!node?.species?.name) {
      return;
    }

    stages.push({ name: node.species.name, depth });
    node.evolves_to.forEach((nextNode) => walk(nextNode, depth + 1));
  }

  walk(chain);
  return stages;
}
