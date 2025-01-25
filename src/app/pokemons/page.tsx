'use client';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Drawer } from "antd";

interface Pokemon {
  name: string;
  id: number;
  height: number;
  sprites: {
    front_default: string;
  };
}

const fetchPokemon = async (): Promise<Pokemon> => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/1");
  if (!res.ok) {
    throw new Error("Failed to fetch Pokémon data");
  }
  return res.json();
};

const Pokemon = () => {
  const { data, isLoading, isError, error } = useQuery<Pokemon>({
    queryKey: ["Pokemon"],
    queryFn: fetchPokemon,
  });

  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError && error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <Button type="primary" onClick={showDrawer}>
        Open Pokémon Details
      </Button>

      <Drawer
        title="Pokémon Details"
        placement="right"  
        onClose={onClose}
        open={visible} 
        width={800}       
      >
        <p>Pokémon Name:{data?.name}</p>
        <p>Pokémon Height:{data?.height}</p>
        <p>Pokémon ID:{data?.id}</p>

        <div>
          <img src={data?.sprites.front_default} alt="Pokemon Sprite" style={{ width: "100px", height: "100px" }} />
        </div>
      </Drawer>
    </div>
  );
};

export default Pokemon;
