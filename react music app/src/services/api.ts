import type { SearchSongsResponse, SongDetailsResponse } from '../types/api';

const BASE = 'https://saavn.sumit.co';

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(path, BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function searchSongs(
  query: string,
  page = 1,
  limit = 20
): Promise<SearchSongsResponse> {
  return get<SearchSongsResponse>('/api/search/songs', {
    query: query.trim(),
    page: String(page),
    limit: String(limit),
  });
}

export async function getSongById(id: string): Promise<SongDetailsResponse> {
  return get<SongDetailsResponse>(`/api/songs/${encodeURIComponent(id)}`);
}
