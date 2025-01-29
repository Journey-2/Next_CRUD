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

    // console.log(data.count)


    return {
      ...pokemon,
      id: parseInt(id, 10),
      sprite : pokemonDetails.sprites.other["official-artwork"].front_default,
      types : pokemonDetails.types.map((typeObj: any) => typeObj.type.name),
      totalStats : pokemonDetails.stats.reduce(//details.stats holds the value of stat array, which has values like hp
        (sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0//reduce will apply a function to the element of the array and return a single value, in this case it's all being summed into total stats
      ),
    };
  }));

  return {
    results: resultsWithIdsSpritesAndTypes,
    total: data.count,
  };
}

// // 2. Fetch for Search/Filter
// async function fetchFilteredPokemon(type: string | null, searchQuery: string | null) {
//   const baseUrl = "https://pokeapi.co/api/v2";
//   let filteredResults: any[] = [];

//   if (type) {
//     const typeResponse = await fetch(`${baseUrl}/type/${type}`);
//     if (!typeResponse.ok) throw new Error("Failed to fetch Pokémon by type");
//     const typeData = await typeResponse.json();
//     filteredResults = typeData.pokemon.map((p: any) => ({
//       name: p.pokemon.name,
//       url: p.pokemon.url,
//     }));
    
//   } else {
//     const response = await fetch(`${baseUrl}/pokemon?limit=500`);
//     if (!response.ok) throw new Error("Failed to fetch Pokémon list");
//     const data = await response.json();
//     filteredResults = data.results;
//   }


//   if (searchQuery) {
//     filteredResults = filteredResults.filter((pokemon: any) =>
//       pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }

//   const detailedResults = await Promise.all(
//     filteredResults.slice(0, 500).map(async (pokemon: any) => {
//       const detailsResponse = await fetch(pokemon.url);
//       if (!detailsResponse.ok) throw new Error("Failed to fetch Pokémon details");
//       const details = await detailsResponse.json();

//       const types = details.types.map((t: any) => t.type.name);
//       return {
//         id: details.id,
//         name: pokemon.name,
//         types,
//         totalStats : details.stats.reduce(//details.stats holds the value of stat array, which has values like hp
//           (sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0//reduce will apply a function to the element of the array and return a single value, in this case it's all being summed into total stats
//         ),
//         sprite: details.sprites.other["official-artwork"].front_default,
//       };
//     })
//   );

//   return detailedResults;
// }

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
  } else if (searchQuery) {
    // Instead of fetching 500 Pokémon, directly fetch only the searched Pokémon
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
    return []; // Return empty if no Pokémon is found
  } else {
    const response = await fetch(`${baseUrl}/pokemon?limit=50`); // Reduce from 500 to 50
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


// 3. Fetch for Individual Pokémon
async function fetchPokemonDetails(pokemonId: number) {
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
  const searchParams = useSearchParams();  // Read query params from URL
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);  // Default to page 1 if not present
  const initialSearchQuery = searchParams.get("search") || "";  // Default to empty search query
  const initialType = searchParams.get("type") || null;  // Default to null if type not selected

  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedType, setSelectedType] = useState<string | null>(initialType);

  // const searchQuery = searchParams.get("search") || ""; // Default to empty search query
  // const selectedType = searchParams.get("type") || null; // Default

  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pageSize, setPageSize] = useState<number>(20);

  const offset = (currentPage - 1) * pageSize;

  // Fetch Paginated Data
  const { data: paginatedData, isLoading: isPaginatedLoading } = useQuery({
    queryKey: ["paginatedPokemon", currentPage, pageSize],
    queryFn: () => fetchPaginatedPokemon(pageSize, offset),
  });

  // Fetch Filtered Data
  const { data: filteredData, isLoading: isFilteredLoading } = useQuery({
    queryKey: ["filteredPokemon", selectedType, searchQuery],
    queryFn: () => fetchFilteredPokemon(selectedType, searchQuery),
    enabled: !!selectedType || !!searchQuery, // Run only if filter or search is applied
  });

  // Fetch Individual Pokémon Details
  const { data: pokemonDetails } = useQuery({
    queryKey: ["pokemonDetails", selectedPokemon?.id],
    queryFn: () => fetchPokemonDetails(selectedPokemon?.id || ""),
    enabled: !!selectedPokemon, // Run only when a Pokémon is selected
  });

  const handlePageChange = (newPage: number) => {
    // setSearchQuery('')
    // setSelectedType(null)
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
 
    router.push(`/?${params.toString()}`);
  };
 
  const handleTypeChange = (type: string | null) => {
    setSelectedType(type);
    const params = new URLSearchParams(searchParams.toString());
 
    if (type) {
        params.set("type", type);
    } else {
        params.delete("type");
    }
 
    params.set("page", "1"); 
 
    router.push(`/?${params.toString()}`);
  };
 
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams.toString());
 
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
 
    params.set("page", "1"); // Reset page when searching
 
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setSearchQuery('')
    setSelectedType(null)
    const params = new URLSearchParams(searchParams.toString());

    params.delete("search");
    params.delete("type")

    params.set("page", "1");

    router.push(`/?${params.toString()}`);
  }
  
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
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render : (name:string) =>{
        return name.charAt(0).toUpperCase() + name.slice(1)
      }
    },
    {
      title: "Types",
      dataIndex: "types",
      key: "types",
      render: (types: string[]=[]) => {
        return types
        .map((type:string)=>type.charAt(0).toUpperCase() + type.slice(1))
        .join(", ")
    }},
    {
      title: "totalStats",
      dataIndex: "totalStats",
      key : "totalStats",   
      sorter: (a: any, b: any) => a.totalStats - b.totalStats
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
      <Row>
      <label htmlFor="searchPokemon">Enter the name of the Pokemon:</label>
      <Input
        id="searchPokemon"
        placeholder="Search Pokémon"
        onChange={handleSearchChange}
        style = {{ width:500,}}
        value={searchQuery}
      />
      </Row>
      <Row>
        <label htmlFor="selectType">Filter by type:</label>
      <Select
        id="selectType"
        placeholder="Select Type"
        onChange={handleTypeChange}
        value={selectedType}
        allowClear
        style = {{}}
      >
          {['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'].map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
        </Row> 

        <Button
        type="primary"
        onClick={handleReset}
        >Reset</Button>
      <Table
        columns={columns}
        dataSource={filteredData || paginatedData?.results}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          pageSizeOptions: ["10","20","50","100","1025"],
          onShowSizeChange:(current, size) => {setPageSize(size)},
          onChange: handlePageChange,
          total: filteredData ? filteredData.length : paginatedData?.total,
          showTotal : total => `Total ${total}`
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
