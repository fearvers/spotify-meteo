import { CLIENT_ID, REDIRECT_URI } from "./config";

function generateRandomString(length) {
const characters =
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

let result = "";

for (let i = 0; i < length; i++) {
result += characters.charAt(
Math.floor(Math.random() * characters.length)
);
}

return result;
}

async function generateCodeChallenge(codeVerifier) {
const data = new TextEncoder().encode(codeVerifier);

const digest = await window.crypto.subtle.digest(
"SHA-256",
data
);

return btoa(
String.fromCharCode(...new Uint8Array(digest))
)
.replace(/\+/g, "-")
.replace(/\//g, "_")
.replace(/=+$/, "");
}

export async function loginWithSpotify() {
const codeVerifier = generateRandomString(128);

const codeChallenge =
await generateCodeChallenge(codeVerifier);

localStorage.setItem(
"spotify_code_verifier",
codeVerifier
);

const params = new URLSearchParams({
client_id: CLIENT_ID,
response_type: "code",
redirect_uri: REDIRECT_URI,
code_challenge_method: "S256",
code_challenge: codeChallenge
});

window.location.href =
`https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleSpotifyCallback() {
const params = new URLSearchParams(
window.location.search
);

const code = params.get("code");

if (!code) {
return null;
}

const codeVerifier =
localStorage.getItem("spotify_code_verifier");

const response = await fetch(
"https://accounts.spotify.com/api/token",
{
method: "POST",
headers: {
"Content-Type":
"application/x-www-form-urlencoded"
},
body: new URLSearchParams({
client_id: CLIENT_ID,
grant_type: "authorization_code",
code: code,
redirect_uri: REDIRECT_URI,
code_verifier: codeVerifier
})
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
"Impossible de récupérer le token Spotify"
);
}

localStorage.setItem(
"spotify_access_token",
data.access_token
);

return data.access_token;
}

export async function getSpotifyProfile(accessToken) {
const response = await fetch(
"https://api.spotify.com/v1/me",
{
headers: {
Authorization: `Bearer ${accessToken}`
}
}
);

if (!response.ok) {
  const error = await response.json();
  console.error("SPOTIFY ERROR:", error);
  throw new Error(
    "Impossible de rechercher sur Spotify"
  );
}

return await response.json();
}

export async function searchSpotify(accessToken, query) {
  const params = new URLSearchParams({
    q: query,
    type: "playlist",
    limit: "20"
  });

  const response = await fetch(
    `https://api.spotify.com/v1/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("SPOTIFY ERROR:", error);

    throw new Error(
      "Impossible de rechercher sur Spotify"
    );
  }

  return await response.json();
}
