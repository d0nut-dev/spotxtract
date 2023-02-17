import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
const clientId = 'f4d2f61a84f748eeab119d34d778a330';
const redirectUri = 'http://localhost:5173/';
// const redirectUri = 'https://d0nut-dev.github.io/spotxtract/';

const getAllPlaylists = async (api, limit = 50) => {
  let playlists = [];
  let offset = 0;
  let response = await api.getUserPlaylists({ limit, offset });
  playlists = playlists.concat(response.items);
  while (response.next) {
    offset += limit;
    response = await api.getUserPlaylists({ limit, offset });
    playlists = playlists.concat(response.items);
  }
  return playlists;
};

const SpotifyAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState({});

  useEffect(() => {
    if (!token) {
      const hash = window.location.hash
        .substring(1)
        .split("&")
        .reduce(function(initial, item) {
          if (item) {
            var parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);
          }
          return initial;
        }, {});
      window.location.hash = "";

      const _token = hash.access_token;
      if (_token) {
        localStorage.setItem('token', _token);
        setToken(_token);
        spotifyApi.setAccessToken(_token);
        getAllPlaylists(spotifyApi).then(response => {
          setPlaylists(response);
          response.forEach(playlist => {
            spotifyApi.getPlaylistTracks(playlist.id).then(tracks => {
              setTracks(prevTracks => ({ ...prevTracks, [playlist.id]: tracks.items }));
            });
          });
        });
      }
    } else {
      spotifyApi.setAccessToken(token);
      getAllPlaylists(spotifyApi).then(response => {
        setPlaylists(response);
        response.forEach(playlist => {
          if (!tracks[playlist.id]) {
            spotifyApi.getPlaylistTracks(playlist.id).then(tracks => {
              setTracks(prevTracks => ({ ...prevTracks, [playlist.id]: tracks.items }));
            });
          }
        });
      });
    }
  }, []);

  if (!token) {
    return (
      <a href={`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=playlist-read-private%20playlist-read-collaborative%20user-library-read`}>
        Login with Spotify
      </a>
    );
  }

  const refreshPlaylists = () => {
    getAllPlaylists(spotifyApi).then(response => {
      setPlaylists(response);
      response.forEach(playlist => {
        if (!tracks[playlist.id]) {
          spotifyApi.getPlaylistTracks(playlist.id).then(tracks => {
            setTracks(prevTracks => ({ ...prevTracks, [playlist.id]: tracks.items }));
          });
        }
      });
    });
  }

  const createPlaylistsJSON = (playlists)=> {
    let playlistsJSON = playlists.map((playlist) => {

    });
    return playlistsJSON;
  } 

  return (
    <div>
      <button onClick={refreshPlaylists}>Refresh Playlists</button>
      {/* <input type={{text}} value={playlistsJSON}/> */}
      {playlists.map(playlist => (
        <div key={playlist.id}>
          <h3>{playlist.name}</h3>
          <table>
            <tbody>
              {tracks[playlist.id] && tracks[playlist.id].map((track, index) => (
                <tr key={index}>
                  <td>{track.track.artists[0].name} - {track.track.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default SpotifyAuth;
