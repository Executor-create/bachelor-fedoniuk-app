import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiActivity, FiClock, FiAward } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { fetchPopularGames, fetchGames } from '../api/games';
import type { PopularGame } from '../api/games';
import { fetchMostLikedPosts } from '../api/posts';
import type { MostLikedPost } from '../api/posts';
import { fetchUsers } from '../api/users';
import { renderStars } from '../utils/renderStars';

const formatCount = (n: number): string => {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};

// ─── Stat card ───────────────────────────────────────────────────────────────
type StatCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
};

function StatCard({ icon, iconBg, value, label }: StatCardProps) {
  return (
    <div className="flex-1 flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-white font-mono leading-tight">
          {value}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Game card ────────────────────────────────────────────────────────────────
function TrendingGameCard({
  game,
  rank,
  onClick,
}: {
  game: PopularGame;
  rank: number;
  onClick: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/60 transition-all duration-200 cursor-pointer"
    >
      <span className="absolute top-2 left-2 z-10 bg-violet-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
        #{rank}
      </span>
      <div className="relative h-40 overflow-hidden bg-zinc-800 shrink-0">
        {game.background_image ? (
          <img
            src={game.background_image}
            alt={game.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-zinc-900 to-transparent" />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-bold text-white leading-snug tracking-tight truncate">
          {game.name}
        </h3>
        <p className="text-[11px] text-zinc-500 font-mono">
          {game.reviewCount} {game.reviewCount === 1 ? 'review' : 'reviews'}
        </p>
        <div className="flex items-center gap-1 mt-auto pt-2 border-t border-zinc-800">
          {renderStars(game.rating)}
          <span className="text-xs font-semibold text-white ml-1 font-mono">
            {game.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
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

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Games', 'Posts'] as const;
type Tab = (typeof TABS)[number];

type Stats = {
  hotTopics: string;
  trendingGames: string;
  activeUsers: string;
  newReleases: string;
};

// ─── Main page ────────────────────────────────────────────────────────────────
const TrendingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Games');
  const [games, setGames] = useState<PopularGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [posts, setPosts] = useState<MostLikedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    hotTopics: '—',
    trendingGames: '—',
    activeUsers: '—',
    newReleases: '—',
  });

  // Load all data in a single mount effect to avoid duplicate requests.
  // fetchMostLikedPosts and fetchPopularGames are each called only once;
  // their results are reused for both the stat counters and the tab content.
  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setPostsLoading(true);
    setError(null);
    setPostsError(null);

    Promise.allSettled([
      fetchPopularGames(6),
      fetchMostLikedPosts(6),
      fetchUsers(100),
      fetchGames(50),
    ]).then(([gamesRes, postsRes, usersRes, newReleasesRes]) => {
      if (!isMounted) return;

      if (gamesRes.status === 'fulfilled') {
        setGames(gamesRes.value);
        setStats((prev) => ({
          ...prev,
          trendingGames: formatCount(gamesRes.value.length),
        }));
      } else {
        setError('Unable to fetch trending games.');
      }
      setLoading(false);

      if (postsRes.status === 'fulfilled') {
        setPosts(postsRes.value);
        setStats((prev) => ({
          ...prev,
          hotTopics: formatCount(postsRes.value.length),
        }));
      } else {
        setPostsError('Unable to fetch trending posts.');
      }
      setPostsLoading(false);

      setStats((prev) => ({
        ...prev,
        activeUsers:
          usersRes.status === 'fulfilled'
            ? formatCount(usersRes.value.data.length)
            : '—',
        newReleases:
          newReleasesRes.status === 'fulfilled'
            ? formatCount(newReleasesRes.value.data.length)
            : '—',
      }));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />
        <main className="page-enter flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-8 gap-7 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          {/* ── Page heading ── */}
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <FiTrendingUp className="text-violet-300" size={14} />
              <span>Trending</span>
            </div>
            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              What&apos;s trending this week
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              Discover what&apos;s hot in the gaming community right now
            </p>
          </div>

          {/* ── Stats row ── */}
          <div className="flex gap-4">
            <StatCard
              iconBg="bg-red-500/15"
              icon={<FiActivity size={18} className="text-red-400" />}
              value={stats.hotTopics}
              label="Hot Topics"
            />
            <StatCard
              iconBg="bg-violet-500/15"
              icon={<FiTrendingUp size={18} className="text-violet-400" />}
              value={stats.trendingGames}
              label="Trending Games"
            />
            <StatCard
              iconBg="bg-emerald-500/15"
              icon={<FiClock size={18} className="text-emerald-400" />}
              value={stats.activeUsers}
              label="Active Users"
            />
            <StatCard
              iconBg="bg-amber-500/15"
              icon={<FiAward size={18} className="text-amber-400" />}
              value={stats.newReleases}
              label="New Releases"
            />
          </div>

          {/* ── Tab switcher ── */}
          <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-1 self-start">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeTab === tab
                    ? 'bg-white text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          {activeTab === 'Games' && (
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FiActivity size={16} className="text-red-400" />
                  <h2 className="text-white font-bold text-base">
                    Most Popular Games This Week
                  </h2>
                </div>
                <p className="text-zinc-500 text-sm">
                  Based on player activity and reviews
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-4xl opacity-20">⚠</span>
                  <p className="text-sm text-zinc-500">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {games.map((game, idx) => (
                    <TrendingGameCard
                      key={game.id}
                      game={game}
                      rank={idx + 1}
                      onClick={() => navigate(`/games/${game.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'Posts' && (
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FiTrendingUp size={16} className="text-violet-400" />
                  <h2 className="text-white font-bold text-base">
                    Most Liked Posts This Week
                  </h2>
                </div>
                <p className="text-zinc-500 text-sm">
                  Top community posts by likes
                </p>
              </div>

              {postsLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-zinc-800/50 rounded-xl p-4 space-y-2 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700" />
                        <div className="h-3 bg-zinc-700 rounded-full w-32" />
                      </div>
                      <div className="h-3 bg-zinc-700 rounded-full w-full" />
                      <div className="h-3 bg-zinc-700 rounded-full w-2/3" />
                    </div>
                  ))}
                </div>
              ) : postsError ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-4xl opacity-20">⚠</span>
                  <p className="text-sm text-zinc-500">{postsError}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-4xl opacity-20">💬</span>
                  <p className="text-sm text-zinc-500">No trending posts yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {posts.map((item, idx) => {
                    const { post, likeCount } = item;
                    const username =
                      post.user?.profile?.display_name ||
                      post.user?.username ||
                      post.author?.username ||
                      'Unknown';
                    const avatar =
                      post.user?.profile?.avatar_url ||
                      post.user?.avatar ||
                      post.author?.avatar;
                    return (
                      <article
                        key={post.id}
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="flex items-start gap-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 cursor-pointer transition-all duration-150"
                      >
                        <span className="text-[11px] font-bold text-violet-400 font-mono w-5 shrink-0 mt-1">
                          #{idx + 1}
                        </span>
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={username}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center text-zinc-400 text-xs font-bold">
                            {username[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-300 mb-1">
                            {username}
                          </p>
                          <p className="text-sm text-zinc-400 leading-snug line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 text-xs text-zinc-500 font-mono">
                          <span>❤️</span>
                          <span>{likeCount}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Removed Genres tab as requested */}
        </main>
      </div>
    </div>
  );
};

export default TrendingPage;
