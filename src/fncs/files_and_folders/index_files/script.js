window.px = window.parent.px;

$(window).on('load', function(){
	var pj = px.getCurrentProject();
	var remoteFinder = new RemoteFinder(
		document.getElementById('cont_finder'),
		{
			"gpiBridge": function(input, callback){
				// console.log(input);
				pj.remoteFinder.gpi(input, function(result){
					callback(result);
				});
			},
			"open": function(fileinfo, callback){
				// console.log(fileinfo);
				var realpath = require('path').resolve(pj.get('path'), './'+fileinfo.path);
				var src = px.fs.readFileSync(realpath);
				alert(src);
				callback(true);
			}
		}
	);
	// console.log(remoteFinder);
	remoteFinder.init('/', {}, function(){
		console.log('ready.');
	});
});
