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
  followed: Record<string, boolean>;
  refreshProfile: () => Promise<void>;
};

export function useProfileUser(): UseProfileUserReturn {
  const { user: currentUser, refreshUser } = useAuth();
  const currentUserId = currentUser?.id ?? '';
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
    readFollowedUsersState(currentUserId),
  );
  const [followActionPending, setFollowActionPending] = useState(false);

  useEffect(() => {
    setFollowed(readFollowedUsersState(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    persistFollowedUsersState(currentUserId, followed);
  }, [currentUserId, followed]);

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
  }, [id, isExternalProfile, stateUser?.id]);

  const externalIsFollowing = useMemo(() => {
    if (!isExternalProfile || !selectedUser) return undefined;
    return resolveFollowedState(followed, selectedUser.id, selectedUser.isFollowing);
  }, [followed, isExternalProfile, selectedUser]);

  const refreshProfile = useCallback(async () => {
    if (!isExternalProfile || !id) return;
    try {
      const freshUser = await getUser(id);
      setSelectedUser((prev) =>
        prev
          ? {
            ...freshUser,
            isFollowing: prev.isFollowing,
          }
          : freshUser,
      );
    } catch {
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
      refreshUser();
    } catch {
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
