/**
 * wasabi.js
 */
module.exports = function(app, px, pj){
	var _this = this;
	var realpath_comment_file;
	var pageInfo;
	var $wasabiView;
	var wasabiProjectMembers;
	var wasabiPermissions;
	var wasabiPageStatusInfo;
	var wasabiUserInfo;

	/**
	 * 初期化
	 */
	this.init = function( _pageInfo, _$wasabiView ){
		pageInfo = _pageInfo;
		$wasabiView = _$wasabiView;

		if( !pj.wasabiPjAgent.hasWasabi() ){
			$wasabiView.hide();
			return;
		}
		$wasabiView.show();

		var appKey = '';
		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.getAppKey(function(result){
					appKey = result;
					// console.log(appKey);
					// console.log(pageInfo);
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.getUserInfo(function(result){
					console.info('WASABI UserInfo:', result);
					wasabiUserInfo = result;
					if( !wasabiUserInfo ){
						_this.refresh();
						return;
					}
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.callWasabiProjectApi('permissions', {}, {}, function(result){
					console.info('WASABI Project Permissions:', result);
					wasabiPermissions = result;
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				$wasabiView
					.html('...')
					.off('dblclick')
					.on('dblclick', function(){
						_this.edit();
						return false;
					})
				;

				setTimeout(function(){
					rlv();
				}, 10);

				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				pj.wasabiPjAgent.callWasabiProjectApi('members', {}, {}, function(result){
					console.info('WASABI Project Members:', result);
					wasabiProjectMembers = result.members;
					rlv();
				});

				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				_this.refresh();
				rlv();
				return;
			}); })
		;


		return;
	}

	/**
	 * コメントを編集する
	 * @return {[type]} [description]
	 */
	this.edit = function(){
		var $body = $('<div>');
		$body.append('<div>Assignee: <select name="cont-wasabi-assignee-selector"></select></div>');
		$body.append('<div>Status: <select name="cont-wasabi-status-selector"></select></div>');

		px.dialog({
			'title': '状態を編集',
			'body': $body,
			'buttons':[
				$('<button>')
					.text(px.lb.get('ui_label.cancel'))
					.on('click', function(){
						px.closeDialog();
					}),
				$('<button>')
					.text('OK')
					.addClass('px2-btn--primary')
					.on('click', function(){

						var assigneeId = $body.find('select[name=cont-wasabi-assignee-selector]').val();
						var status = $body.find('select[name=cont-wasabi-status-selector]').val();
						pj.wasabiPjAgent.callWasabiProjectApi('app/Pickles2/update_page', {
							"title": pageInfo.title,
							"status": status,
							"assignee_id": assigneeId,
							"path": pageInfo.path
						}, {
							'method': 'post'
						}, function(result){
							console.info('WASABI App Pickles 2 update_page:', result);
							if( !result.result ){
								alert('ERROR: '+result.error_message);
							}

							_this.refresh(function(){
								// pj.updateGitStatus();
								px.closeDialog();
							});
						});

					})
			]
		});

		var $select = $body.find('select[name=cont-wasabi-assignee-selector]');
		$select.append( $('<option>').attr({'value': ""}).text("(Unassigned)") );
		for(var idx in wasabiProjectMembers){
			$select
				.append( $('<option>')
					.attr({
						'value': wasabiProjectMembers[idx].user_id,
						'selected': (wasabiPageStatusInfo.assignee_id == wasabiProjectMembers[idx].user_id ? true : false)
					})
					.text(wasabiProjectMembers[idx].name)
				);
		}

		var $status = $body.find('select[name=cont-wasabi-status-selector]');
		$status
			.append( $('<option>').attr({'value': 'opened', 'selected': (wasabiPageStatusInfo.status == 'opened' ? true : false)}).text('Open') )
			.append( $('<option>').attr({'value': 'inprogress', 'selected': (wasabiPageStatusInfo.status == 'inprogress' ? true : false)}).text('In Progress') )
			.append( $('<option>').attr({'value': 'resolved', 'selected': (wasabiPageStatusInfo.status == 'resolved' ? true : false)}).text('Resolved') )
			.append( $('<option>').attr({'value': 'closed', 'selected': (wasabiPageStatusInfo.status == 'closed' ? true : false)}).text('Closed') )
		;

		return;
	}

	/**
	 * コメント表示欄を更新する
	 * @return {[type]} [description]
	 */
	this.refresh = function(callback){
		callback = callback || function(){};

		if( !pj.wasabiPjAgent.hasWasabi() ){
			$wasabiView.hide();
			callback(false);
			return;
		}

		$wasabiView.show();
		$wasabiView.text('状態を更新しています...');

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				if( !wasabiUserInfo ){
					$wasabiView.html('').append('<div>WASABI認証に失敗しました。</div>');
					return;
				}
				rlv();
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.callWasabiProjectApi('app/Pickles2/page', {
					"path": pageInfo.path
				}, {}, function(result){
					console.info('WASABI App Pickles 2 page:', result);
					wasabiPageStatusInfo = result;
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				var $canvas = $('<div>');
				$canvas.append( '<div>Assignee: <span class="cont-wasabi-assignee"></span></div>' );
				$canvas.append( '<div>Status: <span class="cont-wasabi-status"></span></div>' );

				$wasabiView.html('').append($canvas);
				$wasabiView.find('.cont-wasabi-assignee').text( wasabiPageStatusInfo.assignee.name );
				$wasabiView.find('.cont-wasabi-status').text( wasabiPageStatusInfo.status );

				rlv();
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				callback(true);
				rlv();
				return;
			}); })
		;

		return;
	}

	return;
}
