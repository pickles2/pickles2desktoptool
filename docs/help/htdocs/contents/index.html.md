
Pickles Framework は、ウェブサイトを「サイトマップ」「コンテンツ」「テーマ」の3要素に分解して構築するフレームワークです。コンテンツは、ページレイアウト全体のうち、サイトアイデンティティやナビゲーション部分を含まない領域を担当します。テーマを入れ物とするならば、内容の部分を指します。

<!-- autoindex -->

## コンテンツの種類 (extensions)

コンテンツには、次のような種類が定義されています。

- html
- md
- direct
- js
- css

これらは、プラグインを設定すると種類を追加できたり、振る舞いを変更することができます。


## コンテンツの担当範囲

テーマは、コンテンツのHTMLソースを <code>&lt;div id=&quot;content&quot; class=&quot;contents&quot;&gt;&lt;/div&gt;</code> に包んで出力します。したがって、コンテンツの担当範囲はこの要素の内側となります。

場合によって、それ以外の領域にコンテンツからHTMLソースを出力することがあります。その場合も、`class="contents"` が付いたdiv要素に内包されるのがルールとなります。


## ローカルリソースファイルの取り扱い

ローカルリソースファイルとは、コンテンツが独自に使用する画像やCSS、JavaScriptなどのファイル群を指します。どこに設置しても機能的な制限はないが、他のコンテンツのローカルリソースと混ざって区別が付かなくなると、後々取り扱いに困ることになるため、次のルールでコンテンツ単位に独自の領域を設けます。

コンテンツファイル本体と同じ階層に、コンテンツファイル名の拡張子を `_files` に置き換えた名前の専用のディレクトリを設置し、全てのリソースはその中で管理します。

ローカルリソースディレクトリの中の整理分類は、コンテンツ制作者に任せます。

他のコンテンツのローカルリソースにアクセスしてはなりません。

例えば、`/aaa/hoge.html` というコンテンツであれば、`/aaa/hoge_files/*` に全てのリソースファイルを格納します。



## コンテンツローカルCSSの読み込み

CSSはヘッドセクション内に記述する必要があるが、コンテンツの領域は <code>&lt;div class=&quot;contents&quot;&gt;&lt;/div&gt;</code> の内側に限られるため、特別な手順でこのソースを登録する必要があります。 `$px->bowl()->send($code,'head')` に渡されたソースは、ヘッドセクション内に出力されます。

<div class="unit">
	<div class="code"><pre><code>&lt;?php ob_start(); ?&gt;
&lt;!-- CSSの記述 --&gt;
&lt;style type=&quot;text/css&quot;&gt;
.contents .cont_hoge{
	color:#ff0000;
}
&lt;/style&gt;
&lt;!-- CSSを外部化する場合 --&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;./hoge_files/contents.css&quot; type=&quot;text/css&quot; /&gt;
&lt;?php $px-&gt;bowl()-&gt;send( ob_get_clean(), 'head' ); ?&gt;

&lt;div class=&quot;cont_hoge&quot;&gt;
	&lt;p&gt;ここはコンテンツの領域です。&lt;/p&gt;
&lt;/div&gt;
</code></pre></div>
</div>


