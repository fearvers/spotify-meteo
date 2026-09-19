export async function getWeather() {
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject
    );
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  console.log("LOCATION:", latitude, longitude);

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve weather data");
  }

  const data = await response.json();

  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code
  };
}

export function getWeatherDescription(code) {
  if (code === 0) return "☀️ Clear sky";
  if (code === 1 || code === 2) return "🌤️ Partly cloudy";
  if (code === 3) return "☁️ Cloudy";
  if (code >= 45 && code <= 48) return "🌫️ Fog";
  if (code >= 51 && code <= 57) return "🌦️ Drizzle";
  if (code >= 61 && code <= 67) return "🌧️ Rain";
  if (code >= 71 && code <= 77) return "❄️ Snow";
  if (code >= 80 && code <= 82) return "🌧️ Showers";
  if (code >= 95) return "⛈️ Thunderstorm";

  return "🌥️ Variable weather";
}

export function getMusicMood(code) {
  if (code === 0) return "house indie pop jpop kpop";
  if (code === 1 || code === 2) return "indie pop kpop jpop";
  if (code === 3) return "indie alternative mellow";
  if (code >= 45 && code <= 48) return "ambient indie chill";
  if (code >= 51 && code <= 67) return "rainy indie chill kpop jpop";
  if (code >= 71 && code <= 77) return "cozy indie rnb kpop jpop";
  if (code >= 80 && code <= 82) return "deep house electronic";
  if (code >= 95) return "dark electronic house alternative";

  return "indie chill";
}

export function getMusicMoodLabel(code) {
  if (code === 0) return "Sunny House ☀️";
  if (code === 1 || code === 2) return "Chill House 🌤️";
  if (code === 3) return "Indie Mellow ☁️";
  if (code >= 45 && code <= 48) return "Ambient Chill 🌫️";
  if (code >= 51 && code <= 67) return "Rainy Chill 🌧️";
  if (code >= 71 && code <= 77) return "Winter Ambient ❄️";
  if (code >= 80 && code <= 82) return "Deep House 🌧️";
  if (code >= 95) return "Dark Electronic ⛈️";

  return "Chill Vibes 🎵";
}

export function getSeason() {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) {
    return "spring";
  }

  if (month >= 6 && month <= 8) {
    return "summer";
  }

  if (month >= 9 && month <= 11) {
    return "autumn";
  }

  return "winter";
}