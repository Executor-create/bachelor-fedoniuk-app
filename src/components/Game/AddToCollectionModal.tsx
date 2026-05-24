import { useEffect, useState } from 'react';
import { FiX, FiGrid } from 'react-icons/fi';
import {
  addGameToCollection,
  getAllCollections,
  type Collection,
} from '../../api/collections';
import {
  COLLECTION_ICON_MAP,
  COLLECTION_COLOR_ACCENT_MAP,
  toCollectionTitle,
} from '../../config/collectionsConfig';

type AddToCollectionModalProps = {
  gameId: string;
  gameName: string;
  onClose: () => void;
  onGameAdded: () => void;
};

export function AddToCollectionModal({
  gameId,
  gameName,
  onClose,
  onGameAdded,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllCollections()
      .then((data) => setCollections(data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load collections');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCollection = async (collectionId: string) => {
    setIsSubmitting(true);
    try {
      await addGameToCollection(collectionId, gameId);
      onGameAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to add game to collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">Add to Collection</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Select a collection for &quot;{gameName}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-zinc-400 py-8">
              Loading collections...
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">{error}</div>
          ) : collections.length === 0 ? (
            <div className="text-center text-zinc-400 py-8">
              <p className="mb-2">No collections yet</p>
              <p className="text-sm">Create a collection to add games to it</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => {
                const iconKey = toCollectionTitle(collection.icon, 'Grid');
                const colorKey = toCollectionTitle(collection.color, 'Purple');
                const Icon = COLLECTION_ICON_MAP[iconKey] ?? FiGrid;
                const accentGradient =
                  COLLECTION_COLOR_ACCENT_MAP[colorKey] ??
                  COLLECTION_COLOR_ACCENT_MAP.Purple;

                return (
                  <button
                    key={collection.id}
                    onClick={() => handleAddToCollection(collection.id)}
                    disabled={isSubmitting}
                    className="w-full flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-700/80 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 font-bold bg-linear-to-br ${accentGradient}`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {collection.name}
                      </p>
                      {collection.description && (
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddToCollectionModal;
