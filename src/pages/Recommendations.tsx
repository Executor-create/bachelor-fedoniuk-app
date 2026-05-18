import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  getRecommendations,
  type RecommendedGame,
} from '../api/recommendations';
import { renderStars } from '../utils/renderStars';
import { useAuth } from '../contexts/AuthContext';
import { hasPremiumAccess } from '../utils/subscriptionUtils';

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="h-40 bg-zinc-800 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-zinc-800 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded-full w-2/5 animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded-full w-1/2 animate-pulse mt-3" />
      </div>
    </div>
  );
}

const Recommendations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPremium = hasPremiumAccess(user);
  const freeVisibleCount = 6;

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getRecommendations(12, controller.signal);

        if (!isActive) return;

        setRecommendations(data.data);
        setPersonalized(data.personalized);
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;

        setError('Unable to load recommendations.');
        console.error('Failed to load recommendations:', err);
      } finally {
        if (!isActive) return;

        setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="page-enter flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-6 gap-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          {/* heading */}
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <FiStar className="text-violet-300" size={14} />
              <span>AI Recommendations</span>
            </div>
            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {personalized ? 'Recommended for You' : 'Popular This Week'}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              {personalized
                ? 'Personalized game suggestions based on your gaming preferences and activity'
                : 'Discover popular games based on community ratings and activity'}
            </p>
          </div>

          {/* info box */}
          <div className="max-w-2xl border border-white/10 bg-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-violet-400 mt-0.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="10" cy="10" r="9" />
                  <path d="M10 6v4m0 4h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  How recommendations work
                </h3>
                <p className="text-sm text-zinc-400 leading-6">
                  Our AI analyzes your favorite games, play history, reviews,
                  and the preferences of users with similar tastes to suggest
                  games you'll love. The confidence score shows how well each
                  game matches your profile.
                </p>
              </div>
            </div>
          </div>

          {!isPremium && recommendations.length > freeVisibleCount && (
            <div className="max-w-2xl border border-violet-500/30 bg-violet-500/10 rounded-2xl p-4 text-sm text-violet-100">
              <p className="font-semibold">
                Free preview shows {freeVisibleCount} recommendations.
              </p>
              <p className="mt-1 text-xs text-violet-200/80">
                Upgrade to Premium to unlock the full list and advanced
                recommendations.
              </p>
              <button
                type="button"
                onClick={() => navigate('/upgrade')}
                className="mt-3 inline-flex rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-100 hover:bg-violet-500/30"
              >
                View Premium plans
              </button>
            </div>
          )}

          {/* recommendations grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="text-4xl opacity-20">⚠</span>
              <p className="text-sm text-zinc-500">{error}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="text-4xl opacity-20">🎮</span>
              <p className="text-sm text-zinc-500">No recommendations yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((game, index) => {
                const isLocked = !isPremium && index >= freeVisibleCount;
                const score = Math.max(0, Math.min(1, game.score ?? 0));
                const rating = game.rating ?? 0;
                const releaseDate =
                  game.release_date || 'Release date unavailable';
                const imageSrc =
                  game.background_image ||
                  'https://via.placeholder.com/640x360';

                return (
                  <article
                    key={game.id}
                    onClick={() =>
                      navigate(isLocked ? '/upgrade' : `/games/${game.id}`)
                    }
                    className={`group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
                      isLocked
                        ? 'cursor-not-allowed opacity-80'
                        : 'hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/60 cursor-pointer'
                    }`}
                  >
                    {/* Confidence badge */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                      <span>📈</span>
                      <span>{Math.round(score * 100)}%</span>
                    </div>

                    <div
                      className={`relative h-40 overflow-hidden bg-zinc-800 shrink-0 ${
                        isLocked ? 'blur-md brightness-75' : ''
                      }`}
                    >
                      <img
                        src={imageSrc}
                        alt={game.name}
                        loading="lazy"
                        className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                          isLocked ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-zinc-900 to-transparent"></div>
                    </div>

                    <div
                      className={`p-4 flex flex-col flex-1 gap-2 ${
                        isLocked ? 'blur-md opacity-40 select-none' : ''
                      }`}
                    >
                      <h3 className="text-sm font-bold text-white leading-snug tracking-tight truncate">
                        {game.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {releaseDate}
                      </p>
                      <div className="flex items-center gap-1 mt-auto pt-2 border-t border-zinc-800">
                        {renderStars(rating)}
                        <span className="text-xs font-semibold text-white ml-1 font-mono">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {isLocked && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60 text-center px-6">
                        <p className="text-sm font-semibold text-white">
                          Premium only
                        </p>
                        <p className="text-xs text-zinc-300">
                          Unlock full recommendations with Premium.
                        </p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate('/upgrade');
                          }}
                          className="rounded-full border border-violet-400/40 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-violet-100 hover:bg-violet-500/30"
                        >
                          Upgrade
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Recommendations;
