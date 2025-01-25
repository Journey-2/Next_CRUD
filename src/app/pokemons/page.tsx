'use client'

import React from "react";
import { useQuery } from "@tanstack/react-query";

interface Pokemon{
  pokemon: string;
}

const fetchPokemon = async () => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
  const data = await res.json();
  return data.results; 
};

const Pokemon = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey : ["Pokemon"],
    queryFn : fetchPokemon
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Pokémon List</h1>
      <ul>
        {data.map((pokemon) => (
          <li key={pokemon.name}>{pokemon.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Pokemon;
