<template>
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
    <div class='container'>
    <div
      v-if="!loading && !error"
      class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-5 row-cols-xxl-5 justify-content-center mobile-center"
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



<style scoped>
.pokemon-card {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  position: relative;
}

/* Flip Card Styles */
.flip-card {
  background-color: transparent;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.flip-card-front {
  background-color: #374151;
}

.flip-card-back {
  color: white;
  transform: rotateY(180deg);
  cursor: pointer; /* Make it clear the back is clickable */
}

.card-back-content {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 12px;
  border: 3px solid;
  border-color: inherit;
}

/* Back side stat styles */
.stat-row-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label-back {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  min-width: 35px;
  text-align: left;
}

.stat-bar-back-container {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.stat-bar-back {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%
  );
  background-size: 4px 4px;
}

.stat-value-back {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  min-width: 30px;
  text-align: right;
}

/* Flip Card Button Container - only appears on front side */
.flip-card-button-container {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 1000;
  pointer-events: none;
}

.pokemon-card:not(.flipped):hover .flip-card-button-container {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.flip-card-button {
  background: linear-gradient(135deg, #ffcb05 0%, #71a24b 100%);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 9999;
  position: relative;
}

.flip-card-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #71a24b 0%, #ffcb05 100%);
}

.pokemon-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.1);
}

.pokemon-card:not(.flipped):hover {
  transform: translateY(-8px) scale(1.02);
}

.pokemon-card.flipped:hover {
  transform: translateY(-4px) scale(1.01);
}

.pokemon-card:hover::before {
  opacity: 0.1;
}

.pokemon-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.card-body {
  position: relative;
  max-height: 80%;
  height: 50%;
  z-index: 2;
}

/* Type badges in top right corner */
.type-badges-top {
  display: flex;
  gap: 0.25rem;
}

.type-badge-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  margin-top: 4px;
  margin-right: 4px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.type-badge-icon:hover {
  transform: translateY(-2px) scale(1.15);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 9999;
}

/* Tooltip on hover */
.type-badge-icon:hover::after {
  content: attr(title);
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.375rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  z-index: 999999;
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease;
}

.type-badge-icon:hover::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(0, 0, 0, 0.8);
  z-index: 99999;
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.type-icon-only {
  width: 18px;
  height: 18px;
  /* Removed the filter that was making icons invisible */
  object-fit: contain;
}

/* HP Bar Styles */
.hp-bar-container {
  position: relative;
  max-width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.hp-bar-background {
  width: 80%;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0 auto;
}

.hp-bar-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 4px;
  position: relative;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%
  );
  background-size: 8px 8px;
  animation: hp-bar-shine 2s linear infinite;
}

@keyframes hp-bar-shine {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 16px 0;
  }
}

.hp-bar-labels {
  display: flex;
  font-size: 0.75rem;
}

.hp-current {
  font-weight: 600;
  color: #e5e7eb;
}

.hp-max {
  color: #9ca3af;
}

.pokemon-card:hover .hp-bar-fill {
  transform: scaleX(1.02);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

/* Battle Stats Styles */
.battle-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: -0.;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
}
.stat-label-hw {
  color: #9ca3af;
  
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e5e7eb;
  min-width: 40px;
  margin-top: -5px;
  /* background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  
  border: 1px solid rgba(255, 255, 255, 0.2); */
}

.pokemon-card:hover{
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

/* Legacy type badge styles for backwards compatibility */
.type-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
  display: inline-block;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.type-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.type-icon {
  height: 20px;
  width: 20px;
}

.type-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.spinner-border {
  border-width: 0.3em;
}

.font-pokemon-hollow {
  font-family: 'Pokemon Hollow', 'Arial', sans-serif;
  letter-spacing: 0.05em;
  color: var(--pokemon-yellow, #ffcb05);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.font-pokemon-hollow:hover {
  color: #ffd700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
}

.font-pokemon-solid {
  font-family: 'Pokemon Solid', 'Arial', sans-serif;
  letter-spacing: 0.1em;
  transition: color 0.2s ease;
  -webkit-text-stroke: 0.5px black; /* Add border to text for webkit browsers */
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000; /* Text border effect for all browsers */
}

.pokemon-card:hover .font-pokemon-solid {
  color: #ffcb05;
  -webkit-text-stroke: 0.5px #007bff;
}

/* Add glow effect to card on hover based on primary type */
.pokemon-card:hover {
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.1),
    0 0 20px var(--type-glow, rgba(0, 0, 0, 0.1));
}

/* Type-specific glow effects */
.pokemon-card[style*='borderColor: #F08030']:hover {
  /* Fire */
  --type-glow: rgba(240, 128, 48, 0.3);
}

.pokemon-card[style*='borderColor: #6890F0']:hover {
  /* Water */
  --type-glow: rgba(104, 144, 240, 0.3);
}

.pokemon-card[style*='borderColor: #78C850']:hover {
  /* Grass */
  --type-glow: rgba(120, 200, 80, 0.3);
}

.pokemon-card[style*='borderColor: #F8D030']:hover {
  /* Electric */
  --type-glow: rgba(248, 208, 48, 0.3);
}

/* Pokemon Image Circular Shadow */
.pokemon-image-wrapper {
  position: relative;
  width: 140px;

  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top: 0.25rem;   /* visual breathing room from badges */
  z-index: 1;
  margin: 0 auto; /* Center the wrapper itself */
}

.pokemon-image-wrapper::before {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 0.1) 70%,
    transparent 100%
  );
  border-radius: 50%;
  z-index: 1;
  transform: translateY(10px);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) translateY(10px);
}

.pokemon-image {
  position: relative;
  z-index: 2;
  max-width: 120px;
  max-height: 300px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
  transition: transform 0.3s ease;
  display: block;
  margin: 0 auto;
}

.shiny-pokemon {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))
    hue-rotate(10deg) brightness(1.1) saturate(1.2);
  animation: shinyGlow 3s ease-in-out infinite alternate;
}

@keyframes shinyGlow {
  0% {
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))
      hue-rotate(0deg) brightness(1.1) saturate(1.2);
  }
  50% {
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 25px rgba(255, 215, 0, 1))
      hue-rotate(5deg) brightness(1.15) saturate(1.3);
  }
  100% {
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))
      hue-rotate(10deg) brightness(1.2) saturate(1.4);
  }
}

.pokemon-card:hover .pokemon-image {
  transform: scale(1.1) translateY(-5px);
}

.pokemon-card:hover .shiny-pokemon {
  transform: scale(1.1) translateY(-5px);
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 35px rgba(255, 215, 0, 1))
    hue-rotate(15deg) brightness(1.25) saturate(1.5);
}

/* Badge styling improvements */
.badge {
  font-size: 0.8rem;
}

.card-title {
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pokemon-card:hover {
    transform: translateY(-4px) scale(1.01);
  }

  .type-badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.7rem;
  }
}

.pokemon-explorer {
  color: #ffcb05;
  -webkit-text-stroke: 2px #007bff;
  font-family: 'Pokemon Solid', sans-serif;
  text-shadow: none;
  letter-spacing: 2px;
  font-size: 30px;
  line-height: calc(2 / 1.5);
}

.pokemon-card {
  width: 250px;
  height: 350px;
  perspective: 1000px;
}

.input-group{
  max-width: 100%;
  text-align: center;
}
.form-control{
  background-color: oklch(37.3% 0.034 259.733);
  width: 50%;
  border-radius: 1rem;
}
.pokemon-grid{
  display: grid;
  margin: 0 
}

.card-border {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #3730a3 25%,
    #1e40af 50%,
    #3730a3 75%,
    #1e3a8a 100%
  );
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.card-background {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #4338ca 0%, #3730a3 30%, #1e40af 60%, #1e3a8a 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.pokemon-logo-top {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.pokemon-text {
  font-family: 'Pokemon Hollow', sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: #fbbf24;
  text-shadow:
    2px 2px 0 #1e40af,
    -1px -1px 0 #1e40af,
    1px -1px 0 #1e40af,
    -1px 1px 0 #1e40af;
  letter-spacing: 1px;
}

.pokemon-logo-bottom {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  z-index: 10;
}

.pokemon-text-bottom {
  font-family: 'Pokemon Hollow', sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: #fbbf24;
  text-shadow:
    2px 2px 0 #1e40af,
    -1px -1px 0 #1e40af,
    1px -1px 0 #1e40af,
    -1px 1px 0 #1e40af;
  letter-spacing: 1px;
}

.pokeball-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
}

.energy-swirl {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: rotate 8s linear infinite;
}

.swirl-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-right-color: rgba(255, 255, 255, 0.6);
}

.ring-1 {
  width: 140px;
  height: 140px;
  top: 0;
  left: 0;
  animation: rotate 4s linear infinite;
}

.ring-2 {
  width: 110px;
  height: 110px;
  top: 15px;
  left: 15px;
  animation: rotate 6s linear infinite reverse;
}

.ring-3 {
  width: 80px;
  height: 80px;
  top: 30px;
  left: 30px;
  animation: rotate 5s linear infinite;
}

.ring-4 {
  width: 50px;
  height: 50px;
  top: 45px;
  left: 45px;
  animation: rotate 7s linear infinite reverse;
}

.pokeball {
  position: absolute;
  width: 80px;
  height: 80px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.pokeball-top {
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.pokeball-bottom {
  width: 100%;
  height: 50%;
  background: linear-gradient(0deg, #f3f4f6 0%, #e5e7eb 100%);
}

.pokeball-middle {
  position: absolute;
  width: 100%;
  height: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #374151 0%, #1f2937 50%, #374151 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokeball-center {
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #f9fafb 0%, #e5e7eb 100%);
  border-radius: 50%;
  border: 2px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokeball-inner-circle {
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #d1d5db 0%, #9ca3af 100%);
  border-radius: 50%;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Add some background texture */
.card-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
  pointer-events: none;
}
.container-fluid{
  padding-block: calc(1 * 4)
} 

.background-gray{
  background-color: oklch(21% 0.034 264.665);
}



/* Styles (put in the component <style scoped> or a CSS file) */
.poke-card {
  height: 400px;               
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  padding: 0.75rem;              
  display: flex;
  flex-direction: column;
  justify-content: center;
}


/* top badges row (absolute) */
.badge-row {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

/* ID pill */
.id-pill {
  padding: 0.18rem 0.5rem;
  background: rgba(0,0,0,0.18);
  color: #fff;
  border-radius: 999px;
  font-size: 0.70rem;
  line-height: 1;
  text-shadow: 0 1px 0 rgba(0,0,0,0.35);
  backdrop-filter: blur(4px); /* subtle frosted look on supporting browsers */
}

/* type badges */

.type-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  overflow: hidden;
  padding: 4px;
}

/* small icon inside badge */
.type-icon-only {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}


/* pokemon image */
.pokemon-image {
  max-height: 130px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  transition: transform .18s ease;
}

/* subtle pop on hover */
.poke-card:hover .pokemon-image,
.poke-card:focus .pokemon-image {
  transform: scale(1.03);
}

 /* Add these new styles */
  @media (max-width: 768px) {
    .mobile-center {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    padding: 0 15px;
    margin-top: -3rem;
    }

    .pokemon-card {
    margin: 0 auto;
    width: 100%;
    max-width: 300px; 
    }
    
    .col {
    padding: 0 10px;
    }
  }
</style>