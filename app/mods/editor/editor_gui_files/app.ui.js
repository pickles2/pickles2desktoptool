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
	function classUiUnit( contDataPath, data ){
		// console.log(contDataPath);
		contDataPath = contDataPath.replace( new RegExp('^\\/*'), '/' );
		this.contDataPath = contDataPath;
		this.modTpl = contApp.modTpl.get( data.modId );
		this.fieldList = _.keys( this.modTpl.fields );
		// console.log(this.modTpl);

		this.fields = {};
		for( var idx in this.fieldList ){
			var fieldName = this.fieldList[idx];
			switch( this.modTpl.fields[fieldName].type ){
				case 'markdown':
					this.fields[fieldName] = data.fields[fieldName];
					break;
				case 'module':
					this.fields[fieldName] = [];
					for( var idx2 in data.fields[fieldName] ){
						this.fields[fieldName][idx2] = new classUiUnit(
							contDataPath+'/fields.'+fieldName+'@'+idx2,
							data.fields[fieldName][idx2]
						);
					}
					break;
			}
		}

		/**
		 * HTMLコードを生成する
		 */
		this.bind = function( mode ){
			mode = mode||"finalize";
			// mode =
			//    canvas (編集用レイアウト)
			//    finalize (デフォルト/最終書き出し)
			var fieldData = {};
			for( var idx in this.fieldList ){
				var fieldName = this.fieldList[idx];
				switch( this.modTpl.fields[fieldName].type ){
					case 'markdown':
						fieldData[fieldName] = this.fields[fieldName];
						if( mode == 'canvas' && !fieldData[fieldName].length ){
							fieldData[fieldName] = '(テキストを入力してください)';
						}
						break;
					case 'module':
						fieldData[fieldName] = [];
						for( var idx2 in this.fields[fieldName] ){
							fieldData[fieldName][idx2] = this.fields[fieldName][idx2].bind( mode );
						}
						if( mode == 'canvas' ){
							fieldData[fieldName].push( $('<div>')
								.attr("data-guieditor-cont-data-path", this.contDataPath+'/fields.'+fieldName+'@'+( this.fields[fieldName].length ))
								.css({
									"height": 30,
									"background-color":"#eef"
								})
								.get(0).outerHTML
							);
						}
						break;
				}
			}
			var rtn = $('<div>')
				.attr("data-guieditor-cont-data-path", this.contDataPath)
				.css({
					'margin-top':5,
					'margin-bottom':5,
				})
				.append( this.modTpl.bind(fieldData) )
			;
			// console.log(rtn);
			if( mode == 'finalize' ){
				rtn = rtn.get(0).innerHTML;
			}else{
				rtn = rtn.get(0).outerHTML;
			}
			return rtn;
		}

		/**
		 * コントロールパネルを描画する
		 */
		this.drawCtrlPanels = function( $content ){

			var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(this.contDataPath)+']');
			var $ctrlElm = $('<div>')
				.css({
					'border':'0px dotted #99d',
					'text-align':'center',
					'background-color': 'transparent',
					'display':'block',
					'position':'absolute',
					"z-index":0,
					'width': $elm.width(),
					'height': $elm.height()
				})
				.width($elm.width())
				.height($elm.height())
				.offset($elm.offset())
				.attr({'data-guieditor-cont-data-path': this.contDataPath})
				.bind('mouseover', function(e){
					$(this).css({
						"border":"3px dotted #000"
					});
				})
				.bind('mouseout', function(e){
					$(this).css({
						"border":"0px dotted #99d"
					});
				})
				.bind('drop', function(e){
					var modId = e.dataTransfer.getData("modId");
					px.message( 'modId "'+modId+'" がドロップされました。' );
					// contApp.contData.addElement( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
					// 	px.message('開発中: 要素の追加完了しました。');
					// } );
				})
				.bind('dragover', function(e){
					e.preventDefault();
				})
				.bind('click', function(e){
					px.message( '開発中: このモジュールを選択して、編集できるようになる予定です。' );
				})
				.bind('dblclick', function(e){
					// px.message( 'ここに追加したいモジュールをドロップしてください。' );
				})
			;
			$ctrlPanel.append( $ctrlElm );


			for( var idx in this.fieldList ){
				var fieldName = this.fieldList[idx];
				switch( this.modTpl.fields[fieldName].type ){
					case 'module':
						for( var idx2 in this.fields[fieldName] ){
							this.fields[fieldName][idx2].drawCtrlPanels( $content );
						}

						var contDataPath = this.contDataPath+'/fields.'+fieldName+'@'+(this.fields[fieldName].length);
						var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(contDataPath)+']');
						var $ctrlElm = $('<div>')
							.css({
								'border':'0px dotted #99d',
								'font-size':'11px',
								'overflow':'hidden',
								'text-align':'center',
								'background-color': 'transparent',
								'display':'block',
								'position':'absolute',
								"z-index":0,
								'width': $elm.width(),
								'height': $elm.height()
							})
							.width($elm.width())
							.height($elm.height())
							.offset($elm.offset())
							.text(contDataPath)
							.attr({'data-guieditor-cont-data-path': contDataPath})
							.bind('mouseover', function(e){
								$(this).css({
									"border":"3px dotted #000"
								});
							})
							.bind('mouseout', function(e){
								$(this).css({
									"border":"0px dotted #99d"
								});
							})
							.bind('drop', function(e){
								var modId = event.dataTransfer.getData("modId");
								// px.message( 'modId "'+modId+'" がドロップされました。' );
								contApp.contData.addElement( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
									px.message('要素を追加しました。');
									contApp.ui.resizeEvent();
								} );
							})
							.bind('dragover', function(e){
								e.preventDefault();
							})
							.bind('click', function(e){
								// px.message( 'UTODO: 開発中: select '+$(this).attr('data-guieditor-cont-data-path') );
							})
							.bind('dblclick', function(e){
								px.message( 'ここに追加したいモジュールをドロップしてください。' );
								e.preventDefault();
							})
						;
						$ctrlPanel.append( $ctrlElm );

						break;
				}
			}
		}


	} // function classUiUnit()

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

			dataViewTree[id] = new classUiUnit( '/bowl.main', data );
			$(this).html( dataViewTree[id].bind( 'canvas' ) );
			$(this).html( dataViewTree[id].drawCtrlPanels($(this)) );

		});
	} // resizeEvent()


	/**
	 * 最終書き出しHTMLのソースを取得
	 */
	this.finalize = function(){
		return dataViewTree.main.bind( 'finalize' );
	}

})(window.px, window.contApp);