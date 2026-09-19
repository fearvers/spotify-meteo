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
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        return;
      }

      try {
        setLoading(true);

        const accessToken = await handleSpotifyCallback();
        const spotifyProfile = await getSpotifyProfile(accessToken);

        setProfile(spotifyProfile);

        const currentWeather = await getWeather();
        setWeather(currentWeather);

        const mood = getMusicMood(currentWeather.weatherCode);
        const season = getSeason();

        console.log("SEASON:", season);
        console.log("MOOD:", mood);

        let genres;

        if (currentWeather.weatherCode === 0) {
          genres = [
            `${season} house`,
            `${season} jpop bright`,
            `${season} kpop dance`,
            `${season} indie pop`
          ];
        } else if (
          currentWeather.weatherCode === 1 ||
          currentWeather.weatherCode === 2
        ) {
          genres = [
            `${season} chill house`,
            `${season} jpop chill`,
            `${season} kpop chill`,
            `${season} indie pop`
          ];
        } else if (currentWeather.weatherCode === 3) {
          genres = [
            `${season} indie`,
            `${season} alternative`,
            `${season} mellow jpop`,
            `${season} mellow kpop`
          ];
        } else if (
          currentWeather.weatherCode >= 51 &&
          currentWeather.weatherCode <= 67
        ) {
          genres = [
            `${season} rainy indie`,
            `${season} rainy jpop`,
            `${season} rainy kpop`,
            `${season} rainy ambient`
          ];
        } else if (
          currentWeather.weatherCode >= 80 &&
          currentWeather.weatherCode <= 82
        ) {
          genres = [
            `${season} deep house`,
            `${season} chill house`,
            `${season} rainy kpop`,
            `${season} indie chill`
          ];
        } else if (currentWeather.weatherCode >= 95) {
          genres = [
            `${season} dark electronic`,
            `${season} dark house`,
            `${season} alternative`,
            `${season} dark kpop`
          ];
        } else {
          genres = [
            `${season} indie`,
            `${season} jpop`,
            `${season} kpop`,
            `${season} house`
          ];
        }

        const results = await Promise.all(
          genres.map((genre) => searchSpotify(accessToken, genre))
        );

        const allPlaylists = results.flatMap(
          (result) => result.playlists?.items || []
        );

        const uniquePlaylists = Array.from(
          new Map(
            allPlaylists.map((playlist) => [playlist.id, playlist])
          ).values()
        );

        setPlaylists(uniquePlaylists);

        window.history.replaceState({}, document.title, "/");
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
          <p>Playlists adapted to the weather and season.</p>

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
                {getWeatherDescription(weather.weatherCode)}
              </p>

              <p>
                🎵 Music mood:{" "}
                <strong>
                  {getMusicMoodLabel(weather.weatherCode)}
                </strong>
              </p>
            </div>
          )}

          <h2 className="playlist-title">
            🎶 Recommended playlists
          </h2>

          <div className="playlist-grid">
            {playlists.map((playlist) => (
              <div className="playlist-card" key={playlist.id}>
                {playlist.images?.length > 0 && (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                  />
                )}

                <h4>{playlist.name}</h4>

                <a
                  href={playlist.external_urls.spotify}
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