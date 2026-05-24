import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  followUser,
  getUser,
  unfollowUser,
  type NormalizedUser,
} from '../api/users';
import {
  mergeFollowedStateFromUsers,
  persistFollowedUsersState,
  readFollowedUsersState,
  resolveFollowedState,
} from '../utils/followedUsersState';
import { useAuth } from '../contexts/AuthContext';

type ProfileRouteState = {
  user?: NormalizedUser;
};

export type UseProfileUserReturn = {
  selectedUser: NormalizedUser | null;
  selectedUserLoading: boolean;
  selectedUserError: string | null;
  isExternalProfile: boolean;
  externalIsFollowing: boolean | undefined;
  followActionPending: boolean;
  toggleExternalFollow: () => Promise<void>;
  /** Persisted follow state map (userId → boolean) — used to initialise modal follow buttons. */
  followed: Record<string, boolean>;
  /** Re-fetches the external profile user (e.g. to refresh follower counts after a list action). */
  refreshProfile: () => Promise<void>;
};

/**
 * Handles loading the external profile user (when visiting /profile/:id),
 * plus follow/unfollow logic with optimistic updates and localStorage persistence.
 */
export function useProfileUser(): UseProfileUserReturn {
  const { refreshUser } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const stateUser = (location.state as ProfileRouteState | null)?.user;
  const isExternalProfile = !!id;

  const [selectedUser, setSelectedUser] = useState<NormalizedUser | null>(
    isExternalProfile && stateUser?.id === id ? stateUser : null,
  );
  const [selectedUserLoading, setSelectedUserLoading] = useState(
    isExternalProfile && (!stateUser || stateUser.id !== id),
  );
  const [selectedUserError, setSelectedUserError] = useState<string | null>(null);
  const [followed, setFollowed] = useState<Record<string, boolean>>(() =>
    readFollowedUsersState(),
  );
  const [followActionPending, setFollowActionPending] = useState(false);

  // Persist follow state to localStorage on every change
  useEffect(() => {
    persistFollowedUsersState(followed);
  }, [followed]);

  // Load user data (with instant render from route state when available)
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
        setSelectedUser(stateUser ?? null);
        if (stateUser) {
          setFollowed((prev) => mergeFollowedStateFromUsers(prev, [stateUser]));
        }
      } else {
        setSelectedUser(null);
        setSelectedUserLoading(true);
      }

      setSelectedUserError(null);

      try {
        const user = await getUser(id);
        if (!active) return;
        setSelectedUser(user);
        // trustBackend=true so a fresh API response can clear a stale local true
        setFollowed((prev) => mergeFollowedStateFromUsers(prev, [user], true));
      } catch (error) {
        if (!active) return;
        if (!hasState) {
          setSelectedUser(null);
          setSelectedUserError(
            (error as Error)?.message || 'Unable to load user profile.',
          );
        } else {
          setSelectedUserError(null);
        }
      } finally {
        if (active) setSelectedUserLoading(false);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
    // Use stateUser?.id (primitive) instead of the whole stateUser object to
    // avoid re-running the effect when location.state produces a new reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isExternalProfile, stateUser?.id]);

  const externalIsFollowing = useMemo(() => {
    if (!isExternalProfile || !selectedUser) return undefined;
    return resolveFollowedState(followed, selectedUser.id, selectedUser.isFollowing);
  }, [followed, isExternalProfile, selectedUser]);

  const refreshProfile = useCallback(async () => {
    if (!isExternalProfile || !id) return;
    try {
      const freshUser = await getUser(id);
      // Only update stat counts (followers, following, games_count etc.) — do NOT
      // overwrite isFollowing.  The follow state is owned by the optimistic updates
      // and a stale re-fetch could flip it back to the wrong value.
      setSelectedUser((prev) =>
        prev
          ? {
            ...freshUser,
            isFollowing: prev.isFollowing,
          }
          : freshUser,
      );
      // Intentionally skip mergeFollowedStateFromUsers here for the same reason.
    } catch {
      // Silently ignore — stale data is still displayed
    }
  }, [isExternalProfile, id]);

  const toggleExternalFollow = useCallback(async () => {
    if (!isExternalProfile || !selectedUser || followActionPending) return;

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
      if (!prev) return prev;
      return {
        ...prev,
        isFollowing: nextFollowing,
        followers: Math.max(0, (prev.followers ?? 0) + (nextFollowing ? 1 : -1)),
      };
    });

    try {
      if (nextFollowing) {
        await followUser(targetId);
      } else {
        await unfollowUser(targetId);
      }
      // Refresh the logged-in user's following_count so the own Profile page
      // shows the correct count without requiring a page reload.
      refreshUser();
    } catch {
      // Revert optimistic update on failure
      setFollowed((prev) => ({ ...prev, [targetId]: wasFollowing }));
      setSelectedUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isFollowing: wasFollowing,
          followers: Math.max(0, (prev.followers ?? 0) + (wasFollowing ? 1 : -1)),
        };
      });
    } finally {
      setFollowActionPending(false);
    }
  }, [isExternalProfile, selectedUser, followActionPending, followed]);

  return {
    selectedUser,
    selectedUserLoading,
    selectedUserError,
    isExternalProfile,
    externalIsFollowing,
    followActionPending,
    toggleExternalFollow,
    followed,
    refreshProfile,
  };
}
