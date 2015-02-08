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
			.html(function(d, i){
				var rtn = '';
				var label = (d.info&&d.info.name ? d.info.name : d.id);
				var thumb = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAMAAAD8CC+4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0JCQUEyRjlBN0FDMTFFNDhFQjFEMkY0RDcxNTg1Q0MiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0JCQUEyRkFBN0FDMTFFNDhFQjFEMkY0RDcxNTg1Q0MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3QkJBQTJGN0E3QUMxMUU0OEVCMUQyRjRENzE1ODVDQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3QkJBQTJGOEE3QUMxMUU0OEVCMUQyRjRENzE1ODVDQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnWMPX0AAAAzUExURZmZmVNTU21tbYSEhGFhYZSUlExMTDw8PHl5eYqKio+Pj0RERHNzc2dnZ39/f1paWjMzMxdXiHgAAAd2SURBVHja7NzZlppKAEBR5lE0//+1ARyagsK0MZ0Ye5+newlKLzYFKGDyQ9+uxCqALuiCLuiCLuiCLuiCLuiCLuiCLuiCLuiCDl3QBV3QBV3QBV3QBV3QBV3QBV3QBV3QBR26oAu6oAu6oAu6oAu6oAu6oAu6oAu6oAs6dEEXdEEXdEEXdEEXdEEXdEEXdEEXdEEXdOiCLuiCLuiCLuiCLuiCLuiCLuiCLuiCLujQrQLogi7ogi7ogi7ogi7ogi7ogi7ogi7ogi7o0AVd0AVd0AVd0AVd0AVd0AVd0AVd0AVd0KELuqALuqALuqALuqALuqALuqALuqALuqBDF3RBF3RBF3RBF3RBF3RBF3RBF3RBF3RBhy7ogi7ogi7ogi7ogi7ogi7ogi7ogi7ogg7dKoAu6IIu6IIu6IIu6IIu6IIu6IIu6IIu6IIOXdAFXdAFXdAFXdAFXdAFXdAFXdAFXdAFHbqgC7qgC7qgC7qgC7qgC7qgC7qgC7qgCzr0b16fpmn90Cuq8RXQ/+uyJEkeM8zHV0CHDh06dOjQoUOHDh06dOjQoUOHDh06dOjQoUOH/qLV6Sk7VetpQ1akd180ZNlw92ppdcrG96j/MHpaZFmW9tB/oyLP88t/JHPl4QZYF+1lWhNfufVwmSFJ2iHu3h+66xzFFn1aerXZSMaJxX30tCmDd4X+8O52WtE3vZH4dFmz3WJaZN3WWZksKrPILIflHF26Ro+O+3ScmN1D7/P1u0J/bKTPq7Sa+Noma872xfVfkvaQNd3HtGBAzvOW+biXvbys7aOzJPkhy/Ly/CZ/AL0oL39Z8OdC/3zTGp7Nj2exdFrHZXU2bxbTktMKdFr13XV9901yed16lrK47PfnY0XxPPq8MWaX7as/Jg+fJECf1vA0ID9Gy8SXT2BlGkwr6w3oYbMRLOeppynHOjiUlM2z6KfVxlVs/jTon0HPwz3kNCKnwV2tTqGXx+y62+xW63beWsLXNJtjyZPofbneoRSbxUD/BHroOU8aTYdgYE/jafH/h9U4v431U4CRr2Y5PI1+3L5imtRDfxS9C6e1kWnTqv8YYP12hrEhmDpuN+XGonsSPY1sbP16q4X+GfRi+zFuPa0I1mwTP2fuFkO9iFIUT6I3sVHdxrZA6L9Aj01bnRtN+/fj7fCdxFdzsZipje506+fQ6+jxe3jd/fsLn8hFZDamy/km3CH2DV15A6qXG8nqMPH76MX2o+PlBSfoj6Fn94CXB/q7O9nwNKvY+dLk8BR6s90FXTawDPoXoC/XfRueyoc72uGGW0XmeO7LmXHBbWzVvuyHtjdCj/376t32Log+hz4dd7Jtu38P9D+G3kc+N33saPN7Y/I59DrZDfoXo6f7x9DbK/ccnkJPoX9P9CaNVkF/Y/RX/e7tO6DHj+n97Tz6y9AP0F/27H3vU93TZ+859H+DXt77nF7cZq+/5CMb9H+Dnu9887K4yrl312t4aXSIfW93B31vU4L+9ejZzgnV4kv7087htwvQo0sf9tGz174j7q3Rq53dbPYhvXMhrgqvslWxyzLHffRq5zIO9K9Hn6++bEfcfJGtX9BtZ2lW9zEm27ODOrlzPb174btk3h09fjfiYTkO09hQ71e3S83vetruLnbRi//s/P2d0Oehvt7PTofxxTDMI+/cJmWIPmwWVSX30OehPkD/J+gzTXg5c74vcljNUqx37kWIXq/vqB/fJW/voKfJf3Uu91bo8xANbmofNpvBvJ9ebAX1cbrytvool4W3sZ/K8f/ye/e9D8n2L67d9/5X0M+nZLfHV84PwTSRs7b8dqdkOd8eu0Kfb6C/PrByyudhfBf9/K5d8eF8al536L8Z+vXJhelZtmOZJLH3Od/mPj/uNm8UXTW/97A5Koy7gDzPr09K5sH5wu6Cm+n+iWObeNjh76H/qPLwinbkO7pTt5yjqc9nYuHylg/MJm11XlT+wIKhP9rqYfDLes7zzbdph+uD7Mst5vaYeNnsPER4fcT99oz7Ybu84rppXP7lECw+tuCqWTwlnQ+v+8n9PX9+ZPqZic3vV4RnWemQDb/4yYhq/lmJh07HqnTauxcv/lsUfnPmGwYduqALuqALuqALuqALuqALuqALuqALuqALOnRBF3RBF3RBF3RBF3RBF3RBF3RBF3RBF3Togi7ogi7ogi7ogi7ogi7ogi7ogi7ogi7o0AVd0AVd0AVd0AVd0AVd0AVd0AVd0AVd0KELuqALuqALuqALuqALuqALuqALuqALuqALOnRBF3RBF3RBF3RBF3RBF3RBF3RBF3RBF3Togi7ogi7ogi7ogi7ogi7ogi7ogi7ogi7o0AVd0AVd0AVd0AVd0AVd0AVd0AVd0AVd0KELuqALuqALuqALuqALuqALuqALuqALuqBDF3RBF3RBF3RBF3RBF3RBF3RBF3RBF3RBF3Togi7ogi7ogi7ogi7ogi7ogi7ogi7ogi7o0AVd0AVd0AVd0AVd0AVd0AVd0AVd0AVd0KELuqALuqALuqALuqALuqALuqALuqALuqB/534KMACV/oXoP5NejQAAAABJRU5ErkJggg==';
				if(d.thumb){
					thumb = d.thumb;
				}
				rtn += '<img src="'+px.php.htmlspecialchars( thumb )+'" alt="'+px.php.htmlspecialchars( label )+'" style="max-height:100%; max-width:100%; margin-right:5px;" />'
				rtn += label
				return rtn;
			})
			.style({
				'padding':0,
				'border':0,
				'height':'50px',
				'text-align':'left',
				'color':'inherit'
			})
			.attr({
				'title': function(d, i){ return (d.info&&d.info.name ? d.info.name + ' - ' : '')+d.id; },
				'data-id': function(d, i){ return d.id },
				'draggable': true //←HTML5のAPI http://www.htmq.com/dnd/
			})
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
				var callback = cb;
				_this.onPreviewLoad( callback );
			})
		;

		// cb();
		return;
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
	this.onPreviewLoad = function( cb ){
		cb = cb || function(){};

		// alert('onPreviewLoad');
		if( !$preview || !$preview[0] || !$preview[0].contentWindow ){
			cb();
			return;
		}

		$previewDoc = $($preview[0].contentWindow.document);

		this.resizeEvent( cb );
		return;
	}

	/**
	 * コンテンツデータに対応するUIのひな形
	 */
	function classUiUnit( instancePath, data ){
		instancePath = instancePath.replace( new RegExp('^\\/*'), '/' );
		this.instancePath = instancePath;
		this.moduleTemplates = contApp.moduleTemplates.get( data.modId, data.subModName );
		if( this.moduleTemplates === false ){
			this.moduleTemplates = contApp.moduleTemplates.get( '_sys/unknown' );
		}
		this.fieldList = _.keys( this.moduleTemplates.fields );

		this.fields = {};
		for( var idx in this.fieldList ){
			var fieldName = this.fieldList[idx];
			if( this.moduleTemplates.fields[fieldName].fieldType == 'input' ){
				this.fields[fieldName] = data.fields[fieldName];
			}else if( this.moduleTemplates.fields[fieldName].fieldType == 'module' ){
				this.fields[fieldName] = [];
				for( var idx2 in data.fields[fieldName] ){
					this.fields[fieldName][idx2] = new classUiUnit(
						instancePath+'/fields.'+fieldName+'@'+idx2,
						data.fields[fieldName][idx2]
					);
				}
			}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop' ){
				this.fields[fieldName] = [];
				for( var idx2 in data.fields[fieldName] ){
					this.fields[fieldName][idx2] = new classUiUnit(
						instancePath+'/fields.'+fieldName+'@'+idx2,
						data.fields[fieldName][idx2]
					);
				}
			}
		}

		/**
		 * UI/出力時のHTMLコードを生成する
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
					if( contApp.fieldDefinitions[this.moduleTemplates.fields[fieldName].type] ){
						fieldData[fieldName] = contApp.fieldDefinitions[this.moduleTemplates.fields[fieldName].type].normalizeData( this.fields[fieldName], mode );
					}else{
						fieldData[fieldName] = contApp.fieldBase.normalizeData( this.fields[fieldName], mode );
					}
				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'module' ){
					fieldData[fieldName] = (function( fieldData, mode, opt ){
						var rtn = [];
						for( var idx2 in fieldData ){
							rtn[idx2] = fieldData[idx2].bind( mode );
						}
						if( mode == 'canvas' ){
							var instancePathNext = opt.instancePath+'/fields.'+opt.fieldName+'@'+( fieldData.length );
							rtn.push( $('<div>')
								.attr( "data-guieditor-cont-data-path", instancePathNext )
								.append( $('<div>')
									.text(
										// instancePathNext +
										'ここに新しいモジュールをドラッグしてください。'
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
						return rtn;
					})( this.fields[fieldName], mode, {
						"instancePath": this.instancePath ,
						"fieldName": fieldName
					} );
				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop' ){
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
									'ここをダブルクリックして配列要素を追加してください。'
								)
								.css({
									'overflow':'hidden',
									"padding": '5px 15px',
									"background-color":"#dfe",
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
				}
			}// for

			var tmpSrc = this.moduleTemplates.bind( fieldData, mode );
			var rtn = $('<div>');

			var isRootElement = this.moduleTemplates.isRootElement;

			if( mode == 'finalize' ){
				rtn = $('<div>');
				rtn.append( tmpSrc );
				rtn = rtn.get(0).innerHTML;
			}else{
				rtn = $('<div>');
				rtn.append( tmpSrc );
				if( isRootElement ){
					// 要素が1つだったら、追加した<div>ではなくて、
					// 最初の要素にマークする。
					// li要素とか、display:blockではない場合にレイアウトを壊さない目的。
					// 要素が複数の場合、または存在しないテキストノードのみの場合、
					// 要素がテキストノードで囲われている場合、なども考えられる。
					// これらの場合は、divで囲ってあげないとハンドルできないので、しかたなし。
					rtn = $(tmpSrc);
				}
				rtn
					.attr("data-guieditor-cont-data-path", this.instancePath)
					.css({
						'margin-top':5,
						'margin-bottom':5
					})
				;
				rtn = rtn.get(0).outerHTML;
			}
			return rtn;
		} // this.bind();

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
					'width': $elm.outerWidth(),
					'height': $elm.outerHeight()
				})
				.width($elm.outerWidth())
				.height($elm.outerHeight())
				.offset($elm.offset())
				.attr({
					'data-guieditor-cont-data-path': this.instancePath ,
					'data-guieditor-sub-mod-name': this.moduleTemplates.subModName
				})
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
					var subModName = $(this).attr('data-guieditor-sub-mod-name');
					if( typeof(subModName) === typeof('') && subModName.length ){
						event.dataTransfer.setData("data-guieditor-sub-mod-name", subModName );
					}
				})
				.bind('drop', function(){
					var method = event.dataTransfer.getData("method");
					var modId = event.dataTransfer.getData("modId");
					var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
					var moveTo = $(this).attr('data-guieditor-cont-data-path');
					var subModNameTo = $(this).attr('data-guieditor-sub-mod-name');
					var subModNameFrom = event.dataTransfer.getData('data-guieditor-sub-mod-name');

					// px.message( 'modId "'+modId+'" が "'+method+'" のためにドロップされました。' );
					if( method == 'add' ){
						if( typeof(subModNameTo) === typeof('') ){
							px.message('ここにモジュールを追加することはできません。');
							return;
						}
						contApp.contentsSourceData.addInstance( modId, moveTo, function(){
							// px.message('インスタンスを追加しました。');
							contApp.ui.onEditEnd();
						} );
					}else if( method == 'moveTo' ){
						function isSubMod( subModName ){
							if( typeof(subModName) === typeof('') && subModName.length ){
								return true;
							}
							return false;
						}
						function removeNum(str){
							return str.replace(new RegExp('[0-9]+$'),'');
						}
						if( (isSubMod(subModNameFrom) || isSubMod(subModNameTo)) && removeNum(moveFrom) !== removeNum(moveTo) ){
							px.message('並べ替え以外の移動操作はできません。');
							return;
						}
						contApp.contentsSourceData.moveInstanceTo( moveFrom, moveTo, function(){
							// px.message('インスタンスを移動しました。');
							contApp.ui.onEditEnd();
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
			if( !this.instancePath.match(new RegExp('^\\/bowl\\.[a-zA-Z0-9\_\-]+$')) ){
				// ルートインスタンスは編集できないようにする。
				$ctrlPanel.append( $ctrlElm );
			}


			for( var idx in this.fieldList ){
				var fieldName = this.fieldList[idx];
				if( this.moduleTemplates.fields[fieldName].fieldType == 'input'){
				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'module'){
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
									contApp.ui.onEditEnd();
								} );
								return;
							}
							if( method !== 'add' ){
								px.message('追加するモジュールをドロップしてください。ここに移動することはできません。');
								return;
							}
							var modId = event.dataTransfer.getData("modId");
							contApp.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
								// px.message('インスタンスを追加しました。');
								contApp.ui.onEditEnd();
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
							// 特に処理なし
						})
						.bind('dblclick', function(e){
							px.message( 'ここに追加したいモジュールをドロップしてください。' );
							e.preventDefault();
						})
					;
					$ctrlPanel.append( $ctrlElm );

				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop'){
					for( var idx2 in this.fields[fieldName] ){
						this.fields[fieldName][idx2].drawCtrlPanels( $content );
					}

					var instancePath = this.instancePath+'/fields.'+fieldName+'@'+(this.fields[fieldName].length);
					var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(instancePath)+']');
					// if( !$elm.size() ){
					// 	// memo: loopの下層にあるmarkdownに値が入ってない場合に 0 になった。
					// 	console.log('unmatched content element.');
					// 	console.log(JSON.stringify(instancePath));
					// }
					var $ctrlElm = $('<div>')
						.css({
							'border':0,
							'font-size':'11px',
							'overflow':'hidden',
							'text-align':'center',
							'background-color': 'transparent',
							'display':'block',
							'position':'absolute',
							'top':  (function($elm){if($elm.size()){return $elm.offset().top  + 5;}return 0;})($elm),
							'left': (function($elm){if($elm.size()){return $elm.offset().left + 0;}return 0;})($elm),
							'z-index':0,
							'width': $elm.width(),
							'height': $elm.height()
						})
						.attr({
							'data-guieditor-mod-id': this.moduleTemplates.id,
							'data-guieditor-sub-mod-name': fieldName,
							'data-guieditor-cont-data-path': instancePath
						})
						.bind('mouseover', function(e){
							$(this).css({
								"border-radius":5,
								"border":"2px solid #666"
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
								// これはloop要素を並べ替えるための moveTo です。
								// その他のインスタンスをここに移動したり、作成することはできません。
								var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
								var moveTo = $(this).attr('data-guieditor-cont-data-path');
								function removeNum(str){
									return str.replace(new RegExp('[0-9]+$'),'');
								}
								if( removeNum(moveFrom) !== removeNum(moveTo) ){
									px.message('並べ替え以外の移動操作はできません。');
									return;
								}

								contApp.contentsSourceData.moveInstanceTo( moveFrom, moveTo, function(){
									// px.message('インスタンスを移動しました。');
									contApp.ui.onEditEnd();
								} );
								return;
							}
							px.message('ダブルクリックしてください。ドロップできません。');
							return;
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
							// 特に処理なし
						})
						.bind('dblclick', function(e){
							var modId = $(this).attr("data-guieditor-mod-id");
							var subModName = $(this).attr("data-guieditor-sub-mod-name");
							contApp.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
								contApp.ui.onEditEnd();
							}, subModName );
							e.preventDefault();
						})
					;
					$ctrlPanel.append( $ctrlElm );
				}
			} // for
		} // this.drawCtrlPanels()

	} // function classUiUnit()

	/**
	 * 編集操作終了イベント
	 */
	this.onEditEnd = function( cb ){
		cb = cb||function(){};
		contApp.save();
		this.resizeEvent();
		cb();
		return;
	}

	/**
	 * モジュールの編集ウィンドウを開く
	 */
	this.openEditWindow = function( instancePath ){
		// px.message( '開発中: このモジュールを選択して、編集できるようになる予定です。' );
		// px.message( instancePath );
		var data = contApp.contentsSourceData.get( instancePath );
		var modTpl = contApp.moduleTemplates.get( data.modId, data.subModName );

		if( $editWindow ){ $editWindow.remove(); }
		$editWindow = $('<div>')
			.append( $('#cont_tpl_module_editor').html() )
		;
		$editWindow.find('form')
			.attr({
				'action': 'javascript:;',
				'data-guieditor-cont-data-path':instancePath
			})
			.submit(function(){
				for( var idx in modTpl.fields ){
					var field = modTpl.fields[idx];
					if( field.fieldType == 'input' ){
						if( contApp.fieldDefinitions[field.type] ){
							data.fields[field.name] = contApp.fieldDefinitions[field.type].saveEditorContent( $editWindow.find('form [data-field-unit='+JSON.stringify( modTpl.fields[idx].name )+']'), data.fields[field.name] );
						}else{
							data.fields[field.name] = contApp.fieldBase.saveEditorContent( $editWindow.find('form [data-field-unit='+JSON.stringify( modTpl.fields[idx].name )+']'), data.fields[field.name] );
						}
					}else if( field.fieldType == 'module' ){
						// module: 特に処理なし
					}else if( field.fieldType == 'loop' ){
						// loop: 特に処理なし
					}
				}
				$editWindow.remove();
				px.closeDialog();
				contApp.ui.onEditEnd();
				return false;
			})
		;
		$editWindow.find('form .cont_tpl_module_editor-cancel')
			.click(function(){
				$editWindow.remove();
				px.closeDialog();
				return false;
			})
		;
		$editWindow.find('form .cont_tpl_module_editor-remove')
			.attr({'data-guieditor-cont-data-path':instancePath})
			.click(function(){
				contApp.contentsSourceData.removeInstance( $(this).attr('data-guieditor-cont-data-path') );
				delete data;
				$editWindow.remove();
				px.closeDialog();
				contApp.ui.onEditEnd();
				return false;
			})
		;

		function mkEditFieldLabel(field){
			var rtn = '';
			var name = field.name;
			if( field.label ){
				name = field.label;
			}
			switch( field.fieldType ){
				case 'input':
					rtn = name+' <span class="small"> - '+field.type+'</small>';
					break;
				default:
					rtn = name+' <span class="small"> - '+field.fieldType+'</span>';
					break;
			}
			return rtn;
		}

		for( var idx in modTpl.fields ){
			var field = modTpl.fields[idx];
			if( field.fieldType == 'input' ){
				$editWindow.find('div.cont_tpl_module_editor-canvas')
					.append($('<div>')
						.attr( 'data-field-unit', modTpl.fields[idx].name )
						.append($('<h2>')
							.html( mkEditFieldLabel( modTpl.fields[idx] ) )
						)
						.append( ((function( field, mod, data ){
							if( contApp.fieldDefinitions[field.type] ){
								return contApp.fieldDefinitions[field.type].mkEditor( mod, data );
							}
							return $('<div>')
								.append( $('<textarea>')
									.attr({"name":mod.name})
									.val(data)
									.css({'width':'100%','height':'6em'})
								)
							;
						})( field, modTpl.fields[idx], data.fields[modTpl.fields[idx].name] ) ) )
					)
				;
			}else if( field.fieldType == 'module' ){
				$editWindow.find('div.cont_tpl_module_editor-canvas')
					.append($('<div>')
						.attr( 'data-field-unit', modTpl.fields[idx].name )
						.append($('<h2>')
							// .text(field.fieldType+' ('+modTpl.fields[idx].name+')')
							.html( mkEditFieldLabel( modTpl.fields[idx] ) )
						)
						.append($('<p>')
							.text('ネストされたモジュールがあります。')
						)
					)
				;
			}else if( field.fieldType == 'loop' ){
				$editWindow.find('div.cont_tpl_module_editor-canvas')
					.append($('<div>')
						.append($('<h2>')
							// .text(field.fieldType+' ('+modTpl.fields[idx].name+')')
							.html( mkEditFieldLabel( modTpl.fields[idx] ) )
						)
						.append($('<p>')
							.text('ネストされたサブモジュールがあります。')
						)
					)
				;

			}
		}

		px.dialog({
			"title": "編集" ,
			"body": $editWindow ,
			"buttons":[]
		});

		// DOMに配置後にコールバックを呼ぶ
		// UI系のライブラリを使う場合に不都合がある場合があるので追加した機能。
		for( var idx in modTpl.fields ){
			var field = modTpl.fields[idx];
			if( field.fieldType == 'input' ){
				if( contApp.fieldDefinitions[field.type] ){
					return contApp.fieldDefinitions[field.type].onEditorUiDrawn( field, data.fields[modTpl.fields[idx].name] );
				}
			}
		}

		return this;
	}// openEditWindow()

	/**
	 * ウィンドウ リサイズ イベント ハンドラ
	 */
	this.resizeEvent = function( cb ){
		cb = cb || function(){};

		$('.cont_field')
			.css({
				'height':$(window).height() - 5
			})
		;

		$palette
			.css({
				'height':$(window).height() - $('.cont_btns').outerHeight() - 10
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

		// setTimeout(function(){
			// 高さ合わせ処理のタイミングがずれることがあったので、
			// 根本的な解決にはなってないが、一旦 setTimeout() で逃げといた。
			// 初期化の処理を見なおしたら解決したので、setTimeout() ははずした。
			// UTODO: 画像が含まれている & レスポンシブの場合(？)に、ずれる現象はまだ起きている。
			//        仮説：ctrlPanelを配置したあとでスクロールバーがでて、画像の幅が変わる(→同時に高さも変わる)ことが原因？
			//        しかし、画像が含まれない場合にも起こる場合がある。ブレークポイントをまたぐと起きる、とか？
			var fieldheight = $previewDoc.find('body').height();
			$preview.height( fieldheight );
			$ctrlPanel.height( fieldheight );
			if( $editWindow ){
				$editWindow.height( fieldheight );
			}
			cb();
		// }, 200);

		return;
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