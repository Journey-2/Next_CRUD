
export async function fetchPaginatedPokemon(limit: number, offset: number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error("Failed to fetch Pokémon list");
 
  const data = await response.json();
 
  const resultsWithIdsSpritesAndTypes = await Promise.all(data.results.map(async (pokemon: any) => {
    const id = pokemon.url.split("/").slice(-2, -1)[0];
    const pokemonDetailsResponse = await fetch(pokemon.url);
    if (!pokemonDetailsResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
    const pokemonDetails = await pokemonDetailsResponse.json();
 
    return {
      ...pokemon,
      id: parseInt(id, 10),
      sprite: pokemonDetails.sprites.other["official-artwork"].front_default,
      types: pokemonDetails.types.map((typeObj: any) => typeObj.type.name),
      totalStats: pokemonDetails.stats.reduce((sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0),
    };
  }));
 
  return {
    results: resultsWithIdsSpritesAndTypes,
    total: data.count,
  };
}
 
export async function fetchFilteredPokemon(type: string | null, searchQuery: string | null) {
  const baseUrl = "https://pokeapi.co/api/v2";
  let filteredResults: any[] = [];
 
  if (type) {
    const typeResponse = await fetch(`${baseUrl}/type/${type}`);
    if (!typeResponse.ok) throw new Error("Failed to fetch Pokémon by type");
    const typeData = await typeResponse.json();
    filteredResults = typeData.pokemon.map((p: any) => ({
      name: p.pokemon.name,
      url: p.pokemon.url,
    }));
  }
 
  if (searchQuery) {
    try {
      const searchResponse = await fetch(`${baseUrl}/pokemon/${searchQuery.toLowerCase()}`);
      if (searchResponse.ok) {
        const details = await searchResponse.json();
        return [{
          id: details.id,
          name: details.name,
          types: details.types.map((t: any) => t.type.name),
          totalStats: details.stats.reduce((sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0),
          sprite: details.sprites.other["official-artwork"].front_default,
        }];
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
    filteredResults.slice(0, 50).map(async (pokemon: any) => {
      const detailsResponse = await fetch(pokemon.url);
      if (!detailsResponse.ok) throw new Error("Failed to fetch Pokémon details");
      const details = await detailsResponse.json();
      return {
        id: details.id,
        name: pokemon.name,
        types: details.types.map((t: any) => t.type.name),
        totalStats: details.stats.reduce((sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0),
        sprite: details.sprites.other["official-artwork"].front_default,
      };
    })
  );
}
 
// Fetch Individual Pokémon Details
export async function fetchPokemonDetails(pokemonId: number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  if (!response.ok) throw new Error("Failed to fetch Pokémon details");
 
  const details = await response.json();
  const speciesResponse = await fetch(details.species.url);
  if (!speciesResponse.ok) throw new Error("Failed to fetch Pokémon species");
  const species = await speciesResponse.json();
 
  const description = species.flavor_text_entries
    .filter((entry: any) => entry.language.name === "en")
    .slice(0, 3)
    .map((entry: any) => entry.flavor_text);
 
  return {
    id: details.id,
    name: details.name,
    height: details.height,
    weight: details.weight,
    stats: details.stats.map((stat: any) => ({
      name: stat.stat.name,
      baseStat: stat.base_stat,
    })),
    totalStats: details.stats.reduce((sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0),
    types: details.types.map((typeObj: any) => typeObj.type.name),
    description: description || [],
    sprite: details.sprites.other["official-artwork"].front_default,
    color: species.color.name,
    hatch_counter: species.hatch_counter,
    capture_rate: species.capture_rate,
  };
}
 