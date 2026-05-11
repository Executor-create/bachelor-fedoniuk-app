import { useEffect, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAward,
  FiBookmark,
  FiClock,
  FiGrid,
  FiLock,
  FiPlus,
  FiStar,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import {
  getAllCollections,
  type Collection as ApiCollection,
} from '../api/collections';
import Header from '../components/Header';
import CreateCollectionForm from '../components/Collections/CreateCollectionForm';
import Sidebar from '../components/Sidebar/Sidebar';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

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

const iconMap: Record<string, IconComponent> = {
  Heart: FiStar,
  Star: FiStar,
  Trophy: FiAward,
  Clock: FiClock,
  Grid: FiGrid,
  Sparkles: HiSparkles,
  Flame: FiZap,
  Zap: FiZap,
};

const colorAccentMap: Record<string, string> = {
  Rose: 'from-rose-500/90 to-rose-500/30',
  Blue: 'from-blue-500/90 to-blue-500/30',
  Purple: 'from-violet-500/90 to-violet-500/30',
  Emerald: 'from-emerald-500/90 to-emerald-500/30',
  Orange: 'from-orange-500/90 to-orange-500/30',
  Pink: 'from-pink-500/90 to-pink-500/30',
  Indigo: 'from-indigo-500/90 to-indigo-500/30',
  Yellow: 'from-amber-400/90 to-amber-500/30',
};

const colorPreviewMap: Record<string, string[]> = {
  Rose: [
    'from-rose-500/80 via-rose-400/20 to-slate-950',
    'from-fuchsia-500/80 via-rose-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-orange-500/75 via-rose-500/20 to-slate-950',
  ],
  Blue: [
    'from-blue-500/80 via-sky-400/25 to-slate-950',
    'from-cyan-500/80 via-blue-400/25 to-slate-950',
    'from-slate-100/90 via-slate-300/30 to-slate-950',
    'from-indigo-500/75 via-blue-500/20 to-slate-950',
  ],
  Purple: [
    'from-violet-500/80 via-fuchsia-500/25 to-slate-950',
    'from-fuchsia-500/80 via-violet-500/20 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-indigo-500/75 via-violet-500/20 to-slate-950',
  ],
  Emerald: [
    'from-emerald-500/80 via-green-400/25 to-slate-950',
    'from-teal-500/80 via-emerald-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-lime-500/75 via-emerald-500/20 to-slate-950',
  ],
  Orange: [
    'from-orange-500/80 via-amber-400/25 to-slate-950',
    'from-amber-500/80 via-orange-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-rose-500/75 via-orange-500/20 to-slate-950',
  ],
  Pink: [
    'from-pink-500/80 via-rose-400/25 to-slate-950',
    'from-fuchsia-500/80 via-pink-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-violet-500/75 via-pink-500/20 to-slate-950',
  ],
  Indigo: [
    'from-indigo-500/80 via-blue-400/25 to-slate-950',
    'from-violet-500/80 via-indigo-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-cyan-500/75 via-indigo-500/20 to-slate-950',
  ],
  Yellow: [
    'from-amber-400/80 via-yellow-300/25 to-slate-950',
    'from-orange-500/80 via-amber-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-rose-500/75 via-amber-500/20 to-slate-950',
  ],
};

const toTitle = (
  value: string | null | undefined,
  fallback: string,
): string => {
  if (!value) {
    return fallback;
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const buildCollectionCard = (collection: ApiCollection): CollectionCard => {
  const iconKey = toTitle(collection.icon, 'Grid');
  const colorKey = toTitle(collection.color, 'Purple');
  const icon = iconMap[iconKey] ?? FiGrid;
  const accent = colorAccentMap[colorKey] ?? colorAccentMap.Purple;
  const collectionGames =
    ((collection as any).collectionGames as Array<{ game?: any }> | undefined)
      ?.map((collectionGame) => collectionGame.game)
      .filter(Boolean) ?? [];

  const tiles =
    collectionGames.length > 0
      ? collectionGames.slice(0, 4).map((game: any, tileIndex: number) => ({
          label: game.name || `Game ${tileIndex + 1}`,
          tint:
            colorPreviewMap[colorKey]?.[tileIndex] ??
            colorPreviewMap.Purple[tileIndex],
          imageUrl: game.background_image,
        }))
      : (colorPreviewMap[colorKey] ?? colorPreviewMap.Purple).map(
          (tint, tileIndex) => ({
            label: [
              iconKey,
              colorKey,
              collection.visibility,
              collection.description ? 'Notes' : 'Empty',
            ][tileIndex],
            tint,
            icon: [FiZap, FiGrid, FiClock, FiBookmark][tileIndex],
          }),
        );

  return {
    id: collection.id,
    title: collection.name,
    description:
      collection.description?.trim() || 'No description provided yet.',
    accent,
    icon,
    visibility: collection.visibility === 'Private' ? 'Private' : 'Public',
    stats: {
      visibility: collection.visibility === 'Private' ? 'Private' : 'Public',
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

      <div className="relative z-0 mt-6 grid grid-cols-4 gap-2">
        {collection.tiles.map((tile) => (
          <div
            key={tile.label}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.02]"
          >
            <CollectionPreviewTile {...tile} />
          </div>
        ))}
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    void loadCollections();
  }, []);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden text-white">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="relative flex-1 overflow-y-auto px-8 pb-8 pt-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
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
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-linear-to-r from-violet-500 to-indigo-500 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-950/30 transition hover:scale-[1.01] hover:from-violet-400 hover:to-indigo-400"
              >
                <FiPlus size={16} />
                New Collection
              </button>
            </section>

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
