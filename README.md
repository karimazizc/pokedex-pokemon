# Pokemon App

A comprehensive Pokemon application built with Vue 3, featuring interactive Pokemon cards with flip animations, detailed Pokemon information, editing capabilities, and dynamic type-based styling.

## Features

- **Interactive Pokemon Cards**: Flip cards to see Pokemon stats on the back
- **Search Functionality**: Search through Pokemon by name
- **Detailed Pokemon View**: Comprehensive stats, moves, abilities, and sprite angles
- **Edit Pokemon**: Modify Pokemon stats and information with real-time updates
- **Dynamic Theming**: Type-based colors and styling throughout the app
- **Responsive Design**: Works on desktop and mobile devices
- **Pokemon Font**: Authentic Pokemon styling with custom fonts

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and development server
- **Pinia** - State management for Vue
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Bootstrap** - Component styling framework
- **PokeAPI** - Pokemon data source

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (usually comes with Node.js)

## Installation and Setup

## Installation and Setup

### 1. Clone the Repository

```sh
git clone <your-repository-url>
cd pokedex-pokemon
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Start the Development Server

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is occupied).

## How to Use the App

### Main Features:

1. **Pokemon Grid View** (Home Page):
   - Browse through Pokemon cards in a responsive grid
   - Use the search bar to find specific Pokemon
   - Click on the front side of any card to view detailed information
   - Hover over the card to reveal a flip button to flip the card
   - Click the top of the backside of the card to flip back to the front
   
2. **Pokemon Detail View**:
   - View comprehensive Pokemon information including stats, moves, abilities
   - See different sprite angles (front, back, shiny variants)
   - Hover over the pokemon image to view shiny version
   - Edit Pokemon stats using the "Edit Pokemon" button
   - Navigate back to the main list using the back button
   - Click on any moves & abilities to show the detail
   - Battle statistics is capped pokemon's maximum stats

3. **Card Flip Interaction**:
   - Front side: Shows Pokemon image, name, HP bar, and basic info
   - Back side: Shows the pokemon card backside design (mimicking original card)
   - Click the top of the card on the back side to flip back to front
   - Navigation to detail view only works when card is on front side

### Navigation:

- **Home** (`/`): Main Pokemon grid with search and flip functionality
- **Pokemon Detail** (`/pokemon/:id`): Detailed view for specific Pokemon

### Development

**Start development server with hot-reload:**

```sh
npm run dev
```

### Production

**Build for production:**

```sh
npm run build
```

**Preview production build:**

```sh
npm run preview
```

### Testing

**Run unit tests:**

```sh
npm run test:unit
```

**Run end-to-end tests:**

```sh
# Install browsers for the first run
npx playwright install

# Run all e2e tests
npm run test:e2e

# Run tests only on Chromium
npm run test:e2e -- --project=chromium

# Run tests of a specific file
npm run test:e2e -- tests/example.spec.ts

# Run tests in debug mode
npm run test:e2e -- --debug
```

### Code Quality

**Lint code:**

```sh
npm run lint
```

## Project Structure

```
src/
├── views/              # Page components
│   ├── HomeView.vue    # Main Pokemon grid
│   └── PokemonDetail.vue  # Detailed Pokemon view
├── stores/             # Pinia state management
│   ├── pokemon.js      # Main Pokemon store
│   └── counter.ts      # Example counter store
├── router/             # Vue Router configuration
│   └── index.ts
├──
├── __tests__/          # Unit tests
├── global.css
├── App.vue             # Root component
└── main.ts             # Application entry point

```

```
public/
├── icons/              # Icons use to store element type
├── favicon.ico         # Change to pokeball favicon
└── pokemonCard.png     # Real Backside PokemonCard design (for inspiration)
```


## API Integration

The app fetches Pokemon data from the [PokeAPI](https://pokeapi.co/):

- **Pokemon List**: Basic information for grid display
- **Pokemon Details**: Comprehensive data including stats, moves, abilities, sprites
- **Sprites**: Multiple image variants (normal, shiny, front, back)

## Troubleshooting

### Common Issues:

1. **Port already in use**: If port 5173 is occupied, Vite will automatically use the next available port
2. **API errors**: The app includes error handling for failed Pokemon API requests with retry functionality
3. **Image loading**: Fallback placeholders are provided for missing Pokemon images

### Development Tips:

- Use browser dev tools to inspect Pokemon data structure
- Check the console for any API or state management errors
- The app includes loading states for better user experience

## Configuration

See [Vite Configuration Reference](https://vite.dev/config/) for advanced configuration options.
