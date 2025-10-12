import { collectionTypeMap, subjectTypeMap, type BgmCollectionResponse, type Params, type Subject } from "./types";

export async function getSubjects(
  parms: Params
): Promise<{ subjects: Subject[], total: number }> {

  const url = getApiUrl(parms);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Bangumi API 请求失败 (${response.status}): ${response.statusText}`);
      console.error("请求URL:", url);
      return { subjects: [], total: 0 };
    }

    const data: BgmCollectionResponse = await response.json();
    const subject = data.data
      .map(item => item.subject)

    return { subjects: [...new Set(subject)], total: data.total };
  } catch (error) {
    console.error("获取 Bangumi 收藏失败:", error);
    return { subjects: [], total: 0 };
  }
}

const getApiUrl = (params: Params): string => {
  const { username, subjectType, collectionType, limit = 50, offset = 0 } = params;

  const searchParams: Record<string, string> = {
    limit: limit.toString(),
    offset: offset.toString(),
  };

  if (subjectType && subjectTypeMap[subjectType]) {
    if (subjectType !== 'all') {
      searchParams.subject_type = subjectTypeMap[subjectType];
    }
  }

  if (collectionType && collectionTypeMap[collectionType]) {
    if (collectionType !== 'all') {
      searchParams.type = collectionTypeMap[collectionType];
    }
  }

  return `https://api.bgm.tv/v0/users/${username}/collections?` + new URLSearchParams(searchParams).toString();
};