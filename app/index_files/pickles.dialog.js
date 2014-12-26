(function(px, $){

	/**
	 * ダイアログを表示する
	 */
	px.dialog = function(opt){
		opt = opt||{};
		opt.title = opt.title||'command:';
		opt.body = opt.body||$('<div>');
		opt.buttons = opt.buttons||[
			$('<button>').text('OK').click(function(){
				px.closeDialog();
			})
		];

		var $dialogButtons = $('<div class="dialog-buttons center">').append(opt.buttons);

		$dialog = $('<div>')
			.addClass('contents')
			.css({
				'position':'fixed',
				'left':0, 'top':0,
				'width': $(window).width(),
				'height': $(window).height(),
				'overflow':'hidden',
				'z-index':10000
			})
			.append( $('<div>')
				.css({
					'position':'fixed',
					'left':0, 'top':0,
					'width':'100%', 'height':'100%',
					'overflow':'hidden',
					'background':'#333',
					'opacity':0.3
				})
			)
			.append( $('<div>')
				.css({
					'position':'absolute',
					'left':0, 'top':0,
					'padding-top':'4em',
					'overflow':'auto',
					'width':"100%",
					'height':"100%"
				})
				.append( $('<div>')
					.addClass('dialog_box')
					.css({
						'width':'80%',
						'margin':'3em auto'
					})
					.append( $('<h1>')
						.text(opt.title)
					)
					.append( $('<div>')
						.append(opt.body)
					)
					.append( $dialogButtons )
				)
			)
		;

		$('body')
			.append($dialog)
		;
		$('body .theme_wrap')
			.addClass('filter')
			.addClass('filter-blur')
		;
		return $dialog;
	}//dialog()

	/**
	 * ダイアログを閉じる
	 */
	px.closeDialog = function(){
		$dialog.remove();
		$('body .theme_wrap')
			.removeClass('filter-blur')
		;
		return $dialog;
	}//closeDialog()

	/**
	 * ダイアログ上でコマンドを流す
	 */
	px.execDialog = function(cmd, opt){
		var $dialog;
		var output = '';
		var dlgOpt = {};

		opt = opt||{};
		opt.title = opt.title||'command:';
		opt.description = opt.description||'';
		opt.complete = opt.complete||function(){};

		var $pre = $('<pre>')
			.css({
				'height':'12em',
				'overflow':'auto'
			})
			.addClass('selectable')
			.text('実行中...')
		;

		dlgOpt = {};
		dlgOpt.title = opt.title;
		dlgOpt.body = $('<div>')
			.append(opt.description)
			.append( $pre )
		;
		dlgOpt.buttons = [
			$('<button>')
				.text('OK')
				.click(function(){
					opt.complete( output );
					px.closeDialog();
					// $dialog.remove();
				})
		];

		$dialog = px.dialog( dlgOpt );

		output = '';
		px.utils.exec(
			cmd,
			function(error, stdout, stderr){
				output = stdout;
				$pre.text(stdout);
				dlgOpt.buttons[0].removeAttr('disabled');
			} ,
			{
				cd: opt.cd
			}
		);
		return this;
	}//execDialog()

	/**
	 * ダイアログ上でコマンドを流す(spawn)
	 */
	px.spawnDialog = function(cmd, cliOpts, opt){
		var $dialog;
		var stdout = '';

		cmd = px.cmd(cmd);
		opt = opt||{};
		opt.title = opt.title||'command:';
		opt.description = opt.description||$('<div>');
		opt.success = opt.success||function(){};
		opt.error = opt.error||function(){};
		opt.cmdComplete = opt.cmdComplete||function(){};
		opt.complete = opt.complete||function(){};

		var $pre = $('<pre>')
			.css({
				'height':'12em',
				'overflow':'auto'
			})
			.addClass('selectable')
			.text('実行中...')
		;

		var dlgOpt = {};
		dlgOpt.title = opt.title;
		dlgOpt.body = $('<div>')
			.append( opt.description )
			.append( $pre )
		;
		dlgOpt.buttons = [
			$('<button>')
				.text('OK')
				.click(function(){
					opt.complete(stdout);
					px.closeDialog();
					// $dialog.remove();
				})
				.attr({'disabled':'disabled'})
		];

		$dialog = this.dialog( dlgOpt );

		stdout = '';
		this.utils.spawn(
			cmd,
			cliOpts,
			{
				cd: opt.cd,
				success: function(data){
					stdout += data;
					$pre.text(stdout);
					opt.success(data);
				} ,
				error: function(data){
					opt.error(data);
				} ,
				complete: function(code){
					opt.cmdComplete(code);
					dlgOpt.buttons[0].removeAttr('disabled');
				}
			}
		);
		return this;
	}//spawnDialog()


})(px, jQuery);