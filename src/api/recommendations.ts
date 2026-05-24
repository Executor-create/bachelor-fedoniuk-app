import api from '../config/api';

export interface RecommendedGame {
  id: string;
  name: string;
  background_image?: string | null;
  rating?: number | null;
  metacritic_rating?: number | null;
  genres?: string[];
  platforms?: string[];
  release_date?: string | null;
  score?: number | null;
}

export interface RecommendationsResponse {
  data: RecommendedGame[];
  personalized: boolean;
}

export async function getRecommendations(
  limit = 10,
  signal?: AbortSignal,
): Promise<RecommendationsResponse> {
  const res = await api.get('/recommendations', {
    params: { limit },
    signal,
  });

  return res.data as RecommendationsResponse;
}
