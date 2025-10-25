/**
 * Sora2プロンプトテンプレート定義
 * Requirements: 13.1
 */

import type { GeneratePromptInput } from "@/lib/schemas/prompt.schema";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  defaultValues: Partial<GeneratePromptInput>;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "cinematic",
    name: "シネマティック",
    description: "映画のような高品質な映像スタイル",
    defaultValues: {
      style: "シネマティック",
      sceneDescription: "ドラマチックなライティングで撮影された、映画のようなシーン。被写界深度が浅く、背景がボケている。カメラは滑らかにトラッキング。",
      additionalRequirements: "プロフェッショナルなグレーディング、豊かな色彩、高コントラスト。映画的な雰囲気を重視。",
    },
  },
  {
    id: "documentary",
    name: "ドキュメンタリー",
    description: "リアルで臨場感のあるドキュメンタリー風",
    defaultValues: {
      style: "ドキュメンタリー",
      sceneDescription: "自然光を活かした、リアルで臨場感のあるシーン。カメラは手持ちで、自然な動きを捉える。",
      additionalRequirements: "ナチュラルな色調、リアルな質感を重視。過度な演出は避け、自然な雰囲気で。",
    },
  },
  {
    id: "animation",
    name: "アニメーション",
    description: "アニメ風の表現豊かな映像",
    defaultValues: {
      style: "アニメーション",
      sceneDescription: "鮮やかな色彩と誇張された表現のアニメ風シーン。キャラクターは表情豊かで、動きはダイナミック。",
      additionalRequirements: "ポップで明るい色使い、デフォルメされた表現。アニメーション特有の動きとタイミングを重視。",
    },
  },
  {
    id: "commercial",
    name: "CM・広告",
    description: "商品やサービスのプロモーション向け",
    defaultValues: {
      style: "コマーシャル",
      sceneDescription: "商品やサービスを魅力的に見せる、洗練されたシーン。ライティングは完璧で、構図は計算されている。",
      additionalRequirements: "高級感のある質感、プロフェッショナルな仕上がり。商品の魅力を最大限に引き出す演出。",
    },
  },
  {
    id: "music-video",
    name: "ミュージックビデオ",
    description: "音楽に合わせたリズミカルな映像",
    defaultValues: {
      style: "ミュージックビデオ",
      sceneDescription: "音楽のリズムに合わせた、ダイナミックで印象的なシーン。照明効果が際立ち、カメラワークは大胆。",
      additionalRequirements: "音楽に合わせたリズミカルな編集、クリエイティブなカメラアングル、インパクトのある照明効果。",
    },
  },
  {
    id: "vlog",
    name: "Vlog・日常",
    description: "カジュアルで親しみやすい日常の風景",
    defaultValues: {
      style: "カジュアル",
      sceneDescription: "日常の一コマを切り取った、親しみやすいシーン。自然な照明で、リラックスした雰囲気。",
      additionalRequirements: "カジュアルで親しみやすい雰囲気、自然な色調。視聴者に身近に感じられる演出。",
    },
  },
  {
    id: "slow-motion",
    name: "スローモーション",
    description: "美しく幻想的なスローモーション映像",
    defaultValues: {
      style: "シネマティック",
      duration: "5秒",
      sceneDescription: "美しく幻想的なスローモーションのシーン。水滴が落ちる瞬間、髪がなびく動き、物体が破壊される瞬間など、時間を引き伸ばした表現。",
      additionalRequirements: "滑らかで美しいスローモーション、細部まで鮮明に。ドラマチックな雰囲気を演出。",
    },
  },
  {
    id: "timelapse",
    name: "タイムラプス",
    description: "時間経過を早回しで表現",
    defaultValues: {
      style: "タイムラプス",
      sceneDescription: "時間の経過を早回しで表現したシーン。雲が流れる空、日の出から日没まで、都市の一日など。カメラは固定またはゆっくりとした動き。",
      additionalRequirements: "滑らかなタイムラプス効果、時間の経過を美しく表現。安定した映像品質を維持。",
    },
  },
  {
    id: "aerial",
    name: "空撮・ドローン",
    description: "上空からの壮大な映像",
    defaultValues: {
      style: "ドキュメンタリー",
      sceneDescription: "ドローンによる上空からの壮大なシーン。広大な風景、都市の全景、自然の美しさを鳥瞰で捉える。カメラは滑らかに旋回または前進。",
      additionalRequirements: "スケール感を強調、壮大で開放的な雰囲気。安定したカメラワークで、滑らかな動き。",
    },
  },
  {
    id: "noir",
    name: "フィルムノワール",
    description: "暗くムーディーなノワール風",
    defaultValues: {
      style: "フィルムノワール",
      sceneDescription: "暗く、影が強調されたノワール風のシーン。コントラストが強く、モノクロームまたは色彩が抑えられた映像。ミステリアスで緊張感のある雰囲気。",
      additionalRequirements: "高コントラスト、影を効果的に使用、ムーディーな雰囲気。クラシックなフィルムノワールの美学を反映。",
    },
  },
];

/**
 * テンプレートIDからテンプレートを取得する
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((template) => template.id === id);
}

/**
 * テンプレートの選択肢を取得する（Selectコンポーネント用）
 */
export function getTemplateOptions() {
  return PROMPT_TEMPLATES.map((template) => ({
    value: template.id,
    label: template.name,
    description: template.description,
  }));
}
