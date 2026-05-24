import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAward,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiEdit2,
  FiGrid,
  FiHeart,
  FiLock,
  FiStar,
  FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { updateCollection } from '../../api/collections';
import type { Visibility } from '../../api/collections';
import { useAuth } from '../../contexts/AuthContext';
import { hasPremiumAccess } from '../../utils/subscriptionUtils';

type IconOption =
  | 'Heart'
  | 'Star'
  | 'Trophy'
  | 'Clock'
  | 'Grid'
  | 'Sparkles'
  | 'Flame'
  | 'Zap';
type ColorOption =
  | 'Purple'
  | 'Blue'
  | 'Rose'
  | 'Emerald'
  | 'Orange'
  | 'Pink'
  | 'Indigo'
  | 'Yellow';

export type EditCollectionInitial = {
  id: string;
  name: string;
  description?: string | null;
  icon: string;
  color: string;
  visibility: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  collection: EditCollectionInitial;
  onUpdated?: () => void | Promise<void>;
};

const iconOptions = [
  { value: 'Heart' as IconOption, label: 'Heart', icon: FiHeart },
  { value: 'Star' as IconOption, label: 'Star', icon: FiStar },
  { value: 'Trophy' as IconOption, label: 'Trophy', icon: FiAward },
  { value: 'Clock' as IconOption, label: 'Clock', icon: FiClock },
  { value: 'Grid' as IconOption, label: 'Grid', icon: FiGrid },
  { value: 'Sparkles' as IconOption, label: 'Sparkles', icon: HiSparkles },
  { value: 'Flame' as IconOption, label: 'Flame', icon: FiZap },
  { value: 'Zap' as IconOption, label: 'Zap', icon: FiZap },
];

const colorOptions = [
  { value: 'Rose' as ColorOption, label: 'Red', accent: 'bg-red-500' },
  { value: 'Blue' as ColorOption, label: 'Blue', accent: 'bg-blue-500' },
  { value: 'Purple' as ColorOption, label: 'Purple', accent: 'bg-violet-500' },
  { value: 'Emerald' as ColorOption, label: 'Green', accent: 'bg-emerald-500' },
  { value: 'Orange' as ColorOption, label: 'Orange', accent: 'bg-orange-500' },
  { value: 'Pink' as ColorOption, label: 'Pink', accent: 'bg-pink-500' },
  { value: 'Indigo' as ColorOption, label: 'Indigo', accent: 'bg-indigo-500' },
  { value: 'Yellow' as ColorOption, label: 'Yellow', accent: 'bg-amber-400' },
];

const toTitle = (v: string) =>
  v
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');

const EditCollectionForm = ({
  open,
  onClose,
  collection,
  onUpdated,
}: Props) => {
  const { user } = useAuth();
  const isPremium = hasPremiumAccess(user);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? '');
  const [selectedIcon, setSelectedIcon] = useState<IconOption>(
    (toTitle(collection.icon) as IconOption) ?? 'Grid',
  );
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    (toTitle(collection.color) as ColorOption) ?? 'Purple',
  );
  const [isPublic, setIsPublic] = useState(collection.visibility !== 'Private');
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeIcon =
    iconOptions.find((o) => o.value === selectedIcon) ?? iconOptions[4];
  const activeColor =
    colorOptions.find((o) => o.value === selectedColor) ?? colorOptions[2];

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateCollection(collection.id, {
        name: name.trim(),
        description: description.trim() || null,
        visibility: (isPublic ? 'Public' : 'Private') as Visibility,
        icon: selectedIcon,
        color: selectedColor,
      });
      await onUpdated?.();
      onClose();
    } catch {
      setError('Failed to update collection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-[1.75rem] bg-white p-5 text-zinc-950 shadow-2xl shadow-black/40"
      >
        <div className="flex items-center gap-2 mb-1 pr-6">
          <FiEdit2 size={16} className="text-violet-600" />
          <h2 className="text-lg font-semibold tracking-tight">
            Edit Collection
          </h2>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Update your collection's details below.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition"
        >
          ✕
        </button>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-zinc-900">
              Collection Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Favorites, Backlog"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-zinc-900">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe this collection..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-zinc-900">
                Icon
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIconMenuOpen((p) => !p)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-zinc-900 outline-none transition hover:bg-white focus:border-violet-400"
                >
                  <span className="flex items-center gap-3">
                    <activeIcon.icon size={16} className="text-zinc-500" />
                    <span>{activeIcon.label}</span>
                  </span>
                  <FiChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform ${iconMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {iconMenuOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/10">
                    <div className="p-2">
                      {iconOptions.map((opt) => {
                        const Icon = opt.icon;
                        const active = opt.value === selectedIcon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSelectedIcon(opt.value);
                              setIconMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-700 hover:bg-zinc-50'}`}
                          >
                            <span className="flex items-center gap-3">
                              <Icon size={16} className="text-zinc-500" />
                              <span>{opt.label}</span>
                            </span>
                            {active && (
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
              <span className="mb-1.5 block text-sm font-semibold text-zinc-900">
                Color
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setColorMenuOpen((p) => !p)}
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
                    className={`text-zinc-400 transition-transform ${colorMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {colorMenuOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/10">
                    <div className="p-2">
                      {colorOptions.map((opt) => {
                        const active = opt.value === selectedColor;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSelectedColor(opt.value);
                              setColorMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-700 hover:bg-zinc-50'}`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`h-5 w-5 rounded-full ${opt.accent}`}
                              />
                              <span>{opt.label}</span>
                            </span>
                            {active && (
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

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-sm font-semibold text-zinc-900">
                  Make collection public
                </span>
                <span className="block text-xs text-zinc-500">
                  {isPremium
                    ? 'Allow other users to discover this collection'
                    : 'Private collections require Premium'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isPremium && isPublic) return;
                  setIsPublic((p) => !p);
                }}
                disabled={!isPremium && isPublic}
                className={`relative h-7 w-14 shrink-0 rounded-full border transition ${
                  isPublic
                    ? 'border-zinc-950 bg-zinc-950'
                    : 'border-zinc-300 bg-zinc-300'
                } ${!isPremium ? 'cursor-not-allowed opacity-70' : ''}`}
                aria-pressed={isPublic}
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

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCollectionForm;
