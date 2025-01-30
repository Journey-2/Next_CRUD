import { PaginatedPokemonResponse, Stat, PokemonDetails, Pokemon } from "../store/usePokeomonStore";
 
// This function fetches Pokemon according to the pagination option chosen in the UI
export async function fetchPaginatedPokemon(limit: number, offset: number): Promise<PaginatedPokemonResponse> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error("Failed to fetch Pokémon list");
 
  const data: { results: { name: string; url: string }[]; count: number } = await response.json();
 
  const resultsWithIdsSpritesAndTypes = await Promise.all(data.results.map(async (pokemon) => {
    const id = pokemon.url.split("/").slice(-2, -1)[0];
    const pokemonDetailsResponse = await fetch(pokemon.url);
    if (!pokemonDetailsResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
    const pokemonDetails: {
      sprites: { other: { "official-artwork": { front_default: string } } };
      types: { type: { name: string } }[];
      stats: Stat[];
    } = await pokemonDetailsResponse.json();
 
    return {
      ...pokemon,
      id: parseInt(id, 10),
      sprite: pokemonDetails.sprites.other["official-artwork"].front_default,
      types: pokemonDetails.types.map((typeObj) => typeObj.type.name),
      totalStats: pokemonDetails.stats.reduce((sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0),
    };
  }));
 
  return {
    results: resultsWithIdsSpritesAndTypes,
    total: data.count,
  };
}
 
export async function fetchFilteredPokemon(type: string | null, searchQuery: string | null): Promise<Pokemon[]> {
  const baseUrl = "https://pokeapi.co/api/v2";
  let filteredResults: { name: string; url: string }[] = [];
 
  if (type) {
    const typeResponse = await fetch(`${baseUrl}/type/${type}`);
    if (!typeResponse.ok) throw new Error("Failed to fetch Pokémon by type");
    const typeData: { pokemon: { pokemon: { name: string; url: string } }[] } = await typeResponse.json();
    filteredResults = typeData.pokemon.map((p) => ({
      name: p.pokemon.name,
      url: p.pokemon.url,
    }));
  }
 
  if (searchQuery) {
    try {
      const searchResponse = await fetch(`${baseUrl}/pokemon/${searchQuery.toLowerCase()}`);
      if (searchResponse.ok) {
        const details: {
          id: number;
          name: string;
          types: { type: { name: string } }[];
          stats: Stat[];
          sprites: { other: { "official-artwork": { front_default: string } } };
        } = await searchResponse.json();
        return [
          {
            id: details.id,
            name: details.name,
            types: details.types.map((t) => t.type.name),
            totalStats: details.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
            sprite: details.sprites.other["official-artwork"].front_default,
          },
        ];
      }
    } catch (error) {
      console.error("Failed to fetch Pokémon by name:", error);
    }
    return [];
  }
 
  if (!type && !searchQuery) {
    const response = await fetch(`${baseUrl}/pokemon?limit=50`);
    if (!response.ok) throw new Error("Failed to fetch Pokémon list");
    const data = await response.json();
    filteredResults = data.results;
  }
 
  return Promise.all(
    filteredResults.slice(0, 50).map(async (pokemon) => {
      const detailsResponse = await fetch(pokemon.url);
      if (!detailsResponse.ok) throw new Error("Failed to fetch Pokémon details");
      const details: {
        id: number;
        name: string;
        types: { type: { name: string } }[];
        stats: Stat[];
        sprites: { other: { "official-artwork": { front_default: string } } };
      } = await detailsResponse.json();
      return {
        id: details.id,
        name: pokemon.name,
        types: details.types.map((t) => t.type.name),
        totalStats: details.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
        sprite: details.sprites.other["official-artwork"].front_default,
      };
    })
  );
}
 
// Fetch Individual Pokémon Details
export async function fetchPokemonDetails(pokemonId: number): Promise<PokemonDetails> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  if (!response.ok) throw new Error("Failed to fetch Pokémon details");
 
  const details: {
    id: number;
    name: string;
    height: number;
    weight: number;
    stats: Stat[];
    types: { type: { name: string } }[];
    sprites: { other: { "official-artwork": { front_default: string } } };
    species: { url: string };
  } = await response.json();
 
  const speciesResponse = await fetch(details.species.url);
  if (!speciesResponse.ok) throw new Error("Failed to fetch Pokémon species");
 
  const species: {
    flavor_text_entries: { flavor_text: string; language: { name: string } }[];
    color: { name: string };
    hatch_counter: number;
    capture_rate: number;
  } = await speciesResponse.json();
 
  const description = species.flavor_text_entries
    .filter((entry) => entry.language.name === "en")
    .slice(0, 3)
    .map((entry) => entry.flavor_text);
 
  return {
    id: details.id,
    name: details.name,
    height: details.height,
    weight: details.weight,
    stats: details.stats.map((stat) => ({
      name: stat.stat.name,
      baseStat: stat.base_stat,
    })),
    totalStats: details.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
    types: details.types.map((typeObj) => typeObj.type.name),
    description: description || [],
    sprite: details.sprites.other["official-artwork"].front_default,
    color: species.color.name,
    hatch_counter: species.hatch_counter,
    capture_rate: species.capture_rate,
  };
}