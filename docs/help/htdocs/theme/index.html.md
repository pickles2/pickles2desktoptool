
テーマは、ページ要素のうち、ヘッダー、フッター、ナビゲーションなど、サイト全体を通して共通の規則にしたがって生成されるべき部分を一元管理する概念。コンテンツ領域以外のHTMLソースを自動的に生成します。

<!-- autoindex -->


## テーマの格納ディレクトリ

テーマは、次のディレクトリに格納されます。

<div class="unit">
    <div class="code"><pre><code>./px-files/themes/{$テーマ名}/
</code></pre></div>
</div>

<!--

### 複数のテーマの管理と切り替え

Pickles Framework では、1サイトに複数のテーマを定義することができます。テーマにはそれぞれ名前を付けます。デフォルトのテーマのテーマ名は <code>&quot;default&quot;</code> です。

テーマは、URLパラメータに <code>?THEME={$テーマ名}</code> と付加して切り替えることができます。

<div class="unit">
    <div class="code"><pre><code>例： http://xxxxxxxxx/?THEME={$テーマ名}
</code></pre></div>
</div>

-->

## レイアウト

テーマは、複数のテンプレートを定義することができます。これはレイアウトと呼ばれ、サイトマップの layout 列にレイアウト名を指定することによって切り替えることができます。デフォルトのレイアウトは <code>default</code> です。

<div class="unit">
    <div class="code"><pre><code>./px-files/themes/{$テーマ名}/{$レイアウト名}.html
</code></pre></div>
</div>

初期状態では、default(標準レイアウト)、top(トップページ用レイアウト)、plain(<code>&lt;body&gt;</code>の直下にコンテンツエリアを配したレイアウト)、popup(ポップアップウィンドウ用レイアウト)、naked(コンテンツエリアのみが出力されるレイアウト)が定義されていますが、任意に増やすことができます。




## テンプレートの記述

テーマは、コンテンツ領域のソースを変数として受け取り、HTML全体を補完して完成させます。テーマのテンプレートは、DOCTYPE宣言、htmlタグ、headセクション、bodyセクションを出力し、ヘッダー、フッターナビゲーション構造などを生成するのもテーマの役割です。

まず、デフォルトレイアウト <code>default.html</code> に、最低限の基本的なHTMLのセットを用意します。

<div class="unit">
    <div class="code"><pre><code>&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;sample&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre></div>
</div>

ここに、順を追って必要な動的要素を追加していきます。

### コンテンツを出力する

コンテンツは、コンテンツ領域にあたる部分に出力します。関数 <code>$px-&gt;bowl()-&gt;pull()</code> で出力でします。<br />
コンテンツ領域は、必ず <code>class=&quot;contents&quot;</code> の要素で囲われるようにしなければなりません。<br />

<div class="unit">
    <div class="code"><pre><code>&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;sample&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div <strong>class=&quot;contents&quot;</strong>&gt;
<strong>&lt;?php
    //↓コンテンツから受け取った
    //  コンテンツエリアのソースを出力しています。
    print $px-&gt;bowl()-&gt;pull();
?&gt;</strong>
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre></div>
</div>

### コンテンツが定義したCSSやJavaScriptを出力する

コンテンツは、そのコンテンツ独自のJavaScript機能やCSSを定義しているかも知れません。CSSやJavaScriptの定義は、headセクション内に出力したいところですが、コンテンツのコードにはheadセクションを含まないので、コンテンツの制作者は関数 <code>$px-&gt;bowl()-&gt;send('HTMLコード', head')</code> を使って、テーマにHTMLを託します。

こうして受け取ったコードは、次の例のように、関数 <code>$px-&gt;bowl()-&gt;pull('head')</code> で出力します。

<div class="unit">
    <div class="code"><pre><code>&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;sample&lt;/title&gt;
<strong>&lt;?php
    //↓コンテンツから受け取った
    //  headセクション内用のソースを出力しています。
    print $px-&gt;bowl()-&gt;pull('head');
?&gt;</strong>
&lt;/head&gt;
&lt;body&gt;
&lt;div class=&quot;contents&quot;&gt;
&lt;?php
    //↓コンテンツから受け取った
    //  コンテンツエリアのソースを出力しています。
    print $px-&gt;bowl()-&gt;pull();
?&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre></div>
</div>

### コンテンツの環境構築

コンテンツのHTMLコードが本来の意図通りにレイアウトされるためには、それに必要なCSSなどの環境をテーマから提供する必要があります。しかし、コンテンツ向けのCSS環境はプロジェクトによって一定とは限りません。

そこで「プロジェクトは、コンテンツ向けに提供する環境設定を <code>/common/contents_manifesto.ignore.php</code> に置く」という約束が設けられました。すべてのテーマがこのファイルをインクルードすれば、テーマを取り替えたときにもコンテンツの表示を保証できるようになります。

<div class="unit">
    <div class="code"><pre><code>&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;sample&lt;/title&gt;
<strong>&lt;?php
    // ↓コンテンツの環境構築を読み込みます。
    print $px->get_contents_manifesto();
?&gt;</strong>
&lt;?php
    //↓コンテンツから受け取った
    //  headセクション内用のソースを出力しています。
    print $px-&gt;bowl()-&gt;pull('head');
?&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div class=&quot;contents&quot;&gt;
&lt;?php
    //↓コンテンツから受け取った
    //  コンテンツエリアのソースを出力しています。
    print $px-&gt;bowl()-&gt;pull();
?&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre></div>
</div>

### ページの情報を出力する

カレントページの情報は、サイトマップCSVに定義されており、<code>$px-&gt;site()-&gt;get_current_page_info()</code> から取得することができます。

テーマテンプレートには、複数の箇所でページ情報を参照しますので、先頭で <code>$page_info</code> に連想配列に格納して使いまわせるように準備します。

<div class="unit">
    <div class="code"><pre><code><strong>&lt;?php
    //↓ $page_info にページの情報を格納しています。
    //   var_dump( $page_info ); で、変数の内容を確認できます。
    $page_info = $px-&gt;site()-&gt;get_current_page_info();
?&gt;</strong>&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;sample&lt;/title&gt;
&lt;?php
    // ↓コンテンツの環境構築を読み込みます。
    print $px->get_contents_manifesto();
?&gt;
&lt;?php
    //↓コンテンツから受け取った
    //  headセクション内用のソースを出力しています。
    print $px-&gt;bowl()-&gt;pull('head');
?&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div class=&quot;contents&quot;&gt;
&lt;?php
    //↓コンテンツから受け取った
    //  コンテンツエリアのソースを出力しています。
    print $px-&gt;bowl()-&gt;pull();
?&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre></div>
</div>

ここで用意した <code>$page_info</code> から、出力する情報を選んで出力します。幾つか例を示します。

### ページ名を出力する

<p>ページ名には、HTMLの特殊文字が含まれている可能性があります。<code>htmlspecialchars()</code> を通して、エスケープするようにします。</p>

<div class="unit">
    <div class="code"><pre><code>&lt;title&gt;<strong>&lt;?php print htmlspecialchars($page_info['title']); ?&gt;</strong> | サイト名&lt;/title&gt;
</code></pre></div>
</div>

#### メタタグ descriptionを出力する

<div class="unit">
    <div class="code"><pre><code>&lt;meta name=&quot;description&quot; content=&quot;<strong>&lt;?php print htmlspecialchars($page_info['description']); ?&gt;</strong>&quot; /&gt;
</code></pre></div>
</div>

#### メタタグkeywordsを出力する

<div class="unit">
    <div class="code"><pre><code>&lt;meta name=&quot;keywords&quot; content=&quot;<strong>&lt;?php print htmlspecialchars($page_info['keywords']); ?&gt;</strong>&quot; /&gt;
</code></pre></div>
</div>

#### ページ名(h1用)を出力する

h1見出しは少し特殊です。文字列に改行が含まれている場合があるからです。

HTML特殊文字に加え、改行コードを改行タグに置き換える必要があります。

<div class="unit">
    <div class="code"><pre><code>&lt;h1&gt;<strong>&lt;?php print preg_replace('/\r\n|\r|\n/s', '&lt;br /&gt;', htmlspecialchars($page_info['title_h1']) ); ?&gt;</strong>&lt;/h1&gt;
</code></pre></div>
</div>

<p>この他にも、サイトマップに定義されたすべての項目にアクセスすることができます。</p>


