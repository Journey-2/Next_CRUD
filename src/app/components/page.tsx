'use client';

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, Button, Select, Table } from "antd";
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
  const paginatedResults = filteredResults.slice(offset, offset + limit);//starting wiht offset and ending with offset+limit-1

  return { results: paginatedResults, total: filteredResults.length };
  //results will hold the array of paginatedResult
  //total will hold the total number of pokemon after filtering , helpful for pagination
}

// //could have gotten this from fetchPokemonList
// const fetchPokemonDetails = async (id: number) => {
//   const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
//   if (!res.ok) throw new Error("Failed to fetch Pokémon details");
//   return res.json();
// };

const HomePage = () => {
  const searchParams = useSearchParams();//to read the query parameter 
  const router = useRouter();//to append stuff to the url

  const currentPage = parseInt(searchParams.get("page") || "1");//searchParams object gets the query parameter by key "page"
  const limit = 20;//no. of items on the page
  const offset = (currentPage - 1) * limit;//items skipped

  const [selectedType, setSelectedType] = useState<string | undefined>(
    searchParams.get("type") || undefined //searchParams object gets the query parameter by key 'type
  );
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);//selected pokemon to display on the drawer
  const [drawerVisible, setDrawerVisible] = useState(false);//visibility of the drawer component

  const { data, isLoading, error } = useQuery({//will have the result of fetchPokemon list, i.e. object with result and total
    queryKey: ["pokeList", currentPage, selectedType],//this will rerun whenever there is a change in currentPage or selecteType
    queryFn: () => fetchPokemonList(limit, offset, selectedType),//call the function which will have these parameters for fetching
    refetchOnWindowFocus: false,//do not refetch on focus; saves bandwidth 
  });

  // const { data: pokemonDetails, isLoading: isDetailsLoading } = useQuery({//will have the result of fetchPokemon list, i.e. object with result and total
  //   queryKey: ["pokemonDetails", selectedPokemon?.id],//will run on changes to selectedPokemon.id
  //   queryFn: () => fetchPokemonDetails(selectedPokemon?.id),
  //   enabled: !!selectedPokemon,
  // });

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

      //Below is the column definition for each column of the table.
      const columns = [
        {
          title: "Dex Number",
          dataIndex: "id",
          key: "id"
          // Column has the id/dex value of the Pokemon
        },
        {
          title: "Sprite",
          dataIndex: "sprite",
          key: "sprite",
          render: (spriteLink: string) => (<img src={spriteLink} alt="Sprite of the current pokemon" style={{ width: 50 }}/>)
          //Column has the sprite of the pokemon displayed
        },
        {
          title: "Name",
          dataIndex: "name",
          key: "name"
          //Column has the name of the Pokemon displayed
        },
        {
          title: "Types",
          dataIndex: "types",
          key: "types",
          render: (types: String[]) => types.join(", ")
          //Column has the type(s) of the Pokemon displayed
        },
        {
          title: "Total Stats",
          dataIndex: "totalStats",
          key: "totalStats"
          //Column has the total stat a Pokemon can have
        },
        {
          title: "Actions",
          key: "actions",
          render: (_: any, record: any) => (
          <Button type="primary" onClick={() => handleOpenDrawer(record)}>
            View Details
          </Button>
          )
          //This is tha action to open the drawer/further details about the Pokemon
        }
      ];

  if (isLoading) return <p>Loading Pokémon...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <div>
      <h1>Pokémon Page no : {searchParams.get("page")}</h1>

      {/* Filter by Type */}
      <div>
        <Select
          placeholder="Select Pokemon type..."
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

      <Table columns={columns} dataSource={data?.results} loading={isLoading} pagination={{
        current: currentPage,
        pageSize: limit,
        total: data?.total,
        onChange: handlePageChange
      }}
      rowKey="id" />

      {/* Pagination */}
      <div>
        <Button type="primary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button type='primary'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={(data?.total || 0) <= offset + limit}
        >
          Next
        </Button>
      </div>

      {/* Pokémon Details Drawer */}
      <Drawer
        title={selectedPokemon?.name || "Pokémon Details"}
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        width={800}
      >
        {selectedPokemon ? (
          <div>
            <p>Pokémon ID: {selectedPokemon.id}</p>
            <p>Pokémon Name: {selectedPokemon.name}</p>
            <p>Height: {selectedPokemon.height}</p>
            <p>Weight: {selectedPokemon.weight}</p>
            <img src={selectedPokemon.sprite}/>
          </div>
        ) : (
          <p>No details available.</p>
        )}
      </Drawer>
    </div>
  );
};

export default HomePage;
