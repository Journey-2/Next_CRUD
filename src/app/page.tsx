'use client';

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonList } from "../../utils/pokemonAPI";
import { debounce } from "lodash";
//import { useRouter, useSearchParams } from "next/navigation";

const HomePage: React.FC = () => {

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
/*
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (currentPage - 1) * limit;
*/

  const debouncedSearch = useMemo(
    () => 
      debounce((query: string) => {
        setSearchQuery(query);
        setOffset(0);
    }, 500), []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  }
  const limit = 20;
  const { data, isLoading, error } = useQuery({ 
    queryKey: ["pokeList", offset, searchQuery],
    queryFn: () => fetchPokemonList(limit, offset, searchQuery),
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); 
    };
  }, [debouncedSearch]);

/*
  const handlePageChange = (newPage: number) => { 
    router.push(`/?page=${newPage}`);
  }
*/
  if (isLoading) return <p>Loading Pokemon...</p>
  if (error) return <p>Something went wrong.</p>

  return (
    <div>
      <h1>Pokemon List</h1>
      <input type = "text" placeholder="Search Pokemon by name" value={searchQuery} onChange={handleSearchChange} />
      <ul>
        {data.results.map((pokemon: { name: string; id: number; sprite: string; totalStats: number, cry: string; types: string[] }, index: number) => (
          <li key={index}>
            <p>{pokemon.id}</p>
            <img src={pokemon.sprite} alt={`${pokemon.name} sprite`} />
            <p>{pokemon.name}</p>
            <p>{pokemon.types.join(", ")}</p>
            <p>{pokemon.totalStats}</p>
            <audio controls>
              <source src={pokemon.cry} type="audio/ogg" />
              Browser does not support ogg file
            </audio>
          </li>
        ))}  
      </ul>
      
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button
          onClick={() => setOffset(prev => Math.max(prev - 20, 0))}
          disabled={offset === 0}
          style={{ marginRight: "10px" }}
        >Previous</button>
        
        <button
          onClick={() => setOffset(prev => prev + 20)}
          disabled={data.results.length < limit} // Disable if no more Pokémon
        >Next</button>
      </div>
    </div>
  )
}

export default HomePage;

































/*
export default function Page() {
  return <h1>The first page (& the only one for me ig)</h1>
}

import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
*/