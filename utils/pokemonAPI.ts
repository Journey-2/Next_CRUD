
export async function fetchPokemonList(limit: number = 20, offset: number = 0, searchQuery: string = "") {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
        throw new Error("Failed to fetch Pokemon List");
    }
    const data = await response.json();

    const filteredResults = searchQuery ? data.results.filter((pokemon: {name: string}) => 
        pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())) : data.results;

    const detailedResults = await Promise.all(
        filteredResults.map(async (pokemon: { name: string; url: string }) => {
            const detailsResponse = await fetch(pokemon.url);
            const details = await detailsResponse.json();

            const totalStats = details.stats.reduce(
                (sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0
            )

            const types = details.types.map((type: { slot: number; type: { name: string } })=> type.type.name);

            return {
                name: pokemon.name,
                id: details.id,
                sprite: details.sprites.front_default,
                totalStats,
                cry: details.cries.latest || details.cries.legacy,
                types
            }
        })
    );
    
    return { results: detailedResults }
}
