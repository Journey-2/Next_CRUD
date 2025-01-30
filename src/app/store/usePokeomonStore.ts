import { create } from "zustand";
 
export type Pokemon = {
    id: number;
    name: string;
    sprite: string;
    types: string[];
    totalStats: number;
  };
 
export type PaginatedPokemonResponse = {
    results: Pokemon[];
    total: number;
  };
 
export type Stat = {
    base_stat: number;
    stat: { name: string };
  };
 
export type PokemonDetails = {
    id: number;
    name: string;
    height: number;
    weight: number;
    stats: { name: string; baseStat: number }[];
    totalStats: number;
    types: string[];
    description: string[];
    sprite: string;
    color: string;
    hatch_counter: number;
    capture_rate: number;
  };
 
type PokemonState = {
    currentPage: number;
    searchQuery: string;
    searchQueryForFetch: string;
    selectedPokemon: any | null;
    selectedType: string | null;
    pageSize: number;
    drawerVisible : boolean;
 
    setSearchQuery: (query: string) => void;
    setSelectedType: (type: string | null) => void;
    setSelectedPokemon: (pokemon: any | null) => void;
    setPageSize: (size: number) => void;
    setDrawerVisible: (toggle: boolean) => void;
    setSearchQueryForFetch: (text: string) => void;
}
 
export const usePokemonStore = create<PokemonState>(set => ({
    currentPage: 1,
    searchQuery: "",
    searchQueryForFetch: "",
    selectedType: null,
    selectedPokemon: null,
    pageSize: 20,
    drawerVisible: false,
 
    setSearchQuery: query => set({ searchQuery: query }),
    setSelectedType: type => set({ selectedType: type }),
    setSelectedPokemon: pokemon => set({ selectedPokemon: pokemon }),
    setPageSize: size => set({ pageSize: size }),
    setDrawerVisible: visible => set({ drawerVisible: visible }),
    setSearchQueryForFetch: text => set({ searchQueryForFetch: text})
}))