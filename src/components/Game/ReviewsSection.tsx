import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelatedGames, type Game as RelatedGame } from '../../api/games';
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
  const [activeTab, setActiveTab] = useState(0);
  const [relatedGames, setRelatedGames] = useState<RelatedGame[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);
  const navigate = useNavigate();
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

  useEffect(() => {
    if (activeTab !== 2) return;
    let mounted = true;
    const fetchRelated = async () => {
      setRelatedLoading(true);
      setRelatedError(null);
      try {
        const data = await getRelatedGames(gameId, 12);
        if (!mounted) return;
        setRelatedGames(data || []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setRelatedError('Unable to load related games.');
        setRelatedGames([]);
      } finally {
        if (mounted) setRelatedLoading(false);
      }
    };

    fetchRelated();
    return () => {
      mounted = false;
    };
  }, [activeTab, gameId]);

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
              onClick={() => setActiveTab(i)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                i === activeTab
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
        {activeTab === 0 && (
          <>
            {loading && (
              <p className="text-sm text-zinc-400">Loading reviews…</p>
            )}
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
          </>
        )}

        {activeTab === 1 && (
          <div className="text-sm text-zinc-500">
            Community content coming soon.
          </div>
        )}

        {activeTab === 2 && (
          <div>
            {relatedLoading && (
              <p className="text-sm text-zinc-400">Loading related games…</p>
            )}
            {relatedError && (
              <p className="text-sm text-red-400">{relatedError}</p>
            )}
            {!relatedLoading && relatedGames.length === 0 && !relatedError && (
              <p className="text-sm text-zinc-500">No related games found.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
              {relatedGames.map((g) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/games/${g.id}`)}
                  className="group text-left transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01]"
                >
                  <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/5 shadow-lg shadow-black/20 transition-all duration-200 group-hover:border-white/12">
                    <div className="relative aspect-16/9 overflow-hidden">
                      <img
                        src={g.background_image}
                        alt={g.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1 px-3 py-3">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {g.name}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {g.genres?.[0] ?? 'Game'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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
