import { PaginatedPokemonResponse, Stat, PokemonDetails, Pokemon } from "../store/usePokeomonStore";
 
  //asynchronous function which will return a value of type PaginatedPokemonResponse 
  export async function fetchPaginatedPokemon(limit: number, offset: number): Promise<PaginatedPokemonResponse> {

  //fetching and storing the response based on the limit and offset
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);

  //throw an error if the response is not of type 200's
  if (!response.ok) throw new Error("Failed to fetch Pokémon list");

  //response includes meta data like status and head. 
  //now we will extract the body by using .json() function
  const data: { results: { name: string; url: string }[]; count: number } = await response.json();

  //create an array of Promises by mapping over data.results
  //each Promise fetches additional details for a Pokémon
  const resultsWithIdsSpritesAndTypes = await Promise.all(data.results.map(async (pokemon) => {

  //split will store the values of the url seperated by /
  // get the id of the pokemon by starting at the 2nd last place, since the last element is an empty entry
  const id = pokemon.url.split("/").slice(-2, -1)[0];

    //fetch the detailed data of individual pokemon from it's url
    const pokemonDetailsResponse = await fetch(pokemon.url);

    //if any error occurs throw an error
    if (!pokemonDetailsResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);

    //parsing the json response and storing the detailed pokemon details
    //defining the structure of pokemonDetails
    const pokemonDetails: {
      sprites: { other: { "official-artwork": { front_default: string } } };
      types: { type: { name: string } }[];
      stats: Stat[];
    } = await pokemonDetailsResponse.json();
 
    //return a new object containing additional details
    return {
      ...pokemon,// spreads the details of pokemon object, containing name and url.
      id: parseInt(id, 10),
      sprite: pokemonDetails.sprites.other["official-artwork"].front_default,
      types: pokemonDetails.types.map((typeObj) => typeObj.type.name),
      totalStats: pokemonDetails.stats.reduce((sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0),
    };
  }));
  
  //resolving the promise with the final object returning the object 
  //this contains
  //resultsWithIdsSpritesAndTypes :- resolved array of pokemon objects
  return {
    results: resultsWithIdsSpritesAndTypes,//resolved array of pokemon object?
    total: data.count,//total count of pokemon object through the api
  };
}

//retur
export async function fetchFilteredPokemon(type: string | null, searchQuery: string | null): Promise<Pokemon[]> {

  //with the help of base url, we'll append type paramete and searchQuery parameter
  const baseUrl = "https://pokeapi.co/api/v2";

  //this will hold the results after filtering based on the type 
  let filteredResults: { name: string; url: string }[] = [];
 
  if (type) {
    //adding type route to the base url
    //from here, selected type is choosen as the endpoint
    const typeResponse = await fetch(`${baseUrl}/type/${type}`);

    //throw an erroe if the response is not of type 200's   
    if (!typeResponse.ok) throw new Error("Failed to fetch Pokémon by type");

    //parsing the json response and storing the pokeon object with poperties name and url
    const typeData: { pokemon: { pokemon: { name: string; url: string } }[] } = await typeResponse.json();

    //mapping the pokemon objects containing name and the url into filteredResults array
    filteredResults = typeData.pokemon.map((p) => ({
      name: p.pokemon.name,
      url: p.pokemon.url,
    }));
  }
 
  if (searchQuery) {
    try {
      //on baseUrl append pokeon and from there go to the custom endpoint defined in the searchQuery state
      const searchResponse = await fetch(`${baseUrl}/pokemon/${searchQuery.toLowerCase()}`);

      //if the response is of 200's
      if (searchResponse.ok) {

        //store the details of the searchResponse in object details
        
        const details: {
          id: number;
          name: string;
          types: { type: { name: string } }[];//array of types
          stats: Stat[];//array of stats 
          sprites: { other: { "official-artwork": { front_default: string } } };
        } = await searchResponse.json();//resolves to a JSON object containing the details
        //this will trigger when searchQuery state is changed, returning an array for a single pokemon object containin details 
        return [
          {
            id: details.id,
            name: details.name,
            types: details.types.map((t) => t.type.name),//get the names of type if there are multi types 
            totalStats: details.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
            sprite: details.sprites.other["official-artwork"].front_default,
          },
        ];
      }
    } catch (error) {
      console.error("Failed to fetch Pokémon by name:", error);
    }
    return [];//return empty if the searchQuery doesn't match anything in the pokemon object
  }
 
  //trigger when search or type is not selected 
  if (!type && !searchQuery) {
    const response = await fetch(`${baseUrl}/pokemon?limit=50`);
    if (!response.ok) throw new Error("Failed to fetch Pokémon list");
    const data = await response.json();
    filteredResults = data.results;
  }

  //fetch the details for each Pokémon in the filteredResults list
  return Promise.all(
    filteredResults.slice(0, 50).map(async (pokemon) => {
      //get the detailed information for the first 50 filtered pokemon 
      const detailsResponse = await fetch(pokemon.url);
      if (!detailsResponse.ok) throw new Error("Failed to fetch Pokémon details");

      //defining the typing for each of the fetched pokemon details
      const details: {
        id: number;
        name: string;
        types: { type: { name: string } }[];
        stats: Stat[];
        sprites: { other: { "official-artwork": { front_default: string } } };
      } = await detailsResponse.json();

      //get these details for each pokemon
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
  
  //get some addtional data for drawer page
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
