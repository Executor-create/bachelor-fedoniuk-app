import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiX } from 'react-icons/fi';
import { likePost, unlikePost } from '../../api/posts';
import { motion } from 'framer-motion';

interface FeedItemProps {
  postId?: string;
  userId?: string;
  linkToPost?: boolean;
  className?: string;
  user: string;
  avatar?: string;
  content: string;
  image?: string | null;
  timestamp: string;
  likes?: number;
  isLiked?: boolean;
  comments?: number;
  onCommentClick?: () => void;
  taggedGames?: Array<{
    game: {
      id: string;
      name: string;
      background_image?: string | null;
    };
  }>;
}

export default function FeedItem({
  postId,
  userId,
  linkToPost = true,
  className,
  user,
  avatar,
  content,
  image,
  timestamp,
  likes = 0,
  isLiked = false,
  comments = 0,
  onCommentClick,
  taggedGames,
}: FeedItemProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (!isImageOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsImageOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageOpen]);

  const userInitial = user?.trim()?.[0]?.toUpperCase() ?? 'U';

  const handleLike = async () => {
    if (!postId || isLikePending) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));
    setIsLikePending(true);

    try {
      if (nextLiked) {
        await likePost(postId, userId ?? '');
      } else {
        await unlikePost(postId, userId ?? '');
      }
    } catch (error) {
      console.error('Failed to update like', error);
      setLiked(!nextLiked);
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
    } finally {
      setIsLikePending(false);
    }
  };

  const contentNode =
    postId && linkToPost ? (
      <Link
        to={`/posts/${postId}`}
        className="block text-white mb-4 hover:text-gray-100 transition-colors"
      >
        {content}
      </Link>
    ) : (
      <p className="text-white mb-4">{content}</p>
    );

  const imageNode = image ? (
    <button
      type="button"
      onClick={() => setIsImageOpen(true)}
      aria-label="Open post image"
      className="mb-4 block max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 cursor-zoom-in text-left"
    >
      <img
        src={image}
        alt="Post attachment"
        loading="lazy"
        decoding="async"
        className="max-h-52 w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
      />
    </button>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full ${className ?? ''}`}
    >
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <motion.img
            src={avatar}
            alt={user}
            loading="lazy"
            decoding="async"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        ) : (
          <motion.div
            className="h-10 w-10 rounded-full bg-zinc-700 text-white flex items-center justify-center font-semibold shrink-0"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {userInitial}
          </motion.div>
        )}
        <div>
          <button
            type="button"
            onClick={() => {
              if (userId) navigate(`/profile/${userId}`);
            }}
            className="text-white font-semibold text-left hover:underline"
          >
            {user}
          </button>
          <p className="text-zinc-400 text-sm">{timestamp}</p>
        </div>
      </div>
      {contentNode}
      {imageNode}
      {taggedGames && taggedGames.length > 0 && (
        <div className="mb-4 space-y-3">
          {taggedGames.map(({ game }) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-800 p-4 transition-colors hover:border-zinc-700"
            >
              <img
                src={game.background_image ?? undefined}
                alt={game.name}
                loading="lazy"
                decoding="async"
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg object-cover bg-zinc-700"
              />
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{game.name}</p>
                <p className="text-sm text-zinc-400">View game details -&gt;</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-zinc-400 border-t border-zinc-800 pt-4">
        <motion.button
          onClick={handleLike}
          disabled={!postId || isLikePending}
          whileTap={postId && !isLikePending ? { scale: 1.3 } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className={`flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
            liked ? 'text-red-500' : 'hover:text-red-500'
          } ${isLikePending ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <motion.span
            animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiHeart size={20} className={liked ? 'fill-red-500' : ''} />
          </motion.span>
          <span>{likeCount}</span>
        </motion.button>
        <motion.button
          onClick={() => {
            if (onCommentClick) {
              onCommentClick();
            } else if (postId && linkToPost) {
              navigate(`/posts/${postId}`);
            }
          }}
          disabled={!postId && !onCommentClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <FiMessageCircle size={20} />
          <span>{comments}</span>
        </motion.button>
      </div>

      {isImageOpen && image && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
            aria-label="Close image"
          >
            <FiX size={24} />
          </button>
          <div
            className="max-w-7xl max-h-[90vh] relative"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={image}
              alt="Post attachment enlarged"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
