/**
 * AISearchService
 * 自然言語検索とOpenAI API連携
 * Requirements: 11.7, 11.8
 */

import { OpenAIClient } from '@/lib/clients/openai-client';
import type { SearchResult } from '@/lib/types/search';
import type { Result } from '@/lib/types/result';

interface SearchIntent {
  keywords: string[];
  category?: string;
  minRating?: number;
  dateRange?: 'recent' | 'last_week' | 'last_month' | 'last_year';
}

export class AISearchService {
  private openaiClient: OpenAIClient;

  constructor() {
    this.openaiClient = new OpenAIClient();
  }

  /**
   * 自然言語クエリでAIツールを検索する
   * OpenAI APIで意図抽出 → 構造化検索 → 関連度順ソート
   */
  async naturalLanguageSearch(
    query: string,
    tools: SearchResult[]
  ): Promise<Result<Array<SearchResult & { relevanceScore: number }>, Error>> {
    try {
      // バリデーション
      if (!query || query.trim().length === 0) {
        return {
          success: false,
          error: new Error('検索クエリを入力してください'),
        };
      }

      let intent: SearchIntent;

      try {
        // OpenAI APIで検索意図を抽出
        intent = await this.extractIntentWithOpenAI(query);
      } catch (error) {
        console.warn('OpenAI API failed, falling back to simple search:', error);
        // フォールバック: キーワード抽出のみ
        intent = this.extractIntentFallback(query);
      }

      // 各ツールの関連度スコアを計算
      const resultsWithScore = tools.map(tool => ({
        ...tool,
        relevanceScore: this.calculateRelevanceScore(tool, intent),
      }));

      // スコア0のツールを除外し、関連度順にソート
      const filteredResults = resultsWithScore
        .filter(r => r.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      return { success: true, data: filteredResults };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * OpenAI APIで検索意図を抽出する
   */
  private async extractIntentWithOpenAI(query: string): Promise<SearchIntent> {
    const systemPrompt = `あなたはAIツール検索アシスタントです。ユーザーの自然言語クエリを分析し、以下のJSON形式で検索意図を返してください：

{
  "keywords": ["キーワード1", "キーワード2"],
  "category": "text" | "image" | "video" | "audio" | "code" | "other" | null,
  "minRating": 1-5 の数値 | null,
  "dateRange": "recent" | "last_week" | "last_month" | "last_year" | null
}

カテゴリー説明：
- text: テキスト生成、対話、執筆支援
- image: 画像生成、画像編集
- video: 動画生成、動画編集
- audio: 音声生成、音声認識
- code: コード生成、プログラミング支援
- other: その他

日付範囲：
- "最近", "直近": recent
- "先週", "1週間前": last_week
- "先月", "1ヶ月前": last_month
- "去年", "昨年", "1年前": last_year`;

    const response = await this.openaiClient.chat({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response is empty');
    }

    const intent = JSON.parse(content) as SearchIntent;
    return intent;
  }

  /**
   * フォールバック: 簡易的なキーワード抽出
   */
  private extractIntentFallback(query: string): SearchIntent {
    // 簡易的に空白で分割してキーワード化
    const keywords = query
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

    return { keywords };
  }

  /**
   * ツールと検索意図の関連度スコアを計算（0-100）
   */
  private calculateRelevanceScore(tool: SearchResult, intent: SearchIntent): number {
    let score = 0;

    // キーワードマッチング（最大60点）
    if (intent.keywords && intent.keywords.length > 0) {
      const toolText = `${tool.tool_name} ${tool.description || ''}`.toLowerCase();

      intent.keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();

        // 完全一致（ツール名）: 20点
        if (tool.tool_name.toLowerCase() === lowerKeyword) {
          score += 20;
        }
        // 部分一致（ツール名）: 15点
        else if (tool.tool_name.toLowerCase().includes(lowerKeyword)) {
          score += 15;
        }
        // 部分一致（説明文）: 10点
        else if (toolText.includes(lowerKeyword)) {
          score += 10;
        }
      });

      // キーワードマッチスコアの上限を60に設定
      score = Math.min(score, 60);
    }

    // カテゴリーマッチング（20点）
    if (intent.category && tool.category === intent.category) {
      score += 20;
    }

    // 評価マッチング（10点）
    if (intent.minRating && tool.rating >= intent.minRating) {
      score += 10;
    }

    // 日付範囲マッチング（10点）
    if (intent.dateRange) {
      const now = new Date();
      const usageDate = new Date(tool.usage_date);
      const daysDiff = (now.getTime() - usageDate.getTime()) / (1000 * 60 * 60 * 24);

      let isMatch = false;
      switch (intent.dateRange) {
        case 'recent':
          isMatch = daysDiff <= 7;
          break;
        case 'last_week':
          isMatch = daysDiff <= 7;
          break;
        case 'last_month':
          isMatch = daysDiff <= 30;
          break;
        case 'last_year':
          isMatch = daysDiff <= 365;
          break;
      }

      if (isMatch) {
        score += 10;
      }
    }

    // スコアを0-100の範囲に正規化
    return Math.min(Math.max(score, 0), 100);
  }
}
