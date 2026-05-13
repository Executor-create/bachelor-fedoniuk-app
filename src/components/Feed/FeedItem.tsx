import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import { likePost, unlikePost } from '../../api/posts';

interface FeedItemProps {
  postId?: string;
  userId?: string;
  linkToPost?: boolean;
  className?: string;
  user: string;
  avatar?: string;
  content: string;
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

const FeedItem = ({
  postId,
  userId,
  linkToPost = true,
  user,
  avatar,
  content,
  timestamp,
  likes = 0,
  isLiked = false,
  comments = 0,
  onCommentClick,
  taggedGames,
}: FeedItemProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLikePending, setIsLikePending] = useState(false);

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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full">
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <img
            src={avatar}
            alt={user}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-zinc-700 text-white flex items-center justify-center font-semibold shrink-0">
            {userInitial}
          </div>
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
      {taggedGames && taggedGames.length > 0 && (
        <div className="mb-4 space-y-3">
          {taggedGames.map(({ game }) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-800 p-4 transition-colors hover:border-zinc-700"
            >
              <img
                src={game.background_image || 'https://via.placeholder.com/64'}
                alt={game.name}
                className="h-16 w-16 rounded-lg object-cover"
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
        <button
          onClick={handleLike}
          disabled={!postId || isLikePending}
          className={`flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
            liked ? 'text-red-500' : 'hover:text-red-500'
          } ${isLikePending ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <FiHeart size={20} className={liked ? 'fill-red-500' : ''} />
          <span>{likeCount}</span>
        </button>
        <button
          onClick={() => {
            if (onCommentClick) {
              onCommentClick();
            } else if (postId && linkToPost) {
              navigate(`/posts/${postId}`);
            }
          }}
          disabled={!postId && !onCommentClick}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <FiMessageCircle size={20} />
          <span>{comments}</span>
        </button>
      </div>
    </div>
  );
};

export default FeedItem;
