import React from 'react'

export default function PokemonDetail({params}:{
  params : { pokemonid: string}
}) {
  return (
    <div>Pokemon {params.pokemonid}</div>
  )
}
