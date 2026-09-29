// Enlaces y metadatos oficiales de Redes Sociales y Plataformas de Streaming de Voces en Cristo

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  handle: string;
  iconName: string;
  brandColor: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  description: string;
}

export const VEC_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=100066983563027&locale=es_LA',
    handle: 'Ministerio Musical Voces en Cristo',
    iconName: 'facebook',
    brandColor: '#1877F2',
    badgeBg: 'bg-blue-600/15',
    badgeBorder: 'border-blue-500/30',
    textColor: 'text-blue-400',
    description: 'Comunidad, transmisiones en vivo, eventos y vigilias',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/voces_en_cristo/',
    handle: '@voces_en_cristo',
    iconName: 'instagram',
    brandColor: '#E4405F',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
    textColor: 'text-rose-400',
    description: 'Historias, ensayos, fotos comunitarias y oraciones',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    url: 'https://www.tiktok.com/@vocesencristo',
    handle: '@vocesencristo',
    iconName: 'tiktok',
    brandColor: '#EE1D52',
    badgeBg: 'bg-pink-500/15',
    badgeBorder: 'border-pink-500/30',
    textColor: 'text-pink-400',
    description: 'Videos cortos, alabanzas, coros y reflexiones musicales',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    url: 'https://open.spotify.com/search/Voces%20en%20Cristo',
    handle: 'Voces en Cristo',
    iconName: 'music',
    brandColor: '#1ED760',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    description: 'Discografía y canciones de alabanza católica',
  },
  {
    id: 'amazon',
    name: 'Amazon Music',
    url: 'https://music.amazon.com/search/Voces+en+Cristo',
    handle: 'Voces en Cristo',
    iconName: 'headphones',
    brandColor: '#00A8E1',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    textColor: 'text-sky-400',
    description: 'Reproducción y streaming oficial en Amazon Music',
  },
];

/**
 * Obtiene el enlace de reproducción en Spotify para un canto específico
 */
export function getSpotifyTrackUrl(songTitle: string): string {
  if (songTitle.toLowerCase().includes('todo mi amor')) {
    return 'https://open.spotify.com/search/Voces%20en%20Cristo%20Todo%20mi%20amor';
  }
  return `https://open.spotify.com/search/Voces%20en%20Cristo%20${encodeURIComponent(songTitle)}`;
}

/**
 * Obtiene el enlace de reproducción en Amazon Music para un canto específico
 */
export function getAmazonTrackUrl(songTitle: string): string {
  return `https://music.amazon.com/search/Voces+en+Cristo+${encodeURIComponent(songTitle)}`;
}
