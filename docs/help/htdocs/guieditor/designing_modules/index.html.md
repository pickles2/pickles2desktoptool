


Pickles2 Desktop Tool のGUI編集機能は、個別に設計された小さな部品 __ドキュメントモジュール__ を組み合わせて構築するインターフェイスです。

ここでは、ドキュメントモジュールのテンプレートを定義する方法について説明します。


<!-- autoindex -->



## ディレクトリとファイルの構成

### モジュールの単位とディレクトリ構成

モジュールは、次のようなディレクトリ構成で表現されます。


```
└─ package/ (root)
  ├─ info.json
  ├─ category1/
  │　├─ info.json
  │　├─ module1/
  │　│　├─ README.md
  │　│　├─ info.json
  │　│　├─ template.html
  │　│　├─ module.css
  │　│　├─ module.js
  │　│　├─ finalize.js
  │　│　├─ thumb.png
  │　│　└─ pics/
  │　│　 　├─ pic1.png
  │　│　 　├─ pic2.png
  │　│　 　├─ ・・・
  │　│　 　└─ picN.png
  │　│
  │　├─ module2/
  │　├─ module3/
  │　├─ ・・・
  │　└─ moduleN/
  │
  ├─ category2/
  ├─ category3/
  ├─ ・・・
  └─ categoryN/
```



この構成を元に、モジュールの識別IDが生成されます。モジュールIDは次のような形式になります。

- {$mod_package}:{$mod_category}/{$mod_name}/



### パッケージ1つあたりのファイル構成

`{$mod_package}` ディレクトリには、各カテゴリディレクトリの他に、次のようなファイルで構成されます。

- info.json

#### info.json

このJSONファイルには、パッケージの詳細な付加情報を記述します。

下記は記述例です。

```
{
  "name": "パッケージの論理名称",
  "sort":[
    "category1",
    "category2"
  ]
}
```

`sort` には、パッケージに含まれるカテゴリのディレクトリ名を配列で指定します。ここに書かれたカテゴリは優先的に上位に表示され、指定した順番に並べられます。記述のないカテゴリは、成り行き順に最後尾に続いて表示されます。


### カテゴリ1つあたりのファイル構成

`{$mod_category}` ディレクトリには、各モジュールディレクトリの他に、次のようなファイルで構成されます。

- info.json

#### info.json

このJSONファイルには、カテゴリの詳細な付加情報を記述します。

下記は記述例です。

```
{
  "name": "カテゴリの論理名称",
  "sort":[
    "module1",
    "module2"
  ]
}
```

`sort` には、カテゴリに含まれるモジュールのディレクトリ名を配列で指定します。ここに書かれたモジュールは優先的に上位に表示され、指定した順番に並べられます。記述のないモジュールは、成り行き順に最後尾に続いて表示されます。




### モジュール1つあたりのファイル構成

`{$mod_name}` ディレクトリの内容は、次のようなファイルで構成されます。

- template.html
- module.css (または module.css.scss)
- module.js
- thumb.png
- info.json
- README.html (または README.md)
- pics/\*.png


#### template.html

このHTMLファイルに、テンプレートの実装を記述します。
テンプレートは、部分だけを切り出した純粋なHTMLをベースに、フィールド(変更可能な箇所を定義するメタ構文)を埋め込むような形式で記述していきます。

```
<!-- template.html の実装例 -->
<div class="sample_module">
	<div class="sample_module-inner">
{&{"module":{"name":"main"}}&}
	</div>
</div>
```

利用可能なフィールドについては、<a href="../fields/">フィールド一覧</a>のページを参照してください。

`template.html` の代わりに、`template.html.twig` を設置すると、Twigテンプレートエンジンを利用できます。詳しくは、<?= $px->mk_link('../designing_modules_with_tplengines/') ?> を参照ください。


#### module.css (または module.css.scss)

モジュールに関連するスタイルシートを記述します。
ファイル名の最後に `.scss` を付加すると、SCSS形式で記述することができます。

```
// module.css.scss の実装例
.sample_module{
	border: 1px solid #999;
	padding: 15px;
	margin:1em 0;
	&-inner{
		padding: 0;
		margin: 0;
	}
}
```

ここに書かれたスタイルは、Pickles2用のプラグイン px2-px2dthelper によって収集・統合し、テーマから自動的に読み込むことができます。


#### module.js

モジュールの動作に関連するスクリプトを記述します。

ここに書かれたスクリプトは、Pickles2用のプラグイン px2-px2dthelper によって収集・統合し、テーマから自動的に読み込むことができます。


#### finalize.js

ビルドされたモジュールのHTMLコードを、最終的な完成コードに加工するスクリプトを追加します。

例えば、マークダウン記法で作られたシンプルなリスト要素に、クラス名を与えて複雑な装飾を行いたい場合などに利用できます。

```js
/**
 * finalize.js
 */
module.exports = function(html, callback){

	/* ここに加工するコードを書く。 */

	// 完成したHTMLは、callback() に渡して返します。
	callback(html);
	return true;
}
```

`finalize.js` は、broccoli-html-editor エンジンでのみ使用できます。


#### thumb.png

thumb.png は、GUI編集画面上での、モジュールのサムネイルとして使用されます。

縦横比 1:1 の画像を登録してください。大きさについては特に規定はありませんが、500px前後で作成されていれば十分でしょう。

`thumb.png` の他にも、`thumb.jpg`、`thumb.gif`、`thumb.svg` が利用できます。


#### info.json

このJSONファイルには、モジュールの詳細な付加情報を記述します。

下記は記述例です。

```
{
  "name": ".cols (3カラム)",
  "areaSizeDetection ": "shallow"
}
```

<dl>
<dt>name</dt><dd>モジュールの名称を設定します。</dd>
<dt>areaSizeDetection</dt><dd>編集画面でモジュールのサイズを測る方法を指定します。<code>deep</code> は、モジュールに含まれるすべての要素のサイズを測り、最大値を探します。<code>shallow</code>を指定すると、ルートノードのみのサイズを測ります。デフォルトは<code>shallow</code>です。</dd>
<dt>interface</dt><dd>Twigテンプレートエンジンを利用する場合に、入力欄の構造を定義します。詳しくは、<?= $px->mk_link('../designing_modules_with_tplengines/') ?> を参照してください。</dd>
</dl>

#### README.html (または README.md)

モジュールに関する説明などがあれば、このファイルに記述します。

この記述は、自動生成されるスタイルガイドなどに記載されます。


#### pics/*.png

picsディレクトリに置かれた画像は、README.html(.md) と共にスタイルガイドなどに表示されます。
モジュール名だけでは内容を把握しにくかったり、微妙に異なる他のモジュールと区別しなければならない場合などに、ユーザーの判断を助けるヒントとして活用できます。


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

`paths_module_template` の添字(上記の例では、"SELF")は、モジュールのIDの一部として利用されます。コンテンツに使用した後から変更すると、モジュール構造が壊れ、作成済みのコンテンツが失われる場合がありますので注意してください。添字には、半角英数字と、ハイフン、アンダースコア が使えます。

Pickles2 の Config は、`./px-files/config.php` に保存されます。




