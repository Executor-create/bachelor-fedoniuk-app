import api from '../config/api';

export type Review = {
  id: string;
  userId?: string;
  authorName?: string;
  authorAvatar?: string;
  rating: number;
  review?: string;
  likes?: number;
  created_at?: string;
  updated_at?: string;
  date?: string;
  user?: {
    id: string;
    profile?: {
      display_name?: string | null;
      tag?: string | null;
      avatar_url?: string | null;
    } | null;
  };
};

export type CreateReviewRequest = {
  rating: number;
  review?: string;
};

export const createReview = async (
  gameId: string,
  body: CreateReviewRequest,
): Promise<Review> => {
  const response = await api.post<Review>(`/reviews/${gameId}`, body);

  if (response.status !== 201 && response.status !== 200) {
    throw new Error('Failed to create review');
  }

  return response.data;
};

export const getReviewsByGame = async (gameId: string): Promise<Review[]> => {
  const response = await api.get<Review[]>(`/reviews/${gameId}`);

  if (response.status !== 200) {
    throw new Error('Failed to load reviews');
  }

  return response.data;
};

export const getUserReviews = async (): Promise<
  (Review & { gameId?: string; gameName?: string; gameImage?: string })[]
> => {
  const response = await api.get<
    (Review & { gameId?: string; gameName?: string; gameImage?: string })[]
  >(`/reviews/me`);

  if (response.status !== 200) {
    throw new Error('Failed to load your reviews');
  }

  return response.data;
};

export default { createReview, getReviewsByGame, getUserReviews };
