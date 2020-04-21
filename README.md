# Pickles 2

code name: babycorn

[Pickles 2](https://pickles2.pxt.jp/) のプロジェクトテンプレートをベースにしたウェブサイトを編集するGUI編集環境を提供します。

Pickles Framework 2 に特化した CMSライクなテキストエディタです。

## Install

Copy `Pickles2.app` to your Application Folder.


## for developer

### Initial Setup for develop

```
$ npm install -g gulp
$ git clone https://github.com/pickles2/app-pickles2.git
$ cd app-pickles2
$ git submodule update --init --recursive --force
$ npm install
$ composer install
```

### update submodules changes

```
$ npm run submodules-update
```

### Boot for develop

```
$ npm start
```

`npm start` でエラーが起きる場合は以下を試してください。

```
$ npm install nw
$ npm start
```


### Task Runner

```
$ gulp watch
```


### Build application

```
$ php docs/help/htdocs/.px_execute.php /?PX=publish.run
$ npm run build
```

`./build/dist/` にZIPファイルが出力されます。


### Build application cleanly

```
$ sh build/build_clean.sh [-i ${AppleIdentity}] [-s ${path_to_apple_coodesign.json}] {$branch_or_version}
```

ユーザーのホームディレクトリに、クリーンビルドされたZIPファイルが出力されます。

mac で実行してください。Windows では実行できません。


#### Staple Apple Notarize Info

```
$ sh build/staple_apple_notarize_info.sh build/dist/Pickles2-{$version}-osx64.zip
```

### node and npm version

- node@10.15.0
- npm@6.4.1

Mac で Windows 版をビルドするにあたり、次の環境が必要です。

- wine@2.0


## 更新履歴 - Change log

### Pickles 2 v2.0.0-beta.27 (リリース日未定)

- Linux版で、Git操作時にブランチ名の解析が失敗する場合がある問題を修正。
- ファイルとフォルダ機能を改善。
- コンテンツ編集メニューに「サブウィンドウで編集」を追加。
- その他いくつかのUIの改善と不具合の修正。

### Pickles 2 v2.0.0-beta.26 (2019年12月15日)

- Update: broccoli-html-editor v0.3.11
- Update: pickles2-contents-editor v2.0.9
- Update: pickles2-module-editor v0.2.4
- `$conf->path_top` が設定されている場合に、コンテンツ編集ができない問題を修正。
- ハッシュ付きページのコンテンツを編集できない問題を修正。
- ダイナミックパスを含むページのコンテンツを編集できない問題を修正。
- Gitのブランチを切り替える機能を追加。
- コンテンツコメントの作成と削除ができない問題を修正。
- パブリッシュ後のエラーレポートをすぐに確認できるようになった。
- アプリケーション設定から、データディレクトリのパスを変更できるようになった。
- ダッシュボードで、プロジェクトの一覧をフィルタリングできるようになった。
- その他いくつかのUIの改善と不具合の修正。

### Pickles 2 v2.0.0-beta.25 (2019年6月30日)

- Update: broccoli-html-editor v0.3.8
- Update: pickles2-contents-editor v2.0.6
- Update: pickles2-module-editor v0.2.3
- コンテンツ一括加工機能がレポートする `countFile()` の出力に、コンテンツの拡張子と編集タイプの情報を付加するようになった。
- テーマの編集画面から、デフォルトのテーマを切り替えられるようになった。(プロジェクトに `pickles2/px2-px2dthelper` v2.0.12 以降が必要)
- 新規サイトマップCSV作成機能を追加。
- パブリッシュプレビュー機能を追加。
- git-pull, git-commit, git-push の操作が画面から実行できるようになった。
- その他いくつかのUIの改善。

### Pickles 2 v2.0.0-beta.24 (2019年4月19日)

- nw.js v0.37.0 にアップデートした。
- Broccoli エディタ (GUI編集) で、loopフィールドの外側に宣言されたinputフィールドの値を、 loopフィールド内の echoフィールドで参照できるようになった。
- Broccoli エディタ (GUI編集) で、loopフィールドに indexオプションを追加。
- Broccoli エディタ (GUI編集) で、inputフィールドに scriptフィールドを追加。
- その他いくつかのUIの改善。

### Pickles 2 v2.0.0-beta.23 (2019年3月15日)

- アプリケーション自身のアップデート自動チェック機能を追加。
- その他細かい不具合を修正。

### Pickles 2 v2.0.0-beta.22 (2019年2月22日)

- 新機能「ファイルとフォルダ」を追加。
- 新機能「コンテンツファイルを一括作成」を追加。
- 新機能「コンテンツファイルリスト作成」を追加。
- Broccoli エディタ (GUI編集) で、コンテキストメニューを使えるようになった。
- ウィンドウのサイズと表示位置を記憶するようになった。
- `composer install` 画面を追加。
- 内蔵ウェブサーバーの安定性を向上した。
- Forum のリンク先を GitHub issue に変更。
- その他細かい不具合を修正。

### Pickles 2 v2.0.0-beta.21 (2018年10月26日)

- 1ページを単体で手軽にパブリッシュできる機能を追加。
- パブリッシュを途中でキャンセルできる機能を追加。
- 新規プロジェクト作成のフローを改善。
- アプリケーション設定から、 git のユーザー情報設定を更新できるようになった。
- その他いくつかのUIの改善。

### Pickles 2 v2.0.0-beta.20 (2018年8月30日)

- guiEngine 設定で `broccoli-html-editor-php` に対応。PHPに移植されたGUI編集エンジンを利用可能になった。
- スタイルガイドジェネレータが `finalize.php` に対応した。
- JS版GUI編集で、 if フィールドが、 canvas モード描画時でも常に finalize モードで出力された値を評価するように変更した。
- 外部のサーバーを設定したプロジェクトで、内蔵サーバーを起動してしまうことがある不具合を修正。
- composer.json の extra が存在するが空白の場合に異常終了する不具合を修正。
- composer プロジェクトの更新で、強制的に更新するオプションを追加した。
- composer update コマンドが失敗したとき、ユーザーに通知するようになった。
- コンテンツ一括加工の Dry Run オプションを、デフォルトでオフにした。
- その他いくつかの不具合の修正。

それ以前の更新は[こちらから](./docs/changelog.md)。

## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
