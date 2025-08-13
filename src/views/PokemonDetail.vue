<template>
  <div class="pokemon-detail-container min-h-screen py-4" style="background-color: #111827;">
    <div class="container-fluid px-4">
      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 16rem;">
        <div class="text-center">
          <h1 class="pokemon-font display-4">Loading Pokemon Details...</h1>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="d-flex justify-content-center">
        <div class="col-md-8">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error!</h4>
            <p>{{ error }}</p>
            <button @click="fetchPokemonDetails" class="btn btn-outline-danger">Try Again</button>
          </div>
        </div>
      </div>

      <!-- Pokemon Details -->
      <div v-if="pokemonDetail && !loading && !error">
        <!-- Header with Back Button -->
        <div class="mb-4">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
            <button @click="goBack" class="btn text-white d-flex align-items-center gap-2">
              <svg
                style="margin-top: 0.25rem;"
                width="16"
                height="16"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Back to Pokemon List
            </button>
            <button
              @click="openEditModal"
              class="btn btn-primary text-white d-flex align-items-center gap-2 w-sm-auto"
            >
              <svg
                style="margin-top: 0.25rem;"
                width="16"
                height="16"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1464 1.14645L3.71579 8.57707C3.62271 8.67015 3.55995 8.78704 3.53852 8.91424L3.04241 11.2923C2.94251 11.6994 3.3006 12.0575 3.70769 11.9576L6.08579 11.4615C6.21299 11.4401 6.32988 11.3773 6.42296 11.2842L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42296 9.28558L11.5 2.20711L12.7929 3.5L5.71579 10.5771L4.28558 10.7929L4.42296 9.28558Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Edit Pokemon
            </button>
          </div>
        </div>

        <!-- Three Column CSS Grid Layout -->
        <div class="pokemon-grid-layout">
          <!-- Left Column - Pokemon Image -->
          <div class="pokemon-card-section">
            <div
              class="pokemon-image-card rounded-4 p-4 h-100"
              style="background-color: #1f2937;"
              :style="{
                borderColor: getTypeColor(pokemonDetail.types[0]),
                borderWidth: '3px',
                borderStyle: 'solid',
              }"
            >
              <div class="text-center h-100 d-flex flex-column justify-content-between">
                <div>
                  <h1 class="pokemon-font mb-2 text-capitalize h2">
                    {{ pokemonStore.getPokemonById(pokemonId)?.name || pokemonDetail.name }}
                  </h1>
                  <p class="mb-3" style="color: #9ca3af;">#{{ String(pokemonDetail.id).padStart(3, '0') }}</p>

                  <!-- Type Badges -->
                  <div class="type-badges mb-4">
                    <span
                      v-for="type in pokemonDetail.types"
                      :key="type"
                      class="type-badge me-1 mb-2 me-sm-2"
                      :style="{
                        backgroundColor: getTypeColor(type),
                        color: getTypeTextColor(type),
                      }"
                    >
                      <img :src="getTypeIconPath(type)" :alt="type" class="type-icon me-1" />
                      {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                    </span>
                  </div>
                </div>

                <!-- Pokemon Image with Shiny Toggle -->
                <div class="pokemon-image-container position-relative flex-grow-1 d-flex align-items-center justify-content-center">
                  <div class="pokemon-image-wrapper-compact">
                    <img
                      :src="showShiny ? pokemonDetail.sprites.shiny : pokemonDetail.sprites.normal"
                      :alt="pokemonDetail.name"
                      class="pokemon-image-compact"
                      @mouseenter="showShiny = true"
                      @mouseleave="showShiny = false"
                      @error="handleImageError"
                    />
                  </div>
                </div>

                <div class="shiny-indicator mt-2">
                  <small style="color: #9ca3af;">{{ showShiny ? '✨ Shiny' : 'Normal' }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Middle Column - Basic Info + Stats -->
          <div class="basic-info-section d-flex flex-column gap-4">
            <!-- Basic Info -->
            <div class="rounded-4 p-4" style="background-color: #1f2937; flex-shrink: 0;">
              <h3 class="pokemon-font">Basic Information</h3>
              <div class="row g-4">
                <div class="col-sm-6">
                  <div class="info-item-compact">
                    <label class="text-sm" style="color: #9ca3af;">Height</label>
                    <p class="text-white fw-bold">
                      {{
                        pokemonStore.getPokemonById(pokemonId)?.height ||
                        formatHeight(pokemonDetail.height)
                      }}
                    </p>
                  </div>
                  <div class="info-item-compact">
                    <label class="text-sm" style="color: #9ca3af;">Weight</label>
                    <p class="text-white fw-bold">
                      {{
                        pokemonStore.getPokemonById(pokemonId)?.weight ||
                        formatWeight(pokemonDetail.weight)
                      }}
                    </p>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="info-item-compact">
                    <label class="text-sm" style="color: #9ca3af;">Base Experience</label>
                    <p class="text-white fw-bold small">
                      {{ pokemonDetail.baseExperience || 'Unknown' }}
                    </p>
                  </div>
                  <div class="info-item-compact mb-2">
                    <label class="text-sm" style="color: #9ca3af;">Capture Rate</label>
                    <p class="text-white fw-bold small">
                      {{ pokemonDetail.captureRate || 'Unknown' }} %
                    </p>
                  </div>
                </div>
              </div>

              <!-- Abilities and Sprite Angles -->
              <div class="row g-4">
                <!-- Abilities -->
                <div class="col-lg-6">
                  <div class="info-item-compact">
                    <label class="text-sm" style="color: #9ca3af;">Abilities</label>
                    <div class="abilities-list d-flex flex-wrap gap-2 mt-1">
                      <span
                        v-for="ability in pokemonDetail.abilities"
                        :key="ability.name"
                        class="ability-badge-compact"
                        :class="{ 'hidden-ability': ability.is_hidden }"
                      >
                        {{ ability.name.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) }}
                        {{ ability.is_hidden ? '(Hidden)' : '' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Sprite Angles -->
                <div class="col-lg-6">
                  <div class="info-item-compact">
                    <label class="text-sm" style="color: #9ca3af;">Sprite</label>
                    <div class="sprite-angles-grid mt-1">
                      <img
                        v-if="pokemonDetail.sprites?.front_normal"
                        :src="pokemonDetail.sprites.front_normal"
                        :alt="pokemonDetail.name + ' front'"
                        class="sprite-angle-image"
                        @error="handleImageError"
                      />

                      <img
                        v-if="pokemonDetail.sprites?.back_normal"
                        :src="pokemonDetail.sprites.back_normal"
                        :alt="pokemonDetail.name + ' back'"
                        class="sprite-angle-image"
                        @error="handleImageError"
                      />

                      <img
                        v-if="pokemonDetail.sprites?.front_shiny"
                        :src="pokemonDetail.sprites.front_shiny"
                        :alt="pokemonDetail.name + ' front shiny'"
                        class="sprite-angle-image"
                        @error="handleImageError"
                      />

                      <img
                        v-if="pokemonDetail.sprites?.back_shiny"
                        :src="pokemonDetail.sprites.back_shiny"
                        :alt="pokemonDetail.name + ' back shiny'"
                        class="sprite-angle-image"
                        @error="handleImageError"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Stats -->
            <div class="rounded-4 p-4 flex-fill" style="background-color: #1f2937;">
              <h3 class="pokemon-font mb-3 h5">Battle Statistics</h3>

              <!-- HP -->
              <div class="stat-row-compact mb-2">
                <div class="stat-info-compact">
                  <span class="stat-name">HP</span>
                  <span class="stat-value" style="color: #4ade80;">{{
                    pokemonStore.getPokemonById(pokemonId)?.stats?.hp || pokemonDetail.stats.hp
                  }}</span>
                </div>
                <div class="stat-bar-container-compact">
                  <div
                    class="stat-bar-compact"
                    :style="{
                      width:
                        getStatPercentage(pokemonStore.getPokemonById(pokemonId)?.stats?.hp, 255) +
                          '%' || getStatPercentage(pokemonDetail.stats.hp, 255) + '%',
                      backgroundColor: '#4ade80',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Attack -->
              <div class="stat-row-compact mb-2">
                <div class="stat-info-compact">
                  <span class="stat-name">Attack</span>
                  <span class="stat-value" style="color: #f87171;">{{
                    pokemonStore.getPokemonById(pokemonId)?.stats?.attack ||
                    pokemonDetail.stats.attack
                  }}</span>
                </div>
                <div class="stat-bar-container-compact">
                  <div
                    class="stat-bar-compact"
                    :style="{
                      width:
                        getStatPercentage(
                          pokemonStore.getPokemonById(pokemonId)?.stats?.attack,
                          200,
                        ) + '%' || getStatPercentage(pokemonDetail.stats.attack, 200) + '%',
                      backgroundColor: '#ef4444',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Defense -->
              <div class="stat-row-compact mb-2">
                <div class="stat-info-compact">
                  <span class="stat-name">Defense</span>
                  <span class="stat-value" style="color: #60a5fa;">{{
                    pokemonStore.getPokemonById(pokemonId)?.stats?.defense ||
                    pokemonDetail.stats.defense
                  }}</span>
                </div>
                <div class="stat-bar-container-compact">
                  <div
                    class="stat-bar-compact"
                    :style="{
                      width:
                        getStatPercentage(
                          pokemonStore.getPokemonById(pokemonId)?.stats?.defense,
                          250,
                        ) + '%' || getStatPercentage(pokemonDetail.stats.defense, 250) + '%',
                      backgroundColor: '#3b82f6',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Special Attack -->
              <div class="stat-row-compact mb-2">
                <div class="stat-info-compact">
                  <span class="stat-name">Sp. Attack</span>
                  <span class="stat-value" style="color: #c084fc;">{{
                    pokemonStore.getPokemonById(pokemonId)?.stats?.specialAttack ||
                    pokemonDetail.stats.specialAttack
                  }}</span>
                </div>
                <div class="stat-bar-container-compact">
                  <div
                    class="stat-bar-compact"
                    :style="{
                      width:
                        getStatPercentage(
                          pokemonStore.getPokemonById(pokemonId)?.stats?.specialAttack,
                          200,
                        ) + '%' || getStatPercentage(pokemonDetail.stats.specialAttack, 200) + '%',
                      backgroundColor: '#8b5cf6',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Special Defense -->
              <div class="stat-row-compact mb-2">
                <div class="stat-info-compact">
                  <span class="stat-name">Sp. Defense</span>
                  <span class="stat-value" style="color: #818cf8;">{{
                    pokemonStore.getPokemonById(pokemonId)?.stats?.specialDefense ||
                    pokemonDetail.stats.specialDefense
                  }}</span>
                </div>
                <div class="stat-bar-container-compact">
                  <div
                    class="stat-bar-compact"
                    :style="{
                      width:
                        getStatPercentage(
                          pokemonStore.getPokemonById(pokemonId)?.stats?.specialDefense,
                          250,
                        ) + '%' || getStatPercentage(pokemonDetail.stats.specialDefense, 250) + '%',
                      backgroundColor: '#6366f1',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Speed -->
              <div class="stat-row-compact mb-3">
                <div class="stat-info-compact">
                  <span class="stat-name">Speed</span>
                  <span class="stat-value" style="color: #facc15;">{{
                    pokemonStore.getPokemonById(pokemonId)?.stats?.speed ||
                    pokemonDetail.stats.speed
                  }}</span>
                </div>
                <div class="stat-bar-container-compact">
                  <div
                    class="stat-bar-compact"
                    :style="{
                      width:
                        getStatPercentage(
                          pokemonStore.getPokemonById(pokemonId)?.stats?.speed,
                          200,
                        ) + '%' || getStatPercentage(pokemonDetail.stats.speed, 200) + '%',
                      backgroundColor: '#fbbf24',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Total Stats -->
              <div class="stat-total-compact pt-2" style="border-top: 1px solid #374151;">
                <div class="stat-info-compact">
                  <span class="stat-name fw-bold">Total</span>
                  <span class="stat-value text-white fw-bold">{{ getTotalStats() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Moves -->
          <div class="moves-section">
            <div class="rounded-4 p-4 h-100 d-flex flex-column" style="background-color: #1f2937;">
              <h3 class="pokemon-font ">Moves & Abilities</h3>

              <!-- Move Filter Tabs -->
              <div class="move-filter-tabs-compact mb-3 d-flex flex-wrap gap-1" style="flex-shrink: 0;">
                <button
                  v-for="method in moveLearnMethods"
                  :key="method"
                  @click="selectedMoveMethod = method"
                  class="move-filter-btn-compact me-1 mb-1"
                  :class="{ active: selectedMoveMethod === method }"
                >
                  {{ formatMoveMethod(method) }}
                  <span class=" badge bg-secondary" style="font-size: 0.6rem;">{{ getMovesCount(method) }}</span>
                </button>
              </div>

              <!-- Moves Grid -->
              <div class="moves-grid-compact flex-fill">
                <div
                  v-for="move in filteredMoves"
                  :key="move.name + move.level"
                  class="move-card-compact"
                  @click="selectMove(move)"
                  :class="{ selected: selectedMove?.name === move.name }"
                >
                  <div class="move-header-compact">
                    <h5 class="move-name-compact">{{ formatMoveName(move.name) }}</h5>
                    <div class="type-badges">
                      <span
                        class="type-badge me-2 mb-2 text-white"
                        :style="{ backgroundColor: getTypeColor(move.type) }"
                      >
                        <img
                          :src="getTypeIconPath(move.type)"
                          :alt="move.type"
                          class="type-icon me-1"
                          @error="handleIconError"
                        />
                        {{ move.type }}
                      </span>
                    </div>
                  </div>
                  <div class="move-details-compact">
                    <span class="move-level-compact" v-if="move.level > 0"
                      >Lv. {{ move.level }}</span
                    >
                    <span class="move-level-compact" v-else-if="move.method === 'level-up'"
                      >Start</span
                    >
                    <span class="move-method-compact" v-else>{{
                      formatMoveMethod(move.method)
                    }}</span>
                  </div>
                  <div class="move-stats-compact" v-if="move.power || move.accuracy">
                    <span v-if="move.power" class="text-danger small"
                      >PWR: {{ move.power }}</span
                    >
                    <span v-if="move.accuracy" class="text-info small"
                      >ACC: {{ move.accuracy }}%</span
                    >
                  </div>
                </div>
              </div>

              <!-- Move Details Modal -->
              <div
                v-if="selectedMove"
                class="move-details-panel-compact mt-3 p-2 rounded" 
                style="background-color: #374151; flex-shrink: 0;"
              >
                <h4 class="text-white small fw-bold">
                  {{ formatMoveName(selectedMove.name) }}
                </h4>
                <p class="small mt-1" style="color: #d1d5db; max-height: 100%;" v-if="selectedMove.description">
                  {{ selectedMove.description }}
                </p>
                <div class="move-info-grid-compact mt-2">
                  <div v-if="selectedMove.power" class="small">
                    <strong>PWR:</strong> {{ selectedMove.power }}
                  </div>
                  <div v-if="selectedMove.accuracy" class="small">
                    <strong>ACC:</strong> {{ selectedMove.accuracy }}%
                  </div>
                  <div v-if="selectedMove.pp" class="small">
                    <strong>PP:</strong> {{ selectedMove.pp }}
                  </div>
                  <div class="small"><strong>Type:</strong> {{ selectedMove.type }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Pokemon Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="edit-modal">
          <div class="modal-header">
            <h3 class="pokemon-font">Edit {{ pokemonDetail.name }}</h3>
            <button @click="closeEditModal" class="close-btn">&times;</button>
          </div>

          <form @submit.prevent="submitEdit" class="edit-form">
            <div class="form-row">
              <div class="form-group">
                <label style="color: #d1d5db;">Name</label>
                <input v-model="editStore.form.name" type="text" class="form-input" required />
              </div>

              <div class="form-group">
                <label style="color: #d1d5db;">Height (decimeters)</label>
                <input
                  v-model.number="editStore.form.height"
                  type="number"
                  class="form-input"
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label style="color: #d1d5db;">Weight (hectograms)</label>
                <input
                  v-model.number="editStore.form.weight"
                  type="number"
                  class="form-input"
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div class="form-group">
                <label style="color: #d1d5db;">Base Experience</label>
                <input
                  v-model.number="editStore.form.baseExperience"
                  type="number"
                  class="form-input"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div class="stats-section">
              <p style="color: #d1d5db;" class="mb-3 text-uppercase">Base Stats</p>
              <div class="stats-grid">
                <div class="form-group">
                  <label style="color: #d1d5db;">HP</label>
                  <input
                    v-model.number="editStore.form.stats.hp"
                    type="number"
                    class="form-input"
                    min="1"
                    max="255"
                    required
                  />
                </div>

                <div class="form-group">
                  <label style="color: #d1d5db;">Attack</label>
                  <input
                    v-model.number="editStore.form.stats.attack"
                    type="number"
                    class="form-input"
                    min="1"
                    max="255"
                    required
                  />
                </div>

                <div class="form-group">
                  <label style="color: #d1d5db;">Defense</label>
                  <input
                    v-model.number="editStore.form.stats.defense"
                    type="number"
                    class="form-input"
                    min="1"
                    max="255"
                    required
                  />
                </div>

                <div class="form-group">
                  <label style="color: #d1d5db;">Sp. Attack</label>
                  <input
                    v-model.number="editStore.form.stats.specialAttack"
                    type="number"
                    class="form-input"
                    min="1"
                    max="255"
                    required
                  />
                </div>

                <div class="form-group">
                  <label style="color: #d1d5db;">Sp. Defense</label>
                  <input
                    v-model.number="editStore.form.stats.specialDefense"
                    type="number"
                    class="form-input"
                    min="1"
                    max="255"
                    required
                  />
                </div>

                <div class="form-group">
                  <label style="color: #d1d5db;">Speed</label>
                  <input
                    v-model.number="editStore.form.stats.speed"
                    type="number"
                    class="form-input"
                    min="1"
                    max="255"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePokemonStore } from '../stores/pokemon'
import { defineStore } from 'pinia'

// Composables
const router = useRouter()
const route = useRoute()
const pokemonStore = usePokemonStore()

// State
const pokemonDetail = ref(null)
const loading = ref(false)
const error = ref(null)
const showShiny = ref(false)
const selectedMoveMethod = ref('level-up')
const selectedMove = ref(null)
const showEditModal = ref(false)
const editFormStore = defineStore('editForm', {
  state: () => ({
    form: {
      name: '',
      height: 0,
      weight: 0,
      baseExperience: 0,
      stats: {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
      },
    },
  }),
  actions: {
    updateForm(formData) {
      this.form = { ...formData }
    },
    resetForm() {
      this.form = {
        name: '',
        height: 0,
        weight: 0,
        baseExperience: 0,
        stats: {
          hp: 0,
          attack: 0,
          defense: 0,
          specialAttack: 0,
          specialDefense: 0,
          speed: 0,
        },
      }
    },
  },
})

const editStore = editFormStore()

// Computed properties
const pokemonId = computed(() => parseInt(route.params.id))
const moveLearnMethods = computed(() => {
  if (!pokemonDetail.value?.moves) return []
  const methods = [...new Set(pokemonDetail.value.moves.map((move) => move.method))]
  return methods.sort()
})

const filteredMoves = computed(() => {
  if (!pokemonDetail.value?.moves) return []
  return pokemonDetail.value.moves
    .filter((move) => move.method === selectedMoveMethod.value)
    .sort((a, b) => {
      if (a.method === 'level-up') {
        return a.level - b.level
      }
      return a.name.localeCompare(b.name)
    })
})

// Methods
const fetchPokemonDetails = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch detailed data from API
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId.value}`)
    const data = await response.json()

    // Fetch species data for additional info
    const speciesResponse = await fetch(data.species.url)
    const speciesData = await speciesResponse.json()

    // Fetch move details
    const movePromises = data.moves.slice(0, 50).map(async (moveInfo) => {
      try {
        const moveResponse = await fetch(moveInfo.move.url)
        const moveData = await moveResponse.json()

        return {
          name: moveInfo.move.name,
          level: moveInfo.version_group_details[0]?.level_learned_at || 0,
          method: moveInfo.version_group_details[0]?.move_learn_method.name || 'unknown',
          type: moveData.type?.name || 'normal',
          power: moveData.power,
          accuracy: moveData.accuracy,
          pp: moveData.pp,
          damageClass: moveData.damage_class?.name || 'status',
          description:
            moveData.effect_entries.find((entry) => entry.language.name === 'en')?.short_effect ||
            moveData.flavor_text_entries.find((entry) => entry.language.name === 'en')
              ?.flavor_text ||
            '',
        }
      } catch (err) {
        return {
          name: moveInfo.move.name,
          level: moveInfo.version_group_details[0]?.level_learned_at || 0,
          method: moveInfo.version_group_details[0]?.move_learn_method.name || 'unknown',
          type: 'normal',
          power: null,
          accuracy: null,
        }
      }
    })

    const moves = await Promise.all(movePromises)

    pokemonDetail.value = {
      id: data.id,
      name: data.name,
      types: data.types.map((type) => type.type.name),
      height: data.height,
      weight: data.weight,
      baseExperience: data.base_experience,
      captureRate: speciesData.capture_rate,
      abilities: data.abilities.map((ability) => ({
        name: ability.ability.name,
        is_hidden: ability.is_hidden,
      })),
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        specialAttack: data.stats[3].base_stat,
        specialDefense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
      },
      sprites: {
        normal: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        shiny:
          data.sprites.other['official-artwork'].front_shiny ||
          data.sprites.front_shiny ||
          data.sprites.other['official-artwork'].front_default,
        front_normal: data.sprites.front_default,
        front_shiny: data.sprites.front_shiny,
        back_normal: data.sprites.back_default,
        back_shiny: data.sprites.back_shiny,
      },
      moves: moves,
    }
  } catch (err) {
    error.value = 'Failed to fetch Pokemon details'
    console.error('Error fetching Pokemon details:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Navigates back to the Pokemon list
 */
const goBack = () => {
  router.push('/')
}

/**
 * Toggles move selection in the moves list
 * @param {Object} move - Move object to select/deselect
 */
const selectMove = (move) => {
  selectedMove.value = selectedMove.value?.name === move.name ? null : move
}

/**
 * Gets the count of moves for a specific learning method
 * @param {string} method - Learning method (e.g., 'level-up', 'machine')
 * @returns {number} Number of moves for the method
 */
const getMovesCount = (method) => {
  if (!pokemonDetail.value?.moves) return 0
  return pokemonDetail.value.moves.filter((move) => move.method === method).length
}

// Edit functionality
/**
 * Opens the edit modal and initializes form data
 */
const openEditModal = () => {
  if (pokemonDetail.value) {
    const formData = {
      name: pokemonDetail.value.name,
      height: pokemonDetail.value.height,
      weight: pokemonDetail.value.weight,
      baseExperience: pokemonDetail.value.baseExperience || 0,
      stats: {
        hp: pokemonDetail.value.stats.hp,
        attack: pokemonDetail.value.stats.attack,
        defense: pokemonDetail.value.stats.defense,
        specialAttack: pokemonDetail.value.stats.specialAttack,
        specialDefense: pokemonDetail.value.stats.specialDefense,
        speed: pokemonDetail.value.stats.speed,
      },
    }
    editStore.updateForm(formData)
    showEditModal.value = true
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editStore.resetForm()
}

const submitEdit = () => {
  if (!pokemonDetail.value) return

  // Update the Pokemon in the store using the Pinia form data
  pokemonStore.updatePokemon(pokemonDetail.value.id, editStore.form)

  // Get updated Pokemon from store to ensure consistency
  const updatedStorePokemon = pokemonStore.getPokemonById(pokemonDetail.value.id)

  // Update local pokemonDetail to reflect changes immediately
  if (updatedStorePokemon) {
    // Merge store data with detailed data, prioritizing edited fields
    pokemonDetail.value = {
      ...pokemonDetail.value,
      name: updatedStorePokemon.name,
      height: updatedStorePokemon.height,
      weight: updatedStorePokemon.weight,
      baseExperience: updatedStorePokemon.baseExperience || pokemonDetail.value.baseExperience,
      stats: { ...updatedStorePokemon.stats },
    }
  } else {
    // Fallback to manual update if store doesn't have the Pokemon
    pokemonDetail.value = {
      ...pokemonDetail.value,
      name: editStore.form.name,
      height: editStore.form.height,
      weight: editStore.form.weight,
      baseExperience: editStore.form.baseExperience,
      stats: { ...editStore.form.stats },
    }
  }

  closeEditModal()
}

// Utility functions
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

/**
 * Formats move names by capitalizing each word and removing hyphens
 * @param {string} name - Raw move name with hyphens
 * @returns {string} Formatted move name
 */
const formatMoveName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Formats move learning method names for display
 * @param {string} method - Raw method name
 * @returns {string} Formatted method name
 */
const formatMoveMethod = (method) => {
  const methodMap = {
    'level-up': 'Level Up',
    machine: 'TM/HM',
    egg: 'Egg Move',
    tutor: 'Move Tutor',
    'stadium-surfing-pikachu': 'Special',
    'light-ball-egg': 'Special Egg',
    'colosseum-purification': 'Purification',
    'xd-shadow': 'Shadow',
    'xd-purification': 'Purification',
  }
  return methodMap[method] || method.charAt(0).toUpperCase() + method.slice(1).replace('-', ' ')
}

/**
 * Calculates stat percentage relative to maximum possible value
 * @param {number} stat - Current stat value
 * @param {number} max - Maximum possible stat value
 * @returns {number} Percentage value (0-100)
 */
const getStatPercentage = (stat, max) => {
  return Math.min((stat / max) * 100, 100)
}

/**
 * Calculates the total stats of the Pokemon
 * @returns {number} Sum of all base stats
 */
const getTotalStats = () => {
  if (!pokemonDetail.value?.stats) return 0
  const stats = pokemonDetail.value.stats
  return (
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed
  )
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
 * Gets text color for type badges based on background darkness
 * @param {string} type - Pokemon type name
 * @returns {string} Hex color code for text
 */
const getTypeTextColor = (type) => {
  const darkBackgroundTypes = [
    'fighting',
    'poison',
    'bug',
    'ghost',
    'dragon',
    'dark',
    'psychic',
    'fire',
    'water',
    'grass',
  ]
  return darkBackgroundTypes.includes(type) ? '#FFFFFF' : '#000000'
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
 * Handles Pokemon image loading errors by setting a placeholder
 * @param {Event} event - Error event
 */
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
}

/**
 * Handles icon loading errors
 * @param {Event} event - Error event
 */
const handleIconError = (event) => {
  event.target.style.display = 'none'
}

// Lifecycle
onMounted(() => {
  fetchPokemonDetails()
})

watch(
  () => route.params.id,
  () => {
    if (route.params.id) {
      fetchPokemonDetails()
    }
  },
)
</script>

<style scoped>
/* CSS Grid Layout */
.pokemon-grid-layout {
  display: grid;
  grid-template-columns: 350px 1fr 350px;
  grid-template-rows: 1fr;
  grid-template-areas: "pokemon-card basic-info moves-section";
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  max-height: 100vh;
}

.pokemon-card-section {
  grid-area: pokemon-card;
}

.basic-info-section {
  grid-area: basic-info;
}

.moves-section {
  grid-area: moves-section;
}

/* Responsive Grid */
@media (max-width: 1200px) {
  .pokemon-grid-layout {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
      "pokemon-card moves-section"
      "basic-info basic-info";
  }
}

@media (max-width: 768px) {
  .pokemon-grid-layout {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "pokemon-card"
      "basic-info"
      "moves-section";
  }
}

/* Pokemon Detail Specific Styles */
.pokemon-detail-container {
  min-height: 100vh;
}

/* Responsive image sizing */
.pokemon-image-wrapper-compact {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pokemon-image-wrapper-compact::before {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    transparent 70%
  );
  border-radius: 50%;
  z-index: 1;
  transition: all 0.3s ease;
}

.pokemon-image-compact {
  position: relative;
  z-index: 2;
  max-width: 180px;
  max-height: 180px;
  filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.5));
  transition: all 0.3s ease;
  cursor: pointer;
}

.pokemon-image-compact:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 12px 25px rgba(0, 0, 0, 0.7));
}

/* Sprite Angles Styles */
.sprite-angles-grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sprite-angle-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  transform: scale(1.5);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s ease;
  border-radius: 8px;
  padding: 0.25rem;
}

.sprite-angle-image:hover {
  transform: scale(1.7);
}

/* Compact Info Styles */
.info-item-compact {
  margin-bottom: 0.2rem;
}

.info-item-compact label {
  display: block;
  font-size: 0.75rem;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
  font-weight: 600;
}

.info-item-compact p {
  margin: 0;
  font-size: 0.95rem;
}

.ability-badge-compact {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.ability-badge-compact.hidden-ability {
  background: rgba(147, 51, 234, 0.2);
  color: #a855f7;
  border-color: rgba(147, 51, 234, 0.3);
}

/* Compact Stats Styles */
.stat-row-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-info-compact {
  display: flex;
  justify-content: space-between;
  width: 120px;
  font-weight: 600;
}

.stat-bar-container-compact {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  margin-left: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-bar-compact {
  height: 100%;
  border-radius: 4px;
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
  background-size: 6px 6px;
  animation: stat-bar-shine 2s linear infinite;
}

@keyframes stat-bar-shine {
  0% { background-position: 0 0; }
  100% { background-position: 12px 0; }
}

.stat-total-compact {
  border-top: 1px solid #374151;
}

/* Compact Moves Styles */
.move-filter-tabs-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.move-filter-btn-compact {
  background: rgba(75, 85, 99, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.8);
  color: #d1d5db;
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
}

.move-filter-btn-compact.active,
.move-filter-btn-compact:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #60a5fa;
}

.moves-grid-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: 15px;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
  padding-right: 0.25rem;
}

/* Responsive moves grid height */
@media (max-width: 768px) {
  .moves-grid-compact {
    max-height: 250px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .moves-grid-compact {
    max-height: 350px;
  }
}

.moves-grid-compact::-webkit-scrollbar {
  width: 4px;
}

.moves-grid-compact::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.moves-grid-compact::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.moves-grid-compact::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.move-card-compact {
  background: rgba(75, 85, 99, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.6);
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.move-card-compact:hover,
.move-card-compact.selected {
  background: rgba(75, 85, 99, 0.5);
  border-color: #3b82f6;
  transform: translateX(2px);
}

.move-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.move-name-compact {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  line-height: 1.2;
}

.move-details-compact {
  margin-bottom: 0.25rem;
}

.move-level-compact,
.move-method-compact {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-size: 0.65rem;
  color: #d1d5db;
  font-weight: 600;
}

.move-stats-compact {
  display: flex;
  gap: 0.5rem;
  font-weight: 600;
}

.move-details-panel-compact {
  border: 2px solid #3b82f6;
  border-radius: 6px;
  max-height: 120px;
  overflow-y: auto;
}

.move-info-grid-compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  color: #d1d5db;
}

/* Original styles for fallback */
.pokemon-image-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.pokemon-image-card:hover {
  transform: translateY(-5px);
}

/* Type and Badge Styles */
.shiny-indicator {
  text-align: center;
}

.type-badges {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.type-badge {
  padding: 0.35rem 0.7rem;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  font-size: 0.8rem;
}

.type-badge:hover {
  transform: translateY(-1px);
}

.type-icon {
  width: 14px;
  height: 14px;
}

/* Stat Name Styling */
.stat-name {
  color: #d1d5db;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 700;
}

/* Pokemon Font */
.pokemon-font {
  color: #ffcb05;
  -webkit-text-stroke: 1.5px #007bff;
  font-family: 'Pokemon Solid', sans-serif;
  text-shadow: none;
  letter-spacing: 2px;
  font-size: 1.5rem;
  line-height: calc(2 / 1.5);
}

/* Edit Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.edit-modal {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border: 2px solid #3b82f6;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #374151;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #ef4444;
}

.edit-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.form-input {
  background: rgba(75, 85, 99, 0.5);
  border: 1px solid #4b5563;
  border-radius: 6px;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(75, 85, 99, 0.7);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.stats-section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: rgba(75, 85, 99, 0.5);
  color: #d1d5db;
  border: 1px solid #4b5563;
}

.btn-secondary:hover {
  background: rgba(75, 85, 99, 0.7);
  border-color: #6b7280;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .pokemon-image-wrapper-compact {
    width: 150px;
    height: 150px;
  }

  .pokemon-image-wrapper-compact::before {
    width: 130px;
    height: 130px;
  }

  .pokemon-image-compact {
    max-width: 130px;
    max-height: 130px;
  }

  .type-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }

  .type-icon {
    width: 12px;
    height: 12px;
  }

  .stat-info-compact {
    width: 100px;
    font-size: 0.8rem;
  }

  .stat-bar-container-compact {
    margin-left: 0.5rem;
  }

  .move-card-compact {
    padding: 0.5rem;
  }

  .move-name-compact {
    font-size: 0.8rem;
  }

  .move-filter-btn-compact {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }

  .form-row,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .edit-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .sprite-angle-image {
    width: 40px;
    height: 40px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .pokemon-image-wrapper-compact {
    width: 180px;
    height: 180px;
  }

  .pokemon-image-wrapper-compact::before {
    width: 160px;
    height: 160px;
  }

  .pokemon-image-compact {
    max-width: 160px;
    max-height: 160px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .pokemon-detail-container {
    padding: 2rem 0;
  }

  .container-fluid {
    max-width: 1400px;
    margin: 0 auto;
  }
}

</style>