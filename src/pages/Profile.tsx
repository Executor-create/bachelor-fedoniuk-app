import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileTabs from '../components/Profile/ProfileTabs';
import ProfileReviewCard from '../components/Profile/ProfileReviewCard';
import {
  followUser,
  getUser,
  unfollowUser,
  type NormalizedUser,
} from '../api/users';
import { getUserReviews, type Review } from '../api/reviews';
import {
  mergeFollowedStateFromUsers,
  persistFollowedUsersState,
  readFollowedUsersState,
  resolveFollowedState,
} from '../utils/followedUsersState';

type ProfileRouteState = {
  user?: NormalizedUser;
};

export const Profile = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const stateUser = (location.state as ProfileRouteState | null)?.user;
  const isExternalProfile = !!id;

  const [selectedTab, setSelectedTab] = useState('Favorite Games');
  const [userReviews, setUserReviews] = useState<
    (Review & { gameId?: string; gameName?: string; gameImage?: string })[]
  >([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<NormalizedUser | null>(
    isExternalProfile && stateUser?.id === id ? stateUser : null,
  );
  const [selectedUserLoading, setSelectedUserLoading] = useState(
    isExternalProfile && (!stateUser || stateUser.id !== id),
  );
  const [selectedUserError, setSelectedUserError] = useState<string | null>(
    null,
  );
  const [followed, setFollowed] = useState<Record<string, boolean>>(() =>
    readFollowedUsersState(),
  );
  const [followActionPending, setFollowActionPending] = useState(false);

  useEffect(() => {
    persistFollowedUsersState(followed);
  }, [followed]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      if (!isExternalProfile || !id) {
        if (!active) return;
        setSelectedUser(null);
        setSelectedUserLoading(false);
        setSelectedUserError(null);
        setFollowActionPending(false);
        return;
      }
      const hasState = stateUser?.id === id;

      if (hasState) {
        // show provided state immediately for instant render
        setSelectedUser(stateUser ?? null);
        if (stateUser) {
          setFollowed((prev) => mergeFollowedStateFromUsers(prev, [stateUser]));
        }
      } else {
        // no preloaded state — show loader
        setSelectedUser(null);
        setSelectedUserLoading(true);
      }

      setSelectedUserError(null);

      try {
        const user = await getUser(id);
        if (!active) return;
        // always replace with fresh server copy
        setSelectedUser(user);
        setFollowed((prev) => mergeFollowedStateFromUsers(prev, [user]));
      } catch (error) {
        if (!active) return;
        if (!hasState) {
          setSelectedUser(null);
          setSelectedUserError(
            (error as Error)?.message || 'Unable to load user profile.',
          );
        } else {
          // Keep the state-based profile visible when background refresh fails.
          setSelectedUserError(null);
        }
      } finally {
        if (active) {
          // hide loading if we showed it
          setSelectedUserLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [id, isExternalProfile, stateUser]);

  useEffect(() => {
    if (selectedTab !== 'Reviews' || isExternalProfile) {
      return;
    }

    let active = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const reviews = await getUserReviews();
        if (!active) return;
        setUserReviews(
          reviews.map((r) => {
            const rr = r as any;
            return {
              ...r,
              // map nested game object (if present) into flat fields used by UI
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
  }, [selectedTab, isExternalProfile]);

  const externalIsFollowing = useMemo(() => {
    if (!isExternalProfile || !selectedUser) {
      return undefined;
    }

    return resolveFollowedState(
      followed,
      selectedUser.id,
      selectedUser.isFollowing,
    );
  }, [followed, isExternalProfile, selectedUser]);

  const toggleExternalFollow = async () => {
    if (!isExternalProfile || !selectedUser || followActionPending) {
      return;
    }

    const targetId = selectedUser.id;
    const wasFollowing = resolveFollowedState(
      followed,
      targetId,
      selectedUser.isFollowing,
    );
    const nextFollowing = !wasFollowing;

    setFollowActionPending(true);
    setFollowed((prev) => ({ ...prev, [targetId]: nextFollowing }));
    setSelectedUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        isFollowing: nextFollowing,
        followers: Math.max(
          0,
          (prev.followers ?? 0) + (nextFollowing ? 1 : -1),
        ),
      };
    });

    try {
      if (nextFollowing) {
        await followUser(targetId);
      } else {
        await unfollowUser(targetId);
      }
    } catch {
      setFollowed((prev) => ({ ...prev, [targetId]: wasFollowing }));
      setSelectedUser((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          isFollowing: wasFollowing,
          followers: Math.max(
            0,
            (prev.followers ?? 0) + (wasFollowing ? 1 : -1),
          ),
        };
      });
    } finally {
      setFollowActionPending(false);
    }
  };

  const profileHeaderData = useMemo(() => {
    if (!isExternalProfile || !selectedUser) return undefined;

    return {
      displayName: selectedUser.username,
      handle: selectedUser.tag,
      bio: selectedUser.bio,
      avatarUrl: selectedUser.avatar,
      joinedAt: selectedUser.joinedAt,
      createdAt: selectedUser.createdAt,
      gamesPlayed: selectedUser.games_count,
      followers: selectedUser.followers,
      following: selectedUser.following,
    };
  }, [isExternalProfile, selectedUser]);

  const sampleGames = [
    {
      id: 1,
      title: 'Cyber Drift',
      img: 'https://images.unsplash.com/photo-1542751371-2d3a6a9b4a6d?auto=format&fit=crop&w=800&q=60',
    },
    {
      id: 2,
      title: 'Neon Racer',
      img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=60',
    },
    {
      id: 3,
      title: 'Arena Legends',
      img: 'https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=800&q=60',
    },
  ];

  return (
    <div className="bg-(--fourth-color) h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-6 gap-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
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
          />
          <ProfileTabs activeTab={selectedTab} onTabChange={setSelectedTab} />

          {selectedTab === 'Favorite Games' && (
            <div className="mx-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Favorite Games
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleGames.map((g) => (
                  <div
                    key={g.id}
                    className="bg-(--third-color) rounded-xl overflow-hidden border border-gray-700"
                  >
                    <img
                      src={g.img}
                      alt={g.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-white font-semibold">{g.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Short description of the game.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'Reviews' && (
            <div className="mx-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                My Reviews
              </h3>
              {reviewsLoading && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading reviews...</p>
                </div>
              )}
              {reviewsError && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-300 text-center">
                  {reviewsError}
                </div>
              )}
              {!reviewsLoading && !reviewsError && userReviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    You haven't written any reviews yet.
                  </p>
                </div>
              )}
              {!reviewsLoading && userReviews.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
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
        </main>
      </div>
    </div>
  );
};

export default Profile;
