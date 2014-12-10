window.contApp.ui = new(function(px, contApp){
	var _this = this;
	var $preview;
	var $previewDoc;
	var $ctrlPanel;
	var $ctrlPanelSvg;
	var $palette;

	var dataViewTree = {};

	/**
	 * フィールド初期化
	 */
	this.initField = function( cb ){
		$preview = $('iframe.cont_field-preview');
		$previewDoc = $($preview[0].contentWindow.document);
		$ctrlPanel = $('.cont_field-ctrlpanel');
		$ctrlPanel.svg();
		$palette = $('.cont_modulelist');

		// モジュールパレットの初期化
		$palette
			.html('')
			.append('<ul>')
		;
		var li = d3.select('.cont_modulelist ul').selectAll('li');
		var update = li.data( contApp.modTpl.getAll() );
		update
			.text(function(d, i){
				return d.id;
			})
			.style({'color':'inherit'})
		;
		update.enter()
			.append('li')
			.append('button')
			.text(function(d, i){
				return d.id;
			})
			.style({'color':'inherit'})
			.attr({'draggable': true})//←HTML5のAPI http://www.htmq.com/dnd/
			.on('dragstart', function(){
				px.message( $(this).text() );
				event.dataTransfer.setData("moduleId", $(this).text() );
			})
		;
		update.exit()
			.remove()//消すときはこれ。
		;

		// 編集フィールドの初期化
		// $ctrlPanel
		// 	.html('')
		// 	.append( $ctrlPanelSvg
		// 		// .bind('drop', function(e){
		// 		// 	var modId = event.dataTransfer.getData("moduleId");
		// 		// 	px.message( 'modId "'+modId+'" がドロップされました。' );
		// 		// })
		// 		// .bind('dragover', function(e){
		// 		// 	event.preventDefault();
		// 		// 	// px.message(456);
		// 		// })
		// 		// .bind('click', function(e){
		// 		// 	px.message('TEST: Clicked');
		// 		// })
		// 	)
		// ;
		// $ctrlPanelSvg.clear();

		$preview
			.bind('load', function(){
				_this.onPreviewLoad();
			})
		;

		cb();
	} // initField()

	/**
	 * プレビュー画面(=GUI編集画面)を表示
	 */
	this.preview = function( path ){
		$preview
			.attr('src', 'http://127.0.0.1:8080' + path)
		;
		return true;
	} // preview()

	/**
	 * プレビューのロード完了イベント
	 * contApp.contData のデータをもとに、コンテンツと編集ツール描画のリセットも行います。
	 */
	this.onPreviewLoad = function(){
		// alert('onPreviewLoad');
		if( !$preview || !$preview[0] || !$preview[0].contentWindow ){
			return;
		}

		$previewDoc = $($preview[0].contentWindow.document);

		this.resizeEvent();
		return;
	}

	/**
	 * コンテンツデータに対応するUIのひな形
	 */
	function classUiUnit( contDataPath, $elmParent ){
		this.contDataPath = contDataPath;
		this.$elmParent = $elmParent;

		this.$elm = $('<div>')
			.css({
				'height': 120,
				'width': '100%'
			})
		;

		this.$elmParent.append(this.$elm);

		// this.$svgElm = $('<rect>')
		// 	.css({
		// 		'border':'3px dotted #99d',
		// 		'text-align':'center',
		// 		'background-color': '#ddf',
		// 		'display':'block',
		// 		'position':'absolute'
		// 	})
		// 	.attr({
		// 		'x':this.$elm.offset().left ,
		// 		'y':this.$elm.offset().top ,
		// 		'width': this.$elm.width(),
		// 		'height': this.$elm.height()
		// 	})
		// 	.width(this.$elm.width())
		// 	.height(this.$elm.height())
		// 	.offset(this.$elm.offset())
		// 	.text('ここにモジュールをドラッグしてください。')
		// 	.bind('drop', function(e){
		// 		var modId = event.dataTransfer.getData("moduleId");
		// 		px.message( 'modId "'+modId+'" がドロップされました。' );
		// 	})
		// 	.bind('dragover', function(e){
		// 		event.preventDefault();
		// 		// px.message(456);
		// 	})
		// 	.bind('click', function(e){
		// 		px.message('TEST: Clicked');
		// 	})
		// ;
		// $ctrlPanelSvg.append( this.$svgElm );

		this.$svgElm = $ctrlPanelSvg.rect(
			this.$elm.offset().left, this.$elm.offset().top, this.$elm.width(), this.$elm.height(),
			{
				fill: '#ddf', stroke: '#99d', strokeWidth: 3
			}
		);
		this.$svgElm.ondragover = function(event){
			event.preventDefault();
			// px.message(456);
		};
		this.$svgElm.ondrop = function(event){
			var modId = event.dataTransfer.getData("moduleId");
			px.message( 'modId "'+modId+'" がドロップされました。' );
		};
		this.$svgElm.onclick = function(event){
			px.message('TEST: Clicked');
		};
		// console.log( this.$svgElm );
	}

	/**
	 * ウィンドウ リサイズ イベント ハンドラ
	 */
	this.resizeEvent = function(){
		$('.cont_field')
			.css({
				'height':$(window).height() - 5
			})
		;

		$previewDoc = $($preview[0].contentWindow.document);
		var fieldheight = $previewDoc.find('body').height()+5;
		$preview.height( fieldheight );
		$ctrlPanel.height( fieldheight );

		$ctrlPanel.svg();
		$ctrlPanelSvg = $ctrlPanel.svg('get');
		$ctrlPanelSvg
			// .css({'display':'block'})
			.clear()
			// .setAttribute({
			// 	"height": $ctrlPanel.height(),
			// 	"width": $ctrlPanel.width()
			// })
			// .height( $ctrlPanel.height() )
			// .width( $ctrlPanel.width() )
			// }
		;
		// $ctrlPanelSvg.attributes.height = $ctrlPanel.height();

		// $ctrlPanelSvg.clear();
		$previewDoc.find('.contents').each(function(){
			$(this).html('');
			var id = $(this).attr('id')||'main';
			dataViewTree.main = new classUiUnit( id, $(this) );
		});
	} // resizeEvent()


})(window.px, window.contApp);