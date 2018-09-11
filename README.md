# Pickles 2

[Pickles 2](http://pickles2.pxt.jp/) のプロジェクトテンプレートをベースに、ウェブサイトを編集するGUI編集環境を提供します。

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

`./build/` にZIPファイルが出力されます。

### Build application cleanly

```
$ sh materials/build_clean.sh {$branch_or_version}
```

ユーザーのホームディレクトリにZIPファイルが出力されます。


### node and npm version

- node@6.9.1
- npm@3.6.0

Mac で Windows 版をビルドするにあたり、次の環境が必要です。

- wine@2.0


## 更新履歴 - Change log

### Pickles 2 v2.0.0-beta.21 (リリース日未定)

- 1ページを単体で手軽にパブリッシュできる機能を追加。
- パブリッシュを途中でキャンセルできる機能を追加。
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

### Pickles 2 v2.0.0-beta.19 (2018年4月6日)

- GUI編集で、 elseifフィールド と elseフィールド を使えるようになった。
- GUI編集で、 moduleフィールド、 loopフィールドに `maxLength` を追加。
- GUI編集で、 moduleフィールドに `enabledChildren` を、モジュールの `info.json` 仕様に `enabledParents`, `enabledBowls` を追加。親子関係の定義ができるようになった。
- プロジェクトの診断情報の表示機能を追加。
- 外部テキストエディタの設定で、 `$PATH` を使えるようになった。
- 外部Gitクライアントで開く機能を追加。
- 前回パブリッシュしたときの条件を記憶し、自動入力されるようになった。
- デフォルトで、内蔵 php ではなくパスが通された `php` コマンドを使用するように変更。
- スタイルガイドのインターフェイスを改善。
- その他不具合の修正、パフォーマンス調整など。

### Pickles 2 v2.0.0-beta.18 (2017年12月8日)

- テーマ編集機能を追加。
- GUI編集で、imageフィールドがファイル名の重複をチェックするようになった。
- GUI編集で、imageフィールドの JPEG, PNG 画像の自動ロスレス圧縮機能を削除。圧縮に著しく時間がかかり、作業効率を下げるため。
- GUI編集で、finalize.js の第3引数 `supply` に `data` を追加。モジュールに入力されたデータ構造にアクセスできるようになった。
- モジュール編集機能のUI改善。
- プロジェクトの `px2package` を読み込み、 `entry_script`, `home_dir` を補完するようになった。
- 新しい設定 `$conf->plugins->px2dt->path_module_templates_dir` に対応。
- コンテンツ編集画面が、エイリアスページに対応した。
- 起動時のウィンドウサイズが、スクリーンサイズいっぱいに拡大されるようになった。
- パンくずに欠損などがある場合に、コンテンツ編集画面で画面が動かなくなる不具合を修正。
- その他いくつかの細かい修正。

### Pickles 2 v2.0.0-beta.17.1 (2017年6月21日)

- 新規プロジェクト作成時に成功しているのにエラーが表示される不具合を修正。
- コンテンツ一括加工の不具合を修正。
- 内蔵のプレビュー用サーバーの起動に失敗した場合に、画面に通知を表示するようになった。
- その他いくつかの細かい修正。

### Pickles 2 v2.0.0-beta.17 (2017年6月1日)

- アプリケーションの名称を `Pickles 2 Desktop Tool` から `Pickles 2` に変更。
- NW.js を 0.21.1 に更新。
- Windows版で、バックグラウンドでの パブリッシュ中 と サイトマップキャッシュ生成中 に、画面左下に状態を表示するようになった。
- 旧GUI編集エンジン `legacy` を廃止し、`pickles2-contents-editor` に一本化。
- コンテンツ編集画面のUI改善。ページ一覧をツリー表示に変更し、大量のページを扱っても破綻しないようにした。
- 「他のページから複製して取り込む」で、入力した文字列から候補のページを表示するようになった。
- プロジェクトごとに外部のプレビューサーバーを設定できるようになった。
- 同名で拡張子が異なるサイトマップファイルをまとめて表示するように変更した。
- サイトマップファイルの一覧に、編集中の一時隠しファイルが表示されないように修正した。
- その他いくつかの細かい修正。

### Pickles 2 Desktop Tool 2.0.0-beta.16 (2017年3月27日)

- コンテンツ編集機能に多言語対応を追加。
- 中文の言語コードを修正。
- モジュール編集 機能追加。
- スタイルガイド生成 機能追加。
- コンテンツを一括加工 機能追加。
- GUI編集で、モジュールの `info.json` や `clip.json` がキャッシュされ、更新が反映されない場合がある問題を修正。
- GUI編集で、モジュールの package, category にも `deprecated` フラグを追加。
- GUI編集で、moduleフィールド、 loopフィールド でも `hidden`, ifフィールドでの分岐, echoフィールドからの出力 ができるようになった。
- GUI編集のimageフィールドに、クリップボード上の画像をペーストできる機能を追加。
- GUI編集で、既に使用されたモジュールに、後から selectフィールドを追加した場合に、 `default` が適用されない不具合を修正。
- GUI編集で、インスタンスのカット機能を追加。
- GUI編集で、インスタンスの複数選択機能を追加。
- プレビューサーバーが、Pickles 2 のコンテンツルートに設置された `.htaccess` を簡易的に解析し、 Pickles 2 に渡すべき 拡張子の一覧を取得して制御するようになった。
- コンテンツ編集メニューからページ情報を表示できる機能を追加。
- その他いくつかの細かい修正。

### Pickles 2 Desktop Tool 2.0.0-beta.15 (2016年11月21日)

- ハンバーガーメニューに「コマンドラインで開く」を追加。
- GUI編集で、プロジェクト固有のカスタムフィールドを追加できる機能 `custom_fields` を追加。
- GUI編集の `pathResourceDir` を `path_resource_dir` に、 `realpathDataDir` を `path_data_dir` に変更。
- GUI編集のAPIのいくつかを、 `pickles2/px2-px2dthelper` 依存に変更。
- GUI編集のtableフィールドで、最後の行が結合されている場合に、列幅指定が欠落する不具合を修正。
- Windows版ビルドの起動にかかる時間を改善した。
- プロジェクトの準備が整っていない場合には、 composerパッケージの更新をチェックしないように修正。
- ページでエラーが検出される場合に、プレビュー画面に表示するようになった。
- バックグラウンドでの パブリッシュ中 と サイトマップキャッシュ生成中 に、画面左下に状態を表示するようになった。 (Only Mac)
- その他いくつかの細かい修正。

### Pickles 2 Desktop Tool 2.0.0-beta.14 (2016年9月8日)

- パブリッシュのオプション `paths_region` 、 `keep_cache` に対応した。
- パブリッシュの条件をパターン登録できるようになった。
- ハンバーガーメニューに「テキストエディタで開く」を追加。
- 自然言語を選択できるようになった。 (まだ翻訳は十分ではなく、少しずつ対応していきます)
- GUI編集で登録した JPEG, PNG 画像が、自動的にロスレス圧縮機能されるようになった。
- GUI編集編集のimageフィールドで、ウェブ上のURLを直接参照できる機能を追加。
- GUI編集で、モジュール設定 `deprecated` を追加。非推奨のモジュールに `true` をセットすると、モジュールパレットに表示されなくなる。
- GUI編集の `pathResourceDir` と `realpathDataDir` を設定できるようになった。
- GUI編集で、モジュールの `finalize.js` の第3引数に、ライブラリやリソースを供給する `supply` を追加。この中に含まれる `cheerio` を利用できるようになった。
- コンテンツ編集画面で 編集モード アイコンを表示するようになった。
- メニューを選択時に、プロジェクトの情報を更新するようになり、コンフィグ更新時 や `composer update` のあと、ダッシュボードに戻る必要がなくなった。
- Pickles 2 Desktop Tool 設定 で、OK ボタンを押した直後に設定内容が保存されるようになった。
- 深いディレクトリにある新規のファイルをgitコミットできない不具合を修正。
- Pickles 2 が深い階層にある場合に、GUI編集でHTMLを正常に更新できない不具合を修正。
- プロジェクトホームにヒントを表示する機能を追加。
- composerパッケージの更新がある場合に通知する機能を追加。
- プレビューサーバーが、アクセスログを出力するようになった。
- プレビューサーバーが、ネットワークからのアクセスを拒否する設定を選択できるようになった。(デフォルトは拒否)
- その他いくつかの細かい修正。

### Pickles 2 Desktop Tool 2.0.0-beta.13 (2016年8月3日)

- コンテンツやサイトマップのコミット時、gitパスの設定が無視される不具合を修正。
- コンフィグ `path_controot` が `/` 以外の場合に起きる複数の不具合を修正。
- pickles2-contents-editor 更新: ローカルリソースの読み込みの記述を、 `$px->path_files()` 依存に書き換えた。
- GUI編集 の selectフィールドに、オプション `"display": "radio"` を追加。ラジオボタン形式の入力欄を作成できるようになった。
- GUI編集 で、同じ種類のフィールドが1つのモジュールに並んでいる場合に、最後の値がすべてに適用されてしまう不具合を修正。
- GUI編集 で、コピー＆ペースト操作時に、誤った操作ができてしまう不具合を修正。
- GUI編集 で、データ上のエラーで、誤ったモジュールが混入した場合に異常終了しないように修正。
- プレビューサーバーにPHPのパス設定が効いていない不具合を修正。
- ウィンドウサイズを変更したときに、GUIエディタの表示が崩れる不具合を修正。
- その他幾つかの細かい修正。

### Pickles 2 Desktop Tool 2.0.0-beta.12 (2016年6月23日)

- コンテンツ編集UIを pickles2-contents-editor に差し替えた。(broccoli-html-editorをラップするUIライブラリ)
- コンテンツをコミットする機能を追加。
- コンテンツ別のコミットログを表示する機能を追加。
- コンテンツ別にコミットログからロールバックする機能を追加。
- サイトマップをコミットする機能を追加。
- サイトマップのコミットログを表示する機能を追加。
- サイトマップをコミットログからロールバックする機能を追加。
- editWindow 上で、moduleフィールドとloopフィールドの並べ替えができるようになった。
- editWindow 上の loop appender をダブルクリック操作した後に表示が更新されない問題を修正。
- ソース編集で、CSS と JS が空白なときにも、外部ファイルが作られてしまう問題を修正。
- コンテンツの編集モードをHTMLに変更したいときに、GUI編集モードになってしまう不具合を修正。
- モジュールの詳細ダイアログ上で説明文のコピーに失敗する問題を修正。
- その他の細かい修正とチューニング。

### Pickles 2 Desktop Tool 2.0.0-beta.11 (2016年4月27日)

- broccoli-html-editor
  - ソース編集欄が高機能エディタ(Ace Editor) に対応。
  - hrefフィールドのサジェスト機能が常に表示されるように変更。
  - imageフィールドに、ローカルディスク上の画像ファイルをドラッグ＆ドロップで登録できるようになった。
  - imageフィールドに、画像のURL指定で登録できるようになった。
  - editWindowで、 moduleフィールド と loopフィールドの内容をリスト表示するようになった。
  - editWindowで、最初のフィールドにフォーカスが当たるようになった。
  - editWindowで、アンカーのinputの前に # の表示をつけた。
  - 1行のフィールドを `textarea` ではなく `input[type=text]` に変更。
  - appender に mouseover, mouseout したときの不自然な挙動を修正。
  - コンテンツのCSSで `html,body{height:100%;}` がセットされているときに、プレビュー画面の高さ設定に失敗する問題を修正。
  - loopモジュール内に別のモジュールが入る場合にデータが破損する問題を修正。
- express-pickles2
  - パラメータ THEME をセッションに記憶するようになった。
- その他の細かい修正とチューニング

### Pickles 2 Desktop Tool 2.0.0-beta.10.1 (2016年3月24日)

- broccoli: tableフィールドが、変換後のHTMLソースを表示できないことがある不具合を修正。

### Pickles 2 Desktop Tool 2.0.0-beta.10 (2016年3月23日)

- PHPコマンドを内蔵
- 「他のページから複製して取り込む」が失敗することがある不具合を修正
- パブリッシュ対象外のパスを指定できるようにした。 (pickles2/px-fw-2.x@2.0.17〜 の新機能に対応)
- broccoli-html-editor
    - モジュールパレットにフィルター機能を追加
    - クリップモジュール機能追加
    - コピー＆ペーストでリソースをセットで扱えるようになった
    - その他操作性の向上
- Pickles 2 サーバーエミュレータを express-pickles2 に変更
- その他複数の不具合の修正

### Pickles 2 Desktop Tool 2.0.0-beta.9.2 (2016年2月18日)

- broccoli: 新規のリソース登録ができない不具合を修正。

### Pickles 2 Desktop Tool 2.0.0-beta.9.1 (2016年2月13日)

- PxServerEmuratorが、GETパラメータを.px_execute.phpにバイパスするようになった。
- broccoli: editWindowで、ビルトインフィールドをデフォルトで隠すようにした。
- broccoli: resourceMgrでファイルのsizeが記録されていない(古いバージョンのデータ)場合に、リソースを扱えない不具合を修正。

### Pickles 2 Desktop Tool 2.0.0-beta.9 (2016年2月5日)

- GUI編集のエンジンを刷新した broccoli-html-editor を標準実装した
  - Pickles2 の config.php に、plugins.px2dt.guiEngine を設定すると、GUI編集エンジンを切り替えることができます。(legacy=旧エンジン、broccoli=新エンジン)
  - モジュールにマウスを重ねたときに表示される簡易プレビューを拡張
  - モジュールの仕様に description, default, finalize.js機能を追加
  - ウォークスルー編集 追加
  - 保存して閉じる処理を、保存せず閉じるに変更
  - instanceTreeViewがサイドバーとして表示されるようになった
- HTML編集モードの編集画面にプレビューボタンを追加
- コンテンツ画面右下のページ一覧を、フリーワード検索で絞込表示ができる機能を追加
- コンテンツ画面右下のページ一覧の表示モード切り替え機能 追加 (path と title を切り替え可能)
- コンテンツのソースコードを表示する機能 追加
- デベロッパーツールを開く機能を追加
- 絶対パスのどこかに日本語を含むディレクトリにインストールされようとした場合に、警告を表示するようにした
- \*.htm の場合に、GUIコンテンツ編集画面を起動できない不具合を修正
- Mac OSX 向けのビルドで、32bit版を廃止し、64bit版を追加した
- issueの投稿先URLを変更
- その他、UIの調整、不具合の修正など

### Pickles 2 Desktop Tool 2.0.0-beta.8 (2015年11月20日)

- デフォルトのインストールパッケージを pickles2/pickles2 に変更
- input[type=text], textarea にて、Backspace と Delete キーが無効化される問題を修正
- アプリケーション・サーバーのポート番号設定が反映されない不具合を修正
- GUI Editor: ドラッグ＆ドロップ操作時の追加・移動先を示すガイド機能を追加
- GUI Editor: hrefフィールドでサジェストされたリンク先候補をクリックしても反映されないことがある問題を修正
- GUI Editor: cmdキーを伴うキーバインドがWindowsで無効になる不具合を修正
- Windows版にて、画像のパスが、src属性にちゃんと出力されない不具合を修正
- Windows版にて、サイトマップ画面からcsvやxlsxをクリックしても標準アプリが開かない問題を修正
- Windows版にて、「Pickles2 Desktop Tool 設定」のコマンドのパス選択を、パスコピペではなくファイル選択で入力できるようにした
- その他いくつかの細かい修正


### Pickles 2 Desktop Tool 2.0.0-beta.7 (2015年10月1日)

- Pickles2 の新しい設定項目 `$conf->path_files` に対応した。
- コンテンツエリアのセレクタをPickles2のコンフィグ `$conf->plugins->px2dt->contents_area_selector`, `$conf->plugins->px2dt->contents_bowl_name_by` に設定できるようになった。
- GUI Editor: 編集中にバックスペースキーを押すと前の画面に戻ってしまうことがある問題を修正。
- GUI Editor: moduleフィールドの「ここにモジュールをドラッグしてください」の色とサイズで階層の深さが分かるように調整した。
- GUI Editor: 隣接するモジュールのパネルを密接するようにした。
- GUI Editor: 画像アップ済みのimageフィールドを複製すると、複製元と複製先の画像が連動してしまう不具合を修正。
- GUI Editor: tableフィールドにExcelを初回アップすると、正常に処理されない問題を修正。
- GUI Editor: モジュールのパッケージおよびカテゴリごとの `info.json` から `name` を読み込んで反映するようになった。
- GUI Editor: モジュールパッケージとカテゴリ内の並び替え指定 sort に対応。
- GUI Editor: instance Path View のUI改善。
- GUI Editor: instanceTreeView にフィールドのプレビューが付くようになった。
- 画像ファイルなどをドロップするとアプリに復帰できなくなる問題を修正。
- プレビュー用サーバーで `*.pdf` へのリクエストに対して application/pdf MIMEタイプを返すように修正。
- ファイルの検索機能追加。
- その他、細かい表示の調整、不具合の修正など。


### Pickles 2 Desktop Tool 2.0.0-beta.6 (2015年8月3日)

- HOME画面に README.md を表示するようになった。
- 部分パブリッシュができるようになった。対象のパスを指定して実行します。
- GUI編集: ビルトインDECフィールドを追加。
- GUI編集: ビルトインアンカー(ID)フィールドを追加。
- GUI編集: インスタンスパスビューを追加。
- GUI編集: インスタンスツリービューを追加。
- GUI編集: multitextフィールドを追加。
- GUI編集: imageフィールドで、出力するファイル名を指定できるようになった。
- GUI編集: リソースマネージャが、使われていないリソースを自動的に削除するようになった。
- GUI編集: Twigテンプレートで実装されたモジュールが利用可能になった。
- その他GUI編集画面のUI改善。
- モジュールテンプレートの実装に問題がある場合に、異常終了せず、エラーを報告するようになった。
- Px2の稼動状態が不完全な場合に、プロジェクトを選択しても落ちないようにした。
- その他、不具合の修正など。


## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <http://www.pxt.jp/>
- Twitter: @tomk79 <http://twitter.com/tomk79/>
