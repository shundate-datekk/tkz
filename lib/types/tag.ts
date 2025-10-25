/**
 * Tag型定義
 */

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface TagWithCount extends Tag {
  usage_count: number; // 何個のツールに紐付いているか
}

export interface CreateTagData {
  name: string;
}

export interface ToolTag {
  tool_id: string;
  tag_id: string;
  created_at: string;
}
