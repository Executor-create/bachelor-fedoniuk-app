import { useRef, useState } from 'react';
import { FiImage, FiTag, FiX } from 'react-icons/fi';
import type { Game } from '../../api/games';
import { createPost, type CreatePostPayload } from '../../api/posts';
import { uploadMediaWithKind } from '../../api/media';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import TagGameModal from './TagGameModal';
import { motion, AnimatePresence } from 'framer-motion';

type FeedComposerProps = {
  onPostCreated?: () => void | Promise<void>;
};

const FeedComposer = ({ onPostCreated }: FeedComposerProps) => {
  const { user } = useAuth();
  const avatarUrl =
    user?.profile?.avatar_url ?? (user as any)?.avatar_url ?? null;
  const displayName =
    (user as any)?.profile?.display_name ??
    (user as any)?.display_name ??
    user?.username ??
    '';
  const userInitial = displayName.trim()[0]?.toUpperCase() ?? 'U';

  const [isTagGameOpen, setIsTagGameOpen] = useState(false);
  const [taggedGame, setTaggedGame] = useState<Game | null>(null);
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectGame = (game: Game) => {
    setTaggedGame(game);
    setIsTagGameOpen(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setIsUploading(true);

    try {
      const url = await uploadMediaWithKind(file, 'post');
      setImageUrl(url);
    } catch (error) {
      console.error('Failed to upload image', error);
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!postText.trim() || isPosting) return;

    const payload: CreatePostPayload = {
      content: postText.trim(),
    };

    if (taggedGame) {
      payload.taggedGameIds = [taggedGame.id];
    }

    if (imageUrl) {
      payload.image = imageUrl;
    }

    setIsPosting(true);

    try {
      await createPost(payload);
      await onPostCreated?.();
      setPostText('');
      setTaggedGame(null);
      handleRemoveImage();
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = postText.trim().length > 0 && !isUploading;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full"
      >
        <div className="flex gap-4">
          <motion.div
            className="h-12 w-12 rounded-full shrink-0 overflow-hidden"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full bg-zinc-800"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-700 text-white flex items-center justify-center font-semibold">
                {userInitial}
              </div>
            )}
          </motion.div>
          <div className="flex-1">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full min-h-27.5 resize-none rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              placeholder="What's on your mind? Share your gaming thoughts..."
            />

            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="mt-3 relative inline-block"
                >
                  <img
                    src={imagePreview}
                    alt="Post image preview"
                    className="max-h-48 rounded-xl object-cover border border-zinc-700"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                      <span className="text-xs text-white">Uploading…</span>
                    </div>
                  )}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      aria-label="Remove image"
                      className="absolute top-1.5 right-1.5 rounded-full bg-zinc-900/80 p-1 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {taggedGame && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="mt-3 flex items-center gap-2 text-sm text-zinc-300"
                >
                  <span className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1">
                    <FiTag size={12} />
                    <span className="text-zinc-200">{taggedGame.name}</span>
                    <button
                      type="button"
                      onClick={() => setTaggedGame(null)}
                      className="text-zinc-400 hover:text-white"
                      aria-label="Remove tagged game"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
              <motion.button
                type="button"
                onClick={handleImageClick}
                disabled={isUploading}
                whileHover={!isUploading ? { scale: 1.05, color: '#fff' } : {}}
                whileTap={!isUploading ? { scale: 0.95 } : {}}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiImage size={18} />
                <span>{isUploading ? 'Uploading…' : 'Image'}</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setIsTagGameOpen(true)}
                whileHover={{ scale: 1.05, color: '#fff' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <FiTag size={18} />
                <span>Tag Game</span>
              </motion.button>
              <div className="ml-auto">
                <motion.div
                  whileHover={canPost && !isPosting ? { scale: 1.04 } : {}}
                  whileTap={canPost && !isPosting ? { scale: 0.97 } : {}}
                >
                  <Button
                    type="button"
                    onClick={handlePost}
                    disabled={!canPost || isPosting}
                    className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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
