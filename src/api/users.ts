import api from '../config/api';

interface FetchUsersOptions {
  search?: string;
  signal?: AbortSignal;
}

interface GetUserOptions {
  signal?: AbortSignal;
}

type ApiProfile = {
  display_name?: string;
  tag?: string;
  avatar_url?: string | null;
  bio?: string | null;
  followers_count?: number;
  following_count?: number;
  games_count?: number;
  joined_at?: string;
  [key: string]: any;
};

type ApiUser = {
  id: string;
  username?: string;
  bio?: string | null;
  joined_at?: string;
  display_name?: string;
  tag?: string;
  avatar_url?: string | null;
  followers_count?: number;
  following_count?: number;
  games_count?: number;
  profile?: ApiProfile;
  [key: string]: any;
};

type RawUsersResponse = {
  data: ApiUser[];
  nextCursor?: string | null;
  hasMore: boolean;
};

type RawUserResponse = ApiUser | { data?: ApiUser };
type RawConnectionsResponse = ApiUser[] | { data?: ApiUser[] };

export type NormalizedUser = {
  id: string;
  username: string;
  tag?: string;
  avatar?: string | null;
  bio?: string | null;
  followers?: number;
  following?: number;
  games_count?: number;
  joinedAt?: string | null;
  createdAt?: string | null;
  isFollowing?: boolean;
};

const readIsFollowing = (user: ApiUser): boolean | undefined => {
  const candidates = [
    user.is_following,
    user.isFollowing,
    user.following_status,
    user.followingStatus,
    user.followed,
    user.followed_by_me,
    user.followedByMe,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'boolean') {
      return candidate;
    }

    if (typeof candidate === 'number') {
      if (candidate === 1) return true;
      if (candidate === 0) return false;
    }

    if (typeof candidate === 'string') {
      const normalized = candidate.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
    }
  }

  return undefined;
};

const getProfileSource = (user: ApiUser): ApiProfile => {
  if (user.profile && typeof user.profile === 'object') {
    return user.profile;
  }

  return user;
};

const toNumericCount = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (Array.isArray(value)) {
    return value.length;
  }

  return undefined;
};

const readFirstNumericCount = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const numeric = toNumericCount(value);
    if (typeof numeric === 'number') {
      return numeric;
    }
  }

  return undefined;
};

const normalizeUser = (user: ApiUser): NormalizedUser => {
  const profile = getProfileSource(user);
  const profileStats = (profile as any)?.stats;
  const userStats = (user as any)?.stats;

  const followersCount =
    readFirstNumericCount(
      profile.followers_count,
      (profile as any).followersCount,
      (profile as any).follower_count,
      (profile as any).followerCount,
      (profile as any).followers,
      profileStats?.followers_count,
      profileStats?.followersCount,
      profileStats?.follower_count,
      profileStats?.followerCount,
      profileStats?.followers,
      user.followers_count,
      (user as any).followersCount,
      (user as any).follower_count,
      (user as any).followerCount,
      (user as any).followers,
      userStats?.followers_count,
      userStats?.followersCount,
      userStats?.follower_count,
      userStats?.followerCount,
      userStats?.followers,
    ) ?? 0;

  const followingCount =
    readFirstNumericCount(
      profile.following_count,
      (profile as any).followingCount,
      (profile as any).following,
      profileStats?.following_count,
      profileStats?.followingCount,
      profileStats?.following,
      user.following_count,
      (user as any).followingCount,
      (user as any).following,
      userStats?.following_count,
      userStats?.followingCount,
      userStats?.following,
    ) ?? 0;

  const gamesCount =
    readFirstNumericCount(
      profile.games_played_count,
      profile.games_count,
      (profile as any).gamesCount,
      (profile as any).games,
      profileStats?.games_played_count,
      profileStats?.games_count,
      profileStats?.gamesCount,
      profileStats?.games,
      user.games_count,
      (user as any).gamesCount,
      (user as any).games,
      userStats?.games_played_count,
      userStats?.games_count,
      userStats?.gamesCount,
      userStats?.games,
    ) ?? 0;

  return {
    id: user.id,
    username:
      profile.display_name ||
      user.display_name ||
      user.username ||
      profile.tag ||
      user.tag ||
      user.id,
    tag: profile.tag || user.tag,
    avatar: profile.avatar_url ?? user.avatar_url ?? null,
    bio: profile.bio ?? user.bio ?? undefined,
    followers: followersCount,
    following: followingCount,
    games_count: gamesCount,
    joinedAt:
      profile.joined_at ?? user.joined_at ?? (user as any).created_at ?? null,
    createdAt: profile.created_at ?? user.created_at ?? (user as any).created_at ?? null,
    isFollowing: readIsFollowing({ ...user, ...profile }),
  };
};

const extractSingleUser = (payload: RawUserResponse): ApiUser | null => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = payload.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as ApiUser;
    }
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as ApiUser;
  }

  return null;
};

const extractUsersList = (payload: RawConnectionsResponse): ApiUser[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

const getResponseStatus = (error: unknown): number | undefined =>
  (error as any)?.response?.status;

const getResponseMessage = (error: unknown): string =>
  String((error as any)?.response?.data?.message || '').toLowerCase();

const hasAnyMessage = (message: string, candidates: string[]): boolean =>
  candidates.some((candidate) => message.includes(candidate));

const isAlreadyFollowingError = (error: unknown): boolean => {
  const status = getResponseStatus(error);
  const message = getResponseMessage(error);

  return (
    status === 409 &&
    hasAnyMessage(message, ['already following', 'already followed'])
  );
};

const isNotFollowingError = (error: unknown): boolean => {
  const status = getResponseStatus(error);
  const message = getResponseMessage(error);

  return (
    (status === 409 || status === 404) &&
    hasAnyMessage(message, ['not following', 'not followed'])
  );
};

const assertMutationStatus = (status: number, action: 'follow' | 'unfollow') => {
  if (![200, 201, 204].includes(status)) {
    throw new Error(`Failed to ${action} user`);
  }
};

const requestFollow = async (targetId: string): Promise<void> => {
  const response = await api.post(`/users/${targetId}/follow`);
  assertMutationStatus(response.status, 'follow');
};

const requestUnfollowByDelete = async (targetId: string): Promise<void> => {
  const response = await api.delete(`/users/${targetId}/follow`);
  assertMutationStatus(response.status, 'unfollow');
};

export const fetchUsers = async (
  limit = 10,
  cursor?: string,
  options: FetchUsersOptions = {},
): Promise<{ data: NormalizedUser[]; nextCursor?: string | null; hasMore: boolean }> => {
  const { search, signal } = options;

  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;
  if (search) params.search = search;

  const response = await api.get<RawUsersResponse>('/users', {
    params,
    signal,
  });

  const payload = response.data;

  const normalized: NormalizedUser[] = (payload.data || []).map(normalizeUser);

  return { data: normalized, nextCursor: payload.nextCursor ?? null, hasMore: !!payload.hasMore };
};

export const getUser = async (
  id: string,
  options: GetUserOptions = {},
): Promise<NormalizedUser> => {
  const cacheKey = id;

  if (!(getUser as any)._inflight) {
    (getUser as any)._inflight = new Map<string, Promise<NormalizedUser>>();
  }

  const inflight: Map<string, Promise<NormalizedUser>> = (getUser as any)._inflight;

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey)!;
  }

  const promise = (async () => {
    const response = await api.get<RawUserResponse>(`/users/${id}`, {
      signal: options.signal,
    });

    const user = extractSingleUser(response.data);

    if (!user || !user.id) {
      throw new Error('User not found');
    }

    return normalizeUser(user);
  })();

  inflight.set(cacheKey, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    inflight.delete(cacheKey);
  }
};

const getConnections = async (path: string): Promise<NormalizedUser[]> => {
  const response = await api.get<RawConnectionsResponse>(path);

  if (response.status !== 200) {
    throw new Error('Failed to load connections');
  }

  return extractUsersList(response.data).map(normalizeUser);
};

export const getFollowers = async (id: string): Promise<NormalizedUser[]> =>
  getConnections(`/users/${id}/followers`);

export const getFollowing = async (id: string): Promise<NormalizedUser[]> =>
  getConnections(`/users/${id}/following`);

export const getFriends = async (id: string): Promise<NormalizedUser[]> =>
  getConnections(`/users/${id}/friends`);

export const followUser = async (targetId: string): Promise<void> => {
  try {
    await requestFollow(targetId);
  } catch (error) {
    if (isAlreadyFollowingError(error)) {
      return;
    }

    throw error;
  }
};

export type UpdateMePayload = {
  avatar_url?: string | null;
  display_name?: string;
  bio?: string | null;
  tag?: string;
};

export const updateMe = async (payload: UpdateMePayload): Promise<NormalizedUser> => {
  const response = await api.patch<RawUserResponse>('/users/me/profile', payload);

  if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
    throw new Error('Failed to update profile');
  }

  const user = extractSingleUser(response.data);
  if (!user || !user.id) {
    return {} as NormalizedUser;
  }

  return normalizeUser(user);
};

export const unfollowUser = async (targetId: string): Promise<void> => {
  try {
    await requestUnfollowByDelete(targetId);
  } catch (error) {
    if (isNotFollowingError(error)) return;
    throw error;
  }
};

export const deleteMe = async (): Promise<void> => {
  const response = await api.delete('/users/me');
  if (![200, 204].includes(response.status)) {
    throw new Error('Failed to delete account');
  }
};
