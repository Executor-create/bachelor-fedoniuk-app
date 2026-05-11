import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { FiSearch, FiUsers, FiUserPlus } from 'react-icons/fi';
import { LuGamepad2 } from 'react-icons/lu';
import { fetchGames, type Game } from '../api/games';
import {
  fetchUsers,
  followUser,
  unfollowUser,
  type NormalizedUser,
} from '../api/users';
import { useNavigate } from 'react-router-dom';
import {
  mergeFollowedStateFromUsers,
  persistFollowedUsersState,
  readFollowedUsersState,
  resolveFollowedState,
} from '../utils/followedUsersState';

type SearchUser = NormalizedUser;

const Search = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'games'>('users');

  const [users, setUsers] = useState<SearchUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoadingMore, setUsersLoadingMore] = useState(false);
  const [usersNextCursor, setUsersNextCursor] = useState<string | null>(null);
  const [usersHasMore, setUsersHasMore] = useState(false);

  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  const [followed, setFollowed] = useState<Record<string, boolean>>(() =>
    readFollowedUsersState(),
  );
  const [followingPending, setFollowingPending] = useState<
    Record<string, boolean>
  >({});

  const usersController = useRef<AbortController | null>(null);
  const gamesController = useRef<AbortController | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    persistFollowedUsersState(followed);
  }, [followed]);

  useEffect(() => {
    if (usersController.current) usersController.current.abort();
    if (gamesController.current) gamesController.current.abort();

    const uCtrl = new AbortController();
    const gCtrl = new AbortController();
    usersController.current = uCtrl;
    gamesController.current = gCtrl;

    const t = setTimeout(async () => {
      const trimmedQuery = query.trim();

      setUsersLoading(true);
      setUsersLoadingMore(false);
      setGamesLoading(true);

      try {
        if (trimmedQuery.length > 0) {
          // fetch all matching users by paging through results
          let allUsers: SearchUser[] = [];
          let next: string | undefined = undefined;

          do {
            const page = await fetchUsers(50, next, {
              search: trimmedQuery,
              signal: uCtrl.signal,
            });
            allUsers = [...allUsers, ...page.data];
            next = page.nextCursor || undefined;
          } while (next && !uCtrl.signal.aborted);

          setUsers(allUsers);
          setFollowed((prev) => mergeFollowedStateFromUsers(prev, allUsers));
          setUsersNextCursor(null);
          setUsersHasMore(false);
        } else {
          // fetch first page only when empty query
          const page = await fetchUsers(9, undefined, { signal: uCtrl.signal });
          const initialUsers = page.data;
          setUsers(initialUsers);
          setFollowed((prev) =>
            mergeFollowedStateFromUsers(prev, initialUsers),
          );
          setUsersNextCursor(page.nextCursor || null);
          setUsersHasMore(!!page.hasMore);
        }
      } catch (err) {
        if (!uCtrl.signal.aborted) {
          setUsers([]);
          setUsersNextCursor(null);
          setUsersHasMore(false);
        }
      } finally {
        setUsersLoading(false);
      }

      try {
        const gResp = await fetchGames(9, undefined, {
          search: trimmedQuery,
          signal: gCtrl.signal,
        });
        setGames(gResp.data || []);
      } catch (err) {
        if (
          (err as any)?.name !== 'Canceled' &&
          gCtrl.signal.aborted === false
        ) {
          setGames([]);
        }
      } finally {
        setGamesLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      uCtrl.abort();
      gCtrl.abort();
    };
  }, [query]);

  const loadMoreUsers = async () => {
    if (!usersHasMore || usersLoadingMore || !usersNextCursor) return;

    setUsersLoadingMore(true);

    try {
      const page = await fetchUsers(9, usersNextCursor, {
        search: query.trim() || undefined,
      });
      const newUsers = page.data;
      setUsers((prev) => [...prev, ...newUsers]);
      setFollowed((prev) => mergeFollowedStateFromUsers(prev, newUsers));
      setUsersNextCursor(page.nextCursor || null);
      setUsersHasMore(!!page.hasMore);
    } catch (err) {
      // ignore
    } finally {
      setUsersLoadingMore(false);
    }
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  const updateUserFollowState = (id: string, isFollowing: boolean) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) {
          return user;
        }

        const currentFollowers = user.followers ?? 0;
        const nextFollowers = Math.max(
          0,
          currentFollowers + (isFollowing ? 1 : -1),
        );

        return {
          ...user,
          isFollowing,
          followers: nextFollowers,
        };
      }),
    );
  };

  const toggleFollow = async (id: string) => {
    if (followingPending[id]) {
      return;
    }

    const currentUser = users.find((user) => user.id === id);
    const wasFollowing = resolveFollowedState(
      followed,
      id,
      currentUser?.isFollowing,
    );
    const nextFollowing = !wasFollowing;

    setFollowingPending((prev) => ({ ...prev, [id]: true }));

    // optimistic update
    setFollowed((prev) => ({ ...prev, [id]: nextFollowing }));
    updateUserFollowState(id, nextFollowing);

    try {
      if (nextFollowing) {
        await followUser(id);
      } else {
        await unfollowUser(id);
      }
    } catch (err) {
      // revert on unexpected error
      setFollowed((prev) => ({ ...prev, [id]: wasFollowing }));
      updateUserFollowState(id, wasFollowing);
      // eslint-disable-next-line no-console
      console.error('Failed to toggle follow for', id, err);
    } finally {
      setFollowingPending((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-6 gap-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800"
        >
          <div>
            <h1
              style={{
                background:
                  'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}
              className="text-4xl"
            >
              Discover
            </h1>
            <p className="text-sm text-zinc-400 font-light">
              Find gamers to follow and games to play
            </p>
          </div>

          <div className="max-w-4xl">
            <div className="relative">
              <FiSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users, games, or genres..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
              />
            </div>

            <div className="mt-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-full px-1 py-1 flex items-center gap-2 w-max">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeTab === 'users'
                      ? 'bg-(--third-color) text-white'
                      : 'text-zinc-400'
                  }`}
                >
                  <FiUsers />
                  <span>Users</span>
                  <span className="text-xs text-zinc-500">
                    ({users.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('games')}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeTab === 'games'
                      ? 'bg-(--third-color) text-white'
                      : 'text-zinc-400'
                  }`}
                >
                  <LuGamepad2 />
                  <span>Games</span>
                  <span className="text-xs text-zinc-500">
                    ({games.length})
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-6">
              {activeTab === 'users' ? (
                usersLoading && users.length === 0 ? (
                  <div className="text-zinc-500">Searching users…</div>
                ) : users.length === 0 ? (
                  <div className="text-zinc-500">No users found.</div>
                ) : (
                  <>
                    <ul className="space-y-4">
                      {users.map((u) => {
                        const isUserFollowed = resolveFollowedState(
                          followed,
                          u.id,
                          u.isFollowing,
                        );

                        return (
                          <li
                            key={u.id}
                            className="bg-(--third-color) rounded-2xl border border-gray-700 p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-white text-lg font-bold">
                                {u.avatar ? (
                                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                  <img
                                    src={u.avatar}
                                    alt={u.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{initials(u.username || 'U')}</span>
                                )}
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/profile/${u.id}`, {
                                      state: {
                                        user: {
                                          ...u,
                                          isFollowing: isUserFollowed,
                                        },
                                      },
                                    })
                                  }
                                  className="text-white font-bold text-lg text-left hover:underline cursor-pointer"
                                >
                                  {u.username}
                                </button>
                                <div className="text-sm text-zinc-400">
                                  {u.tag}
                                </div>
                                {u.bio && (
                                  <div className="text-sm text-zinc-400 mt-1">
                                    {u.bio}
                                  </div>
                                )}
                                <div className="text-sm text-zinc-500 mt-2">
                                  {(u.followers || 0).toLocaleString()}{' '}
                                  followers •{' '}
                                  {(u.following || 0).toLocaleString()}{' '}
                                  following
                                </div>
                              </div>
                            </div>

                            <div>
                              <button
                                onClick={() => toggleFollow(u.id)}
                                disabled={!!followingPending[u.id]}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition whitespace-nowrap ${
                                  isUserFollowed
                                    ? 'bg-zinc-800 text-white border border-zinc-700'
                                    : 'bg-linear-to-r from-violet-500 to-pink-500 text-white'
                                } ${followingPending[u.id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                              >
                                <FiUserPlus />
                                {followingPending[u.id]
                                  ? 'Updating...'
                                  : isUserFollowed
                                    ? 'Unfollow'
                                    : 'Follow'}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {usersHasMore && (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={async (e) => {
                            const prevScroll = mainRef.current?.scrollTop ?? 0;
                            await loadMoreUsers();
                            // restore scroll position after new items render
                            if (mainRef.current) {
                              requestAnimationFrame(() => {
                                mainRef.current!.scrollTop = prevScroll;
                              });
                            }
                            (e.currentTarget as HTMLButtonElement).blur();
                          }}
                          disabled={usersLoadingMore}
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg"
                        >
                          {usersLoadingMore ? 'Loading...' : 'Load more users'}
                        </button>
                      </div>
                    )}
                  </>
                )
              ) : gamesLoading ? (
                <div className="text-zinc-500">Searching games…</div>
              ) : games.length === 0 ? (
                <div className="text-zinc-500">No games found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((g) => (
                    <article
                      key={g.id}
                      onClick={() => navigate(`/games/${g.id}`)}
                      className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer"
                    >
                      <div className="relative h-36 overflow-hidden bg-zinc-800 shrink-0">
                        {g.background_image ? (
                          <img
                            src={g.background_image}
                            alt={g.name}
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
                          {g.name}
                        </h2>
                        <div className="text-sm text-zinc-500">
                          {g.release_date}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Search;
