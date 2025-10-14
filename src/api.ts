import { collectionTypeMap, subjectTypeMap, type CollectionResponse, type Params, type Subject } from './types'

export async function getSubjects(
  parms: Params,
  limit: number,
  offset: number,
): Promise<{ subjects: Subject[], limit: number, offset: number, total: number }> {

  const url = getApiUrl(parms, limit, offset)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Bangumi API 请求失败 (${response.status}): ${response.statusText}`)
      console.error('请求URL:', url)
      return { subjects: [], limit: 0, offset: 0, total: 0 }
    }

    const data: CollectionResponse = await response.json()
    const subject = data.data
      .map(item => item.subject)

    return { subjects: [...new Set(subject)], limit: data.limit, offset: data.offset, total: data.total }
  } catch (error) {
    console.error('获取 Bangumi 收藏失败:', error)
    return { subjects: [], limit: 0, offset: 0, total: 0 }
  }
}

const getApiUrl = (params: Params, limit: number, offset: number): string => {
  const { username, subjectType, collectionType } = params

  const searchParams: Record<string, string> = {
    limit: limit.toString(),
    offset: offset.toString(),
  }

  if (subjectType && subjectTypeMap[subjectType]) {
    if (subjectType !== 'all') {
      searchParams.subject_type = subjectTypeMap[subjectType]
    }
  }

  if (collectionType && collectionTypeMap[collectionType]) {
    if (collectionType !== 'all') {
      searchParams.type = collectionTypeMap[collectionType]
    }
  }

  return `https://api.bgm.tv/v0/users/${username}/collections?` + new URLSearchParams(searchParams).toString()
}