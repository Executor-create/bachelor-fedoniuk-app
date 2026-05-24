import { useEffect, useState } from 'react';
import { getUserReviews, getReviewsByUser, type Review } from '../api/reviews';

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

const normalizeReviews = (
  raw: (Review & { gameId?: string; gameName?: string; gameImage?: string })[],
): ReviewWithGameData[] =>
  raw.map((r) => {
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
  });

/**
 * Fetches reviews for the profile page.
 * - Own profile: calls GET /reviews/me
 * - External profile: calls GET /reviews/user/:profileUserId
 */
export function useProfileReviews(
  selectedTab: string,
  isExternalProfile: boolean,
  profileUserId?: string,
): UseProfileReviewsReturn {
  const [userReviews, setUserReviews] = useState<ReviewWithGameData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTab !== 'Reviews') return;

    // For external profiles we need the userId to be resolved first
    if (isExternalProfile && !profileUserId) return;

    let active = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const raw = isExternalProfile
          ? await getReviewsByUser(profileUserId!)
          : await getUserReviews();

        if (!active) return;
        setUserReviews(normalizeReviews(raw));
      } catch (error) {
        if (!active) return;
        console.error('Failed to load reviews:', error);
        setReviewsError(
          isExternalProfile
            ? 'Unable to load reviews for this user.'
            : 'Unable to load your reviews.',
        );
        setUserReviews([]);
      } finally {
        if (active) setReviewsLoading(false);
      }
    };

    loadReviews();

    return () => {
      active = false;
    };
  }, [isExternalProfile, profileUserId, selectedTab]);

  return { userReviews, reviewsLoading, reviewsError };
}
