import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { fetchGames, type Game } from '../../api/games';

type TagGameModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (game: Game) => void;
  selectedGameId?: string | null;
};

const TagGameModal = ({
  open,
  onClose,
  onSelect,
  selectedGameId,
}: TagGameModalProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setIsLoading(true);

      const query = searchQuery.trim();

      fetchGames(40, undefined, {
        search: query || undefined,
        signal: controller.signal,
      })
        .then((response) => {
          const data = query
            ? response.data.filter((g) =>
                g.name.toLowerCase().includes(query.toLowerCase()),
              )
            : response.data;
          setGames(data);
        })
        .catch((error) => {
          if (error?.name === 'CanceledError' || error?.name === 'AbortError')
            return;
          console.error('Failed to load games', error);
        })
        .finally(() => setIsLoading(false));
    }, 300);

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, searchQuery]);

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white text-zinc-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-violet-600">
              Tag a Game
            </h2>
            <p className="text-sm text-zinc-500">
              Select a game to tag in your post.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100"
            aria-label="Close tag game dialog"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5">
          <label className="text-sm font-semibold text-zinc-700">
            Search Games
          </label>
          <div className="relative mt-2">
            <FiSearch
              size={18}
              className="absolute left-3 top-3 text-zinc-400"
            />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search for a game..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-violet-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="max-h-90 overflow-y-auto px-5 pb-5">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-zinc-500">
              Loading games...
            </div>
          ) : games.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500">
              No games found.
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => {
                const isSelected = game.id === selectedGameId;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => onSelect(game)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                      isSelected
                        ? 'border-violet-400 bg-violet-50'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-white'
                    }`}
                  >
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {game.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {game.genres?.[0] ?? 'Game'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagGameModal;
