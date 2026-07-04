// ---------- Ambient particles ----------
const skyLayer = document.getElementById('skyLayer');
for (let i = 0; i < 24; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 3 + 1;
  p.style.width = size + 'px';
  p.style.height = size + 'px';
  p.style.left = Math.random() * 100 + 'vw';
  p.style.animationDuration = (Math.random() * 12 + 10) + 's';
  p.style.animationDelay = (Math.random() * 10) + 's';
  skyLayer.appendChild(p);
}

// ---------- State ----------
let currentDataC = null; // store last fetched weather in Celsius
let unit = 'C';

const stateMessage = document.getElementById('stateMessage');
const weatherDisplay = document.getElementById('weatherDisplay');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const card = document.getElementById('card');

const locationName = document.getElementById('locationName');
const locationMeta = document.getElementById('locationMeta');
const tempNum = document.getElementById('tempNum');
const conditionLabel = document.getElementById('conditionLabel');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const iconWrap = document.getElementById('iconWrap');
const unitC = document.getElementById('unitC');
const unitF = document.getElementById('unitF');

// ---------- Weather code mapping (OpenWeatherMap condition IDs) ----------
// Reference: https://openweathermap.org/weather-conditions
function getWeatherIcon(id) {
  if (id >= 200 && id <= 232) return 'storm';
  if (id >= 300 && id <= 321) return 'rain';
  if (id >= 500 && id <= 531) return 'rain';
  if (id >= 600 && id <= 622) return 'snow';
  if (id >= 701 && id <= 781) return 'fog';
  if (id === 800) return 'sun';
  if (id === 801) return 'cloud-sun';
  if (id >= 802 && id <= 804) return 'cloud';
  return 'cloud';
}

const ICONS = {
  sun: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="14" fill="#FFB347"/><g stroke="#FFB347" stroke-width="3" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="60"/><line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="17" y2="17"/><line x1="47" y1="47" x2="52" y2="52"/><line x1="52" y1="12" x2="47" y2="17"/><line x1="17" y1="47" x2="12" y2="52"/></g></svg>`,
  'cloud-sun': `<svg viewBox="0 0 64 64" fill="none"><circle cx="24" cy="24" r="10" fill="#FFB347"/><path d="M18 44a12 12 0 0 1 22-7 9 9 0 0 1 2 17.8H20A9 9 0 0 1 18 44z" fill="#F5F7FA"/></svg>`,
  cloud: `<svg viewBox="0 0 64 64" fill="none"><path d="M16 46a14 14 0 0 1 26-8 10.5 10.5 0 0 1 2.5 20.7H18A10.5 10.5 0 0 1 16 46z" fill="#F5F7FA"/></svg>`,
  fog: `<svg viewBox="0 0 64 64" fill="none"><g stroke="#F5F7FA" stroke-width="4" stroke-linecap="round"><line x1="8" y1="24" x2="56" y2="24"/><line x1="14" y1="34" x2="50" y2="34"/><line x1="8" y1="44" x2="56" y2="44"/></g></svg>`,
  rain: `<svg viewBox="0 0 64 64" fill="none"><path d="M16 34a14 14 0 0 1 26-8 10.5 10.5 0 0 1 2.5 20.7H18A10.5 10.5 0 0 1 16 34z" fill="#F5F7FA"/><g stroke="#4FD1C5" stroke-width="3" stroke-linecap="round"><line x1="22" y1="52" x2="19" y2="60"/><line x1="32" y1="52" x2="29" y2="60"/><line x1="42" y1="52" x2="39" y2="60"/></g></svg>`,
  snow: `<svg viewBox="0 0 64 64" fill="none"><path d="M16 32a14 14 0 0 1 26-8 10.5 10.5 0 0 1 2.5 20.7H18A10.5 10.5 0 0 1 16 32z" fill="#F5F7FA"/><g stroke="#F5F7FA" stroke-width="3" stroke-linecap="round"><line x1="22" y1="50" x2="22" y2="60"/><line x1="32" y1="50" x2="32" y2="60"/><line x1="42" y1="50" x2="42" y2="60"/><line x1="18" y1="55" x2="26" y2="55"/><line x1="28" y1="55" x2="36" y2="55"/><line x1="38" y1="55" x2="46" y2="55"/></g></svg>`,
  storm: `<svg viewBox="0 0 64 64" fill="none"><path d="M16 30a14 14 0 0 1 26-8 10.5 10.5 0 0 1 2.5 20.7H18A10.5 10.5 0 0 1 16 30z" fill="#F5F7FA"/><path d="M32 44l-6 12h6l-3 8 10-14h-6l4-6z" fill="#FFB347"/></svg>`,
};

const BG_THEMES = {
  sun: 'linear-gradient(160deg, #0B1026 0%, #B85C2E 55%, #FFB347 100%)',
  'cloud-sun': 'linear-gradient(160deg, #0B1026 0%, #3A4A6B 55%, #7FA8D9 100%)',
  cloud: 'linear-gradient(160deg, #0B1026 0%, #2E3A50 55%, #5B6B85 100%)',
  fog: 'linear-gradient(160deg, #14151f 0%, #3a3d47 55%, #6b6f7a 100%)',
  rain: 'linear-gradient(160deg, #0B1026 0%, #1F3A4D 55%, #4FD1C5 100%)',
  snow: 'linear-gradient(160deg, #0B1026 0%, #2E3D5E 55%, #B9D3E8 100%)',
  storm: 'linear-gradient(160deg, #05060f 0%, #241f3d 55%, #4A3B6B 100%)',
};

function setSkyTheme(iconKey) {
  document.body.style.background = BG_THEMES[iconKey] || BG_THEMES.sun;
  document.body.style.backgroundSize = '200% 200%';
}

// ---------- Rendering ----------
function renderWeather(data) {
  currentDataC = data;
  stateMessage.style.display = 'none';
  weatherDisplay.classList.add('active');

  locationName.textContent = data.name;
  locationMeta.textContent = data.region ? `${data.region}, ${data.country}` : data.country;

  conditionLabel.textContent = data.label;
  iconWrap.innerHTML = ICONS[data.icon];
  setSkyTheme(data.icon);

  updateTempDisplay();

  humidity.textContent = `${data.humidity}%`;
  wind.textContent = `${Math.round(data.windspeed)} km/h`;
}

function cToF(c) { return c * 9 / 5 + 32; }

function updateTempDisplay() {
  if (!currentDataC) return;
  const t = unit === 'C' ? currentDataC.temp : cToF(currentDataC.temp);
  const f = unit === 'C' ? currentDataC.feels : cToF(currentDataC.feels);
  tempNum.innerHTML = `${Math.round(t)}<span>°${unit}</span>`;
  feelsLike.textContent = `${Math.round(f)}°`;
}

unitC.addEventListener('click', () => {
  unit = 'C'; unitC.classList.add('active'); unitF.classList.remove('active');
  updateTempDisplay();
});
unitF.addEventListener('click', () => {
  unit = 'F'; unitF.classList.add('active'); unitC.classList.remove('active');
  updateTempDisplay();
});

function showMessage(msg) {
  stateMessage.style.display = 'block';
  stateMessage.textContent = msg;
  weatherDisplay.classList.remove('active');
}

// ---------- API calls (OpenWeatherMap) ----------
// 1. Get a free key at https://home.openweathermap.org/api_keys
// 2. Paste it below between the quotes. Never commit a real key to a public
//    GitHub repo — see the note in the README about keeping it out of git history.
const OWM_API_KEY = '6e0d60c33b10f10671b9ee2c65070ed6';

function handleOwmResponse(json) {
  const id = json.weather[0].id;
  const icon = getWeatherIcon(id);
  renderWeather({
    name: json.name || 'Unknown location',
    region: '',
    country: json.sys && json.sys.country ? json.sys.country : '',
    temp: json.main.temp,
    feels: json.main.feels_like,
    humidity: json.main.humidity,
    windspeed: json.wind.speed * 3.6, // m/s -> km/h
    label: json.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()),
    icon,
  });
}

async function fetchWeatherByCoords(lat, lon) {
  if (OWM_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    showMessage('Add your OpenWeatherMap API key in script.js (look for OWM_API_KEY near the top of the API calls section).');
    return;
  }
  showMessage('Loading weather…');
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather request failed');
    const json = await res.json();
    handleOwmResponse(json);
  } catch (err) {
    showMessage('Could not load weather. Please try again.');
    console.error(err);
  }
}

async function searchCity(query) {
  if (!query.trim()) return;
  if (OWM_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    showMessage('Add your OpenWeatherMap API key in script.js (look for OWM_API_KEY near the top of the API calls section).');
    return;
  }
  showMessage('Searching…');
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${OWM_API_KEY}&units=metric`;
    const res = await fetch(url);
    if (res.status === 404) {
      showMessage(`No results found for "${query}".`);
      return;
    }
    if (!res.ok) throw new Error('Weather request failed');
    const json = await res.json();
    handleOwmResponse(json);
  } catch (err) {
    showMessage('Something went wrong searching for that city.');
    console.error(err);
  }
}

searchBtn.addEventListener('click', () => searchCity(cityInput.value));
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchCity(cityInput.value);
});

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showMessage('Geolocation is not supported by your browser.');
    return;
  }
  showMessage('Locating you…');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await fetchWeatherByCoords(latitude, longitude);
    },
    () => showMessage('Location access denied. Try searching a city instead.')
  );
});

// Load a default city on first visit
searchCity('Manila');
