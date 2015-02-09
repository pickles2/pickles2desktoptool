/**
 * px.prject.site
 */
module.exports.site = function( px, pj, callbackOnStandby ) {

	var _this = this;
	var _sitemap = null;
	var _sitemap_id_map = null;

	this.getPageInfo = function( pagePath ){
		var _config = pj.getConfig();
		if( pagePath.match(new RegExp('\\/$')) && _config.directory_index && _config.directory_index.length ){
			pagePath += _config.directory_index[0];
		}
		if( _sitemap && _sitemap[pagePath] ){
			return _sitemap[pagePath];
		}
		if( _sitemap_id_map && _sitemap_id_map[pagePath] ){
			return _sitemap_id_map[pagePath];
		}
		return null;
	}
	this.getSitemap = function(){
		return _sitemap;
	}

	this.updateSitemap = function( cb ){
		var sitemap_data_memo = '';
		pj.execPx2( '/?PX=api.get.sitemap', {
			cd: pj.get('path') ,
			success: function( data ){
				sitemap_data_memo += data;
			} ,
			complete: function(code){
				_sitemap = JSON.parse(sitemap_data_memo);
				cb( _sitemap );
			}
		} );
		return this;
	}

	px.utils.iterateFnc([
		function(it, arg){
			_this.updateSitemap( function(code){
				it.next(arg);
			} );
		} ,
		function(it, arg){
			_sitemap_id_map = {};
			for( var i in _sitemap ){
				_sitemap_id_map[_sitemap[i].id] = _sitemap[i];
			}
			it.next(arg);
			// itPj.next(arg);
		} ,
		function(it, arg){
			callbackOnStandby();
		}
	]).start({});

	return this;

};