window.contApp.ui = new(function(px, contApp){
	var _this = this;
	var $preview;
	var $previewDoc;
	var $ctrlPanel;
	var $palette;

	var dataViewTree = {};

	/**
	 * フィールド初期化
	 */
	this.initField = function( cb ){
		$preview = $('iframe.cont_field-preview');
		$previewDoc = $($preview[0].contentWindow.document);
		$ctrlPanel = $('.cont_field-ctrlpanel');
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
			.attr({'data-id': function(d, i){ return d.id }})
			.attr({'draggable': true})//←HTML5のAPI http://www.htmq.com/dnd/
			.style({'color':'inherit'})
			.on('dragstart', function(){
				// px.message( $(this).data('id') );
				event.dataTransfer.setData("modId", $(this).data('id') );
			})
		;
		update.enter()
			.append('li')
			.append('button')
			.text(function(d, i){
				return d.id;
			})
			.style({'color':'inherit'})
			.attr({'data-id': function(d, i){ return d.id }})
			.attr({'draggable': true})//←HTML5のAPI http://www.htmq.com/dnd/
			.on('dragstart', function(){
				// px.message( $(this).data('id') );
				event.dataTransfer.setData("modId", $(this).data('id') );
			})
		;
		update.exit()
			.remove()//消すときはこれ。
		;

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

		// 編集フィールドの初期化
		$ctrlPanel.html('');

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
	function classUiUnit( contDataPath, data, $elmParent ){
		// console.log(contDataPath);
		// console.log(data);

		this.contDataPath = contDataPath;
		this.$elmParent = $elmParent;
		this.modTpl = contApp.modTpl.get( data.modId );
		// console.log(this.modTpl);
		this.fieldList = _.keys( this.modTpl.fields );

		this.fields = {};
		for( var idx in this.fieldList ){
			switch( this.modTpl.fields[this.fieldList[idx]].type ){
				case 'markdown':
					this.fields[this.fieldList[idx]] = data['fields'][this.fieldList[idx]];
					break;
				case 'module':
					this.fields[this.fieldList[idx]] = [];
					for( var idx2 in data['fields'][this.fieldList[idx]] ){
						var $tmpParent = $('<div>');
						this.fields[this.fieldList[idx]][idx2] = new classUiUnit(
							contDataPath+'/fields.'+this.fieldList[idx]+'@'+idx2,
							data['fields'][this.fieldList[idx]][idx2],
							$tmpParent
						);
					}
					break;
			}
		}

		this.bind = function(){
			var fieldData = {};
			for( var idx in this.fieldList ){
				switch( this.modTpl.fields[this.fieldList[idx]].type ){
					case 'markdown':
						fieldData[this.fieldList[idx]] = this.fields[this.fieldList[idx]];
						if( !fieldData[this.fieldList[idx]].length ){
							fieldData[this.fieldList[idx]] = '(テキストを入力してください)';
						}
						break;
					case 'module':
						fieldData[this.fieldList[idx]] = [];
						for( var idx2 in this.fields[this.fieldList[idx]] ){
							fieldData[this.fieldList[idx]][idx2] = this.fields[this.fieldList[idx]][idx2].bind();
						}

						new (function( contDataPath, data, $elmParent ){
							this.contDataPath = contDataPath;
							this.$elmParent = $elmParent;

							this.$elm = $('<div>')
								.css({
									'height': 60,
									'width': '100%'
								})
							;

							this.$elmParent.append(this.$elm);

							this.$ctrlElm = $('<div>')
								.css({
									'border':'3px dotted #99d',
									'text-align':'center',
									'background-color': '#ddf',
									'display':'block',
									'position':'absolute',
									'width': this.$elm.width(),
									'height': this.$elm.height()
								})
								.width(this.$elm.width())
								.height(this.$elm.height())
								.offset(this.$elm.offset())
								.text('ここにモジュールをドラッグしてください。')
								.data({'data-path': contDataPath})
								.bind('drop', function(e){
									var modId = event.dataTransfer.getData("modId");
									// px.message( 'modId "'+modId+'" がドロップされました。' );
									contApp.contData.addElement( modId, $(this).data('data-path'), function(){
										px.message('開発中: 要素の追加完了しました。');
										_this.resizeEvent();
									} );
								})
								.bind('dragover', function(e){
									event.preventDefault();
								})
								// .bind('click', function(e){
								// 	px.message('TEST: Clicked');
								// })
							;
							$ctrlPanel.append( this.$ctrlElm );

						})( this.contDataPath+'/fields.'+this.fieldList[idx]+'@'+this.fields[this.fieldList[idx]].length, {}, this.$elmParent );

						break;
				}
			}
			var rtn = this.modTpl.bind(fieldData);
			// console.log(rtn);
			return rtn;
		}

		this.$elm = $( '<div>'+this.bind()+'</div>' );
		this.$elmParent.append(this.$elm);

		this.$ctrlElm = $('<div>')
			.css({
				'border':'3px dotted #99d',
				'text-align':'center',
				'background-color': 'transparent',
				'display':'block',
				'position':'absolute',
				'width': this.$elm.width(),
				'height': this.$elm.height()
			})
			.width(this.$elm.width())
			.height(this.$elm.height())
			.offset(this.$elm.offset())
			.data({'data-path': contDataPath})
			.bind('drop', function(e){
				var modId = event.dataTransfer.getData("modId");
				// px.message( 'modId "'+modId+'" がドロップされました。' );
				contApp.contData.addElement( modId, $(this).data('data-path'), function(){
					px.message('開発中: 要素の追加完了しました。');
				} );
			})
			.bind('dragover', function(e){
				event.preventDefault();
			})
			.bind('click', function(e){
				px.message( 'UTODO: 開発中: select '+$(this).data('data-path') );
			})
		;
		$ctrlPanel.append( this.$ctrlElm );
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


		$ctrlPanel.html('');
		$previewDoc.find('.contents').each(function(){
			$(this).html('');
			var id = $(this).attr('id')||'main';
			var data = contApp.contData.getBowlData( id );

			dataViewTree.main = new classUiUnit( '/', data, $(this) );

			// for( var idx in data ){
			// 	dataViewTree.main = new classUiUnit( '/fields.'+id+'@'+idx, data[idx], $(this) );
			// }


		});
	} // resizeEvent()


})(window.px, window.contApp);