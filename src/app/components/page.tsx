'use client';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, Button, Select, Table, Card, Typography, Row, Col, Image, Input } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

const { Title, Text } = Typography;

async function fetchPokemonList(limit: number, offset: number, type?: string, searchQuery?: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);//wait for the response before furthering

  if (!response.ok) throw new Error("Failed to fetch Pokémon list");// if response is anything other than 2** throw an error

  //convert response body in js object
  //.json() method returns a promise which is why we use await to pause the exexution and get the result of the promise
  const data = await response.json();// this contains a result array with pokemon name and url

  const detailedResults = await Promise.all(//will wait for all the promises to resolve.
    
    //returns a promise that resolves to an array of results of all promises
    data.results.map(async (pokemon: { name: string; url: string }) => {//iterate over data.result array to fetch basic pokemon details like the name and the url
      
      const detailsResponse = await fetch(pokemon.url);//for each pokemon you are fetching additional details from url as it contains the endpoints
      
      const details = await detailsResponse.json();//this will contain additional information of each pokemon like stats, sprite, etc
      
      const speciesResponse = await fetch(details.species.url);//this will contain additional information such as the description, egg group, etc
      
      const species = await speciesResponse.json();

      const totalStats = details.stats.reduce(//details.stats holds the value of stat array, which has values like hp
        (sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0//reduce will apply a function to the element of the array and return a single value, in this case it's all being summed into total stats
    )

  const types = details.types.map(
    (typeObj: { type: { name: string } }) => typeObj.type.name//extracting name property of the type object for each element of the detail.type arrray
  );

  const stats = details.stats.map(
    (stat: { base_stat: number, stat: { name: string } }) => ({
      name: stat.stat.name,
      baseStat: stat.base_stat
    })
  );

  const description = species.flavor_text_entries.find(
    (entry: { language: { name: string }, flavor_text: string }) => 
    entry.language.name === 'en')
    ?.flavor_text

  //make a custom object, this making it easier to work with
  return {
    name: pokemon.name,//from data.results
    id: details.id,//from fetched details
    height: details.height,
    weight: details.weight,
    stats,
    capture_rate: species.capture_rate,
    color: species.color.name,
    description, 
    sprite: details.sprites.other['official-artwork'].front_default,//from fetched details
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

    const searchFilteredResults = searchQuery
    ? filteredResults.filter((pokemon) => pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredResults;

  // Paginate the filtered results
  const paginatedResults = searchFilteredResults.slice(offset, offset + limit);

  console.log("Results object:", { results: paginatedResults, total: filteredResults.length }); //log the results object

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

  const [searchQuery, setSearchQuery] = useState<string>(""); // Triggers the actual search
  const [searchText, setSearchText] = useState<string>(""); // Used for the input field
  const [selectedType, setSelectedType] = useState<string | undefined>(
    searchParams.get("type") || undefined //searchParams object gets the query parameter by key 'type
  );
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);//selected pokemon to display on the drawer
  const [drawerVisible, setDrawerVisible] = useState(false);//visibility of the drawer component

  const { data, isLoading, error } = useQuery({//will have the result of fetchPokemon list, i.e. object with result and total
    queryKey: ["pokeList", currentPage, selectedType, searchQuery],//this will rerun whenever there is a change in currentPage or selecteType
    queryFn: () => fetchPokemonList(limit, offset, selectedType, searchQuery),//call the function which will have these parameters for fetching
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
      : `/?page=${newPage}`;
    router.push(queryString);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    router.push(`/?page=1&type=${type}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value); // Update the search text as the user types
  };

  const handleSearchClick = () => {
    setSearchQuery(searchText); // Trigger the search with the current input value
  };

  const handleOpenDrawer = (pokemon: any) => {
    setSelectedPokemon(pokemon);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedPokemon(null);
  };

  const columns = [
    {
      title: "Dex Number",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Sprite",
      dataIndex: "sprite",
      key: "sprite",
      render: (spriteLink: string) => (
        <img
          src={spriteLink}
          alt="Sprite of the current pokemon"
          style={{ width: 50 }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name), // Alphabetical sorting
    },
    {
      title: "Types",
      dataIndex: "types",
      key: "types",
      render: (types: string[]) => types.join(", "),
    },
    {
      title: "Total Stats",
      dataIndex: "totalStats",
      key: "totalStats",
      sorter: (a: any, b: any) => a.totalStats - b.totalStats, // Sort by total stats
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Button type="primary" onClick={() => handleOpenDrawer(record)}>
          View Details
        </Button>
      ),
    },
  ];

  if (isLoading) return <p>Loading Pokémon...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <div>
      <h1>Pokémon Page no : {searchParams.get("page")}</h1>
      <div>
        <Input
          placeholder="Search for Pokémon"
          value={searchText}
          onChange={handleSearchChange}
          style={{ width: 200, marginBottom: 20, marginRight: 10 }}
        />
        <Button type="primary" onClick={handleSearchClick}>
          Search
        </Button>
      </div>

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
              {type}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={data?.results}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: limit,
          total: data?.total,
          onChange: handlePageChange,
        }}
        rowKey="id"
      />

      {/* redundant now */}
      {/* Pagination
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
      </div> */}

      <Drawer
        title={selectedPokemon?.name.toUpperCase() || "Pokémon Details"}
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        width={800}
      >
        {selectedPokemon ? (
          <Card>
            <Row>
              <Col span={8}>
                <Image src={selectedPokemon.sprite} style={{ width: 200 }} />
              </Col>
              <Col span={16}>
                <Title level={4}>Description</Title>
                <Text>{selectedPokemon.description}</Text>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Title level={4}>Pokémon ID</Title>
                <Text>{selectedPokemon.id}</Text>
              </Col>
              <Col span={12}>
                <Title level={4}>Height</Title>
                <Text>{selectedPokemon.height / 10} meters</Text>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Title level={4}>Weight</Title>
                <Text>{selectedPokemon.weight} kg</Text>
              </Col>
              <Col span={12}>
                <Title level={4}>Color</Title>
                <Text>{selectedPokemon.color}</Text>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Title level={4}>Types</Title>
                <Text>{selectedPokemon.types.join(", ")}</Text>
              </Col>
            </Row>

            <Title level={4}>Stats:</Title>
            <Table
              columns={[
                { title: "Stat", dataIndex: "name", key: "name" },
                { title: "Base Stat", dataIndex: "baseStat", key: "baseStat" },
              ]}
              dataSource={selectedPokemon.stats}
              pagination={false}
              bordered
              size="small"
              rowKey="name"
            />

            <Title level={4}>Total Stats</Title>
            <Text>{selectedPokemon.totalStats}</Text>
          </Card>
        ) : (
          <p>No details available.</p>
        )}
      </Drawer>
    </div>
  );
};

export default HomePage;
