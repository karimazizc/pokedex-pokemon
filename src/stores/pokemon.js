import { defineStore } from 'pinia'
import {ref, computed } from 'vue'

export const usePokemonStore = defineStore('pokemon', () => {

    // state
    const pokemonList = ref([])
    const loading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedPokemon = ref(null)

    // getters
    const filteredPokemon = computed(() =>{
        if (!searchQuery.value){
            return pokemonList.value
        }
        return pokemonList.value.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })

    const getPokemonById = computed(() => {
        return(id) => pokemonList.value.find(pokemon => pokemon.id === id)
    })

    // action
    async function fetchPokemonList() {
        loading.value = true
        error.value = null
        
        try {
            // fetch the list of first 100 pokemon to comply with fair usage policy

            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100')
            const data = await response.json()


            const pokemonPromises = data.results.map(async(pokemon, index) =>{
                const detailResponse = await fetch(pokemon.url)
                const detail = await detailResponse.json()
                
                return {
                    id: detail.id,
                    name: detail.name,
                    url: pokemon.url,
                    image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
                    types: detail.types.map((type) => type.type.name),
                    height: detail.height,
                    weight: detail.weight,
                    abilities: detail.abilities.map((ability) => ability.ability.name),
                    stats: {
                        hp: detail.stats[0].base_stat,
                        attack: detail.stats[1].base_stat,
                        defense: detail.stats[2].base_stat,
                        specialAttack: detail.stats[3].base_stat,
                        specialDefense: detail.stats[4].base_stat,
                        speed: detail.stats[5].base_stat
                    }
                }
            })

            pokemonList.value = await Promise.all(pokemonPromises)
            } catch (err){
                error.value = 'Failed to fetch Pokemon data'
                console.error('Error fetching Pokemon: ', err)
            } finally {
                loading.value = false
            }
        }

        function setSearchQuery(query){
            searchQuery.value = query
        }

        function setSelectedPokemon(pokemon){
            selectedPokemon.value = pokemon
        }
        
        function updatePokemon(id, updatedData) {
            const pokemonIndex = pokemonList.value.findIndex(p => p.id === id)
            if (pokemonIndex !== -1) {
            const pokemon = pokemonList.value[pokemonIndex]
            
            // Mark as edited and store original data if not already edited
            if (!pokemon.isEdited) {
                pokemon.isEdited = true
                pokemon.editedData = {}
            }
            
            // Update the edited fields
            Object.keys(updatedData).forEach(key => {
                if (key in pokemon && updatedData[key] !== undefined) {
                // Store original value if not already stored
                if (pokemon.editedData && !(key in pokemon.editedData)) {
                    pokemon.editedData[key] = pokemon[key]
                }
                // Update current value
                pokemon[key] = updatedData[key]
                }
            })
            
            pokemonList.value[pokemonIndex] = { ...pokemon }
            }
        }

        async function fetchPokemonDetail(id) {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                const data = await response.json()
                
                // Fetch species data
                const speciesResponse = await fetch(data.species.url)
                const speciesData = await speciesResponse.json()

                return {
                    ...data,
                    species: speciesData
                }
            } catch (err) {
                console.error('Error fetching detailed Pokemon data:', err)
                throw err
            }
        }

        return {
            // State
            pokemonList,
            loading,
            error,
            searchQuery,
            selectedPokemon,

            // Getters
            filteredPokemon,
            getPokemonById,

            // Actions
            fetchPokemonList,
            setSearchQuery,
            setSelectedPokemon,
            updatePokemon,
            fetchPokemonDetail
        }
        
})