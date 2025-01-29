'use client';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, Button, Select, Table, Card, Typography, Row, Col, Image, Input } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

const { Title, Text } = Typography;
async function fetchPaginatedPokemon(limit: number, offset: number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error("Failed to fetch Pokémon list");

  const data = await response.json();
  
  // Fetch details for each Pokémon to get sprite and types
  const resultsWithIdsSpritesAndTypes = await Promise.all(data.results.map(async (pokemon: any) => {
    const id = pokemon.url.split("/").slice(-2, -1)[0]; // Extract ID from the URL
    
    // Fetch individual Pokémon details to get sprite and types
    const pokemonDetailsResponse = await fetch(pokemon.url);
    if (!pokemonDetailsResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
    
    const pokemonDetails = await pokemonDetailsResponse.json();

    console.log(data.count)


    return {
      ...pokemon,
      id: parseInt(id, 10),
      sprite : pokemonDetails.sprites.other["official-artwork"].front_default,
      types : pokemonDetails.types.map((typeObj: any) => typeObj.type.name),
    };
  }));

  return {
    results: resultsWithIdsSpritesAndTypes,
    total: data.count,
  };
}


// 2. Fetch for Search/Filter
async function fetchFilteredPokemon(type: string | null, searchQuery: string | null) {
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
    
  } else {
    const response = await fetch(`${baseUrl}/pokemon?limit=500`);
    if (!response.ok) throw new Error("Failed to fetch Pokémon list");
    const data = await response.json();
    filteredResults = data.results;
  }


  if (searchQuery) {
    filteredResults = filteredResults.filter((pokemon: any) =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const detailedResults = await Promise.all(
    filteredResults.slice(0, 500).map(async (pokemon: any) => {
      const detailsResponse = await fetch(pokemon.url);
      if (!detailsResponse.ok) throw new Error("Failed to fetch Pokémon details");
      const details = await detailsResponse.json();

      const types = details.types.map((t: any) => t.type.name);
      return {
        id: details.id,
        name: pokemon.name,
        types,
        sprite: details.sprites.other["official-artwork"].front_default,
      };
    })
  );

  return detailedResults;
}

// 3. Fetch for Individual Pokémon
async function fetchPokemonDetails(pokemonUrl: string) {
  const response = await fetch(pokemonUrl);
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
    weight: details.weight ,
    stats: details.stats.map((stat: any) => ({
      name: stat.stat.name,
      baseStat: stat.base_stat,
    })),
    totalStats : details.stats.reduce(//details.stats holds the value of stat array, which has values like hp
      (sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0//reduce will apply a function to the element of the array and return a single value, in this case it's all being summed into total stats
    ),
    types: details.types.map((typeObj: any) => typeObj.type.name),
    description: description || [], 
    sprite: details.sprites.other["official-artwork"].front_default,
    color: species.color.name,
    hatch_counter: species.hatch_counter,
    capture_rate: species.capture_rate,
  };
}

const HomePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page") || "1");
  // const limit = 20;

  const [searchQuery, setSearchQuery] = useState<string>(""); 
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pageSize, setPageSize] = useState<number>(20)
  
  const offset = (currentPage - 1) * pageSize;


  // Fetch Paginated Data
  const { data: paginatedData, isLoading: isPaginatedLoading } = useQuery({
    queryKey: ["paginatedPokemon", currentPage],
    queryFn: () => fetchPaginatedPokemon(pageSize, offset),
    // keepPreviousData: true,
  });

  // Fetch Filtered Data
  const { data: filteredData, isLoading: isFilteredLoading } = useQuery({
    queryKey: ["filteredPokemon", selectedType, searchQuery],
    queryFn: () => fetchFilteredPokemon(selectedType, searchQuery),
    enabled: !!selectedType || !!searchQuery, // Run only if filter or search is applied
  });

  // Fetch Individual Pokémon Details
  const { data: pokemonDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["pokemonDetails", selectedPokemon?.url],
    queryFn: () => fetchPokemonDetails(selectedPokemon?.url || ""),
    enabled: !!selectedPokemon, // Run only when a Pokémon is selected
  });

  

  const handlePageChange = (newPage: number) => {
    router.push(`/?page=${newPage}`);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    // router.push(`/?type=${type}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // router.push(`&&/?search`)
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
        <img src={spriteLink} alt="Sprite" style={{ width: 50 }} />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Types",
      dataIndex: "types",
      key: "types",
      render: (types: string[]=[]) => types.join(", "),
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

  const isLoading = isPaginatedLoading || isFilteredLoading;

  return (
    <div>
      <h1>Pokémon</h1>
      <Row gutter={16} align="middle">
          <Title level={3}><Text>Search Pokémon: </Text></Title>
          <Input
            placeholder="Search Pokémon"
            onChange={handleSearchChange}
            style={{
              width: 150,
              height: 30,
              marginTop:20
            }}
          />
      </Row>

      <Row>
        <Title level={3}><Text>Select Type: </Text></Title>
        <Select
          placeholder="Select Type"
          onChange={handleTypeChange}
          allowClear
          style={{
            width: 150,
            height: 30,
            marginTop:30
          }}
        >
          {['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'].map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select> 
      </Row>
      <Table
        columns={columns}
        dataSource={filteredData || paginatedData?.results}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onShowSizeChange:(cuurent, size) => {setPageSize(size)},
          onChange: handlePageChange,
          total: filteredData ? filteredData.length : paginatedData?.total,
        }}
        rowKey="id"
      />

      <Drawer
        title={pokemonDetails?.name.toUpperCase() || "Details"}
        open={drawerVisible}
        onClose={handleCloseDrawer}
        width={800}
      >
        {pokemonDetails && (
        <Card>
            <Row>
              <Col span={8}>
                <Image src={pokemonDetails.sprite} style={{ width: 200 }} />
              </Col>
              <Col span={16}>
                <Title level={4}>Description</Title>
                <Text>{pokemonDetails.description}</Text>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Title level={4}>Pokémon ID</Title>
                <Text>{pokemonDetails.id}</Text>
              </Col>
              <Col span={12}>
                <Title level={4}>Height</Title>
                <Text>{pokemonDetails.height / 10} meters</Text>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Title level={4}>Weight</Title>
                <Text>{pokemonDetails.weight} kg</Text>
              </Col>
              <Col span={12}>
                <Title level={4}>Color</Title>
                <Text>{pokemonDetails.color}</Text>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Title level={4}>Hatch Counter</Title>
                <Text>{pokemonDetails.hatch_counter ?? "no data"}</Text>
              </Col>
              <Col span={12}>
                <Title level={4}>Color</Title>
                <Text>{pokemonDetails.color}</Text>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Title level={4}>Types</Title>
                <Text>{pokemonDetails.types.join(", ")}</Text>
              </Col>
              <Col>
              <Col span={26}>
                <Title level={4}>Capture Rate</Title>
                <Text>{pokemonDetails.capture_rate}%</Text>
              </Col>
              </Col>
            </Row>

            <Title level={4}>Stats:</Title>
            <Table
              columns={[
                { title: "Stat", dataIndex: "name", key: "name" },
                { title: "Base Stat", dataIndex: "baseStat", key: "baseStat" },
              ]}
              dataSource={pokemonDetails.stats}
              pagination={false}
              bordered
              size="small"
              rowKey="name"
            />

            <Title level={4}>Total Stats : {pokemonDetails.totalStats}</Title>
            <Text></Text>
          </Card>
        )}
      </Drawer>
    </div>
  );
};

export default HomePage;
