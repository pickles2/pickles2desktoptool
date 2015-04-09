


Pickles2 Desktop Tool のGUI編集機能は、個別に設計された小さな部品 __ドキュメントモジュール__ を組み合わせて構築するインターフェイスです。

ここでは、ドキュメントモジュールのテンプレートを定義する方法について説明します。


<!-- autoindex -->



## ディレクトリとファイルの構成

### モジュールの単位

モジュールは、次のようなディレクトリ構成構成が単位となります。

- &lt;moduleRoot&gt;/{$mod_category}/{$mod_name}/

この構成は、モジュールの識別IDに影響します。


### モジュール1つあたりのファイル構成

`{$mod_name}` ディレクトリの内容は、次のようなファイルで構成されます。

- template.html
- module.css (または module.css.scss)
- module.js
- thumb.png
- info.json
- README.html (または README.md)


#### template.html

このHTMLファイルに、テンプレートの実装を記述します。
テンプレートは、部分だけを切り出した純粋なHTMLをベースに、フィールド(変更可能な箇所を定義するメタ構文)を埋め込むような形式で記述していきます。

利用可能なフィールドについては、<a href="../fields/">フィールド一覧</a>のページを参照してください。


#### module.css (または module.css.scss)

モジュールに関連するスタイルシートを記述します。
ファイル名の最後に `.scss` を付加すると、SCSS形式で記述することができます。

ここに書かれたスタイルは、Pickles2用のプラグイン px2-px2dthelper によって収集・統合し、テーマから自動的に読み込むことができます。


#### module.js

モジュールの動作に関連するスクリプトを記述します。

ここに書かれたスクリプトは、Pickles2用のプラグイン px2-px2dthelper によって収集・統合し、テーマから自動的に読み込むことができます。


#### thumb.png

thumb.png は、GUI編集画面上での、モジュールのサムネイルとして使用されます。

縦横比 1:1 の画像を登録してください。大きさについては特に規定はありませんが、500px前後で作成されていれば十分でしょう。

`thumb.png` の他にも、`thumb.jpg`、`thumb.gif`、`thumb.svg` が利用できます。


#### info.json

このJSONファイルには、モジュールの詳細な付加情報を記述します。

下記は記述例です。

```
{
  "name": ".cols (3カラム)"
}
```

#### README.html (または README.md)

モジュールに関する説明などがあれば、このファイルに記述します。

この記述は、px2-px2dthelper が自動生成するスタイルガイドに記載されます。


## モジュールをプロジェクトに登録する

モジュールの定義ができたら、コンフィグ画面からモジュールとして登録します。

### Config 画面を開く

サブメニュー内にある `Config` を開きます。


### Config にディレクトリを登録

Pickles2 Desktop Tool の設定は、Pickles2 の Config `$conf->plugins->px2dt` に記述します。 次の例を参考に、`paths_module_template` 欄にモジュールのパスを設定してください。

```
@$conf->plugins->px2dt->paths_module_template = [
	"SELF" => "./px-files/resources/module_templates/"
];
```

モジュールのセットは、1つのプロジェクトにつき複数登録することができます。

`paths_module_template` の添字(上記の例では、"SELF")は、モジュールのIDの一部として利用されます。コンテンツに使用した後から変更すると、モジュール構造が壊れますので注意してください。添字には、半角英数字と、ハイフン、アンダースコア が使えます。

Pickles2 のコンフィグは、`./px-files/config.php` に保存されます。




