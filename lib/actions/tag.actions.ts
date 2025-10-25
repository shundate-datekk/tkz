/**
 * タグServer Actions
 * Requirements: 11.5, 11.6
 */

'use server';

import { TagRepository } from '@/lib/repositories/tag-repository';
import type { Result } from '@/lib/types/result';
import type { Tag, TagWithCount } from '@/lib/types/tag';

const tagRepository = new TagRepository();

/**
 * タグを作成する（既存の場合は既存タグを返す）
 */
export async function createTagAction(name: string): Promise<Result<Tag, Error>> {
  return await tagRepository.create(name);
}

/**
 * タグ名でタグを検索する
 */
export async function findTagByNameAction(
  name: string
): Promise<Result<Tag | null, Error>> {
  return await tagRepository.findByName(name);
}

/**
 * ツールIDに紐付いた全タグを取得する
 */
export async function getTagsByToolIdAction(
  toolId: string
): Promise<Result<Tag[], Error>> {
  return await tagRepository.findAllByToolId(toolId);
}

/**
 * 全タグと使用回数を取得する
 */
export async function getAllTagsWithCountAction(): Promise<
  Result<TagWithCount[], Error>
> {
  return await tagRepository.findAllWithUsageCount();
}

/**
 * ツールにタグを紐付ける
 */
export async function attachTagsToToolAction(
  toolId: string,
  tagNames: string[]
): Promise<Result<void, Error>> {
  try {
    // タグ名からタグIDを取得または作成
    const tagIds: string[] = [];

    for (const name of tagNames) {
      const result = await tagRepository.create(name);
      if (!result.success) {
        return result;
      }
      tagIds.push(result.data.id);
    }

    // ツールにタグを紐付け
    return await tagRepository.attachToTool(toolId, tagIds);
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * ツールからタグを削除する
 */
export async function detachTagsFromToolAction(
  toolId: string,
  tagIds: string[]
): Promise<Result<void, Error>> {
  return await tagRepository.detachFromTool(toolId, tagIds);
}

/**
 * ツールのタグを全て置き換える
 */
export async function replaceToolTagsAction(
  toolId: string,
  tagNames: string[]
): Promise<Result<void, Error>> {
  try {
    // 既存のタグを取得
    const existingResult = await tagRepository.findAllByToolId(toolId);
    if (!existingResult.success) {
      return existingResult;
    }

    const existingTagIds = existingResult.data.map((tag: Tag) => tag.id);

    // 新しいタグIDを取得または作成
    const newTagIds: string[] = [];
    for (const name of tagNames) {
      const result = await tagRepository.create(name);
      if (!result.success) {
        return result;
      }
      newTagIds.push(result.data.id);
    }

    // 削除するタグID（既存 - 新規）
    const toDetach = existingTagIds.filter((id: string) => !newTagIds.includes(id));

    // 追加するタグID（新規 - 既存）
    const toAttach = newTagIds.filter((id: string) => !existingTagIds.includes(id));

    // 削除
    if (toDetach.length > 0) {
      const detachResult = await tagRepository.detachFromTool(toolId, toDetach);
      if (!detachResult.success) {
        return detachResult;
      }
    }

    // 追加
    if (toAttach.length > 0) {
      const attachResult = await tagRepository.attachToTool(toolId, toAttach);
      if (!attachResult.success) {
        return attachResult;
      }
    }

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * 複数のツールのタグを一度に取得する
 */
export async function getTagsByToolIdsAction(
  toolIds: string[]
): Promise<Result<Map<string, string[]>, Error>> {
  try {
    // 各ツールのタグを並列で取得
    const results = await Promise.all(
      toolIds.map(async (toolId) => {
        const result = await tagRepository.findAllByToolId(toolId);
        if (!result.success) {
          return { toolId, tags: [] as string[] };
        }
        return { toolId, tags: result.data.map((tag: Tag) => tag.name) };
      })
    );

    // Map形式に変換
    const tagMap = new Map<string, string[]>();
    results.forEach(({ toolId, tags }) => {
      tagMap.set(toolId, tags);
    });

    return {
      success: true,
      data: tagMap,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('タグの取得に失敗しました'),
    };
  }
}
