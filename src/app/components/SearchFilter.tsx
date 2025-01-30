import { Input, Select, Button, Row, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { usePokemonStore } from "../store/usePokeomonStore";

const { Text} = Typography
 
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
   
    params.set("page", "1");
   
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
      <Text style={{marginRight: 10}}>Enter the name of the Pokemon:</Text>
      <Input
        id="searchPokemon"
        placeholder="Search Pokémon"
        onChange={handleSearchInputChange}
        style = {{ width:200,}}
        value={searchQuery}
      />
      <Button type="primary" onClick={handleSearchChangeButtonClick} style={{marginLeft:10, marginRight:40}}>Search</Button>
      <Text style={{marginRight: 10}}>Filter by type:</Text>
      <Select
        id="selectType"
        placeholder="Select Type"
        onChange={handleTypeChange}
        value={selectedType}
        allowClear
        style = {{marginBottom:20}}
      >
          {['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'].map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
 
        {(selectedType || searchQuery) && <Button type="primary" style={{marginLeft:20}} onClick={handleReset}>Reset</Button>}
    </div>
  );
};
 
export default SearchFilter;