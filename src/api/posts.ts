import api from '../config/api';

export type CreatePostPayload = {
  content: string;
  image?: string | null;
  taggedGameIds?: string[];
};

export type Post = {
  id: string;
  content: string;
  image?: string | null;
  taggedGameIds?: string[];
  taggedGames?: Array<{
    game: {
      id: string;
      name: string;
      background_image?: string | null;
    };
  }>;
  user?: {
    id?: string;
    username?: string;
    avatar?: string;
    profile?: {
      display_name?: string;
      avatar_url?: string | null;
    };
  };
  author?: {
    username?: string;
    avatar?: string;
  };
  likes?: number;
  isLiked?: boolean;
  comments?: number;
  commentsList?: PostComment[];
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PostComment = {
  id?: string;
  content: string;
  created_at?: string;
  createdAt?: string;
  user?: {
    id?: string;
    username?: string;
    avatar?: string;
    profile?: {
      display_name?: string;
      avatar_url?: string | null;
    };
  };
  author?: {
    username?: string;
    avatar?: string;
  };
};

type PostResponse = Post | { data: Post };
type PostsResponse = Post[] | { data: Post[] };
type PostCommentResponse = PostComment | { data: PostComment };
type PostCommentsResponse = PostComment[] | { data: PostComment[] };

const unwrapPost = (payload: PostResponse): Post => {
  if (
    payload &&
    typeof payload === 'object' &&
    Object.prototype.hasOwnProperty.call(payload, 'data')
  ) {
    return (payload as { data: Post }).data;
  }

  return payload as Post;
};

const unwrapPosts = (payload: PostsResponse): Post[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

const unwrapComments = (payload: PostCommentsResponse): PostComment[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

const unwrapComment = (payload: PostCommentResponse): PostComment => {
  if (
    payload &&
    typeof payload === 'object' &&
    Object.prototype.hasOwnProperty.call(payload, 'data')
  ) {
    return (payload as { data: PostComment }).data;
  }

  return payload as PostComment;
};

export const createPost = async (body: CreatePostPayload): Promise<Post> => {
  const response = await api.post<PostResponse>('/posts', body);

  if (response.status !== 201 && response.status !== 200) {
    throw new Error('Failed to create post');
  }

  return unwrapPost(response.data);
};

export const getAllPosts = async (): Promise<Post[]> => {
  const response = await api.get<PostsResponse>('/posts');

  if (response.status !== 200) {
    throw new Error('Failed to load posts');
  }

  return unwrapPosts(response.data);
};

export const getPostsByGame = async (gameId: string): Promise<Post[]> => {
  const response = await api.get<PostsResponse>(`/games/${gameId}/posts`);

  if (response.status !== 200) {
    throw new Error('Failed to load game posts');
  }

  return unwrapPosts(response.data);
};

export const getPostsByUser = async (userId: string): Promise<Post[]> => {
  const response = await api.get<PostsResponse>(`/posts/user/${userId}`);

  if (response.status !== 200) {
    throw new Error('Failed to load user posts');
  }

  return unwrapPosts(response.data);
};

export const getPostById = async (id: string): Promise<Post> => {
  const response = await api.get<PostResponse>(`/posts/${id}`);

  if (response.status !== 200) {
    throw new Error('Failed to load post');
  }

  return unwrapPost(response.data);
};

export const likePost = async (id: string, userId: string): Promise<void> => {
  const response = await api.post(`/posts/${id}/like`, { userId });

  if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
    throw new Error('Failed to like post');
  }
};

export const unlikePost = async (id: string, userId: string): Promise<void> => {
  const response = await api.post(`/posts/${id}/unlike`, { userId });

  if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
    throw new Error('Failed to unlike post');
  }
};

export const createPostComment = async (
  id: string,
  content: string,
): Promise<PostComment> => {
  const response = await api.post<PostCommentResponse>(
    `/posts/${id}/comments`,
    { content },
  );

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to create comment');
  }

  return unwrapComment(response.data);
};

export type MostLikedPost = {
  post: Post;
  likeCount: number;
};

export const fetchMostLikedPosts = async (limit = 6): Promise<MostLikedPost[]> => {
  const response = await api.get<MostLikedPost[]>('/posts/most-liked/week', {
    params: { limit },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const getPostComments = async (id: string): Promise<PostComment[]> => {
  const response = await api.get<PostCommentsResponse>(`/posts/${id}/comments`);

  if (response.status !== 200) {
    throw new Error('Failed to load comments');
  }

  return unwrapComments(response.data);
};
