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
  getMusicMoodLabel
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

        setWeather(currentWeather);

        const mood = getMusicMood(
          currentWeather.weatherCode
        );

        const spotifyResults =
          await searchSpotify(accessToken, mood);

        setPlaylists(
          spotifyResults.playlists?.items || []
        );

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
    return <h1>Chargement...</h1>;
  }

  return (
    <div className="app">
      <h1>Spotify Météo 🌦️</h1>

      {!profile ? (
        <>
          <p>
            Des playlists adaptées à la météo.
          </p>

          <button onClick={loginWithSpotify}>
            Se connecter à Spotify
          </button>
        </>
      ) : (
        <>
          <h2>Bonjour 👋</h2>

          {weather && (
            <div className="weather-section">
              <h3>Météo à Dubaï 🇦🇪</h3>

<div className="temperature">
  {weather.temperature}°C
</div>

<p className="weather-description">
  {getWeatherDescription(weather.weatherCode)}
</p>

              <p>
  🎵 Ambiance musicale :{" "}
  <strong>
  {getMusicMoodLabel(weather.weatherCode)}
</strong>
</p>
            </div>
          )}

          <h2 className="playlist-title">
  🎶 Playlists recommandées
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
                  href={playlist.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                >
                  Écouter sur Spotify
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