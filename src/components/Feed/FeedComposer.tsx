import { useState } from 'react';
import { FiImage, FiTag, FiX } from 'react-icons/fi';
import type { Game } from '../../api/games';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import TagGameModal from './TagGameModal';

const FeedComposer = () => {
  const { user } = useAuth();
  const userInitial = user?.username?.trim()?.[0]?.toUpperCase() ?? 'U';

  const [isTagGameOpen, setIsTagGameOpen] = useState(false);
  const [taggedGame, setTaggedGame] = useState<Game | null>(null);
  const [postText, setPostText] = useState('');

  const handleSelectGame = (game: Game) => {
    setTaggedGame(game);
    setIsTagGameOpen(false);
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    // TODO: wire up to post creation API
    setPostText('');
    setTaggedGame(null);
  };

  const canPost = postText.trim().length > 0;

  return (
    <>
      <Card className="bg-(--third-color) border-gray-700 max-w-3xl">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-semibold shrink-0">
              {userInitial}
            </div>
            <div className="flex-1">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full min-h-[110px] resize-none rounded-xl border border-gray-700 bg-(--fourth-color) px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
                placeholder="What's on your mind? Share your gaming thoughts..."
              />
              {taggedGame && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                  <span className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1">
                    <FiTag size={12} />
                    <span className="text-gray-200">{taggedGame.name}</span>
                    <button
                      type="button"
                      onClick={() => setTaggedGame(null)}
                      className="text-gray-400 hover:text-white"
                      aria-label="Remove tagged game"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-800 pt-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FiImage size={18} />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTagGameOpen(true)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FiTag size={18} />
                  <span>Tag Game</span>
                </button>
                <div className="ml-auto">
                  <Button
                    type="button"
                    onClick={handlePost}
                    disabled={!canPost}
                    className="rounded-lg bg-(--primary-color) px-5 py-2 text-sm font-semibold text-white hover:bg-(--secondary-color) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <TagGameModal
        open={isTagGameOpen}
        onClose={() => setIsTagGameOpen(false)}
        onSelect={handleSelectGame}
        selectedGameId={taggedGame?.id}
      />
    </>
  );
};

export default FeedComposer;
