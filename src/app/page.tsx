'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Pokemon from './pokemons/page'; 

const queryClient = new QueryClient();

export default function Home() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Pokemon />
      </QueryClientProvider>
    </div>
  );
}
