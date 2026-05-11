import React, { useEffect, useState } from 'react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { getReviewsByGame, createReview } from '../../api/reviews';
import type { Review as ApiReview } from '../../api/reviews';

const tabs = ['Reviews', 'Community', 'Related Games'];

// removed mock/sample reviews

const ReviewsSection: React.FC<{
  gameId: string;
  game?: { name: string; genres: string[]; background_image?: string };
}> = ({ gameId, game }) => {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<
    (ApiReview & { date?: string; text?: string })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getReviewsByGame(gameId);
        if (!mounted) return;
        setReviews(
          res.map((r) => ({
            ...r,
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString()
              : undefined,
            authorName:
              r.user?.profile?.display_name || r.authorName || 'Anonymous',
            authorAvatar: r.user?.profile?.avatar_url || r.authorAvatar,
            text: r.review ?? '',
          })),
        );
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('Unable to load reviews.');
        // on error, show empty list
        setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [gameId]);

  const handleSubmit = async (payload: { rating: number; text: string }) => {
    await createReview(gameId, {
      rating: payload.rating,
      review: payload.text,
    });

    const latest = await getReviewsByGame(gameId);
    setReviews(
      latest.map((r) => ({
        ...r,
        date: r.created_at
          ? new Date(r.created_at).toLocaleDateString()
          : undefined,
        authorName:
          r.user?.profile?.display_name || r.authorName || 'Anonymous',
        authorAvatar: r.user?.profile?.avatar_url || r.authorAvatar,
        text: r.review ?? '',
      })),
    );
    setOpen(false);
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                i === 0
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition"
        >
          Write a Review
        </button>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-sm text-zinc-400">Loading reviews…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {reviews.map((r) => (
          <ReviewCard
            key={r.id}
            review={{
              id: r.id,
              authorName: r.authorName || 'Anonymous',
              authorAvatar: r.authorAvatar,
              date: r.date || '',
              rating: r.rating,
              text: r.text || '',
              likes: r.likes,
            }}
          />
        ))}
      </div>

      {open && (
        <ReviewForm
          game={game ?? { name: 'Game', genres: [] }}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
};

export default ReviewsSection;
