# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## リポジトリ概要

このリポジトリは、抵抗器カラーコード方式(0=黒、1=茶、2=赤、3=橙、4=黄、5=緑、6=青、7=紫、8=灰、9=白)に基づいた色付き羊毛ブロックを使用して数字ブロック機能を提供する、2つの関連するMinecraftプロジェクトを含むモノレポです。

1. **makecode-minecraft-numeric-blocks/** - Minecraft Education Edition向けMakeCode拡張機能
2. **minecraft-numeric-blocks-mcaddon/** - TypeScriptスクリプティングを使用したBedrock Editionアドオン

両プロジェクトは同じ色と数字のマッピング方式を実装していますが、異なるMinecraftプラットフォーム向けです。

## プロジェクト1: MakeCode拡張機能 (makecode-minecraft-numeric-blocks/)

### ビルドコマンド

```bash
cd makecode-minecraft-numeric-blocks

# 拡張機能をビルド
pxt build

# 拡張機能をデプロイ
pxt deploy

# テストを実行
pxt test

# Makefile経由の代替コマンド
make build
make deploy  # デフォルトターゲット
make test
```

### アーキテクチャ

これはエージェントに数値ブロックを検査する機能を追加するMakeCode拡張機能です。

- [numericBlock.ts](makecode-minecraft-numeric-blocks/numericBlock.ts) - 色付き羊毛に対して0-9を返すか、数値ブロックでない場合はnullを返す`agent.inspectNumericBlock(direction)`関数
- [pxt.json](makecode-minecraft-numeric-blocks/pxt.json) - MakeCodeプロジェクト設定
- [_locales/ja/](makecode-minecraft-numeric-blocks/_locales/ja/) - 日本語ローカライゼーションファイル

**主要な関数**: `agent.inspectNumericBlock(direction)`は指定された方向のブロックを検査して以下を返します:
- 羊毛の色に基づいた数字0-9
- 数値ブロックでない場合は警告メッセージ付きで`null`

### 使用方法

この拡張機能は、GitHubリポジトリURLで検索することで、https://minecraft.makecode.com/ のMakeCodeプロジェクトにインポートできます。

## プロジェクト2: Minecraft Bedrock アドオン (minecraft-numeric-blocks-mcaddon/)

### ビルドコマンド

```bash
cd minecraft-numeric-blocks-mcaddon

# 依存関係のインストール
npm install

# ビルド(TypeScriptコンパイル + バンドル)
npm run build

# TypeScriptファイルのリント
npm run lint

# リント問題の自動修正
npm run lint -- --fix

# ビルド成果物のクリーンアップ
npm run clean

# 配布用.mcaddonパッケージの作成
npm run mcaddon

# 開発モード: ファイル変更時に自動リビルド
npm run local-deploy

# Minecraftループバックを有効化(Windows専用、一度だけ実行)
npm run enablemcloopback
```

### アーキテクチャ

これはスクリプトイベントを使用して数値ブロックを配置するTypeScriptベースのBedrock Editionアドオンです。

**スクリプトイベントハンドラー** ([scripts/main.ts](minecraft-numeric-blocks-mcaddon/scripts/main.ts)):
- `/scriptevent mming:numline <x> <y> <z> <direction> <length> [dimension]`をリッスン
- パラメータ:
  - `x, y, z`: 開始座標(整数)
  - `direction`: 0=下、1=上、2=北、3=南、4=西、5=東
  - `length`: 配置するブロック数(1-10)
  - `dimension`: オプション(overworld/nether/the_end)、デフォルトはプレイヤーのディメンション
- 数値ブロックをランダムにシャッフルし、一列に配置

**ビルドシステム** ([just.config.ts](minecraft-numeric-blocks-mcaddon/just.config.ts)):
1. TypeScriptコンパイル: `scripts/**/*.ts` → `lib/`
2. esbuildでバンドル: [scripts/main.ts](minecraft-numeric-blocks-mcaddon/scripts/main.ts) → `dist/scripts/main.js`
3. 成果物をビヘイビアパック/リソースパックにパッケージ化
4. 配布用の`.mcaddon`ファイルを作成

**主要な依存関係**:
- `@minecraft/server` - コアBedrock Scripting API (v2.0.0+)
- `@minecraft/math` - Vector3ユーティリティと方向定数
- `@minecraft/vanilla-data` - 型付きブロックタイプとディメンション
- `@minecraft/core-build-tasks` - Minecraftアドオン用ビルドツール

**プロジェクト構造**:
```
minecraft-numeric-blocks-mcaddon/
├── scripts/main.ts              # TypeScriptエントリーポイント(スクリプトイベントハンドラー)
├── behavior_packs/Numeric_Blocks/
│   ├── manifest.json            # ビヘイビアパックマニフェスト
│   └── texts/                   # ローカライゼーションファイル(en_US.lang, ja_JP.lang)
├── resource_packs/Numeric_Blocks/
│   ├── manifest.json            # リソースパックマニフェスト
│   ├── textures/blocks/         # 数字0-9用のカスタム羊毛テクスチャ
│   └── texts/                   # ローカライゼーションファイル
├── dist/                        # ビルド出力
│   ├── scripts/main.js          # バンドルされたJavaScript
│   ├── debug/                   # ソースマップ
│   └── packages/                # .mcaddonファイル
├── just.config.ts               # ビルドタスク定義
├── tsconfig.json                # TypeScript設定
└── .env                         # 環境設定(PROJECT_NAME, DEPLOYMENT_PATH)
```

### Bedrockアドオンの重要な注意事項

- **日本語変数名**: [scripts/main.ts](minecraft-numeric-blocks-mcaddon/scripts/main.ts)は日本語の変数名を使用 - この規約を維持してください
- **ソースマップ**: デバッグ用にバンドルタスクで常に有効化
- **外部モジュール**: バンドラーはMinecraft API(`@minecraft/server`、`@minecraft/server-ui`)を外部化
- **マニフェストUUID**: ビヘイビアパックとリソースパック間で一意である必要があります
- **カスタムリンティング**: Minecraft固有のルール用に`eslint-plugin-minecraft-linting`を使用

## 開発ワークフロー

### MakeCode拡張機能の場合
1. [makecode-minecraft-numeric-blocks/](makecode-minecraft-numeric-blocks/)のTypeScriptファイルを編集
2. `pxt build`を実行してコンパイル
3. MakeCodeシミュレーターまたはhttps://minecraft.makecode.com/にインポートしてテスト

### Bedrockアドオンの場合
1. [minecraft-numeric-blocks-mcaddon/scripts/](minecraft-numeric-blocks-mcaddon/scripts/)のTypeScriptを編集
2. `npm run build`を実行してコンパイルとバンドル
3. ライブ開発と自動リビルドには`npm run local-deploy`を使用
4. Minecraftで`/scriptevent mming:numline <args>`を実行してテスト
5. 配布用に`npm run mcaddon`でパッケージ化

## リリースとデプロイメント

### Bedrock Addon のリリース流れ

[minecraft-numeric-blocks-mcaddon/.github/workflows/release.yml](minecraft-numeric-blocks-mcaddon/.github/workflows/release.yml) により、`v*` 形式のタグをプッシュすると自動的にビルドとリリースが実行されます：

```bash
# バージョンタグを作成・プッシュ（例: v1.0.0）
git tag v1.0.0
git push origin v1.0.0
```

**GitHub Actions の処理**:
1. TypeScript をコンパイル
2. esbuild でバンドル
3. `.mcaddon` パッケージを作成
4. アーティファクト（`Numeric_Blocks.zip`）としてアップロード
5. GitHubリリースを自動作成し、`Numeric_Blocks.mcaddon` ファイルを添付

**重要**: GitHub Actions のアーティファクトは自動的に `.zip` 圧縮されますが、リリースに添付される `.mcaddon` ファイルは正しい拡張子を保持します。ユーザーには Releases ページからのダウンロードを案内してください。

## 共通概念

両プロジェクトは数字0-9に対して同じ抵抗器カラーコードマッピングを共有しています:
- 0 = 黒色の羊毛 (`BLACK_WOOL` / `MinecraftBlockTypes.BlackWool`)
- 1 = 茶色の羊毛
- 2 = 赤色の羊毛
- 3 = 橙色の羊毛
- 4 = 黄色の羊毛
- 5 = 緑色の羊毛
- 6 = 青色の羊毛
- 7 = 紫色の羊毛
- 8 = 灰色の羊毛
- 9 = 白色の羊毛

このマッピングは、Minecraft内で色付きブロックとして数値を表現するために、両プロジェクトで一貫して使用されています。
