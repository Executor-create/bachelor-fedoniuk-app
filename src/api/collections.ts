import api from '../config/api';

export type Visibility = 'Public' | 'Private';

export type Collection = {
  id: string;
  name: string;
  description?: string | null;
  visibility: Visibility | string;
  icon: string;
  color: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type CreateCollectionRequest = {
  name: string;
  description?: string | null;
  visibility: Visibility;
  icon: string;
  color: string;
};

type CollectionResponse = Collection | { data: Collection };
type CollectionsResponse = Collection[] | { data: Collection[] };

const unwrapCollection = (payload: CollectionResponse): Collection => {
  if (
    payload &&
    typeof payload === 'object' &&
    Object.prototype.hasOwnProperty.call(payload, 'data')
  ) {
    return (payload as { data: Collection }).data;
  }

  return payload as Collection;
};

const unwrapCollections = (payload: CollectionsResponse): Collection[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

export const createCollection = async (
  body: CreateCollectionRequest,
): Promise<Collection> => {
  const response = await api.post<CollectionResponse>('/collections/', body);

  if (response.status !== 201 && response.status !== 200) {
    throw new Error('Failed to create collection');
  }

  return unwrapCollection(response.data);
};

export const getAllCollections = async (): Promise<Collection[]> => {
  const response = await api.get<CollectionsResponse>('/collections/');

  if (response.status !== 200) {
    throw new Error('Failed to load collections');
  }

  return unwrapCollections(response.data);
};

export const getCollectionById = async (id: string): Promise<Collection> => {
  const response = await api.get<CollectionResponse>(`/collections/${id}`);

  if (response.status !== 200) {
    throw new Error('Failed to load collection');
  }

  return unwrapCollection(response.data);
};

export const addGameToCollection = async (
  collectionId: string,
  gameId: string,
): Promise<void> => {
  const response = await api.post(
    `/collections/${collectionId}/games`,
    { gameId },
  );

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to add game to collection');
  }
};

export default { createCollection, getAllCollections, getCollectionById, addGameToCollection };