import { FiUserCheck, FiUserPlus, FiX } from 'react-icons/fi';
import type { NormalizedUser } from '../../api/users';

type ProfileConnectionsModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  users: NormalizedUser[];
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onUserClick?: (user: NormalizedUser) => void;
  onToggleFollow?: (user: NormalizedUser) => void;
  pendingFollowIds?: Record<string, boolean>;
  currentUserId?: string | null;
  followedMap?: Record<string, boolean>;
};

const ProfileConnectionsModal = ({
  open,
  title,
  subtitle,
  users,
  isLoading = false,
  error = null,
  onClose,
  onUserClick,
  onToggleFollow,
  pendingFollowIds,
  currentUserId,
  followedMap,
}: ProfileConnectionsModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close connections dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            aria-label="Close"
          >
            <FiX size={17} />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-zinc-800/60 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-400 py-4 text-center">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">
              No users found.
            </p>
          ) : (
            users.map((user) => {
              const handle = user.tag || '';
              const followers = user.followers ?? 0;
              const isFollowing =
                followedMap && user.id in followedMap
                  ? followedMap[user.id]
                  : !!user.isFollowing;
              const isSelf = currentUserId && user.id === currentUserId;
              const isPending = !!pendingFollowIds?.[user.id];

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 p-3 transition"
                >
                  <button
                    type="button"
                    onClick={() => onUserClick?.(user)}
                    className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-700 text-zinc-300 flex items-center justify-center font-semibold text-sm shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{user.username?.trim()?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white leading-tight">
                        {user.username}
                      </div>
                      {handle && (
                        <div className="text-xs text-zinc-500">{handle}</div>
                      )}
                      <div className="text-xs text-zinc-600 mt-0.5">
                        {followers.toLocaleString()} followers
                      </div>
                    </div>
                  </button>

                  {onToggleFollow && !isSelf && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleFollow(user);
                      }}
                      disabled={isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isFollowing
                          ? 'bg-zinc-700 text-white border border-zinc-600 hover:bg-zinc-600'
                          : 'bg-violet-600 text-white hover:bg-violet-500'
                      } ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {isFollowing ? (
                        <FiUserCheck size={13} />
                      ) : (
                        <FiUserPlus size={13} />
                      )}
                      {isPending
                        ? 'Updating…'
                        : isFollowing
                          ? 'Following'
                          : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileConnectionsModal;
