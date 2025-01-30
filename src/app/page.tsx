'use client'

// import HomePage from './components/page'; 
import SearchFilter from './components/SearchFilter';
import PokemonDrawer from './components/PokemonDrawer';
import PokemonTable from './components/PokemonTable';
import { fetchPokemonDetails, fetchFilteredPokemon, fetchPaginatedPokemon } from './services/fetchPokemon';
import { useQuery } from '@tanstack/react-query';
import { usePokemonStore } from './store/usePokeomonStore';


export default function Home() {
  const {
    currentPage,
    searchQuery, setSearchQuery,
    selectedType, setSelectedType,
    selectedPokemon, setSelectedPokemon,
    pageSize, setPageSize,
    searchQueryForFetch, setSearchQueryForFetch
  } = usePokemonStore();
 
  // const currentPage = parseInt(searchParams.get("page") || "1", 10);  // Default to page 1 if not present
  //const initialSearchQuery = searchParams.get("search") || "";  // Default to empty search query
  //const initialType = searchParams.get("type") || null;  // Default to null if type not selected
 
  const offset = (currentPage - 1) * pageSize;
 
        // Fetch Paginated Data
        const { data: paginatedData, isLoading: isPaginatedLoading } = useQuery({
          queryKey: ["paginatedPokemon", currentPage, pageSize],
          queryFn: () => fetchPaginatedPokemon(pageSize, offset),
      });
   
      // Fetch Filtered Data
      const { data: filteredData, isLoading: isFilteredLoading } = useQuery({
          queryKey: ["filteredPokemon", selectedType, searchQueryForFetch],
          queryFn: () => fetchFilteredPokemon(selectedType, searchQueryForFetch),
          enabled: !!selectedType || !!searchQueryForFetch, // Run only if filter or search is applied
      });


  return (
    <div>
        <h1>Pokémon</h1>
        <SearchFilter />
        <PokemonTable data={filteredData || paginatedData?.results || []} isLoading={isPaginatedLoading || isFilteredLoading} filteredData={filteredData} paginatedData={paginatedData}/>
        <PokemonDrawer />
    </div>
  );
} 
