import * as React from 'react';
import Button from '../ui/Button';
import { FiCalendar, FiUserPlus } from 'react-icons/fi';
import { FaTrophy, FaUsers, FaUserFriends } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

type ProfileHeaderData = {
  displayName: string;
  handle?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  joinedAt?: string | null;
  createdAt?: string | null;
  gamesPlayed?: number;
  followers?: number;
  following?: number;
};

type ProfileHeaderProps = {
  profileData?: ProfileHeaderData;
  loading?: boolean;
  error?: string | null;
  showEditButton?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  followActionPending?: boolean;
};

const formatJoinedDate = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString();
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  loading = false,
  error = null,
  showEditButton = true,
  isFollowing,
  onToggleFollow,
  followActionPending = false,
}) => {
  const { user, isLoading } = useAuth();

  if (loading) {
    return (
      <div className="mx-6 mt-6 rounded-xl bg-(--third-color) border border-gray-700 p-6 text-white">
        <div className="animate-pulse h-36 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-6 mt-6 rounded-xl bg-(--third-color) border border-gray-700 p-6 text-white">
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  const hasExternalProfile = !!profileData;
  const showExternalFollowButton =
    hasExternalProfile &&
    typeof isFollowing === 'boolean' &&
    typeof onToggleFollow === 'function';

  const profile = hasExternalProfile ? null : ((user as any)?.profile ?? null);

  if (!hasExternalProfile && isLoading) {
    return (
      <div className="mx-6 mt-6 rounded-xl bg-(--third-color) border border-gray-700 p-6 text-white">
        <div className="animate-pulse h-36 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (!hasExternalProfile && !user) {
    return (
      <div className="mx-6 mt-6 rounded-xl bg-(--third-color) border border-gray-700 p-6 text-white">
        <p className="text-gray-300">
          Please log in to view profile information.
        </p>
      </div>
    );
  }

  const displayName = hasExternalProfile
    ? profileData.displayName || 'User'
    : profile?.display_name || (user as any).username || 'User';
  const handle = hasExternalProfile
    ? profileData.handle || ''
    : profile?.tag || `@${(user as any).username || ''}`;
  const bio = hasExternalProfile ? profileData.bio || '' : profile?.bio || '';
  const avatar =
    (hasExternalProfile ? profileData.avatarUrl : profile?.avatar_url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111827&color=fff&size=256`;
  const joined = hasExternalProfile
    ? formatJoinedDate(profileData.joinedAt ?? profileData.createdAt)
    : formatJoinedDate(profile?.joined_at ?? (profile as any)?.created_at);

  const gamesPlayed = hasExternalProfile
    ? (profileData.gamesPlayed ?? 0)
    : (profile?.games_played_count ?? 0);
  const followers = hasExternalProfile
    ? (profileData.followers ?? 0)
    : (profile?.followers_count ?? 0);
  const following = hasExternalProfile
    ? (profileData.following ?? 0)
    : (profile?.following_count ?? 0);

  return (
    <div className="mx-6 mt-6 rounded-xl bg-(--third-color) border border-gray-700 p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="shrink-0">
          <div className="w-36 h-36 rounded-full p-1 bg-linear-to-br from-(--primary-color) to-(--secondary-color)">
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full rounded-full object-cover border-4 border-(--fourth-color) p-1"
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-google font-bold">{displayName}</h2>
              <p className="text-sm text-gray-300 mt-1">{handle}</p>
            </div>
            {showExternalFollowButton ? (
              <button
                type="button"
                onClick={onToggleFollow}
                disabled={followActionPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                  isFollowing
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'bg-linear-to-r from-violet-500 to-pink-500 text-white'
                } ${followActionPending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <FiUserPlus />
                {followActionPending
                  ? 'Updating...'
                  : isFollowing
                    ? 'Unfollow'
                    : 'Follow'}
              </button>
            ) : (
              showEditButton &&
              !hasExternalProfile && (
                <div>
                  <Button
                    text="Edit Profile"
                    className="px-4 py-2 rounded-md bg-(--third-color) border border-gray-600 hover:bg-(--primary-color) transition-colors duration-200"
                  />
                </div>
              )
            )}
          </div>

          {bio && <p className="mt-4 text-gray-300">{bio}</p>}

          <div className="mt-4 flex items-center gap-3 text-gray-400">
            <FiCalendar size={18} />
            <span>{joined ? `Joined ${joined}` : 'Joined date unknown'}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-(--fourth-color) p-6 rounded-xl flex flex-col items-center justify-center border border-gray-700">
          <FaTrophy size={22} className="text-(--primary-color)" />
          <div className="text-3xl font-semibold mt-2">{gamesPlayed}</div>
          <div className="text-sm text-gray-400">Games Played</div>
        </div>

        <div className="bg-(--fourth-color) p-6 rounded-xl flex flex-col items-center justify-center border border-gray-700">
          <FaUsers size={22} className="text-(--primary-color)" />
          <div className="text-3xl font-semibold mt-2">{followers}</div>
          <div className="text-sm text-gray-400">Followers</div>
        </div>

        <div className="bg-(--fourth-color) p-6 rounded-xl flex flex-col items-center justify-center border border-gray-700">
          <FaUserFriends size={22} className="text-(--primary-color)" />
          <div className="text-3xl font-semibold mt-2">{following}</div>
          <div className="text-sm text-gray-400">Following</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
