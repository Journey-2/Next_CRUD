import { Drawer, Card, Row, Col, Image, Typography, Table, Spin } from "antd";
import { usePokemonStore } from "../store/usePokeomonStore";
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonDetails } from "../services/fetchPokemon";

const { Title, Text } = Typography;

const PokemonDrawer = () => {
  const { selectedPokemon, setSelectedPokemon, drawerVisible, setDrawerVisible } = usePokemonStore();

  const { data: pokemonDetails, isLoading } = useQuery({
    queryKey: ["pokemonDetails", selectedPokemon?.id],
    queryFn: () => fetchPokemonDetails(selectedPokemon?.id),
    enabled: !!selectedPokemon,
  });

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedPokemon(null);
  };

  return (
    <Drawer
      title={pokemonDetails?.name?.toUpperCase() || "Details"}
      open={drawerVisible}
      onClose={handleCloseDrawer}
      width={800}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p>Loading Pokémon details...</p>
        </div>
      ) : (
        pokemonDetails && (
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
                <Title level={4}>Capture Rate</Title>
                <Text>{pokemonDetails.capture_rate}%</Text>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Title level={4}>Types</Title>
                <Text>{pokemonDetails.types.join(", ")}</Text>
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

            <Title level={4}>Total Stats: {pokemonDetails.totalStats}</Title>
          </Card>
        )
      )}
    </Drawer>
  );
};

export default PokemonDrawer;
