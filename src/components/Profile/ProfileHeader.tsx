import * as React from 'react';
import { FiCalendar, FiEdit2, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { FaUsers, FaUserFriends } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

type ProfileHeaderData = {
  displayName: string;
  handle?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  joinedAt?: string | null;
  createdAt?: string | null;
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
  friendsCount?: number;
  onOpenFollowers?: () => void;
  onOpenFollowing?: () => void;
  onOpenFriends?: () => void;
};

const formatJoinedDate = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const SkeletonBlock = () => (
  <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
    <div className="animate-pulse flex flex-col gap-4">
      <div className="flex gap-5">
        <div className="w-24 h-24 rounded-full bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-5 bg-zinc-800 rounded-full w-1/3" />
          <div className="h-3 bg-zinc-800 rounded-full w-1/4" />
          <div className="h-3 bg-zinc-800 rounded-full w-2/5" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-zinc-800 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  loading = false,
  error = null,
  showEditButton = true,
  isFollowing,
  onToggleFollow,
  followActionPending = false,
  friendsCount,
  onOpenFollowers,
  onOpenFollowing,
  onOpenFriends,
}) => {
  const { user, isLoading } = useAuth();

  if (loading || (!profileData && isLoading)) {
    return <SkeletonBlock />;
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  const hasExternalProfile = !!profileData;

  if (!hasExternalProfile && !user) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
        <p className="text-zinc-400 text-sm">
          Please log in to view profile information.
        </p>
      </div>
    );
  }

  const showExternalFollowButton =
    hasExternalProfile &&
    typeof isFollowing === 'boolean' &&
    typeof onToggleFollow === 'function';

  const profile = hasExternalProfile ? null : ((user as any)?.profile ?? null);

  const displayName = hasExternalProfile
    ? profileData.displayName || 'User'
    : profile?.display_name || (user as any)?.username || 'User';
  const handle = hasExternalProfile
    ? profileData.handle || ''
    : profile?.tag || `@${(user as any)?.username || ''}`;
  const bio = hasExternalProfile ? profileData.bio || '' : profile?.bio || '';
  const avatar =
    (hasExternalProfile ? profileData.avatarUrl : profile?.avatar_url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=18181b&color=fff&size=256`;
  const joined = hasExternalProfile
    ? formatJoinedDate(profileData.joinedAt ?? profileData.createdAt)
    : formatJoinedDate(profile?.joined_at ?? (profile as any)?.created_at);

  const followers = hasExternalProfile
    ? (profileData.followers ?? 0)
    : (profile?.followers_count ?? 0);
  const following = hasExternalProfile
    ? (profileData.following ?? 0)
    : (profile?.following_count ?? 0);
  const friends = friendsCount ?? (profile as any)?.friends_count ?? 0;

  const statCards = [
    {
      icon: <FaUsers size={20} className="text-violet-400" />,
      value: followers,
      label: 'Followers',
      onClick: onOpenFollowers,
    },
    {
      icon: <FaUserFriends size={20} className="text-violet-400" />,
      value: following,
      label: 'Following',
      onClick: onOpenFollowing,
    },
    {
      icon: <FaUserFriends size={20} className="text-emerald-400" />,
      value: friends,
      label: 'Friends',
      onClick: onOpenFriends,
    },
  ];

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* Banner */}
      <div className="h-28 bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-zinc-900" />

      <div className="px-6 pb-6">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="ring-4 ring-zinc-900 rounded-full">
            <img
              src={avatar}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover bg-zinc-800"
            />
          </div>

          <div className="flex items-center gap-2 pb-1">
            {showExternalFollowButton ? (
              <button
                type="button"
                onClick={onToggleFollow}
                disabled={followActionPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                  isFollowing
                    ? 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700'
                    : 'bg-violet-600 text-white hover:bg-violet-500'
                } ${followActionPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isFollowing ? (
                  <FiUserCheck size={15} />
                ) : (
                  <FiUserPlus size={15} />
                )}
                {followActionPending
                  ? 'Updating…'
                  : isFollowing
                    ? 'Following'
                    : 'Follow'}
              </button>
            ) : (
              showEditButton &&
              !hasExternalProfile && (
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition"
                >
                  <FiEdit2 size={14} />
                  Edit Profile
                </button>
              )
            )}
          </div>
        </div>

        {/* Name + handle */}
        <div className="mb-3">
          <h2 className="font-google text-2xl font-semibold text-white leading-tight">
            {displayName}
          </h2>
          {handle && <p className="text-sm text-zinc-500 mt-0.5">{handle}</p>}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-zinc-400 leading-relaxed mb-3 max-w-xl">
            {bio}
          </p>
        )}

        {/* Joined date */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <FiCalendar size={13} />
          <span>{joined ? `Joined ${joined}` : 'Join date unknown'}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map(({ icon, value, label, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={!onClick}
              className={`bg-zinc-950 rounded-xl border border-zinc-800 p-4 flex flex-col items-center gap-2 transition ${
                onClick
                  ? 'hover:border-zinc-700 hover:bg-zinc-800/50 cursor-pointer'
                  : 'cursor-default'
              }`}
            >
              {icon}
              <span className="text-2xl font-bold text-white font-mono leading-none">
                {value.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
