import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';

interface FeedItemProps {
  user: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
}

const FeedItem = ({
  user,
  avatar,
  content,
  timestamp,
  likes = 0,
  comments = 0,
}: FeedItemProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const userInitial = user?.trim()?.[0]?.toUpperCase() ?? 'U';

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Card className="bg-(--third-color) border-gray-700 max-w-3xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          {avatar ? (
            <img
              src={avatar}
              alt={user}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-700 text-white flex items-center justify-center font-semibold shrink-0">
              {userInitial}
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold">{user}</h3>
            <p className="text-gray-400 text-sm">{timestamp}</p>
          </div>
        </div>
        <p className="text-white mb-4">{content}</p>
        <div className="flex items-center gap-4 text-gray-400 border-t border-gray-800 pt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
              liked ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <FiHeart size={20} className={liked ? 'fill-red-500' : ''} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200 cursor-pointer">
            <FiMessageCircle size={20} />
            <span>{comments}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedItem;
