import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiCheck, FiLoader, FiUser, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { uploadMedia } from '../../api/media';
import { updateMe } from '../../api/users';

type Props = {
  open: boolean;
  onClose: () => void;
  /** When true, renders the form inline (no backdrop / modal chrome) */
  inline?: boolean;
};

const EditProfileModal = ({ open, onClose, inline = false }: Props) => {
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [tag, setTag] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form whenever modal opens or user changes
  useEffect(() => {
    if (!user) return;
    const profile = user.profile;
    setDisplayName(profile?.display_name ?? user.display_name ?? '');
    setTag(profile?.tag ?? '');
    setBio(profile?.bio ?? '');
    setAvatarUrl(profile?.avatar_url ?? user.avatar_url ?? null);
    setAvatarPreview(null);
    setAvatarFile(null);
    setError(null);
    setSavedOk(false);
  }, [user, open]);

  if (!open) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedOk(false);

    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadMedia(avatarFile);
      }

      await updateMe({
        display_name: displayName.trim() || undefined,
        tag: tag.trim() || undefined,
        bio: bio.trim() || null,
        avatar_url: finalAvatarUrl,
      });

      await refreshUser();
      setAvatarFile(null);
      setAvatarPreview(null);
      setSavedOk(true);
      setTimeout(() => {
        setSavedOk(false);
        if (!inline) onClose();
      }, 1200);
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? err?.message ?? 'Something went wrong';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview ?? avatarUrl;

  const form = (
    <form
      onSubmit={handleSave}
      className={
        inline
          ? 'w-full space-y-6 text-white'
          : 'relative z-10 w-full max-w-lg rounded-[1.75rem] bg-zinc-900 border border-zinc-800 p-6 text-white shadow-2xl shadow-black/50'
      }
    >
      {!inline && (
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Edit Profile
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Update your personal information and profile details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      <section
        className={
          inline ? 'rounded-2xl border border-zinc-800 bg-zinc-900 p-6' : ''
        }
      >
        {inline && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white mb-1">
              Profile Information
            </h2>
            <p className="text-xs text-zinc-400">
              Update your personal information and profile details
            </p>
          </div>
        )}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-zinc-800">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-zinc-700">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <FiUser size={28} className="text-zinc-500" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-violet-600 hover:bg-violet-500 border-2 border-zinc-900 flex items-center justify-center transition"
              aria-label="Change avatar"
            >
              <FiCamera size={13} />
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition"
            >
              Change Avatar
            </button>
            <p className="mt-1.5 text-xs text-zinc-500">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-200">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-200">
              Username
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="your_username"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-200">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              placeholder="your@email.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-3 text-zinc-400 outline-none cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-200">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell others about yourself..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 transition resize-none"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {!inline && (
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition disabled:opacity-60"
        >
          {saving ? (
            <>
              <FiLoader size={15} className="animate-spin" />
              Saving...
            </>
          ) : savedOk ? (
            <>
              <FiCheck size={15} />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );

  if (inline) return form;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      {form}
    </div>
  );
};

export default EditProfileModal;
