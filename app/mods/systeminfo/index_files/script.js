(function(){
	window.px = window.parent.px;
	px.utils.iterate(
		[
			{"title":"PHP version", "cmd": px.cmd('php') + ' -v'},
			{"title":"PHP path", "cmd": 'which php'},
			{"title":"composer version", "cmd": px.cmd('php') + ' ' + px.cmd('composer') + ' --version'},
			{"title":"node version", "cmd": 'node -v'},
			{"title":"git version", "cmd": 'git --version'},
			{"title":"User name", "cmd": 'whoami'},
			{"title":"Current directory", "cmd": 'pwd'}
		],
		function(it, data, idx){
			window.px.utils.exec(data.cmd,
				function(err,stdout,stderr){
					$('.tpl_sys_table').append($('<tr>')
						.append($('<th>').text(data.title))
						.append($('<td>')
							.text(stdout)
							.css({"overflow":"auto","white-space":"pre"})
						)
					);
					it.next();
				}
			);
		}
	);

})();
