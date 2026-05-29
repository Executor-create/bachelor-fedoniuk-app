import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoAdd,
  IoHeart,
  IoHeartOutline,
  IoShareSocialOutline,
  IoCheckmark,
} from 'react-icons/io5';
import { MdZoomIn } from 'react-icons/md';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import ReviewsSection from '../components/Game/ReviewsSection';
import { AddToCollectionModal } from '../components/Game/AddToCollectionModal';
import {
  fetchGameById,
  favoriteGame,
  getUserFavoriteGames,
  unfavoriteGame,
} from '../api/games';
import type { Game } from '../api/games';
import { useAuth } from '../contexts/AuthContext';

function renderStars(rating: number) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }).map((_, i) =>
    i < rounded ? (
      <AiFillStar
        key={i}
        className="text-yellow-400"
        style={{ fontSize: 16 }}
      />
    ) : (
      <AiOutlineStar
        key={i}
        className="text-zinc-600"
        style={{ fontSize: 16 }}
      />
    ),
  );
}

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const [showAddToCollectionModal, setShowAddToCollectionModal] =
    useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (!id) {
      setError('Game not found.');
      return;
    }
    setLoading(true);
    setError(null);
    fetchGameById(id)
      .then((data) => setGame(data))
      .catch((err) => {
        console.error(err);
        setError('Unable to load game details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user?.id) {
      setIsFavorite(false);
      setFavoriteLoading(false);
      return;
    }

    let active = true;

    const loadFavorites = async () => {
      setFavoriteLoading(true);

      try {
        const favorites = await getUserFavoriteGames(user.id);
        if (!active) return;

        setIsFavorite(favorites.some((favorite) => favorite.id === id));
      } catch (error) {
        console.error('Failed to load favorite games', error);
        if (!active) return;
        setIsFavorite(false);
      } finally {
        if (active) setFavoriteLoading(false);
      }
    };

    loadFavorites();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const handlePrevImage = () => {
    if (!game || selectedImageIndex === null) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? game.screenshots.length - 1 : prev! - 1,
    );
  };

  const handleNextImage = () => {
    if (!game || selectedImageIndex === null) return;
    setSelectedImageIndex((prev) =>
      prev === game.screenshots.length - 1 ? 0 : prev! + 1,
    );
  };

  useEffect(() => {
    if (selectedImageIndex === null || !game) return;

    const screenshotCount = game.screenshots.length;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) =>
          prev === null ? null : prev === 0 ? screenshotCount - 1 : prev - 1,
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) =>
          prev === null ? null : prev === screenshotCount - 1 ? 0 : prev + 1,
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, game]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = game?.name ?? 'Check out this game';
    const text = `Check out ${title} on Klyro!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled or share failed — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  const handleFavoriteToggle = async () => {
    if (!game || favoritePending) return;

    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    setFavoritePending(true);

    try {
      if (nextFavorite) {
        await favoriteGame(game.id);
      } else {
        await unfavoriteGame(game.id);
      }
    } catch (error) {
      console.error('Failed to update favorite state', error);
      setIsFavorite(!nextFavorite);
    } finally {
      setFavoritePending(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />
        <main className="page-enter flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition"
          >
            ← Back to library
          </button>
          {loading ? (
            <p className="text-white">Loading game details…</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : !game ? (
            <p className="text-zinc-300">No game found.</p>
          ) : (
            <article className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-violet-950/50">
              <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] mb-6">
                <div className="relative overflow-hidden rounded-xl h-92.5">
                  <img
                    src={game.background_image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="space-y-4">
                  <h1
                    className="text-4xl font-black tracking-tight"
                    style={{
                      background:
                        'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {game.name}
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Released: {game.release_date}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      {renderStars(game.rating)}
                    </div>
                    <span className="text-xs font-semibold text-violet-300 border border-violet-500 rounded-full px-3 py-1">
                      {game.rating.toFixed(1)} / 5
                    </span>
                    <span className="text-xs font-semibold text-emerald-300 border border-emerald-500 rounded-full px-3 py-1">
                      Metacritic {game.metacritic_rating}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-4">
                    <div className="text-sm">
                      <strong className="text-zinc-100 block mb-2">
                        Genres
                      </strong>
                      <p className="text-zinc-400">
                        {game.genres.join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <strong className="text-zinc-100 block mb-2">
                        Platforms
                      </strong>
                      <p className="text-zinc-400">
                        {game.platforms.join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="text-sm sm:col-span-2">
                      <strong className="text-zinc-100 block mb-2">
                        Stores
                      </strong>
                      <p className="text-zinc-400">
                        {game.stores.join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h2 className="text-sm font-semibold text-zinc-200 mb-2">
                      Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {game.tags.length > 0 ? (
                        game.tags.slice(0, 10).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">
                          No tags available
                        </span>
                      )}
                      {game.tags.length > 10 && (
                        <span className="text-xs text-zinc-500 px-2 py-1">
                          +{game.tags.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => setShowAddToCollectionModal(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                    >
                      <IoAdd size={20} />
                      <span>Add to Collection</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFavoriteToggle}
                      disabled={favoriteLoading || favoritePending}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isFavorite
                          ? 'border-red-500 bg-red-500/10 text-red-400 hover:border-red-400 hover:text-red-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-600 hover:text-white'
                      }`}
                      aria-pressed={isFavorite}
                      aria-label={
                        isFavorite ? 'Unfavorite game' : 'Favorite game'
                      }
                    >
                      {isFavorite ? (
                        <IoHeart size={20} />
                      ) : (
                        <IoHeartOutline size={20} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Share game"
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                        shareStatus === 'copied'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {shareStatus === 'copied' ? (
                        <IoCheckmark size={18} />
                      ) : (
                        <IoShareSocialOutline size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-zinc-200">
                    Screenshots
                  </h2>
                  {game.screenshots.length > 0 && (
                    <span className="text-xs text-zinc-500">
                      {game.screenshots.length}{' '}
                      {game.screenshots.length === 1 ? 'image' : 'images'}
                    </span>
                  )}
                </div>
                {game.screenshots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {game.screenshots.map((screenshotUrl, index) => (
                      <button
                        key={`${screenshotUrl}-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        className="group relative overflow-hidden rounded-lg border border-zinc-800 hover:border-violet-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <img
                          src={screenshotUrl}
                          alt={`${game.name} screenshot ${index + 1}`}
                          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                          <MdZoomIn
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            size={24}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">
                    No screenshots available.
                  </p>
                )}
              </div>
              <ReviewsSection
                gameId={game.id}
                game={{
                  name: game.name,
                  genres: game.genres,
                  background_image: game.background_image,
                }}
              />
            </article>
          )}
        </main>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && game && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
            aria-label="Close"
          >
            <IoClose size={28} />
          </button>

          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-zinc-900/80 text-white text-sm font-medium">
            {selectedImageIndex + 1} / {game.screenshots.length}
          </div>

          {game.screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 z-10 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
              aria-label="Previous image"
            >
              <IoChevronBack size={28} />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-7xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={game.screenshots[selectedImageIndex]}
              alt={`${game.name} screenshot ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {game.screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 z-10 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
              aria-label="Next image"
            >
              <IoChevronForward size={28} />
            </button>
          )}

          {game.screenshots.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 p-3 bg-zinc-900/80 rounded-lg max-w-full overflow-x-auto">
              {game.screenshots.map((screenshot, index) => (
                <button
                  key={`thumb-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                  className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex
                      ? 'border-violet-500 scale-110'
                      : 'border-transparent hover:border-zinc-600'
                  }`}
                >
                  <img
                    src={screenshot}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="absolute bottom-4 right-4 text-xs text-zinc-400 hidden sm:block">
            Press ESC to close • Use arrow keys to navigate
          </div>
        </div>
      )}

      {showAddToCollectionModal && game && (
        <AddToCollectionModal
          gameId={game.id}
          gameName={game.name}
          onClose={() => setShowAddToCollectionModal(false)}
          onGameAdded={() => {
            console.log('Game added to collection');
          }}
        />
      )}
    </div>
  );
};

export default GameDetail;
