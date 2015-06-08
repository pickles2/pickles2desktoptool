window.contApp.fieldDefinitions.table = _.defaults( new (function( px, contApp ){

	var _resMgr = contApp.contentsSourceData.resourceMgr;
	var _pj = px.getCurrentProject();

	/**
	 * リソースファイルを解析する
	 */
	function parseResource( realpathSelected ){
		var tmpResInfo = {};
		tmpResInfo.realpath = JSON.parse( JSON.stringify( realpathSelected ) );
		tmpResInfo.ext = px.utils.getExtension( tmpResInfo.realpath ).toLowerCase();
		switch( tmpResInfo.ext ){
			case 'csv':                          tmpResInfo.type = 'text/csv';  break;
			case 'doc':                          tmpResInfo.type = 'application/msword';  break;
			case 'xls':                          tmpResInfo.type = 'application/vnd.ms-excel';  break;
			case 'ppt':                          tmpResInfo.type = 'application/vnd.ms-powerpoint';  break;
			case 'docx':                         tmpResInfo.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';  break;
			case 'xlsx':                         tmpResInfo.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';  break;
			case 'pptx':                         tmpResInfo.type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';  break;
			default:
				tmpResInfo.type = 'text/csv'; break;
		}
		return tmpResInfo;
	}

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData, mode ){
		fieldData = fieldData||{};
		var rtn = '';
		var res = _resMgr.getResource( fieldData.resKey );
		// console.log(res);

		// rtn += res.realpath;
		// rtn += _resMgr.getResourceOriginalRealpath( fieldData.resKey );
		var cmd = px.cmd('php') + ' '+px.path.resolve( _pj.get('path') + '/' + _pj.get('entry_script') )+' "/?PX=px2dthelper.convert_table_excel2html&path=' + px.php.urlencode(_resMgr.getResourceOriginalRealpath( fieldData.resKey )) + '"';
		// console.log(cmd);
		var table = px.execSync( cmd );
		// console.log(table);
		rtn += JSON.parse(table);

		if( mode == 'canvas' ){
			if( !rtn.length ){
				rtn += 'ダブルクリックして編集してください。';
			}
		}
		return rtn;
	}

	/**
	 * データを正規化する
	 */
	this.normalizeData = function( fieldData, mode ){
		var rtn = fieldData;
		if( typeof(fieldData) !== typeof({}) ){
			rtn = {
				"resKey":'',
				"path":'about:blank'
			};
		}
		return rtn;
	}

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data ){
		var rtn = $('<div>');
		if( typeof(data) !== typeof({}) ){ data = {}; }
		if( typeof(data.resKey) !== typeof('') ){
			data.resKey = '';
		}
		// if( typeof(data.original) !== typeof({}) ){ data.original = {}; }
		var res = _resMgr.getResource( data.resKey );
		var path = 'data:'+res.type+';base64,' + res.base64;

		var $excel = $('<div>');
		rtn.append( $excel
			.text('')
		);
		rtn.append( $('<input>')
			.attr({
				"name":mod.name ,
				"type":"file",
				"webkitfile":"webkitfile"
			})
			.css({'width':'100%'})
			.bind('change', function(){
				var realpathSelected = $(this).val();
				if( realpathSelected ){
					$excel.html('選択しました');
				}
			})
		);
		return rtn;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( $dom, data ){
		if( typeof(data) !== typeof({}) ){
			data = {};
		}
		if( typeof(data.resKey) !== typeof('') ){
			data.resKey = '';
		}
		if( _resMgr.getResource(data.resKey) === false ){
			data.resKey = _resMgr.addResource();
		}
		
		var realpathSelected = $dom.find('input').val();
		if( realpathSelected ){
			var tmpResInfo = parseResource( realpathSelected );
			_resMgr.updateResource( data.resKey, tmpResInfo );
		}
		// var res = _resMgr.getResource( data.resKey );
		data.realpath = _resMgr.getResourceOriginalRealpath( data.resKey );

		return data;
	}// this.saveEditorContent()

})( window.px, window.contApp ), window.contApp.fieldBase );