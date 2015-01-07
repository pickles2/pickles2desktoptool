window.contApp.ui = new(function(px, contApp){
	var _this = this;
	var $preview;
	var $previewDoc;
	var $ctrlPanel;
	var $palette;
	var $editWindow;

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
		var modTpls = (function( tmpModTpls ){
			var rtn = [];
			for( var i in tmpModTpls ){
				if( contApp.moduleTemplates.isSystemMod( tmpModTpls[i].id ) ){
					// システムテンプレートを除外
					continue;
				}
				rtn.push( tmpModTpls[i] );
			}
			return rtn;
		})( contApp.moduleTemplates.getAll() );

		var update = li.data( modTpls );
		update
			.text(function(d, i){
				return d.id;
			})
			.attr({'data-id': function(d, i){ return d.id }})
			.attr({'draggable': true})//←HTML5のAPI http://www.htmq.com/dnd/
			.style({'color':'inherit'})
			.on('dragstart', function(){
				// px.message( $(this).data('id') );
				event.dataTransfer.setData('method', 'add' );
				event.dataTransfer.setData('modId', $(this).data('id') );
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
				event.dataTransfer.setData('method', 'add' );
				event.dataTransfer.setData('modId', $(this).data('id') );
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
			.attr('src', px.preview.getUrl(path) )
		;
		return true;
	} // preview()

	/**
	 * プレビューのロード完了イベント
	 * contApp.contentsSourceData のデータをもとに、コンテンツと編集ツール描画のリセットも行います。
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
	function classUiUnit( instancePath, data ){
		// console.log(instancePath);
		// console.log( data );
		instancePath = instancePath.replace( new RegExp('^\\/*'), '/' );
		this.instancePath = instancePath;
		this.moduleTemplates = contApp.moduleTemplates.get( data.modId );
		if( this.moduleTemplates === false ){
			this.moduleTemplates = contApp.moduleTemplates.get( '_sys/unknown' );
		}
		// console.log( this.moduleTemplates );
		this.fieldList = _.keys( this.moduleTemplates.fields );

		this.fields = {};
		for( var idx in this.fieldList ){
			var fieldName = this.fieldList[idx];
			if( this.moduleTemplates.fields[fieldName].fieldType == 'input' ){
				switch( this.moduleTemplates.fields[fieldName].type ){
					case 'markdown':
						this.fields[fieldName] = data.fields[fieldName];
						break;
					case 'module':
						this.fields[fieldName] = [];
						for( var idx2 in data.fields[fieldName] ){
							this.fields[fieldName][idx2] = new classUiUnit(
								instancePath+'/fields.'+fieldName+'@'+idx2,
								data.fields[fieldName][idx2]
							);
						}
						break;
				}
			}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop' ){
				// console.log(this.moduleTemplates.fields[fieldName]);
				console.log( 'debug: UTODO: "loop" (UiUnit)' );
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
				if( this.moduleTemplates.fields[fieldName].fieldType == 'input' ){
					switch( this.moduleTemplates.fields[fieldName].type ){
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
								var instancePathNext = this.instancePath+'/fields.'+fieldName+'@'+( this.fields[fieldName].length );
								fieldData[fieldName].push( $('<div>')
									.attr( "data-guieditor-cont-data-path", instancePathNext )
									.append( $('<div>')
										.text(
											// instancePathNext +
											' ここに新しいモジュールをドラッグしてください。'
										)
										.css({
											'overflow':'hidden',
											"padding": 15,
											"background-color":"#eef",
											"border-radius":5,
											"font-size":9,
											'text-align':'center',
											'box-sizing': 'content-box'
										})
									)
									.css({
										"padding":'5px 0'
									})
									.get(0).outerHTML
								);
							}
							break;
					}
				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop' ){
					// UTODO: ？？？？？？
					console.log( 'debug: UTODO: "loop" (UI.bind)' );
				}
			}
			var rtn = $('<div>')
				.attr("data-guieditor-cont-data-path", this.instancePath)
				.css({
					'margin-top':5,
					'margin-bottom':5,
				})
				.append( this.moduleTemplates.bind(fieldData) )
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

			var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(this.instancePath)+']');
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
				.attr({'data-guieditor-cont-data-path': this.instancePath})
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
				.attr({'draggable': true})//←HTML5のAPI http://www.htmq.com/dnd/
				.on('dragstart', function(){
					event.dataTransfer.setData("method", 'moveTo' );
					event.dataTransfer.setData("data-guieditor-cont-data-path", $(this).attr('data-guieditor-cont-data-path') );
				})
				.bind('drop', function(){
					var method = event.dataTransfer.getData("method");
					var modId = event.dataTransfer.getData("modId");
					var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
					// px.message( 'modId "'+modId+'" が "'+method+'" のためにドロップされました。' );
					if( method == 'add' ){
						contApp.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
							// px.message('インスタンスを追加しました。');
							contApp.ui.resizeEvent();
						} );
					}else if( method == 'moveTo' ){
						contApp.contentsSourceData.moveInstanceTo( moveFrom, $(this).attr('data-guieditor-cont-data-path'), function(){
							// px.message('インスタンスを移動しました。');
							contApp.ui.resizeEvent();
						} );
					}
				})
				.bind('dragenter', function(e){
					$(this).css({
						"border-radius":0,
						"border":"3px dotted #99f"
					});
				})
				.bind('dragleave', function(e){
					$(this).css({
						"border":0
					});
				})
				.bind('dragover', function(e){
					e.preventDefault();
				})
				.bind('click', function(e){
					// _this.openEditWindow( $(this).attr('data-guieditor-cont-data-path') );
				})
				.bind('dblclick', function(e){
					_this.openEditWindow( $(this).attr('data-guieditor-cont-data-path') );
				})
			;
			$ctrlPanel.append( $ctrlElm );


			for( var idx in this.fieldList ){
				var fieldName = this.fieldList[idx];
				switch( this.moduleTemplates.fields[fieldName].type ){
					case 'module':
						for( var idx2 in this.fields[fieldName] ){
							this.fields[fieldName][idx2].drawCtrlPanels( $content );
						}

						var instancePath = this.instancePath+'/fields.'+fieldName+'@'+(this.fields[fieldName].length);
						var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(instancePath)+']');
						var $ctrlElm = $('<div>')
							.css({
								'border':0,
								'font-size':'11px',
								'overflow':'hidden',
								'text-align':'center',
								'background-color': 'transparent',
								'display':'block',
								'position':'absolute',
								'top': $elm.offset().top + 5,
								'left': $elm.offset().left,
								"z-index":0,
								'width': $elm.width(),
								'height': $elm.height()
							})
							.attr({'data-guieditor-cont-data-path': instancePath})
							.bind('mouseover', function(e){
								$(this).css({
									"border-radius":5,
									"border":"1px solid #000"
								});
							})
							.bind('mouseout', function(e){
								$(this).css({
									"border":0
								});
							})
							.bind('drop', function(e){
								var method = event.dataTransfer.getData("method");
								if( method === 'moveTo' ){
									var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
									contApp.contentsSourceData.moveInstanceTo( moveFrom, $(this).attr('data-guieditor-cont-data-path'), function(){
										// px.message('インスタンスを移動しました。');
										contApp.ui.resizeEvent();
									} );
									return;
								}
								if( method !== 'add' ){
									px.message('追加するモジュールをドロップしてください。ここに移動することはできません。');
									return;
								}
								var modId = event.dataTransfer.getData("modId");
								contApp.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
									px.message('インスタンスを追加しました。');
									contApp.ui.resizeEvent();
								} );
							})
							.bind('dragenter', function(e){
								$(this).css({
									"border-radius":0,
									"border":"3px dotted #99f"
								});
							})
							.bind('dragleave', function(e){
								$(this).css({
									"border":0
								});
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
	 * モジュールの編集ウィンドウを開く
	 */
	this.openEditWindow = function( instancePath ){
		// px.message( '開発中: このモジュールを選択して、編集できるようになる予定です。' );
		// px.message( instancePath );
		var data = contApp.contentsSourceData.get( instancePath );
		var modTpl = contApp.moduleTemplates.get( data.modId );

		if( $editWindow ){ $editWindow.remove(); }
		$editWindow = $('<div>')
			.css({
				'position':'fixed',
				'left':0, 'top':0,
				'width': '100%',
				'height': $('body').height(),
				// 'background-color':'#eee',
				'overflow':'auto',
				'padding': '5em 0 2em 0'
			})
		;
		$editWindow
			.append( $('#cont_tpl_module_editor').html() )
		;
		// $editWindow.find('.container')
		// 	// .append('開発中: このモジュールを選択して、編集できるようになる予定です。')
		// 	// .append(instancePath)
		// ;
		$editWindow.find('form')
			.attr({
				'action': 'javascript:;',
				'data-guieditor-cont-data-path':instancePath
			})
			.submit(function(){
				for( var idx in modTpl.fields ){
					var field = modTpl.fields[idx];
					if( field.fieldType == 'input' ){
						switch( field.type ){
							case 'module':
								break;
							case 'markdown':
							default:
								// console.log(modTpl.fields[idx]);
								// console.log(data.fields[modTpl.fields[idx].name]);
								var src = $editWindow.find('form [name='+JSON.stringify( modTpl.fields[idx].name )+']').val();
								src = JSON.parse( JSON.stringify(src) );
								data.fields[field.name] = src;
								break;
						}
					}else if( field.fieldType == 'loop' ){
						console.log( 'debug: UTODO: "loop" (EditWindow.submit())' );
					}
				}
				$editWindow.remove();
				_this.resizeEvent();
				return false;
			})
		;
		$editWindow.find('form .cont_tpl_module_editor-cancel')
			.click(function(){
				$editWindow.remove();
				return false;
			})
		;
		$editWindow.find('form .cont_tpl_module_editor-remove')
			.attr({'data-guieditor-cont-data-path':instancePath})
			.click(function(){
				contApp.contentsSourceData.removeInstance( $(this).attr('data-guieditor-cont-data-path') );
				delete data;
				$editWindow.remove();
				_this.resizeEvent();
				return false;
			})
		;

		for( var idx in modTpl.fields ){
			var field = modTpl.fields[idx];
			if( field.fieldType == 'input' ){
				switch( field.type ){
					case 'module':
						$editWindow.find('table')
							.append($('<tr>')
								.append($('<th>')
									.text(field.type+' ('+modTpl.fields[idx].name+')')
								)
								.append($('<td>')
									.text('ネストされたモジュールがあります。')
								)
							)
						;
						break;
					case 'markdown':
					default:
						// console.log(modTpl.fields[idx]);
						// console.log(data.fields[modTpl.fields[idx].name]);
						$editWindow.find('table')
							.append($('<tr>')
								.append($('<th>')
									.text(field.type+' ('+modTpl.fields[idx].name+')')
								)
								.append($('<td>')
									.append($('<textarea>')
										.attr({"name":modTpl.fields[idx].name})
										.val(data.fields[modTpl.fields[idx].name])
										.css({'width':'100%','height':'12em'})
									)
								)
							)
						;
						break;
				}
			}else if( field.fieldType == 'loop' ){
				console.log( 'debug: "loop" (EditWindow.draw)' );
				$editWindow.find('table')
					.append($('<tr>')
						.append($('<th>')
							.text(field.fieldType+' ('+modTpl.fields[idx].name+')')
						)
						.append($('<td>')
							.append($('<input>')
								.attr({"type":'number'})
								.attr({"name":modTpl.fields[idx].name})
								.val(data.fields.length)//??
								.css({'width':'100%'})
								.change( function(){ alert($(this).val()); } )
							)
						)
					)
				;

			}
		}

		$('body').append( $editWindow );
		return this;
	}// openEditWindow()

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

		var fieldheight = $previewDoc.find('body').height()*1.5; // ←座標を上手く合わせられないので、余裕を持って長めにしとく。
		$preview.height( fieldheight );
		$ctrlPanel.height( fieldheight );
		if( $editWindow ){
			$editWindow.height( fieldheight );
		}

		$ctrlPanel.html('');
		$previewDoc.find('.contents').each(function(){
			$(this).html('');
			var id = $(this).attr('id')||'main';
			var data = contApp.contentsSourceData.getBowlData( id );

			dataViewTree[id] = new classUiUnit( '/bowl.main', data );
			$(this).html( dataViewTree[id].bind( 'canvas' ) );
			$(this).html( dataViewTree[id].drawCtrlPanels($(this)) );

		});

		setTimeout(function(){
			// 高さ合わせ処理のタイミングがずれることがある。
			// 根本的な解決にはなってないが、一旦 setTimeout() で逃げとく。
			// 描画処理中のどこかに何か原因がありそうな気がする。
			var fieldheight = $previewDoc.find('body').height();
			$preview.height( fieldheight );
			$ctrlPanel.height( fieldheight );
			if( $editWindow ){
				$editWindow.height( fieldheight );
			}
		}, 200);
	} // resizeEvent()

	/**
	 * 最終書き出しHTMLのソースを取得
	 */
	this.finalize = function(){
		var src = dataViewTree.main.bind( 'finalize' );
		src = JSON.parse( JSON.stringify(src) );
		return src;
	}

})(window.px, window.contApp);