import { useEffect, useState } from "react";
import "./App.css";

import {
  loginWithSpotify,
  handleSpotifyCallback,
  getSpotifyProfile,
  searchSpotify
} from "./spotifyAuth";

import {
  getWeather,
  getWeatherDescription,
  getMusicMood,
  getMusicMoodLabel,
  getSeason
} from "./weather";

function App() {
  const [profile, setProfile] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    async function authenticate() {
      const params = new URLSearchParams(
        window.location.search
      );

      const code = params.get("code");

      if (!code) {
        return;
      }

      try {
        setLoading(true);

        const accessToken =
          await handleSpotifyCallback();

        const spotifyProfile =
          await getSpotifyProfile(accessToken);

        setProfile(spotifyProfile);

        const currentWeather =
          await getWeather();

        console.log(
          "WEATHER RECEIVED:",
          currentWeather
        );

        setWeather(currentWeather);

        const mood = getMusicMood(
          currentWeather.weatherCode
        );

        const season = getSeason();

        console.log("SEASON:", season);
        console.log("MOOD:", mood);

        let genres;

if (currentWeather.weatherCode === 0) {
  // ☀️ Clear sky
  genres = [
    `${season} sunny house`,
    `${season} sunny indie pop`,
    `${season} bright jpop`,
    `${season} bright kpop`
  ];
} else if (
  currentWeather.weatherCode === 1 ||
  currentWeather.weatherCode === 2
) {
  // 🌤️ Partly cloudy
  genres = [
    `${season} chill house`,
    `${season} dreamy indie`,
    `${season} indie pop`,
    `${season} indie rock`
  ];
} else if (currentWeather.weatherCode === 3) {
  // ☁️ Cloudy
  genres = [
    `${season} mellow indie`,
    `${season} cloudy alternative`,
    `${season} pop rock`,
    `${season} jpop rock`
  ];
} else if (
  currentWeather.weatherCode >= 45 &&
  currentWeather.weatherCode <= 48
) {
  // 🌫️ Fog
  genres = [
    `${season} foggy ambient`,
    `${season} atmospheric indie`,
    `${season} dreamy jpop`,
    `${season} atmospheric kpop`
  ];
} else if (
  currentWeather.weatherCode >= 51 &&
  currentWeather.weatherCode <= 67
) {
  // 🌧️ Rain
  genres = [
    `${season} rainy indie`,
    `${season} rainy chill`,
    `${season} rainy songs`,
    `${season} rainy playlist`
  ];
} else if (
  currentWeather.weatherCode >= 71 &&
  currentWeather.weatherCode <= 77
) {
  // ❄️ Snow
  genres = [
    `${season} winter cozy`,
    `${season} snowy ambient`,
    `${season} winter songs`,
    `${season} winter kpop`
  ];
} else if (
  currentWeather.weatherCode >= 80 &&
  currentWeather.weatherCode <= 82
) {
  // 🌦️ Showers
  genres = [
    `${season} rainy house`,
    `${season} chill house`,
    `${season} rainy indie`,
    `${season} rainy kpop`
  ];
} else if (currentWeather.weatherCode >= 95) {
  // ⛈️ Thunderstorm
  genres = [
    `${season} deconstructed club`,
    `${season} dark ambient`,
    `${season} dark indie`,
    `${season} dark kpop`
  ];
} else {
  genres = [
    `${season} chill`,
    `${season} indie`,
    `${season} jpop`,
    `${season} kpop`
  ];
}

        const results = await Promise.all(
          genres.map((genre) =>
            searchSpotify(accessToken, genre)
          )
        );

        const allPlaylists = results.flatMap(
  (result) =>
    result.playlists?.items || []
);

const seasonKeywords = {
  spring: ["spring", "fresh", "bloom"],
  summer: ["summer", "sun", "sunny", "tropical", "beach"],
  autumn: ["autumn", "fall", "cozy", "rainy", "falling"],
  winter: ["winter", "snow", "snowy", "cozy", "christmas"]
};

const weatherKeywords = {
  0: ["sun", "sunny", "bright", "summer"],
  1: ["chill", "dreamy", "cloudy", "sunny"],
  2: ["chill", "dreamy", "cloudy", "sunny"],
  3: ["cloudy", "mellow", "overcast"],
  45: ["fog", "foggy", "mist", "ambient"],
  46: ["fog", "foggy", "mist", "ambient"],
  47: ["fog", "foggy", "mist", "ambient"],
  48: ["fog", "foggy", "mist", "ambient"],
  51: ["rain", "rainy", "chill"],
  52: ["rain", "rainy", "chill"],
  53: ["rain", "rainy", "chill"],
  54: ["rain", "rainy", "chill"],
  55: ["rain", "rainy", "chill"],
  56: ["rain", "rainy", "chill"],
  57: ["rain", "rainy", "chill"],
  61: ["rain", "rainy", "chill"],
  62: ["rain", "rainy", "chill"],
  63: ["rain", "rainy", "chill"],
  64: ["rain", "rainy", "chill"],
  65: ["rain", "rainy", "chill"],
  66: ["rain", "rainy", "chill"],
  67: ["rain", "rainy", "chill"],
  71: ["snow", "snowy", "winter"],
  72: ["snow", "snowy", "winter"],
  73: ["snow", "snowy", "winter"],
  74: ["snow", "snowy", "winter"],
  75: ["snow", "snowy", "winter"],
  76: ["snow", "snowy", "winter"],
  77: ["snow", "snowy", "winter"],
  80: ["rain", "rainy", "shower"],
  81: ["rain", "rainy", "shower"],
  82: ["rain", "rainy", "shower"]
};

const seasonMatches =
  seasonKeywords[season] || [];

const weatherMatches =
  weatherKeywords[currentWeather.weatherCode] || [];

const validPlaylists = allPlaylists.filter((playlist) => {
  if (!playlist || !playlist.id || !playlist.name) {
    return false;
  }

  const name = playlist.name.toLowerCase();

  const matchesSeason = seasonMatches.some((keyword) =>
    name.includes(keyword)
  );

  const matchesWeather = weatherMatches.some((keyword) =>
    name.includes(keyword)
  );

  return matchesSeason || matchesWeather;
});

const uniquePlaylists = Array.from(
  new Map(
    validPlaylists.map((playlist) => [
      playlist.id,
      playlist
    ])
  ).values()
);

setPlaylists(uniquePlaylists);

        window.history.replaceState(
          {},
          document.title,
          "/"
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    authenticate();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="app">
      <h1>Spotify Weather 🌦️</h1>

      {!profile ? (
        <>
          <p>
            Playlists adapted to the weather and season.
          </p>

          <button onClick={loginWithSpotify}>
            Connect to Spotify
          </button>
        </>
      ) : (
        <>
          <h2>Hello 👋</h2>

          {weather && (
            <div className="weather-section">
              <h3>Current weather</h3>

              <div className="temperature">
                {weather.temperature}°C
              </div>

              <p className="weather-description">
                {getWeatherDescription(
                  weather.weatherCode
                )}
              </p>

              <p>
                🎵 Music mood:{" "}
                <strong>
                  {getMusicMoodLabel(
                    weather.weatherCode
                  )}
                </strong>
              </p>
            </div>
          )}

          <h2 className="playlist-title">
            🎶 Recommended playlists
          </h2>

          <div className="playlist-grid">
            {playlists.map((playlist) => (
              <div
                className="playlist-card"
                key={playlist.id}
              >
                {playlist.images?.length > 0 && (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                  />
                )}

                <h4>{playlist.name}</h4>

                <a
                  href={
                    playlist.external_urls.spotify
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Listen on Spotify
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;