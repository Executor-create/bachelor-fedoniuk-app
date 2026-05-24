import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAward,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiGrid,
  FiHeart,
  FiLock,
  FiMoreVertical,
  FiStar,
  FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { createCollection } from '../../api/collections';
import { useAuth } from '../../contexts/AuthContext';
import { hasPremiumAccess } from '../../utils/subscriptionUtils';

type CollectionIconOption =
  | 'Heart'
  | 'Star'
  | 'Trophy'
  | 'Clock'
  | 'Grid'
  | 'Sparkles'
  | 'Flame'
  | 'Zap';

type CollectionColorOption =
  | 'Purple'
  | 'Blue'
  | 'Rose'
  | 'Emerald'
  | 'Orange'
  | 'Pink'
  | 'Indigo'
  | 'Yellow';

type CreateCollectionFormProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
};

const iconOptions: Array<{
  value: CollectionIconOption;
  label: string;
  icon: typeof FiGrid;
}> = [
  { value: 'Heart', label: 'Heart', icon: FiHeart },
  { value: 'Star', label: 'Star', icon: FiStar },
  { value: 'Trophy', label: 'Trophy', icon: FiAward },
  { value: 'Clock', label: 'Clock', icon: FiClock },
  { value: 'Grid', label: 'Grid', icon: FiGrid },
  { value: 'Sparkles', label: 'Sparkles', icon: HiSparkles },
  { value: 'Flame', label: 'Flame', icon: FiZap },
  { value: 'Zap', label: 'Zap', icon: FiZap },
];

const colorOptions: Array<{
  value: CollectionColorOption;
  label: string;
  accent: string;
}> = [
  { value: 'Rose', label: 'Red', accent: 'bg-red-500' },
  { value: 'Blue', label: 'Blue', accent: 'bg-blue-500' },
  { value: 'Purple', label: 'Purple', accent: 'bg-violet-500' },
  { value: 'Emerald', label: 'Green', accent: 'bg-emerald-500' },
  { value: 'Orange', label: 'Orange', accent: 'bg-orange-500' },
  { value: 'Pink', label: 'Pink', accent: 'bg-pink-500' },
  { value: 'Indigo', label: 'Indigo', accent: 'bg-indigo-500' },
  { value: 'Yellow', label: 'Yellow', accent: 'bg-amber-400' },
];

const CreateCollectionForm = ({
  open,
  onClose,
  onCreated,
}: CreateCollectionFormProps) => {
  const { user } = useAuth();
  const isPremium = hasPremiumAccess(user);
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] =
    useState<CollectionIconOption>('Grid');
  const [selectedColor, setSelectedColor] =
    useState<CollectionColorOption>('Purple');
  const [isPublic, setIsPublic] = useState(true);
  const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeIcon =
    iconOptions.find((option) => option.value === selectedIcon) ??
    iconOptions[0];
  const activeColor =
    colorOptions.find((option) => option.value === selectedColor) ??
    colorOptions[0];

  const close = () => {
    setIsIconMenuOpen(false);
    setIsColorMenuOpen(false);
    setFormError(null);
    onClose();
  };

  const resetForm = () => {
    setCollectionName('');
    setDescription('');
    setSelectedIcon('Grid');
    setSelectedColor('Purple');
    setIsPublic(true);
    setIsIconMenuOpen(false);
    setIsColorMenuOpen(false);
    setFormError(null);
  };

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!collectionName.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await createCollection({
        name: collectionName.trim(),
        description: description.trim() || null,
        visibility: isPublic ? 'Public' : 'Private',
        icon: selectedIcon,
        color: selectedColor,
      });

      await onCreated?.();

      resetForm();
      close();
    } catch (error: any) {
      const status = error?.response?.status;
      const message: string = error?.response?.data?.message ?? '';

      if (status === 403) {
        setFormError(
          message || 'Upgrade to Premium for unlimited collections.',
        );
      } else {
        setFormError('Failed to create collection. Please try again.');
      }
      console.error('Failed to create collection', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close create collection dialog"
        className="absolute inset-0 bg-black/70"
        onClick={close}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-[1.75rem] bg-white p-4 text-zinc-950 shadow-2xl shadow-black/40 sm:p-5"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Close"
        >
          <FiMoreVertical className="rotate-45" size={18} />
        </button>

        <div className="pr-8">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Create New Collection
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-zinc-500">
            Organize your games into a custom collection. You can change these
            settings later.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <p className="font-semibold">{formError}</p>
              {formError.toLowerCase().includes('upgrade') && (
                <Link
                  to="/upgrade"
                  className="mt-1 inline-flex text-xs font-semibold text-violet-600 hover:text-violet-500"
                >
                  View Premium plans
                </Link>
              )}
            </div>
          )}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-900">
              Collection Name
            </span>
            <input
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
              placeholder="e.g., Favorites, Currently Playing, Backlog"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-900">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what this collection is about..."
              rows={2}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-900">
                Icon
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsIconMenuOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-zinc-900 outline-none transition hover:bg-white focus:border-violet-400"
                >
                  <span className="flex items-center gap-3">
                    <activeIcon.icon size={16} className="text-zinc-500" />
                    <span>{activeIcon.label}</span>
                  </span>
                  <FiChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform ${isIconMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isIconMenuOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/10">
                    <div className="p-2">
                      {iconOptions.map((option) => {
                        const OptionIcon = option.icon;
                        const isActive = option.value === selectedIcon;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedIcon(option.value);
                              setIsIconMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                              isActive
                                ? 'bg-zinc-100 text-zinc-900'
                                : 'text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <OptionIcon size={16} className="text-zinc-500" />
                              <span>{option.label}</span>
                            </span>
                            {isActive && (
                              <FiCheck size={16} className="text-zinc-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-900">
                Color
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColorMenuOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-zinc-900 outline-none transition hover:bg-white focus:border-violet-400"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`h-5 w-5 rounded-full ${activeColor.accent}`}
                    />
                    <span>{activeColor.label}</span>
                  </span>
                  <FiChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform ${isColorMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isColorMenuOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/10">
                    <div className="p-2">
                      {colorOptions.map((option) => {
                        const isActive = option.value === selectedColor;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedColor(option.value);
                              setIsColorMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                              isActive
                                ? 'bg-zinc-100 text-zinc-900'
                                : 'text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`h-5 w-5 rounded-full ${option.accent}`}
                              />
                              <span>{option.label}</span>
                            </span>
                            {isActive && (
                              <FiCheck size={16} className="text-zinc-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-zinc-900">
              Preview
            </span>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${activeColor.accent} text-white`}
                >
                  <activeIcon.icon size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-zinc-950">
                    {collectionName.trim() || 'Collection Name'}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {description.trim() ||
                      'Collection description will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-sm font-semibold text-zinc-900">
                  Make collection public
                </span>
                <span className="block text-xs text-zinc-500">
                  {isPremium
                    ? 'Allow other users to discover and follow this collection'
                    : 'Private collections require Premium'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isPremium && isPublic) return;
                  setIsPublic((prev) => !prev);
                }}
                disabled={!isPremium && isPublic}
                className={`relative h-7 w-14 shrink-0 rounded-full border transition ${
                  isPublic
                    ? 'border-zinc-950 bg-zinc-950'
                    : 'border-zinc-300 bg-zinc-300'
                } ${!isPremium ? 'cursor-not-allowed opacity-70' : ''}`}
                aria-pressed={isPublic}
                aria-label="Toggle collection visibility"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${isPublic ? 'left-8' : 'left-1'}`}
                />
              </button>
            </div>
            {!isPremium && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-violet-600">
                <FiLock size={11} />
                <span>
                  Private collections are a{' '}
                  <Link
                    to="/upgrade"
                    className="font-semibold underline underline-offset-2 hover:text-violet-500"
                  >
                    Premium
                  </Link>{' '}
                  feature
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                resetForm();
                close();
              }}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              {isSubmitting ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCollectionForm;
