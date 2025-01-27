'use client';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, Button } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

async function fetchPokemonList(limit: number = 20, offset: number = 0) {//offset : to skip
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);//wait for the response before furthering
  if (!response.ok) {// if response is anything other than 2** throw an error
      throw new Error("Failed to fetch Pokemon List");
  }
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

          const types = details.types.map((type: { slot: number; type: { name: string } })=> type.type.name);

          return {
              name: pokemon.name,
              id: details.id,
              sprite: details.sprites.front_default,
              totalStats,
              cry: details.cries.latest,
              types
          }
      })
  )
  return { results: detailedResults, count: data.count }
}

const fetchPokemonDetails = async (id: number) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error("Failed to fetch Pokémon details");
  return res.json();
};

const HomePage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const [selectedPokemon, setSelectedPokemon] = useState<any>(null); 
  const [drawerVisible, setDrawerVisible] = useState(false); 

  const { data, isLoading, error } = useQuery({
    queryKey: ["pokeList", currentPage],
    queryFn: () => fetchPokemonList(limit, offset),
    refetchOnWindowFocus: false,
  });

  const { data: pokemonDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["pokemonDetails", selectedPokemon?.id],
    queryFn: () => fetchPokemonDetails(selectedPokemon?.id),
    enabled: !!selectedPokemon, 
  });

  const handlePageChange = (newPage: number) => {
    router.push(`/?page=${newPage}`);
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
      <h1>Pokémon List</h1>
      <ul>
        {data?.results.map(
          (
            pokemon: {
              name: string;
              id: number;
              sprite: string;
              totalStats: number;
              cry: string;
              types: string[];
            },
            index: number
          ) => (
            <li key={index}>
              <button
                onClick={() => handleOpenDrawer(pokemon)}
              >
                <p>{pokemon.id}</p>
                <img
                  src={pokemon.sprite}
                />
                <p>{pokemon.name}</p>
                <p>{pokemon.types.join(", ")}</p>
                <p>{pokemon.totalStats}</p>
              </button>
            </li>
          )
        )}
      </ul>

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
          disabled={data.results.length < limit}
        >
          Next
        </button>
      </div>

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
            <img
              src={pokemonDetails.sprites.front_default}
            />
          </div>
        ) : (
          <p>No details available.</p>
        )}
      </Drawer>
    </div>
  );
};

export default HomePage;


