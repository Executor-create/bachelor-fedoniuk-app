import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiBookmark,
  FiGrid,
  FiLock,
  FiPlus,
  FiUsers,
} from 'react-icons/fi';
import {
  getAllCollections,
  type Collection as ApiCollection,
} from '../api/collections';
import Header from '../components/Header';
import CreateCollectionForm from '../components/Collections/CreateCollectionForm';
import Sidebar from '../components/Sidebar/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  type IconComponent,
  COLLECTION_ICON_MAP,
  COLLECTION_COLOR_ACCENT_MAP,
  COLLECTION_COLOR_PREVIEW_MAP,
  toCollectionTitle,
} from '../config/collectionsConfig';
import { hasPremiumAccess } from '../utils/subscriptionUtils';

type CollectionTile = {
  label: string;
  tint: string;
  icon?: IconComponent;
  imageUrl?: string;
};

type CollectionCard = {
  id: string;
  title: string;
  description: string;
  accent: string;
  icon: IconComponent;
  visibility: 'Public' | 'Private';
  stats: {
    visibility: string;
    theme: string;
  };
  tiles: CollectionTile[];
};

const buildCollectionCard = (collection: ApiCollection): CollectionCard => {
  const iconKey = toCollectionTitle(collection.icon, 'Grid');
  const colorKey = toCollectionTitle(collection.color, 'Purple');
  const icon = COLLECTION_ICON_MAP[iconKey] ?? FiGrid;
  const accent =
    COLLECTION_COLOR_ACCENT_MAP[colorKey] ?? COLLECTION_COLOR_ACCENT_MAP.Purple;
  const collectionGames =
    ((collection as any).collectionGames as Array<{ game?: any }> | undefined)
      ?.map((collectionGame) => collectionGame.game)
      .filter(Boolean) ?? [];

  const tiles =
    collectionGames.length > 0
      ? collectionGames.slice(0, 4).map((game: any, tileIndex: number) => ({
          label: game.name || `Game ${tileIndex + 1}`,
          tint:
            COLLECTION_COLOR_PREVIEW_MAP[colorKey]?.[tileIndex] ??
            COLLECTION_COLOR_PREVIEW_MAP.Purple[tileIndex],
          imageUrl: game.background_image,
        }))
      : [];

  return {
    id: collection.id,
    title: collection.name,
    description:
      collection.description?.trim() || 'No description provided yet.',
    accent,
    icon,
    visibility:
      collection.visibility?.toLowerCase() === 'private' ? 'Private' : 'Public',
    stats: {
      visibility:
        collection.visibility?.toLowerCase() === 'private'
          ? 'Private'
          : 'Public',
      theme: colorKey,
    },
    tiles,
  };
};

function CollectionPreviewTile({
  label,
  tint,
  icon: Icon,
  imageUrl,
}: CollectionTile) {
  if (imageUrl) {
    return (
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl border border-white/8 bg-zinc-900">
        <img
          src={imageUrl}
          alt={label}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-3/4 overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br ${tint}`}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-2.5">
        <div className="self-start rounded-full border border-white/15 bg-black/20 p-1.5 text-white/85">
          {Icon ? <Icon size={11} /> : null}
        </div>
        <div>
          <div className="inline-flex rounded-full bg-black/35 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/85">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCardView({ collection }: { collection: CollectionCard }) {
  const Icon = collection.icon;

  return (
    <article className="group relative overflow-hidden rounded-4xl border border-white/8 bg-[#15151f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-[#1a1a27] hover:shadow-2xl hover:shadow-violet-950/30">
      <Link
        to={`/collections/${collection.id}`}
        className="absolute inset-0 z-10 rounded-4xl"
        aria-label={`Open ${collection.title}`}
      />
      <div
        className={`absolute inset-x-0 top-0 z-0 h-px bg-linear-to-r opacity-60 transition-opacity duration-300 group-hover:opacity-100 ${collection.accent}`}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-0 flex items-start justify-between gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br text-white transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2 ${collection.accent}`}
        >
          <Icon size={27} />
        </div>

        {collection.title === 'Currently Playing' ? (
          <div className="h-8 w-8" />
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      <div className="relative z-0 mt-6 transition-transform duration-300 group-hover:-translate-y-0.5">
        <h2 className="text-[1.55rem] font-semibold tracking-tight text-white">
          {collection.title}
        </h2>
        <p className="mt-2 max-w-sm text-[1.01rem] leading-7 text-zinc-300/90">
          {collection.description}
        </p>
      </div>

      <div className="relative z-0 mt-6">
        {collection.tiles.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {collection.tiles.map((tile) => (
              <div
                key={tile.label}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.02]"
              >
                <CollectionPreviewTile {...tile} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-26 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-center">
            <FiGrid size={20} className="text-zinc-600" />
            <p className="text-xs text-zinc-600">No games added yet</p>
          </div>
        )}
      </div>

      <div className="relative z-0 mt-6 flex items-center justify-between gap-3 text-sm text-zinc-300 transition-transform duration-300 group-hover:translate-y-0.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>{collection.stats.visibility}</span>
          <span className="text-zinc-600">•</span>
          <span>{collection.stats.theme}</span>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
            collection.visibility === 'Private'
              ? 'border-white/10 bg-white/5 text-zinc-100'
              : 'border-violet-400/20 bg-violet-500/15 text-violet-100'
          }`}
        >
          {collection.visibility === 'Private' ? (
            <FiLock size={12} />
          ) : (
            <FiUsers size={12} />
          )}
          {collection.visibility}
        </span>
      </div>

      <div className="relative z-0 mt-6 flex items-center gap-3">
        <Link
          to={`/collections/${collection.id}`}
          className="flex-1 rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-violet-400/30 hover:bg-white/10 hover:shadow-lg hover:shadow-violet-950/20"
        >
          View Collection
        </Link>
        <button
          type="button"
          aria-label={`Save ${collection.title}`}
          className="relative z-20 grid h-12 w-12 place-items-center rounded-2xl border border-white/8 bg-white/5 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-violet-950/20"
        >
          <FiBookmark size={18} />
        </button>
      </div>
    </article>
  );
}

const Collections = () => {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [premiumGateMessage, setPremiumGateMessage] = useState<string | null>(
    null,
  );

  const isPremium = hasPremiumAccess(user);
  const hasCollectionLimit = !isPremium && collections.length >= 3;
  const upgradePromptMessage =
    premiumGateMessage ??
    (hasCollectionLimit
      ? 'Upgrade to Premium for unlimited collections.'
      : null);

  const loadCollections = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllCollections();
      setCollections(data.map((collection) => buildCollectionCard(collection)));
    } catch (loadError) {
      console.error('Failed to load collections', loadError);
      setError('Unable to load collections right now.');
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getAllCollections()
      .then((data) => {
        if (!active) return;
        setCollections(
          data.map((collection) => buildCollectionCard(collection)),
        );
      })
      .catch((loadError) => {
        if (!active) return;
        console.error('Failed to load collections', loadError);
        setError('Unable to load collections right now.');
        setCollections([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setPremiumGateMessage(
        detail?.message || 'Premium subscription required for this action.',
      );
    };

    window.addEventListener('premium-required', handler);
    return () => window.removeEventListener('premium-required', handler);
  }, []);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden text-white">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="page-enter relative flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <div className="relative flex flex-col gap-8">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                  <FiGrid className="text-violet-300" size={14} />
                  <span>Collections</span>
                </div>
                <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Organize your games into custom collections
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                  Keep track of favorites, active plays, and upcoming backlog
                  picks with a gallery-style layout that makes each shelf feel
                  intentional.
                </p>
              </div>

              <button
                type="button"
                disabled={hasCollectionLimit}
                onClick={() => {
                  if (hasCollectionLimit) {
                    setPremiumGateMessage(
                      'Upgrade to Premium for unlimited collections.',
                    );
                    return;
                  }
                  setIsCreateOpen(true);
                }}
                className={`inline-flex items-center justify-center gap-2 self-start rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-md shadow-violet-950/30 transition ${
                  hasCollectionLimit
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                    : 'bg-linear-to-r from-violet-500 to-indigo-500 text-white hover:scale-[1.01] hover:from-violet-400 hover:to-indigo-400'
                }`}
              >
                <FiPlus size={16} />
                New Collection
              </button>
            </section>

            {upgradePromptMessage && (
              <section className="rounded-3xl border border-violet-500/30 bg-violet-500/10 px-5 py-4 text-sm text-violet-100 flex items-start gap-3">
                <FiAlertCircle size={16} className="mt-0.5 text-violet-300" />
                <div className="flex-1">
                  <p className="font-semibold">{upgradePromptMessage}</p>
                  <p className="mt-1 text-xs text-violet-200/80">
                    Unlock unlimited collections and premium features.
                  </p>
                  <Link
                    to="/upgrade"
                    className="mt-2 inline-flex text-xs font-semibold text-violet-200 hover:text-white"
                  >
                    View Premium plans
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => setPremiumGateMessage(null)}
                  className="text-xs font-semibold text-violet-200 hover:text-white"
                >
                  Dismiss
                </button>
              </section>
            )}

            {isLoading ? (
              <section className="grid gap-5 xl:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="h-112 animate-pulse rounded-4xl border border-white/8 bg-white/5"
                  />
                ))}
              </section>
            ) : error ? (
              <section className="rounded-4xl border border-white/8 bg-white/5 p-8 text-zinc-300">
                <p className="text-lg font-semibold text-white">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadCollections()}
                  className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Retry
                </button>
              </section>
            ) : collections.length === 0 ? (
              <section className="rounded-4xl border border-white/8 bg-white/5 p-8 text-zinc-300">
                <p className="text-lg font-semibold text-white">
                  No collections yet
                </p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                  Create your first collection and it will appear here.
                </p>
              </section>
            ) : (
              <section className="grid gap-5 xl:grid-cols-3">
                {collections.map((collection) => (
                  <CollectionCardView
                    key={collection.id}
                    collection={collection}
                  />
                ))}
              </section>
            )}
          </div>
        </main>
      </div>

      <CreateCollectionForm
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadCollections}
      />
    </div>
  );
};

export default Collections;
