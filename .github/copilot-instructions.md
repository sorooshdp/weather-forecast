# Weather Forecast App - AI Coding Agent Instructions

## Project Overview
A responsive weather forecast application that displays real-time weather data, hourly forecasts, and 7-day outlooks for any city worldwide. Uses vanilla JavaScript (ES6 modules), SASS for styling, and integrates with OpenWeather API and Open-Meteo API.

**Live Demo**: https://umbrellaforecast.netlify.app/

## Architecture & Data Flow

### API Integration Strategy
The app uses **two separate weather APIs** in sequence:
1. **OpenWeather API** (`api.openweathermap.org`) - Primary source for city search and current conditions
2. **Open-Meteo API** (`api.open-meteo.com`) - Secondary source for hourly/daily forecasts

**Data Flow Pattern** (see `js/app.js`):
```
User Input → getMainWeatherData() → OpenWeather API → Extract lat/lon coordinates
         ↓
getHourlyWeatherData(lat, lon, mainData) → Open-Meteo API → UI Update
         ↓
[showResult(), updateHourlyWeatherData(), updateSevenDayForecast()]
```

This dual-API approach exists because Open-Meteo provides more detailed hourly data but requires coordinates, while OpenWeather handles city name lookups.

### Module Structure
- **`js/app.js`** - Main application logic, API calls, DOM manipulation (module entry point)
- **`js/cities.js`** - Exports massive array of ~209,000+ city names for autocomplete (exported as ES6 module)
- **`js/fontAwesome.js`** - FontAwesome Kit loader (standalone script, not a module)

### Key Conventions

**Icon Mapping System**: Weather conditions map to local SVG icons via `weatherIcons` object in `app.js`:
```javascript
const weatherIcons = {
    CLEAR: [0], CLOUDY: [1,2,3], FOG: [45,48], DRIZZLE: [51,53,55,56,57],
    RAIN: [61,63,66,67], SNOW: [71,73,75,77,85,86], THUNDER: [80,81,82],
    THUNDERSTORMS: [95,96,99]
};
```
Icons live in `icons/animated/` as SVG files (e.g., `clear.svg`, `rain.svg`). Always use `updateIconByWeatherCode()` to resolve weather codes to icon paths.

**Smooth Transitions**: All UI updates use opacity fading pattern:
1. Call `setOpacityZero([...elements])` to fade out
2. Wait 200ms timeout
3. Update content/src attributes
4. Set `opacity: 1` to fade in

**Throttling**: Search autocomplete uses custom throttle function with 555ms delay to prevent excessive filtering (see `updateListThrottled`).

## Development Workflow

### SASS → CSS Compilation
```powershell
npm run sass
```
Watches `scss/*.scss` files and auto-compiles to `css/styles.css`. The SASS architecture:
- `scss/_variables.scss` - Color palette and font definitions
- `scss/_resets.scss` - CSS resets (imported but not shown in context)
- `scss/styles.scss` - Main stylesheet with component-specific styles

**Important**: Always edit `.scss` files, never edit `css/styles.css` directly (it's auto-generated).

### Color System (from `_variables.scss`)
```scss
$richBlack: #0B131E;    // Main background
$gunmetal: #202C3C;     // Card backgrounds
$dogerBlue: #0294fb;    // Primary accent (buttons, highlights)
$platinum: #DFE3E6;     // Text color
$slateGray: #69717E;    // Secondary text/borders
```

### Running Locally
1. No build step required for JavaScript (uses native ES6 modules)
2. Open `index.html` directly in browser OR use local server
3. For SASS development: Run `npm run sass` in separate terminal

### API Key Management
The OpenWeather API key is hardcoded in `js/app.js` as `api.API_KEY`. For production changes, update this constant. Open-Meteo API requires no key.

## Critical Implementation Details

### City Search Autocomplete
The `cities.js` file is **massive** (209,000+ entries). When working with search/filtering:
- Never load all suggestions at once (see `maxSuggestions = Math.min(filteredCities.length, 6)`)
- Filtering uses `.toLowerCase().startsWith()` for performance
- Throttle updates to 555ms to prevent UI lag

### Geolocation on Load
`window.addEventListener("load", ...)` triggers automatic geolocation via `getUserLocation()`, which:
1. Shows loading screen (`#loading-page`)
2. Requests browser location permission
3. Fetches weather for user's coordinates
4. Hides loading screen on completion/error

Default fallback: `getMainWeatherData("london")` if geolocation fails.

### Responsive Breakpoints
Three layout modes in `scss/styles.scss`:
- **Default** (>1400px): 2-column grid (7fr main / 4fr aside)
- **1400px**: Adjusted grid with smaller fonts
- **1280px**: Switches to stacked layout (main top, aside bottom)

### Date/Time Formatting
`convertToDate()` function parses API date strings into readable format. Handles timezone-aware strings from Open-Meteo API. For hourly forecast, app finds current hour and displays next 6 hours (wraps to next day if needed).

## Common Tasks

**Adding new weather condition icons**: 
1. Add SVG to `icons/animated/`
2. Update `weatherIcons` object mapping in `app.js`

**Modifying color scheme**: 
Edit `scss/_variables.scss` and let `npm run sass` regenerate CSS.

**Changing city search behavior**: 
Adjust `updateList()` function - controls filtering logic and display limit.

**API error handling**: 
All fetch calls use `.catch()` with `popAlert()` to show user-facing error message (red alert box bottom-left).

## SEO/Deployment Notes
- Deployed on Netlify (see README.md)
- `sitemap.xml` and `robots.txt` present in root
- Extensive meta tags in `index.html` for SEO/social sharing
- Uses Google verification meta tag

## Testing Considerations
No automated tests exist. When making changes, manually verify:
- Search autocomplete responsiveness
- API failure scenarios (network tab → throttle to offline)
- Responsive layouts at breakpoints (1400px, 1280px)
- Loading screen behavior on page refresh
