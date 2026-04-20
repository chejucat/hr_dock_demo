# HR dock survey deploy copy

このフォルダは、`HR dock survey` を GitHub 経由でオンライン公開するためのコピーです。

## ローカル起動

```powershell
cd C:\Users\junec\Desktop\git_dock
node server.js
```

ブラウザで以下を開きます。

- http://127.0.0.1:8123

## GitHub へアップロードする流れ

1. GitHub で新しい空のリポジトリを作成します。
2. `C:\Users\junec\Desktop\git_dock` の中身をそのままアップロードします。
3. `data/users.json` は `.gitignore` に入れているため、公開リポジトリには含めません。

GitHub のブラウザアップロードでも可能ですが、ファイル数が多い場合は GitHub Desktop か Git コマンドの方が安定します。

## Railway で公開する場合

このプロジェクトは `server.js` で Node サーバーを起動し、`./data/users.json` にユーザー情報を保存します。
そのため、静的ホスティングだけではなく、Node 実行と永続ストレージが必要です。

### 基本設定

- Start Command: `npm start`
- Node version: `18` 以上
- Volume mount path: `/app/data`

### 公開手順

1. Railway で `Deploy from GitHub Repo` を選びます。
2. このリポジトリを接続します。
3. サービスに Volume を追加します。
4. Mount Path を `/app/data` に設定します。
5. デプロイ後、サイトURLへアクセスします。

`server.js` は相対パス `./data` を使っているため、Railway の Volume は `/app/data` にマウントすると一致します。

## Render で公開する場合

Render でも公開できますが、永続ディスクは有料の Web Service で使います。

### 基本設定

- Build Command: `npm install`
- Start Command: `npm start`
- Persistent Disk mount path: `/opt/render/project/src/data`

### 公開手順

1. Render で新しい Web Service を作成します。
2. GitHub リポジトリを接続します。
3. 上記の Build / Start Command を設定します。
4. Persistent Disk を追加し、Mount Path を `/opt/render/project/src/data` にします。
5. デプロイ完了後、公開URLで確認します。

## 補足

- 現状は JSON ファイル保存なので、小規模な試験公開向けです。
- 本番運用では、ユーザー情報はデータベースへ移行するのが安全です。
- まず試すだけなら Railway の方がシンプルです。
