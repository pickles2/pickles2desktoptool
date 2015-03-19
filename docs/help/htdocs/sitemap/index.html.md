
<!-- autoindex -->

## CSVの形式について

- CSVファイルはUTF-8で保存してください。
- 1行目は定義行として、2行目以降にページデータを記述してください。
- 定義行は、<code>* 定義名</code> のように、先頭にアスタリスクを記述します。
- <code>* path</code>、<code>* title</code> は必須です。必ず定義に加えてください。


### 規定の定義

<div class="unit">
<table class="def">
	<thead>
		<tr>
			<th>列</th>
			<th>キー</th>
			<th>意味</th>
		</tr>
	</thead>
	<tbody>
		<tr><th>A</th><td>path</td><td>ページのパス</td></tr>
		<tr><th>B</th><td>content</td><td>コンテンツファイルの格納先</td></tr>
		<tr><th>C</th><td>id</td><td>ページID</td></tr>
		<tr><th>D</th><td>title</td><td>ページタイトル</td></tr>
		<tr><th>E</th><td>title_breadcrumb</td><td>ページタイトル(パン屑表示用)</td></tr>
		<tr><th>F</th><td>title_h1</td><td>ページタイトル(H1表示用)</td></tr>
		<tr><th>G</th><td>title_label</td><td>ページタイトル(リンク表示用)</td></tr>
		<tr><th>H</th><td>title_full</td><td>ページタイトル(タイトルタグ用)</td></tr>
		<tr><th>I</th><td>logical_path</td><td>論理構造上のパス</td></tr>
		<tr><th>J</th><td>list_flg</td><td>一覧表示フラグ</td></tr>
		<tr><th>K</th><td>layout</td><td>レイアウト</td></tr>
		<tr><th>L</th><td>orderby</td><td>表示順</td></tr>
		<tr><th>M</th><td>keywords</td><td>metaキーワード</td></tr>
		<tr><th>N</th><td>description</td><td>metaディスクリプション</td></tr>
		<tr><th>O</th><td>category_top_flg</td><td>カテゴリトップフラグ</td></tr>
	</tbody>
</table>
</div><!-- /.unit -->

<h2>その他のヒント</h2>
<ul>
	<li>定義列は、任意に並べ替えることができます。</li>
	<li>定義は任意の名称で追加することができ、コンテンツやテーマから簡単に参照できます。例えば、 <code>* custom_col</code> と定義した列の値は、<code class="selectable">$px->site()->get_page_info( 'page_id', 'custom_col' )</code> や <code class="selectable">$px->site()->get_current_page_info( 'custom_col' )</code> で取得することができます。</li>
	<li>サイトマップCSVを、グラフィカルなExcelの形式(*.xlsx)で編集することができます。<a href="https://github.com/tomk79/pickles-sitemap-excel-2" onclick="px.utils.openURL( this.href ); return false;">pickles-sitemap-excel-2 プラグイン</a>をプロジェクトに設定してください。</li>
</ul>
