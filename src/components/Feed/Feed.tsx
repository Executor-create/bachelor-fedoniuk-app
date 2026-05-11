import { useCallback, useEffect, useState } from 'react';
import { getAllPosts, type Post } from '../../api/posts';
import FeedComposer from './FeedComposer';
import FeedItem from './FeedItem';

const formatRelativeTime = (value?: string) => {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const data = await getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <h2 className="text-3xl font-bold font-google bg-gradient-to-br from-(--primary-color) to-(--secondary-color) bg-clip-text text-transparent">
          Your Feed
        </h2>
        <div className="space-y-4">
          <FeedComposer onPostCreated={loadPosts} />
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
              <span className="text-4xl opacity-30">⏳</span>
              <p className="text-sm">Loading posts...</p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
              <span className="text-4xl opacity-30">⚠️</span>
              <p className="text-sm">Could not load posts.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
              <span className="text-4xl opacity-30">🎮</span>
              <p className="text-sm">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => {
              const userName =
                post.user?.profile?.display_name ??
                post.user?.username ??
                post.author?.username ??
                'Gamer';
              const avatar =
                post.user?.profile?.avatar_url ??
                post.user?.avatar ??
                post.author?.avatar;
              const timestamp = formatRelativeTime(
                post.created_at ??
                  post.createdAt ??
                  post.updated_at ??
                  post.updatedAt,
              );

              return (
                <FeedItem
                  key={post.id}
                  postId={post.id}
                  user={userName}
                  avatar={avatar}
                  content={post.content}
                  timestamp={timestamp}
                  likes={post.likes ?? 0}
                  comments={post.comments ?? 0}
                  taggedGames={post.taggedGames}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
