/**
 * 保存済み検索Server Actions
 * Requirements: 11.3, 11.4
 */

'use server';

import { auth } from '@/auth';
import { SavedSearchRepository } from '@/lib/repositories/saved-search-repository';
import type { Result } from '@/lib/types/result';
import type { SavedSearch, CreateSavedSearchData } from '@/lib/types/saved-search';
import type { AdvancedSearchConditions } from '@/lib/types/search';

const savedSearchRepository = new SavedSearchRepository();

/**
 * 保存済み検索を作成する
 */
export async function createSavedSearchAction(
  name: string,
  conditions: AdvancedSearchConditions
): Promise<Result<SavedSearch, Error>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: new Error('認証が必要です'),
    };
  }

  const data: CreateSavedSearchData = {
    user_id: session.user.id,
    name,
    conditions,
  };

  return await savedSearchRepository.create(data);
}

/**
 * 保存済み検索を全て取得する
 */
export async function getSavedSearchesAction(): Promise<
  Result<SavedSearch[], Error>
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: new Error('認証が必要です'),
    };
  }

  return await savedSearchRepository.findAllByUserId(session.user.id);
}

/**
 * 保存済み検索をIDで取得する
 */
export async function getSavedSearchByIdAction(
  id: string
): Promise<Result<SavedSearch | null, Error>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: new Error('認証が必要です'),
    };
  }

  return await savedSearchRepository.findById(id);
}

/**
 * 保存済み検索を削除する
 */
export async function deleteSavedSearchAction(
  id: string
): Promise<Result<void, Error>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: new Error('認証が必要です'),
    };
  }

  return await savedSearchRepository.delete(id);
}

/**
 * 保存済み検索を更新する
 */
export async function updateSavedSearchAction(
  id: string,
  name: string,
  conditions: AdvancedSearchConditions
): Promise<Result<SavedSearch, Error>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: new Error('認証が必要です'),
    };
  }

  return await savedSearchRepository.update(id, { name, conditions });
}
