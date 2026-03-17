const API = import.meta.env.VITE_API_URL;

export const getSongs = async () => {
  const res = await fetch(`${API}/api/songs`);
  const data = await res.json();
  return data.songs;
};