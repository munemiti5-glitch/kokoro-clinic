# こころのクリニック ウェブサイト

心療内科クリニックのウェブサイトです。

## ファイル構成

```
kokoro-clinic/
├── index.html          # トップページ
├── services.html       # 診療内容
├── contact.html        # お問い合わせ・予約フォーム
├── faq.html            # よくある質問
├── privacy.html        # プライバシーポリシー
├── 404.html            # エラーページ
├── sitemap.xml         # サイトマップ（Google用）
├── robots.txt          # クローラー設定
├── css/
│   └── style.css       # スタイルシート
├── js/
│   └── main.js         # JavaScript
└── images/
    └── favicon.svg     # ファビコン
```

## デプロイ手順

### 1. ドメイン設定

`sitemap.xml`、`robots.txt`、各HTMLファイル内の `your-domain.com` を実際のドメインに置き換えてください。

```bash
# 一括置換の例（VS Code等で）
検索: your-domain.com
置換: kokoro-clinic.jp
```

### 2. 画像の準備

`images/` フォルダに以下を追加：
- `ogp.jpg` - SNSシェア用画像（1200x630px推奨）
- `apple-touch-icon.png` - iPhoneホーム画面用（180x180px）
- クリニック内観、医師の写真など

現在は Unsplash のプレースホルダー画像を使用しています。
実際の画像に差し替えてください。

### 3. お問い合わせフォームの設定

`contact.html` 内のフォームは [Formspree](https://formspree.io/) を使用しています。

1. Formspree でアカウント作成（無料：月50件まで）
2. 新しいフォームを作成
3. `contact.html` の `action="https://formspree.io/f/your-form-id"` を取得したIDに変更

### 4. サーバーへのアップロード

#### 無料ホスティングの場合

**Netlify（おすすめ）:**
1. [netlify.com](https://netlify.com) でアカウント作成
2. フォルダをドラッグ&ドロップでデプロイ
3. カスタムドメイン設定（無料SSL付き）

**GitHub Pages:**
1. GitHubリポジトリを作成
2. ファイルをプッシュ
3. Settings > Pages で公開設定

#### レンタルサーバーの場合

FTPクライアント（FileZilla等）でファイル一式をアップロード

### 5. Google Search Console に登録

1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. プロパティを追加（ドメイン or URL プレフィックス）
3. 所有権を確認
4. サイトマップを送信: `https://あなたのドメイン/sitemap.xml`

### 6. Googleビジネスプロフィールに登録

地図検索（「近くの心療内科」等）に表示させるために：
1. [Google ビジネスプロフィール](https://www.google.com/business/) で登録
2. クリニック情報を入力
3. 確認プロセスを完了

## カスタマイズ

### 色の変更

`css/style.css` の先頭にある CSS 変数を変更：

```css
:root {
    --primary: #4A9B8C;        /* メインカラー */
    --primary-dark: #3A7B6C;   /* 濃いメインカラー */
    --primary-light: #6BB5A6;  /* 薄いメインカラー */
    --accent: #E8B86D;         /* アクセントカラー */
}
```

### テキストの変更

各HTMLファイルを直接編集してください。

## 技術仕様

- HTML5 / CSS3 / Vanilla JavaScript
- レスポンシブデザイン（モバイル対応）
- 外部ライブラリなし（Google Fonts のみ）
- SEO対策済み（OGP、構造化データ）

## ライセンス

このテンプレートは自由にご利用いただけます。
