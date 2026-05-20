import api from '../config/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UploadResponse = any;
export type UploadMediaKind = 'avatar' | 'post';

const uploadPaths: Record<UploadMediaKind, string> = {
  avatar: '/media/upload/avatar',
  post: '/media/upload/post',
};

const extractUrl = (payload: UploadResponse): string => {
  if (typeof payload === 'string' && payload.length > 0) return payload;

  if (typeof payload === 'object' && payload !== null) {
    for (const key of ['url', 'file_url', 'avatar_url', 'path', 'uri', 'src', 'image_url']) {
      if (typeof payload[key] === 'string' && payload[key].length > 0) {
        return payload[key] as string;
      }
    }

    if (payload.data !== undefined) {
      if (typeof payload.data === 'string' && payload.data.length > 0) {
        return payload.data as string;
      }
      if (typeof payload.data === 'object' && payload.data !== null) {
        for (const key of ['url', 'file_url', 'avatar_url', 'path', 'uri', 'src', 'image_url']) {
          if (typeof payload.data[key] === 'string' && payload.data[key].length > 0) {
            return payload.data[key] as string;
          }
        }
      }
    }

    if (typeof payload.result === 'object' && payload.result !== null) {
      for (const key of ['url', 'file_url', 'avatar_url', 'path', 'uri', 'src', 'image_url']) {
        if (typeof payload.result[key] === 'string' && payload.result[key].length > 0) {
          return payload.result[key] as string;
        }
      }
    }

    if (
      typeof payload.profile === 'object' &&
      payload.profile !== null &&
      typeof payload.profile.avatar_url === 'string' &&
      payload.profile.avatar_url.length > 0
    ) {
      return payload.profile.avatar_url as string;
    }
  }

  console.error('Unexpected media upload response:', payload);
  throw new Error('Unexpected response format from media upload');
};


export const uploadMedia = async (file: File): Promise<string> => {
  return uploadMediaWithKind(file, 'avatar');
};

export const uploadMediaWithKind = async (
  file: File,
  kind: UploadMediaKind,
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>(uploadPaths[kind], formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to upload media');
  }

  return extractUrl(response.data);
};
