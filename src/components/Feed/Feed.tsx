import { useCallback, useEffect, useRef, useState } from 'react';
import { getAllPosts, type Post } from '../../api/posts';
import FeedComposer from './FeedComposer';
import FeedItem from './FeedItem';
import { useAuth } from '../../contexts/AuthContext';

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

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isFirstLoad = useRef(true);

  const loadPosts = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setHasError(false);

    try {
      const data = await getAllPosts(signal);
      if (signal?.aborted) return;
      setPosts(data);
      isFirstLoad.current = false;
    } catch (error) {
      if ((error as any)?.name === 'CanceledError' || signal?.aborted) return;
      console.error('Failed to load posts', error);
      setHasError(true);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

  const handlePostCreated = useCallback(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="space-y-4">
          <FeedComposer onPostCreated={handlePostCreated} />
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
              const commentCount =
                post.comments ??
                (post as any).commentsCount ??
                (post as any).comment_count ??
                post.commentsList?.length ??
                0;

              return (
                <FeedItem
                  key={post.id}
                  postId={post.id}
                  userId={post.user?.id ?? post.author?.id}
                  user={userName}
                  avatar={avatar}
                  content={post.content}
                  image={post.image}
                  timestamp={timestamp}
                  likes={post.likes ?? 0}
                  isLiked={post.isLiked ?? false}
                  comments={commentCount}
                  taggedGames={post.taggedGames}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
