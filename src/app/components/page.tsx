'use client';

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, Button, Select } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

async function fetchPokemonList(limit: number, offset: number, type?: string) {//offset : to skip
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);//wait for the response before furthering
  if (!response.ok) throw new Error("Failed to fetch Pokémon list");// if response is anything other than 2** throw an error

  //convert response body in js object
  //.json() method returns a promise which is why we use await to pause the exexution and get the result of the promise
  const data = await response.json();// this contains a result array with pokemon name and url
  
  const detailedResults = await Promise.all(//will wait for all the promises to resolve.
    //returns a promise that resolves to an array of results of all promises
      data.results.map(async (pokemon: { name: string; url: string }) => {//iterate over data.result array to fetch basic pokemon details like the name and the url
          const detailsResponse = await fetch(pokemon.url);//for each pokemon you are fetching additional details from url as it contains the endpoints
          const details = await detailsResponse.json();//this will contain additional information of each pokemon like stats, sprite, etc

          const totalStats = details.stats.reduce(//details.stats holds the value of stat array, which has values like hp
              (sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0//reduce will apply a function to the element of the array and return a single value, in this case it's all being summed into total stats
          )

      const types = details.types.map(
        (typeObj: { type: { name: string } }) => typeObj.type.name//extracting name property of the type object for each element of the detail.type arrray
      );

      //make a custom object, this making it easier to work with
      return {
        name: pokemon.name,//from data.results
        id: details.id,//from fetched details
        sprite: details.sprites.front_default,//from fetched details
        totalStats,//calculated above
        types,//aray of strings
      };
    })
  );
 
  // Filter by type if a type is selected
  const filteredResults = type//if type is defined 
    //detailed result is just defined above containing the custom object name, id , total_stats, sprite and type 
    ? detailedResults.filter((pokemon) => pokemon.types.includes(type))//this will only be set to true if the returned array contains the type specified in selected type
    : detailedResults;//no filtering is done

  // Paginate the filtered results
  const paginatedResults = filteredResults.slice(offset, offset + limit);//

  return { results: paginatedResults, total: filteredResults.length };
}

const fetchPokemonDetails = async (id: number) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error("Failed to fetch Pokémon details");
  return res.json();
};

const HomePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const [selectedType, setSelectedType] = useState<string | undefined>(
    searchParams.get("type") || undefined
  );
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pokeList", currentPage, selectedType],
    queryFn: () => fetchPokemonList(limit, offset, selectedType),
    refetchOnWindowFocus: false,
  });

  const { data: pokemonDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["pokemonDetails", selectedPokemon?.id],
    queryFn: () => fetchPokemonDetails(selectedPokemon?.id),
    enabled: !!selectedPokemon,
  });

  const handlePageChange = (newPage: number) => {
    const queryString = selectedType
      ? `/?page=${newPage}&type=${selectedType}`
      : `/?page=${newPage}&type='${undefined}`;
    router.push(queryString);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    router.push(`/?page=1&type=${type}`);
  };

  const handleOpenDrawer = (pokemon: any) => {
    setSelectedPokemon(pokemon);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedPokemon(null);
  };

  if (isLoading) return <p>Loading Pokémon...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <div>
      <h1>Pokémon Page no : {searchParams.get("page")}</h1>

      {/* Filter by Type */}
      <div style={{ marginBottom: "20px" }}>
        <Select
          style={{ width: "200px" }}
          placeholder="Select Pokémon Type"
          onChange={handleTypeChange}
          value={selectedType}
          allowClear
        >
          {[
            "normal",
            "fire",
            "water",
            "grass",
            "electric",
            "ice",
            "fighting",
            "poison",
            "ground",
            "flying",
            "psychic",
            "bug",
            "rock",
            "ghost",
            "dragon",
            "dark",
            "steel",
            "fairy",
          ].map((type) => (
            <Select.Option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Pokémon List */}
      <ul>
        {data?.results.map((pokemon, index) => (
          <li key={index}>
            <button onClick={() => handleOpenDrawer(pokemon)}>
              <p>{pokemon.id}</p>
              <img src={pokemon.sprite} alt={pokemon.name} />
              <p>{pokemon.name}</p>
              <p>{pokemon.types.join(", ")}</p>
              <p>{pokemon.totalStats}</p>
            </button>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ marginRight: "10px" }}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={(data?.total || 0) <= offset + limit}
        >
          Next
        </button>
      </div>

      {/* Pokémon Details Drawer */}
      <Drawer
        title={pokemonDetails?.name || "Pokémon Details"}
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        width={400}
      >
        {isDetailsLoading ? (
          <p>Loading Pokémon details...</p>
        ) : pokemonDetails ? (
          <div>
            <p>Pokémon ID: {pokemonDetails.id}</p>
            <p>Pokémon Name: {pokemonDetails.name}</p>
            <p>Height: {pokemonDetails.height}</p>
            <p>Weight: {pokemonDetails.weight}</p>
            <img src={pokemonDetails.sprites.front_default} alt={pokemonDetails.name} />
          </div>
        ) : (
          <p>No details available.</p>
        )}
      </Drawer>
    </div>
  );
};

export default HomePage;
