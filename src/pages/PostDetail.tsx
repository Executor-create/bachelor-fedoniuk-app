import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import FeedItem from '../components/Feed/FeedItem';
import { getPostById, type Post } from '../api/posts';
import { useAuth } from '../contexts/AuthContext';

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

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!id) {
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    getPostById(id)
      .then((data) => setPost(data))
      .catch((error) => {
        console.error('Failed to load post', error);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const userName =
    post?.user?.profile?.display_name ??
    post?.user?.username ??
    post?.author?.username ??
    'Gamer';
  const avatar =
    post?.user?.profile?.avatar_url ??
    post?.user?.avatar ??
    post?.author?.avatar;
  const timestamp = formatRelativeTime(
    post?.created_at ?? post?.createdAt ?? post?.updated_at ?? post?.updatedAt,
  );

  const userInitial = user?.username?.trim()?.[0]?.toUpperCase() ?? 'U';

  const comments = useMemo(
    () => post?.commentsList ?? [],
    [post?.commentsList],
  );

  const commentCount = comments.length || post?.comments || 0;

  return (
    <div className="bg-(--fourth-color) min-h-screen">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-full max-w-4xl">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 rounded-lg bg-(--primary-color) px-4 py-2 text-sm font-semibold text-white hover:bg-(--secondary-color) transition-colors"
            >
              ← Back
            </button>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
                <span className="text-4xl opacity-30">⏳</span>
                <p className="text-sm">Loading post...</p>
              </div>
            ) : hasError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
                <span className="text-4xl opacity-30">⚠️</span>
                <p className="text-sm">Could not load post.</p>
              </div>
            ) : !post ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
                <span className="text-4xl opacity-30">🕹️</span>
                <p className="text-sm">Post not found.</p>
              </div>
            ) : (
              <>
                <FeedItem
                  postId={post.id}
                  linkToPost={false}
                  className="max-w-4xl"
                  user={userName}
                  avatar={avatar}
                  content={post.content}
                  timestamp={timestamp}
                  likes={post.likes ?? 0}
                  comments={post.comments ?? 0}
                  taggedGames={post.taggedGames}
                />
                <section className="mt-8 w-full max-w-4xl rounded-2xl border border-gray-800 bg-(--third-color) p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Comments ({commentCount})
                  </h3>
                  <div className="mt-4 flex flex-wrap items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-700 text-white flex items-center justify-center font-semibold shrink-0">
                      {userInitial}
                    </div>
                    <textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 min-h-[52px] resize-none rounded-xl border border-gray-700 bg-(--fourth-color) px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
                    />
                    <button
                      type="button"
                      disabled={!commentText.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-(--primary-color) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--secondary-color) disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiSend size={16} />
                      Comment
                    </button>
                  </div>
                  <div className="mt-6 space-y-4 border-t border-gray-800 pt-6">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No comments yet. Be the first to share your thoughts.
                      </p>
                    ) : (
                      comments.map((comment) => {
                        const commentUser =
                          comment.user?.profile?.display_name ??
                          comment.user?.username ??
                          comment.author?.username ??
                          'User';
                        const commentAvatar =
                          comment.user?.profile?.avatar_url ??
                          comment.user?.avatar ??
                          comment.author?.avatar;
                        const commentTimestamp = formatRelativeTime(
                          comment.created_at ?? comment.createdAt,
                        );
                        const commentInitial =
                          commentUser.trim()?.[0]?.toUpperCase() ?? 'U';

                        return (
                          <div
                            key={
                              comment.id ?? `${commentUser}-${commentTimestamp}`
                            }
                            className="flex items-start gap-3"
                          >
                            {commentAvatar ? (
                              <img
                                src={commentAvatar}
                                alt={commentUser}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-700 text-white flex items-center justify-center font-semibold shrink-0">
                                {commentInitial}
                              </div>
                            )}
                            <div className="flex-1 rounded-xl border border-gray-700 bg-(--fourth-color) px-4 py-3">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="text-white font-semibold">
                                  {commentUser}
                                </span>
                                <span>{commentTimestamp}</span>
                              </div>
                              <p className="mt-2 text-sm text-gray-200">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostDetail;
