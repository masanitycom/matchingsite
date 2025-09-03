# GayConnect - ゲイ向けマッチングアプリ

## 概要
GayConnectは、男性同士の真剣な出会いを提供する安全で包括的なマッチングプラットフォームです。

## 主な機能
- 👤 ユーザー認証・プロフィール管理
- 💝 スワイプ式マッチング機能
- 💬 リアルタイムメッセージング
- 🔍 詳細検索機能
- ✅ 本人確認システム
- 💳 サブスクリプション管理
- 🛡️ 安全機能（ブロック、通報）
- 📱 PWA対応（モバイル最適化）

## 技術スタック
- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage
- **決済**: Stripe
- **ホスティング**: Vercel

## セットアップ手順

### 1. 必要な環境
- Node.js 18以上
- npm または yarn
- Supabaseアカウント
- Stripeアカウント（決済機能用）

### 2. インストール
```bash
# リポジトリをクローン
git clone [your-repo-url]
cd gay-connect

# 依存関係をインストール
npm install
```

### 3. 環境変数の設定
`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GayConnect
```

### 4. Supabaseのセットアップ

#### データベース作成
1. Supabaseダッシュボードで新しいプロジェクトを作成
2. SQLエディタで`supabase/schema.sql`の内容を実行

#### ストレージバケット作成
1. Supabaseダッシュボードの「Storage」セクションへ
2. 「photos」という名前の新しいバケットを作成
3. バケットを「Public」に設定

#### 認証設定
1. Authentication → Providersで必要なプロバイダーを有効化
   - Email
   - Google OAuth
   - Apple OAuth（オプション）

### 5. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## プロジェクト構造
```
gay-connect/
├── app/                    # Next.js App Router
│   ├── auth/              # 認証関連ページ
│   ├── home/              # ホーム（スワイプ画面）
│   ├── matches/           # マッチ一覧
│   ├── messages/          # メッセージング
│   ├── onboarding/        # オンボーディング
│   └── profile/           # プロフィール
├── components/            # 再利用可能なコンポーネント
├── contexts/              # React Context
├── lib/                   # ユーティリティ関数
├── supabase/              # データベーススキーマ
└── public/                # 静的ファイル
```

## データベーススキーマ
主要なテーブル:
- `users` - ユーザー情報
- `matches` - マッチング情報
- `messages` - メッセージ
- `likes` - いいね情報
- `blocks` - ブロック情報
- `reports` - 通報情報
- `subscriptions` - サブスクリプション情報

## セキュリティ機能
- 本人確認システム
- 24時間監視体制
- 不適切コンテンツ自動検出
- ブロック・通報機能
- データ暗号化
- GDPR対応

## 料金プラン
1. **無料プラン**
   - 基本機能
   - 1日5いいねまで

2. **プレミアムプラン（月額1,980円）**
   - 無制限いいね
   - 既読確認
   - 詳細検索

3. **VIPプラン（月額3,980円）**
   - プレミアム機能すべて
   - ビデオ通話
   - 優先サポート

## デプロイ

### Vercelへのデプロイ
```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel
```

### 本番環境の設定
1. Vercelダッシュボードで環境変数を設定
2. カスタムドメインを設定
3. SSL証明書の自動設定を確認

## 今後の開発予定
- [ ] ビデオ通話機能の実装
- [ ] AIによるマッチング精度向上
- [ ] グループ・コミュニティ機能
- [ ] イベント機能
- [ ] 多言語対応
- [ ] React Nativeアプリ

## ライセンス
MIT License

## サポート
問題が発生した場合は、Issueを作成してください。

## 貢献
プルリクエストを歓迎します。大きな変更の場合は、まずIssueを開いて変更内容を議論してください。
