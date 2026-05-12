import api from '../config/api';

export type Game = {
  id: string;
  name: string;
  background_image: string;
  rating: number;
  metacritic_rating: number;
  release_date: string;
  platforms: string[];
  genres: string[];
  stores: string[];
  tags: string[];
  screenshots: string[];
  created_at: string;
  updated_at: string;
};

interface FetchGamesOptions {
  search?: string;
  genre?: string;
  platform?: string;
  signal?: AbortSignal;
}

export type GamesApiResponse = {
  data: Game[];
  nextCursor?: string;
  hasMore: boolean;
};

export const fetchGames = async (
  limit = 10,
  cursor?: string,
  options: FetchGamesOptions = {},
): Promise<GamesApiResponse> => {
  const { search, genre, platform, signal } = options;

  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;
  if (search) params.search = search;
  if (genre) params.genre = genre;
  if (platform) params.platform = platform;

  const response = await api.get<GamesApiResponse>('/games', {
    params,
    signal,
  });
  return response.data;
};

export const fetchGameById = async (id: string): Promise<Game> => {
  const response = await api.get<Game>(`/games/${id}`);
  return response.data;
};

export type PopularGame = {
  id: string;
  name: string;
  background_image: string;
  rating: number;
  metacritic_rating: number;
  reviewCount: number;
};

export const fetchPopularGames = async (
  limit = 6,
  signal?: AbortSignal,
): Promise<PopularGame[]> => {
  const response = await api.get<PopularGame[]>('/games/popular/week', {
    params: { limit },
    signal,
  });
  return response.data;
};

export const getRelatedGames = async (
  id: string,
  limit = 12,
): Promise<Game[]> => {
  const response = await api.get<Game[]>(`/games/${id}/related`, {
    params: { limit },
  });
  return response.data;
};
