import { Input, Select, Button, Row } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { usePokemonStore } from "../store/usePokeomonStore";
 
const SearchFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
 
  const { searchQuery, setSearchQuery, selectedType, setSelectedType, setSearchQueryForFetch } = usePokemonStore();
 
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }
 
  const handleSearchChangeButtonClick = () => {
    setSearchQueryForFetch(searchQuery);
    const params = new URLSearchParams(searchParams.toString());
   
    if (searchQuery) {
        params.set("search", searchQuery);
    } else {
        params.delete("search");
    }
   
    params.set("page", "1"); // Reset page when searching
   
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
 
  const handleReset = () => {
    setSearchQuery('');
    setSearchQueryForFetch('');
    setSelectedType(null);
    const params = new URLSearchParams(searchParams.toString());
 
    params.delete("search");
    params.delete("type")
 
    params.set("page", "1");
 
    router.push(`/?${params.toString()}`);
  }
 
  return (
    <div>
      <Row>
      <label htmlFor="searchPokemon">Enter the name of the Pokemon:</label>
      <Input
        id="searchPokemon"
        placeholder="Search Pokémon"
        onChange={handleSearchInputChange}
        style = {{ width:500,}}
        value={searchQuery}
      />
      <Button type="primary" onClick={handleSearchChangeButtonClick}>Search</Button>
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
 
        {(selectedType || searchQuery) && <Button type="primary" onClick={handleReset}>Reset</Button>}
    </div>
  );
};
 
export default SearchFilter;