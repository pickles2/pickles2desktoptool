window.contApp.ui = new(function(px, contApp){
	var $preview;
	var $ctrlPanel;
	var $palette;

	/**
	 * フィールド初期化
	 */
	this.initField = function( cb ){
		$preview = $('iframe.cont_field-preview');
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
		$ctrlPanel
			.html('')
			.bind('drop', function(e){
				var modId = event.dataTransfer.getData("moduleId");
				px.message( 'modId "'+modId+'" がドロップされました。' );
			})
			.bind('dragover', function(e){
				event.preventDefault();
				// px.message(456);
			})
			.bind('click', function(e){
				px.message('TEST: Clicked');
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

		var $iframe = $($('iframe.cont_field-preview')[0].contentWindow.document);
		var fieldheight = $iframe.find('body').height()+20;
		$('iframe.cont_field-preview').height( fieldheight );
		$('.cont_field-ctrlpanel').height( fieldheight );
	}


})(window.px, window.contApp);