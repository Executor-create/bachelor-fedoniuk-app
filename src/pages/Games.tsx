import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiBox } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { fetchGames } from '../api/games';
import type { Game } from '../api/games';
import { renderStars } from '../utils/renderStars';

type FilterValues = 'All' | 'Action' | 'RPG' | 'Strategy' | 'Shooter';
const genres: FilterValues[] = ['All', 'Action', 'RPG', 'Strategy', 'Shooter'];
const platforms = ['All', 'PC', 'Console', 'Mobile'];
const PAGE_SIZE = 9;

const CONSOLE_KEYWORDS = [
  'playstation',
  'xbox',
  'nintendo',
  'switch',
  'wii',
  'sega',
  'game boy',
  'gameboy',
  'game gear',
  'dreamcast',
  'atari',
  'ps vita',
  'psp',
  '3ds',
  'ds',
];
const MOBILE_KEYWORDS = ['ios', 'android'];

const matchesPlatformFilter = (
  gamePlatforms: string[],
  filter: string,
): boolean => {
  if (filter === 'All') return true;
  const lower = gamePlatforms.map((p) => p.toLowerCase());
  if (filter === 'PC')
    return lower.some((p) => p === 'pc' || p === 'macos' || p === 'linux');
  if (filter === 'Console')
    return lower.some((p) => CONSOLE_KEYWORDS.some((kw) => p.includes(kw)));
  if (filter === 'Mobile')
    return lower.some((p) => MOBILE_KEYWORDS.some((kw) => p.includes(kw)));
  return lower.some((p) => p.includes(filter.toLowerCase()));
};

function MetacriticBadge({ score }: { score: number }) {
  const colorClass =
    score >= 80
      ? 'border-emerald-500 text-emerald-400'
      : score >= 60
        ? 'border-yellow-400 text-yellow-300'
        : 'border-red-500 text-red-400';
  return (
    <span
      className={`border-2 rounded text-[11px] font-bold px-1 leading-none font-mono tracking-wide ${colorClass}`}
    >
      {score}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="h-36 bg-zinc-800 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-zinc-800 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded-full w-2/5 animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded-full w-1/2 animate-pulse mt-3" />
      </div>
    </div>
  );
}

export const GamesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const cursor = searchParams.get('cursor') || undefined;
  const searchText = searchParams.get('search') || '';
  const genreFilter = (searchParams.get('genre') || 'All') as FilterValues;
  const platformFilter = searchParams.get('platform') || 'All';

  const [prevCursors, setPrevCursors] = useState<(string | undefined)[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        if (searchText.trim().length > 0) {
          let allGames: Game[] = [];
          let nextPageCursor: string | undefined = undefined;

          do {
            const pageData = await fetchGames(PAGE_SIZE, nextPageCursor, {
              search: searchText.trim(),
              genre: genreFilter !== 'All' ? genreFilter : undefined,
              platform: platformFilter !== 'All' ? platformFilter : undefined,
              signal: controller.signal,
            });

            allGames = [...allGames, ...pageData.data];
            nextPageCursor = pageData.nextCursor || undefined;
          } while (nextPageCursor && !controller.signal.aborted);

          setGames(
            allGames.filter((g) =>
              g.name.toLowerCase().includes(searchText.trim().toLowerCase()),
            ),
          );
          setNextCursor(null);
          setHasMore(false);
        } else {
          const isFiltered = genreFilter !== 'All' || platformFilter !== 'All';

          if (!isFiltered) {
            const data = await fetchGames(PAGE_SIZE, cursor, {
              signal: controller.signal,
            });
            setGames(data.data);
            setNextCursor(data.nextCursor || null);
            setHasMore(data.hasMore);
          } else {
            const matchesFilters = (game: Game) => {
              const genreMatch =
                genreFilter === 'All' ||
                game.genres.some((g) =>
                  g.toLowerCase().includes(genreFilter.toLowerCase()),
                );
              const platformMatch = matchesPlatformFilter(
                game.platforms,
                platformFilter,
              );
              return genreMatch && platformMatch;
            };

            let accumulated: Game[] = [];
            let pageCursor: string | undefined = cursor;
            let lastNextCursor: string | null = null;
            let lastHasMore = false;

            do {
              const data = await fetchGames(PAGE_SIZE, pageCursor, {
                genre: genreFilter !== 'All' ? genreFilter : undefined,
                platform: platformFilter === 'PC' ? platformFilter : undefined,
                signal: controller.signal,
              });

              accumulated = [
                ...accumulated,
                ...data.data.filter(matchesFilters),
              ];
              lastNextCursor = data.nextCursor || null;
              lastHasMore = data.hasMore;
              pageCursor = data.nextCursor || undefined;
            } while (
              accumulated.length < PAGE_SIZE &&
              lastHasMore &&
              pageCursor &&
              !controller.signal.aborted
            );

            setGames(accumulated.slice(0, PAGE_SIZE));
            setNextCursor(lastNextCursor);
            setHasMore(lastHasMore);
          }
        }
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;
        setError('Unable to fetch games.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [cursor, searchText, genreFilter, platformFilter]);

  const navigate = useNavigate();
  const prevSearchParamsRef = useRef(searchParams);
  useEffect(() => {
    const prev = prevSearchParamsRef.current;
    const filterChanged =
      prev.get('search') !== searchParams.get('search') ||
      prev.get('genre') !== searchParams.get('genre') ||
      prev.get('platform') !== searchParams.get('platform');
    if (filterChanged) setPrevCursors([]);
    prevSearchParamsRef.current = searchParams;
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value === 'All') next.delete(key);
      else next.set(key, value);
      next.delete('cursor');
      return next;
    });
    setPrevCursors([]);
  };

  const isSearching = !!searchText;

  const visibleGames = games.filter((game) => {
    const genreMatch =
      genreFilter === 'All' ||
      game.genres.some((g) =>
        g.toLowerCase().includes(genreFilter.toLowerCase()),
      );
    const platformMatch = matchesPlatformFilter(game.platforms, platformFilter);
    return genreMatch && platformMatch;
  });

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-6 gap-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          {/* heading */}
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <FiBox className="text-violet-300" size={14} />
              <span>Browse Games</span>
            </div>
            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Discover your next favorite game
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              Explore our collection of games across different genres and
              platforms with detailed reviews and ratings.
            </p>
          </div>

          {/* filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M15 15l-3-3" strokeLinecap="round" />
              </svg>
              <input
                value={searchText}
                onChange={(e) => updateParam('search', e.target.value)}
                placeholder="Search games…"
                aria-label="Search games"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
              />
            </div>

            <div className="w-px h-7 bg-zinc-800 self-center" />

            <div className="flex gap-1.5 flex-wrap">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => updateParam('genre', g)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                    genreFilter === g
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="w-px h-7 bg-zinc-800 self-center" />

            <div className="flex gap-1.5 flex-wrap">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('platform', p)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                    platformFilter === p
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="text-4xl opacity-20">⚠</span>
              <p className="text-sm text-zinc-500">{error}</p>
            </div>
          ) : visibleGames.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="text-4xl opacity-20">🎮</span>
              <p className="text-sm text-zinc-500">
                No games found for current filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 flex-1 content-start">
              {visibleGames.map((game) => (
                <article
                  key={game.id}
                  onClick={() => {
                    navigate(`/games/${game.id}`);
                  }}
                  className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/60 transition-all duration-200 cursor-pointer"
                >
                  <div className="relative h-36 overflow-hidden bg-zinc-800 shrink-0">
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
                    <h2 className="text-sm font-bold text-white leading-snug tracking-tight truncate">
                      {game.name}
                    </h2>

                    <div className="flex flex-wrap gap-1">
                      {game.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="text-[10px] font-medium uppercase tracking-widest text-violet-300 bg-violet-500/10 rounded px-1.5 py-0.5"
                        >
                          {g}
                        </span>
                      ))}
                      {game.platforms.slice(0, 2).map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
                      <div className="flex items-center gap-1">
                        {renderStars(game.rating)}
                        <span className="text-xs font-semibold text-white ml-1 font-mono">
                          {game.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MetacriticBadge score={game.metacritic_rating} />
                        <span className="text-[11px] text-zinc-600">
                          {game.release_date}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="flex items-center justify-center pt-4 border-t border-zinc-800 shrink-0 gap-4">
              <button
                onClick={() => {
                  const prev = prevCursors[prevCursors.length - 1];
                  setPrevCursors((p) => p.slice(0, -1));
                  setSearchParams((sp) => {
                    const next = new URLSearchParams(sp);
                    if (prev) next.set('cursor', prev);
                    else next.delete('cursor');
                    return next;
                  });
                }}
                disabled={isSearching || prevCursors.length === 0}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M10 3L5 8l5 5" />
                </svg>
                Previous
              </button>

              <button
                onClick={() => {
                  if (!nextCursor) return;
                  setPrevCursors((p) => [...p, cursor]);
                  setSearchParams((sp) => {
                    const next = new URLSearchParams(sp);
                    next.set('cursor', nextCursor);
                    return next;
                  });
                }}
                disabled={isSearching || !hasMore}
                className="flex items-center gap-2 bg-violet-600 border border-violet-600 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 hover:border-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
