# poi-plugin-koushu-rate

## このforkについて

このリポジトリは、[laidiango/poi-plugin-koushu-rate](https://github.com/laidiango/poi-plugin-koushu-rate) の日本語対応forkです。

upstreamの機能を維持したまま、poiの言語設定が日本語の場合にプラグインUIを日本語で表示できるようにしています。upstreamは現在も開発されているため、今後の更新を取り込みやすい薄い差分を維持する方針です。

## このforkで追加した内容

- poi標準i18nを利用した日本語表示
- `ja-JP` / `zh-CN`辞書
- 内部データの中国語キー・値を維持し、UI表示時のみ翻訳する構成
- 開発レシピの秘書艦・開発プール名と資材テーブル表記の日本語化
- 日本語化によって顕在化した一部レイアウトの調整
  - おすすめ度／イベント有用度ラベル
  - 開発レシピの秘書艦列の折り返し
  - 開発レシピ表の横スクロール
- i18nチェックとstandalone smoke test

## 主な機能

- 改修可能装備と、曜日・秘書艦による改修情報の一覧表示
- 改修おすすめ度／イベント有用度の表示と並べ替え
- 改修成功率から算出した改修資材の期待値と確実化の比較
- 改修に必要な素材と所持数の確認
- 装備の開発レシピ表示
- お気に入り登録とお気に入り装備のみの表示
- お気に入り装備を対象とした素材計算
- 「強くなった！」画面での目標と進捗確認
- 装備カテゴリによる絞り込み
- 装備名のあいまい検索（簡体字中国語の入力にも対応）
- 起動時の曜日に合わせた自動切り替え

おすすめ度、イベント有用度、確実化の提案は参考情報です。イベント有用度は主に装備更新系列の終点に設定され、おすすめ度と参考元の優先度には一部ずれがあります。また、確実化の比較では希少素材などの価値を考慮していない場合があります。

## インストール

### この日本語forkを使用する場合

npmで公開されている `poi-plugin-koushu-rate` はupstream版であり、このforkの日本語対応は含まれていません。

#### 推奨：Git cloneとJunctionを使用する

Windowsでは、[このリポジトリ](https://github.com/minagi/poi-plugin-koushu-rate)を任意の場所へcloneし、poiのプラグインディレクトリからclone先へJunctionを作成する方法を推奨します。例としてclone先を `D:\Dev\poi-plugin-koushu-rate` とする場合は、poiを終了してから次のように実行します。

```powershell
git clone https://github.com/minagi/poi-plugin-koushu-rate.git D:\Dev\poi-plugin-koushu-rate
cmd /c mklink /J "%APPDATA%\poi\plugins\node_modules\poi-plugin-koushu-rate" "D:\Dev\poi-plugin-koushu-rate"
```

Junctionを作成するパスに同名のディレクトリやリンクが存在する場合、先に内容とリンク先を確認し、必要に応じて別の場所へ退避してください。既存のJunctionを外す場合は、clone先の実体を削除しないよう注意してください。

この構成ではfork側の更新をGitで管理しやすく、poiからlinked pluginとして扱われるため、通常のプラグイン更新処理からは除外されます。ただし、poi本体の将来の仕様変更まで保証するものではありません。

#### 簡易：Download ZIPまたは直接コピー

GitHubの「Code」→「Download ZIP」からダウンロードするなどして、poiを終了した状態で次のファイルとディレクトリをプラグインディレクトリへ配置する方法もあります。

```text
%APPDATA%\poi\plugins\node_modules\poi-plugin-koushu-rate\
```

コピー対象は次のとおりです。

- `index.js`
- `package.json`
- `data/`
- `i18n/`
- `README.md`
- `LICENSE`

配置後にpoiを再起動すると、プラグイン一覧に「ネジ計算機」が表示されます。この手順では、poiのpluginsディレクトリで`npm install`を実行する必要はありません。

このforkはupstreamと同じpackage名・versionを維持しています。直接コピーした場合は通常のインストール済みプラグインとして認識されるため、将来upstreamがnpmへ新しいversionを公開すると、upstream版への自動更新対象になる可能性があります。この方法を利用する場合は、デフォルトで有効なpoiの「設定」→「プラグイン関連」→「起動時にプラグインを更新する」の設定に注意してください。

### upstream版を使用する場合

upstream版は、poiの「設定」→「プラグイン管理」→「npmから」へ次のパッケージ名を入力してインストールできます。

```text
poi-plugin-koushu-rate
```

upstream版のソースと最新情報は、[元リポジトリ](https://github.com/laidiango/poi-plugin-koushu-rate)を参照してください。

## データソース

- [艦隊Collection 装備開発計算器](https://xn--uesr8qr0rdwk.cn/kc-development-tools/)
- [夢美の日常改修おすすめ](https://bbs.nga.cn/read.php?tid=45999901)
- [明石改修工廠](https://akashi-list.me/)

## Credits / License

- Original project: [laidiango/poi-plugin-koushu-rate](https://github.com/laidiango/poi-plugin-koushu-rate)
- Original package author metadata: `xh255`
- Japanese localization / fork maintenance: `Minagi Tohno`
- License: [MIT License](LICENSE)
