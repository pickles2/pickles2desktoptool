window.px = window.parent.px;

window.cont_clearcache = function(btn){
	$(btn).attr('disabled', 'disabled');
	var pj = px.getCurrentProject();
	$('.cont_console').text('');
	var $msg = $('<div>');

	px.commandQueue.client.addQueueItem(
		[
			'php',
			px.path.resolve(pj.get('path'), pj.get('entry_script')),
			'/?PX=clearcache'
		],
		{
			'cdName': 'default',
			'tags': [
				'pj-'+pj.get('id'),
				'pickles2-clearcache'
			],
			'accept': function(queueId){
				// console.log(queueId);
			},
			'open': function(message){
			},
			'stdout': function(message){
				$('.cont_console').text(
					$('.cont_console').text() + message.data.join('')
				);
			},
			'stderr': function(message){
				$('.cont_console').text(
					$('.cont_console').text() + message.data.join('')
				);
			},
			'close': function(message){
				$(btn).removeAttr('disabled');
				px.message( 'キャッシュをクリアしました。' );
				return;
			}
		}
	);
}
