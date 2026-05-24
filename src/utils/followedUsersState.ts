import { getItemFromLocalStorage, setItemToLocalStorage } from './localStorage';

export type FollowedUsersState = Record<string, boolean>;

type FollowableUser = {
  id: string;
  isFollowing?: boolean;
};

export const getFollowedUsersStorageKey = (userId: string): string =>
  `klyro_followed_users:${userId}`;

export const readFollowedUsersState = (userId: string): FollowedUsersState => {
  if (!userId) return {};
  try {
    const raw = getItemFromLocalStorage(getFollowedUsersStorageKey(userId));
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<FollowedUsersState>((acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

export const persistFollowedUsersState = (userId: string, value: FollowedUsersState): void => {
  if (!userId) return;
  setItemToLocalStorage(getFollowedUsersStorageKey(userId), JSON.stringify(value));
};

export const mergeFollowedStateFromUsers = <T extends FollowableUser>(
  prev: FollowedUsersState,
  items: T[],
  trustBackend = false,
): FollowedUsersState => {
  const next = { ...prev };

  for (const user of items) {
    if (typeof user.isFollowing !== 'boolean') {
      continue;
    }

    if (user.isFollowing) {
      next[user.id] = true;
      continue;
    }
    if (trustBackend || !(user.id in next)) {
      next[user.id] = false;
    }
  }

  return next;
};

export const resolveFollowedState = (
  followed: FollowedUsersState,
  userId: string,
  backendIsFollowing?: boolean,
): boolean => {
  if (userId in followed) {
    return followed[userId];
  }

  return !!backendIsFollowing;
};
