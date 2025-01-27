'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './components/page'; 

const queryClient = new QueryClient();

export default function Home() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    </div>
  );
} 
