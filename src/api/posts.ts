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
  comments?: number;
  commentsList?: Array<{
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
  }>;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type PostResponse = Post | { data: Post };
type PostsResponse = Post[] | { data: Post[] };

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

export const getPostById = async (id: string): Promise<Post> => {
  const response = await api.get<PostResponse>(`/posts/${id}`);

  if (response.status !== 200) {
    throw new Error('Failed to load post');
  }

  return unwrapPost(response.data);
};
