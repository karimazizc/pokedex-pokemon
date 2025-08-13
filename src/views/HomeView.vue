<template>
  <link rel="stylesheet" href="/pokedex-pokemon/src/css/HomeView.css">
  <div class="container-fluid py-4 background-gray">
    <!-- Search Section -->
    <div class="row justify-content-center mb-5">
      <div class="col-md-8 col-lg-6">
        <div class="text-center background-gray">
          <router-link to="/" style="text-decoration: none;">
            <h1 class="pokemon-explorer mb-3">Pokémon Explorer</h1>
          </router-link>
          <div class="input-group background-gray">
            <input
              type="text"
              class="form-control form-control-lg"
                placeholder="Search Pokémon..."
          
              v-model="searchQuery"
              @input="handleSearch"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="row justify-content-center">
      <div class="col-auto">
        <div class="d-flex flex-column text-center">
          <p class="pokemon-explorer">Loading Pokémon...</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="row justify-content-center">
      <div class="col-md-8">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Error!</h4>
          <p>{{ error }}</p>
          <button @click="retryFetch" class="btn btn-outline-danger">Try Again</button>
        </div>
      </div>
    </div>

    <!-- Pokemon Grid -->
    <div class='container'style="margin-left:1.25rem; margin-right:1.25rem;">
    <div
      v-if="!loading && !error"
      class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-5 row-cols-xxl-5 justify-content-center"
    >
      <div v-for="pokemon in filteredPokemon" :key="pokemon.id" class="col">
        <div
          class="card pokemon-card flip-card"
          :class="{ flipped: isCardFlipped(pokemon.id) }"
        >
          <!-- Front Side of Card -->
          <div class="flip-card-inner">
            <div
              class="flip-card-front"
              :style="{
                borderColor: getTypeColor(pokemon.types[0]),
                borderWidth: '5px',
                borderStyle: 'solid',
                borderRadius: '10px',
              }"
            >
              <div
                class="poke-card position-relative rounded-3 overflow-hidden"
                :style="{ backgroundColor: getTypeBackgroundColor(pokemon.types[0], 'dark') }"
                role="button"
                tabindex="0"
                @click="handleCardClick(pokemon)"
                @keydown.enter.prevent="handleCardClick(pokemon)"
                @keydown.space.prevent="handleCardClick(pokemon)"
                :aria-label="`Open ${pokemon.name} details`"
              >
                <!-- Top row with ID and Type badges -->
                <div class="badge-row d-flex justify-content-between align-items-start">
                  <p class="id-pill">#{{ String(pokemon.id).padStart(3, '0') }}</p>

                  <div class="d-flex type-badges-top">
                    <span
                      v-for="type in pokemon.types"
                      :key="type"
                      class="type-badge d-flex align-items-center justify-content-center"
                      :style="{ backgroundColor: getTypeColor(type) }"
                      :title="type.charAt(0).toUpperCase() + type.slice(1)"
                    >
                      <img
                        :src="getTypeIconPath(type)"
                        :alt="type + ' icon'"
                        class="type-icon-only"
                        @error="handleIconError"
                        loading="lazy"
                      />
                    </span>
                  </div>
                </div>

                <!-- Image area (centered) -->
                <div class="pokemon-image-wrapper d-flex align-items-center justify-content-center">
                  <img
                    :src="pokemon.image"
                    :alt="pokemon.name"
                    class="pokemon-image"
                    @error="handleImageError"
                    loading="lazy"
                    draggable="false"
                  />
                </div>
              </div>

              <div
                class="card-body"
                :style="{ backgroundColor: getTypeBackgroundColor(pokemon.types[0], 'light') }"
                @click="handleCardClick(pokemon)"
              >
                <!-- Pokemon Name -->
                <div class="mb-2">
                  <h5 class="card-title text-center font-pokemon-solid capitalize">
                    {{ pokemon.name }}
                  </h5>
                </div>

                <!-- HP Bar -->
                <div class="hp-bar-container mb-3">
                  <div class="hp-bar-background">
                    <div
                      class="hp-bar-fill"
                      :style="{
                        width: `${Math.min((pokemon.stats.hp / 255) * 100, 100)}%`,
                        backgroundColor: getHPBarColor(pokemon.stats.hp),
                      }"
                    ></div>
                  </div>
                  <div class="hp-bar-labels">
                    <span class="hp-current">{{ pokemon.stats.hp }}</span>
                    <span class="hp-max">/ 255 HP</span>
                  </div>
                </div>

                <!-- Battle Stats -->
                <div class="battle-stats">
                  <div class="stat-item">
                    <span class="stat-label">ATK</span>
                    <span class="stat-value">{{ pokemon.stats.attack }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">DEF</span>
                    <span class="stat-value">{{ pokemon.stats.defense }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">SPD</span>
                    <span class="stat-value">{{ pokemon.stats.speed }}</span>
                  </div>
                </div>

                <!-- parent -->
                <div class="small d-flex flex-row gap-2 text-center justify-content-center">
                  <div class="stat d-flex flex-column" style="min-width: 0; max-width: 120px;">
                    <p class="stat-label-hw mb-0">Height</p>
                    <span class="text-white d-block text-truncate" title="{{ formatHeight(pokemon.height) }}">
                      {{ formatHeight(pokemon.height) }}
                    </span>
                  </div>

                  <div class="stat d-flex flex-column" style="min-width: 0; max-width: 120px;">
                    <p class="stat-label-hw mb-0">Weight</p>
                    <span class="text-white d-block text-truncate" title="{{ formatWeight(pokemon.weight) }}">
                      {{ formatWeight(pokemon.weight) }}
                    </span>
                  </div>
                </div>


                <!-- Edit Badge -->
                <div v-if="pokemon.isEdited" class="position-absolute bottom-0 start-1">
                  <span class="text-white fst-italic rounded-1" style="font-size: 12px;">(Edited)</span>
                </div>
              </div>
            </div>

            <!-- Back Side of Card -->
            <div
              class="flip-card-back flex items-center justify-center bg-gray-100"
              @click="handleFlipBack(pokemon, $event)"
            >
              <div class="pokemon-card" @click="handleFlipBack(pokemon, $event)">
                <!-- Card Border -->
                <div class="card-border rounded-2" @click="handleFlipBack(pokemon, $event)">
                  <!-- Main Background -->
                  <div class="card-background" @click="handleFlipBack(pokemon, $event)">
                    <!-- Top Pokemon Logo -->
                    <div class="pokemon-logo-top">
                      <span class="pokemon-text">Pokémon</span>
                    </div>

                    <!-- Central Pokeball Area -->
                    <div class="pokeball-container" @click="handleFlipBack(pokemon, $event)">
                      <div class="energy-swirl">
                        <div class="swirl-ring ring-1"></div>
                        <div class="swirl-ring ring-2"></div>
                        <div class="swirl-ring ring-3"></div>
                        <div class="swirl-ring ring-4"></div>
                      </div>
                      <!-- Pokeball -->
                      <div class="pokeball">
                        <div class="pokeball-top"></div>
                        <div class="pokeball-middle">
                          <div class="pokeball-center">
                            <div class="pokeball-inner-circle"></div>
                          </div>
                        </div>
                        <div class="pokeball-bottom"></div>
                      </div>
                    </div>

                    <!-- Bottom Pokemon Logo (upside down) -->
                    <div class="pokemon-logo-bottom">
                      <span class="pokemon-text-bottom" @click="handleFlipBack(pokemon, $event)"
                        >Pokémon</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Flip Card Button (appears on hover, only on front) -->
          <div class="flip-card-button-container" v-show="!isCardFlipped(pokemon.id)">
            <button
              class="flip-card-button"
              @click="handleFlip(pokemon, $event)"
              @mousedown.stop
              @mouseup.stop
              title="Flip Card"
            >
              Flip
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    <!-- No Results -->
    <div
      v-if="!loading && !error && filteredPokemon.length === 0"
      class="row justify-content-center"
    >
      <div class="col-md-6 text-center">
        <div class="card background-gray" style="border-color: transparent;">
          <div class="card-body">
            <h5 class="card-title">No Pokémon Found</h5>
            <p class="text-white">Try adjusting your search criteria.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

/** * HomeView Component * * Main view component for displaying Pokemon cards in a grid layout *
Features: * - Search functionality * - Card flip animations (front/back side) * - Loading states and
error handling * - Dynamic type-based styling * - Navigation to Pokemon detail view */
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePokemonStore } from '../stores/pokemon'

// Composables
const router = useRouter()
const pokemonStore = usePokemonStore()

// Reactive data
const filteredPokemon = computed(() => pokemonStore.filteredPokemon)
const loading = computed(() => pokemonStore.loading)
const error = computed(() => pokemonStore.error)
const searchQuery = computed({
  get: () => pokemonStore.searchQuery,
  set: (value) => pokemonStore.setSearchQuery(value),
})

// State for card flips
const flippedCards = ref(new Set())

// Event handlers
/**
 * Handles search input changes
 * @param {Event} event - Input change event
 */
const handleSearch = (event) => {
  pokemonStore.setSearchQuery(event.target.value)
}

/**
 * Handles card click to navigate to detail view
 * Only works when card is on front side
 * @param {Object} pokemon - Pokemon data object
 */
const handleCardClick = (pokemon) => {
  // Only allow navigation to detail if card is not flipped (front side)
  if (!isCardFlipped(pokemon.id)) {
    goToPokemonDetail(pokemon)
  }
}

/**
 * Navigates to Pokemon detail page
 * @param {Object} pokemon - Pokemon data object
 */
const goToPokemonDetail = (pokemon) => {
  pokemonStore.setSelectedPokemon(pokemon)
  router.push(`/pokemon/${pokemon.id}`)
}

/**
 * Handles flipping card to back side
 * @param {Object} pokemon - Pokemon data object
 * @param {Event} event - Click event
 */
const handleFlip = (pokemon, event) => {
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  const cardId = pokemon.id
  const newFlippedCards = new Set(flippedCards.value)
  newFlippedCards.add(cardId)
  flippedCards.value = newFlippedCards
}

/**
 * Handles flipping card back to front side
 * @param {Object} pokemon - Pokemon data object
 * @param {Event} event - Click event
 */
const handleFlipBack = (pokemon, event) => {
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  const cardId = pokemon.id
  const newFlippedCards = new Set(flippedCards.value)
  newFlippedCards.delete(cardId)
  flippedCards.value = newFlippedCards
}

/**
 * Checks if a Pokemon card is currently flipped
 * @param {number} pokemonId - Pokemon ID
 * @returns {boolean} True if card is flipped
 */
const isCardFlipped = (pokemonId) => {
  return flippedCards.value.has(pokemonId)
}

/**
 * Retries fetching Pokemon data on error
 */
const retryFetch = () => {
  pokemonStore.fetchPokemonList()
}

// Formatting utilities
/**
 * Formats Pokemon height from decimeters to meters
 * @param {number} height - Height in decimeters
 * @returns {string} Formatted height string
 */
const formatHeight = (height) => {
  return `${(height / 10).toFixed(1)} m`
}

/**
 * Formats Pokemon weight from hectograms to kilograms
 * @param {number} weight - Weight in hectograms
 * @returns {string} Formatted weight string
 */
const formatWeight = (weight) => {
  return `${(weight / 10).toFixed(1)} kg`
}

// Type and color utilities
/**
 * Gets the color associated with a Pokemon type
 * @param {string} type - Pokemon type name
 * @returns {string} Hex color code
 */
const getTypeColor = (type) => {
  const typeColors = {
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#ADD8E6',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
  }
  return typeColors[type] || '#6C757D'
}

/**
 * Gets background colors based on type with different brightness levels
 * @param {string} type - Pokemon type name
 * @param {string} variant - Color variant ('dark', 'light', or 'normal')
 * @returns {string} RGBA color string
 */
const getTypeBackgroundColor = (type, variant = 'normal') => {
  const baseColors = {
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#ADD8E6',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
  }

  const baseColor = baseColors[type] || '#6C757D'

  // Convert hex to RGB
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  if (variant === 'dark') {
    // Darker version for image background
    return `rgba(${Math.floor(r * 0.35)}, ${Math.floor(g * 0.35)}, ${Math.floor(b * 0.35)}, 0.9)`
  } else if (variant === 'light') {
    // Lighter version for card body
    return `rgba(${Math.floor(r * 0.65)}, ${Math.floor(g * 0.65)}, ${Math.floor(b * 0.65)}, 0.8)`
  }

  return baseColor
}

/**
 * Gets the path to a type icon
 * @param {string} type - Pokemon type name
 * @returns {string} Icon file path
 */
const getTypeIconPath = (type) => {
  return `${import.meta.env.BASE_URL}icons/${type}.svg`
}

/**
 * Gets HP bar color based on HP value
 * @param {number} hp - Pokemon HP value
 * @returns {string} Hex color code
 */
const getHPBarColor = (hp) => {
  const percentage = (hp / 255) * 100
  if (percentage > 70) return '#4ade80' // Green for high HP
  if (percentage > 40) return '#fbbf24' // Yellow for medium HP
  if (percentage > 20) return '#fb923c' // Orange for low HP
  return '#ef4444' // Red for very low HP
}

// Error handlers
/**
 * Handles type icon loading errors
 * @param {Event} event - Error event
 */
const handleIconError = (event) => {
  event.target.style.display = 'none'
}

/**
 * Handles Pokemon image loading errors
 * @param {Event} event - Error event
 */
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150x150?text=No+Image'
}

// Lifecycle
onMounted(() => {
  if (pokemonStore.pokemonList.length === 0) {
    pokemonStore.fetchPokemonList()
  }
})
</script>



