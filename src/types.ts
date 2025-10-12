export type SubjectType =
  | 'all'
  | 'book'
  | 'anime'
  | 'music'
  | 'game'
  | 'real';

export const subjectTypeMap: Record<SubjectType, string | null> = {
  'all': null,
  'book': '1',
  'anime': '2',
  'music': '3',
  'game': '4',
  'real': '6',
};

export type CollectionType =
  | 'all'
  | 'wish'
  | 'collect'
  | 'do'
  | 'on_hold'
  | 'dropped';

export const collectionTypeMap: Record<CollectionType, string | null> = {
  'all': null,
  'wish': '1',
  'collect': '2',
  'do': '3',
  'on_hold': '4',
  'dropped': '5',
};

export interface Subject {
  id: string,
  date: string,
  images: {
    'small': string,
    'grid': string,
    'medium': string,
    'large': string,
    'common': string,
  },
  name: string,
  name_cn: string,
  short_summary: string,
  tags: {
    name: string,
    count: number,
    total_cont: number,
  }[],
  rank: number,
}

export interface BgmCollectionResponse {
  total: number;
  data: {
    subject: Subject;
  }[];
}

export interface Params {
  username: string,
  subjectType?: SubjectType,
  collectionType?: CollectionType,
  limit?: number,
  offset?: number,
}