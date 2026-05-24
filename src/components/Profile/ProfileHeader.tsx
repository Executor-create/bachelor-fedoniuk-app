import * as React from 'react';
import {
  FiCalendar,
  FiCamera,
  FiEdit2,
  FiStar,
  FiUserCheck,
  FiUserPlus,
} from 'react-icons/fi';
import { FaUserFriends, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { uploadMedia } from '../../api/media';
import { updateMe } from '../../api/users';
import { motion, type Variants } from 'framer-motion';
import type { Plan, SubscriptionStatus } from '../../types/user.type';
import { hasPremiumAccess } from '../../utils/subscriptionUtils';
import EditProfileModal from './EditProfileModal';

type ProfileHeaderData = {
  displayName: string;
  handle?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  joinedAt?: string | null;
  createdAt?: string | null;
  followers?: number;
  following?: number;
  plan?: Plan;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionEndDate?: string | null;
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

const statCardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.08 },
  }),
};

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
  const { user, isLoading, refreshUser } = useAuth();

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [localAvatar, setLocalAvatar] = React.useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

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

  const canEditAvatar = !hasExternalProfile && showEditButton;

  const profile = hasExternalProfile ? null : ((user as any)?.profile ?? null);

  const displayName = hasExternalProfile
    ? profileData.displayName || 'User'
    : profile?.display_name || (user as any)?.username || 'User';
  const handle = hasExternalProfile
    ? profileData.handle || ''
    : profile?.tag || `@${(user as any)?.username || ''}`;
  const bio = hasExternalProfile ? profileData.bio || '' : profile?.bio || '';
  const avatar =
    localAvatar ??
    (hasExternalProfile ? profileData.avatarUrl : profile?.avatar_url) ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=18181b&color=fff&size=256`;
  const joined = hasExternalProfile
    ? formatJoinedDate(profileData.joinedAt ?? profileData.createdAt)
    : formatJoinedDate(profile?.joined_at ?? (profile as any)?.created_at);

  const followersBase = hasExternalProfile
    ? (profileData.followers ?? 0)
    : (profile?.followers_count ?? 0);
  const followingBase = hasExternalProfile
    ? (profileData.following ?? 0)
    : (profile?.following_count ?? 0);
  const followers = followersBase;
  const following = followingBase;
  const friends = friendsCount ?? (profile as any)?.friends_count ?? 0;
  const profileUser = hasExternalProfile ? (profileData as any) : user;
  const isPremiumProfile = hasPremiumAccess(profileUser);

  const handleAvatarClick = () => {
    if (!canEditAvatar || isUploadingAvatar) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalAvatar(previewUrl);
    setIsUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadMedia(file);
      const cleanUrl = uploadedUrl.split('?cb=')[0];
      await updateMe({ avatar_url: cleanUrl });
      await refreshUser();
      setLocalAvatar(`${cleanUrl}?cb=${Date.now()}`);
      URL.revokeObjectURL(previewUrl);
    } catch (err) {
      console.error('Failed to update avatar', err);
      setLocalAvatar(null);
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden"
    >
      {canEditAvatar && (
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      )}

      <div className="h-28 bg-linear-to-r from-violet-600/30 via-purple-600/20 to-zinc-900 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 3,
          }}
        />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <motion.div
            className={`ring-4 ring-zinc-900 rounded-full relative ${canEditAvatar ? 'cursor-pointer group' : ''}`}
            whileHover={canEditAvatar ? { scale: 1.06 } : { scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            onClick={handleAvatarClick}
            title={canEditAvatar ? 'Change avatar' : undefined}
          >
            <img
              src={avatar}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover bg-zinc-800"
            />
            {canEditAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <span className="text-[10px] text-white font-medium leading-tight text-center px-1">
                    Uploading…
                  </span>
                ) : (
                  <FiCamera size={22} className="text-white" />
                )}
              </div>
            )}
          </motion.div>

          <div className="flex items-center gap-2 pb-1">
            {showExternalFollowButton ? (
              <motion.button
                type="button"
                onClick={onToggleFollow}
                disabled={followActionPending}
                whileHover={!followActionPending ? { scale: 1.04 } : {}}
                whileTap={!followActionPending ? { scale: 0.97 } : {}}
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
              </motion.button>
            ) : (
              showEditButton &&
              !hasExternalProfile && (
                <motion.button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition"
                >
                  <FiEdit2 size={14} />
                  Edit Profile
                </motion.button>
              )
            )}
          </div>
        </div>

        <motion.div
          className="mb-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-google text-2xl font-semibold text-white leading-tight">
              {displayName}
            </h2>
            {isPremiumProfile && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-600/15 px-2 py-1 text-[11px] font-semibold text-violet-100">
                <FiStar size={12} className="text-violet-300" />
                Premium
              </span>
            )}
          </div>
          {handle && <p className="text-sm text-zinc-500 mt-0.5">{handle}</p>}
        </motion.div>

        {bio && (
          <motion.p
            className="text-sm text-zinc-400 leading-relaxed mb-3 max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            {bio}
          </motion.p>
        )}

        <motion.div
          className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.22 }}
        >
          <FiCalendar size={13} />
          <span>{joined ? `Joined ${joined}` : 'Join date unknown'}</span>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {statCards.map(({ icon, value, label, onClick }, i) => (
            <motion.button
              key={label}
              type="button"
              onClick={onClick}
              disabled={!onClick}
              custom={i}
              variants={statCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={onClick ? { scale: 1.04, y: -2 } : {}}
              whileTap={onClick ? { scale: 0.97 } : {}}
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
            </motion.button>
          ))}
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </motion.div>
  );
};

export default ProfileHeader;
