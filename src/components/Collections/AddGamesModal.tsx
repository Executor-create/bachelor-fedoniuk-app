import { useEffect, useState } from 'react';
import { FiSearch, FiStar, FiX } from 'react-icons/fi';
import { addGameToCollection } from '../../api/collections';
import { fetchGames, type Game } from '../../api/games';

type AddGamesModalProps = {
  collectionId: string;
  collectionTitle: string;
  onClose: () => void;
  onGamesAdded: () => void;
};

export function AddGamesModal({
  collectionId,
  collectionTitle,
  onClose,
  onGamesAdded,
}: AddGamesModalProps) {
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoadingGames(true);
    fetchGames(50)
      .then((response) => setAvailableGames(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingGames(false));
  }, []);

  const handleToggleGame = (gameId: string) => {
    setSelectedGameIds((prev) => {
      const next = new Set(prev);
      next.has(gameId) ? next.delete(gameId) : next.add(gameId);
      return next;
    });
  };

  const handleAddGames = async () => {
    if (selectedGameIds.size === 0) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        [...selectedGameIds].map((gameId) =>
          addGameToCollection(collectionId, gameId),
        ),
      );
      onGamesAdded();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGames = availableGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              Add Games to Collection
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Select games to add to &quot;{collectionTitle}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 border-b border-zinc-800">
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-3 text-zinc-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search games by title, developer, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingGames ? (
            <div className="text-center text-zinc-400 py-8">
              Loading games...
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center text-zinc-400 py-8">
              No games found.
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                Available Games ({filteredGames.length})
              </h3>
              <div className="space-y-2">
                {filteredGames.map((game) => (
                  <label
                    key={game.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-700/80 hover:shadow-lg hover:shadow-black/20"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGameIds.has(game.id)}
                      onChange={() => handleToggleGame(game.id)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {game.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-400">
                          {game.genres[0] || 'Game'}
                        </span>
                        <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                          <FiStar size={12} />
                          {game.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-950">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddGames}
            disabled={selectedGameIds.size === 0 || isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : `Add Games (${selectedGameIds.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
