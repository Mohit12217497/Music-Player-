// JioSaavn API response types (aligned with actual API responses)

export interface ApiImage {
  quality: string;
  link?: string;
  url?: string;
}

export interface ApiAlbum {
  id: string;
  name: string;
  url?: string;
}

export interface ApiArtist {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image?: ApiImage[];
  url?: string;
}

export interface ApiArtists {
  primary?: ApiArtist[];
  featured?: ApiArtist[];
  all?: ApiArtist[];
}

export interface DownloadUrl {
  quality: string;
  link?: string;
  url?: string;
}

// Search songs response (GET /api/search/songs)
export interface SearchSongItem {
  id: string;
  name: string;
  type?: string;
  album: ApiAlbum;
  year?: string;
  releaseDate?: string | null;
  duration: string | number;
  label?: string;
  primaryArtists?: string;
  primaryArtistsId?: string;
  featuredArtists?: string;
  featuredArtistsId?: string;
  explicitContent?: number;
  playCount?: string;
  language?: string;
  hasLyrics?: string;
  url?: string;
  copyright?: string;
  image: ApiImage[];
  downloadUrl: DownloadUrl[];
  artists?: ApiArtists;
}

export interface SearchSongsResponse {
  status?: string;
  success?: boolean;
  data: {
    results: SearchSongItem[];
    total: number;
    start: number;
  };
}

// Single song (GET /api/songs/{id})
export interface SongDetail {
  id: string;
  name: string;
  duration: number;
  language?: string;
  album: ApiAlbum;
  artists: ApiArtists;
  image: ApiImage[];
  downloadUrl: DownloadUrl[];
}

export interface SongDetailsResponse {
  success: boolean;
  data: SongDetail[];
}

// Normalized app model (used in player & queue)
export interface Track {
  id: string;
  name: string;
  duration: number; // seconds
  albumName: string;
  albumId?: string;
  artists: string; // comma-separated
  imageUrl: string; // pick 500x500 or 150x150
  streamUrl: string; // 320 or 96 kbps
}

export function pickImageUrl(images: ApiImage[] | undefined, prefer = '500x500'): string {
  if (!images?.length) return '';
  const found = images.find((i) => (i.quality === prefer) || (i.quality === '150x150'));
  return (found?.link ?? found?.url) || (images[0]?.link ?? images[0]?.url) || '';
}

export function pickStreamUrl(downloadUrl: DownloadUrl[] | undefined): string {
  if (!downloadUrl?.length) return '';
  const order = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  for (const q of order) {
    const found = downloadUrl.find((d) => d.quality === q);
    const url = found?.link ?? found?.url;
    if (url) return url;
  }
  return (downloadUrl[0]?.link ?? downloadUrl[0]?.url) || '';
}

export function searchItemToTrack(item: SearchSongItem): Track {
  const duration = typeof item.duration === 'string' ? parseInt(item.duration, 10) || 0 : item.duration;
  return {
    id: item.id,
    name: item.name,
    duration,
    albumName: item.album?.name ?? '',
    albumId: item.album?.id,
    artists: item.primaryArtists ?? (item.artists?.primary?.map((a) => a.name).join(', ') ?? ''),
    imageUrl: pickImageUrl(item.image),
    streamUrl: pickStreamUrl(item.downloadUrl),
  };
}

export function songDetailToTrack(detail: SongDetail): Track {
  const artists = detail.artists?.primary?.map((a) => a.name).join(', ') ?? '';
  return {
    id: detail.id,
    name: detail.name,
    duration: detail.duration,
    albumName: detail.album?.name ?? '',
    albumId: detail.album?.id,
    artists,
    imageUrl: pickImageUrl(detail.image),
    streamUrl: pickStreamUrl(detail.downloadUrl),
  };
}
