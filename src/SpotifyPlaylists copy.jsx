import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
const clientId = 'f4d2f61a84f748eeab119d34d778a330';
const redirectUri = 'http://localhost:5173/';

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
  const [jsonData, setJsonData] = useState(null);

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
          const data = response.map(playlist => {
            return {
              id: playlist.id,
              name: playlist.name,
              tracks: tracks[playlist.id]
            }
          });
          setJsonData(JSON.stringify(data, null, 2));
          response.forEach(playlist => {
            spotifyApi.getPlaylistTracks(playlist.id).then(t => {
              setTracks(prevTracks => ({ ...prevTracks, [playlist.id]: t.items.map((track, index) => {
                return {
                  order: index + 1,
                  name: track.track.name,
                  author: track.track.artists[0].name
                }
              }) }));
            });
          });
        });
      }
    } else {
      spotifyApi.setAccessToken(token);
      getAllPlaylists(spotifyApi).then(response => {
        setPlaylists(response);
        const data = response.map(playlist => {
          return {
            id: playlist.id,
            name: playlist.name,
            tracks: tracks[playlist.id]
          }
        });
        setJsonData(JSON.stringify(data, null, 2));
        response.forEach(playlist => {
          if (!tracks[playlist.id]) {
            spotifyApi.getPlaylistTracks(playlist.id).then(t => {
              setTracks(prevTracks => ({ ...prevTracks, [playlist.id]: t.items.map((track, index) => {
                return {
                  order: index + 1,
                  name: track.track.name,
                  author: track.track.artists[0].name
                }
              }) }));
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
      const data = response.map(playlist => {
        return {
          id: playlist.id,
          name: playlist.name,
          tracks: tracks[playlist.id]
        }
      });
      setJsonData(JSON.stringify(data, null, 2));
      response.forEach(playlist => {
        if (!tracks[playlist.id]) {
          spotifyApi.getPlaylistTracks(playlist.id).then(t => {
            setTracks(prevTracks => ({ ...prevTracks, [playlist.id]: t.items.map((track, index) => {
              return {
                order: index + 1,
                name: track.track.name,
                author: track.track.artists[0].name
              }
            }) }));
          });
        }
      });
    });
  }

  return (
    <div>
      <button onClick={refreshPlaylists}>Refresh Playlists</button>
      {jsonData && <pre>{jsonData}</pre>}
      {playlists.map(playlist => (
        <div key={playlist.id}>
          <h3>{playlist.name}</h3>
          <table>
          <tbody>
              {tracks[playlist.id] && tracks[playlist.id].map((track, index) => (
                <tr key={index}>
                  <td>{track.order}. {track.author} - {track.name}</td>
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
