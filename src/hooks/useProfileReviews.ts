import { useEffect, useState } from 'react';
import { getUserReviews, type Review } from '../api/reviews';

export type ReviewWithGameData = Review & {
  gameId?: string;
  gameName?: string;
  gameImage?: string;
};

export type UseProfileReviewsReturn = {
  userReviews: ReviewWithGameData[];
  reviewsLoading: boolean;
  reviewsError: string | null;
};

/**
 * Fetches the current user's reviews for the profile page.
 * Only fires for the own-profile view (not external profiles).
 */
export function useProfileReviews(
  selectedTab: string,
  isExternalProfile: boolean,
): UseProfileReviewsReturn {
  const [userReviews, setUserReviews] = useState<ReviewWithGameData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (isExternalProfile) return;

    let active = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const reviews = await getUserReviews();
        if (!active) return;
        setUserReviews(
          reviews.map((r) => {
            const rr = r as ReviewWithGameData & Record<string, any>;
            return {
              ...r,
              gameId: rr.game?.id || rr.game_id || rr.gameId,
              gameName: rr.game?.name || rr.game?.title || rr.gameName,
              gameImage:
                rr.game?.background_image ||
                rr.game?.backgroundImage ||
                rr.gameImage,
              date: r.created_at
                ? new Date(r.created_at).toLocaleDateString()
                : undefined,
            };
          }),
        );
      } catch (error) {
        if (!active) return;
        console.error('Failed to load reviews:', error);
        setReviewsError('Unable to load your reviews.');
        setUserReviews([]);
      } finally {
        if (active) setReviewsLoading(false);
      }
    };

    loadReviews();

    return () => {
      active = false;
    };
  }, [isExternalProfile]);

  return { userReviews, reviewsLoading, reviewsError };
}
