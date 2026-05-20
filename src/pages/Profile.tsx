import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileConnectionsModal from '../components/Profile/ProfileConnectionsModal';
import ProfileTabs from '../components/Profile/ProfileTabs';
import ProfileReviewCard from '../components/Profile/ProfileReviewCard';
import { useProfileUser } from '../hooks/useProfileUser';
import { useProfileReviews } from '../hooks/useProfileReviews';
import { useAuth } from '../contexts/AuthContext';
import FeedItem from '../components/Feed/FeedItem';
import { getPostsByUser, type Post } from '../api/posts';
import { getUserFavoriteGames, type FavoriteGame } from '../api/games';
import {
  followUser,
  getFollowers,
  getFollowing,
  getFriends,
  type NormalizedUser,
  unfollowUser,
} from '../api/users';
type ConnectionsState = {
  items: NormalizedUser[];
  isLoading: boolean;
  error: string | null;
};

const formatRelativeTime = (value?: string) => {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('Favorite Games');

  const {
    selectedUser,
    selectedUserLoading,
    selectedUserError,
    isExternalProfile,
    externalIsFollowing,
    followActionPending,
    toggleExternalFollow,
    followed: globalFollowed,
    refreshProfile,
  } = useProfileUser();

  const { userReviews, reviewsLoading, reviewsError } = useProfileReviews(
    selectedTab,
    isExternalProfile,
  );

  const [activityPosts, setActivityPosts] = useState<Post[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [favoriteGames, setFavoriteGames] = useState<FavoriteGame[]>([]);
  const [favoriteGamesLoading, setFavoriteGamesLoading] = useState(false);
  const [favoriteGamesError, setFavoriteGamesError] = useState<string | null>(
    null,
  );

  const profileId = isExternalProfile ? selectedUser?.id : user?.id;

  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);

  const [followersState, setFollowersState] = useState<ConnectionsState>({
    items: [],
    isLoading: false,
    error: null,
  });
  const [followingState, setFollowingState] = useState<ConnectionsState>({
    items: [],
    isLoading: false,
    error: null,
  });
  const [friendsState, setFriendsState] = useState<ConnectionsState>({
    items: [],
    isLoading: false,
    error: null,
  });
  const [pendingFollowIds, setPendingFollowIds] = useState<
    Record<string, boolean>
  >({});

  const profileHeaderData = useMemo(() => {
    if (!isExternalProfile || !selectedUser) return undefined;

    return {
      displayName: selectedUser.username,
      handle: selectedUser.tag,
      bio: selectedUser.bio,
      avatarUrl: selectedUser.avatar,
      joinedAt: selectedUser.joinedAt,
      createdAt: selectedUser.createdAt,
      followers: selectedUser.followers,
      following: selectedUser.following,
    };
  }, [isExternalProfile, selectedUser]);

  const formatFavoriteTime = useCallback((value?: string) => {
    if (!value) return 'Recently added';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recently added';

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }, []);

  const loadFollowers = useCallback(async () => {
    if (!profileId) return;
    setFollowersState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getFollowers(profileId);
      setFollowersState({ items: data, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to load followers', error);
      setFollowersState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Unable to load followers.',
      }));
    }
  }, [profileId]);

  const loadFollowing = useCallback(async () => {
    if (!profileId) return;
    setFollowingState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getFollowing(profileId);
      setFollowingState({ items: data, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to load following', error);
      setFollowingState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Unable to load following.',
      }));
    }
  }, [profileId]);

  const loadFriends = useCallback(async () => {
    if (!profileId) return;
    setFriendsState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getFriends(profileId);
      setFriendsState({ items: data, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to load friends', error);
      setFriendsState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Unable to load friends.',
      }));
    }
  }, [profileId]);

  // Always reload the connection list each time the modal is opened so that
  // any follow/unfollow changes made outside the modal are reflected.
  useEffect(() => {
    if (followersOpen) loadFollowers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followersOpen]);

  useEffect(() => {
    if (followingOpen) loadFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followingOpen]);

  useEffect(() => {
    if (friendsOpen) loadFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendsOpen]);

  useEffect(() => {
    if (selectedTab !== 'Activity' || !profileId) return;

    let mounted = true;

    const loadActivityPosts = async () => {
      setActivityLoading(true);
      setActivityError(null);

      try {
        const posts = await getPostsByUser(profileId);
        if (!mounted) return;
        setActivityPosts(posts);
      } catch (error) {
        console.error('Failed to load activity posts', error);
        if (!mounted) return;
        setActivityError('Unable to load activity posts.');
        setActivityPosts([]);
      } finally {
        if (mounted) setActivityLoading(false);
      }
    };

    loadActivityPosts();

    return () => {
      mounted = false;
    };
  }, [profileId, selectedTab]);

  useEffect(() => {
    if (!profileId) return;

    let mounted = true;

    const loadFavoriteGames = async () => {
      setFavoriteGamesLoading(true);
      setFavoriteGamesError(null);

      try {
        const games = await getUserFavoriteGames(profileId);
        if (!mounted) return;

        setFavoriteGames(games);
      } catch (error) {
        console.error('Failed to load favorite games', error);
        if (!mounted) return;

        setFavoriteGamesError('Unable to load favorite games.');
        setFavoriteGames([]);
      } finally {
        if (mounted) setFavoriteGamesLoading(false);
      }
    };

    loadFavoriteGames();

    return () => {
      mounted = false;
    };
  }, [profileId]);

  const updateFollowState = useCallback(
    (
      setter: Dispatch<SetStateAction<ConnectionsState>>,
      targetId: string,
      nextFollowing: boolean,
      delta: number,
    ) => {
      setter((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === targetId
            ? {
                ...item,
                isFollowing: nextFollowing,
                followers: Math.max(0, (item.followers ?? 0) + delta),
              }
            : item,
        ),
      }));
    },
    [],
  );

  const toggleFollowFromList = useCallback(
    async (
      target: NormalizedUser,
      listType: 'followers' | 'following' | 'friends',
    ) => {
      const setter =
        listType === 'followers'
          ? setFollowersState
          : listType === 'following'
            ? setFollowingState
            : setFriendsState;

      // Bug fix: resolve wasFollowing from connectionsFollowedMap (which reflects
      // optimistic updates from prior clicks) before falling back to target.isFollowing.
      // This prevents the button showing "Follow" for users you already follow when
      // the backend connections list didn't include an is_following field.
      const resolvedIsFollowing = (
        currentConnFollowedMap: Record<string, boolean>,
      ) =>
        target.id in currentConnFollowedMap
          ? currentConnFollowedMap[target.id]
          : target.id in globalFollowed
            ? globalFollowed[target.id]
            : !!target.isFollowing;

      // Read current map snapshot synchronously for the delta calculation
      const wasFollowing = resolvedIsFollowing(
        (() => {
          const map: Record<string, boolean> = {};
          for (const list of [
            followersState.items,
            followingState.items,
            friendsState.items,
          ]) {
            for (const item of list) {
              if (typeof item.isFollowing === 'boolean')
                map[item.id] = item.isFollowing;
            }
          }
          return map;
        })(),
      );
      const delta = wasFollowing ? -1 : 1;

      setPendingFollowIds((prev) => ({ ...prev, [target.id]: true }));
      updateFollowState(setter, target.id, !wasFollowing, delta);

      try {
        if (wasFollowing) {
          await unfollowUser(target.id);
        } else {
          await followUser(target.id);
        }
        // Bug fix: after a successful API call, refresh the profile header counts
        // so the Followers/Following numbers in the stat cards stay accurate.
        refreshProfile();
      } catch (error) {
        console.error('Failed to update follow state', error);
        updateFollowState(setter, target.id, wasFollowing, -delta);
      } finally {
        setPendingFollowIds((prev) => ({ ...prev, [target.id]: false }));
      }
    },
    [
      updateFollowState,
      globalFollowed,
      followersState.items,
      followingState.items,
      friendsState.items,
      refreshProfile,
    ],
  );

  const navigateToProfileFromConnections = useCallback(
    (target: NormalizedUser) => {
      setFollowersOpen(false);
      setFollowingOpen(false);
      setFriendsOpen(false);
      navigate(`/profile/${target.id}`);
    },
    [navigate],
  );

  // Bug fix: build the followed map by layering sources from least to most
  // authoritative:
  //   1. globalFollowed (localStorage — may be stale but covers users whose
  //      isFollowing wasn't returned by the connections API endpoint)
  //   2. item.isFollowing from the freshly loaded list (API truth)
  // This ensures Follow/Unfollow buttons in the modal always show the correct
  // state even when the backend omits is_following in the connections response.
  const connectionsFollowedMap = useMemo(() => {
    // Start from the globally persisted follow state as a baseline
    const map: Record<string, boolean> = { ...globalFollowed };
    // Overwrite with the fresh per-item values when available
    for (const item of [
      ...followersState.items,
      ...followingState.items,
      ...friendsState.items,
    ]) {
      if (typeof item.isFollowing === 'boolean') {
        map[item.id] = item.isFollowing;
      }
    }
    return map;
  }, [
    globalFollowed,
    followersState.items,
    followingState.items,
    friendsState.items,
  ]);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="page-enter flex-1 overflow-y-auto px-8 pt-8 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <ProfileHeader
              profileData={profileHeaderData}
              loading={isExternalProfile ? selectedUserLoading : false}
              error={isExternalProfile ? selectedUserError : null}
              showEditButton={!isExternalProfile}
              isFollowing={externalIsFollowing}
              onToggleFollow={
                isExternalProfile ? toggleExternalFollow : undefined
              }
              followActionPending={
                isExternalProfile ? followActionPending : false
              }
              friendsCount={friendsState.items.length}
              onOpenFollowers={() => setFollowersOpen(true)}
              onOpenFollowing={() => setFollowingOpen(true)}
              onOpenFriends={() => setFriendsOpen(true)}
            />

            <ProfileTabs activeTab={selectedTab} onTabChange={setSelectedTab} />

            {selectedTab === 'Favorite Games' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                  Favorite Games
                </h3>
                {favoriteGamesLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden animate-pulse"
                      >
                        <div className="h-36 bg-zinc-800" />
                        <div className="p-4 space-y-2">
                          <div className="h-3 bg-zinc-800 rounded-full w-3/4" />
                          <div className="h-3 bg-zinc-800 rounded-full w-2/5" />
                          <div className="h-3 bg-zinc-800 rounded-full w-1/2 mt-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {favoriteGamesError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
                    {favoriteGamesError}
                  </div>
                )}
                {!favoriteGamesLoading &&
                  !favoriteGamesError &&
                  favoriteGames.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <span className="text-4xl opacity-20">🎮</span>
                      <p className="text-sm text-zinc-500">
                        No favorite games yet.
                      </p>
                    </div>
                  )}
                {!favoriteGamesLoading &&
                  !favoriteGamesError &&
                  favoriteGames.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteGames.map((game) => (
                        <article
                          key={game.id}
                          className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40"
                        >
                          <div className="relative h-36 overflow-hidden bg-zinc-800">
                            <img
                              src={game.background_image}
                              alt={game.name}
                              loading="lazy"
                              decoding="async"
                              width={400}
                              height={144}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-zinc-900 to-transparent" />
                          </div>
                          <div className="space-y-2 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="truncate text-sm font-semibold text-white">
                                {game.name}
                              </h4>
                              <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                                {typeof game.rating === 'number'
                                  ? game.rating.toFixed(1)
                                  : 'N/A'}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-xs text-zinc-500">
                              {game.genres?.length
                                ? game.genres.join(', ')
                                : 'Game'}
                            </p>
                            <p className="text-[11px] text-zinc-600">
                              Favorited {formatFavoriteTime(game.favoritedAt)}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {selectedTab === 'Activity' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                  Activity
                </h3>
                {activityLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <span className="text-4xl opacity-20">🕹️</span>
                    <p className="text-sm text-zinc-500">
                      Loading activity posts…
                    </p>
                  </div>
                )}
                {activityError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
                    {activityError}
                  </div>
                )}
                {!activityLoading &&
                  !activityError &&
                  activityPosts.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <span className="text-4xl opacity-20">🕹️</span>
                      <p className="text-sm text-zinc-500">
                        No activity posts yet.
                      </p>
                    </div>
                  )}
                {!activityLoading &&
                  !activityError &&
                  activityPosts.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                      {activityPosts.map((post) => {
                        const userName =
                          post.user?.profile?.display_name ??
                          post.user?.username ??
                          post.author?.username ??
                          'Gamer';
                        const avatar =
                          post.user?.profile?.avatar_url ??
                          post.user?.avatar ??
                          post.author?.avatar;
                        const timestamp = formatRelativeTime(
                          post.created_at ??
                            post.createdAt ??
                            post.updated_at ??
                            post.updatedAt,
                        );

                        const commentCount =
                          post.comments ??
                          (post as any).commentsCount ??
                          (post as any).comment_count ??
                          post.commentsList?.length ??
                          0;

                        return (
                          <FeedItem
                            key={post.id}
                            postId={post.id}
                            userId={user?.id}
                            user={userName}
                            avatar={avatar}
                            content={post.content}
                            image={post.image}
                            timestamp={timestamp}
                            likes={post.likes ?? 0}
                            isLiked={post.isLiked ?? false}
                            comments={commentCount}
                            taggedGames={post.taggedGames}
                          />
                        );
                      })}
                    </div>
                  )}
              </div>
            )}

            {selectedTab === 'Reviews' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                  My Reviews
                </h3>
                {reviewsLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <span className="text-4xl opacity-20">📝</span>
                    <p className="text-sm text-zinc-500">Loading reviews…</p>
                  </div>
                )}
                {reviewsError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
                    {reviewsError}
                  </div>
                )}
                {!reviewsLoading &&
                  !reviewsError &&
                  userReviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <span className="text-4xl opacity-20">📝</span>
                      <p className="text-sm text-zinc-500">
                        No reviews written yet.
                      </p>
                    </div>
                  )}
                {!reviewsLoading && userReviews.length > 0 && (
                  <div className="grid grid-cols-1 gap-3">
                    {userReviews.map((review) => (
                      <ProfileReviewCard
                        key={review.id}
                        gameTitle={review.gameName || 'Unknown Game'}
                        gameImage={review.gameImage}
                        rating={review.rating}
                        reviewText={review.review || ''}
                        date={review.date}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <ProfileConnectionsModal
        open={followersOpen}
        title="Followers"
        subtitle={`${(profileHeaderData?.followers ?? followersState.items.length).toLocaleString()} people follow ${
          isExternalProfile
            ? (profileHeaderData?.displayName ?? 'this user')
            : 'you'
        }`}
        users={followersState.items}
        isLoading={followersState.isLoading}
        error={followersState.error}
        onClose={() => setFollowersOpen(false)}
        onUserClick={navigateToProfileFromConnections}
        onToggleFollow={(target) => toggleFollowFromList(target, 'followers')}
        pendingFollowIds={pendingFollowIds}
        currentUserId={profileId ?? null}
        followedMap={connectionsFollowedMap}
      />

      <ProfileConnectionsModal
        open={followingOpen}
        title="Following"
        subtitle={`${(profileHeaderData?.following ?? followingState.items.length).toLocaleString()} people ${
          isExternalProfile
            ? `${profileHeaderData?.displayName ?? 'this user'} follows`
            : 'you follow'
        }`}
        users={followingState.items}
        isLoading={followingState.isLoading}
        error={followingState.error}
        onClose={() => setFollowingOpen(false)}
        onUserClick={navigateToProfileFromConnections}
        onToggleFollow={(target) => toggleFollowFromList(target, 'following')}
        pendingFollowIds={pendingFollowIds}
        currentUserId={profileId ?? null}
        followedMap={connectionsFollowedMap}
      />

      <ProfileConnectionsModal
        open={friendsOpen}
        title="Friends"
        subtitle={`${friendsState.items.length.toLocaleString()} friends`}
        users={friendsState.items}
        isLoading={friendsState.isLoading}
        error={friendsState.error}
        onClose={() => setFriendsOpen(false)}
        onUserClick={navigateToProfileFromConnections}
        onToggleFollow={(target) => toggleFollowFromList(target, 'friends')}
        pendingFollowIds={pendingFollowIds}
        currentUserId={profileId ?? null}
        followedMap={connectionsFollowedMap}
      />
    </div>
  );
};

export default Profile;
