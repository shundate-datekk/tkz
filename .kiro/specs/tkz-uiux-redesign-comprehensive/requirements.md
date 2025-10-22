# Requirements Document

## Introduction

TKZ UIUX大規模リデザインプロジェクトは、AIツール情報共有＆Sora2プロンプト生成アプリの全面的な改善を目的としています。現在報告されている緊急の問題から、長期的なユーザー体験向上まで、デザインコンセプトから実装まで包括的に刷新します。

本プロジェクトは3つの柱で構成されます：
- **Pillar ①**: 基本機能のエラー修正と堅牢性向上
- **Pillar ②**: UIUX大幅改善：新デザインコンセプト「クリーン＆ワクワク」
- **Pillar ③**: セキュリティ＆便利機能の追加（ユーザーファースト設計）

本要件ドキュメントでは、TKZとコボちゃんが毎日使いたくなる、美しく便利で信頼できるアプリを実現するための具体的な要件を定義します。

## Requirements

### Requirement 1: フォームエクスペリエンスの向上
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want フォーム入力時に明確なフィードバックと誘導を受ける, so that エラーなくスムーズにデータを登録・編集できる

#### Acceptance Criteria

1. WHEN ユーザーがフォームフィールドに無効な値を入力した THEN AIツール共有システム SHALL 該当フィールドの下に具体的なエラーメッセージを即座に表示する
2. WHEN ユーザーがフォーム全体を送信した AND バリデーションエラーが存在する THEN AIツール共有システム SHALL すべてのエラーをフィールドレベルと全体サマリーの両方で表示する
3. WHEN ユーザーがフォーム送信ボタンをクリックした THEN AIツール共有システム SHALL ローディングスピナーとともにボタンを無効化し、二重送信を防止する
4. WHEN フォーム送信が成功した THEN AIツール共有システム SHALL 成功メッセージとチェックマークアニメーションを表示し、3秒後に自動的にリスト画面に遷移する
5. WHEN フォーム送信が失敗した THEN AIツール共有システム SHALL 具体的なエラーメッセージを目立つ形で表示し、入力内容を保持する
6. WHILE ユーザーがフォームに入力している THE AIツール共有システム SHALL 入力内容をローカルストレージに自動保存し、ブラウザクラッシュ時にも復元可能にする
7. WHEN ユーザーがTextareaに入力している THEN AIツール共有システム SHALL リアルタイムで文字数カウンターを表示し、上限に近づいたら警告色で表示する

### Requirement 2: 認証フローの信頼性と利便性向上
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want 認証が常に安定して動作し、ログイン状態が適切に管理される, so that 認証エラーでストレスを感じることなくアプリを使用できる

#### Acceptance Criteria

1. WHEN Google OAuthログインが失敗した THEN AIツール共有システム SHALL 失敗理由を分かりやすい日本語メッセージで表示する（例：「Googleアカウントへのアクセスが拒否されました」）
2. WHEN セッションが期限切れになった THEN AIツール共有システム SHALL ユーザーに通知し、現在のページURLを保持したままログインページにリダイレクトする
3. WHEN ユーザーがログインに成功した AND リダイレクト先URLが保存されている THEN AIツール共有システム SHALL ユーザーを元のページに自動的に戻す
4. WHERE ログインページ THE AIツール共有システム SHALL 「ログイン状態を保持」チェックボックスを提供し、チェック時は30日間セッションを維持する
5. WHEN ユーザーがログアウトボタンをクリックした THEN AIツール共有システム SHALL 「本当にログアウトしますか？」確認ダイアログを表示する
6. WHEN 認証エラーが発生した AND user.idが取得できない THEN AIツール共有システム SHALL 「ユーザーIDが取得できませんでした。再度ログインしてください。」とエラーログを出力する

### Requirement 3: データ操作の安全性と柔軟性向上
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want データの削除・編集操作が安全で、必要に応じて取り消せる, so that 誤操作による大切なデータの喪失を防げる

#### Acceptance Criteria

1. WHEN ユーザーがAIツールの削除ボタンをクリックした THEN AIツール共有システム SHALL 削除対象のツール名とカテゴリーを含むプレビューを表示した確認ダイアログを表示する
2. WHEN ユーザーが削除を確定した THEN AIツール共有システム SHALL データを論理削除し、30日間は復元可能な状態で保持する
3. WHEN ユーザーがフォームで編集中に他のページに移動しようとした AND 未保存の変更がある THEN AIツール共有システム SHALL 「変更が保存されていません。このページを離れますか？」警告を表示する
4. WHERE AIツール一覧画面 THE AIツール共有システム SHALL 複数選択チェックボックスと一括削除ボタンを提供する
5. WHEN ユーザーが一括削除を実行した THEN AIツール共有システム SHALL 選択された件数を表示し、確認後にすべて論理削除する
6. WHEN データ削除・編集操作が完了した THEN AIツール共有システム SHALL 「元に戻す」ボタンを10秒間表示し、クリック時は操作を取り消す

### Requirement 4: デザインシステムの確立
**Objective:** As a 開発者, I want 統一されたデザインシステムとトークン体系を持つ, so that 一貫性のある美しいUIを効率的に構築できる

#### Acceptance Criteria

1. WHERE 全アプリケーション THE AIツール共有システム SHALL プライマリーカラーに青系グラデーション（信頼感＋未来感）を使用する
2. WHERE 全アプリケーション THE AIツール共有システム SHALL セカンダリーカラーに紫系（創造性）、アクセントカラーにオレンジ/黄色（ワクワク感）を使用する
3. WHERE 全アプリケーション THE AIツール共有システム SHALL 成功：グリーン、警告：イエロー、エラー：レッドの明確な色分けを使用する
4. WHERE 全アプリケーション THE AIツール共有システム SHALL 見出しは大きく太く階層を明確にし、本文は16px以上で読みやすさを重視する
5. WHERE 全アプリケーション THE AIツール共有システム SHALL 4pxグリッドシステムに基づくスペーシングを使用し、十分な余白で呼吸する空間を確保する
6. WHERE 全アプリケーション THE AIツール共有システム SHALL カラーパレット、タイポグラフィ、スペーシングをCSS変数またはTailwind設定で一元管理する

### Requirement 5: コンポーネントの視認性と操作性向上
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want すべてのUIコンポーネントが見やすく、直感的に操作できる, so that ストレスなく機能を利用できる

#### Acceptance Criteria

1. WHERE ボタンコンポーネント THE AIツール共有システム SHALL プライマリーボタンにグラデーション＋シャドウ、セカンダリーボタンにアウトライン＋ホバー時塗りつぶしを適用する
2. WHERE ボタンコンポーネント THE AIツール共有システム SHALL S/M/Lサイズを提供し、タッチターゲットを最小44pxに保つ
3. WHERE ボタンコンポーネント THE AIツール共有システム SHALL アイコンとテキストを併用し、視覚的に意味を明確化する
4. WHERE カードコンポーネント THE AIツール共有システム SHALL 統一された12px角丸を適用する
5. WHEN ユーザーがカードにホバーした THEN AIツール共有システム SHALL transform + shadowを使用した浮き上がりアニメーションを表示する
6. WHERE Selectコンポーネント THE AIツール共有システム SHALL 背景白（bg-white）、2pxボーダー、明確なフォーカスリング（青色）を持つ
7. WHERE Inputコンポーネント THE AIツール共有システム SHALL ラベルを常時表示し、プレースホルダーは薄いグレーで表示する
8. WHERE Textareaコンポーネント THE AIツール共有システム SHALL リサイズ可能で、文字数カウンターを右下に表示する
9. WHERE 日付入力 THE AIツール共有システム SHALL カレンダーUIで直感的に選択できるDatePickerを提供する

### Requirement 6: レスポンシブデザイン完全対応
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want どのデバイスでも快適にアプリを使用できる, so that 場所やデバイスを選ばずにAIツール情報にアクセスできる

#### Acceptance Criteria

1. WHERE モバイル（320px〜767px） THE AIツール共有システム SHALL 1カラムレイアウトで表示し、タッチフレンドリーなボタンサイズ（最小44px）を保つ
2. WHERE モバイル THE AIツール共有システム SHALL スワイプジェスチャーでカード削除、メニュー表示などの操作をサポートする
3. WHERE モバイル THE AIツール共有システム SHALL ボトムシートUIでモーダルやメニューを表示する
4. WHERE モバイル THE AIツール共有システム SHALL ボトムナビゲーションバーで主要4機能（ホーム、ツール一覧、プロンプト生成、設定）にアクセスできる
5. WHERE タブレット（768px〜1023px） THE AIツール共有システム SHALL 2カラムレイアウト（サイドパネル＋メインコンテンツ）で表示する
6. WHERE タブレット THE AIツール共有システム SHALL タッチ操作とキーボード操作の両方に対応する
7. WHERE デスクトップ（1024px〜） THE AIツール共有システム SHALL 3カラムレイアウト（サイドバー＋メイン＋詳細パネル）で表示する
8. WHERE デスクトップ THE AIツール共有システム SHALL キーボードショートカット（例：Ctrl+K for検索）を提供する
9. WHERE デスクトップ THE AIツール共有システム SHALL マウスホバー時のツールチップや視覚効果を提供する

### Requirement 7: ナビゲーションの明確性とアクセス性向上
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want 現在位置を常に把握でき、目的の機能に素早くアクセスできる, so that 迷うことなく効率的にアプリを使用できる

#### Acceptance Criteria

1. WHERE デスクトップ THE AIツール共有システム SHALL サイドバー固定ナビゲーションでアイコン＋ラベルを表示する
2. WHERE モバイル THE AIツール共有システム SHALL ボトムナビゲーションで主要4機能にアクセスできる
3. WHERE 全ページ THE AIツール共有システム SHALL ブレッドクラムで現在位置を表示する（例：ホーム > AIツール > 編集）
4. WHERE ヘッダー THE AIツール共有システム SHALL グローバル検索バー（Ctrl+Kで起動）を提供する
5. WHEN ユーザーがグローバル検索を使用した THEN AIツール共有システム SHALL AIツール、プロンプト、カテゴリーを横断的に検索する

### Requirement 8: マイクロインタラクションによる楽しさ向上
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want 操作に対する視覚的なフィードバックが楽しい, so that アプリを使うことにワクワク感を感じる

#### Acceptance Criteria

1. WHEN ページが読み込み中 THEN AIツール共有システム SHALL スケルトンスクリーンでコンテンツの形状を予告する
2. WHEN ユーザーがボタンをクリックした THEN AIツール共有システム SHALL リップル効果アニメーションを表示する
3. WHEN ページ遷移が発生した THEN AIツール共有システム SHALL スムーズなフェードイン/アウトトランジション（300ms）を表示する
4. WHEN 新しいAIツールが追加された THEN AIツール共有システム SHALL リストに「飛び込む」アニメーション（scale + fade）で表示する
5. WHEN 操作が成功した THEN AIツール共有システム SHALL チェックマークアニメーション（描画エフェクト）を表示する
6. WHERE 全インタラクション THE AIツール共有システム SHALL 60fps以上のスムーズなアニメーションを保つ

### Requirement 9: ダークモード対応
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want 目に優しいダークモードを使用できる, so that 夜間や暗い環境でも快適にアプリを使用できる

#### Acceptance Criteria

1. WHERE 全アプリケーション THE AIツール共有システム SHALL システム設定（prefers-color-scheme）と連動してダークモードを自動適用する
2. WHERE 設定画面 THE AIツール共有システム SHALL ライト/ダーク/システム連動の3択トグルを提供する
3. WHEN ユーザーがダークモード切り替えを実行した THEN AIツール共有システム SHALL スムーズなトランジション（500ms）でカラー変更する
4. WHERE ダークモード THE AIツール共有システム SHALL WCAG AA準拠のコントラスト比（最低4.5:1）を保つ
5. WHERE ダークモード THE AIツール共有システム SHALL 背景にダークグレー（#1a1a1a）、テキストに明るいグレー（#e0e0e0）を使用する

### Requirement 10: データ管理機能の追加
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want 登録したAIツール情報をエクスポート・インポート・バックアップできる, so that データを自由に管理し、他ツールとの連携や移行が可能になる

#### Acceptance Criteria

1. WHERE 設定画面 THE AIツール共有システム SHALL 「エクスポート」ボタンでJSON/CSV形式のダウンロード選択肢を提供する
2. WHEN ユーザーがエクスポートを実行した THEN AIツール共有システム SHALL 全AIツールデータをタイムスタンプ付きファイル名（例：tkz-tools-20251022.json）でダウンロードする
3. WHERE 設定画面 THE AIツール共有システム SHALL 「インポート」ボタンでJSON/CSVファイルのアップロードを受け付ける
4. WHEN ユーザーがインポートを実行した AND フォーマットが正しい THEN AIツール共有システム SHALL データをプレビュー表示し、確認後に一括登録する
5. WHEN ユーザーがインポートを実行した AND フォーマットが不正 THEN AIツール共有システム SHALL 具体的なエラー箇所を示すメッセージを表示する
6. WHERE 設定画面 THE AIツール共有システム SHALL 自動バックアップ機能（毎週日曜日深夜実行）のON/OFF設定を提供する
7. WHEN 自動バックアップが実行された THEN AIツール共有システム SHALL バックアップをローカルストレージとクラウド（Supabase Storage）の両方に保存する
8. WHERE 設定画面 THE AIツール共有システム SHALL バックアップ履歴リストと「復元」ボタンを提供する

### Requirement 11: 検索・フィルタリング強化
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want 高度な検索機能で目的のAIツールを素早く見つけられる, so that 大量のツールの中から必要な情報に即座にアクセスできる

#### Acceptance Criteria

1. WHERE AIツール一覧画面 THE AIツール共有システム SHALL 高度な検索パネル（AND/OR条件、日付範囲、評価範囲）を提供する
2. WHEN ユーザーが検索条件を組み合わせた THEN AIツール共有システム SHALL リアルタイムで結果を絞り込み、ヒット件数を表示する
3. WHERE 高度な検索パネル THE AIツール共有システム SHALL 「この条件を保存」ボタンを提供する
4. WHEN ユーザーが検索条件を保存した THEN AIツール共有システム SHALL 名前を付けて保存し、サイドバーに「保存済み検索」セクションに追加する
5. WHERE AIツール編集画面 THE AIツール共有システム SHALL 自由なタグ付け機能（カンマ区切り入力、オートコンプリート）を提供する
6. WHERE AIツール一覧画面 THE AIツール共有システム SHALL タグでのフィルタリング（複数タグ選択可能）を提供する
7. WHERE グローバル検索 THE AIツール共有システム SHALL 自然言語検索（例：「去年使った画像生成ツール」）に対応する（AI検索機能）
8. WHEN ユーザーがAI検索を使用した THEN AIツール共有システム SHALL 意図を解析し、関連度順に結果を表示する

### Requirement 12: コラボレーション機能の追加
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want お互いの活動を把握し、おすすめツールを共有できる, so that 2人で効率的に情報を交換し、良いツールを発見できる

#### Acceptance Criteria

1. WHERE AIツール詳細画面 THE AIツール共有システム SHALL コメント投稿フォームとコメント一覧を表示する
2. WHEN ユーザーがコメントを投稿した THEN AIツール共有システム SHALL 投稿者名、タイムスタンプ、コメント内容を保存し、即座に一覧に表示する
3. WHERE AIツールカード THE AIツール共有システム SHALL 「いいね」ボタン（ハートアイコン）といいね数を表示する
4. WHEN ユーザーが「いいね」をクリックした THEN AIツール共有システム SHALL アニメーションとともにいいね数を増減し、相手に通知する
5. WHERE ホーム画面 THE AIツール共有システム SHALL 「活動フィード」セクションで最近の登録・編集・いいね・コメントを時系列表示する
6. WHERE ヘッダー THE AIツール共有システム SHALL 通知アイコン（ベルマーク）と未読件数バッジを表示する
7. WHEN 相手が新しいツールを登録した OR コメントが投稿された THEN AIツール共有システム SHALL リアルタイムで通知を送信し、未読バッジを更新する
8. WHERE 通知パネル THE AIツール共有システム SHALL 通知一覧、既読/未読管理、通知設定（ON/OFF）を提供する

### Requirement 13: プロンプト生成強化
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want 効率的にSora2プロンプトを生成・管理できる, so that 高品質なプロンプトを素早く作成し再利用できる

#### Acceptance Criteria

1. WHERE プロンプト生成画面 THE AIツール共有システム SHALL テンプレート選択ドロップダウン（シネマティック、ドキュメンタリー、アニメーションなど）を提供する
2. WHEN ユーザーがテンプレートを選択した THEN AIツール共有システム SHALL 該当テンプレートのプロンプトパターンをフォームに自動入力する
3. WHERE プロンプト生成画面 THE AIツール共有システム SHALL 「バリエーション生成」ボタンを提供する
4. WHEN ユーザーがバリエーション生成をクリックした THEN AIツール共有システム SHALL 1つの入力から3〜5パターンの異なるプロンプトを自動生成する
5. WHERE プロンプト生成画面 THE AIツール共有システム SHALL 「AI改善提案」ボタンを提供する
6. WHEN ユーザーがAI改善提案をクリックした THEN AIツール共有システム SHALL 現在のプロンプトを分析し、改善案を具体的に提示する
7. WHERE プロンプト詳細画面 THE AIツール共有システム SHALL 「お気に入り」スターアイコンを提供する
8. WHEN ユーザーがお気に入りに追加した THEN AIツール共有システム SHALL マイページの「お気に入りプロンプト」セクションに追加する

### Requirement 14: パフォーマンス最適化
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want ページが高速に読み込まれ、スムーズに操作できる, so that ストレスなくアプリを使用できる

#### Acceptance Criteria

1. WHERE 画像表示 THE AIツール共有システム SHALL Intersection Observerで遅延読み込み（lazy loading）を実装する
2. WHERE AIツール一覧画面 THE AIツール共有システム SHALL 100件以上のデータ表示時にバーチャルスクロールを使用する
3. WHERE データ取得 THE AIツール共有システム SHALL SWRでキャッシング戦略を実装し、再フェッチを最小化する
4. WHERE 全ページ THE AIツール共有システム SHALL 初回ペイントを1.5秒以内、完全読み込みを3秒以内に完了する
5. WHERE 全ページ THE AIツール共有システム SHALL Lighthouse Performanceスコア95以上を維持する
6. WHERE 全アプリケーション THE AIツール共有システム SHALL Service Workerでオフラインキャッシュを提供し、基本機能（閲覧）をオフラインで使用可能にする（PWA対応）
7. WHERE 画像アップロード THE AIツール共有システム SHALL 画像を自動リサイズ（最大1200px幅）し、WebP形式に変換する

### Requirement 15: アクセシビリティ完全対応
**Objective:** As a すべてのユーザー, I want 障害の有無に関わらずアプリを使用できる, so that 誰もが平等にAIツール情報にアクセスできる

#### Acceptance Criteria

1. WHERE 全インタラクティブ要素 THE AIツール共有システム SHALL キーボードのみですべての操作を可能にする（Tab、Enter、Space、Escapeキー対応）
2. WHERE 全フォーム要素 THE AIツール共有システム SHALL 適切なARIA属性（aria-label、aria-describedby、aria-invalid）を設定する
3. WHERE モーダル・ダイアログ THE AIツール共有システム SHALL 開いた時にフォーカスをトラップし、Escapeキーで閉じられる
4. WHEN 要素がフォーカスされた THEN AIツール共有システム SHALL 視覚的に明確なフォーカスリング（2px青色アウトライン）を表示する
5. WHERE 色で情報伝達する箇所 THE AIツール共有システム SHALL アイコンやテキストも併用し、色だけに依存しない
6. WHERE 全テキスト THE AIツール共有システム SHALL 200%拡大時でもレイアウトが崩れず、すべて読めるようにする
7. WHERE 全ページ THE AIツール共有システム SHALL Lighthouse Accessibilityスコア100を維持する
8. WHERE 画像 THE AIツール共有システム SHALL 意味のある代替テキスト（alt属性）を設定する

### Requirement 16: セキュリティ強化
**Objective:** As a ユーザー（TKZ/コボちゃん）, I want アカウントとデータが強固に保護される, so that 安心してアプリを使用できる

#### Acceptance Criteria

1. WHERE ログイン画面 THE AIツール共有システム SHALL 2要素認証（2FA）オプションをGoogle Authenticatorで提供する
2. WHEN ユーザーが2FAを有効化した THEN AIツール共有システム SHALL QRコード表示、バックアップコード生成、確認プロセスを案内する
3. WHERE 設定画面 THE AIツール共有システム SHALL アクティブセッション一覧（デバイス名、IPアドレス、最終アクセス時刻）を表示する
4. WHERE アクティブセッション一覧 THE AIツール共有システム SHALL 各セッションの「ログアウト」ボタンでリモートログアウトを可能にする
5. WHEN 重要操作（削除、設定変更）が実行された THEN AIツール共有システム SHALL 監査ログに記録する（操作種別、日時、IPアドレス、ユーザーエージェント）
6. WHERE 設定画面 THE AIツール共有システム SHALL 監査ログ閲覧機能（最新50件、検索・フィルタリング）を提供する
7. WHERE データベース THE AIツール共有システム SHALL 個人情報（メール、名前）を暗号化して保存する
8. WHERE 全ページ THE AIツール共有システム SHALL Content Security Policy（CSP）ヘッダーで外部スクリプト実行を厳格に制限する

## Success Metrics

本プロジェクトの成功は以下の指標で測定します：

1. **パフォーマンス**: ページロード時間 < 1.5秒、Lighthouse Performance 95+
2. **アクセシビリティ**: Lighthouse Accessibility Score 100
3. **ユーザー満足度**: TKZとコボちゃんが「ワクワクする」と感じる主観評価
4. **エラー発生率**: アプリケーションエラー < 0.1%
5. **レスポンシブ対応**: モバイル（320px）〜デスクトップ（1920px+）で全機能が正常動作
6. **コードカバレッジ**: テストカバレッジ 80%以上

## Technical Constraints

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Framer Motion（アニメーション）
- React Hook Form + Zod（フォーム）
- SWR（データフェッチング）
- Vitest + Playwright（テスト）
- Supabase（バックエンド）
