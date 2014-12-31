(function(){
	window.px = window.parent.px;
	$(window).load( function(){
		px.utils.iterate(
			[
				{"title":"Pickles 2 Desktop Tool version", "val": px.getVersion()},
				{"title":"PHP version", "cmd": px.cmd('php') + ' -v'},
				{"title":"PHP path", "cmd": 'which php'},
				{"title":"composer version", "cmd": px.cmd('php') + ' ' + px.cmd('composer') + ' --version'},
				{"title":"node version", "cmd": 'node -v'},
				{"title":"git version", "cmd": 'git --version'},
				{"title":"User name", "cmd": 'whoami'},
				{"title":"preview URL", "val": px.preview.getUrl()},
				{"title":"Current directory", "cmd": 'pwd'}
			],
			function(it, data, idx){
				if( data.cmd ){
					window.px.utils.exec(data.cmd,
						function(err,stdout,stderr){
							$('.cont_tpl_sys_table').append($('<tr>')
								.append($('<th>').text(data.title))
								.append($('<td>')
									.text(stdout)
									.css({"overflow":"auto","white-space":"pre"})
								)
							);
							it.next();
						}
					);

				}else if( data.val ){
					$('.cont_tpl_sys_table').append($('<tr>')
						.append($('<th>').text(data.title))
						.append($('<td>')
							.text(data.val)
							.css({"overflow":"auto","white-space":"pre"})
						)
					);
					it.next();

				}else{
					it.next();

				}
			}
		);

	} );

})();
